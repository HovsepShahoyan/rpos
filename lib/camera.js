"use strict";
var utils_1 = require("./utils");
var fs = require("fs");
const { exec } = require('child_process');
const archiver = require('archiver');
const path = require('path');
var parser = require("body-parser");
var v4l2ctl_1 = require("./v4l2ctl");
var utils = utils_1.Utils.utils;
var Camera = (function () {
    function Camera(config, webserver) {

        webserver.get('/api/telemetry', function (req, res) {
            const commandClient = require('./CommandClient');

            const inclinoData = commandClient.getInclinationData();
            const gpsData = commandClient.getGPSVariables();
            const stmdData = commandClient.getSTMDData();
            const movementData = commandClient.getLastConvertedMovements();
            const rangeData = commandClient.getRangeData();

            res.json({
                inclinoData,
                gpsData,
                stmdData,
                movementData,
                rangeData
            });
        });

        webserver.get('/api/downloadScreenshots', function(req, res) {
            const zipPath = '/tmp/screenshots/screenshot.zip';
            // set appropriate headers so browser will download it
            res.download(zipPath, 'screenshots.zip', (err) => {
                if (err) {
                console.error('Download failed:', err);
                res.status(500).send('Could not download screenshots');
                }
            });
        });

        var _this = this;
        this.options = {
            resolutions: [{
                    Width: 640,
                    Height: 480
                },
                {
                    Width: 800,
                    Height: 600
                },
                {
                    Width: 1024,
                    Height: 768
                },
                {
                    Width: 1280,
                    Height: 1024
                },
                {
                    Width: 1280,
                    Height: 720
                },
                {
                    Width: 1640,
                    Height: 1232
                },
                {
                    Width: 1920,
                    Height: 1080
                }
            ],
            framerates: [2, 5, 10, 15, 25, 30],
            bitrates: [
                250,
                500,
                1000,
                2500,
                5000,
                7500,
                10000,
                12500,
                15000,
                17500
            ]
        };
        this.settings = {
            forceGop: true,
            resolution: {
                Width: 1280,
                Height: 720
            },
            framerate: 25,
        };
        this.config = config;
        this.rtspServer = null;
        if (this.config.RTSPServer != 0) {
            if (this.config.CameraType == 'usbcam') {
                if (this.config.RTSPServer != 3) {
                    console.log('Only GStreamer RTSP mode is supported for USB Camera video');
                    process.exit(1);
                }
                if (!fs.existsSync(this.config.CameraDevice)) {
                    console.log("USB Camera is not found at ".concat(this.config.CameraDevice));
                    process.exit(1);
                }
            }
            if (this.config.CameraType == 'filesrc') {
                if (this.config.RTSPServer != 3) {
                    console.log('Only GStreamer RTSP mode is supported for File Source video');
                    process.exit(1);
                }
                if (!fs.existsSync(this.config.CameraDevice)) {
                    console.log("Filesrc file is not found at ".concat(this.config.CameraDevice));
                    process.exit(1);
                }
            }
            if (this.config.CameraType == 'testsrc') {
                if (this.config.RTSPServer != 3) {
                    console.log('Only GStreamer RTSP mode is supported for Test Source video');
                    process.exit(1);
                }
            }
            if (this.config.CameraType == 'picam') {
                if (!fs.existsSync("/dev/video0")) {
                    if (utils.isPi()) {
                        console.log('Use modprobe to load the Pi Camera V4L2 driver');
                        console.log('e.g.   sudo modprobe bcm2835-v4l2');
                        console.log('       or the uv4l driver');
                        process.exit(1);
                    }
                }
            }
        }
        this.webserver = webserver;
        this.setupWebserver();
        this.setupCamera();
        v4l2ctl_1.v4l2ctl.ReadControls();
        utils.cleanup(function () {
            _this.stopRtsp();
            var stop = new Date().getTime() + 2000;
            while (new Date().getTime() < stop) {
                ;
            }
        });
        if (this.config.RTSPServer == 1)
            fs.chmodSync("./bin/rtspServer", "0755");
    }
    Camera.prototype.setupWebserver = function () {
        var _this = this;
        utils.log.info("Starting camera settings webserver on http://%s:%s/", utils.getIpAddress(), this.config.ServicePort);
        this.webserver.use(parser.urlencoded({
            extended: true
        }));
        this.webserver.engine('ntl', function (filePath, options, callback) {
            _this.getSettingsPage(filePath, callback);
        });
        this.webserver.set('views', './views');
        this.webserver.set('view engine', 'ntl');
        this.webserver.get('/', function (req, res) {
            res.render('camera', {});
        });
        this.webserver.post('/', function (req, res) {
            for (var par in req.body) {
                var g = par.split('.')[0];
                var p = par.split('.')[1];
                if (p && g && p != "saturation" && p != "color_effects" && p != "blue_balance" && p != "horizontal_flip" && p != "vertical_flip" && p != "power_line_frequency" && p != "sharpness" && p != "color_effects_cbcr" && p != "rotate" && p != "red_balance" && p != "username" && p != "password") {
                    console.log("Checking control: Group = ", g, ", Property = ", p);
                    var prop = v4l2ctl_1.v4l2ctl.Controls[g][p];
                    var val = req.body[par];
                    if (val instanceof Array)
                        val = val.pop();
                    prop.value = val;
                    if (prop.isDirty) {
                        utils.log.debug("Property %s changed to %s", par, prop.value);
                    }
                }
            }
            v4l2ctl_1.v4l2ctl.ApplyControls();
            res.render('camera', {});
        });
    };

    Camera.prototype.getSettingsPage = function (filePath, callback) {
        var _this = this;
        v4l2ctl_1.v4l2ctl.ReadControls();
        fs.readFile(filePath, function (err, content) {
            if (err)
                return callback(new Error(err.message));
        var parseControls = function (html, displayname, propname, controls) {
            const labelMap = {
                max_fr_az: "Maximum Frequency Azimuth",
                min_fr_az: "Minimum Frequency Azimuth",
                deg_enc_movement_az: "Degree Azimuth",
                enc_deg_movement_az: "Encoder Azimuth",
                max_fr_el: "Maximum Frequency Elevation",
                min_fr_el: "Minimum Frequency Elevation",
                deg_enc_movement_el: "Degree-Encoder Elevation",
                enc_deg_movement_el: "Encoder-Degree Elevation",
                day_zoom: "Day Camera Zoom",
                digital_zoom: "Night Camera Zoom",
                acc_az: "Acceleration Azimuth",
                acc_el: "Acceleration Elevation",
                deg_step_movement_az: "Degree-Step Azimuth",
                step_deg_movement_az: "Step-Degree Azimuth",
                deg_step_movement_el: "Degree-Step Elevation",
                step_deg_movement_el: "Step-Degree Elevation",
                range_finder: "Measure Range",
                ethernet_set: "Ethernet Set",
                download_screenshots: "Download Screenshots"
            };
            html += `<table class="settings-table dark-theme"><tr><td colspan="2" class="section-header">${displayname}</td></tr>`;
            let ptzButtons = {
                up: '',
                down: '',
                left: '',
                right: '',
                middle: ''
            };
            let focusMinus = "",
                focusPlus = "";
            let zoomMinus = "",
                zoomPlus = "";

            for (var uc in controls) {
                var p = controls[uc];
                //let label = p.options.label || uc;
                let label = labelMap[uc] || uc;
                let lowerLabel = (p.options.label || uc).toLowerCase();

                // PTZ arrows
                if (p.controlType === "Button") {
                    if (lowerLabel.includes("ptz up")) {
                        ptzButtons.up = createPTZButton(propname, uc, "↑");
                        continue;
                    }
                    if (lowerLabel.includes("ptz down")) {
                        ptzButtons.down = createPTZButton(propname, uc, "↓");
                        continue;
                    }
                    if (lowerLabel.includes("ptz left")) {
                        ptzButtons.left = createPTZButton(propname, uc, "←");
                        continue;
                    }
                    if (lowerLabel.includes("ptz right")) {
                        ptzButtons.right = createPTZButton(propname, uc, "→");
                        continue;
                    }
                    if (lowerLabel.includes("ptz middle")) {
                        ptzButtons.middle = createPTZButton(propname, uc, "⏺");
                        continue;
                    }

                    // Collect Zoom and Focus buttons separately
                    if (lowerLabel.includes("near")) {
                        focusMinus = `<button type="button" class="dual-btn" ${generateMouseEvents(propname, uc)}>-</button>`;
                        continue;
                    }
                    if (lowerLabel.includes("far")) {
                        focusPlus = `<button type="button" class="dual-btn" ${generateMouseEvents(propname, uc)}>+</button>`;
                        continue;
                    }
                    if (lowerLabel.includes("wide")) {
                        zoomMinus = `<button type="button" class="dual-btn" ${generateMouseEvents(propname, uc)}>-</button>`;
                        continue;
                    }
                    if (lowerLabel.includes("tele")) {
                        zoomPlus = `<button type="button" class="dual-btn" ${generateMouseEvents(propname, uc)}>+</button>`;
                        continue;
                    }
                    if(lowerLabel.includes("north")) {
                        html += `<tr>
                                 <td><span class="label">${label}</span></td>
                                 <td><button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Connect</button></td>
                                 </tr>`;
                    }
                    if(lowerLabel.includes("range")) {
                        html += `<tr>
                                <td><span class="label">${label}</span></td>
                                <td><button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Measure</button></td>
                                </tr>`; 
                    }
                    if(lowerLabel.includes("ethernet")) {
                        html += `<tr>
                                <td><span class="label">${label}</span></td>
                                <td><button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Ethernet Set</button></td>
                                </tr>`; 
                    }
                    if(lowerLabel.includes("download")) {
                        screenshotZip();
                        html += `<tr>
                                    <td><span class="label">${label}</span></td>
                                    <td>
                                    <a href="/api/downloadScreenshots" class="standard-button" download>
                                        Download
                                    </a>
                                    </td>
                                </tr>`;
                    }
                  continue; 
                }

                if(p.controlType === "Text")
                    {
                    html += `<tr><td><span class="label">${label}</span></td>
                    <td>
                        <input type="text" 
                            name="${propname}.${uc}" 
                            value="${p.value}"  
                            onchange="sendControlValue('${propname}', '${uc}', this.value)" />
                    </td></tr>`;
                    continue;
                }

                if (p.hasSet) {
                    var set = p.getLookupSet();
                    html += `<tr><td><span class="label">${label}</span></td>
                        <td><select name="${propname}.${uc}" onchange="sendControlValue('${propname}', '${uc}', this.value)">`;
                
                    for (var i = 0; i < set.length; i++) {
                        var o = set[i];
                        html += `<option value="${o.value}" ${o.value == p.value ? 'selected="selected"' : ''}>${o.desc}</option>`;
                    }
                
                    html += `</select></td></tr>`;
                    continue;
                }
                // Boolean
                if (p.type === "Boolean") {
                    html += `<tr><td><span class="label">${label}</span></td>
                        <td><input type="hidden" name="${propname}.${uc}" value="false" />
                        <input type="checkbox" name="${propname}.${uc}" value="true" ${p.value ? 'checked' : ''} /></td></tr>`;
                    continue;
                }
                // Range
                if (p.controlType === "Range") {
                    const range = p.getRange();
                    html += `<tr>
                        <td><span class="label">${label}</span></td>
                        <td>
                            <input type="range"
                                name="${propname}.${uc}"
                                min="${range.min}"
                                max="${range.max}"
                                value="${p.value}"
                                oninput="this.nextElementSibling.value = this.value"
                                onchange="sendControlValue('${propname}', '${uc}', this.value)" />
                            <output>${p.value}</output>
                        </td>
                    </tr>`;
                    continue;
                }

                // Default input
                html += `<tr><td><span class="label">${label}</span></td><td>
                    <input type="text" name="${propname}.${uc}" value="${p.value}" />`;
                if (p.hasRange) {
                    const r = p.getRange();
                    html += `<span class="range-info">(min: ${r.min} max: ${r.max})</span>`;
                }
                html += `</td></tr>`;
            }

            // Inject focus row
            if (focusMinus || focusPlus) {
                html += `<tr><td><span class="label">Focus:</span></td>
                    <td><div class="inline-buttons">${focusMinus}${focusPlus}</div></td></tr>`;
            }

            // Inject zoom row
            if (zoomMinus || zoomPlus) {
                html += `<tr><td><span class="label">Zoom:</span></td>
                    <td><div class="inline-buttons">${zoomMinus}${zoomPlus}</div></td></tr>`;
            }

            // PTZ arrows
            html += `<tr><td colspan="2">
                <div class="ptz-grid">
                    <div></div>
                    <div class="ptz-center">${ptzButtons.up}</div>
                    <div></div>
                    <div class="ptz-center">${ptzButtons.left}</div>
                    <div class="ptz-center">${ptzButtons.middle}</div>
                    <div class="ptz-center">${ptzButtons.right}</div>
                    <div></div>
                    <div class="ptz-center">${ptzButtons.down}</div>
                    <div></div>
                </div>
            </td></tr>`;

            html += `</table>`;
            return html;
        };

            function createPTZButton(prop, uc, symbol) {
                return `<button type="button" class="ptz-key" ${generateMouseEvents(prop, uc)}>${symbol}</button>`;
            }
            function screenshotZip() {
            
                    console.log("SCREENSHOT ZIPPING")
            
                    const tmpDir = '/tmp';
                    const outputDir = path.join(tmpDir, 'screenshots');
                    const outputZip = path.join(outputDir, 'screenshot.zip');
            
                    // Ensure output directory exists
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }
            
                    const output = fs.createWriteStream(outputZip);
                    const archive = archiver('zip', { zlib: { level: 9 } });
            
                    output.on('close', function() {
                        console.log(`Zip created: ${outputZip} (${archive.pointer()} total bytes)`);
                    });
            
                    archive.on('error', function(err) {
                        throw err;
                    });
            
                    archive.pipe(output);
            
                    // Find all PNG files in /tmp/ that contain 'screenshot' in their filename
                    const files = fs.readdirSync(tmpDir);
                    files.forEach(file => {
                        const filePath = path.join(tmpDir, file);
                        if (
                        fs.statSync(filePath).isFile() &&
                        file.toLowerCase().includes('screenshot') &&
                        file.toLowerCase().endsWith('.png')
                        ) {
                        archive.file(filePath, { name: file });
                        }
                    });
            
                    archive.finalize();
                }

            function generateMouseEvents(prop, uc) {
                const bodyTrue = `${prop}.${uc}=true`;
                const bodyFalse = `${prop}.${uc}=false`;
            
                return `
                    onmousedown="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: '${bodyTrue}' });"
                    onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: '${bodyFalse}' });"
                    ontouchstart="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: '${bodyTrue}' });"
                    ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: '${bodyFalse}' });"
                `;
            }

            function sendControlValue(prop, uc, value) {
                fetch("/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `${prop}.${uc}=${encodeURIComponent(value)}`
                }).catch(console.error);
            }

var html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aragats - ONVIF Camera Control System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Hide legacyUserControlsContent and its parents when controls-page is hidden */
        #controls-page:not(.active),
        #controls-page:not(.active) #legacyUserControlsContent,
        #controls-page:not(.active) #legacyUserControlsContent > * {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        /* Added higher specificity rule to ensure hiding */
        body #controls-page:not(.active) #legacyUserControlsContent {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        /* Disable all form inputs inside #controls-page when not active */
        #controls-page:not(.active) form input,
        #controls-page:not(.active) form button,
        #controls-page:not(.active) form select,
        #controls-page:not(.active) form textarea {
            pointer-events: none !important;
            opacity: 0.5 !important;
        }
        #controls-page.active,
        #controls-page.active #legacyUserControlsContent,
        #controls-page.active #legacyUserControlsContent > * {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }

        :root {
            --primary-bg: #1a1f2e;
            --secondary-bg: #232937;
            --accent-color: #00d4aa;
            --accent-hover: #00b894;
            --text-primary: #ffffff;
            --text-secondary: #a8b2d1;
            --border-color: #2d3548;
            --card-bg: #2d3548;
            --input-bg: #3a4358;
            --success: #00d4aa;
            --warning: #ffd93d;
            --danger: #ff6b6b;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: var(--primary-bg);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Navigation */
        .navbar {
            background-color: var(--secondary-bg);
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .nav-brand {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-color);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .nav-menu {
            display: flex;
            list-style: none;
            gap: 2rem;
            align-items: center;
        }

        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            position: relative;
            cursor: pointer;
        }

        .nav-link:hover,
        .nav-link.active {
            color: var(--text-primary);
            background-color: rgba(0, 212, 170, 0.1);
        }

        .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 3px;
            background-color: var(--accent-color);
            border-radius: 2px;
        }

        /* Main Content */
        .main-container {
            flex: 1;
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 2rem;
            width: 100%;
        }

        .page-header {
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 300;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        .page-subtitle {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        /* Cards */
        .card {
            background-color: var(--card-bg);
            border-radius: 1rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }

        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--accent-color);
        }

        /* Grid Layouts */
        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
        }

        .telemetry-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }

        /* Forms and Inputs */
        .form-group {
            margin-bottom: 1rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
        }

        .form-control {
            width: 100%;
            padding: 0.75rem;
            background-color: var(--input-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            color: var(--text-primary);
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
        }

        .form-control:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* Buttons */
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            color: var(--text-primary);
        }

        .btn-primary {
            background-color: var(--accent-color);
            color: var(--primary-bg);
        }

        .btn-primary:hover {
            background-color: var(--accent-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 212, 170, 0.3);
        }

        .btn-secondary {
            background-color: var(--input-bg);
            color: var(--text-primary);
        }

        .btn-secondary:hover {
            background-color: #4a5568;
        }

        .btn-group {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        /* PTZ Control Grid */
        .ptz-container {
            max-width: 300px;
            margin: 0 auto;
        }

        .ptz-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            margin: 1rem 0;
        }

        .ptz-btn {
            aspect-ratio: 1;
            background-color: var(--input-bg);
            border: 2px solid var(--border-color);
            border-radius: 0.5rem;
            color: var(--text-primary);
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .ptz-btn:hover {
            background-color: var(--accent-color);
            color: var(--primary-bg);
            transform: scale(1.05);
        }

        .ptz-btn:active {
            transform: scale(0.95);
        }

        .ptz-center {
            background-color: var(--accent-color);
            color: var(--primary-bg);
        }

        /* Data Display */
        .data-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }

        .data-row:last-child {
            border-bottom: none;
        }

        .data-label {
            color: var(--text-secondary);
            font-weight: 500;
        }

        .data-value {
            font-family: 'Courier New', monospace;
            color: var(--accent-color);
            font-weight: 600;
            background-color: var(--input-bg);
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
        }

        /* Status Indicators */
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 0.5rem;
        }

        .status-online {
            background-color: var(--success);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(0, 212, 170, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(0, 212, 170, 0);
            }
        }

        /* Settings Table */
        .settings-table {
            width: 100%;
        }

        .settings-row {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
            align-items: center;
        }

        .settings-row:last-child {
            border-bottom: none;
        }

        .settings-label {
            color: var(--text-secondary);
            font-weight: 500;
        }

        .control-input-group {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .control-input-group input {
            flex: 1;
        }

        .control-input-group output {
            background-color: var(--input-bg);
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            min-width: 60px;
            text-align: center;
            color: var(--accent-color);
            font-weight: 600;
        }

        /* Range Slider Custom Styling */
        input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: var(--input-bg);
            outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--accent-color);
            cursor: pointer;
            transition: all 0.3s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 0 10px rgba(0, 212, 170, 0.5);
        }

        /* Page specific styles */
        .page-content {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
            visibility: hidden;
        }

        .page-content.active {
            display: block;
            animation: fadeIn 0.3s ease;
            position: relative;
            z-index: 10;
            pointer-events: auto;
            visibility: visible;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .nav-menu {
                flex-direction: column;
                gap: 1rem;
            }

            .grid-container {
                grid-template-columns: 1fr;
            }

            .main-container {
                padding: 0 1rem;
            }

            .settings-row {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
        }

        /* Toast notifications */
        .toast-container {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 2000;
        }

        .toast {
            background-color: var(--card-bg);
            border: 1px solid var(--accent-color);
            border-radius: 0.5rem;
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            min-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .inline-buttons {
            display: flex;
            gap: 0.5rem;
        }

        .dual-btn {
            background-color: var(--input-bg);
            color: var(--text-primary);
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 50px;
        }

        .dual-btn:hover {
            background-color: var(--accent-color);
            color: var(--primary-bg);
        }

        .standard-button {
            background-color: var(--accent-color);
            color: var(--primary-bg);
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .standard-button:hover {
            background-color: var(--accent-hover);
            transform: translateY(-2px);
        }

        .section-header {
            background-color: rgba(0, 212, 170, 0.1);
            color: var(--accent-color);
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 0.5rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
                Aragats ONVIF
            </div>
            <ul class="nav-menu">
                <li><a class="nav-link active" data-page="controls">Controls</a></li>
                <li><a class="nav-link" data-page="telemetry">Telemetry</a></li>
                <li><a class="nav-link" data-page="settings">Settings</a></li>
                <li><span class="status-indicator status-online"></span>Online</li>
            </ul>
        </div>
    </nav>

    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- Main Content -->
    <main class="main-container">
            
        <!-- Controls Page -->
        <!-- Removed empty controls-page div -->
        
        <!-- Telemetry Page -->
        <div id="telemetry-page" class="page-content">
            <div class="page-header">
                <h1 class="page-title">Telemetry Data</h1>
                <p class="page-subtitle">Real-time sensor and position data</p>
            </div>

            <div class="telemetry-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Range Data</h3>
                    </div>
                    <div id="rangeTable">
                        <div class="data-row">
                            <span class="data-label">Max Range</span>
                            <span class="data-value" id="maxRange">Loading...</span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Inclination Data</h3>
                    </div>
                    <div id="inclinoTable">
                        <div class="data-row">
                            <span class="data-label">Temperature</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Inclination X</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Inclination Y</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">GPS Data</h3>
                    </div>
                    <div id="gpsTable">
                        <div class="data-row">
                            <span class="data-label">Time</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Latitude</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Longitude</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Altitude</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">STMD Position Data</h3>
                    </div>
                    <div id="stmdTable">
                        <div class="data-row">
                            <span class="data-label" title="currentPosAz">Azimuth Position (Steps)</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="currentPosEl">Elevation Position (Steps)</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="EncoderAz">Encoder Azimuth</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="EncoderEl">Encoder Elevation</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Movement Data</h3>
                    </div>
                    <div id="movementTable">
                        <div class="data-row">
                            <span class="data-label" title="DegreesAz">Azimuth (Degrees)</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="EncoderAz">Encoder Azimuth</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="DegreesEl">Elevation (Degrees)</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="EncoderEl">Encoder Elevation</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px;" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- PTZ Page -->
        <div id="ptz-page" class="page-content">
            <!-- PTZ page removed as per user request -->
        </div>

        <!-- Settings Page -->
        <div id="settings-page" class="page-content">
            <div class="page-header">
                <h1 class="page-title">Camera Settings</h1>
                <p class="page-subtitle">Configure advanced camera parameters</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">General Settings</h3>
                </div>
                <div class="settings-table">
                    <div class="settings-row">
                        <div class="settings-label">Video Resolution</div>
                        <select class="form-control">
                            <option>1920x1080 (Full HD)</option>
                            <option>1280x720 (HD)</option>
                            <option>640x480 (SD)</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">Frame Rate</div>
                        <div class="control-input-group">
                            <input type="range" class="form-control" min="15" max="60" value="30">
                            <output>30 fps</output>
                        </div>
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">Bitrate</div>
                        <div class="control-input-group">
                            <input type="range" class="form-control" min="1000" max="10000" value="5000" step="500">
                            <output>5000 kbps</output>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls Page -->
        <div id="controls-page" class="page-content active">
            <form method="POST" action="/" onsubmit="event.preventDefault();">
                <div class="page-header">
                    <h1 class="page-title">Controls</h1>
                    <p class="page-subtitle">User controls interface</p>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">User Controls</h3>
                    </div>
                    <div id="legacyUserControlsContent">
                        ${parseControls('', 'User Controls', 'UserControls', v4l2ctl_1.v4l2ctl.Controls.UserControls)}
                    </div>
                </div>
            </form>
        </div>

    </main>
=======
        </div>

    </main>

    <script>
        // Page navigation
const controlsPageContent = document.getElementById('controls-page').innerHTML;
document.getElementById('controls-page').innerHTML = ''; // Remove initially to prevent interaction

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        console.log('Navigation click handler fired'); // Added log to confirm handler fires

        const targetPage = e.target.dataset.page;
        console.log('Navigating to page:', targetPage);

        // Update active nav
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');

        // Show target page and hide others by toggling active class only
        document.querySelectorAll('.page-content').forEach(page => {
            if (page.id === targetPage + '-page') {
                page.classList.add('active');
                console.log('Showing page:', page.id);
            } else {
                page.classList.remove('active');
                console.log('Hiding page:', page.id);
            }
        });

        // Insert or remove Controls page content from DOM to prevent interaction
        const controlsPage = document.getElementById('controls-page');
        if (targetPage === 'controls') {
            if (!controlsPage.innerHTML.trim()) {
                controlsPage.innerHTML = controlsPageContent;
                console.log('Inserted Controls page content');
            }
            // Enable all form inputs inside controls page
            controlsPage.querySelectorAll('input, button, select, textarea').forEach(el => {
                el.disabled = false;
            });
        } else {
            if (controlsPage.innerHTML.trim()) {
                controlsPage.innerHTML = '';
                console.log('Removed Controls page content');
            }
            // Disable all form inputs inside controls page
            controlsPage.querySelectorAll('input, button, select, textarea').forEach(el => {
                el.disabled = true;
            });
        }

        // Added debug log for legacyUserControlsContent visibility
        const controlsMenu = document.getElementById('legacyUserControlsContent');
        if (controlsMenu) {
            console.log('legacyUserControlsContent element found');
            console.log('legacyUserControlsContent display:', window.getComputedStyle(controlsMenu).display);
        } else {
            console.error('legacyUserControlsContent element NOT found');
        }
    });
});

        // Update telemetry data
        function updateTelemetryFields(data, tableId) {
            const table = document.getElementById(tableId);
            if (!table || !data) return;
            
            const rows = table.querySelectorAll('.data-row');
            for (const row of rows) {
                const labelEl = row.querySelector('.data-label');
                const inputEl = row.querySelector('input');
                
                if (labelEl && inputEl) {
                    const key = labelEl.title || labelEl.textContent.trim();
                    
                    // Check various possible data keys
                    for (const dataKey of Object.keys(data)) {
                        if (dataKey.toLowerCase().includes(key.toLowerCase()) || 
                            key.toLowerCase().includes(dataKey.toLowerCase())) {
                            inputEl.value = data[dataKey];
                            break;
                        }
                    }
                }
            }
        }

        // Control value sender
        function sendControlValue(prop, key, value) {
            const body = \`\${prop}.\${key}=\${encodeURIComponent(value)}\`;
            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body
            }).then(res => {
                if (!res.ok) {
                    console.error(\`Failed to send \${prop}.\${key} = \${value}\`);
                    showToast('Failed to update control', 'error');
                } else {
                    showToast('Control updated successfully', 'success');
                }
            }).catch(err => console.error("Fetch error:", err));
        }

        // Toast notification
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = 'toast ' + type;
            toast.textContent = message;
            
            document.getElementById('toastContainer').appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Update range slider outputs
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const output = e.target.nextElementSibling;
                if (output && output.tagName === 'OUTPUT') {
                    output.textContent = e.target.value;
                    if (slider.min >= 1000) {
                        output.textContent = e.target.value + ' kbps';
                    } else if (slider.max <= 60) {
                        output.textContent = e.target.value + ' fps';
                    }
                }
            });
        });

        // Telemetry polling
        setInterval(() => {
            fetch('/api/telemetry')
                .then(res => res.json())
                .then(data => {
                    updateTelemetryFields(data.inclinoData, 'inclinoTable');
                    updateTelemetryFields(data.gpsData, 'gpsTable');
                    updateTelemetryFields(data.stmdData, 'stmdTable');
                    updateTelemetryFields(data.movementData, 'movementTable');
                    updateTelemetryFields(data.rangeData, 'rangeTable');
                })
                .catch(console.error);
        }, 100);

        // Prevent form submission
        document.querySelectorAll("form").forEach(form => {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
            });
        });
    </script>
</body>
</html>
`;
      //html += `<tr><td><span class="label">Far Focus</span></td><td><button type="button" id="farFocusButton">Far Focus</button></td></tr>`;
            var rendered = content.toString().replace('{{row}}', html);
            return callback(null, rendered);
        });
    };
    Camera.prototype.loadDriver = function () {
        try {
            utils.execSync("sudo modprobe bcm2835-v4l2");
        } catch (err) {}
    };
    Camera.prototype.unloadDriver = function () {
        try {
            utils.execSync("sudo modprobe -r bcm2835-v4l2");
        } catch (err) {}
    };
    Camera.prototype.setupCamera = function () {
        v4l2ctl_1.v4l2ctl.SetPixelFormat(v4l2ctl_1.v4l2ctl.Pixelformat.H264);
        v4l2ctl_1.v4l2ctl.SetResolution(this.settings.resolution);
        v4l2ctl_1.v4l2ctl.SetFrameRate(this.settings.framerate);
        v4l2ctl_1.v4l2ctl.SetPriority(v4l2ctl_1.v4l2ctl.ProcessPriority.record);
        v4l2ctl_1.v4l2ctl.ReadFromFile();
        v4l2ctl_1.v4l2ctl.ApplyControls();
    };
    Camera.prototype.setSettings = function (newsettings) {
        v4l2ctl_1.v4l2ctl.SetResolution(newsettings.resolution);
        v4l2ctl_1.v4l2ctl.SetFrameRate(newsettings.framerate);
        v4l2ctl_1.v4l2ctl.Controls.CodecControls.video_bitrate.value = newsettings.bitrate * 1000;
        v4l2ctl_1.v4l2ctl.Controls.CodecControls.video_bitrate_mode.value = newsettings.quality > 0 ? 0 : 1;
        v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_i_frame_period.value = this.settings.forceGop ? v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_i_frame_period.value : newsettings.gop;
        v4l2ctl_1.v4l2ctl.ApplyControls();
    };
    Camera.prototype.startRtsp = function () {
        if (this.rtspServer) {
            utils.log.warn("Cannot start rtspServer, already running");
            return;
        }
        utils.log.info("Starting rtsp server");
        if (this.config.MulticastEnabled) {
            this.rtspServer = utils.spawn("v4l2rtspserver", ["-P", this.config.RTSPPort.toString(), "-u", this.config.RTSPName.toString(), "-m", this.config.RTSPMulticastName, "-M", this.config.MulticastAddress.toString() + ":" + this.config.MulticastPort.toString(), "-W", this.settings.resolution.Width.toString(), "-H", this.settings.resolution.Height.toString(), "/dev/video0"]);
        } else {
            if (this.config.RTSPServer == 1)
                this.rtspServer = utils.spawn("./bin/rtspServer", ["/dev/video0", "2088960", this.config.RTSPPort.toString(), "0", this.config.RTSPName.toString()]);
            if (this.config.RTSPServer == 2)
                this.rtspServer = utils.spawn("v4l2rtspserver", ["-P", this.config.RTSPPort.toString(), "-u", this.config.RTSPName.toString(), "-W", this.settings.resolution.Width.toString(), "-H", this.settings.resolution.Height.toString(), "/dev/video0"]);
            if (this.config.RTSPServer == 3)
                this.rtspServer = utils.spawn("./python/gst-rtsp-launch.sh", ["-P", this.config.RTSPPort.toString(), "-u", this.config.RTSPName.toString(), "-W", this.settings.resolution.Width.toString(), "-H", this.settings.resolution.Height.toString(), "-t", this.config.CameraType, "-d", (this.config.CameraDevice == "" ? "auto" : this.config.CameraDevice)]);
        }
        if (this.rtspServer) {
            this.rtspServer.stdout.on('data', function (data) {
                return utils.log.debug("rtspServer: %s", data);
            });
            this.rtspServer.stderr.on('data', function (data) {
                return utils.log.error("rtspServer: %s", data);
            });
            this.rtspServer.on('error', function (err) {
                return utils.log.error("rtspServer error: %s", err);
            });
            this.rtspServer.on('exit', function (code, signal) {
                if (code)
                    utils.log.error("rtspServer exited with code: %s", code);
                else
                    utils.log.debug("rtspServer exited");
            });
        }
    };
    Camera.prototype.stopRtsp = function () {
        if (this.rtspServer) {
            utils.log.info("Stopping rtsp server");
            this.rtspServer.kill();
            this.rtspServer = null;
        }
    };
    return Camera;
}());
module.exports = Camera;

//# sourceMappingURL=camera.js.map