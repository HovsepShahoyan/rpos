"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/extension");
var http = require("http");
var express = require("express");
var fs = require("fs");
var session = require("express-session");
var bodyParser = require("body-parser");
var os = require("os");
var utils_1 = require("./lib/utils");
var Camera = require("./lib/camera");
var PTZDriver = require("./lib/PTZDriver");
var DeviceService = require("./services/device_service");
var MediaService = require("./services/media_service");
var PTZService = require("./services/ptz_service");
var ImagingService = require("./services/imaging_service");
var DiscoveryService = require("./services/discovery_service");
var LoginTracker = require("./lib/loginTracker");
var process_1 = require("process");
var utils = utils_1.Utils.utils;
var pjson = require("./package.json");
var configFile = './rposConfig.json';
var ptr = 0;
var remaining = process.argv.length;
ptr += 2;
remaining -= 2;

const users = {
  admin: { password: 'admin', role: 'admin' },
  user1: { password: 'user1', role: 'user' }
  // add more users as needed
};


console.log("\n✅✅✅ RPOS started — console.log IS WORKING ✅✅✅\n");
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

webserver.use(bodyParser.urlencoded({ extended: false }));
webserver.use(bodyParser.json());
webserver.use(session({
  secret: 'rpos_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

function authMiddleware(req, res, next) {
  if (req.session && req.session.authenticated) {
    next();
  } else if (
    req.path === '/login' ||
    req.path === '/login.html' ||
    req.path === '/login.ntl' ||
    req.path.startsWith('/api/')
  ) {
    next();
  } else {
    res.redirect('/login');
  }
}

webserver.use(authMiddleware);

// Login routes
webserver.get('/login', function(req, res) {
  res.render('login.ntl');
});

webserver.post('/login', function(req, res) {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // Look up user
  const userRecord = users[username];
  if (userRecord && userRecord.password === password) {
    // Successful login
    req.session.authenticated = true;
    // store username and role in session
    req.session.user = { username: username, role: userRecord.role };
    loginTracker.logAttempt(username, true, ipAddress);
    res.redirect('/');
  } else {
    // Failed login
    loginTracker.logAttempt(username, false, ipAddress);
    res.redirect('/login?error=1');
  }
});

webserver.get('/api/loginAttempts', function (req, res) {
  // Require admin role
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    // Optionally log attempts to access logs by non-admins
    console.warn('Unauthorized attempt to access /api/loginAttempts from', req.ip, 'sessionUser=', req.session && req.session.user);
    return res.status(403).json({ error: 'Forbidden' });
  }

  const filePath = '/tmp/login_attempts.json';
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "login_attempts.json not found" });
  }
});

webserver.post('/api/updateCameraName', (req, res) => {
    const name = req.body.name;
    if (!name) return res.json({ success: false, error: 'No name provided' });
    try {
        let configData = fs.readFileSync(configFile, 'utf8');
        let configJson = JSON.parse(configData);
        if (!configJson.DeviceInformation) configJson.DeviceInformation = {};
        configJson.DeviceInformation.Model = name;
        fs.writeFileSync(configFile, JSON.stringify(configJson, null, 2));
        res.json({ success: true });
    } catch (e) {
        return res.json({ success: false, error: 'Failed to update config' });
    }
});

httpserver.listen(config.ServicePort);
var ptz_driver = new PTZDriver(config);
var camera = new Camera(config, webserver);
var device_service = new DeviceService(config, httpserver, ptz_driver.process_ptz_command);
var ptz_service = new PTZService(config, httpserver, ptz_driver.process_ptz_command, ptz_driver);
var imaging_service = new ImagingService(config, httpserver, ptz_driver.process_ptz_command);
var media_service = new MediaService(config, httpserver, camera, ptz_service);
var discovery_service = new DiscoveryService(config);
var loginTracker = new LoginTracker();

device_service.start();
media_service.start();
ptz_service.start();
imaging_service.start();
discovery_service.start();

const cmdClient = require('./lib/CommandClient');

process.on('SIGINT', () => {
    cmdClient.shutdown();
    process.exit();
});
process.on('SIGTERM', () => {
    cmdClient.shutdown();
    process.exit();
});


//# sourceMappingURL=rpos.js.map
