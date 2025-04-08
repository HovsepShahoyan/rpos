"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/extension");
var http = require("http");
var express = require("express");
var fs = require("fs");
var os = require("os");
var utils_1 = require("./lib/utils");
var Camera = require("./lib/camera");
var PTZDriver = require("./lib/PTZDriver");
var DeviceService = require("./services/device_service");
var MediaService = require("./services/media_service");
var PTZService = require("./services/ptz_service");
var ImagingService = require("./services/imaging_service");
var DiscoveryService = require("./services/discovery_service");
var process_1 = require("process");
var utils = utils_1.Utils.utils;
var pjson = require("./package.json");
var configFile = './rposConfig.json';
var ptr = 0;
var remaining = process.argv.length;
ptr += 2;
remaining -= 2;
while (remaining > 0) {
    if (process.argv[ptr] == '--help' || process.argv[ptr] == '-h') {
        console.log("RPOS ONVIF Server\r\n");
        console.log("  -h  --help                      Show Commands");
        console.log("      --config <json filename>    Config Filename");
        (0, process_1.exit)();
    }
    else if (process.argv[ptr] == '--config' && remaining >= 2) {
        configFile = process.argv[ptr + 1];
        ptr += 2;
        remaining -= 2;
    }
    else {
        ptr += 1;
        remaining -= 1;
    }
}
var data = fs.readFileSync(configFile, 'utf8');
if (typeof data == 'string' && data.charCodeAt(0) === 0xFEFF) {
    data = data.slice(1);
}
var config = JSON.parse(data);
utils.log.level = config.logLevel;
config.DeviceInformation = config.DeviceInformation || {};
if (utils.isPi()) {
    var model = require('rpi-version')();
    if (config.DeviceInformation.Manufacturer == undefined)
        config.DeviceInformation.Manufacturer = 'RPOS Raspberry Pi';
    if (config.DeviceInformation.Model == undefined)
        config.DeviceInformation.Model = model;
}
if (utils.isMac()) {
    var macosRelease = require('macos-release');
    if (config.DeviceInformation.Manufacturer == undefined)
        config.DeviceInformation.Manufacturer = 'RPOS AppleMac';
    if (config.DeviceInformation.Model == undefined)
        config.DeviceInformation.Model = macosRelease()['name'] + ' ' + macosRelease()['version'];
}
if (utils.isWindows()) {
    if (config.DeviceInformation.Manufacturer == undefined)
        config.DeviceInformation.Manufacturer = 'RPOS Windows';
    if (config.DeviceInformation.Model == undefined)
        config.DeviceInformation.Model = os.version;
}
if (config.DeviceInformation.Manufacturer == undefined)
    config.DeviceInformation.Manufacturer = 'RPOS';
if (config.DeviceInformation.Model == undefined)
    config.DeviceInformation.Model = 'RPOS';
if (config.DeviceInformation.SerialNumber == undefined)
    config.DeviceInformation.SerialNumber = utils.getSerial();
if (config.DeviceInformation.FirmwareVersion == undefined)
    config.DeviceInformation.FirmwareVersion = pjson.version;
if (config.DeviceInformation.HardwareId == undefined)
    config.DeviceInformation.HardwareId = '1001';
utils.setConfig(config);
utils.testIpAddress();
for (var i in config.DeviceInformation) {
    utils.log.info("%s : %s", i, config.DeviceInformation[i]);
}
var webserver = express();
var httpserver = http.createServer(webserver);
httpserver.listen(config.ServicePort);
var ptz_driver = new PTZDriver(config);
var camera = new Camera(config, webserver);
var device_service = new DeviceService(config, httpserver, ptz_driver.process_ptz_command);
var ptz_service = new PTZService(config, httpserver, ptz_driver.process_ptz_command, ptz_driver);
var imaging_service = new ImagingService(config, httpserver, ptz_driver.process_ptz_command);
var media_service = new MediaService(config, httpserver, camera, ptz_service);
var discovery_service = new DiscoveryService(config);
device_service.start();
media_service.start();
ptz_service.start();
imaging_service.start();
discovery_service.start();

//# sourceMappingURL=rpos.js.map
