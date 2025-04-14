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
var url = require("url");
var v4l2ctl_1 = require("../lib/v4l2ctl");
var child_process_1 = require("child_process");
var utils = utils_1.Utils.utils;
var MediaService = (function (_super) {
    __extends(MediaService, _super);
    function MediaService(config, server, camera, ptz_service) {
        var _this = _super.call(this, config, server) || this;
        _this.ffmpeg_process = null;
        _this.ffmpeg_responses = [];
        _this.media_service = require('./stubs/media_service.js').MediaService;
        _this.camera = camera;
        _this.ptz_service = ptz_service;
        _this.serviceOptions = {
            path: '/onvif/media_service',
            services: _this.media_service,
            xml: fs.readFileSync('./wsdl/media_service.wsdl', 'utf8'),
            wsdlPath: 'wsdl/media_service.wsdl',
            onReady: function () {
                utils.log.info('media_service started');
            }
        };
        _this.extendService();
        return _this;
    }
    MediaService.prototype.starting = function () {
        var _this = this;
        var listeners = this.webserver.listeners('request').slice();
        this.webserver.removeAllListeners('request');
        this.webserver.addListener('request', function (request, response, next) {
            utils.log.debug('web request received : %s', request.url);
            var uri = url.parse(request.url, true);
            var action = uri.pathname;
            if (action == '/web/snapshot.jpg') {
                try {
                    if (_this.ffmpeg_process != null) {
                        utils.log.info("ffmpeg - already running");
                        _this.ffmpeg_responses.push(response);
                    }
                    else {
                        var cmd = "ffmpeg -fflags nobuffer -probesize 256 -rtsp_transport tcp -i rtsp://127.0.0.1:".concat(_this.config.RTSPPort, "/").concat(_this.config.RTSPName, " -vframes 1  -r 1 -s 640x360 -y /dev/shm/snapshot.jpg");
                        var options = { timeout: 15000 };
                        utils.log.info("ffmpeg - starting");
                        _this.ffmpeg_responses.push(response);
                        _this.ffmpeg_process = (0, child_process_1.exec)(cmd, options, function (error, stdout, stderr) {
                            utils.log.info("ffmpeg - finished");
                            if (error) {
                                utils.log.warn('ffmpeg exec error: %s', error);
                            }
                            for (var _i = 0, _a = _this.ffmpeg_responses; _i < _a.length; _i++) {
                                var responseItem = _a[_i];
                                _this.deliver_jpg(responseItem);
                            }
                            _this.ffmpeg_responses = [];
                            _this.ffmpeg_process = null;
                        });
                    }
                }
                catch (err) {
                    utils.log.warn('Error ' + err);
                }
            }
            else {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].call(_this, request, response, next);
                }
            }
        });
    };
    MediaService.prototype.deliver_jpg = function (response) {
        try {
            var img = fs.readFileSync('/dev/shm/snapshot.jpg');
            response.writeHead(200, { 'Content-Type': 'image/jpg' });
            response.end(img, 'binary');
            return;
        }
        catch (err) {
            utils.log.debug("Error opening snapshot : %s", err);
        }
        try {
            var img = fs.readFileSync('./web/snapshot.jpg');
            response.writeHead(200, { 'Content-Type': 'image/jpg' });
            response.end(img, 'binary');
            return;
        }
        catch (err) {
            utils.log.debug("Error opening snapshot : %s", err);
        }
        response.writeHead(400, { 'Content-Type': 'text/plain' });
        response.end('JPEG unavailable');
    };
    MediaService.prototype.started = function () {
        this.camera.startRtsp();
    };
    MediaService.prototype.extendService = function () {
        var _this = this;
        var port = this.media_service.MediaService.Media;
        var cameraOptions = this.camera.options;
        var cameraSettings = this.camera.settings;
        var camera = this.camera;
        var h264Profiles = v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_profile.getLookupSet().map(function (ls) { return ls.desc; });
        h264Profiles.splice(1, 1);
        var videoConfigurationOptions = {
            QualityRange: {
                Min: 1,
                Max: 1
            },
            H264: {
                ResolutionsAvailable: cameraOptions.resolutions,
                GovLengthRange: {
                    Min: v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_i_frame_period.getRange().min,
                    Max: v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_i_frame_period.getRange().max
                },
                FrameRateRange: {
                    Min: cameraOptions.framerates[0],
                    Max: cameraOptions.framerates[cameraOptions.framerates.length - 1]
                },
                EncodingIntervalRange: { Min: 1, Max: 1 },
                H264ProfilesSupported: h264Profiles
            },
            Extension: {
                H264: {
                    ResolutionsAvailable: cameraOptions.resolutions,
                    GovLengthRange: {
                        Min: v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_i_frame_period.getRange().min,
                        Max: v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_i_frame_period.getRange().max
                    },
                    FrameRateRange: {
                        Min: cameraOptions.framerates[0],
                        Max: cameraOptions.framerates[cameraOptions.framerates.length - 1]
                    },
                    EncodingIntervalRange: { Min: 1, Max: 1 },
                    H264ProfilesSupported: h264Profiles,
                    BitrateRange: {
                        Min: cameraOptions.bitrates[0],
                        Max: cameraOptions.bitrates[cameraOptions.bitrates.length - 1]
                    }
                }
            }
        };
        var videoEncoderConfiguration = {
            attributes: {
                token: "encoder_config_token"
            },
            Name: "PiCameraConfiguration",
            UseCount: 0,
            Encoding: "H264",
            Resolution: {
                Width: cameraSettings.resolution.Width,
                Height: cameraSettings.resolution.Height
            },
            Quality: v4l2ctl_1.v4l2ctl.Controls.CodecControls.video_bitrate.value ? 1 : 1,
            RateControl: {
                FrameRateLimit: cameraSettings.framerate,
                EncodingInterval: 1,
                BitrateLimit: v4l2ctl_1.v4l2ctl.Controls.CodecControls.video_bitrate.value / 1000
            },
            H264: {
                GovLength: v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_i_frame_period.value,
                H264Profile: v4l2ctl_1.v4l2ctl.Controls.CodecControls.h264_profile.desc
            },
            Multicast: {
                Address: {
                    Type: "IPv4",
                    IPv4Address: "0.0.0.0"
                },
                Port: 0,
                TTL: 1,
                AutoStart: false
            },
            SessionTimeout: "PT1000S"
        };
        var videoSource = {
            attributes: {
                token: "video_src_token"
            },
            Framerate: 25,
            Resolution: { Width: 1920, Height: 1280 }
        };
        var videoSourceConfiguration = {
            Name: "Primary Source",
            UseCount: 0,
            attributes: {
                token: "video_src_config_token"
            },
            SourceToken: "video_src_token",
            Bounds: { attributes: { x: 0, y: 0, width: 1920, height: 1080 } }
        };
        var audioEncoderConfigurationOptions = {
            Options: []
        };
        var profile = {
            Name: "CurrentProfile",
            attributes: {
                token: "profile_token"
            },
            VideoSourceConfiguration: videoSourceConfiguration,
            VideoEncoderConfiguration: videoEncoderConfiguration,
            PTZConfiguration: this.ptz_service.ptzConfiguration1
        };

        var profile2 = {
            Name: "SecondProfile",
            attributes: {
              token: "profile_token_2"
            },
            VideoSourceConfiguration: videoSourceConfiguration,
            VideoEncoderConfiguration: videoEncoderConfiguration,
            PTZConfiguration: this.ptz_service.ptzConfiguration2
        };

        port.GetServiceCapabilities = function (args) {
            var GetServiceCapabilitiesResponse = {
                Capabilities: {
                    attributes: {
                        SnapshotUri: true,
                        Rotation: false,
                        VideoSourceMode: true,
                        OSD: false
                    },
                    ProfileCapabilities: {
                        attributes: {
                            MaximumNumberOfProfiles: 1
                        }
                    },
                    StreamingCapabilities: {
                        attributes: {
                            RTPMulticast: _this.config.MulticastEnabled,
                            RTP_TCP: true,
                            RTP_RTSP_TCP: true,
                            NonAggregateControl: false,
                            NoRTSPStreaming: false
                        }
                    }
                }
            };
            return GetServiceCapabilitiesResponse;
        };
        // port.GetStreamUri = function (args) {
        //     var rtspAddress = utils.getIpAddress();
        //     if (_this.config.RTSPAddress.length > 0)
        //         rtspAddress = _this.config.RTSPAddress;
        //     var GetStreamUriResponse = {
        //         MediaUri: {
        //             Uri: (args.StreamSetup.Stream == "RTP-Multicast" && _this.config.MulticastEnabled ?
        //                 "rtsp://".concat(rtspAddress, ":").concat(_this.config.RTSPPort, "/").concat(_this.config.RTSPMulticastName) :
        //                 "rtsp://".concat(rtspAddress, ":").concat(_this.config.RTSPPort, "/").concat(_this.config.RTSPName)),
        //             InvalidAfterConnect: false,
        //             InvalidAfterReboot: false,
        //             Timeout: "PT30S"
        //         }
        //     };
        //     return GetStreamUriResponse;
        // };

        port.GetStreamUri = function (args) {
            var rtspAddress = utils.getIpAddress();
            if (_this.config.RTSPAddress.length > 0)
                rtspAddress = _this.config.RTSPAddress;
        
            var streamName = _this.config.RTSPName;
            if (args.ProfileToken === "profile_token_2") {
                streamName = _this.config.RTSPAltName;
            }
    
            return {
                MediaUri: {
                    Uri: "rtsp://" + rtspAddress + ":" + _this.config.RTSPPort + "/" + streamName,
                    InvalidAfterConnect: false,
                    InvalidAfterReboot: false,
                    Timeout: "PT30S"
                }
            };
        };

        port.GetProfile = function (args) {
            if (args.ProfileToken === "profile_token_2") {
                return { Profile: profile2 };
            }
            return { Profile: profile };
        };
        port.GetProfiles = function (args) {
            var GetProfilesResponse = { Profiles: [profile, profile2] };
            return GetProfilesResponse;
        };
        port.CreateProfile = function (args) {
            var CreateProfileResponse = { Profile: profile };
            return CreateProfileResponse;
        };
        port.DeleteProfile = function (args) {
            var DeleteProfileResponse = {};
            return DeleteProfileResponse;
        };
        port.GetVideoSources = function (args) {
            var GetVideoSourcesResponse = { VideoSources: [videoSource] };
            return GetVideoSourcesResponse;
        };
        port.GetVideoSourceConfigurations = function (args) {
            var GetVideoSourceConfigurationsResponse = { Configurations: [videoSourceConfiguration] };
            return GetVideoSourceConfigurationsResponse;
        };
        port.GetVideoSourceConfiguration = function (args) {
            var GetVideoSourceConfigurationResponse = { Configurations: videoSourceConfiguration };
            return GetVideoSourceConfigurationResponse;
        };
        port.GetVideoEncoderConfigurations = function (args) {
            var GetVideoEncoderConfigurationsResponse = { Configurations: [videoEncoderConfiguration] };
            return GetVideoEncoderConfigurationsResponse;
        };
        port.GetVideoEncoderConfiguration = function (args) {
            var GetVideoEncoderConfigurationResponse = { Configuration: videoEncoderConfiguration };
            return GetVideoEncoderConfigurationResponse;
        };
        port.SetVideoEncoderConfiguration = function (args) {
            var settings = {
                bitrate: args.Configuration.RateControl.BitrateLimit,
                framerate: args.Configuration.RateControl.FrameRateLimit,
                gop: args.Configuration.H264.GovLength,
                profile: args.Configuration.H264.H264Profile,
                quality: args.Configuration.Quality instanceof Object ? 1 : args.Configuration.Quality,
                resolution: args.Configuration.Resolution
            };
            camera.setSettings(settings);
            var SetVideoEncoderConfigurationResponse = {};
            return SetVideoEncoderConfigurationResponse;
        };
        port.GetVideoEncoderConfigurationOptions = function (args) {
            var GetVideoEncoderConfigurationOptionsResponse = { Options: videoConfigurationOptions };
            return GetVideoEncoderConfigurationOptionsResponse;
        };
        port.GetGuaranteedNumberOfVideoEncoderInstances = function (args) {
            var GetGuaranteedNumberOfVideoEncoderInstancesResponse = {
                TotalNumber: 1,
                H264: 1
            };
            return GetGuaranteedNumberOfVideoEncoderInstancesResponse;
        };
        port.GetSnapshotUri = function (args) {
            var GetSnapshotUriResponse = {
                MediaUri: {
                    Uri: "http://" + utils.getIpAddress() + ":" + _this.config.ServicePort + "/web/snapshot.jpg",
                    InvalidAfterConnect: false,
                    InvalidAfterReboot: false,
                    Timeout: "PT30S"
                }
            };
            return GetSnapshotUriResponse;
        };
        port.GetAudioEncoderConfigurationOptions = function (args) {
            var GetAudioEncoderConfigurationOptionsResponse = { Options: [{}] };
            return GetAudioEncoderConfigurationOptionsResponse;
        };
        port.GetCompatibleVideoSourceConfigurations = function (args) {
            var GetCompatibleVideoSourceConfigurationsResponse = { Configurations: [videoSourceConfiguration] };
            return GetCompatibleVideoSourceConfigurationsResponse;
        };
        port.GetVideoSourceConfigurationOptions = function (Args) {
            var GetVideoSourceConfigurationOptionsResponse = {
                Options: {
                    BoundsRange: {
                        XRange: {
                            Min: 0,
                            Max: 0
                        },
                        YRange: {
                            Min: 0,
                            Max: 0
                        },
                        WidthRange: {
                            Min: 1920,
                            Max: 1920
                        },
                        HeightRange: {
                            Min: 1080,
                            Max: 1080
                        }
                    },
                    VideoSourceTokensAvailable: "video_src_token"
                }
            };
            return GetVideoSourceConfigurationOptionsResponse;
        };
    };
    return MediaService;
}(SoapService));
module.exports = MediaService;

//# sourceMappingURL=media_service.js.map
