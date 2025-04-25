const net = require('net');
const dataParser = require('./data_parser');
const fs = require('fs');
const sk42_to_wgs = require('./sk42_to_wgs');


class ArtilleryAngle {
    constructor(angleDegrees = 0) {
        this.angleDegrees = angleDegrees;
    }

    get angleDirectionalFull() {
        let dir = (Math.round(this.angleDegrees / 6 * 100) / 100) % 60;
        if (dir < 0) dir += 60;
        return this.roundTo2Digits(dir);
    }

    get angleDirectionalBeforeDot() {
        return this.angleDirectionalFull.split('.')[0];
    }

    get angleDirectionalAfterDot() {
        return this.angleDirectionalFull.split('.')[1];
    }

    get angleDirectionalRange30Full() {
        let dir = this.angleDirectionalFull % 60;
        if (Math.abs(dir) > 30) {
            dir -= Math.sign(dir) * 60;
        }
        return this.roundTo2Digits(dir);
    }

    get angleDirectionalRange30BeforeDot() {
        return this.angleDirectionalRange30Full.split('.')[0];
    }

    get angleDirectionalRange30AfterDot() {
        return this.angleDirectionalRange30Full.split('.')[1];
    }

    roundTo2Digits(value) {
        return Number(value).toFixed(2);
    }
}

function encoderAzimuthToAngle(azimuth) {
    return (azimuth - 136000) * 0.0013733;
}

function encoderElevationToAngle(elevation) {
    return (elevation - 131000) * 0.0013733;
}

function cameraAngleCorrections(azimuth, elevation, incliX, incliY, offsetX, offsetY, errorK, errorL, phiMagnetic) {
    const degToRad = angle => angle * Math.PI / 180;
    const radToDeg = angle => angle * 180 / Math.PI;

    const X = incliX - offsetX;
    const Y = incliY - offsetY;

    const phiT = degToRad(azimuth) - degToRad(phiMagnetic)
        + degToRad(errorK / 60) * (1 / Math.cos(degToRad(elevation)))
        + degToRad(errorL / 60) * Math.tan(degToRad(elevation))
        - degToRad(Y) * Math.tan(degToRad(elevation));

    const iT = degToRad(X);

    return [radToDeg(phiT), radToDeg(iT)];
}

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
        this.latestRangeData = null;
        this.zooming = 0;

        this.lastConvertedAzOffsetDegrees = null;
        this.lastConvertedAzTargetEncoder = null;

        this.lastConvertedElOffsetDegrees = null;
        this.lastConvertedElTargetEncoder = null;

        this.latestInclinationData = null;

        this.alphaD1 = null;
        this.alphaD2 = null;

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
            if (parsed.mode == "LRF_LRX20A") {
                this.latestRangeData = parsed;
                console.log('[CommandClient] Latest Range Data:', this.latestRangeData);
            }
            else if(parsed.mode == "Correct_constOD") {
                console.log("Here")
                this.latestOdData = parsed;
            }
            else if (parsed.mode === "Sns_OD") {
                this.latestClientData = parsed;
                this.latestInclinationData = parsed;

                const encoderAz = parseInt(parsed.Enc_Az_crct || 0);
                const encoderEl = parseInt(parsed.Enc_El_crct || 0);
            
                const azimuthAngle = encoderAzimuthToAngle(encoderAz);
                const elevationAngle = encoderElevationToAngle(encoderEl);
            
                const encoderAzZero = 136000;
                const incliX = parseFloat(parsed.incl_X_ag || 0) / 1000.0;
                const incliY = parseFloat(parsed.incl_Y_ag || 0) / 1000.0;
            
                const incliXOffset = (parseInt(parsed.CC_inclX_ofst || 131500) - 131000) / 1000.0;
                const incliYOffset = (parseInt(parsed.CC_inclY_ofst || 131500) - 131000) / 1000.0;
                const errorK = parseFloat(parsed.CC_err_angl_l || 10);
                const errorL = parseFloat(parsed.CC_err_angl_k || 10);
            
                const [correctedAzimuth, correctedElevation] = cameraAngleCorrections(
                    azimuthAngle, elevationAngle,
                    incliX, incliY,
                    incliXOffset, incliYOffset,
                    errorK, errorL, encoderAzZero
                );
            
                const alphaD = new ArtilleryAngle(correctedAzimuth);
                const alphaDStr = `${alphaD.angleDirectionalBeforeDot}-${alphaD.angleDirectionalAfterDot}`;
                const mestoC = new ArtilleryAngle(correctedElevation);
                const mestoCStr = `${mestoC.angleDirectionalRange30BeforeDot}-${mestoC.angleDirectionalRange30AfterDot}`;
            
                const overlayAngles = {
                    azimuth_angle: alphaDStr,
                    elevation_angle: mestoCStr,
                    azimuth_degrees: parseFloat(alphaD.angleDegrees.toFixed(3)),
                    elevation_degrees: parseFloat(mestoC.angleDegrees.toFixed(3))
                };
            
                fs.writeFileSync('/tmp/overlay_angles.json', JSON.stringify(overlayAngles));
            
                console.log("✅ Corrected Angles written to overlay_angles.json:");
                console.log(JSON.stringify(overlayAngles, null, 2));
            }
            // else {
            //     this.latestClientData = parsed;
            //     console.log('[CommandClient] Latest Client Data:', this.latestClientData);
            // }

            this.getXYcoordinates();
            //this.getInclinationData();
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

    updateOverlayCoordsFromClientData(zoomLevel, streamIndex = 1) {
        const props = this.latestOdData.properties;
        let keyX = null; 
        let keyY = null;
        if(streamIndex == 1) {
            keyX = `CC_IRC_bX_x${zoomLevel}`; 
            keyY = `CC_IRC_bY_x${zoomLevel}`;
        }
        else {
            keyX = `CC_DCm_bX_x${zoomLevel}`; 
            keyY = `CC_DCm_bY_x${zoomLevel}`;
        }

        //console.log("Zoom Level:", zoomLevel);
        //console.log("X:", x);
        //console.log("Y:", y);
        //console.log("OD data", this.latestOdData)
    
        if (!keyX || !keyY || keyX === "-1" || keyY === "-1") {
            console.warn("Invalid or missing coordinates:", xStr, yStr);
            return;
        }

        const x = parseInt(props[keyX]);
        const y = parseInt(props[keyY]);

        console.log(">>>>>>>>>>>>>>: ", x)
    
        if (x !== -1 && y !== -1) {
            const data = { x, y };
            const path = `/tmp/overlay_coords${streamIndex}.json`;
            fs.writeFileSync(path, JSON.stringify(data));
            console.log(`[Overlay] Updated ${path} to:`, data);
        } else {
            console.warn(`[Overlay] Invalid X/Y for zoom ${zoomLevel}:`, x, y);
        }
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

    // Port 2222 (MM) Getters

    getInclinationData() {
        if (this.latestInclinationData /* && this.latestClientData.properties */) {
            let { incl_t, incl_X_ag, incl_Y_ag } = this.latestClientData.properties;
    
            // Convert string values to numbers and apply scaling
            let Temperature = Number(incl_t) / 10;
            let InclinationX = Number(incl_X_ag) / 1000;
            let InclinationY = Number(incl_Y_ag) / 1000;

    
            return {
                Temperature,
                InclinationX,
                InclinationY,
            };
        } else {
            return {};
        }
    }

    getGPSData() {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties
        ) {
            const gps = this.latestClientData1.properties;
    
            const rawTime = (gps.GPS_0 || "") + (gps.GPS_1 || "");
            const rawLat = (gps.GPS_2 || "") + (gps.GPS_3 || "");
            const rawLon = (gps.GPS_4 || "") + (gps.GPS_5 || "");
            const altitude = gps.GPS_6 || "0";
    
            let Time = "N/A";
            if (rawTime.length >= 6) {
                const h = rawTime.substring(0, 2);
                const m = rawTime.substring(2, 4);
                const s = rawTime.substring(4);
                Time = `${h}:${m}:${s}`;
            }
    
            let Latitude = "Invalid";
            if (rawLat.length >= 4) {
                const deg = rawLat.slice(0, 2);
                const min = rawLat.slice(2);
                Latitude = `${deg}.${min}`;
            }
    
            let Longitude = "Invalid";
            if (rawLon.length >= 5) {
                const deg = rawLon.slice(0, 3);
                const min = rawLon.slice(3);
                Longitude = `${deg}.${min}`;
            }
    
            return {
                Time,
                Latitude,
                Longitude,
                Altitude: altitude
            };
        } else {
            return {};
        }
    }
    
    getXYcoordinates() {
        try {
            const gps = this.getGPSData(); // returns { Latitude, Longitude, Altitude }
            const sk42_coord = new sk42_to_wgs.GeoCoordinate(gps.Latitude, gps.Longitude, gps.Altitude);
    
            const transformer = new sk42_to_wgs.SK42GeoCartesian2DTransformer();
            const xy_coord = transformer.transform(sk42_coord);
    
            const x = Math.round(xy_coord.x);
            const y = Math.round(xy_coord.y);
    
            if(!x || !y) {
                return;
            }
            console.log("👉 X:", x);
            console.log("👉 Y:", y);
    
            const path = '/tmp/overlay_coords.json';  // ✅ just one file now
            fs.writeFileSync(path, JSON.stringify({ x, y }));
            console.log(`✅ Updated ${path}`);
        } catch (e) {
            console.error("❌ Error converting SK42 to XY:", e);
        }
    }

    getSTMDData() {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties
        ) {
            const { curr_pos_Az, curr_pos_El, Enc_Az_crct, Enc_El_crct } = this.latestClientData1.properties;
            const CurrentPositionOfAzimuthInSteps = curr_pos_Az
            const CurrentPositionOfElevationInSteps = curr_pos_El
            const EncoderAzimuth = Enc_Az_crct
            const EncoderElevation = Enc_El_crct
            return { CurrentPositionOfAzimuthInSteps, CurrentPositionOfElevationInSteps, EncoderAzimuth, EncoderElevation };
        }
        else {
            return {}; 
        }
    }

    getRangeData() {
        if (
            this.latestRangeData && this.latestRangeData.properties
        ) {
            const { LRF_Range_1, LRF_Range_2, LRF_Range_3 } = this.latestRangeData.properties;
            const maxRange = Math.max(
                parseFloat(LRF_Range_1 || 0),
                parseFloat(LRF_Range_2 || 0),
                parseFloat(LRF_Range_3 || 0)
            );
           // console.log("   Returned maxRange", maxRange)
            return { maxRange };
        }
        else {
            return {}; 
        }
    }

    getLastConvertedMovements() {
        return {
            DegreeAzimuth: this.lastConvertedAzOffsetDegrees,
            EncoderAzimuth: this.lastConvertedAzTargetEncoder,
            DegreeElevation: this.lastConvertedElOffsetDegrees,
            EncoderElevation: this.lastConvertedElTargetEncoder
        };
    }

    pollRangeFinder() {
        const cmd = `>ADR=LRF_LRX20A/SMD=LRF_SingRengM/`;
        console.log('[CommandClient] Poll Range Finder:', cmd);
        this.sendCommand(cmd);
    }

    // Port 8888 (MM) Setters
    
    setWithEncDegMovementAz(offsetEncoderUnits) {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties /*&&
            this.latestClientData1.properties.Enc_Az_crct*/
        ) {
    
            const degreesPerStep = 360 / Math.pow(2, 18); // ≈ 0.00137329 degrees per unit
            const offsetDegrees = offsetEncoderUnits * degreesPerStep;
    
            const adjustedEncoderAz = 136000 + offsetEncoderUnits;
    

            this.lastConvertedAzOffsetDegrees = offsetDegrees;
            console.log('[AZ OFFSET] Offset in encoder units:', offsetEncoderUnits);
            console.log('[AZ OFFSET] Offset in degrees:', offsetDegrees.toFixed(4));
            console.log('[AZ OFFSET] Adjusted Encoder_Az:', adjustedEncoderAz);

            const cmd = `>ADR=STMD/SMDD=STMD_tgt_pe_Az/LD=${adjustedEncoderAz}/`;
            this.sendCommand1(cmd);
        } else {
            console.warn('[AZ OFFSET] Encoder_Az not available.');
        }
    }

    setWithDegEncMovementAz(offsetDegrees) {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties/* &&
            this.latestClientData1.properties.Enc_Az_crct*/
        ) {

            // Convert degree offset to encoder units
            const stepsPerDegree = Math.pow(2, 18) / 360; // ≈ 728.178
            const offsetEncoderUnits = Math.round(offsetDegrees * stepsPerDegree);
    
            const adjustedEncoderAz = 136000 + offsetEncoderUnits;
    
            this.lastConvertedAzTargetEncoder = adjustedEncoderAz;
            console.log('[AZ DEGREES] Offset in degrees:', offsetDegrees);
            console.log('[AZ DEGREES] Converted offset in encoder units:', offsetEncoderUnits);
            console.log('[AZ DEGREES] Adjusted Encoder_Az:', adjustedEncoderAz);

            const cmd = `>ADR=STMD/SMDD=STMD_tgt_pe_Az/LD=${adjustedEncoderAz}/`;
            this.sendCommand1(cmd);
        } else {
            console.warn('[AZ DEGREES] Encoder_Az not available.');
        }
    }  

    setWithEncDegMovementEl(offsetEncoderUnits) {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties /*&&
            this.latestClientData1.properties.Enc_El_crct*/
        ) {
    
            const degreesPerStep = 360 / Math.pow(2, 18); // ≈ 0.00137329 degrees per unit
            const offsetDegrees = offsetEncoderUnits * degreesPerStep;
    
            const adjustedEncoderEl = 131000 + offsetEncoderUnits;
    
            console.log('[AZ OFFSET] Offset in encoder units:', offsetEncoderUnits);
            console.log('[AZ OFFSET] Offset in degrees:', offsetDegrees.toFixed(4));
            console.log('[AZ OFFSET] Adjusted Encoder_Az:', adjustedEncoderEl);

            this.lastConvertedElOffsetDegrees = offsetDegrees;
            const cmd = `>ADR=STMD/SMDD=STMD_tgt_pe_El/LD=${adjustedEncoderEl}/`;
            this.sendCommand1(cmd);
        } else {
            console.warn('[AZ OFFSET] Encoder_El not available.');
        }
    }

    setWithDegStepMovementAz(offsetDegrees) {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties/* &&
            this.latestClientData1.properties.Enc_Az_crct*/
        ) {

            // Convert degree offset to encoder units
            const stepsPerDegree = 705.55556;
            const offsetEncoderUnits = Math.round(offsetDegrees * stepsPerDegree);
    
            const adjustedEncoderAz = 0 + offsetEncoderUnits;
    
            this.lastConvertedAzTargetEncoder = adjustedEncoderAz;
            console.log('[AZ DEGREES] Offset in degrees:', offsetDegrees);
            console.log('[AZ DEGREES] Converted offset in step units:', offsetEncoderUnits);
            console.log('[AZ DEGREES] Adjusted Step Az:', adjustedEncoderAz);

            const cmd = `>ADR=STMD/SMDD=STMD_tgt_pos_Az/LD=${adjustedEncoderAz}/`;
            this.sendCommand1(cmd);
        } else {
            console.warn('[AZ DEGREES] Encoder_Az not available.');
        }
    }  

    setWithDegStepMovementAz(offsetDegrees) {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties/* &&
            this.latestClientData1.properties.Enc_Az_crct*/
        ) {

            // Convert degree offset to encoder units
            const stepsPerDegree = 0.0014173;
            const offsetEncoderUnits = Math.round(offsetDegrees * stepsPerDegree);
    
            const adjustedEncoderAz = 0 + offsetEncoderUnits;
    
            this.lastConvertedAzTargetEncoder = adjustedEncoderAz;
            console.log('[AZ DEGREES] Offset in degrees:', offsetDegrees);
            console.log('[AZ DEGREES] Converted offset in step units:', offsetEncoderUnits);
            console.log('[AZ DEGREES] Adjusted Step Az:', adjustedEncoderAz);

            const cmd = `>ADR=STMD/SMDD=STMD_tgt_pos_Az/LD=${adjustedEncoderAz}/`;
            this.sendCommand1(cmd);
        } else {
            console.warn('[AZ DEGREES] Encoder_Az not available.');
        }
    }  

    setWithDegStepMovementAz(offsetDegrees) {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties/* &&
            this.latestClientData1.properties.Enc_El_crct*/
        ) {
   
            // Convert degree offset to encoder units
            const stepsPerDegree = 705.55556;
            const offsetEncoderUnits = Math.round(offsetDegrees * stepsPerDegree);
    
            const adjustedStepsAz = 0 + offsetEncoderUnits;
    
            console.log('[AZ DEGREES] Offset in degrees:', offsetDegrees);
            console.log('[AZ DEGREES] Converted offset in step units:', offsetEncoderUnits);
            console.log('[AZ DEGREES] Adjusted Steps :', adjustedStepsAz);

            this.lastConvertedElTargetEncoder = adjustedStepsAz;
            const cmd = `>ADR=STMD/SMDD=STMD_tgt_pos_Az/LD=${adjustedStepsAz}/`;
            this.sendCommand1(cmd);
        } else {
            console.warn('[AZ DEGREES] Encoder_Az not available.');
        }
    }  

    setWithStepDegMovementEl(offsetEncoderUnits) {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties /*&&
            this.latestClientData1.properties.Enc_El_crct*/
        ) {
    
            const degreesPerStep = 0.0014173;
            const offsetDegrees = offsetEncoderUnits * degreesPerStep;
    
            const adjustedStepsEl = 0 + offsetEncoderUnits;
    
            console.log('[AZ OFFSET] Offset in encoder units:', offsetEncoderUnits);
            console.log('[AZ OFFSET] Offset in degrees:', offsetDegrees.toFixed(4));
            console.log('[AZ OFFSET] Adjusted Encoder_Az:', adjustedStepsEl);

            this.lastConvertedElOffsetDegrees = offsetDegrees;
            const cmd = `>ADR=STMD/SMDD=STMD_tgt_pos_El/LD=${adjustedStepsEl}/`;
            this.sendCommand1(cmd);
        } else {
            console.warn('[AZ OFFSET] Encoder_El not available.');
        }
    }

    setWithDegStepMovementEl(offsetDegrees) {
        if (
            this.latestClientData1 &&
            this.latestClientData1.properties/* &&
            this.latestClientData1.properties.Enc_El_crct*/
        ) {
   
            // Convert degree offset to encoder units
            const stepsPerDegree = 705.55556;
            const offsetEncoderUnits = Math.round(offsetDegrees * stepsPerDegree);
    
            const adjustedStepsEl = 0 + offsetEncoderUnits;
    
            console.log('[AZ DEGREES] Offset in degrees:', offsetDegrees);
            console.log('[AZ DEGREES] Converted offset in encoder units:', offsetEncoderUnits);
            console.log('[AZ DEGREES] Adjusted Encoder_El:', adjustedStepsEl);

            this.lastConvertedElTargetEncoder = adjustedStepsEl;
            const cmd = `>ADR=STMD/SMDD=STMD_tgt_pos_El/LD=${adjustedStepsEl}/`;
            this.sendCommand1(cmd);
        } else {
            console.warn('[AZ DEGREES] Encoder_Az not available.');
        }
    }  

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

    setBrightness(value) {
        const cmd = `>ADR=IR_Camera/SMDD=IRC_brithness/LD=${value}/`;
        console.log('[CommandClient] Prepared brightness command:', cmd); 
        this.sendCommand(cmd);
    }

    setAlphaD1(value) {
        this.alphaD1 = value;
        console.log('[CommandClient] Setting AlphaD1 to :', value); 
    }

    setAlphaD2(value) {
        this.alphaD2 = value;
        console.log('[CommandClient] Setting AlphaD1 to :', value); 
    }

    setZoom(zoomLevel) {
        this.zooming = zoomLevel;
        console.log('Setting zoom level to:', zoomLevel);
        let src = '/home/jetson/rpos/python/camside/AACam/resources/CameraPictures/Busol_Reticle/Thermal_' + zoomLevel + 'X.png';
        console.log("Copied source from ", src);
        const dest = '/tmp/active_cross1.png';


        console.log("Getting X and Y coordinates")
        const cmd1 = `>ADR=Correct_constOD/SMD=CC_get_full_CC/`;
        this.sendCommand(cmd1);
        
        fs.copyFile(src, dest, (err) => {
            if (err) {
              console.error('Error copying file:', err);
            } else {
              console.log('File was copied successfully!');
            }
          });
        const cmd = `>ADR=IR_Camera/SMDD=IRC_zoom/LD=${zoomLevel}/`;
        this.sendCommand(cmd);

        if(zoomLevel == "3") {
            this.updateOverlayCoordsFromClientData(4, 1);
        }
        else if(zoomLevel == "4") {
            this.updateOverlayCoordsFromClientData(8, 1);
        }
        else {
            this.updateOverlayCoordsFromClientData(zoomLevel, 1);
        }
    }

    setZoomInOrOut(value) {
        if (value == "true") {
            zooming = zooming + 1;
        }
        else if (zooming == 1) {
            return;
        }
        else {
            zooming = zooming - 1;
        }
        console.log('Setting zoom in/out:', value);
        const cmd = `>ADR=IR_Camera/SMDD=IRC_zoom/LD=${zooming}/`;
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
        let src = '/home/jetson/rpos/python/camside/AACam/resources/CameraPictures/Busol_Reticle/' + value + 'x.png';
        console.log("Copied source from ", src);
        const dest = '/tmp/active_cross2.png';
        
        console.log("Getting X and Y coordinates")
        const cmd1 = `>ADR=Correct_constOD/SMD=CC_get_full_CC/`;
        this.sendCommand(cmd1);

        this.updateOverlayCoordsFromClientData(value, 2);

        fs.copyFile(src, dest, (err) => {
            if (err) {
              console.error('Error copying file:', err);
            } else {
              console.log('File was copied successfully!');
            }
          });
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