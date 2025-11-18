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

// Import gRPC server functions
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the protobuf
const PROTO_PATH = path.join(__dirname, 'proto', 'camera.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const cameraProto = grpc.loadPackageDefinition(packageDefinition).camera;

// Implement the gRPC services
function getTelemetry(call, callback) {
  console.log('[DEBUG] gRPC server: getTelemetry called');
  try {
    const inclinoData = cmdClient.getInclinationData();
    const gpsData = cmdClient.getGPSVariables();
    const stmdData = cmdClient.getSTMDData();
    const movementData = cmdClient.getLastConvertedMovements();
    const rangeData = cmdClient.getRangeData();

    console.log('[DEBUG] gRPC server: Retrieved data from CommandClient');

    const response = {
      inclinoData: JSON.stringify(inclinoData),
      gpsData: JSON.stringify(gpsData),
      stmdData: JSON.stringify(stmdData),
      movementData: JSON.stringify(movementData),
      rangeData: JSON.stringify(rangeData),
    };

    console.log('[DEBUG] gRPC server: Sending response:', response);
    callback(null, response);
  } catch (error) {
    console.error('[ERROR] gRPC server: Error in getTelemetry:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function movePTZ(call, callback) {
  try {
    const { azimuth, elevation } = call.request;
    console.log('[DEBUG] gRPC server: movePTZ called with az:', azimuth, 'el:', elevation);
    cmdClient.setTargetPosition(azimuth, elevation, 1);
    callback(null, { success: true, message: 'PTZ moved successfully' });
  } catch (error) {
    console.error('Error in movePTZ:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function setZoom(call, callback) {
  try {
    const { level } = call.request;
    console.log('[DEBUG] gRPC server: setZoom called with level:', level);
    // Check if CommandClient has the required data before calling setZoom
    if (!cmdClient.latestOdData || !cmdClient.latestOdData.properties) {
      console.log('[DEBUG] gRPC server: latestOdData not available, cannot set zoom');
      callback(null, { success: false, message: 'Zoom data not available' });
      return;
    }
    cmdClient.setZoom(level);
    callback(null, { success: true, message: 'Zoom set successfully' });
  } catch (error) {
    console.error('Error in setZoom:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function getCurrentZoom(call, callback) {
  try {
    const zoom = cmdClient.getCurrentZoom() || 1;
    callback(null, { zoom: parseInt(zoom) });
  } catch (error) {
    console.error('Error in getCurrentZoom:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function setSpeed(call, callback) {
  try {
    const { speed } = call.request;
    cmdClient.setSpeed(speed);
    callback(null, { success: true, message: 'Speed set successfully' });
  } catch (error) {
    console.error('Error in setSpeed:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function setManualGps(call, callback) {
  try {
    const { latitude, longitude } = call.request;
    // Assuming CommandClient has a method for this
    console.log('Manual GPS set to:', latitude, longitude);
    callback(null, { success: true, message: 'Manual GPS set successfully' });
  } catch (error) {
    console.error('Error in setManualGps:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function getCrossPositions(call, callback) {
  try {
    const { zoom } = call.request;
    console.log('[DEBUG] gRPC server: getCrossPositions called with zoom:', zoom);
    // Check if latestOdData and properties exist before calling getEncCrctZoomAz/El
    if (!cmdClient.latestOdData || !cmdClient.latestOdData.properties) {
      console.log('[DEBUG] gRPC server: latestOdData not available for cross positions');
      callback(null, { x: 0, y: 0 }); // Return default values if data not available
      return;
    }
    const x = cmdClient.getEncCrctZoomAz(zoom);
    const y = cmdClient.getEncCrctZoomEl(zoom);
    console.log('[DEBUG] gRPC server: Cross positions x:', x, 'y:', y);
    callback(null, { x: parseInt(x), y: parseInt(y) });
  } catch (error) {
    console.error('Error in getCrossPositions:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function getPTZPosition(call, callback) {
  try {
    const az = cmdClient.getCrctEncoderAz();
    const el = cmdClient.getCrctEncoderEl();
    callback(null, { az: parseInt(az), el: parseInt(el) });
  } catch (error) {
    console.error('Error in getPTZPosition:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function sendControl(call, callback) {
  try {
    const { prop, key, value } = call.request;
    console.log('[DEBUG] gRPC server: sendControl called with', prop, key, value);
    // Assuming CommandClient has methods like setControl or direct property setting
    if (prop === 'UserControls') {
      // Map to CommandClient methods or set global
      switch (key) {
        case 'day_zoom': cmdClient.setDayZoom(parseInt(value)); break;
        case 'digital_zoom': cmdClient.setDigitalZoom(parseInt(value)); break;
        case 'palette': cmdClient.setPalette(value === '1' ? 'blackhot' : 'whitehot'); break;
        case 'brightness': cmdClient.setBrightness(parseInt(value)); break;
        case 'contrast': cmdClient.setContrast(parseInt(value)); break;
        case 'alphaD1': cmdClient.setAlphaD1(parseInt(value)); break;
        case 'alphaD2': cmdClient.setAlphaD2(parseInt(value)); break;
        default: console.warn('Unknown control key:', key);
      }
    }
    callback(null, { success: true, message: 'Control sent' });
  } catch (error) {
    console.error('Error in sendControl:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

function setPTZDirection(call, callback) {
  try {
    const { direction, start } = call.request;
    console.log('[DEBUG] gRPC server: setPTZDirection called with', direction, start);
    // Map directions to CommandClient methods
    const methodMap = {
      'ptz_up': 'setPTZUp',
      'ptz_down': 'setPTZDown',
      'ptz_left': 'setPTZLeft',
      'ptz_right': 'setPTZRight',
      'ptz_middle': 'setPTZMiddle',
      'north_connect': 'setNorthConnect',
      'near_focus': 'setNearFocus',
      'far_focus': 'setFarFocus',
      'range_finder': 'setRangeFinder'
    };
    const method = methodMap[direction];
    if (method && cmdClient[method]) {
      cmdClient[method](start);
    } else {
      console.warn('Unknown PTZ direction:', direction);
    }
    callback(null, { success: true, message: 'PTZ direction set' });
  } catch (error) {
    console.error('Error in setPTZDirection:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
}

// Create the gRPC server
const grpcServer = new grpc.Server();

// Add the CameraService
grpcServer.addService(cameraProto.CameraService.service, {
  GetTelemetry: getTelemetry,
  MovePTZ: movePTZ,
  SetZoom: setZoom,
  GetCurrentZoom: getCurrentZoom,
  SetSpeed: setSpeed,
  SetManualGps: setManualGps,
  GetCrossPositions: getCrossPositions,
  GetPTZPosition: getPTZPosition,
  SendControl: sendControl,
  SetPTZDirection: setPTZDirection,
});

// Bind and start the gRPC server
const grpcPort = '0.0.0.0:50051';
grpcServer.bindAsync(grpcPort, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind gRPC server:', err);
    return;
  }
  console.log('gRPC server running on port 50051');
  grpcServer.start();
});

process.on('SIGINT', () => {
    cmdClient.shutdown();
    grpcServer.tryShutdown(() => {
      console.log('gRPC server shut down');
      process.exit();
    });
});
process.on('SIGTERM', () => {
    cmdClient.shutdown();
    grpcServer.tryShutdown(() => {
      console.log('gRPC server shut down');
      process.exit();
    });
});


//# sourceMappingURL=rpos.js.map
