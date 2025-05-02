"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v4l2ctl = void 0;
const cmdClient = require('./CommandClient');
var utils_1 = require("./utils");
var fs_1 = require("fs");
var stringifyBool = function (v) { return v ? "1" : "0"; };
var utils = utils_1.Utils.utils;
var v4l2ctl;
(function (v4l2ctl) {
    var Pixelformat;
    (function (Pixelformat) {
        Pixelformat[Pixelformat["YU12"] = 0] = "YU12";
        Pixelformat[Pixelformat["YUYV"] = 1] = "YUYV";
        Pixelformat[Pixelformat["RGB3"] = 2] = "RGB3";
        Pixelformat[Pixelformat["JPEG"] = 3] = "JPEG";
        Pixelformat[Pixelformat["H264"] = 4] = "H264";
        Pixelformat[Pixelformat["MJPG"] = 5] = "MJPG";
        Pixelformat[Pixelformat["YVYU"] = 6] = "YVYU";
        Pixelformat[Pixelformat["VYUY"] = 7] = "VYUY";
        Pixelformat[Pixelformat["UYVY"] = 8] = "UYVY";
        Pixelformat[Pixelformat["NV12"] = 9] = "NV12";
        Pixelformat[Pixelformat["BGR3"] = 10] = "BGR3";
        Pixelformat[Pixelformat["YV12"] = 11] = "YV12";
        Pixelformat[Pixelformat["NV21"] = 12] = "NV21";
        Pixelformat[Pixelformat["BGR4"] = 13] = "BGR4";
    })(Pixelformat = v4l2ctl.Pixelformat || (v4l2ctl.Pixelformat = {}));
    var ProcessPriority;
    (function (ProcessPriority) {
        ProcessPriority[ProcessPriority["background"] = 1] = "background";
        ProcessPriority[ProcessPriority["interactive"] = 2] = "interactive";
        ProcessPriority[ProcessPriority["record"] = 3] = "record";
    })(ProcessPriority = v4l2ctl.ProcessPriority || (v4l2ctl.ProcessPriority = {}));
    var UserControl = (function () {
        function UserControl(value, options) {
            if (value === undefined || value === null)
                throw "'value' is required";
            this.typeConstructor = value.constructor;
            this.dirty = false;
            this._value = value === undefined ? null : value;
            this.options = options || {};
            this.options.stringify = this.options.stringify || (function (value) { return value.toString(); });
            this.controlType = options.controlType || null;
        }
        Object.defineProperty(UserControl.prototype, "value", {
            get: function () { return this._value; },
            set: function (value) {
                var val = value;
                if (this.typeConstructor.name == "Boolean") {
                    val = (val === true || val === 1 || val + "".toLowerCase() === "true" || val === "1");
                }
                else if (this.typeConstructor.name != "Object")
                    val = this.typeConstructor(val);
                if (val !== null && val !== undefined) {
                    if (this.hasRange && (val < this.options.range.min || val > this.options.range.max) && (val !== 0 || !this.options.range.allowZero))
                        throw ("value: ".concat(val, " not in range: ").concat(this.options.range.min, " - ").concat(this.options.range.max));
                    if (this.hasSet && this.options.lookupSet.map(function (ls) { return ls.value; }).indexOf(val) == -1)
                        throw ("value: ".concat(val, " not in set: ").concat(this.options.lookupSet.map(function (ls) { return "{ value:".concat(ls.value, " desc:").concat(ls.desc, " }"); }).join()));
                }
                if (this.hasRange && this.options.range.step && (val) % this.options.range.step !== 0)
                    val = Math.round(val / this.options.range.step) * this.options.range.step;
                if (val !== this._value)
                    this.dirty = true;
                this._value = val;
            },
            enumerable: false,
            configurable: true
        });
        ;
        Object.defineProperty(UserControl.prototype, "desc", {
            get: function () {
                if (this.hasSet)
                    for (var _i = 0, _a = this.options.lookupSet; _i < _a.length; _i++) {
                        var l = _a[_i];
                        if (l.value === this.value)
                            return l.desc;
                    }
                throw "'lookup value' not in lookup set";
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(UserControl.prototype, "type", {
            get: function () {
                return this.typeConstructor.name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(UserControl.prototype, "hasSet", {
            get: function () {
                return (this.options.lookupSet || []).length > 0;
            },
            enumerable: false,
            configurable: true
        });
        ;
        UserControl.prototype.getLookupSet = function () {
            var result = new Array(0);
            for (var _i = 0, _a = this.options.lookupSet; _i < _a.length; _i++) {
                var l = _a[_i];
                result.push({
                    value: l.value,
                    desc: l.desc
                });
            }
            return result;
        };
        ;
        Object.defineProperty(UserControl.prototype, "hasRange", {
            get: function () {
                return !!this.options.range;
            },
            enumerable: false,
            configurable: true
        });
        ;
        UserControl.prototype.getRange = function () {
            if (this.hasRange)
                return { min: this.options.range.min, max: this.options.range.max };
            return null;
        };
        Object.defineProperty(UserControl.prototype, "isDirty", {
            get: function () {
                return this.dirty;
            },
            enumerable: false,
            configurable: true
        });
        ;
        UserControl.prototype.reset = function () {
            this.dirty = false;
        };
        ;
        UserControl.prototype.toString = function () {
            return this.options.stringify(this._value);
        };
        return UserControl;
    }());
    v4l2ctl.UserControl = UserControl;
    v4l2ctl.Controls = {
        UserControls: {
            brightness: new UserControl(50, { range: { min: 0, max: 100 }, controlType: "Range"  }),
            contrast: new UserControl(0, { range: { min: 0, max: 100 }, controlType: "Range"  }),
            palette: new UserControl(0, { lookupSet: [{ value: 0, desc: 'White Hot' }, { value: 1, desc: 'Black Hot' }] }),
            far_focus: new UserControl(false, {
                controlType: "Button",
                label: "Far Focus"
            }),    
            near_focus: new UserControl(false, {
                controlType: "Button",
                label: "Near Focus"
            }),
            tele_zoom: new UserControl(false, {
                controlType: "Button",
                label: "Day Camera Tele Zoom"
            }),
            wide_zoom: new UserControl(false, {
                controlType: "Button",
                label: "Day Camera Wide Zoom"
            }),
            //saturation: new UserControl(0, { range: { min: -100, max: 100 } }),
            //red_balance: new UserControl(1000, { range: { min: 1, max: 7999 } }),
            //blue_balance: new UserControl(1000, { range: { min: 1, max: 7999 } }),
            //horizontal_flip: new UserControl(false, { stringify: stringifyBool }),
            //vertical_flip: new UserControl(false, { stringify: stringifyBool }),
            //power_line_frequency: new UserControl(1, { lookupSet: [{ value: 0, desc: 'Disabled' }, { value: 1, desc: '50 Hz' }, { value: 2, desc: '60 Hz' }, { value: 3, desc: 'Auto' }] }),
            //sharpness: new UserControl(0, { range: { min: -100, max: 100 } }),
            //color_effects: new UserControl(0, { lookupSet: [{ value: 0, desc: 'None' }, { value: 1, desc: 'Black & White' }, { value: 2, desc: 'Sepia' }, { value: 3, desc: 'Negative' }, { value: 4, desc: 'Emboss' }, { value: 5, desc: 'Sketch' }, { value: 6, desc: 'Sky Blue' }, { value: 7, desc: 'Grass Green' }, { value: 8, desc: 'Skin Whiten' }, { value: 9, desc: 'Vivid' }, { value: 10, desc: 'Aqua' }, { value: 11, desc: 'Art Freeze' }, { value: 12, desc: 'Silhouette' }, { value: 13, desc: 'Solarization' }, { value: 14, desc: 'Antique' }, { value: 15, desc: 'Set Cb/Cr' }] }),
            //rotate: new UserControl(0, { range: { min: 0, max: 360 } }),
            //color_effects_cbcr: new UserControl(32896, { range: { min: 0, max: 65535 } }),
            alphaD1: new UserControl(1, {range: { min: 0, max: 59 }, controlType: "Range"  }),
            alphaD2: new UserControl(1, {range: { min: 0, max: 99 }, controlType: "Range"  }),
            north_connect: new UserControl(false, {
                controlType: "Button",
                label: "Connect to North"
            }),
            digital_zoom: new UserControl(1, { lookupSet: [{ value: 1, desc: '1x' }, { value: 2, desc: '2x' }, { value: 3, desc: '4x' }, { value: 4, desc: '8x' }] }),
            day_zoom: new UserControl(1, { lookupSet: [{ value: 1, desc: '1x' }, { value: 5, desc: '5x' }, { value: 15, desc: '15x' }, { value: 30, desc: '30x' }, { value: 60, desc: '60x' }, { value: 68, desc: '68x' }] }),
            ptz_up: new UserControl(false, {
                controlType: "Button",
                label: "PTZ UP"
            }),
            ptz_down: new UserControl(false, {
                controlType: "Button",
                label: "PTZ DOWN"
            }),
            ptz_right: new UserControl(false, {
                controlType: "Button",
                label: "PTZ RIGHT"
            }),
            ptz_left: new UserControl(false, {
                controlType: "Button",
                label: "PTZ LEFT"
            }),
            ptz_middle: new UserControl(false, {
                controlType: "Button",
                label: "PTZ MIDDLE"
            }),
            acc_az: new UserControl(1, { range: { min: 1, max: 200 }, controlType: "Range"  }),
            min_fr_az: new UserControl(1, { range: { min: 1, max: 4000 }, controlType: "Range" }),
            max_fr_az: new UserControl(1, { range: { min: 1, max: 20000 }, controlType: "Range" }),
            deg_enc_movement_az: new UserControl(1, { range: { min: -185, max: 185 }, controlType: "Range"  }),
            enc_deg_movement_az: new UserControl(1, { range: { min: 0, max: 271000 }, controlType: "Range"  }),
            deg_step_movement_az: new UserControl(1, { range: { min: -210, max: 210 }, controlType: "Range"  }),
            step_deg_movement_az: new UserControl(1, { range: { min: -210000, max: 210000 }, controlType: "Range"  }),
            acc_el: new UserControl(1, { range: { min: 1, max: 200 }, controlType: "Range"  }),            
            min_fr_el: new UserControl(1, { range: { min: 1, max: 4000 }, controlType: "Range" }),
            max_fr_el: new UserControl(1, { range: { min: 1, max: 20000 }, controlType: "Range" }),
            deg_enc_movement_el: new UserControl(1, { range: { min: -20, max: 30 }, controlType: "Range"  }),
            enc_deg_movement_el: new UserControl(1, { range: { min: 0, max: 262000 }, controlType: "Range"  }),
            deg_step_movement_el: new UserControl(1, { range: { min: -90, max: 90 }, controlType: "Range"  }),
            step_deg_movement_el: new UserControl(1, { range: { min: -50000, max: 50000 }, controlType: "Range"  }),
            range_finder: new UserControl(false, {
                controlType: "Button",
                label: "Range Finder"
            })
        },
        CodecControls: {
            video_bitrate_mode: new UserControl(0, { lookupSet: [{ value: 0, desc: 'Variable Bitrate' }, { value: 1, desc: 'Constant Bitrate' }] }),
            video_bitrate: new UserControl(10000000, { range: { min: 25000, max: 25000000, step: 25000, allowZero: true } }),
            repeat_sequence_header: new UserControl(false, { stringify: stringifyBool }),
            h264_i_frame_period: new UserControl(60, { range: { min: 0, max: 2147483647 } }),
            h264_level: new UserControl(11, { lookupSet: [{ value: 0, desc: '1' }, { value: 1, desc: '1b' }, { value: 2, desc: '1.1' }, { value: 3, desc: '1.2' }, { value: 4, desc: '1.3' }, { value: 5, desc: '2' }, { value: 6, desc: '2.1' }, { value: 7, desc: '2.2' }, { value: 8, desc: '3' }, { value: 9, desc: '3.1' }, { value: 10, desc: '3.2' }, { value: 11, desc: '4' }] }),
            h264_profile: new UserControl(4, { lookupSet: [{ value: 0, desc: 'Baseline' }, { value: 1, desc: 'Constrained Baseline' }, { value: 2, desc: 'Main' }, { value: 4, desc: 'High' }] })
        },
        CameraControls: {
            auto_exposure: new UserControl(false, { stringify: stringifyBool }),
            exposure_time_absolute: new UserControl(1000, { range: { min: 0, max: 10000 } }),
            exposure_dynamic_framerate: new UserControl(false, { stringify: stringifyBool }),
            auto_exposure_bias: new UserControl(12, { range: { min: 0, max: 24 } }),
            white_balance_auto_preset: new UserControl(1, { lookupSet: [{ value: 0, desc: 'Manual' }, { value: 1, desc: 'Auto' }, { value: 2, desc: 'Incandescent' }, { value: 3, desc: 'Fluorescent' }, { value: 4, desc: 'Fluorescent' }, { value: 5, desc: 'Horizon' }, { value: 6, desc: 'Daylight' }, { value: 7, desc: 'Flash' }, { value: 8, desc: 'Cloudy' }, { value: 9, desc: 'Shade' }] }),
            image_stabilization: new UserControl(false, { stringify: stringifyBool }),
            iso_sensitivity: new UserControl(0, { lookupSet: [{ value: 0, desc: '0' }, { value: 1, desc: '100' }, { value: 2, desc: '200' }, { value: 3, desc: '400' }, { value: 4, desc: '800' }] }),
            exposure_metering_mode: new UserControl(0, { lookupSet: [{ value: 0, desc: 'Average' }, { value: 1, desc: 'Center Weighted' }, { value: 2, desc: 'Spot' }] }),
            scene_mode: new UserControl(0, { lookupSet: [{ value: 0, desc: 'None' }, { value: 8, desc: 'Night' }, { value: 11, desc: 'Sport' }] })
        },
        JPEGCompressionControls: {
            compression_quality: new UserControl(30, { range: { min: 1, max: 100 } })
        }
    };

    function execV4l2(cmd) {
        console.log("CALLING execV4l2 with command:", cmd); // Log the command
        
        try {

            // PTZ Functions

            if (cmd.includes('deg_enc_movement_az')) {
                const match = cmd.match(/deg_enc_movement_az=([-\d.]+)/);
                if (match && match[1]) {
                    const degEncMovementAz = parseFloat(match[1]);
                    console.log(`[V4L2] deg_enc_movement_az extracted: ${degEncMovementAz}`);
                    cmdClient.setWithDegEncMovementAz(degEncMovementAz);
                }
            }
            
            if (cmd.includes('enc_deg_movement_az')) {
                const match = cmd.match(/enc_deg_movement_az=([-\d.]+)/);
                if (match && match[1]) {
                    const encDegMovementAz = parseFloat(match[1]);
                    console.log(`[V4L2] enc_deg_movement_az extracted: ${encDegMovementAz}`);
                    cmdClient.setWithEncDegMovementAz(encDegMovementAz);
                }
            }
            
            if (cmd.includes('deg_enc_movement_el')) {
                const match = cmd.match(/deg_enc_movement_el=([-\d.]+)/);
                if (match && match[1]) {
                    const degEncMovementEl = parseFloat(match[1]);
                    console.log(`[V4L2] deg_enc_movement_el extracted: ${degEncMovementEl}`);
                    cmdClient.setWithDegEncMovementEl(degEncMovementEl);
                }
            }
            
            if (cmd.includes('enc_deg_movement_el')) {
                const match = cmd.match(/enc_deg_movement_el=([-\d.]+)/);
                if (match && match[1]) {
                    const encDegMovementEl = parseFloat(match[1]);
                    console.log(`[V4L2] enc_deg_movement_el extracted: ${encDegMovementEl}`);
                    cmdClient.setWithEncDegMovementEl(encDegMovementEl);
                }
            }

            if (cmd.includes('deg_step_movement_az')) {
                const match = cmd.match(/deg_step_movement_az=([-\d.]+)/);
                if (match && match[1]) {
                    const degStepMovementAz = parseFloat(match[1]);
                    console.log(`[V4L2] deg_enc_movement_az extracted: ${degStepMovementAz}`);
                    cmdClient.setWithDegStepMovementAz(degStepMovementAz);
                }
            }
            
            if (cmd.includes('step_deg_movement_az')) {
                const match = cmd.match(/step_deg_movement_az=([-\d.]+)/);
                if (match && match[1]) {
                    const stepDegMovementAz = parseFloat(match[1]);
                    console.log(`[V4L2] step_deg_movement_az extracted: ${stepDegMovementAz}`);
                    cmdClient.setWithStepDegMovementAz(stepDegMovementAz);
                }
            }
            
            if (cmd.includes('deg_step_movement_el')) {
                const match = cmd.match(/deg_step_movement_el=([-\d.]+)/);
                if (match && match[1]) {
                    const degStepMovementEl = parseFloat(match[1]);
                    console.log(`[V4L2] deg_step_movement_el extracted: ${degStepMovementEl}`);
                    cmdClient.setWithDegStepMovementEl(degStepMovementEl);
                }
            }
            
            if (cmd.includes('step_deg_movement_el')) {
                const match = cmd.match(/step_deg_movement_el=([-\d.]+)/);
                if (match && match[1]) {
                    const stepDegMovementEl = parseFloat(match[1]);
                    console.log(`[V4L2] step_deg_movement_el extracted: ${stepDegMovementEl}`);
                    cmdClient.setWithStepDegMovementEl(stepDegMovementEl);
                }
            }

            if (cmd.includes('range_finder')) {
                const rangeFinder = cmd.split('=')[1];
                console.log(`[V4L2] Range Finder extracted: ${rangeFinder}`);

                cmdClient.pollRangeFinder();
            }

            if (cmd.includes('north_connect')) {
                const northConnect = cmd.split('=')[1];
                console.log(`[V4L2] North Connect extracted: ${northConnect}`);

                cmdClient.pollRangeFinder();
            }

            if (cmd.includes('acc_az')) {
                const accAz = cmd.split('=')[1];
                console.log(`[V4L2] Acc az extracted: ${accAz}`);

                cmdClient.setAccAz(accAz);
            }

            if (cmd.includes('acc_el')) {
                const accEl = cmd.split('=')[1];
                console.log(`[V4L2] Acc el extracted: ${accEl}`);

                cmdClient.setAccEl(accEl);
            }

            if (cmd.includes('min_fr_az')) {
                const minFrAz = cmd.split('=')[1];
                console.log(`[V4L2] Min Fr Az extracted: ${minFrAz}`);

                cmdClient.setMinFrAz(minFrAz);
            }

            if (cmd.includes('min_fr_el')) {
                const minFrEl = cmd.split('=')[1];
                console.log(`[V4L2] Min Fr El extracted: ${minFrEl}`);

                cmdClient.setMinFrEl(minFrEl);
            }

            if (cmd.includes('max_fr_az')) {
                const maxFrAz = cmd.split('=')[1];
                console.log(`[V4L2] Max Fr Az extracted: ${maxFrAz}`);

                cmdClient.setMaxFrAz(maxFrAz);
            }

            if (cmd.includes('max_fr_el')) {
                const maxFrEl = cmd.split('=')[1];
                console.log(`[V4L2] Max Fr El extracted: ${maxFrEl}`);

                cmdClient.setMaxFrEl(maxFrEl);
            }

            if (cmd.includes('alphaD1')) {
                const alphaD1 = cmd.split('=')[1];
                console.log(`[V4L2] AlphaD1 Extracted: ${alphaD1}`);

                cmdClient.setAlphaD1(alphaD1);
            }

            if (cmd.includes('alphaD2')) {
                const alphaD2 = cmd.split('=')[1];
                console.log(`[V4L2] AlphaD2 Extracted: ${alphaD2}`);

                cmdClient.setAlphaD2(alphaD2);
            }

            if (cmd.includes('ptz_up')) {
                const ptzUp = cmd.split('=')[1];
                console.log(`[V4L2] PTZ Up extracted: ${ptzUp}`);

                if (ptzUp == "true") {
                    cmdClient.setUp(ptzUp);
                }
                else {
                    cmdClient.setPTZStop(ptzUp);
                }
            }

            if (cmd.includes('ptz_down')) {
                const ptzDown = cmd.split('=')[1];
                console.log(`[V4L2] PTZ Down extracted: ${ptzDown}`);

                if (ptzDown == "true") {
                    cmdClient.setDown(ptzDown);
                }
                else {
                    cmdClient.setPTZStop(ptzDown);
                }
            }

            if (cmd.includes('ptz_right')) {
                const ptzRight = cmd.split('=')[1];
                console.log(`[V4L2] PTZ Right extracted: ${ptzRight}`);

                if (ptzRight == "true") {
                    cmdClient.setRight(ptzRight);
                }
                else {
                    cmdClient.setPTZStop(ptzRight);
                }
            }

            if (cmd.includes('ptz_left')) {
                const ptzLeft = cmd.split('=')[1];
                console.log(`[V4L2] PTZ Left extracted: ${ptzLeft}`);

                if (ptzLeft == "true") {
                    cmdClient.setLeft(ptzLeft);
                }
                else {
                    cmdClient.setPTZStop(ptzLeft);
                }
            }

            if (cmd.includes('ptz_middle')) {
                const ptzMiddle = cmd.split('=')[1];
                console.log(`[V4L2] Far Focus extracted: ${ptzMiddle}`);
                cmdClient.setMiddle(ptzMiddle);
            }


            // Thermal Camera Functions

            if (cmd.includes('brightness')) {
                const brightness = cmd.split('=')[1];
                console.log(`[V4L2] Brightness value extracted: ${brightness}`);
    
                cmdClient.setBrightness(brightness);
            }

            if (cmd.includes('digital_zoom')) {
                const zoomLevel = cmd.split('=')[1];
                console.log(`[V4L2] Zoom level extracted: ${zoomLevel}`);
                console.log("typeof cmdClient.setZoom:", typeof cmdClient.setZoom);

                cmdClient.setZoom(zoomLevel);
            }

            if (cmd.includes('far_focus')) {
                const farFocus = cmd.split('=')[1];
                console.log(`[V4L2] Far Focus extracted: ${farFocus}`);

                if (farFocus == "true") {
                    cmdClient.setFarFocus(farFocus);
                }
                else {
                    cmdClient.setStopFocus(farFocus);
                }
            }

            if (cmd.includes('far_focus')) {
                const farFocus = cmd.split('=')[1];
                console.log(`[V4L2] Far Focus extracted: ${farFocus}`);

                if (farFocus == "true") {
                    cmdClient.setFarFocus(farFocus);
                }
                else {
                    cmdClient.setStopFocus(farFocus);
                }
            }

            // Day Camera Functions

            if (cmd.includes('tele_zoom')) {
                const teleZoom = cmd.split('=')[1];
                console.log(`[V4L2] Tele Zoom extracted: ${teleZoom}`);

                if (teleZoom == "true") {
                    cmdClient.setTeleZoom(teleZoom);
                }
                else {
                    cmdClient.setDayZoomStop(teleZoom);
                }
            }

            if (cmd.includes('wide_zoom')) {
                const wideZoom = cmd.split('=')[1];
                console.log(`[V4L2] Wide Zoom extracted: ${wideZoom}`);

                if (wideZoom == "true") {
                    cmdClient.setWideZoom(wideZoom);
                }
                else {
                    cmdClient.setDayZoomStop(wideZoom);
                }
            }

            if (cmd.includes('day_zoom')) {
                const dayZoomLevel = cmd.split('=')[1];
                console.log(`[V4L2] Day Zoom level extracted: ${dayZoomLevel}`);

                cmdClient.setDayZoom(dayZoomLevel);
            }


            // Thermal Camera Functions

            if (cmd.includes('palette')) {
                const palette = cmd.split('=')[1];
                console.log(`[V4L2] Palette extracted: ${palette}`);

                if (palette == 1) {
                    cmdClient.setBlackHot(palette);
                }
                else {
                    cmdClient.setWhiteHot(palette);
                }
            }

            if (cmd.includes('near_focus')) {
                const nearFocus = cmd.split('=')[1];
                console.log(`[V4L2] Near Focus extracted: ${nearFocus}`);

                if (nearFocus === "true") {
                    cmdClient.setNearFocus(nearFocus);
                }
                else {
                    cmdClient.setStopFocus(nearFocus);
                }
            }

            if (cmd.includes('contrast')) {
                const contrastLevel = cmd.split('=')[1];
                console.log(`[V4L2] Contrast level extracted: ${contrastLevel}`);

                cmdClient.setContrast(contrastLevel);
            }
            
            return utils.execSync("v4l2-ctl ".concat(cmd)).toString();
        }
        catch (err) {
            return '';
        }
    }
    function ApplyControls() {
        console.log('[v4l2ctl] Checking which controls are dirty:');
        for (const [key, control] of Object.entries(v4l2ctl.Controls.UserControls)) {
            console.log(` - ${key}: value=${control.value}, dirty=${control.dirty}`);
        }
        console.log("[v4l2ctl] ApplyControls() called");
        var usercontrols = v4l2ctl.Controls.UserControls;
        var codeccontrols = v4l2ctl.Controls.CodecControls;
        var cameracontrols = v4l2ctl.Controls.CameraControls;
        var jpgcontrols = v4l2ctl.Controls.JPEGCompressionControls;
        var getChanges = function (controls) {
            var changes = [];
            for (var c in controls) {
                var control = controls[c];
                if (!control.isDirty)
                    continue;
                changes.push([c, "=", control].join(''));
                control.reset();
            }
            return changes;
        };
        var changedcontrols = getChanges(usercontrols)
            .concat(getChanges(codeccontrols))
            .concat(getChanges(cameracontrols))
            .concat(getChanges(jpgcontrols));
        if (changedcontrols.length > 0) {
            console.log('[v4l2ctl] Changes to apply:', changedcontrols.join(','));
            const command = `v4l2-ctl --set-ctrl ${changedcontrols.join(',')}`;
            console.log('[v4l2ctl] Running command:', command);

            execV4l2("--set-ctrl ".concat(changedcontrols.join(',')));
            WriteToFile();
        }
        else {
            console.log('[v4l2ctl] No changes detected.');
        }
    }
    v4l2ctl.ApplyControls = ApplyControls;
    function WriteToFile() {
        var data = {};
        for (var ct in v4l2ctl.Controls) {
            data[ct] = {};
            for (var k in v4l2ctl.Controls[ct]) {
                var uc = v4l2ctl.Controls[ct][k];
                data[ct][k] = uc.value;
            }
        }
        var json = JSON.stringify(data);
        json = json.replace(/{"/g, "{\n\"").replace(/:{/g, ":\n{").replace(/,"/g, ",\n\"").replace(/}/g, "}\n");
        (0, fs_1.writeFileSync)("v4l2ctl.json", json);
    }
    v4l2ctl.WriteToFile = WriteToFile;
    function ReadFromFile() {
        try {
            var data = JSON.parse((0, fs_1.readFileSync)("v4l2ctl.json").toString());
            for (var ct in data) {
                for (var k in data[ct]) {
                    var uc = v4l2ctl.Controls[ct][k];
                    uc.value = data[ct][k];
                }
            }
        }
        catch (ex) {
            utils.log.error("v4l2ctl.json does not exist yet or invalid.");
        }
    }
    v4l2ctl.ReadFromFile = ReadFromFile;
    function ReadControls() {
        var settings = execV4l2("-l");
        var regexPart = "\\s.*value=([0-9]*)";
        var getControls = function (controls) {
            for (var c in controls) {
                var control = controls[c];
                var value = settings.match(new RegExp([c, regexPart].join('')));
                if (!value || (value.length > 1 && value[1] === "" && c == "auto_exposure"))
                    value = settings.match(new RegExp([c.substr(0, c.length - 1), regexPart].join('')));
                if (value && value.length > 1) {
                    utils.log.debug("Controlvalue '%s' : %s", c, value[1]);
                    try {
                        control.value = value[1];
                        control.reset();
                    }
                    catch (ex) {
                        utils.log.error(ex);
                    }
                }
                else {
                    //console.log(`[Control Update] ${c} = ${value && value[1] !== undefined ? value[1] : 'not found'}`);
                   //utils.log.error("Could not retrieve Controlvalue '%s'", c);
               }
            }
        };
        var usercontrols = v4l2ctl.Controls.UserControls;
        var codeccontrols = v4l2ctl.Controls.CodecControls;
        var cameracontrols = v4l2ctl.Controls.CameraControls;
        var jpgcontrols = v4l2ctl.Controls.JPEGCompressionControls;
        getControls(usercontrols);
        getControls(codeccontrols);
        getControls(cameracontrols);
        getControls(jpgcontrols);
        WriteToFile();
    }
    v4l2ctl.ReadControls = ReadControls;
    function SetFrameRate(framerate) {
        execV4l2("--set-parm=".concat(framerate));
    }
    v4l2ctl.SetFrameRate = SetFrameRate;
    function SetResolution(resolution) {
        execV4l2("--set-fmt-video=width=".concat(resolution.Width, ",height=").concat(resolution.Height));
    }
    v4l2ctl.SetResolution = SetResolution;
    function SetPixelFormat(pixelformat) {
        execV4l2("--set-fmt-video=pixelformat=".concat(pixelformat));
    }
    v4l2ctl.SetPixelFormat = SetPixelFormat;
    function SetPriority(priority) {
        execV4l2("--set-priority=".concat(priority));
    }
    v4l2ctl.SetPriority = SetPriority;
    function SetBrightness(brightness) {
        execV4l2("--set-ctrl brightness=".concat(brightness));
        console.log('[V4L2] Prepared brightness command:', cmd); // 🔍
        // Also send to the camera over TCP
        cmdClient.setBrightness(brightness);
    }
    v4l2ctl.SetBrightness = SetBrightness;
})(v4l2ctl = exports.v4l2ctl || (exports.v4l2ctl = {}));

//# sourceMappingURL=v4l2ctl.js.map
