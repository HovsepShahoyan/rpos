"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var fs = require("fs");
var SoapService = require("../lib/SoapService");
var utils_1 = require("../lib/utils");
var utils = utils_1.Utils.utils;
var ImagingService = (function (_super) {
    __extends(ImagingService, _super);
    function ImagingService(config, server, callback) {
        var _this = _super.call(this, config, server) || this;
        _this.brightness = 0;
        _this.autoFocusMode = '';
        _this.focusNearLimit = 0;
        _this.focusFarLimit = 0;
        _this.focusDefaultSpeed = 0;
        _this.imaging_service = require('./stubs/imaging_service.js').ImagingService;
        _this.callback = callback;
        _this.serviceOptions = {
            path: '/onvif/imaging_service',
            services: _this.imaging_service,
            xml: fs.readFileSync('./wsdl/imaging_service.wsdl', 'utf8'),
            wsdlPath: 'wsdl/imaging_service.wsdl',
            onReady: function () { return console.log('imaging_service started'); }
        };
        _this.brightness = 50;
        _this.autoFocusMode = "MANUAL";
        _this.focusDefaultSpeed = 0.5;
        _this.focusNearLimit = 1.0;
        _this.focusFarLimit = 0.0;
        _this.extendService();
        return _this;
    }
    ImagingService.prototype.extendService = function () {
        var _this = this;
        var port = this.imaging_service.ImagingService.Imaging;
        port.GetServiceCapabilities = function (args) {
            var GetServiceCapabilitiesResponse = {
                Capabilities: {
                    attributes: {
                        ImageStabilization: false,
                        Presets: false
                    }
                }
            };
            return GetServiceCapabilitiesResponse;
        };
        port.GetOptions = function (args) {
            var GetOptionsResponse = {
                ImagingOptions: {
                    Brightness: {
                        Min: 0,
                        Max: 100
                    },
                    Focus: {
                        AutoFocusModes: ['AUTO', 'MANUAL'],
                        DefaultSpeed: {
                            Min: 0.1,
                            Max: 1.0
                        },
                        NearLimit: {
                            Min: 0.1,
                            Max: 3.0
                        },
                        FarLimit: {
                            Min: 0.0,
                            Max: 0.0
                        },
                    }
                }
            };
            return GetOptionsResponse;
        },
            port.GetImagingSettings = function (args) {
                var GetImagingSettingsResponse = {
                    ImagingSettings: {
                        Brightness: _this.brightness,
                        Focus: {
                            AutoFocusMode: _this.autoFocusMode,
                            DefaultSpeed: _this.focusDefaultSpeed,
                            NearLimit: _this.focusNearLimit,
                            FarLimit: _this.focusFarLimit,
                        },
                    }
                };
                return GetImagingSettingsResponse;
            };
	console.log('✅ imaging_service.ts was compiled and loaded!');
	    function myCustomBrightnessFunction(brightness) {
 		 console.log('[Custom Function] Adjusting brightness to:', brightness);
	    }
        port.SetImagingSettings = function (args) {
            var SetImagingSettingsResponse = {};
            console.log('====== SetImagingSettings triggered ======');
            console.log(JSON.stringify(args, null, 2));
            if (args.ImagingSettings) {
                if (args.ImagingSettings.Brightness) {
		     myCustomBrightnessFunction(_this.brightness);
                    _this.brightness = args.ImagingSettings.Brightness;
                    console.log('Brightness received:', args.ImagingSettings.Brightness);
                    if (_this.callback)
                        _this.callback('brightness', { value: _this.brightness });
                }
                if (args.ImagingSettings.Focus) {
                    if (args.ImagingSettings.Focus.AutoFocusMode) {
                        _this.autoFocusMode = args.ImagingSettings.Focus.AutoFocusMode;
                        if (_this.callback)
                            _this.callback('focusmode', { value: _this.autoFocusMode });
                    }
                    if (args.ImagingSettings.Focus.DefaultSpeed) {
                        _this.focusDefaultSpeed = args.ImagingSettings.Focus.DefaultSpeed;
                        if (_this.callback)
                            _this.callback('focusdefaultspeed', { value: _this.focusDefaultSpeed });
                    }
                    if (args.ImagingSettings.Focus.NearLimit) {
                        _this.focusNearLimit = args.ImagingSettings.Focus.NearLimit;
                        if (_this.callback)
                            _this.callback('focusnearlimit', { value: _this.focusNearLimit });
                    }
                    if (args.ImagingSettings.Focus.FarLimit) {
                        _this.focusFarLimit = args.ImagingSettings.Focus.FarLimit;
                        if (_this.callback)
                            _this.callback('focusfarlimit', { value: _this.focusFarLimit });
                    }
                }
            }
            return SetImagingSettingsResponse;
        };
        port.Move = function (args) {
            var MoveResponse = {};
            if (args.Focus) {
                if (args.Focus.Continuous) {
                    if (_this.callback)
                        _this.callback('focus', { value: args.Focus.Continuous.Speed });
                }
            }
            return MoveResponse;
        };
        port.GetMoveOptions = function (args) {
            var GetMoveOptionsResponse = {
                MoveOptions: {
                    Continuous: {
                        Speed: {
                            Min: -1.0,
                            Max: 1.0
                        }
                    }
                }
            };
            return GetMoveOptionsResponse;
        };
        port.Stop = function (args) {
            var StopResponse = {};
            if (_this.callback)
                _this.callback('focusstop', {});
            return StopResponse;
        };
        port.GetStatus = function (args) {
            var GetStatusResponse = {
                Status: {
                    FocusStatus20: {
                        Position: 5.0,
                        MoveStatus: 'UNKNOWN',
                    },
                }
            };
            return GetStatusResponse;
        };
    };
    return ImagingService;
}(SoapService));
module.exports = ImagingService;

//# sourceMappingURL=imaging_service.js.map
