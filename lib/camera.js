"use strict";
var utils_1 = require("./utils");
var fs = require("fs");
var parser = require("body-parser");
var v4l2ctl_1 = require("./v4l2ctl");
var utils = utils_1.Utils.utils;
var Camera = (function () {
    function Camera(config, webserver) {

        webserver.get('/api/telemetry', function (req, res) {
            const commandClient = require('./CommandClient');

            const inclinoData = commandClient.getInclinationData();
            const gpsData = commandClient.getGPSData();
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
                if (p && g && p != "saturation" && p != "color_effects" && p != "blue_balance" && p != "horizontal_flip" && p != "vertical_flip" && p != "power_line_frequency" && p != "sharpness" && p != "color_effects_cbcr" && p != "rotate" && p != "red_balance" && p != "username" && p != "password" && p != "ip_address") {
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
                    range_finder: "Measure Range"
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
                        html += `<tr>
                        <td><span class="label">${label}</span></td>
                        <td><button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Measure</button></td>
                    </tr>`;
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
            <style>
            body { background-color:rgb(52, 99, 91); color: #f1f1f1; font-family: 'Segoe UI', sans-serif; }
            .settings-table { width: 100%; background-color:rgb(15, 75, 65); color: #eee; border-collapse: collapse; border: 1px solid #333; }
            .settings-table td { padding: 10px; border-bottom: 1px solid #333; }
            .settings-table input,
            .settings-table select,
            .settings-table output {
                background-color:rgb(11, 133, 102);
                color: #fff;
                border: 1px solid #444;
                border-radius: 4px;
                padding: 6px;
            }

            .ptz-grid {
                display: grid;
                grid-template-columns: 50px 50px 50px;
                grid-template-rows: 50px 50px 50px;
                justify-content: center;
                gap: 10px;
                margin: 20px 0;
            }
            .ptz-key {
                background-color:rgb(19, 136, 126);
                color: #fff;
                font-size: 18px;
                font-weight: bold;
                border: none;
                border-radius: 8px;
                width: 100%;
                height: 100%;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            .ptz-key:hover {
                background-color:rgb(13, 163, 126);
            }
            .dual-btn {
                background-color: #444;
                color: #fff;
                padding: 6px 12px;
                border: none;
                border-radius: 6px;
                margin: 4px;
                font-size: 14px;
                cursor: pointer;
            }
            .dual-btn:hover {
                background-color: #666;
            }
            .section-header {
                background-color: #222;
                font-size: 16px;
                font-weight: bold;
                color: #fff;
                padding: 12px;
                text-transform: uppercase;
                border-bottom: 1px solid #555;
            }
            .inline - buttons {
                    display: flex;
                    gap: 10 px;
                }

                .dual - btn {
                    background - color: #444;
                color: # fff;
                    padding: 6 px 14 px;
                    border: none;
                    border - radius: 6 px;
                    font - size: 14 px;
                    cursor: pointer;
                    transition: background - color 0.2 s ease;
                }

                .dual - btn: hover {
                    background - color: #666;
            }

            .label {
                color: # ccc;
                    font - weight: 500;
                    font - size: 14 px;
                    white - space: nowrap;
                }

                .ptz - grid {
                    display: grid;
                    grid - template - columns: 40 px 40 px 40 px;
                    grid - template - rows: 40 px 40 px 40 px;
                    justify - content: center;
                    align - items: center;
                    gap: 6 px;
                    margin: 20 px 0 10 px 0;
                }

                .ptz - key {
                    font - size: 16 px;
                    padding: 6 px;
                    background - color:rgb(13, 117, 124);
                color: # fff;
                    font - weight: bold;
                    border: none;
                    border - radius: 8 px;
                    width: 100 % ;
                    height: 100 % ;
                    cursor: pointer;
                    transition: background 0.3 s ease;
                }

                .ptz - key: hover {
                    background - color:rgb(9, 103, 116);
            }

            .inline-buttons {
                display: flex;
                gap: 10px;
            }

            .dual-btn {
                background-color: # 444;
                    color: #fff;
                    padding: 6 px 14 px;
                    border: none;
                    border - radius: 6 px;
                    font - size: 14 px;
                    cursor: pointer;
                    transition: background - color 0.2 s ease;
                }

                .dual - btn: hover {
                    background - color: #666;
            }

            .ptz-grid {
                display: grid;
                grid-template-columns: 40px 40px 40px;
                grid-template-rows: 40px 40px 40px;
                justify-content: center;
                align-items: center;
                gap: 6px;
                margin: 20px 0 10px 0;
            }

            .ptz-key {
                font-size: 16px;
                padding: 6px;
                background-color: # 0066 cc;
                    color: #fff;
                    font - weight: bold;
                    border: none;
                    border - radius: 8 px;
                    width: 100 % ;
                    height: 100 % ;
                    cursor: pointer;
                    transition: background 0.3 s ease;
                }

                .ptz - key: hover {
                    background - color:rgb(18, 131, 112);
            }

                        .label { color: # ccc;
                } <
                /style>
            `;

            html += `
            <style>
                table.settings-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                }

                table.settings-table td {
                    padding: 6px 12px;
                    vertical-align: middle;
                }

                .settings-table td:first-child {
                    width: 250px;
                    font-weight: bold;
                    color: #f1f1f1;
                    white-space: nowrap;
                }

                table.settings-table input[type="text"],
                table.settings-table select,
                table.settings-table input[type="range"] {
                    width: 100%;
                    padding: 5px;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                table.settings-table input[type="range"] {
                    width: 80%;
                }

                table.settings-table button {
                    padding: 6px 10px;
                    font-size: 14px;
                    background-color:rgb(11, 104, 84);
                    border: none;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                }

                table.settings-table button:hover {
                    background-color:rgb(8, 131, 110);
                }

                .section-header {
                    background-color: #f2f2f2;
                    font-size: 16px;
                    padding: 8px 12px;
                    font-weight: bold;
                    color: #444;
                    border-top: 1px solid #ccc;
                }

                .ptz-arrow-button {
                    font-size: 20px;
                    background-color: #333;
                    color: white;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                }

                .ptz-arrow-button:hover {
                    background-color: #555;
                }
            </style>
            <h1>Aragats - ONVIF Camera</h1>
            `;

            // html += "<b>Video Stream:</b> rtsp://username:password@deviceIPaddress:" + _this.config.RTSPPort.toString() + "/" + _this.config.RTSPName.toString();
            html += `
           <div class="telemetry-layout">
             <div class="left-panel">
               <form method="POST" action="/" onsubmit="event.preventDefault();">
                 <table class="settings-table">
                   ${parseControls('', 'User Controls', 'UserControls', v4l2ctl_1.v4l2ctl.Controls.UserControls)}
                 </table>

                <div class="stmd-movement-container">
                <table class="settings-table">
                <tr><td colspan="2" class="section-header">Range</td></tr>
                    <tbody id="rangeTable">
                        <tr><td>maxRange</td><td><input id="maxRange" type="text" value="..." readonly /></td></tr>
                    </tbody>
                </table>
                <table class="settings-table">
                    <tr><td colspan="2" class="section-header">STMD Data</td></tr>
                    <tbody id="stmdTable">
                    <tr><td title="currentPosAz">Current Position of Azimuth (Steps)</td><td><input type="text" value="..." readonly /></td></tr>
                    <tr><td title="currentPosEl">Current Position of Elevation (Steps)</td><td><input type="text" value="..." readonly /></td></tr>
                    <tr><td title="EncoderAz">Encoder Azimuth</td><td><input type="text" value="..." readonly /></td></tr>
                    <tr><td title="EncoderEl">Encoder Elevation</td><td><input type="text" value="..." readonly /></td></tr>
                    </tbody>
                </table>

                <table class="settings-table">
                    <tr><td colspan="2" class="section-header">Movement Data</td></tr>
                    <tbody id="movementTable">
                    <tr><td title="DegreesAz">Degree Azimuth</td><td><input type="text" value="..." readonly /></td></tr>
                    <tr><td title="EncoderAz">Encoder Azimuth</td><td><input type="text" value="..." readonly /></td></tr>
                    <tr><td title="DegreesEl">Degree Elevation</td><td><input type="text" value="..." readonly /></td></tr>
                    <tr><td title="EncoderEl">Encoder Elevation</td><td><input type="text" value="..." readonly /></td></tr>
                    </tbody>
                </table>
                </div>

                <!-- end of left panel/form -->
                </form>
                </div>

                <div class="right-panel">
                <table class="settings-table">
                    <tr><td colspan="2" class="section-header">Inclination Data</td></tr>
                    <tbody id="inclinoTable">
                    <tr><td title="incl_t">Temperature</td><td><input type="text" value="..." readonly /></td></tr>
                    <tr><td title="incl_X_ag">Inclination X</td><td><input type="text" value="..." readonly /></td></tr>
                    <tr><td title="incl_Y_ag">Inclination Y</td><td><input type="text" value="..." readonly /></td></tr>
                    </tbody>

           
                 <tr><td colspan="2" class="section-header">GPS Data</td></tr>
                 <tbody id="gpsTable">
                   <tr><td>Time</td><td><input id="Time" type="text" value="..." readonly /></td></tr>
                   <tr><td>Latitude</td><td><input id="Latitude" type="text" value="..." readonly /></td></tr>
                   <tr><td>Longitude</td><td><input id="Longitude" type="text" value="..." readonly /></td></tr>
                   <tr><td>Altitude</td><td><input id="Altitude" type="text" value="..." readonly /></td></tr>
                 </tbody>
               </table>
             </div>
           </div>
           
           <style>
                body {
                    background-color: rgb(52, 99, 91);
                    color: #f1f1f1;
                    font-family: 'Segoe UI', sans-serif;
                }

                .settings-table {
                    width: 100%;
                    background-color: rgb(15, 75, 65);
                    font-weight: bold;
                    color: #eee;
                    border-collapse: collapse;
                    border: 1px solid #333;
                }

                .settings-table td {
                    padding: 10px;
                    font-weight: bold;
                    border-bottom: 1px solid #333;
                    vertical-align: middle;
                }

                .settings-table td:first-child {
                    width: 250px;
                    font-weight: bold;
                    color: #f1f1f1;
                    white-space: nowrap;
                }

                .settings-table input,
                .settings-table select,
                .settings-table output {
                    background-color: rgb(11, 133, 102);
                    color: #fff;
                    border: 1px solid #444;
                    border-radius: 4px;
                    padding: 6px;
                    font-size: 14px;
                    width: 100%;
                    box-sizing: border-box;
                }

                .settings-table input[type="range"] {
                    width: 80%;
                }

                .settings-table button {
                    padding: 6px 10px;
                    font-size: 13px;
                    background-color: rgb(23, 151, 130);
                    border: none;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .settings-table button:hover {
                    background-color: rgb(9, 112, 107);
                }

                .section-header {
                    background-color: #1d3935;
                    font-size: 16px;
                    font-weight: bold;
                    color: #ffdd99;
                    padding: 12px;
                    text-transform: uppercase;
                    border-bottom: 1px solid #555;
                }

                .label {
                    color: #f1f1f1;
                    font-weight: 500;
                    font-size: 14px;
                }

                .inline-buttons {
                    display: flex;
                    gap: 10px;
                }

                .dual-btn {
                    background-color: #444;
                    color: #fff;
                    padding: 6px 14px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .dual-btn:hover {
                    background-color: #666;
                }

                .ptz-grid {
                    display: grid;
                    grid-template-columns: 40px 40px 40px;
                    grid-template-rows: 40px 40px 40px;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                    margin: 20px 0 10px 0;
                }

                .ptz-key {
                    font-size: 16px;
                    padding: 6px;
                    background-color: rgb(13, 117, 124);
                    color: #fff;
                    font-weight: bold;
                    border: none;
                    border-radius: 8px;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }

                .ptz-key:hover {
                    background-color: rgb(18, 131, 112);
                }

                .telemetry-layout {
                    display: flex;
                    gap: 40px;
                    align-items: flex-start;
                }

                .left-panel, .right-panel {
                    flex: 1;
                }

                .stmd-movement-container {
                    display: flex;
                    gap: 30px;
                    margin-top: 20px;
                }
            </style>
           
           <script>

           function updateTelemetryFields(data, tableId) {
             const table = document.getElementById(tableId);
             if (!table || !data) return;
           
             const rows = table.querySelectorAll('tr');
             for (const row of rows) {
               const keyCell = row.cells[0];
               const inputCell = row.cells[1]?.querySelector('input');
               if (keyCell && inputCell && data.hasOwnProperty(keyCell.textContent.trim())) {
                 inputCell.value = data[keyCell.textContent.trim()];
               }
             }
           }


             function sendControlValue(prop, key, value) {
                const body = \`\${prop}.\${key}=\${encodeURIComponent(value)}\`;
                fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body
                }).then(res => {
                if (!res.ok) {
                    console.error(\`Failed to send \${prop}.\${key} = \${value}\`);
                }
                }).catch(err => console.error("Fetch error:", err));
            }
           
            document.addEventListener("DOMContentLoaded", function () {
                // Prevent all forms on the page from reloading the page
                document.querySelectorAll("form").forEach(function (form) {
                form.addEventListener("submit", function (e) {
                    e.preventDefault();
                });
                });
            });

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
           </script>
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