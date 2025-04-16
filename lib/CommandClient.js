const net = require('net');
const dataParser = require('./data_parser');

class CommandClient {
    constructor() {
        this.HOST = '192.168.0.31';
        this.PORT = 2222;
        this.HOST1 = '192.168.0.31';
        this.PORT1 = 8888;
        this.connected = false;
        this.connected1 = false;
        this.queue = [];
        this.queue1 = [];
        this.latestClientData = null;
        this.latestClientData1 = null;

        this.client = new net.Socket();
        this.client1 = new net.Socket();

        this.client.on('connect', () => {
            console.log('[CommandClient] Connected to device');
            this.connected = true;
            this.flushQueue();
            const cmd = `>ADR=Sns_OD/SMD=Poll_Sens_On/`;
            const cmd1 = `>ADR=Correct_constOD/SMD=CC_get_full_CC/`;
            this.sendCommand(cmd);
            this.sendCommand(cmd1);
        });

        this.client.on('data', (data) => {
            const text = data.toString();
            const parsed = dataParser.parseData(text);
            this.latestClientData = parsed;
            console.log('[CommandClient] Latest Client Data:', this.latestClientData);
        });

        this.client.on('error', (err) => {
            console.error('[CommandClient] Error:', err.message);
            this.connected = false;
        });

        this.client.on('close', () => {
            console.log('[CommandClient] Connection closed');
            this.connected = false;
        });

        this.client1.on('connect', () => {
            console.log('[CommandClient1] Connected to device');
            this.connected1 = true;
            this.flushQueue();
            const cmd = `>ADR=STMD/SMD=Poll_STMD_On/`;
            const cmd1 = `>ADR=Sns/SMD=Poll_Sens_On/`;
            this.sendCommand1(cmd);
            this.sendCommand1(cmd1);
        });

        this.client1.on('data', (data) => {
            const text = data.toString();
            const parsed = dataParser.parseData(text);
            this.latestClientData1 = parsed;
            console.log('[CommandClient1] Latest Client Data1:', this.latestClientData1);
        });

        this.client1.on('error', (err) => {
            console.error('[CommandClient1] Error:', err.message);
            this.connected1 = false;
        });

        this.client1.on('close', () => {
            console.log('[CommandClient1] Connection closed');
            this.connected1 = false;
        });

        // Connect once at startup
        this.client.connect(this.PORT, this.HOST);
        this.client1.connect(this.PORT1, this.HOST1);
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

    sendCommand1(cmd) {
        if (this.connected1) {
            console.log('[CommandClient1] Sending:', cmd);
            this.client1.write(cmd);
        } else {
            console.warn('[CommandClient1] Not connected, queuing:', cmd);
            this.queue1.push(cmd);
        }
    }

    flushQueue() {
        while (this.queue.length > 0) {
            const cmd = this.queue.shift();
            this.sendCommand(cmd);
        }
    }

    flushQueue1() {
        while (this.queue1.length > 0) {
            const cmd = this.queue1.shift();
            this.sendCommand1(cmd);
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

    shutdown1() {
        if (!this.client1.destroyed) {
            this.client1.end(() => {
                console.log('[CommandClient1] Socket closed gracefully');
            });

            setTimeout(() => {
                if (!this.client.destroyed) {
                    console.warn('[CommandClient1] Force closing socket...');
                    this.client1.destroy();
                }
            }, 3000);
        }
    }

    // Port 8888 (MM) Getters

    // Port 8888 (MM) Setters

    setAccAz(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_accel_Az/LD=${value}/`;
        console.log('[CommandClient1] Set Acceleration Az command:', cmd);
        this.sendCommand1(cmd);
    }

    setAccEl(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_accel_El/LD=${value}/`;
        console.log('[CommandClient1] Set Acceleration El command:', cmd);
        this.sendCommand1(cmd);
    }

    setMinFrAz(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_min_fr_Az/LD=${value}/`;
        console.log('[CommandClient1] Set Minimum frequency Az command:', cmd);
        this.sendCommand1(cmd);
    }

    setMinFrEl(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_min_fr_El/LD=${value}/`;
        console.log('[CommandClient1] Set Minimum frequency El command:', cmd);
        this.sendCommand1(cmd);
    }

    setMaxFrAz(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_max_fr_Az/LD=${value}/`;
        console.log('[CommandClient1] Set Maximum frequency Az command:', cmd);
        this.sendCommand1(cmd);
    }

    setMaxFrEl(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_max_fr_El/LD=${value}/`;
        console.log('[CommandClient1] Set maximum frequency El command:', cmd);
        this.sendCommand1(cmd);
    }

    setUp(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_tgt_pe_El/LD=262143/`;
        console.log('[CommandClient1] PTZ Up command:', cmd);
        this.sendCommand1(cmd);
    }

    setDown(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_tgt_pe_El/LD=0/`;
        console.log('[CommandClient1] PTZ Down command:', cmd);  
        this.sendCommand1(cmd);      
    }

    setRight(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_tgt_pe_Az/LD=271000/`;
        console.log('[CommandClient1] PTZ Right command:', cmd);
        this.sendCommand1(cmd);
    }

    setLeft(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_tgt_pe_Az/LD=0/`;
        console.log('[CommandClient1] PTZ Left command:', cmd);
        this.sendCommand1(cmd);
    }

    setMiddle(value) {
        const cmd = `>ADR=STMD/SMDD=STMD_tgt_pe_Az/LD=136000/`;
        const cmd1 = `>ADR=STMD/SMDD=STMD_tgt_pe_El/LD=131000/`;
        console.log('[CommandClient1] PTZ Middle command:', cmd);
        this.sendCommand1(cmd);
        this.sendCommand1(cmd1);
    }

    setPTZStop(value) {
        const cmd = `>ADR=STMD/SMD=STMD_Stop_El/`;
        const cmd1 = `>ADR=STMD/SMD=STMD_Stop_Az/`;
        console.log('[CommandClient] PTZ Stop command:', cmd);
        this.sendCommand1(cmd);
        this.sendCommand1(cmd1);
    }

    // Port 2222 (OM) Setters

    setBrightness(value) {
        const cmd = `>ADR=IR_Camera/SMDD=IRC_brithness/LD=${value}/`;
        console.log('[CommandClient] Prepared brightness command:', cmd); 
        this.sendCommand(cmd);
    }

    setZoom(zoomLevel) {
        console.log('Setting zoom level to:', zoomLevel);
        const cmd = `>ADR=IR_Camera/SMDD=IRC_zoom/LD=${zoomLevel}/`;
        this.sendCommand(cmd);
    }

    setFarFocus(farFocus) {
        console.log('Setting focus to:', farFocus);
        const cmd = `>ADR=IR_Camera/SMD=IRC_Far_Focus/`;
        this.sendCommand(cmd);
    }

    setNearFocus(nearFocus) {
        console.log('Setting focus to:', nearFocus);
        const cmd = `>ADR=IR_Camera/SMD=IRC_Near_Focus/`;
        this.sendCommand(cmd);
    }

    setStopFocus(farFocus) {
        console.log('Setting focus to:', farFocus);
        const cmd = `>ADR=IR_Camera/SMD=IRC_Stop_Focus/`;
        this.sendCommand(cmd);
    }

    setTeleZoom(teleZoom) {
        console.log('Setting Day Camera Tele Zoom to:', teleZoom);
        const cmd = `>ADR=Dey_Camera/SMD=DyC_zoom_tele/`;
        this.sendCommand (cmd);
    }

    setWideZoom(wideZoom) {
        console.log('Setting Day Camera Wide Zoom to:', wideZoom);
        const cmd = `>ADR=Dey_Camera/SMD=DyC_zoom_wide/`;
        this.sendCommand(cmd);
    }

    setDayZoomStop(DayZoomStop) {
        console.log('Setting Day Camera Zoom Stop to:', DayZoomStop);
        const cmd = `>ADR=Dey_Camera/SMD=DyC_zoom_stop/`;
        this.sendCommand(cmd);
    }

    setDayZoom(value) {
        console.log('Setting Day Camera Zoom to:', value);
        const cmd = `>ADR=Dey_Camera/SMDD=DyC_zoom/LD=${value}/`;
        this.sendCommand(cmd);
    }

    setContrast(value) {
        const cmd = `>ADR=IR_Camera/SMDD=IRC_contrast/LD=${value}/`;
        this.sendCommand(cmd);
    }

    setWhiteHot(value) {
        const cmd = `>ADR=IR_Camera/SMD=IRC_white_hot/`;
        this.sendCommand(cmd);
    }

    setBlackHot(value) {
        const cmd = `>ADR=IR_Camera/SMD=IRC_black_hot/`;
        this.sendCommand(cmd);
    }
}

module.exports = new CommandClient();