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
            html += `<div class="card"><div class="card-header"><h3 class="card-title">${displayname}</h3></div><div class="settings-table">`;
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
                        focusMinus = `<button type="button" class="dual-btn" ${generateMouseEvents(propname, uc)} aria-label="Focus Near">-</button>`;
                        continue;
                    }
                    if (lowerLabel.includes("far")) {
                        focusPlus = `<button type="button" class="dual-btn" ${generateMouseEvents(propname, uc)} aria-label="Focus Far">+</button>`;
                        continue;
                    }
                    if (lowerLabel.includes("wide")) {
                        zoomMinus = `<button type="button" class="dual-btn" ${generateMouseEvents(propname, uc)} aria-label="Zoom Wide">-</button>`;
                        continue;
                    }
                    if (lowerLabel.includes("tele")) {
                        zoomPlus = `<button type="button" class="dual-btn" ${generateMouseEvents(propname, uc)} aria-label="Zoom Tele">+</button>`;
                        continue;
                    }
                    if(lowerLabel.includes("north")) {
                        html += `<div class="settings-row">
                                 <div class="settings-label">${label}</div>
                                 <button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Connect</button>
                                 </div>`;
                    }
                    if(lowerLabel.includes("range")) {
                        html += `<div class="settings-row">
                                <div class="settings-label">${label}</div>
                                <button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Measure</button>
                                </div>`; 
                    }
                    if(lowerLabel.includes("ethernet")) {
                        html += `<div class="settings-row">
                                <div class="settings-label">${label}</div>
                                <button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Ethernet Set</button>
                                </div>`; 
                    }
                    if(lowerLabel.includes("download")) {
                        screenshotZip();
                    html += `<div class="settings-row">
                                <div class="settings-label">                     ${label}</div>
                                <a href="/api/downloadScreenshots" class="standard-button" download>
                                    Download
                                </a>
                                </div>`;
                    }
                  continue; 
                }

                if(p.controlType === "Text")
                    {
                    html += `<div class="settings-row"><div class="settings-label">${label}</div>
                    <input type="text" 
                        name="${propname}.${uc}" 
                        value="${p.value}"  
                        onchange="sendControlValue('${propname}', '${uc}', this.value)" 
                        aria-label="${label}" /></div>`;
                    continue;
                }

                    if (p.hasSet) {
                        var set = p.getLookupSet();
                        html += `<div class="settings-row"><div class="settings-label">${label}</div>
                            <select class="form-control" name="${propname}.${uc}" onchange="sendControlValue('${propname}', '${uc}', this.value)" aria-label="${label}">`;
                    
                        for (var i = 0; i < set.length; i++) {
                            var o = set[i];
                            html += `<option value="${o.value}" ${o.value == p.value ? 'selected="selected"' : ''}>${o.desc}</option>`;
                        }
                    
                        html += `</select></div>`;
                        continue;
                    }
                // Boolean
                if (p.type === "Boolean") {
                    html += `<div class="settings-row"><div class="settings-label">${label}</div>
                        <input type="hidden" name="${propname}.${uc}" value="false" />
                        <input type="checkbox" name="${propname}.${uc}" value="true" ${p.value ? 'checked' : ''} aria-label="${label}" /></div>`;
                    continue;
                }
                // Range
if (p.controlType === "Range") {
    const range = p.getRange();
    html += `<div class="settings-row control-input-group">
        <div class="settings-label">${label}</div>
        <input type="range" class="form-control"
            name="${propname}.${uc}"
            min="${range.min}"
            max="${range.max}"
            value="${p.value}"
            oninput="this.nextElementSibling.value = this.value"
            onchange="sendControlValue('${propname}', '${uc}', this.value)" 
            aria-label="${label}" />
        <output class="range-output">${p.value}</output>
    </div>`;
    continue;
}

                // Default input
                html += `<div class="settings-row"><div class="settings-label">${label}</div>
                    <input type="text" name="${propname}.${uc}" value="${p.value}" aria-label="${label}" />`;
                if (p.hasRange) {
                    const r = p.getRange();
                    html += `<span class="range-info">(min: ${r.min} max: ${r.max})</span>`;
                }
                html += `</div>`;
            }

            // Inject focus row
            if (focusMinus || focusPlus) {
                html += `<div class="settings-row"><div class="settings-label">Focus:</div>
                    <div class="inline-buttons">${focusMinus}${focusPlus}</div></div>`;
            }

            // Inject zoom row
            if (zoomMinus || zoomPlus) {
                html += `<div class="settings-row"><div class="settings-label">Zoom:</div>
                    <div class="inline-buttons" style="gap: 1rem;">${zoomMinus}${zoomPlus}</div></div>`;
            }

            // PTZ arrows
            html += `<div class="ptz-container">
                <div class="ptz-grid">
                    <div></div>
                    <div class="ptz-center">${ptzButtons.up}</div>
                    <div></div>
                    <div class="ptz-center">${ptzButtons.left}</div>
                    <div class="ptz-center ptz-middle">${ptzButtons.middle}</div>
                    <div class="ptz-center">${ptzButtons.right}</div>
                    <div></div>
                    <div class="ptz-center">${ptzButtons.down}</div>
                    <div></div>
                </div>
            </div>`;

            html += `</div></div>`;
            return html;
        };

        function createPTZButton(prop, uc, symbol) {
            return `<button type="button" class="ptz-btn" ${generateMouseEvents(prop, uc)} aria-label="PTZ ${symbol}">${symbol}</button>`;
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

        // Generate the user controls HTML but don't include it in the template yet
        const userControlsHTML = parseControls('', 'User Controls', 'UserControls', v4l2ctl_1.v4l2ctl.Controls.UserControls);

var html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aragats - ONVIF Camera Control System</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <style>
:root {
  --primary-bg: #0f111a;
  --secondary-bg: #1a2036;
  --accent-color: #00d4aa;
  --accent-hover: #00f5c2;
  --text-primary: #f0f4ff;
  --text-secondary: #b8c2e0;
  --border-color: #3a4258;
  --card-bg: #1a2036;
  --input-bg: #242d47;
  --success: #00d4aa;
  --warning: #ffd93d;
  --danger: #ff6b6b;
  --glass-bg: rgba(26, 32, 54, 0.6);
  --glass-border: rgba(255, 255, 255, 0.1);
  --transition-base: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--primary-bg);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
}

/* Utility Classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Navigation - Modern Glassmorphism */
.navbar {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  padding: 1rem 2rem;
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
  transition: var(--transition-base);
}

.nav-brand:hover {
  opacity: 0.8;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: var(--transition-base);
  position: relative;
  cursor: pointer;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-primary);
  background-color: rgba(0, 212, 170, 0.15);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
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
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  background: linear-gradient(90deg, var(--accent-color), #00b8ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.15rem;
  max-width: 60ch;
}

/* Cards - Modern Glassmorphism */
.card {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.75rem;
  margin-bottom: 2rem;
  transition: var(--transition-base);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 212, 170, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
}

/* Grid Layouts */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 2rem;
}

.telemetry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.75rem;
}

/* Forms and Inputs - Modern Style */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 600;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  color: var(--text-primary);
  font-size: 1.1rem;
  transition: var(--transition-base);
  font-family: 'Inter', sans-serif;
}

.range-output {
  background-color: var(--input-bg);
  color: var(--accent-color);
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  min-width: 70px;
  text-align: center;
  user-select: none;
  box-shadow: 0 4px 8px rgba(0, 212, 170, 0.3);
  margin-left: 1rem;
  display: inline-block;
}

input[type="range"].form-control {
  -webkit-appearance: none;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
}

input[type="range"].form-control::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-base);
  border: none;
}

input[type="range"].form-control:hover::-webkit-slider-thumb {
  transform: scale(1.2);
  box-shadow: 0 0 0 6px rgba(0, 212, 170, 0.2);
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.2);
}

/* Buttons - Modern 3D Effect */
.btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.875rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  user-select: none;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background-color: var(--accent-color);
  color: var(--primary-bg);
  box-shadow: 0 4px 0 0 rgba(0, 148, 118, 0.8);
}

.btn-primary:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 0 0 rgba(0, 148, 118, 0.8);
}

.btn-primary:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0 0 rgba(0, 148, 118, 0.8);
}

.btn-secondary {
  background-color: var(--input-bg);
  color: var(--text-primary);
  box-shadow: 0 4px 0 0 rgba(42, 52, 70, 0.8);
}

.btn-secondary:hover {
  background-color: #4a5568;
  transform: translateY(-2px);
  box-shadow: 0 6px 0 0 rgba(42, 52, 70, 0.8);
}

.btn-secondary:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0 0 rgba(42, 52, 70, 0.8);
}

.btn-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* PTZ Controls - Modern Gamepad Style */
.ptz-container {
  max-width: 340px;
  margin: 0 auto;
}



.ptz-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin: 2.5rem 0;
  justify-items: center;
  align-items: center;
}

.ptz-btn {
  aspect-ratio: 1;
  background-color: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 1.5rem;
  color: var(--text-primary);
  font-size: 2rem;
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  user-select: none;
  box-shadow: 0 6px 0 0 rgba(0, 0, 0, 0.3);
}

.ptz-btn:hover {
  background-color: var(--accent-color);
  color: var(--primary-bg);
  transform: translateY(-3px);
  box-shadow: 0 9px 0 0 rgba(0, 148, 118, 0.8);
}

.ptz-btn:active {
  transform: translateY(2px);
  box-shadow: 0 3px 0 0 rgba(0, 148, 118, 0.8);
}

.ptz-center {
  background-color: var(--accent-color);
  color: var(--primary-bg);
  box-shadow: 0 6px 0 0 rgba(0, 148, 118, 0.9);
  border-radius: 1.75rem;
}

.ptz-middle {
  background-color: #ff8c00;
  color: #fff;
  box-shadow: 0 6px 0 0 rgba(179, 98, 0, 0.9);
  border-radius: 50%;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin: 0 auto;
}

.ptz-controls {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.ptz-arrow {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 6px rgba(0,0,0,0.1),
    inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative;
  border: 1px solid var(--border-color);
}

.ptz-arrow:hover {
  transform: scale(1.1);
  background: var(--accent-color);
  color: var(--primary-bg);
  box-shadow: 0 6px 12px rgba(0,212,170,0.3);
}

.ptz-arrow:active {
  transform: scale(0.95);
}

.ptz-center-button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(145deg, #00d4aa, #00b894);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 8px rgba(0,212,170,0.3),
    0 0 0 2px rgba(0,212,170,0.2);
  color: white;
  font-weight: bold;
}

.ptz-center-button:hover {
  transform: scale(1.1);
  box-shadow: 
    0 6px 16px rgba(0,212,170,0.4),
    0 0 0 3px rgba(0,212,170,0.3);
}

.ptz-center-button:active {
  transform: scale(0.95);
}

/* Data Display - Modern Table Style */
.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-radius: 0.75rem;
  transition: var(--transition-base);
  margin-bottom: 0.75rem;
  background-color: var(--input-bg);
}

.data-row:hover {
  background-color: rgba(0, 212, 170, 0.15);
  transform: translateX(5px);
}

.data-label {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 1.05rem;
}

.data-value {
  font-family: 'Fira Code', 'Courier New', monospace;
  color: var(--accent-color);
  font-weight: 700;
  background-color: rgba(0, 212, 170, 0.1);
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  min-width: 120px;
  text-align: center;
  user-select: text;
  border: 1px solid rgba(0, 212, 170, 0.2);
}

/* Control Page Visibility - Enhanced */
#controls-page:not(.active),
#controls-page:not(.active) #legacyUserControlsContent,
#controls-page:not(.active) #legacyUserControlsContent > * {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  height: 0 !important;
  overflow: hidden !important;
}

body #controls-page:not(.active) #legacyUserControlsContent {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

#controls-page:not(.active) form input,
#controls-page:not(.active) form button,
#controls-page:not(.active) form select,
#controls-page:not(.active) form textarea {
  pointer-events: none !important;
  opacity: 0.3 !important;
}

#controls-page.active,
#controls-page.active #legacyUserControlsContent,
#controls-page.active #legacyUserControlsContent > * {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  animation: fadeIn 0.4s ease-out;
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
/* Control Page Visibility - Functional Version */
/* This maintains the original hiding/showing logic */
#controls-page:not(.active),
#controls-page:not(.active) #legacyUserControlsContent,
#controls-page:not(.active) #legacyUserControlsContent > * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    height: 0 !important;
    overflow: hidden !important;
}

body #controls-page:not(.active) #legacyUserControlsContent {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
}

#controls-page:not(.active) form input,
#controls-page:not(.active) form button,
#controls-page:not(.active) form select,
#controls-page:not(.active) form textarea {
    pointer-events: none !important;
    opacity: 0.3 !important;
}

#controls-page.active,
#controls-page.active #legacyUserControlsContent,
#controls-page.active #legacyUserControlsContent > * {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    height: auto !important;
    overflow: visible !important;
    animation: fadeIn 0.4s ease-out;
}

/* Page Content Switching - Functional Version */
.page-content {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    z-index: 0;
    pointer-events: none;
    visibility: hidden;
    padding: 2rem;
    animation: none; /* Remove animation to prevent interference */
}

.page-content.active {
    display: block;
    position: relative;
    z-index: 10;
    pointer-events: auto;
    visibility: visible;
    animation: fadeIn 0.3s ease;
}

/* Maintain the original fadeIn animation */
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

.status-indicator {
  display: inline-flex;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 0.75rem;
  vertical-align: middle;
  position: relative;
}

.status-online {
  background-color: var(--success);
  box-shadow: 0 0 12px rgba(0, 212, 170, 0.7);
  animation: pulse 2s infinite ease-out;
}

.status-offline {
  background-color: var(--danger);
  opacity: 0.7;
}

.status-warning {
  background-color: var(--warning);
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(0, 212, 170, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 212, 170, 0);
  }
}

/* Rest of your modernized styles remain unchanged... */

/* Form Controls - Unified Modern Style */
.settings-input, 
input[type="text"] {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border-radius: 0.875rem;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1.1rem;
  transition: var(--transition-base);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
}

.settings-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 1.25rem;
}

.settings-row {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 2fr minmax(100px, 0.5fr);
  gap: 2rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 1.25rem;
  align-items: center;
  transition: var(--transition-base);
  margin-bottom: 1.25rem;
}

.settings-input:focus, 
input[type="text"]:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.2),
              inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Range Sliders - Modern Unified Style */
.settings-range, 
input[type="range"].form-control {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--border-color) 0%, var(--border-color) 100%);
  outline: none;
  cursor: pointer;
  transition: var(--transition-base);
}

.settings-range:hover, 
input[type="range"].form-control:hover {
  background: linear-gradient(90deg, var(--accent-color) 0%, var(--border-color) 100%);
}

.settings-range::-webkit-slider-thumb, 
input[type="range"].form-control::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 212, 170, 0.5),
              0 0 0 2px var(--primary-bg);
}

.settings-range::-webkit-slider-thumb:hover, 
input[type="range"].form-control::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 12px rgba(0, 212, 170, 0.7),
              0 0 0 2px var(--primary-bg);
}

/* Control Input Groups - Modern Layout */
.control-input-group {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.control-input-group input {
  flex: 1;
  min-width: 0;
}

.control-input-group output {
  background-color: rgba(0, 212, 170, 0.1);
  color: var(--accent-color);
  font-weight: 700;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  min-width: 80px;
  text-align: center;
  border: 1px solid rgba(0, 212, 170, 0.2);
  font-family: 'Fira Code', monospace;
}

/* Download Button - Modern 3D Style */
.download-button-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.download-button {
  background-color: var(--accent-color);
  color: var(--primary-bg);
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 1.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 6px 0 0 rgba(0, 148, 118, 0.8);
}

.download-button:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 0 0 rgba(0, 148, 118, 0.8);
}

.download-button:active {
  transform: translateY(1px);
  box-shadow: 0 3px 0 0 rgba(0, 148, 118, 0.8);
}

/* Section Header - Modern Accent */
.section-header {
  background: linear-gradient(90deg, rgba(0, 212, 170, 0.1) 0%, rgba(0, 212, 170, 0.05) 100%);
  color: var(--accent-color);
  padding: 1.25rem;
  margin: 2rem 0 1.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 1rem;
  border-left: 4px solid var(--accent-color);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-header::before {
  content: "";
  width: 8px;
  height: 8px;
  background: var(--accent-color);
  border-radius: 50%;
  display: inline-block;
}

/* Toast Notifications - Modern Glass Style */
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 2000;
}

.toast {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border-left: 4px solid var(--accent-color);
  border-radius: 0.875rem;
  padding: 1.25rem;
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  color: var(--text-primary);
  transform: translateX(0);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast.info {
  border-left-color: var(--accent-color);
}

.toast.success {
  border-left-color: var(--success);
}

.toast.error {
  border-left-color: var(--danger);
}

.toast-exit {
  transform: translateX(150%);
  opacity: 0;
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

/* Dual Button Group - Modern Toggle Style */
.inline-buttons {
  display: flex;
  gap: 0.75rem;
  background: var(--input-bg);
  padding: 0.5rem;
  border-radius: 1.25rem;
  width: fit-content;
}

.dual-btn {
  background: transparent;
  color: var(--text-secondary);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.875rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
  z-index: 1;
}

.standard-button {
            background-color: var(--accent-color);
            color: var(--primary-bg);
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
                      padding: 1rem;
            margin: 1rem 0;
            border-radius: 0.5rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

.dual-btn.active {
  background: var(--accent-color);
  color: var(--primary-bg);
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.4);
}



.dual-btn:not(.active):hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .settings-row {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1.5rem;
  }
  
  .control-input-group {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .control-input-group output {
    width: 100%;
    text-align: left;
  }
  
  .toast {
    min-width: 280px;
    max-width: calc(100vw - 4rem);
  }
}

/* Glow Effects */
.glow-effect {
  position: relative;
}

.glow-effect::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: 0 0 10px 2px rgba(0, 212, 170, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glow-effect:hover::after {
  opacity: 1;
}

/* Smooth Transitions */
* {
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

/* Depth Effects */
.depth-card {
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.1),
    0 6px 20px rgba(0, 212, 170, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.depth-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 8px 16px rgba(0,0,0,0.1),
    0 12px 30px rgba(0, 212, 170, 0.15);
}

/* Modern Button Group Style */
.button-group {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.action-button {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
  background: var(--input-bg);
  color: var(--text-primary);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(0,212,170,0) 100%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,212,170,0.2);
}

.action-button:hover::before {
  opacity: 1;
}

.action-button:active {
  transform: translateY(1px);
}

.action-button i {
  font-size: 1.2rem;
}

.download-button {
  background: var(--accent-color);
  color: var(--primary-bg);
}

.download-button:hover {
  box-shadow: 0 6px 12px rgba(0,212,170,0.4);
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
                <li><a class="nav-link" data-page="fastlive">Fast Live</a></li>
                <li><span class="status-indicator status-online"></span>Online</li>
            </ul>
        </div>
    </nav>

    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- Main Content -->
    <main class="main-container">
            
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

        <!-- Controls Page - Initially empty, content will be injected by JavaScript -->
        <div id="controls-page" class="page-content active">
            <form method="POST" action="/" onsubmit="event.preventDefault();">
 
                <div class="card">
                    <div id="legacyUserControlsContent">
                        <!-- Content will be injected here by JavaScript -->
                    </div>
                </div>
            </form>
        </div>

<div class="stream-interface">
    <!-- Main video stream area -->
    <div class="video-container">
        <video id="liveStream" controls muted>
            Your browser does not support the video tag.
        </video>
    </div>
    
    <!-- Right control panel -->
    <div class="controls-panel">
        <!-- Zoom controls -->
        <div class="control-section">
            <div class="control-label">ZOOM</div>
            <div class="zoom-controls">
                <button class="zoom-btn">-</button>
                <span class="zoom-value">1x</span>
                <button class="zoom-btn">+</button>
            </div>
        </div>
        
        <!-- Speed controls -->
        <div class="control-section">
            <div class="control-label">SPEED</div>
            <div class="speed-controls">
                <div class="speed-row">
                    <button class="speed-btn">1</button>
                    <button class="speed-btn">2</button>
                    <button class="speed-btn">3</button>
                    <button class="speed-btn">4</button>
                </div>
                <div class="speed-row">
                    <button class="speed-btn">5</button>
                    <button class="speed-btn">6</button>
                    <button class="speed-btn">7</button>
                    <button class="speed-btn">8</button>
                </div>
            </div>
        </div>
    </div>
</div>


    </main>

    <script>
        const userControlsHTML = \`${userControlsHTML}\`;
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                console.log('Navigation click handler fired');

                const targetPage = e.target.dataset.page;
                console.log('Navigating to page:', targetPage);

                // Update active nav
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');

                // Show target page and hide others
                document.querySelectorAll('.page-content').forEach(page => {
                    page.classList.remove('active');
                });
                
                const targetPageElement = document.getElementById(targetPage + '-page');
                if (targetPageElement) {
                    targetPageElement.classList.add('active');
                }

                // Handle Controls page content injection
                const controlsContent = document.getElementById('legacyUserControlsContent');
                if (targetPage === 'controls') {
                    // Inject the user controls HTML only when Controls tab is active
                    controlsContent.innerHTML = userControlsHTML;
                    console.log('Injected user controls content');
                } else {
                    // Remove the user controls HTML when other tabs are active
                    controlsContent.innerHTML = '';
                    console.log('Removed user controls content');
                }
            });
        });

        // Initialize the controls page with content since it's the default active page
        document.addEventListener('DOMContentLoaded', function() {
            const controlsContent = document.getElementById('legacyUserControlsContent');
            controlsContent.innerHTML = userControlsHTML;
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