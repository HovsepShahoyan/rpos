-"use strict";
var utils_1 = require("./utils");
var fs = require("fs");
const { exec } = require('child_process');
const archiver = require('archiver');
const path = require('path');
var parser = require("body-parser");
const { spawn } = require('child_process');
var v4l2ctl_1 = require("./v4l2ctl"); 
const rtspEvents = require('./rtspEvents');
const commandClient = require('./CommandClient');
const express = require('express');

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

        webserver.use('/maptiles', (req, res, next) => {
          try {
            console.log('[maptiles] req:', req.method, req.originalUrl);
            // remove leading slash and split
            const parts = req.path.split('/').filter(Boolean);
            if (parts.length >= 3) {
              const z = parts[0];
              const x = parts[1];
              // yPart might contain slashes if there are further segments (rare), so join them back
              const yPart = parts.slice(2).join('/');
              // Candidate file names on disk:
              const candidates = [
                // exact as asked (could be without ext if request had no ext)
                path.join('/home/jetson/map', z, x, yPart),
                // with common extensions
                path.join('/home/jetson/map', z, x, yPart + '.png'),
                path.join('/home/jetson/map', z, x, yPart + '.jpg'),
                // if request included .png/.jpg but disk file has no ext, try stripping extension from yPart
                (() => {
                  const stripped = yPart.replace(/\.(png|jpg|jpeg)$/i, '');
                  return path.join('/home/jetson/map', z, x, stripped);
                })()
              ];
              for (const p of candidates) {
                if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                  console.log('[maptiles] serving ->', p);
                  return res.sendFile(p);
                }
              }
            }
          } catch (err) {
            console.error('[maptiles] handler error', err);
          }
          // nothing matched — continue to static fallback (if configured)
          next();
        });
        // static fallback (also keep this)
        webserver.use('/maptiles', express.static('/home/jetson/map'));

        webserver.use('/terrain', (req, res, next) => {
          try {
            console.log('[terrain] req:', req.method, req.originalUrl);
            const parts = req.path.split('/').filter(Boolean);
            
            // Handle metadata.json request
            if (parts[parts.length - 1] === 'metadata.json') {
              const metadataPath = path.join('/home/jetson/map_hgt_terrain', 'metadata.json');
              if (fs.existsSync(metadataPath)) {
                console.log('[terrain] serving metadata.json');
                return res.sendFile(metadataPath);
              }
            }
            
            // Handle tile requests: /terrain/{z}/{x}/{y}.png or similar
            if (parts.length >= 3) {
              const z = parts[0];
              const x = parts[1];
              const yPart = parts.slice(2).join('/');
              
              const candidates = [
                path.join('/home/jetson/map_hgt_terrain', z, x, yPart),
                path.join('/home/jetson/map_hgt_terrain', z, x, yPart + '.png'),
                path.join('/home/jetson/map_hgt_terrain', z, x, yPart + '.terrain'),
                path.join('/home/jetson/map_hgt_terrain', z, x, yPart.replace(/\.(png|terrain)$/i, ''))
              ];
              
              for (const p of candidates) {
                if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                  console.log('[terrain] serving ->', p);
                  // Set appropriate content type for terrain tiles
                  if (p.endsWith('.terrain') || p.includes('/terrain/')) {
                    res.setHeader('Content-Type', 'application/vnd.mapbox-terrain-v2');
                  }
                  return res.sendFile(p);
                }
              }
            }
          } catch (err) {
            console.error('[terrain] handler error', err);
          }
          next();
        });

        // Static fallback for terrain
        webserver.use('/terrain', express.static('/home/jetson/map_hgt_terrain'));

        webserver.get('/api/angles', (req, res) => {
            const fs = require('fs');
            const filePath = '/tmp/overlay_angles.json';
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.log('File read error:', err);
                    res.status(404).json({ error: 'File not found' });
                } else {
                    try {
                        const json = JSON.parse(data);
                        res.json(json);
                    } catch (e) {
                        console.log('JSON parse error:', e);
                        res.status(500).json({ error: 'Invalid JSON' });
                    }
                }
            });
        });

        webserver.get('/api/distance', (req, res) => {
            const fs = require('fs');
            const filePath = '/tmp/overlay_distance.json';
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    res.status(404).json({ error: 'File not found' });
                } else {
                    try {
                        const json = JSON.parse(data);
                        res.json(json);
                    } catch (e) {
                        res.status(500).json({ error: 'Invalid JSON' });
                    }
                }
            });
        });

      webserver.use('/tmp', express.static(path.join(__dirname, 'tmp')));
      webserver.use('/tmp', express.static('/tmp'));

      ['active_cross1.png', 'active_cross2.png'].forEach(file => {
        const filePath = path.join(__dirname, 'tmp', file);
        
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
        } else {
          console.log(`✗ Server: Missing ${file}`);
          
          const altPath1 = path.join(process.cwd(), 'tmp', file);
          const altPath2 = `/tmp/${file}`;
          
        }
      });

      webserver.get('/tmp/active_cross1.png', (req, res) => {
        const filePath = path.resolve(__dirname, 'tmp', 'active_cross1.png');
        if (!fs.existsSync(filePath)) {
          console.error('Server: File missing:', filePath);
          return res.status(404).send('File not found');
        }
        res.sendFile(filePath, (err) => {
          if (err) {
            console.error('Server: Error sending file', err);
            res.status(500).send('Server error');
          } else {
          }
        });
      });

      webserver.get('/tmp/active_cross2.png', (req, res) => {
        const filePath = path.join(__dirname, 'tmp', 'active_cross2.png');
        
        res.sendFile(filePath, (err) => {
          if (err) {
            console.error('Server: Error serving file:', err);
            res.status(404).send('File not found');
          } else {
          }
        });
      });

        webserver.get('/api/downloadScreenshots', function(req, res) {
            const zipPath = '/tmp/screenshots/screenshot.zip';
            res.download(zipPath, 'screenshots.zip', (err) => {
                if (err) {
                console.error('Download failed:', err);
                res.status(500).send('Could not download screenshots');
                }
            });
        });

        webserver.get('/api/loginAttempts', (req, res) => {
            const filePath = '/tmp/login_attempts.json';
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).json({ error: "login_attempts.json not found" });
            }
        });


        webserver.get('/api/downloadLoginAttempts', async function (req, res) {
            if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
                console.warn('Unauthorized download attempt to /api/downloadLoginAttempts from', req.ip, 'sessionUser=', req.session && req.session.user);
                return res.status(403).send('Forbidden');
            }

            const filePath = '/tmp/login_attempts.json';
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'login_attempts.json not found' });
            }

            const { from, to } = req.query;

            function parseBoundaryDate(val, isStart) {
                if (!val) return null;
                if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                    if (isStart) return new Date(val + 'T00:00:00');
                    return new Date(val + 'T23:59:59.999');
                }
                const d = new Date(val);
                if (isNaN(d.getTime())) return null;
                return d;
            }

            const fromDate = parseBoundaryDate(from, true);
            const toDate   = parseBoundaryDate(to, false);

            if (!fromDate && !toDate) {
                return res.download(filePath, 'login_attempts.json', function (err) {
                    if (err) {
                        console.error('Download failed:', err);
                        if (!res.headersSent) res.status(500).send('Could not download login attempts');
                    }
                });
            }

            try {
                const raw = await fsp.readFile(filePath, 'utf8');
                let parsed;
                try {
                    parsed = JSON.parse(raw);
                } catch (parseErr) {
                    console.error('Failed to parse login_attempts.json', parseErr);
                    return res.status(500).json({ error: 'Failed to parse login_attempts.json' });
                }

                let attempts = [];
                if (Array.isArray(parsed)) attempts = parsed.slice();
                else if (parsed && Array.isArray(parsed.attempts)) attempts = parsed.attempts.slice();
                else {
                    const found = Object.values(parsed).find(v => Array.isArray(v));
                    attempts = found ? found.slice() : [];
                }

                if (!attempts.length) {
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Content-Disposition', `attachment; filename="login_attempts_${from || 'start'}_to_${to || 'end'}.json"`);
                    return res.send(JSON.stringify([], null, 2));
                }

                const filtered = attempts.filter(item => {
                    if (!item || !item.timestamp) return false;
                    const t = Date.parse(item.timestamp);
                    if (isNaN(t)) return false;
                    if (fromDate && t < fromDate.getTime()) return false;
                    if (toDate   && t > toDate.getTime()) return false;
                    return true;
                });

                const safeFrom = from ? from.replace(/[^0-9T:\-]/g,'') : 'start';
                const safeTo   = to   ? to.replace(/[^0-9T:\-]/g,'') : 'end';
                const filename = `login_attempts_${safeFrom}_to_${safeTo}.json`;

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                return res.send(JSON.stringify(filtered, null, 2));
            } catch (err) {
                console.error('Error while building ranged download', err);
                if (!res.headersSent) return res.status(500).json({ error: 'Server error while preparing download' });
            }
        });

    webserver.post('/api/setResolution', (req, res) => {
        let width = 1920, height = 1080;
        if (req.body && req.body.width && req.body.height) {
            width = parseInt(req.body.width, 10);
            height = parseInt(req.body.height, 10);
        }
        fs.writeFile('/tmp/resolution.json', JSON.stringify({ width, height }), (err) => {
            if (err) {
                res.json({ success: false, error: err.message });
                return;
            }
            try {
                if (this.settings && this.settings.resolution) {
                    this.settings.resolution.Width = width;
                    this.settings.resolution.Height = height;
                }

                const commandClient = require('./CommandClient');
                if (typeof commandClient.setResolution === 'function') {
                    commandClient.setResolution({ width, height });
                }
                res.json({ success: true });
            } catch (e) {
                res.json({ success: false, error: e.message });
            }
        });
    });

    webserver.post('/api/ptzMove', (req, res) => {
        console.log('PTZ Move request received:', req.body);
        const az = parseInt(req.body.az, 10);
        const el = parseInt(req.body.el, 10);
        console.log('Parsed az:', az, 'el:', el);
        if (!isNaN(az) && !isNaN(el)) {
            const commandClient = require('./CommandClient');
            console.log('Calling commandClient.setTargetPosition with:', az, el, 1);
            commandClient.setTargetPosition(az, el, 1);
            res.json({ success: true });
        } else {
            console.log('Invalid az or el values');
            res.status(400).json({ error: 'Invalid az or el' });
        }
    });

    webserver.post('/api/setSpeed', (req, res) => {
        const { speed } = req.body;
        if (typeof speed === 'number' && speed >= 1 && speed <= 8) {
            const value = speed * 0.125;
            const commandClient = require('./CommandClient');
            commandClient.calculateAndSetSpeed(value);
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid speed' });
        }
    });

    webserver.get('/api/currentZoom', (req, res) => {
        const zoom = global.currentStream === 1 ? (global.currentDayZoom || 1) : (global.currentIRZoom || 1);
        res.json({ zoom });
    });

    webserver.post('/api/setCurrentStream', (req, res) => {
        const { stream } = req.body;
        if (typeof stream === 'number' && (stream === 1 || stream === 2)) {
            global.currentStream = stream;
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid stream' });
        }
    });

    webserver.get('/api/crossPositions', (req, res) => {
        const zoom = parseInt(req.query.zoom) || 1;
        const commandClient = require('./CommandClient');
        const x = commandClient.getEncCrctZoomAz(zoom);
        const y = commandClient.getEncCrctZoomEl(zoom);
        res.json({ x, y });
    });

    webserver.post('/api/setZoomLevel', (req, res) => {
        const { level } = req.body;
        if (typeof level === 'number' && level >= 1 && level <= 6) {
            global.currentDayZoom = level;
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Invalid level' });
        }
    });

    webserver.get('/api/ptzPosition', (req, res) => {
        const commandClient = require('./CommandClient');
        const az = parseInt(commandClient.getCrctEncoderAz(), 10);
        const el = parseInt(commandClient.getCrctEncoderEl(), 10);
        res.json({ az, el });
    });

    webserver.post('/api/scheduleReboot', function (req, res) {

        if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
            console.warn('Unauthorized scheduleReboot attempt from', req.ip, 'sessionUser=', req.session && req.session.user);
            return res.status(403).send('Forbidden');
        }

        var time = (req.body && (req.body.time || req.body['time'])) || null;
        var password = (req.body && (req.body.password || req.body['password'])) || '';
        var scriptPath = (req.body && req.body.scriptPath) || (req.body && req.body['scriptPath']) || '';
        var runAs = (req.body && req.body.runAs) || (req.body && req.body['runAs']) || 'root';

        if (!time && req.rawBody) {
            try {
                var tmp = JSON.parse(req.rawBody);
                if (tmp && tmp.time) time = tmp.time;
                if (!password && tmp && tmp.password) password = tmp.password;
                if (!scriptPath && tmp && tmp.scriptPath) scriptPath = tmp.scriptPath;
            } catch (e) {
                var pairs = req.rawBody.split('&');
                for (var i = 0; i < pairs.length; i++) {
                    var kv = pairs[i].split('=');
                    if (kv.length === 2) {
                        var k = decodeURIComponent(kv[0]);
                        var v = decodeURIComponent(kv[1].replace(/\+/g,' '));
                        if (k === 'time' && !time) time = v;
                        if (k === 'password' && !password) password = v;
                        if (k === 'scriptPath' && !scriptPath) scriptPath = v;
                    }
                }
            }
        }

        if (!time || typeof time !== 'string') {
            console.warn('scheduleReboot: missing time after parsing');
        }

        var rebootDate = null;
        var diffMinutes = null;
        if (time && typeof time === 'string') {
            rebootDate = new Date(time);
            if (isNaN(rebootDate.getTime())) {
                var isoLike = time.replace(' ', 'T');
                rebootDate = new Date(isoLike);
                if (isNaN(rebootDate.getTime())) {
                    return res.status(400).json({ error: 'Failed to parse time' });
                }
            }
            var now = new Date();
            var diffMs = rebootDate.getTime() - now.getTime();
            diffMinutes = Math.ceil(diffMs / 60000);
            if (diffMinutes <= 0) diffMinutes = 1;
        }

        if (!scriptPath || typeof scriptPath !== 'string' || scriptPath[0] !== '/') {
            console.warn('Invalid scriptPath (must be absolute):', scriptPath);
            return res.status(400).json({ error: 'scriptPath must be an absolute path (e.g. /home/jetson/rpos/rpos.js)' });
        }

        var scriptDir = path.dirname(scriptPath);
        var scriptBase = path.basename(scriptPath);

        var svcName = 'rpos.service';
        var svcPath = '/etc/systemd/system/' + svcName;
        var svcLog = '/var/log/rpos.service.log';

        function esc(s) { return String(s).replace(/'/g, "'\"'\"'"); }

        var disableKeyringCommands = '';
        if (runAs && runAs !== 'root') {
            var userHome = '/home/' + runAs;
            var autostartDir = userHome + '/.config/autostart';
            var desktopContent = '[Desktop Entry]\nHidden=true\nX-GNOME-Autostart-enabled=false\n';
            disableKeyringCommands =
                'mkdir -p ' + esc(autostartDir) + ' && ' +
                'cat > ' + esc(autostartDir + '/gnome-keyring-secrets.desktop') + " <<'EOF'\n" + desktopContent + "EOF\n" +
                'cat > ' + esc(autostartDir + '/gnome-keyring-ssh.desktop') + " <<'EOF'\n" + desktopContent + "EOF\n" +
                'cat > ' + esc(autostartDir + '/gnome-keyring-pkcs11.desktop') + " <<'EOF'\n" + desktopContent + "EOF\n" +
                'chown -R ' + esc(runAs + ':' + runAs) + ' ' + esc(autostartDir) + ' || true\n';
        }

        var envPath = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/jetson/.local/bin:/home/jetson/miniconda3/bin:/home/jetson/anaconda3/bin';
        
            var serviceContent =
        "[Unit]\n" +
        "Description=RPOS persistent service (installed by webserver)\n" +
        "After=network-online.target local-fs.target\n" +
        "Wants=network-online.target\n\n" +
        "[Service]\n" +
        "Type=simple\n" +
        "WorkingDirectory=" + esc(scriptDir) + "\n" +
        "Environment=PATH=" + envPath + "\n" +
        "Environment=PYTHONPATH=/home/jetson/.local/lib/python3.8/site-packages:/usr/local/lib/python3.8/site-packages\n" +
        "ExecStart=" + esc(scriptPath) + "\n" +
        "Restart=no\n" +
        "StandardOutput=append:" + svcLog + "\n" +
        "StandardError=append:" + svcLog + "\n\n" +
        "[Install]\n" +
        "WantedBy=multi-user.target\n";

        var wrapper = ''
            + "cat > " + esc(svcPath) + " <<'UNIT_EOF'\n"
            + serviceContent
            + "UNIT_EOF\n"
            + (disableKeyringCommands ? (disableKeyringCommands + ' && ') : '')
            + "/bin/systemctl daemon-reload && /bin/systemctl enable " + svcName + " && /bin/systemctl start " + svcName
            + (diffMinutes ? (" && /sbin/shutdown -r +" + diffMinutes) : '');

        var cleanEnv = Object.assign({}, process.env);
        delete cleanEnv.GNOME_KEYRING_CONTROL;
        delete cleanEnv.GNOME_KEYRING_PID;
        delete cleanEnv.DBUS_SESSION_BUS_ADDRESS;
        delete cleanEnv.XDG_RUNTIME_DIR;
        delete cleanEnv.DISPLAY;
        delete cleanEnv.XAUTHORITY;

        var child = spawn('sudo', ['-S', 'bash', '-lc', wrapper], { stdio: ['pipe', 'pipe', 'pipe'], env: cleanEnv });

        var stdout = '';
        var stderr = '';
        child.stdout.on('data', function (d) { stdout += d.toString(); });
        child.stderr.on('data', function (d) { stderr += d.toString(); });

        if (password && password.length > 0) {
            try { child.stdin.write(password + '\n'); } catch (e) { console.warn('Failed writing sudo password to stdin:', e && e.message); }
        }
        try { child.stdin.end(); } catch (e) {}

        child.on('error', function (err) {
            console.error('spawn error installing persistent service / scheduling reboot:', err);
            return res.status(500).json({ error: 'Failed to start privileged wrapper', details: err.message });
        });

        child.on('close', function (code) {
            if (code === 0) {
                return res.json({
                    ok: true,
                    message: 'Persistent rpos.service installed and started. Reboot scheduled: ' + (diffMinutes ? ('yes, in ' + diffMinutes + ' minute(s)') : 'no'),
                    service: svcPath,
                    log: svcLog
                });
            } else {
                return res.status(500).json({
                    error: 'Failed installing/starting service or scheduling reboot',
                    code: code,
                    stderr: stderr,
                    stdout: stdout
                });
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
        global.currentIRZoom = 1;
        global.currentStream = 1; // 1=day, 2=ir
        this.rtspServer = null;

        // 2) *Wire up* the events inside the constructor so `this` is correct:
        rtspEvents.on('kill-rtsp', () => {
            this.killRtspServer();
        });
        rtspEvents.on('respawn-rtsp', () => {
            this.respawnRtspServer();
        });
        
        if (this.config.RTSPServer != 0) {
            if (this.config.CameraType == 'usbcam') {
                if (this.config.RTSPServer != 3) {
                    process.exit(1);
                }
                if (!fs.existsSync(this.config.CameraDevice)) {
                    process.exit(1);
                }
            }
            if (this.config.CameraType == 'filesrc') {
                if (this.config.RTSPServer != 3) {
                    process.exit(1);
                }
                if (!fs.existsSync(this.config.CameraDevice)) {
                    process.exit(1);
                }
            }
            if (this.config.CameraType == 'testsrc') {
                if (this.config.RTSPServer != 3) {
                    process.exit(1);
                }
            }
            if (this.config.CameraType == 'picam') {
                if (!fs.existsSync("/dev/video0")) {
                    if (utils.isPi()) {
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
        // Serve Svelte frontend static files
        this.webserver.use(express.static(path.join(__dirname, '../frontend/public')));

        this.webserver.set('views', './views');
        this.webserver.set('view engine', 'ntl');
        this.webserver.get('/', function (req, res) {
            res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
        });
        this.webserver.post('/', function (req, res) {
            for (var par in req.body) {
                var g = par.split('.')[0];
                var p = par.split('.')[1];
                if (p && g && p != "saturation" && p != "color_effects" && p != "blue_balance" && p != "horizontal_flip" && p != "vertical_flip" && p != "power_line_frequency" && p != "sharpness" && p != "color_effects_cbcr" && p != "rotate" && p != "red_balance" && p != "username" && p != "password") {
    var prop = v4l2ctl_1.v4l2ctl.Controls[g][p];
    if (prop) {
        var val = req.body[par];
        if (val instanceof Array)
            val = val.pop();
        prop.value = val;
        if (prop.isDirty) {
            utils.log.debug("Property %s changed to %s", par, prop.value);
        }
        // Update global zoom level for day_zoom
        if (g === 'UserControls' && p === 'day_zoom') {
            const value = parseInt(val);
            const dayZoomValues = [1, 5, 15, 30, 60, 68];
            const index = dayZoomValues.indexOf(value);
            if (index !== -1) {
                global.currentDayZoom = index + 1;
            }
        }
        // Update global zoom level for digital_zoom (IR)
        if (g === 'UserControls' && p === 'digital_zoom') {
            const value = parseInt(val);
            const irZoomValues = [1, 2, 4, 8];
            const index = irZoomValues.indexOf(value);
            if (index !== -1) {
                global.currentIRZoom = index + 1;
            }
        }
    } else {
        utils.log.warn("Control %s not found", par);
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
                download_screenshots: "Download Screenshots",
                default_configuration: "Default Configuration"
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
                    if (lowerLabel.includes("north")) {
                        html += `<div class="settings-row">
                                 <div class="settings-label">${label}</div>
                                 <button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Connect</button>
                                 </div>`;
                    }
                    if (lowerLabel.includes("range")) {
                        html += `<div class="settings-row">
                                <div class="settings-label">${label}</div>
                                <button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Measure</button>
                                </div>`; 
                    }
                    if (lowerLabel.includes("ethernet")) {
                        html += `<div class="settings-row">
                                <div class="settings-label">${label}</div>
                                <button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Ethernet Set</button>
                                </div>`; 
                    }
                    if (lowerLabel.includes("configuration")) {
                        html += `<div class="settings-row">
                                <div class="settings-label">${label}</div>
                                <button type="button" class="standard-button" ${generateMouseEvents(propname, uc)}>Default Configuration</button>
                                </div>`; 
                    }
                    if (lowerLabel.includes("download")) {
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

                if (p.controlType === "Text")
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
                if (p.type === "Boolean") {
                    html += `<div class="settings-row"><div class="settings-label">${label}</div>
                        <input type="hidden" name="${propname}.${uc}" value="false" />
                        <input type="checkbox" name="${propname}.${uc}" value="true" ${p.value ? 'checked' : ''} aria-label="${label}" /></div>`;
                    continue;
                }
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

                html += `<div class="settings-row"><div class="settings-label">${label}</div>
                    <input type="text" name="${propname}.${uc}" value="${p.value}" aria-label="${label}" />`;
                if (p.hasRange) {
                    const r = p.getRange();
                    html += `<span class="range-info">(min: ${r.min} max: ${r.max})</span>`;
                }
                html += `</div>`;
            }

            if (focusMinus || focusPlus) {
                html += `<div class="settings-row"><div class="settings-label">Focus:</div>
                    <div class="inline-buttons">${focusMinus}${focusPlus}</div></div>`;
            }

            if (zoomMinus || zoomPlus) {
                html += `<div class="settings-row"><div class="settings-label">Zoom:</div>
                    <div class="inline-buttons" style="gap: 1rem;">${zoomMinus}${zoomPlus}</div></div>`;
            }

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
                });
        
                archive.on('error', function(err) {
                    throw err;
                });
        
                archive.pipe(output);
        
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

        const userControlsHTML = parseControls('', 'User Controls', 'UserControls', v4l2ctl_1.v4l2ctl.Controls.UserControls);

var html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aragats - ONVIF Camera Control System</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
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

/* make logs content part of normal layout */
#logs-page, #logs-page .card, #logsTableWrapper {
  position: static !important;
  z-index: auto !important;
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
  color: var (--text-primary);
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
  color: var (--text-primary);
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

.data-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
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
  background: linear-gradient(90deg, var (--accent-color) 0%, var(--border-color) 100%);
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

.download-button-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.download-button {
  min-width: 120px; 
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
  display: inline-block;        
  padding: 0.8rem 1.1rem;      
  margin: 0.4rem 0.6rem 0 0;     
  font-size: 0.9rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  text-decoration: none;
  background-color: var(--accent-color);
  color: var(--primary-bg);
  box-shadow: none;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;        
}

.standard-button:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,212,170,0.12);
  color: var(--primary-bg);
}

.standard-button.primary {
  /* slightly stronger visual */
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
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

* {
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

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

.standard-button.ghost {
  background: rgba(255,255,255,0.03);
  color: var(--text-primary);
  border: 1px solid rgba(255,255,255,0.03);
}

.button-group .standard-button {
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.angles-top {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.angles-top div {
  background: var(--input-bg);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.angles-top span {
  color: var(--accent-color);
  font-weight: 700;
}

    </style>
    
    <!-- Fast Live Stream Styles -->
    <style>
.stream-interface {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px; /* 340px control panel */
    gap: 1.5rem;
    height: calc(100vh - 120px);
    padding: 1.5rem;
    background: var(--glass-bg);
    backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    border-radius: 1.5rem;
    margin: 1rem 0;
}

.video-container {
    position: relative;
    background: #000;
    border-radius: 0.75rem;
    overflow: hidden;
    display: flex;
    aspect-ratio: 16/9; /* Perfect 1920x1080 ratio */
    max-height: 1080px;
    width: 100%;
}

.video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
}

#liveStream {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
}

.video-overlay {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
    z-index: 10;
}

.stream-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 500;
}

.stream-selector {
    display: flex;
    gap: 0.75rem;
}

.stream-btn {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: 1px solid var(--accent-color);
    border-radius: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
    text-align: center;
}

.stream-btn.active {
    background: var(--accent-color);
    color: var(--primary-bg);
    font-weight: 600;
}

.stream-btn:hover {
    background: rgba(0, 212, 170, 0.5);
}

.controls-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: var(--glass-bg);
    backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    border-radius: 1rem;
    padding: 1.25rem;
    height: min(100%, 1080px);
    overflow-y: auto;
}

.control-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.control-label {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--accent-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
}

.mode-selector {
    display: flex;
    gap: 0.5rem;
}

.mode-btn {
    flex: 1;
    background: var(--input-bg);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    padding: 0.75rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
}

.mode-btn.active {
    background: var(--accent-color);
    color: var(--primary-bg);
    font-weight: 600;
}

.image-controls {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.adjustment-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.adjustment-row span:first-child {
    width: 90px;
    font-size: 0.95rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.adjustment-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 6px;
    background: var(--input-bg);
    border-radius: 3px;
    outline: none;
}

.adjustment-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent-color);
    border-radius: 50%;
    cursor: pointer;
}

.adjustment-row span:last-child {
    width: 40px;
    text-align: center;
    font-family: 'Fira Code', monospace;
    font-size: 0.95rem;
    color: var(--accent-color);
}

/* Zoom Controls */
.zoom-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 0.5rem;
}

.zoom-btn {
    background: var(--input-bg);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 45px;
    text-align: center;
}

.zoom-value {
    font-family: 'Fira Code', monospace;
    font-weight: 700;
    color: var(--accent-color);
    min-width: 50px;
    text-align: center;
    font-size: 1.05rem;
}

.zoom-slider {
    width: 100%;
    -webkit-appearance: none;
    height: 6px;
    background: var(--input-bg);
    border-radius: 3px;
    outline: none;
    margin-top: 0.75rem;
}

.zoom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent-color);
    border-radius: 50%;
    cursor: pointer;
}

.ptz-controls-fast {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
}

.ptz-grid-fast {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
    width: 100%;
    max-width: 220px;
}

.ptz-arrow-fast {
    aspect-ratio: 1;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 1.3rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
}

.ptz-center-fast {
    background: var(--accent-color);
    color: var(--primary-bg);
    font-size: 1.6rem;
}

.ptz-arrow-fast:hover {
    background: var(--accent-color);
    color: var(--primary-bg);
    transform: translateY(-2px);
}

.ptz-center-fast:hover {
    background: var(--accent-hover);
    transform: scale(1.05);
}

/* Speed Controls */
.speed-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.speed-row {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.speed-btn {
    flex: 1;
    padding: 0.6rem 0.5rem;
    font-size: 0.95rem;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
}

.speed-btn.active {
    background: var(--accent-color);
    color: var(--primary-bg);
    font-weight: 600;
}

/* Focus Controls */
.focus-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.focus-btn {
    flex: 1;
    padding: 0.75rem;
    font-size: 0.95rem;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
}

@media (max-width: 1200px) {
    .stream-interface {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
        height: auto;
        min-height: calc(100vh - 120px);
    }
    
    .video-container {
        max-height: 75vh;
    }
    
    .controls-panel {
        max-height: none;
    }
}

@media (max-width: 768px) {
    .stream-interface {
        padding: 1rem;
        gap: 1rem;
    }
    
    .stream-btn {
        padding: 0.6rem 1rem;
        min-width: 100px;
        font-size: 0.9rem;
    }
    
    .ptz-grid-fast {
        max-width: 200px;
        gap: 0.5rem;
    }
    
    .control-section {
        gap: 0.75rem;
    }
}

.stream-interface {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr;
    gap: 20px;
    height: 70vh;
    padding: 20px;
    box-sizing: border-box;
}

#fastlive-page.page-content {
    padding: 0;
}

#fastlive-page .page-header {
    margin-bottom: 0;
}

.video-container {
    position: relative;
    background: #000;
    border-radius: 0.75rem;
    overflow: hidden;
    height: 100%;
}

.stream-selector {
    display: flex;
    gap: 0.75rem;
}

.stream-btn {
    min-width: 120px;
    padding: 0.75rem 1.5rem;
    background: var(--input-bg);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    white-space: nowrap;
}

.mode-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.mode-btn {
    padding: 0.75rem;
    font-size: 0.95rem;
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
}

.mode-btn.active {
    background: var(--accent-color);
    color: var(--primary-bg);
    border-color: var(--accent-color);
    font-weight: 600;
}

.control-section:nth-child(1) {
    margin-top: 0;
    padding-top: 0;
}

.image-controls {
    margin: 15px 0;
}

.adjustment-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.adjustment-row span:first-child {
    width: 100px;
    font-size: 0.9rem;
}

.adjustment-slider {
    flex-grow: 1;
    margin: 0 10px;
}

/* Fixed Focus Buttons */
.focus-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.focus-btn {
    padding: 0.75rem;
    font-size: 0.95rem;
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
}

.focus-btn:hover {
    background: var(--accent-hover);
    color: var(--primary-bg);
}

@media (max-width: 768px) {
    .stream-btn {
        padding: 0.5rem 1rem;
        min-width: 100px;
        font-size: 0.9rem;
    }


    .mode-selector {
        grid-template-columns: 1fr;
    }

    .mode-selector,
    .focus-controls {
        grid-template-columns: 1fr;
    }
}

.angle-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem 0;
}

.angle-info div {
    font-size: 1rem;
    color: var(--text-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: var(--input-bg);
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
}

.angle-info span {
    color: var(--accent-color);
    font-weight: 700;
    font-size: 1.1rem;
    font-family: 'Fira Code', monospace;
}

#logsTable {
  display: none !important;
}

#logs-page.active #logsTable {
  display: table !important;
}

.logs-table thead th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-weight: 700;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  color: var(--text-primary);
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 2;
}

.logs-table tbody td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  font-size: 0.92rem;
  color: var(--text-primary);
  vertical-align: middle;
}

.logs-table tbody tr.failed-row {
  background: rgba(255, 70, 70, 0.06);
}

.logs-table tbody tr.success-row {
  background: rgba(0, 212, 170, 0.03);
}

.logs-badge {
  display:inline-block;
  padding:0.18rem 0.5rem;
  border-radius:0.45rem;
  font-size:0.78rem;
  font-weight:700;
  letter-spacing:0.02em;
}

.logs-badge.success {
  background: rgba(0,212,170,0.12);
  color: #006f53;
}

.logs-badge.failed {
  background: rgba(255,70,70,0.12);
  color: #8b0000;
}

.logs-raw-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.04);
  padding: 0.25rem 0.35rem;
  border-radius: 0.4rem;
  font-size: 0.78rem;
  cursor: pointer;
}

.logs-controls .form-control {
  padding: 0.5rem 0.7rem;
  border-radius: 0.5rem;
}

@media (max-width:640px) {
  .logs-table thead th:nth-child(5),
  .logs-table tbody td:nth-child(5) {
    display: none;
  }
}

.card .card-body {
  padding: 1.25rem 1.75rem;
}

.logs-controls,
#logsTableWrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 0.5rem;
  box-sizing: border-box;
}

#logsTableWrapper > div {
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
}

.logs-controls {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.logs-controls .form-control {
  min-width: 160px;
}

.logs-controls > div[style*="margin-left:auto"],
.logs-controls .logs-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 900px) {
  .logs-controls,
  #logsTableWrapper {
    max-width: calc(100% - 2rem);
    padding: 0 1rem;
  }
  .logs-controls .form-control { min-width: 120px; }
}

.logs-controls,
#logsTableWrapper {
  max-width: 1000px !important;
  margin: 0 auto !important;
}

.logs-controls {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 0.6rem !important;
  align-items: center !important;
  justify-content: flex-start !important;
}

.logs-controls .form-control {
  flex: 0 0 auto !important;
  min-width: 160px !important;
}

.logsTable {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.logsTable {
  flex-wrap: wrap;
  justify-content: space-between;
}

.logsTable {
  background: rgba(255,0,0,0.2) !important;
  border: 2px solid red !important;
}

.card-body > div:first-child {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  justify-content: space-between;
}

#logsTableWrapper {
  max-width: 1000px;
  margin: 0 auto;
}

#logsTableWrapper {
  margin: 0.8rem auto;
  max-width: 1000px;
  width: 100%;
}

#logsEmpty {
  padding: 1rem;
  color: var(--text-secondary);
  display: none;
  text-align: center;
}

.logs-scroll {
  overflow: auto;
  max-height: 420px;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  display: none;
}

.logs-table th,
.logs-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color, #ddd);
}

.logs-table th[data-col="raw"],
.logs-table td:last-child {
  width: 1%;
  white-space: nowrap;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  display: table;

.card {
  position: relative;
}

#logsTableWrapper,
.logs-controls,
.logs-inner {
  box-sizing: border-box;
  width: calc(100% - 3.5rem);
  margin-left: 1.75rem;
  margin-right: 1.75rem;
  max-width: none;
  padding: 0;
}

.logs-scroll { overflow:auto; max-height:420px; width:100%; }
.logs-table { width:100 !important; table-layout: fixed; display: table !important; }

.logs-controls { display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap; }
.logs-controls > div[style*="margin-left:auto"], .logs-actions { margin-left:auto; }

.logs-table {
  width: 100% !important;
  max-width: 1100px;
  margin: 0 auto;
  border-collapse: collapse;
  display: table !important;
  table-layout: fixed;
}

.logs-scroll {
  width: 100%;
  max-width: 1100px;
  margin: 0.4rem auto 0;
  box-sizing: border-box;
}

#logsEmpty {
  max-width: 1100px;
  margin: 0.4rem auto;
  text-align: center;
}

@media (max-width: 900px) {
  .logs-table,
  .logs-scroll,
  #logsEmpty {
    max-width: calc(100% - 2rem);
    margin-left: 1rem;
    margin-right: 1rem;
  }
}

#logs-page:not(.active) #logsTableWrapper,
#logs-page:not(.active) #logsTable,
#logs-page:not(.active) #logsEmpty {
    display: none !important;
    visibility: hidden !important;
}

/* Layout: make main container a flex row so map can take full width */
.main-container {
  display: flex;
  gap: 0;
}

/* Left column will hold the map/stream area and expand */
.stream-interface, /* existing container for stream/video + map card */
#map-page .map-card {
  flex: 1 1 auto;
  width: 100%;
  margin: 0;
  padding: 0;
  height: calc(100vh - 64px); /* adjust 64px to your nav height */
  min-height: 0;
}

/* Hide the right controls panel when collapsed */
.controls-panel.collapsed {
  display: none !important;
}

/* Remove paddings/borders so map uses whole space */
.card.map-card { padding: 0; border-radius: 0; box-shadow: none; }
#map { width: 100%; height: 100%; min-height: 0; }

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
                <li><a class="nav-link active" data-page="fastlive">Fast Live</a></li>
                <li><a class="nav-link" data-page="map">Map</a></li>
                <li><a class="nav-link" data-page="telemetry">Telemetry</a></li>
                <li><a class="nav-link" data-page="settings">Settings</a></li>
                <li><a class="nav-link" data-page="controls">Controls</a></li>
                <li><a class="nav-link" data-page="logs">Logs</a></li>
                <li><a class="nav-link" data-page="reboot">Reboot</a></li>
                <li><span class="status-indicator status-online"></span>Online</li>
            </ul>
        </div>
    </nav>

    <div class="toast-container" id="toastContainer"></div>

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
                                <input type="text" class="form-control" value="..." readonly style="width:120px; text-align: center;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="currentPosEl">Elevation Position (Steps)</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px; text-align: center;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="EncoderAz">Encoder Azimuth</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px; text-align: center;" />
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label" title="EncoderEl">Encoder Elevation</span>
                            <span class="data-value">
                                <input type="text" class="form-control" value="..." readonly style="width:120px; text-align: center;" />
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
                    <!-- Camera Name Row -->
                    <div class="settings-row">
                        <div class="settings-label">Camera Name</div>
                        <input type="text" id="cameraNameInput" class="form-control" placeholder="Enter camera name" />
                        <button class="standard-button primary" onclick="saveCameraName()">Save</button>
                    </div>
                    <div class="settings-row">
                        <div class="settings-label">Video Resolution</div>
                            <select class="form-control" id="videoResolutionSelect" onchange="onResolutionChange(this)">
                                <option value="1920x1080">1920x1080 (Full HD)</option>
                                <option value="1280x720">1280x720 (HD)</option>
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
        <div id="controls-page" class="page-content">
            <form method="POST" action="/" onsubmit="event.preventDefault();">
 
                <div class="card">
                    <div id="legacyUserControlsContent">
                        <!-- Content will be injected here by JavaScript -->
                    </div>
                </div>
            </form>
        </div>

<!-- Logs Page -->
<div id="logs-page" class="page-content">
  <div class="page-header">
    <h1 class="page-title">System Logs</h1>
    <p class="page-subtitle">View login attempts from the system</p>
  </div>

  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Recent Login Attempts</h3>
    </div>
  <div class="card-body">
   <div class="logs-inner">
  <div class="logs-controls" style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
    <input id="logsSearch" class="form-control" placeholder="Search username / ip..." style="min-width:200px;"/>
    <label style="display:flex; align-items:center; gap:0.4rem; margin-left:6px;">
      <input type="checkbox" id="showFailedOnly" /> Show failed only
    </label>
    <select id="logsLimit" class="form-control" style="width:110px;">
      <option value="50">50 rows</option>
      <option value="100" selected>100 rows</option>
      <option value="250">250 rows</option>
      <option value="all">All</option>
    </select>

    <div style="margin-left:auto; display:flex; gap:0.5rem;">
      <button type="button" class="standard-button primary" onclick="loadLogs()">Refresh</button>
        <a id="downloadLogsLink" class="standard-button download-button" href="#" onclick="openDownloadModal(event)" download style="display:none;">Download</a>
    </div>
  </div>
  <!-- Download modal: choose date range -->
<div id="downloadModal" class="modal" aria-hidden="true" style="display:none;">
  <div class="modal-backdrop" onclick="closeDownloadModal()"></div>
  <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="downloadModalTitle">
    <div class="modal-header">
      <h3 id="downloadModalTitle">Download Logs — choose date range</h3>
      <button class="modal-close" onclick="closeDownloadModal()" aria-label="Close">✕</button>
    </div>
    <div class="modal-body">
      <p style="margin:0 0 8px 0;">Pick a start and end date (inclusive). If your server supports ranged downloads, those will be requested; otherwise the client will fetch all logs and filter locally.</p>
      <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
        <label style="display:flex; flex-direction:column; font-size:0.9rem;">
          From
          <input type="date" id="downloadFrom" class="form-control" />
        </label>
        <label style="display:flex; flex-direction:column; font-size:0.9rem;">
          To
          <input type="date" id="downloadTo" class="form-control" />
        </label>
        <label style="display:flex; align-items:center; gap:0.4rem; font-size:0.9rem;">
          <input type="checkbox" id="downloadWholeDay" checked /> Include whole end day
        </label>
      </div>
    </div>
    <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:12px;">
      <button class="standard-button" onclick="closeDownloadModal()">Cancel</button>
      <button class="standard-button primary" onclick="startLogsDownload()">Download</button>
    </div>
  </div>
</div>
   </div>

 <div id="logsTableWrapper">
  <!-- Table will be injected here -->
  <div id="logsEmpty">No logs to show.</div>
  <div class="logs-scroll">
    <table id="logsTable" class="logs-table">
      <thead>
        <tr>
          <th data-col="timestamp">Time ▾</th>
          <th data-col="username">User</th>
          <th data-col="ipAddress">IP</th>
          <th data-col="success">Result</th>
          <th data-col="raw"></th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div> 
</div>
  </div>
</div>
</div>

  </div>
</div>


<!-- Map Page -->
<div id="map-page" class="page-content">
  <div class="card" style="height: calc(100vh - 220px); display:flex; flex-direction:column;">
    <div style="padding: 10px; display: flex; gap: 15px; align-items: center; background: rgba(0,0,0,0.3);">
      <label style="color: #fff;">Terrain Exaggeration:</label>
      <input type="range" id="terrain-exaggeration" min="0" max="3" step="0.1" value="1.5" style="width: 200px;">
      <span id="exaggeration-value" style="color: #fff;">1.5x</span>
      <label style="color: #fff; margin-left: 20px;">
        <input type="checkbox" id="toggle-3d" checked> Enable 3D View
      </label>
    </div>
    <div id="map" style="flex:1; min-height:420px;"></div>
  </div>
</div>

<!-- Reboot Page -->
<div id="reboot-page" class="page-content">
  <div class="page-header">
    <h1 class="page-title">Schedule Reboot</h1>
    <p class="page-subtitle">Pick a time when the server will reboot and run the post-reboot script.</p>
  </div>

  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Reboot Scheduler</h3>
    </div>
    <div class="card-body">
      <form id="rebootForm" onsubmit="event.preventDefault(); scheduleReboot();">
        <div style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
          <label style="display:flex; flex-direction:column; min-width:240px;">
            When (local):
            <input id="rebootTime" type="datetime-local" class="form-control" required />
          </label>

          <label style="display:flex; flex-direction:column; min-width:320px;">
            Script path (optional):
            <input id="rebootScript" type="text" class="form-control" placeholder="/usr/local/sbin/schedule_reboot_and_run.sh" />
            <small style="opacity:0.8;">If empty, server will use the default scheduler script.</small>
          </label>

          <label style="display:flex; flex-direction:column; width:160px;">
            Run as user:
            <input id="rebootUser" type="text" class="form-control" value="root" />
          </label>

          <label style="display:flex; flex-direction:column; width:200px;">
            Sudo Password:
            <input id="rebootPassword" type="password" class="form-control" placeholder="Enter password" required />
          </label>

          <div style="margin-left:auto; display:flex; gap:0.5rem;">
            <button type="button" class="standard-button" onclick="clearRebootForm()">Clear</button>
            <button type="submit" class="standard-button primary">Schedule Reboot</button>
          </div>
        </div>

        <div id="rebootInfo" style="margin-top:10px; font-size:0.95rem;"></div>
      </form>
    </div>
  </div>
</div>


<!-- Fast Live Page -->
<div id="fastlive-page" class="page-content active">
    <div class="page-header">
        <div class="angles-top">
            <div>angleD: <span id="azimuthValue">--</span></div>
            <div>mestoC: <span id="elevationValue">--</span></div>
            <div>Distance: <span id="distanceValue">--</span></div>
        </div>
        <button type="button" class="standard-button" style="padding: 0.5rem 1rem; font-size: 0.9rem; margin-top: -0.5rem;" onmousedown="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.range_finder=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.range_finder=false' });" ontouchstart="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.range_finder=true' });" ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.range_finder=false' });">Measure Range</button>
    </div>

    <div class="stream-interface">
        <!-- Main video stream area - Left side -->
        <div class="video-container">
                <div class="video-wrapper" style="position:relative;"> <!-- ensure relative positioning -->
                <!-- overlay container sits above the iframe -->
                <div id="overlay-container" aria-hidden="true"
                    style="position:absolute; inset:0; pointer-events:none; z-index:9999; overflow:visible;"></div>

                <!-- fullscreen toggle for the wrapper (user can use this instead of iframe's fullscreen control) -->
                <button id="wrapper-fullscreen-btn"
                        title="Fullscreen player"
                        style="position:absolute; right:8px; top:8px; z-index:10000; pointer-events:auto; background:#0008; color:#fff; border:0; padding:6px 8px; border-radius:6px;">
                    ⤢
                </button>

                <iframe id="webrtcFrame"
                        title="Live camera stream"
                        style="width:100%; height:100%; border:0; pointer-events: none;"
                        allow="autoplay; camera; microphone; fullscreen"
                        src="">
                </iframe>

                <!-- Transparent overlay to capture clicks -->
                <div id="videoOverlay"
                     style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto; z-index: 1000; background: transparent; cursor: crosshair;">
                </div>

                <!-- PTZ Click Handler Script -->
                <script>
                    // PTZ Constants and Functions (adapted from video_click_ptz.js)
                    window.currentVideoWidth = 1920;
                    window.currentVideoHeight = 1080;
                    window.currentCameraType = 1; // 1=day, 2=ir
                    var BASE_FOV_HORIZONTAL = 66.0;
                    var BASE_FOV_VERTICAL = 40.3;
                    var AZIM_RIGHT = 271000;
                    var AZIM_LEFT = 0;
var ELEV_UP = 262143;
var ELEV_DOWN = 0;

var DAY_ZOOM_COEFFICIENT_GRID = {
                        6: [1.1,  1.05],
                        5: [1.45, 1.35],
                        4: [1.8,  1.7 ],
                        3: [1.8,  1.65],
                        2: [1.62, 1.45],
                        1: [1.03, 0.9 ]
                    };

                    var IR_ZOOM_COEFFICIENT_GRID = {
                        8: [0.65, 0.58],
                        4: [0.95, 0.85],
                        2: [1.25, 1.1],
                        1: [1.28, 1.1]
                    };

                    var IR_CROSSHAIR_POSITIONS = {
                        1: [959, 557],
                        2: [960, 563],
                        4: [960, 564],
                        8: [960, 557]
                    };

                    function calculateNewPositionEncoderCrosshair(clickX, clickY, screenWidth, screenHeight, currentHorizontal, currentVertical, zoom, xCrossPos, yCrossPos, cameraType) {
                        var zoomForCalculations = 0;
                        if (zoom == 1) zoomForCalculations = 1;
                        if (zoom == 2) zoomForCalculations = 5;
                        if (zoom == 3) zoomForCalculations = 15;
                        if (zoom == 4) zoomForCalculations = 30;
                        if (zoom == 5) zoomForCalculations = 60;
                        if (zoom == 6) zoomForCalculations = 68;

                        var isIR = cameraType === 2;
                        var fovHorizontal, fovVertical, correctionCoefficientH, correctionCoefficientV;

                        if (isIR) {
                            var irZoomMap = {1:1, 2:2, 3:4, 4:8, 5:8, 6:8};
                            zoomForCalculations = irZoomMap[zoom] || 1;
                            fovHorizontal = (BASE_FOV_HORIZONTAL / 15) / zoomForCalculations;
                            fovVertical = (BASE_FOV_VERTICAL / 15) / zoomForCalculations;
                            [correctionCoefficientH, correctionCoefficientV] = IR_ZOOM_COEFFICIENT_GRID[zoomForCalculations] || [1.0, 1.0];
                            var crossPos = IR_CROSSHAIR_POSITIONS[zoomForCalculations] || [960, 520];
                            var cross_x = crossPos[0];
                            var cross_y = crossPos[1];
                        } else {
                            fovHorizontal = BASE_FOV_HORIZONTAL / zoomForCalculations;
                            fovVertical = BASE_FOV_VERTICAL / zoomForCalculations;
                            [correctionCoefficientH, correctionCoefficientV] = DAY_ZOOM_COEFFICIENT_GRID[zoom] || [1.0, 1.0];
                            var cross_y = 520;
                            var cross_x = 960;
                            if (zoomForCalculations == 1)   {cross_y = 557; cross_x = 959}
                            else if (zoomForCalculations == 5)   cross_y = 563;
                            else if (zoomForCalculations == 15)   cross_y = 564;
                            else if (zoomForCalculations == 30)  cross_y = 557;
                            else if (zoomForCalculations == 60)  cross_y = 535;
                            else if (zoomForCalculations == 68)  cross_y = 527;
                        }

                        var xCrossCorrection = cross_x - xCrossPos;
                        var yCrossCorrection = cross_y - yCrossPos;

  var relX = (clickX / screenWidth) - 0.5;
  var relY = 0.5 - (clickY / screenHeight);

                        var angleOffsetH = (relX + xCrossCorrection / screenWidth) * fovHorizontal * correctionCoefficientH;
                        var angleOffsetV = (relY + yCrossCorrection / screenHeight) * fovVertical * correctionCoefficientV;

                        var newHorizontal = currentHorizontal + Math.floor(angleOffsetH * (AZIM_RIGHT / 360));
                        var newVertical = currentVertical + Math.floor(angleOffsetV * (AZIM_RIGHT / 360));

                        newHorizontal = Math.max(0, Math.min(AZIM_RIGHT, newHorizontal));
                        newVertical = Math.max(0, Math.min(AZIM_RIGHT, newVertical));

                        return [newHorizontal, newVertical];
                    }

                    function doPTZMove(clickX, clickY, zoom, currentHorizontal, currentVertical, xCrossPos, yCrossPos, cameraType) {
                        var result = calculateNewPositionEncoderCrosshair(
                            clickX, clickY, window.currentVideoWidth, window.currentVideoHeight, currentHorizontal, currentVertical, zoom, xCrossPos, yCrossPos, cameraType
                        );

                        var newHorizontal = result[0];
                        var newVertical = result[1];

                        // Send PTZ command using the new API endpoint
                        fetch('/api/ptzMove', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ az: newHorizontal, el: newVertical })
                        }).then(function(response) {
                            if (response.ok) {
                            } else {
                                console.error('Failed to send PTZ move command');
                            }
                        }).catch(function(error) {
                            console.error('Error sending PTZ move command:', error);
                        });

                        return [newHorizontal, newVertical];
                    }

                    async function handleVideoClick(event) {
                        // Prevent default behavior (pause/play)
                        event.preventDefault();
                        event.stopPropagation();

                        var videoElement = event.target;
                        var rect = videoElement.getBoundingClientRect();
                        var clickX = event.clientX - rect.left;
                        var clickY = event.clientY - rect.top;

                        var percentX = (clickX / rect.width) * window.currentVideoWidth;
                        var percentY = (clickY / rect.height) * window.currentVideoHeight;

                        showClickFeedback(clickX, clickY, rect);

                        // Get current zoom
                        var currentZoomValue = 1;
                        try {
                            var zoomResponse = await fetch('/api/currentZoom');
                            var zoomData = await zoomResponse.json();
                            currentZoomValue = zoomData.zoom;
                        } catch (error) {
                            console.error('Error getting current zoom:', error);
                        }

                        // currentZoomValue is already the level (1-6)
                        var zoomLevel = currentZoomValue;

                        // Get cross positions
                        var xCrossPos = 959;
                        var yCrossPos = 557;
                        try {
                            var crossResponse = await fetch('/api/crossPositions?zoom=' + zoomLevel);
                            var crossData = await crossResponse.json();
                            xCrossPos = crossData.x;
                            yCrossPos = crossData.y;
                        } catch (error) {
                            console.error('Error getting cross positions:', error);
                        }

                        try {
                            var positionResponse = await fetch('/api/ptzPosition');
                            var positionData = await positionResponse.json();
                            var currentHorizontal = positionData.az;
                            var currentVertical = positionData.el;

                            var cameraType = window.currentCameraType;
                            doPTZMove(percentX, percentY, zoomLevel, currentHorizontal, currentVertical, xCrossPos, yCrossPos, cameraType);
                        } catch (error) {
                            console.error('Error getting current PTZ position:', error);
                        }

                        return false;
                    }

                    function showClickFeedback(clickX, clickY, rect) {
                        var existingFeedback = document.getElementById('click-feedback');
                        if (existingFeedback) existingFeedback.parentNode.removeChild(existingFeedback);

                        var feedback = document.createElement('div');
                        feedback.id = 'click-feedback';
                        feedback.style.position = 'absolute';
                        feedback.style.left = (clickX - 15) + 'px';
                        feedback.style.top = (clickY - 15) + 'px';
                        feedback.style.width = '30px';
                        feedback.style.height = '30px';
                        feedback.style.border = '3px solid #00ff00';
                        feedback.style.borderRadius = '50%';
                        feedback.style.pointerEvents = 'none';
                        feedback.style.zIndex = '10000';
                        feedback.style.animation = 'clickFeedback 0.5s ease-out forwards';

                        var videoContainer = document.querySelector('.video-container');
                        if (videoContainer) {
                            videoContainer.appendChild(feedback);
                            setTimeout(function() {
                                if (feedback.parentNode) {
                                    feedback.parentNode.removeChild(feedback);
                                }
                            }, 500);
                        }
                    }

                    document.addEventListener('DOMContentLoaded', function() {
                        var videoOverlay = document.getElementById('videoOverlay');
                        if (videoOverlay) {
                            videoOverlay.addEventListener('click', handleVideoClick);
                        }
                    });

                    var style = document.createElement('style');
                    style.textContent = '@keyframes clickFeedback { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.5); } 100% { opacity: 0; transform: scale(2); } }';
                    document.head.appendChild(style);
                </script>

                <div class="video-overlay">
                    <div class="stream-status">
                        <span class="status-indicator status-online"></span>
                        <span>Live Stream Active</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right control panel -->
        <div class="controls-panel">
            <!-- Stream Selector -->
            <div class="control-section">
                <div class="control-label">STREAM SELECTOR</div>
                <div class="stream-selector">
                    <button class="stream-btn active" onclick="switchStream(1)">Stream 1</button>
                    <button class="stream-btn" onclick="switchStream(2)">Stream 2</button>
                </div>
            </div>

            <!-- Stream mode selector -->
            <div class="control-section">
                <div class="control-label">THERMAL MODE</div>
                <div class="mode-selector">
                    <button class="mode-btn active" onclick="setThermalMode('blackhot')">Black Hot</button>
                    <button class="mode-btn" onclick="setThermalMode('whitehot')">White Hot</button>
                </div>
            </div>

            <div class="control-section">
                <div class="control-label">PTZ CONTROLS</div>
                <div class="ptz-controls-fast">
                    <div class="ptz-grid-fast">
                        <button class="ptz-arrow-fast" onclick="movePTZ('up-left')">↖</button>
                        <button class="ptz-arrow-fast" onmousedown="setSpeed(currentSpeed); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_up=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_up=false' });" ontouchstart="setSpeed(currentSpeed); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_up=true' });" ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_up=false' });">↑</button>
                        <button class="ptz-arrow-fast" onclick="movePTZ('up-right')">↗</button>
                        <button class="ptz-arrow-fast" onmousedown="setSpeed(currentSpeed); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_left=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_left=false' });" ontouchstart="setSpeed(currentSpeed); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_left=true' });" ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_left=false' });">←</button>
                        <button class="ptz-center-fast" onmousedown="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_middle=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_middle=false' });" ontouchstart="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_middle=true' });" ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_middle=false' });">⏺</button>
                        <button class="ptz-arrow-fast" onmousedown="setSpeed(currentSpeed); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_right=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_right=false' });" ontouchstart="setSpeed(currentSpeed); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_right=true' });" ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_right=false' });">→</button>
                        <button class="ptz-arrow-fast" onclick="movePTZ('down-left')">↙</button>
                        <button class="ptz-arrow-fast" onmousedown="setSpeed(currentSpeed); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_down=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_down=false' });" ontouchstart="setSpeed(currentSpeed); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_down=true' });" ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.ptz_down=false' });">↓</button>
                        <button class="ptz-arrow-fast" onclick="movePTZ('down-right')">↘</button>
                    </div>
                </div>
            </div>

            <!-- North Connect -->
            <div class="control-section">
                <div class="control-label">NORTH</div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">D1: <input type="number" min="0" max="59" value="1" class="form-control" style="width: 80px;" onchange="sendControlValue('UserControls', 'alphaD1', this.value)" /></div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">D2: <input type="number" min="0" max="99" value="1" class="form-control" style="width: 80px;" onchange="sendControlValue('UserControls', 'alphaD2', this.value)" /></div>
                <button type="button" class="standard-button" onmousedown="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.north_connect=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.north_connect=false' });">Connect</button>
            </div>
            
            <!-- Speed controls -->
            <div class="control-section">
                <div class="control-label">SPEED</div>
                <div class="speed-controls">
                    <div class="speed-row">
                        <button class="speed-btn" onclick="setSpeed(1)">1</button>
                        <button class="speed-btn" onclick="setSpeed(2)">2</button>
                        <button class="speed-btn" onclick="setSpeed(3)">3</button>
                        <button class="speed-btn" onclick="setSpeed(4)">4</button>
                    </div>
                    <div class="speed-row">
                        <button class="speed-btn" onclick="setSpeed(5)">5</button>
                        <button class="speed-btn" onclick="setSpeed(6)">6</button>
                        <button class="speed-btn" onclick="setSpeed(7)">7</button>
                        <button class="speed-btn" onclick="setSpeed(8)">8</button>
                    </div>
                </div>
            </div>

            <!-- Image adjustments -->
            <div class="control-section">
                <div class="control-label">IMAGE ADJUSTMENTS</div>
                <div class="image-controls">
                    <div class="adjustment-row">
                        <span>Brightness</span>
                        <button class="zoom-btn" onclick="adjustBrightness('down')">-</button>
                        <span id="brightnessValue">50</span>
                        <button class="zoom-btn" onclick="adjustBrightness('up')">+</button>
                    </div>
                    <div class="adjustment-row">
                        <span>Contrast</span>
                        <button class="zoom-btn" onclick="adjustContrast('down')">-</button>
                        <span id="contrastValue">50</span>
                        <button class="zoom-btn" onclick="adjustContrast('up')">+</button>
                    </div>
                </div>
            </div>

            <!-- Day Camera Zoom controls -->
            <div class="control-section">
                <div class="control-label">DAY CAMERA ZOOM</div>
                <div class="zoom-controls">
                    <button class="zoom-btn" onclick="setDayZoom('down')">-</button>
                    <button class="zoom-btn" onclick="setDayZoom('up')">+</button>
                </div>
            </div>

            <!-- Night Camera Zoom controls -->
            <div class="control-section">
                <div class="control-label">NIGHT CAMERA ZOOM</div>
                <div class="zoom-controls">
                    <button class="zoom-btn" onclick="setDigitalZoom('down')">-</button>
                    <button class="zoom-btn" onclick="setDigitalZoom('up')">+</button>
                </div>
            </div>

            <!-- Focus controls -->
    <div class="control-section">
        <div class="control-label">FOCUS</div>
        <div class="focus-controls">
            <button class="focus-btn" onmousedown="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.near_focus=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.near_focus=false' });" ontouchstart="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.near_focus=true' });" ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.near_focus=false' });">Near -</button>
            <button class="focus-btn" onmousedown="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.far_focus=true' });" onmouseup="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.far_focus=false' });" ontouchstart="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.far_focus=true' });" ontouchend="fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'UserControls.far_focus=false' });">Far +</button>
        </div>
    </div>
</div>

    </main>

    <script>
        const userControlsHTML = \`${userControlsHTML}\`;
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetPage = e.target.dataset.page;

                (function manageLogsVisibility(tgt) {
                    const logsPage = document.getElementById('logs-page');
                    const logsWrapper = document.getElementById('logsTableWrapper');
                    const logsTable = document.getElementById('logsTable');
                    const logsEmpty = document.getElementById('logsEmpty');
                    const downloadBtn = document.getElementById('downloadLogsLink');

                    if (!logsWrapper || !logsPage) return;

                    if (tgt !== 'logs') {
                        logsWrapper.style.display = 'none !important';
                        if (logsTable) {
                            logsTable.style.display = 'none';
                            logsTable.style.visibility = 'hidden';
                        }
                        if (logsEmpty) {
                            logsEmpty.style.display = 'none';
                            logsEmpty.style.visibility = 'hidden';
                        }
                        if (downloadBtn) downloadBtn.style.display = 'none';
                    } else {
                        logsWrapper.style.display = 'block';
                        logsWrapper.style.visibility = 'visible';
                        if (logsTable) {
                            logsTable.style.visibility = 'visible';
                        }
                        if (logsEmpty) {
                            logsEmpty.style.visibility = 'visible';
                        }
                        if (downloadBtn) downloadBtn.style.display = 'inline-block';
                        
                        setTimeout(() => {
                            if (typeof loadLogs === 'function') loadLogs();
                        }, 100);
                    }
                })(targetPage);

                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');

                document.querySelectorAll('.page-content').forEach(page => {
                    page.classList.remove('active');
                });
                
        const targetPageElement = document.getElementById(targetPage + '-page');
        if (targetPageElement) {
            targetPageElement.classList.add('active');
        }

        if (targetPage === 'fastlive') {
            window.scrollTo(0, 0);
        }

                const controlsContent = document.getElementById('legacyUserControlsContent');
                if (targetPage === 'controls') {
                    controlsContent.innerHTML = userControlsHTML;
                } else {
                    controlsContent.innerHTML = '';
                }
            });
        });

        document.addEventListener('DOMContentLoaded', function() {
            const controlsContent = document.getElementById('legacyUserControlsContent');
            controlsContent.innerHTML = userControlsHTML;
        });

          mapboxgl.accessToken = 'pk.eyJ1Ijoidmhvdmg5OSIsImEiOiJjbTltZmNvN2IwZDJ2MmxyN2F6M2w2cnR6In0.0YZJVladhWwebBmxq1KiOw';

        let localMapInitialized = false;
        let localMapInstance = null;

        function initLocalMap() {
          if (localMapInitialized) return;
          localMapInitialized = true;
          
          const tileTemplate = window.location.origin + '/maptiles/{z}/{x}/{y}.png';
          const terrainTemplate = window.location.origin + '/terrain/{z}/{x}/{y}';
          
          localMapInstance = new mapboxgl.Map({
            container: 'map',
            style: {
              version: 8,
              sources: {
                'local-tiles': {
                  type: 'raster',
                  tiles: [ tileTemplate ],
                  tileSize: 256,
                  minzoom: 1,
                  maxzoom: 12
                },
                'terrain-source': {
                  type: 'raster-dem',
                  tiles: [ terrainTemplate ],
                  tileSize: 256,
                  minzoom: 0,
                  maxzoom: 12,
                  encoding: 'terrarium' // or 'mapbox' depending on your tile format
                }
              },
              layers: [
                { id: 'local-tiles-layer', type: 'raster', source: 'local-tiles' }
              ]
            },
            center: [44.5, 40.2],
            zoom: 5,
            pitch: 45, // Add pitch for 3D view
            bearing: 0,
            minZoom: 1,
            maxZoom: 12
          });
          
          // Add terrain to the map
          localMapInstance.on('load', () => {
            localMapInstance.setTerrain({
              source: 'terrain-source',
              exaggeration: 1.5 // Adjust this to make terrain more or less pronounced
            });
            
            // Optional: Add sky layer for better 3D effect
            localMapInstance.addLayer({
              id: 'sky',
              type: 'sky',
              paint: {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0.0, 90.0],
                'sky-atmosphere-sun-intensity': 15
              }
            });
          });
          
          // Add navigation controls
          localMapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          // Error handling
          localMapInstance.on('error', (e) => {
            console.error('Mapbox error:', e && e.error ? e.error : e);
          });
        }

        document.getElementById('terrain-exaggeration')?.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          document.getElementById('exaggeration-value').textContent = value.toFixed(1) + 'x';
          if (localMapInstance) {
            localMapInstance.setTerrain({
              source: 'terrain-source',
              exaggeration: value
            });
          }
        });

        document.getElementById('toggle-3d')?.addEventListener('change', (e) => {
          if (localMapInstance) {
            if (e.target.checked) {
              localMapInstance.setTerrain({
                source: 'terrain-source',
                exaggeration: parseFloat(document.getElementById('terrain-exaggeration').value)
              });
              localMapInstance.easeTo({ pitch: 45, duration: 1000 });
            } else {
              localMapInstance.setTerrain(null);
              localMapInstance.easeTo({ pitch: 0, duration: 1000 });
            }
          }
        });

        // integrate with your page-switching logic: when 'map' page is activated call initLocalMap()
        document.querySelectorAll('.nav-link').forEach(link => {
          link.addEventListener('click', (e) => {
            const targetPage = e.target.dataset.page;
            // existing page switch code likely hides/shows .page-content, keep that; then:
            if (targetPage === 'map') {
              // small timeout to ensure map container is visible before init
              setTimeout(initLocalMap, 50);
            }
          });
        });

        // If you want the map to initialize if the map page is shown on load:
        if (document.querySelector('#map-page').classList.contains('active')) {
          setTimeout(initLocalMap, 50);
        }

        function onResolutionChange(select) {
            const val = select.value;
            let width = 1920, height = 1080;
            if (val === "1280x720") {
                width = 1280; height = 720;
            }
            fetch('/api/setResolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ width, height })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast('Resolution updated', 'success');
                } else {
                    showToast('Failed to update resolution', 'error');
                }
            })
            .catch(() => showToast('Error updating resolution', 'error'));
        }

        function updateTelemetryFields(data, tableId) {
            const table = document.getElementById(tableId);
            if (!table || !data) return;
            
            const rows = table.querySelectorAll('.data-row');
            for (const row of rows) {
                const labelEl = row.querySelector('.data-label');
                const inputEl = row.querySelector('input');
                
                if (labelEl && inputEl) {
                    const key = labelEl.title || labelEl.textContent.trim();
                    
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

        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            const toast = document.createElement('div');
            toast.className = 'toast ' + type;
            toast.textContent = message;

            container.appendChild(toast);

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 3000);
        }

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

        setInterval(() => {
            fetch('/api/angles')
                .then(res => {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(data => {
                    const azEl = document.getElementById('azimuthValue');
                    const elEl = document.getElementById('elevationValue');
                    if (azEl) azEl.textContent = (data.azimuth_degrees != null && data.azimuth_angle != null) ? data.azimuth_degrees + ' (' + data.azimuth_angle + ')' : '--';
                    if (elEl) elEl.textContent = (data.elevation_degrees != null && data.elevation_angle != null) ? data.elevation_degrees + ' (' + data.elevation_angle + ')' : '--';
                })
                .catch(err => {
                    console.error('Angle fetch error:', err);
                });
        }, 1000);

        setInterval(() => {
            fetch('/api/distance')
                .then(res => {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(data => {
                    const distEl = document.getElementById('distanceValue');
                    if (distEl) distEl.textContent = (data.D != null) ? data.D : '--';
                })
                .catch(err => {
                    console.error('Distance fetch error:', err);
                });
        }, 1000);

        let currentZoom = 1;
        let currentSpeed = 4;
        let currentBrightness = 50;
        let currentContrast = 50;
        let currentDayZoomIndex = 0;
        const dayZoomValues = [1, 5, 15, 30, 60, 68];
        let currentDigitalZoomIndex = 0;
        const digitalZoomValues = [1, 2, 4, 8];

        function adjustZoom(delta) {
            currentZoom = Math.max(1, Math.min(30, currentZoom + delta));
            const zoomValue = document.getElementById('zoomValue');
            const zoomSlider = document.getElementById('zoomSlider');
            if (zoomValue) zoomValue.textContent = currentZoom + 'x';
            if (zoomSlider) zoomSlider.value = currentZoom;
            showToast('Zoom set to ' + currentZoom + 'x', 'success');
        }

function setSpeed(speed) {
    currentSpeed = speed;
    showToast('Speed set to ' + speed, 'success');
    fetch('/api/setSpeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed })
    }).catch(console.error);
    sendControlValue('UserControls', 'speed', speed);
    document.querySelectorAll('.speed-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.textContent === speed.toString());
    });
}

        function movePTZ(direction) {
            showToast('Moving ' + direction, 'info');
        }

        function adjustFocus(direction) {
            showToast('Focus ' + direction, 'info');
        }

        function setDayZoom(direction) {
            if (direction === 'up') {
                currentDayZoomIndex = Math.min(dayZoomValues.length - 1, currentDayZoomIndex + 1);
            } else {
                currentDayZoomIndex = Math.max(0, currentDayZoomIndex - 1);
            }
            const value = dayZoomValues[currentDayZoomIndex];
            sendControlValue('UserControls', 'day_zoom', value);
            const level = currentDayZoomIndex + 1;
            global.currentDayZoom = level; 
            fetch('/api/setZoomLevel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level })
            }).catch(console.error);
            showToast('Day Zoom set to ' + value + 'x', 'success');
        }

        function adjustBrightness(direction) {
            if (direction === 'up') {
                currentBrightness = Math.min(100, currentBrightness + 10);
            } else {
                currentBrightness = Math.max(0, currentBrightness - 10);
            }
            document.getElementById('brightnessValue').textContent = currentBrightness;
            sendControlValue('UserControls', 'brightness', currentBrightness);
            showToast('Brightness set to ' + currentBrightness, 'success');
        }

        function adjustContrast(direction) {
            if (direction === 'up') {
                currentContrast = Math.min(100, currentContrast + 10);
            } else {
                currentContrast = Math.max(0, currentContrast - 10);
            }
            document.getElementById('contrastValue').textContent = currentContrast;
            sendControlValue('UserControls', 'contrast', currentContrast);
            showToast('Contrast set to ' + currentContrast, 'success');
        }

        function setDigitalZoom(direction) {
            if (direction === 'up') {
                currentDigitalZoomIndex = Math.min(digitalZoomValues.length - 1, currentDigitalZoomIndex + 1);
            } else {
                currentDigitalZoomIndex = Math.max(0, currentDigitalZoomIndex - 1);
            }
            const value = digitalZoomValues[currentDigitalZoomIndex];
            sendControlValue('UserControls', 'digital_zoom', value);
            showToast('Night Zoom set to ' + value + 'x', 'success');
        }

        document.querySelectorAll("form").forEach(form => {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
            });
        });


function setThermalMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(function(btn) {
        var btnMode = btn.textContent.toLowerCase().replace(' hot', 'hot');
        btn.classList.toggle('active', btnMode === mode);
    });
    sendControlValue('UserControls', 'palette', mode === 'blackhot' ? 1 : 0);
}

var GO2RTC_BASE = 'http://192.168.0.104:1984';

var currentStream = 1;

function makeSrcName(streamNumber, quality) {
  if (quality === 'low') {
    return 'stream' + streamNumber + '_low';
  }
  return 'stream' + streamNumber;
}

function getWebrtcUrl(streamNumber, quality) {
  var srcName = makeSrcName(streamNumber, quality);
  return GO2RTC_BASE + '/webrtc.html?src=' + encodeURIComponent(srcName);
}

function switchStream(streamNumber, quality) {
  try {
    currentStream = streamNumber;

    var btns = document.getElementsByClassName('stream-btn');
    var s = String(streamNumber);
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.textContent.indexOf(s) > -1) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    }

    var iframe = document.getElementById('webrtcFrame');
    if (iframe) {
      iframe.src = getWebrtcUrl(streamNumber, quality || '');
    } else {
      if (window.console && console.warn) console.warn('webrtcFrame not found');
    }
  } catch (err) {
    if (window.console && console.error) console.error('switchStream error:', err);
  }
}

window.onload = function () {
  var defaultStream = 1;
  var btns = document.getElementsByClassName('stream-btn');
  var s = String(defaultStream);
  for (var i = 0; i < btns.length; i++) {
    var b = btns[i];
    if (b.textContent.indexOf(s) > -1) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  }

  var iframe = document.getElementById('webrtcFrame');
  if (iframe) {
    iframe.src = getWebrtcUrl(defaultStream, '');
  }
};

function initControls() {
    // No sliders to initialize
}

function adjustZoom(direction) {
    const zoomSlider = document.getElementById('zoomSlider');
    if (!zoomSlider) return;
    
    const currentValue = parseInt(zoomSlider.value);
    const newValue = Math.max(1, Math.min(30, currentValue + direction));
    zoomSlider.value = newValue;
    
    const zoomValue = document.getElementById('zoomValue');
    if (zoomValue) zoomValue.textContent = newValue + 'x';
}

function movePTZ(direction) {

}

function adjustFocus(direction) {

}

if (document.readyState !== 'loading') {
    initControls();
} else {
    document.addEventListener('DOMContentLoaded', initControls);
}

function formatDate(iso) {
    try {
        var d = new Date(iso);
        return d.toLocaleString();
    } catch (e) {
        return iso;
    }
}
function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/[&<>"']/g, function (m) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
}

function renderLogsTable(data) {
    var tbody = document.querySelector('#logsTable tbody');
    var table = document.getElementById('logsTable');
    var empty = document.getElementById('logsEmpty');

    var attempts = Array.isArray(data) ? data.slice(0) : (data.attempts && Array.isArray(data.attempts) ? data.attempts.slice(0) : []);

    if (!attempts.length) {
        table.style.display = 'none';
        empty.style.display = '';
        return;
    } else {
        empty.style.display = 'none';
        table.style.display = '';
    }

    attempts.sort(function(a, b) {
        var ta = new Date(a.timestamp).getTime() || 0;
        var tb = new Date(b.timestamp).getTime() || 0;
        return tb - ta;
    });

    var search = (document.getElementById('logsSearch').value || '').toLowerCase().trim();
    var failedOnly = document.getElementById('showFailedOnly').checked;
    var limitVal = document.getElementById('logsLimit').value;
    var limit = limitVal === 'all' ? attempts.length : parseInt(limitVal, 10) || 100;

    var filtered = [];
    for (var i = 0; i < attempts.length; i++) {
        var it = attempts[i];
        if (failedOnly && it.success) continue;
        if (search) {
            var s = (it.username || '') + ' ' + (it.ipAddress || '') + ' ' + (it.timestamp || '');
            if (s.toLowerCase().indexOf(search) === -1) continue;
        }
        filtered.push(it);
        if (filtered.length >= limit) break;
    }

    tbody.innerHTML = '';
    for (var j = 0; j < filtered.length; j++) {
        var row = filtered[j];
        var tr = document.createElement('tr');
        tr.className = row.success ? 'success-row' : 'failed-row';

        var tdTime = document.createElement('td');
        tdTime.innerHTML = '<div style="font-weight:600;">' + escapeHtml(formatDate(row.timestamp)) + '</div>'
                         + '<div style="font-size:0.8rem; color:var(--text-secondary);">' + escapeHtml(row.timestamp) + '</div>';
        tr.appendChild(tdTime);

        var tdUser = document.createElement('td');
        tdUser.textContent = row.username || '(unknown)';
        tr.appendChild(tdUser);

        var tdIP = document.createElement('td');
        tdIP.textContent = row.ipAddress || '-';
        tr.appendChild(tdIP);

        var tdRes = document.createElement('td');
        var span = document.createElement('span');
        span.className = 'logs-badge ' + (row.success ? 'success' : 'failed');
        span.textContent = row.success ? 'SUCCESS' : 'FAILED';
        tdRes.appendChild(span);
        tr.appendChild(tdRes);

        var tdRaw = document.createElement('td');
        tdRaw.style.textAlign = 'right';
        var btn = document.createElement('button');
        btn.className = 'logs-raw-btn';
        btn.textContent = 'Copy';
        (function(r){
            btn.addEventListener('click', function(){
                try {
                    var txt = JSON.stringify(r, null, 2);
                    copyTextToClipboard(txt);
                    showToast('Log entry copied', 'success');
                } catch (e) {
                    showToast('Copy failed', 'error');
                }
            });
        })(row);
        tdRaw.appendChild(btn);
        tr.appendChild(tdRaw);

        tbody.appendChild(tr);
    }

    var headers = document.querySelectorAll('#logsTable thead th[data-col]');
    for (var h = 0; h < headers.length; h++) {
        (function(header){
            header.onclick = function(){
                var col = header.getAttribute('data-col');
                sortTableByColumn(attempts, col);
            };
        })(headers[h]);
    }
}

function sortTableByColumn(arr, col) {
    if (!col) return;
    var direction = 1;
    if (sortTableByColumn.lastCol === col) direction = -sortTableByColumn.lastDir;
    sortTableByColumn.lastCol = col;
    sortTableByColumn.lastDir = direction;

    arr.sort(function(a,b){
        var va = a && a[col] !== undefined ? a[col] : '';
        var vb = b && b[col] !== undefined ? b[col] : '';
        if (col === 'timestamp') {
            return direction * ((new Date(va)).getTime() - (new Date(vb)).getTime());
        }
        if (col === 'success') {
            return direction * ((va === vb) ? 0 : (va ? 1 : -1));
        }
        return direction * String(va).localeCompare(String(vb));
    });

    renderLogsTable(arr);
}

function copyTextToClipboard(text) {
    try {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
    } catch (e) {
        console.error('copy failed', e);
    }
}

function loadLogs() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/loginAttempts?ts=' + new Date().getTime(), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var dlLink = document.getElementById('downloadLogsLink');
            var dlFallback = document.getElementById('downloadFallback');
            function showDownload(show){
                var v = show ? 'inline-block' : 'none';
                if (dlLink) dlLink.style.display = v;
                if (dlFallback) dlFallback.style.display = v;
            }

            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    renderLogsTable(data);
                    showDownload(true);
                } catch (e) {
                    document.getElementById('logsEmpty').style.display = '';
                    document.getElementById('logsTable').style.display = 'none';
                    showDownload(false);
                }
            } else if (xhr.status === 403) {
                document.getElementById('logsEmpty').textContent = '⚠️ Forbidden — you do not have permission to view logs.';
                document.getElementById('logsEmpty').style.display = '';
                document.getElementById('logsTable').style.display = 'none';
                showDownload(false);
            } else if (xhr.status === 404) {
                document.getElementById('logsEmpty').textContent = '⚠️ Logs file not found (404).';
                document.getElementById('logsEmpty').style.display = '';
                document.getElementById('logsTable').style.display = 'none';
                showDownload(false);
            } else {
                document.getElementById('logsEmpty').textContent = '⚠️ Failed to load logs (status ' + xhr.status + ')';
                document.getElementById('logsEmpty').style.display = '';
                document.getElementById('logsTable').style.display = 'none';
                showDownload(false);
            }
        }
    };
    xhr.send();
}

document.addEventListener('DOMContentLoaded', function () {
    var search = document.getElementById('logsSearch');
    var failed = document.getElementById('showFailedOnly');
    var limit = document.getElementById('logsLimit');

    if (search) search.addEventListener('input', function(){ loadLogs(); });
    if (failed) failed.addEventListener('change', function(){ loadLogs(); });
    if (limit) limit.addEventListener('change', function(){ loadLogs(); });

    var logsTab = document.querySelector('[data-page="logs"]');
    if (logsTab) logsTab.addEventListener('click', loadLogs);

    var logsPage = document.getElementById('logs-page');
    if (logsPage && logsPage.classList.contains('active')) loadLogs();
});

function openDownloadModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    const toInput = document.getElementById('downloadTo');
    const fromInput = document.getElementById('downloadFrom');
    const wholeDay = document.getElementById('downloadWholeDay');

    const now = new Date();
    const toIso = now.toISOString().slice(0,10);
    const from = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const fromIso = from.toISOString().slice(0,10);

    if (fromInput) fromInput.value = fromIso;
    if (toInput) toInput.value = toIso;
    if (wholeDay) wholeDay.checked = true;

    const modal = document.getElementById('downloadModal');
    if (modal) {
        modal.style.display = '';
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
}

function buildServerDownloadUrl(fromISO, toISO) {
    return '/api/downloadLoginAttempts?from=' + encodeURIComponent(fromISO) + '&to=' + encodeURIComponent(toISO);
}

function fallbackFetchAndFilter(fromDate, toDateInclusive, filename) {
    return fetch('/api/loginAttempts')
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch logs for fallback: ' + res.status);
        return res.json();
    })
    .then(data => {
        var attempts = Array.isArray(data) ? data.slice() : (data.attempts && Array.isArray(data.attempts) ? data.attempts.slice() : []);
        const startMs = fromDate.getTime();
        const endMs = toDateInclusive.getTime();
        const filtered = attempts.filter(function(it){
            try {
                const t = new Date(it.timestamp).getTime();
                return t >= startMs && t <= endMs;
            } catch(e) { return false; }
        });
        const blob = new Blob([JSON.stringify(filtered, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast('Download complete (fallback)', 'success');
    });
}

function startLogsDownload() {
    const fromInput = document.getElementById('downloadFrom');
    const toInput = document.getElementById('downloadTo');
    const wholeDay = document.getElementById('downloadWholeDay');

    if (!fromInput || !toInput) {
        showToast('Date inputs not present', 'error');
        return;
    }

    const fromVal = fromInput.value;
    const toVal = toInput.value;
    if (!fromVal || !toVal) {
        showToast('Please choose both From and To dates', 'error');
        return;
    }

    const fromDate = new Date(fromVal + 'T00:00:00Z');
    let toDate;
    if (wholeDay && wholeDay.checked) {
        toDate = new Date(toVal + 'T23:59:59.999Z');
    } else {
        toDate = new Date(toVal + 'T00:00:00Z');
    }

    if (fromDate.getTime() > toDate.getTime()) {
        showToast('From date must be before or equal to To date', 'error');
        return;
    }

    closeDownloadModal();

    const url = buildServerDownloadUrl(fromVal, toVal);
    const filename = 'login_attempts_' + fromVal + '_to_' + toVal + '.json';

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);

    fetch(url, { method: 'HEAD' }).then(function(headResp){
        if (headResp.ok) {
            a.click();
            a.remove();
            showToast('Download started', 'info');
        } else {
            return fetch(url);
        }
    }).then(function(getResp){
        if (!getResp) return;
        const contentType = getResp.headers.get('content-type') || '';
        if (getResp.ok && (contentType.indexOf('application/json') !== -1 || contentType.indexOf('application/octet-stream') !== -1)) {
            return getResp.blob().then(function(blob){
                const u = URL.createObjectURL(blob);
                const b = document.createElement('a');
                b.href = u;
                b.download = filename;
                document.body.appendChild(b);
                b.click();
                b.remove();
                URL.revokeObjectURL(u);
                showToast('Download complete', 'success');
            });
        } else {
            a.remove();
            return fallbackFetchAndFilter(fromDate, toDate, filename);
        }
    }).catch(function(err){
        a.remove();
        console.warn('Download ranged attempt failed, falling back:', err);
        fallbackFetchAndFilter(fromDate, toDate, filename);
    });
}

function showDownload(show){
    var dlLink = document.getElementById('downloadLogsLink');
    var v = show ? 'inline-block' : 'none';
    if (dlLink) dlLink.style.display = v;
}

function clearRebootForm() {
    var form = document.getElementById('rebootForm');
    if (form && typeof form.reset === 'function') form.reset();
    var info = document.getElementById('rebootInfo');
    if (info) info.textContent = '';
}

function trimStr(s) {
    return (s === undefined || s === null) ? '' : String(s).replace(/^\s+|\s+$/g, '');
}

function scheduleReboot() {
    var timeEl = document.getElementById('rebootTime');
    var passEl = document.getElementById('rebootPassword');
    var scriptEl = document.getElementById('rebootScript');
    var userEl = document.getElementById('rebootUser');

    var time = timeEl ? trimStr(timeEl.value) : '';
    var password = passEl ? trimStr(passEl.value) : '';
    var scriptPath = scriptEl ? trimStr(scriptEl.value) : '';
    var runAs = userEl ? trimStr(userEl.value) : 'root';

    if (!time) {
        showToast('Please choose a date and time for the reboot', 'error');
        return;
    }

    function enc(s){ return encodeURIComponent(s === null ? '' : String(s)); }
    var body = 'time=' + enc(time)
             + '&password=' + enc(password)
             + '&scriptPath=' + enc(scriptPath)
             + '&runAs=' + enc(runAs);

    try { console.log('[scheduleReboot] sending body:', body); } catch (e) {}

    var submitBtn = null;
    try { submitBtn = document.querySelector('#rebootForm .primary'); } catch (e) { submitBtn = null; }
    if (submitBtn) submitBtn.disabled = true;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/scheduleReboot', true);

    try { xhr.withCredentials = true; } catch (e) {}

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (submitBtn) submitBtn.disabled = false;

        if (xhr.status >= 200 && xhr.status < 300) {
            var resp = {};
            try { resp = JSON.parse(xhr.responseText); } catch (e) { resp = {}; }
            showToast('Reboot scheduled', 'success');
            var info = document.getElementById('rebootInfo');
            if (info) info.textContent = resp.message || 'Reboot scheduled successfully.';
        } else {
            var err = xhr.responseText || ('Server returned ' + xhr.status);
            console.error('[scheduleReboot] error:', err);
            showToast('Failed to schedule reboot: ' + err, 'error');
            var info2 = document.getElementById('rebootInfo');
            if (info2) info2.textContent = 'Error: ' + err;
        }
    };

    try {
        xhr.send(body);
    } catch (err) {
        if (submitBtn) submitBtn.disabled = false;
        console.error('[scheduleReboot] XHR send failed', err);
        showToast('Failed to send request: ' + (err && err.message ? err.message : 'unknown'), 'error');
        var info3 = document.getElementById('rebootInfo');
        if (info3) info3.textContent = 'Error: ' + (err && err.message ? err.message : 'unknown');
    }
}

function saveCameraName() {
    var name = document.getElementById('cameraNameInput').value;
    if (!name) {
        showToast('Camera name cannot be empty', 'error');
        return;
    }
    alert('Name will be changed after restart.');
    fetch('/api/updateCameraName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
    }).then(res => res.json()).then(data => {
        if (data.success) {
            showToast('Camera name updated in config file.', 'success');
        } else {
            showToast('Failed to update camera name', 'error');
        }
    }).catch(() => showToast('Error updating camera name', 'error'));
}
    
(function(){
  document.addEventListener('DOMContentLoaded', function() {
    try {
      var SHOW_MULTIPLE_CROSSHAIRS = false;
      var VIDEO_BASE = { w: 1920, h: 1080 }; // coords in JSON are based on this resolution

      window.currentActiveStream = window.currentActiveStream || 1;

      var wrappers = Array.prototype.slice.call(document.querySelectorAll('.video-wrapper'));
      if (wrappers.length === 0) {
        console.warn('DEBUG: .video-wrapper not found -- falling back to #fastlive-page or body');
        var fallback = document.getElementById('fastlive-page') || document.body;
        wrappers = [fallback];
      }

      function createOverlayForWrapper(wrapperEl, idx) {
        var cid = 'overlay-container-stream-' + idx;
        var existing = wrapperEl.querySelector('#' + cid);
        if (existing) {
          existing.parentNode.removeChild(existing);
        }

        var cs = window.getComputedStyle(wrapperEl);
        if (cs.position === 'static') {
          wrapperEl.style.position = 'relative';
        }

        var container = document.createElement('div');
        container.id = cid;
        container.className = 'overlay-container';
        container.style.position = 'absolute';
        container.style.inset = '0px';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9999';
        container.style.background = 'transparent';
        container.style.overflow = 'visible';
        wrapperEl.appendChild(container);

        return container;
      }

      var containersByStream = {};
      containersByStream[1] = createOverlayForWrapper(wrappers[0], 1);
      containersByStream[2] = containersByStream[1];

      window.streamPositions = window.streamPositions || {
        1: { x: 0.5, y: 0.5 },
        2: { x: 0.5, y: 0.5 }
      };

      function applyNormalizedPositionToEl(el, norm) {
        if (!el || !norm) return;
        var nx = Math.max(0, Math.min(1, norm.x));
        var ny = Math.max(0, Math.min(1, norm.y));
        el.style.left = (nx * 100) + '%';
        el.style.top  = (ny * 100) + '%';
        el.style.transform = 'translate(-50%, -50%)';
      }

      function updateCrosshairScale() {
        var containerEl = wrappers[0];
        if (!containerEl) return;
        var rect = containerEl.getBoundingClientRect();
        var scale = rect.width / VIDEO_BASE.w;
        var crosshairs = container.querySelectorAll('.crosshair-overlay');
        Array.prototype.forEach.call(crosshairs, function(img) {
          var nw = img.dataset.naturalWidth;
          var nh = img.dataset.naturalHeight;
          if (nw && nh) {
            img.style.width = (nw * scale) + 'px';
            img.style.height = (nh * scale) + 'px';
          }
        });
      }

      function createCrosshairInContainer(streamNumber, container) {
        var id = 'crosshair-stream-' + streamNumber;
        var img = container.querySelector('#' + id);
        if (!img) {
          img = document.createElement('img');
          img.id = id;
          img.className = 'crosshair-overlay';
          img.dataset.stream = String(streamNumber);

          img.style.position = 'absolute';
          img.style.pointerEvents = 'none';
          img.style.zIndex = String(10000 + streamNumber);
          img.style.width = 'auto';
          img.style.height = 'auto';
          img.style.maxWidth = 'none';
          img.style.maxHeight = 'none';

          img.addEventListener('load', function() {
            img.dataset.naturalWidth = img.naturalWidth;
            img.dataset.naturalHeight = img.naturalHeight;
            updateCrosshairScale();
          });
          img.addEventListener('error', function(e) {
            console.warn('DEBUG: crosshair failed to load for stream', streamNumber, e);
            setTimeout(function() {
              if (!img.naturalWidth || img.naturalWidth === 0) {
                var color = streamNumber === 1 ? 'red' : 'blue';
                img.src = 'data:image/svg+xml;utf8,' +
                  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">' +
                                    '<circle cx="24" cy="24" r="2" fill="' + color + '"/>' +
                                    '<line x1="0" y1="24" x2="48" y2="24" stroke="' + color + '" stroke-width="1"/>' +
                                    '<line x1="24" y1="0" x2="24" y2="48" stroke="' + color + '" stroke-width="1"/>' +
                                    '</svg>');
              }
            }, 700);
          });

          container.appendChild(img);
        }

        img.style.transform = 'translate(-50%, -50%)';

        var desiredSrc = window.location.origin + '/tmp/active_cross' + streamNumber + '.png';
        if (img.src !== desiredSrc) {
          img.src = desiredSrc;
          console.log('DEBUG: set crosshair src for stream', streamNumber, '->', desiredSrc);
        }

        applyNormalizedPositionToEl(img, window.streamPositions[streamNumber]);

        img.style.display = (SHOW_MULTIPLE_CROSSHAIRS || streamNumber === window.currentActiveStream) ? 'block' : 'none';

        return img;
      }

      var ch1 = createCrosshairInContainer(1, containersByStream[1]);
      var ch2 = createCrosshairInContainer(2, containersByStream[2]);

      window.updateCrosshairPosition = function(streamNumber, coords) {
        if (!coords || typeof streamNumber === 'undefined') return;

        var norm = { x: 0.5, y: 0.5 };

        if (typeof coords.x === 'number' && typeof coords.y === 'number') {
          if (coords.x <= 1 && coords.y <= 1) {
            norm.x = coords.x;
            norm.y = coords.y;
          } else {
            norm.x = coords.x / VIDEO_BASE.w;
            norm.y = coords.y / VIDEO_BASE.h;
          }
        } else {
          console.warn('DEBUG: coords missing numeric x/y for stream', streamNumber, coords);
          return;
        }

        norm.x = Math.max(0, Math.min(1, norm.x));
        norm.y = Math.max(0, Math.min(1, norm.y));

        window.streamPositions[streamNumber] = norm;

        var container = containersByStream[streamNumber];
        if (!container) return;
        var el = container.querySelector('#crosshair-stream-' + streamNumber);
        if (!el) {
          el = createCrosshairInContainer(streamNumber, container);
        }
        applyNormalizedPositionToEl(el, norm);

        if (!SHOW_MULTIPLE_CROSSHAIRS) {
          if (streamNumber === window.currentActiveStream) {
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        }
      };

      window.switchStream = function(streamNumber) {
        try {
          window.currentActiveStream = streamNumber;

    if (streamNumber === 1) {
        window.currentVideoWidth = 1350;
        window.currentCameraType = 2; // ir
    } else {
        window.currentVideoWidth = 1920;
        window.currentCameraType = 1; // day
    }

    fetch('/api/setCurrentStream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream: window.currentCameraType })
    }).catch(console.error);
          window.currentVideoHeight = 1080;

          var iframe = document.getElementById('webrtcFrame');
          if (iframe) {
            iframe.src = getWebrtcUrl(streamNumber, '');
          }

          var allCrosshairs = document.querySelectorAll('.crosshair-overlay');
          Array.prototype.forEach.call(allCrosshairs, function(el) {
            el.style.display = 'none';
          });

          var active = document.getElementById('crosshair-stream-' + streamNumber);
          if (!active) {
            active = createCrosshairInContainer(streamNumber, containersByStream[streamNumber]);
          }
          active.style.display = 'block';
          if (window.streamPositions && window.streamPositions[streamNumber]) {
            applyNormalizedPositionToEl(active, window.streamPositions[streamNumber]);
          }

          var buttons = document.querySelectorAll('.stream-btn');
          Array.prototype.forEach.call(buttons, function(btn, idx) {
            if (idx + 1 === streamNumber) btn.classList.add('active');
            else btn.classList.remove('active');
          });

          if (typeof window.fetchAndUpdateCoords === 'function') {
            window.fetchAndUpdateCoords(streamNumber);
          } else if (typeof window.robustFetchCoords === 'function') {
            window.robustFetchCoords(streamNumber);
          }
        } catch (err) {
          console.error('Patched switchStream error:', err);
        }
      };

      window.fetchAndUpdateCoords = function(streamNumber) {
        if (!streamNumber) return;
        var COORD_PATHS_TRY = [
          '/tmp/overlay_coords' + streamNumber + '.json',
          '/overlay/overlay_coords' + streamNumber + '.json',
          '/overlay_coords' + streamNumber + '.json'
        ];
        var tried = 0;
        function tryPath(idx) {
          if (idx >= COORD_PATHS_TRY.length) {
            console.warn('DEBUG: no coords available for stream', streamNumber);
            return;
          }
          var path = COORD_PATHS_TRY[idx] + '?_=' + Date.now();
          var xhr = new XMLHttpRequest();
          xhr.open('GET', path, true);
          xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                var data = JSON.parse(xhr.responseText);
                window.updateCrosshairPosition(streamNumber, data);
              } catch (e) {
                console.error('DEBUG: coords JSON parse error for', path, e);
              }
            } else {
              console.warn('DEBUG: path failed', path, 'status', xhr.status);
              tryPath(idx + 1);
            }
          };
          xhr.onerror = function() {
            console.warn('DEBUG: xhr error for', path);
            tryPath(idx + 1);
          };
          xhr.send();
        }
        tryPath(0);
      };

      window.robustFetchCoords = window.robustFetchCoords || window.fetchAndUpdateCoords;

      window.addEventListener('resize', function() {
        [1,2].forEach(function(s){
          var el = document.getElementById('crosshair-stream-' + s);
          if (el && window.streamPositions && window.streamPositions[s]) {
            applyNormalizedPositionToEl(el, window.streamPositions[s]);
          }
        });
        updateCrosshairScale();
      });

      // Test helper
      window.testCrosshair = function() {
        [1,2].forEach(function(s) {
          var src = window.location.origin + '/tmp/active_cross' + s + '.png?_=' + Date.now();
          var t = new Image();
          t.onload = function() { };
          t.onerror = function() { console.error('FAILED Image load FAILED for stream', s, src); };
          t.src = src;
        });
        var allCrosshairs = document.querySelectorAll('.crosshair-overlay');
        allCrosshairs.forEach(function(el) {
        });
      };

      window.fetchAndUpdateCoords(1);
      window.fetchAndUpdateCoords(2);

      setTimeout(function(){
        window.switchStream(window.currentActiveStream || 1);
        window.testCrosshair();
      }, 300);


    } catch (err) {
      console.error('DEBUG: Overlay init exception', err);
    }
  });
})();

(function(){
  // CONFIG
  var POLL_MS = 500;
  var COORD_URLS = {
    1: '/tmp/overlay_coords1.json',
    2: '/tmp/overlay_coords2.json'
  };
  var IMG_BASE = function(n){ return window.location.origin + '/tmp/active_cross' + n + '.png'; };

  var lastModified = {}; // by url
  var lastEtag = {};
  var lastBodyHash = {}; // fallback compare
  var polls = {}; // timers
  var invisible = false;

  document.addEventListener('visibilitychange', function(){
    invisible = document.hidden;
    if (invisible) {
      Object.keys(polls).forEach(function(k){ clearTimeout(polls[k]); delete polls[k]; });
    } else {
      Object.keys(COORD_URLS).forEach(function(s){ scheduleCheck('coords', COORD_URLS[s], Number(s)); });
      scheduleCheck('image', IMG_BASE(1), 1);
      scheduleCheck('image', IMG_BASE(2), 2);
    }
  });

  function headRequest(url, cb) {
    var controller = new AbortController();
    var timer = setTimeout(function(){ controller.abort(); }, 3000);
    fetch(url, { method: 'HEAD', cache: 'no-store', signal: controller.signal })
      .then(function(resp){
        clearTimeout(timer);
        cb(null, resp);
      })
      .catch(function(err){
        clearTimeout(timer);
        cb(err);
      });
  }

  function getJSON(url, cb) {
    var controller = new AbortController();
    var timer = setTimeout(function(){ controller.abort(); }, 4000);
    fetch(url, { cache: 'no-store', signal: controller.signal })
      .then(function(resp){
        clearTimeout(timer);
        if (!resp.ok) return cb(new Error('Status ' + resp.status));
        return resp.json().then(function(j){ cb(null, j, resp); }, function(e){ cb(e); });
      })
      .catch(function(err){ clearTimeout(timer); cb(err); });
  }

  function getHeadAndActForImage(stream, url) {
    headRequest(url, function(err, resp){
      if (err || !resp) {
        scheduleCheck('image', url, stream);
        return;
      }
      var lm = resp.headers.get('last-modified');
      var et = resp.headers.get('etag');

      if ((lm && lm !== lastModified[url]) || (et && et !== lastEtag[url])) {
        lastModified[url] = lm;
        lastEtag[url] = et;
        var id = 'crosshair-stream-' + stream;
        var el = document.getElementById(id);
        var newSrc = url + '?_=' + Date.now();
        if (el) {
          el.src = newSrc;
        } else {
          var t = new Image();
          t.src = newSrc;
        }
      }
      scheduleCheck('image', url, stream);
    });
  }

  function getAndCompareJSON(stream, url) {
    getJSON(url, function(err, data, resp){
      if (err) {
        scheduleCheck('coords', url, stream);
        return;
      }
      try {
        var bodyStr = JSON.stringify(data);
        var hash = bodyStr; // for small JSON using the string itself is fine
      } catch (e) {
        scheduleCheck('coords', url, stream);
        return;
      }

      if (lastBodyHash[url] !== hash) {
        lastBodyHash[url] = hash;
        if (window.updateCrosshairPosition) {
          window.updateCrosshairPosition(stream, data);
        }
      }
      scheduleCheck('coords', url, stream);
    });
  }

  function checkCoords(stream, url) {
    headRequest(url, function(err, resp){
      if (err || !resp) {
        getAndCompareJSON(stream, url);
        return;
      }
      var lm = resp.headers.get('last-modified');
      var et = resp.headers.get('etag');

      if ((lm && lm !== lastModified[url]) || (et && et !== lastEtag[url])) {
        lastModified[url] = lm;
        lastEtag[url] = et;
        getJSON(url, function(err2, data){
          if (!err2 && data) {
            if (window.updateCrosshairPosition) {
              window.updateCrosshairPosition(stream, data);
            } else {
              console.warn('Poll: updateCrosshairPosition not found');
            }
          } else {
            console.warn('Poll: failed to GET coords after HEAD change', err2);
          }
          scheduleCheck('coords', url, stream);
        });
      } else {
        scheduleCheck('coords', url, stream);
      }
    });
  }

  function scheduleCheck(kind, url, stream) {
    if (invisible) return;
    clearTimeout(polls[url]);
    polls[url] = setTimeout(function(){
      try {
        if (kind === 'coords') checkCoords(stream, url);
        else if (kind === 'image') getHeadAndActForImage(stream, url);
      } catch(e){ console.error('Poll error', e); scheduleCheck(kind, url, stream); }
    }, POLL_MS);
  }

  Object.keys(COORD_URLS).forEach(function(s){
    scheduleCheck('coords', COORD_URLS[s], Number(s));
  });
  scheduleCheck('image', IMG_BASE(1), 1);
  scheduleCheck('image', IMG_BASE(2), 2);

  Object.keys(COORD_URLS).forEach(function(s){
    (function(stream){ getJSON(COORD_URLS[stream], function(err,data,resp){
      if (!err && data && window.updateCrosshairPosition) {
        window.updateCrosshairPosition(stream, data);
      }
      if (resp && resp.headers) {
        var lm = resp.headers.get('last-modified'), et = resp.headers.get('etag');
        if (lm) lastModified[COORD_URLS[stream]] = lm;
        if (et) lastEtag[COORD_URLS[stream]] = et;
      }
    }); })(s);
  });

  [1,2].forEach(function(n){
    (function(stream){
      headRequest(IMG_BASE(stream), function(err, resp){
        if (!err && resp && resp.headers) {
          lastModified[IMG_BASE(stream)] = resp.headers.get('last-modified');
          lastEtag[IMG_BASE(stream)] = resp.headers.get('etag');
        }
      });
    })(n);
  });

  window._pollOverlay = {
    POLL_MS: POLL_MS,
    stop: function(){ Object.keys(polls).forEach(function(k){ clearTimeout(polls[k]); delete polls[k]; }); },
    start: function(){ Object.keys(COORD_URLS).forEach(function(s){ scheduleCheck('coords', COORD_URLS[s], Number(s)); }); scheduleCheck('image', IMG_BASE(1),1); scheduleCheck('image', IMG_BASE(2),2); }
  };

})();

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


    Camera.prototype.killRtspServer = function() {
        if (this.rtspServer) {
            utils.log.info("Killing RTSP server");
            this.rtspServer.kill('SIGTERM');
            this.rtspServer = null;
            return { success: true, message: "RTSP server killed" };
        }
        return { success: false, message: "No RTSP server running" };
    };

    Camera.prototype.respawnRtspServer = function() {
        this.stopRtsp();
        setTimeout(() => {
            this.startRtsp();
        }, 1000);
        return { success: true, message: "RTSP server respawned" };
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