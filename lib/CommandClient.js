const net = require('net');

class CommandClient {
    constructor() {
        this.HOST = '192.168.0.31';
        this.PORT = 2222;
        this.connected = false;
        this.queue = [];

        this.client = new net.Socket();

        this.client.on('connect', () => {
            console.log('[CommandClient] Connected to device');
            this.connected = true;
            this.flushQueue();
        });

        this.client.on('data', (data) => {
            console.log('[CommandClient] Received:', data.toString());
        });

        this.client.on('error', (err) => {
            console.error('[CommandClient] Error:', err.message);
            this.connected = false;
        });

        this.client.on('close', () => {
            console.log('[CommandClient] Connection closed');
            this.connected = false;
        });

        // Connect once at startup
        this.client.connect(this.PORT, this.HOST);
    }

    sendCommand(cmd) {
        if (this.connected) {
            console.log('[CommandClient] Sending:', cmd);
            this.client.write(cmd);
        } else {
            console.warn('[CommandClient] Not connected, queuing:', cmd);
            this.queue.push(cmd);
        }
    }

    flushQueue() {
        while (this.queue.length > 0) {
            const cmd = this.queue.shift();
            this.sendCommand(cmd);
        }
    }

    shutdown() {
        if (!this.client.destroyed) {
            this.client.end(() => {
                console.log('[CommandClient] Socket closed gracefully');
            });

            setTimeout(() => {
                if (!this.client.destroyed) {
                    console.warn('[CommandClient] Force closing socket...');
                    this.client.destroy();
                }
            }, 3000);
        }
    }

    setBrightness(value) {
        const cmd = `>ADR=IR_Camera/SMDD=IRC_brithness/LD=${value}/`;
        console.log('[CommandClient] Prepared brightness command:', cmd); // 🔍
        this.sendCommand(cmd);
    }

    // Send zoom level to the camera
    setZoom(zoomLevel) {
        console.log('Setting zoom level to:', zoomLevel);
        // Send zoom change command to the camera (e.g., sending specific command format)
        const cmd = `>ADR=IR_Camera/SMDD=IRC_zoom/LD=${zoomLevel}/`;
        client.write(cmd);
    }

    setContrast(value) {
        const cmd = `>ADR=IR_Camera/SMDD=IRC_contrast/LD=${value}/`;
        this.sendCommand(cmd);
    }
}

module.exports = new CommandClient();