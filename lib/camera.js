"use strict";
var utils_1 = require("./utils");
var fs = require("fs");
var parser = require("body-parser");
var v4l2ctl_1 = require("./v4l2ctl");
var utils = utils_1.Utils.utils;
var Camera = (function () {
    function Camera(config, webserver) {
        var _this = this;
        this.options = {
            resolutions: [
                { Width: 640, Height: 480 },
                { Width: 800, Height: 600 },
                { Width: 1024, Height: 768 },
                { Width: 1280, Height: 1024 },
                { Width: 1280, Height: 720 },
                { Width: 1640, Height: 1232 },
                { Width: 1920, Height: 1080 }
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
            resolution: { Width: 1280, Height: 720 },
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
        this.webserver.use(parser.urlencoded({ extended: true }));
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
                if (p && g && /*p != "digital_zoom" &&  p != "palette" && */ p != "username" && p != "password" && p != "ip_address") {
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
                html += "<tr><td colspan=\"2\"><strong>".concat(displayname, "</strong></td></tr>");
                for (var uc in controls) {
                    var p = controls[uc];
                    if (p.hasSet) {
                        var set = p.getLookupSet();
                        html += "<tr><td><span class=\"label\">".concat(uc, "</span></td><td><select name=\"").concat(propname, ".").concat(uc, "\">");
                        for (var _i = 0, set_1 = set; _i < set_1.length; _i++) {
                            var o = set_1[_i];
                            html += "<option value=\"".concat(o.value, "\" ").concat(o.value == p.value ? 'selected="selected"' : '', ">").concat(o.desc, "</option>");
                        }
                        html += '</select></td></tr>';
                    }
                    else if (p.controlType === "Button") {
                        html += `<tr>
                        <td><span class="label">${p.options.label || uc}</span></td>
                        <td>
                            <button type="button"
                                onmousedown="(function(){ const f=document.createElement('form');f.method='POST';f.action='/';const i=document.createElement('input');i.type='hidden';i.name='${propname}.${uc}';i.value=true;f.appendChild(i);document.body.appendChild(f);f.submit(); })()"
                                onmouseup="(function(){ const f=document.createElement('form');f.method='POST';f.action='/';const i=document.createElement('input');i.type='hidden';i.name='${propname}.${uc}';i.value=false;f.appendChild(i);document.body.appendChild(f);f.submit(); })()"
                                ontouchstart="(function(){ const f=document.createElement('form');f.method='POST';f.action='/';const i=document.createElement('input');i.type='hidden';i.name='${propname}.${uc}';i.value=true;f.appendChild(i);document.body.appendChild(f);f.submit(); })()"
                                ontouchend="(function(){ const f=document.createElement('form');f.method='POST';f.action='/';const i=document.createElement('input');i.type='hidden';i.name='${propname}.${uc}';i.value=false;f.appendChild(i);document.body.appendChild(f);f.submit(); })()"
                            >
                                ${p.options.label || 'Press'}
                            </button>
                        </td>
                    </tr>`;
                    }
                    else if (p.type == "Boolean") {
                        html += "<tr><td><span class=\"label\">".concat(uc, "</span></td>\n              <td><input type=\"hidden\" name=\"").concat(propname, ".").concat(uc, "\" value=\"false\" />\n              <input type=\"checkbox\" name=\"").concat(propname, ".").concat(uc, "\" value=\"true\" ").concat(p.value ? 'checked="checked"' : '', "/></td><tr>");
                    }
                    else {
                        html += "<tr><td><span class=\"label\">".concat(uc, "</span></td>\n              <td><input type=\"text\" name=\"").concat(propname, ".").concat(uc, "\" value=\"").concat(p.value, "\" />");
                        if (p.hasRange)
                            html += "<span>( min: ".concat(p.getRange().min, " max: ").concat(p.getRange().max, " )</span>");
                        html += "</td><tr>";
                    }
                }
                return html;
            };
            var html = "<h1>RPOS - ONVIF NVT Camera</h1>";
            html += "<b>Video Stream:</b> rtsp://username:password@deviceIPaddress:" + _this.config.RTSPPort.toString() + "/" + _this.config.RTSPName.toString();
            html += "<br>";
            html = parseControls(html, 'User Controls', 'UserControls', v4l2ctl_1.v4l2ctl.Controls.UserControls);
            html = parseControls(html, 'Codec Controls', 'CodecControls', v4l2ctl_1.v4l2ctl.Controls.CodecControls);
            html = parseControls(html, 'Camera Controls', 'CameraControls', v4l2ctl_1.v4l2ctl.Controls.CameraControls);
            html = parseControls(html, 'JPG Compression Controls', 'JPEGCompressionControls', v4l2ctl_1.v4l2ctl.Controls.JPEGCompressionControls);

            //html += `<tr><td><span class="label">Far Focus</span></td><td><button type="button" id="farFocusButton">Far Focus</button></td></tr>`;
            var rendered = content.toString().replace('{{row}}', html);
            return callback(null, rendered);
        });
    };
    Camera.prototype.loadDriver = function () {
        try {
            utils.execSync("sudo modprobe bcm2835-v4l2");
        }
        catch (err) { }
    };
    Camera.prototype.unloadDriver = function () {
        try {
            utils.execSync("sudo modprobe -r bcm2835-v4l2");
        }
        catch (err) { }
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
        }
        else {
            if (this.config.RTSPServer == 1)
                this.rtspServer = utils.spawn("./bin/rtspServer", ["/dev/video0", "2088960", this.config.RTSPPort.toString(), "0", this.config.RTSPName.toString()]);
            if (this.config.RTSPServer == 2)
                this.rtspServer = utils.spawn("v4l2rtspserver", ["-P", this.config.RTSPPort.toString(), "-u", this.config.RTSPName.toString(), "-W", this.settings.resolution.Width.toString(), "-H", this.settings.resolution.Height.toString(), "/dev/video0"]);
            if (this.config.RTSPServer == 3)
                this.rtspServer = utils.spawn("./python/gst-rtsp-launch.sh", ["-P", this.config.RTSPPort.toString(), "-u", this.config.RTSPName.toString(), "-W", this.settings.resolution.Width.toString(), "-H", this.settings.resolution.Height.toString(), "-t", this.config.CameraType, "-d", (this.config.CameraDevice == "" ? "auto" : this.config.CameraDevice)]);
        }
        if (this.rtspServer) {
            this.rtspServer.stdout.on('data', function (data) { return utils.log.debug("rtspServer: %s", data); });
            this.rtspServer.stderr.on('data', function (data) { return utils.log.error("rtspServer: %s", data); });
            this.rtspServer.on('error', function (err) { return utils.log.error("rtspServer error: %s", err); });
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
