const CommandClient = require("./CommandClient");
const fs = require('fs');

// Constants
const BASE_FOV_HORIZONTAL = 66.0;
const BASE_FOV_VERTICAL = 40.3;
const AZIM_RIGHT = 271000;
const AZIM_LEFT = 0;
const ELEV_UP = 262143;
const ELEV_DOWN = 0;
var menuFlag = 0;

const DAY_ZOOM_COEFFICIENT_GRID = {
  6: [1.1, 1.05],
  5: [1.45, 1.35],
  4: [1.8, 1.7],
  3: [1.8, 1.65],
  2: [1.62, 1.45],
  1: [1.03, 0.9],
};

class CameraCorrection {
  constructor(dataModel) {
    this.dataModel = dataModel;
  }

  getCorrection(isDay, zoom) {
    if (isDay) {
      // const x = CommandClient.latestOdData.properties[`CC_DCm_bX_x${zoom}`];
      // const y = CommandClient.latestOdData.properties[`CC_DCm_bY_x${zoom}`];
      const x = CommandClient.getEncCrctZoomAz(1);
      const y = CommandClient.latestOdData.properties[`CC_DCm_bY_x${zoom}`];
      return [x, y];
    }
    return [0, 0];
  }
}

function calculateNewPositionEncoderCrosshair(clickX, clickY, screenWidth, screenHeight,
  currentHorizontal, currentVertical, zoom, dataModel, correction_coefficient_h, correction_coefficient_v) {

    var zoomForCaluculations = 0;

    if (zoom == 1) {
        zoomForCaluculations = 1;
    }
    if (zoom == 2) {
        zoomForCaluculations = 5;   
    }
    if (zoom == 3) {
        zoomForCaluculations = 15;
    }
    if (zoom == 4) {
        zoomForCaluculations = 30;
    }
    if (zoom == 5) {
        zoomForCaluculations = 60;
    }
    if (zoom == 6) {
        zoomForCaluculations = 68;
    } 

  const fovHorizontal = BASE_FOV_HORIZONTAL / zoomForCaluculations;
  const fovVertical = BASE_FOV_VERTICAL / zoomForCaluculations;

  console.log("ZOOOOM: ", zoom , zoomForCaluculations)

  const [correctionCoefficientH, correctionCoefficientV] = DAY_ZOOM_COEFFICIENT_GRID[zoom];
  const cameraCorrections = new CameraCorrection(dataModel);
  //const [xCrossPos, yCrossPos] = cameraCorrections.getCorrection(true, zoom);
  xCrossPos = CommandClient.getEncCrctZoomAz(zoom);
  yCrossPos = CommandClient.getEncCrctZoomEl(zoom);

  console.log("xCrossPos yCrossPos", xCrossPos, yCrossPos)

  var cross_y = 520;

  if (zoomForCaluculations == 1) {
    cross_y = 492;
  }
  else if (zoomForCaluculations == 5){
    cross_y = 502;
  }
  else if (zoomForCaluculations == 30){
    cross_y = 530;
  }
  else if (zoomForCaluculations == 60){
    cross_y = 548;
  }
  else if (zoomForCaluculations == 68){
    cross_y = 560;
  }
  const xCrossCorrection = 960 - xCrossPos;
  const yCrossCorrection = cross_y - yCrossPos;

  const relX = (clickX / screenWidth) - 0.5;
  const relY = (clickY / screenHeight) - 0.5;

  const angleOffsetH = (relX + xCrossCorrection / screenWidth) * fovHorizontal * correctionCoefficientH;
  const angleOffsetV = (relY + yCrossCorrection / screenHeight) * fovVertical * correctionCoefficientV;

  let newHorizontal = currentHorizontal + Math.floor(angleOffsetH * (AZIM_RIGHT / 360));
  let newVertical = currentVertical + Math.floor(angleOffsetV * (AZIM_RIGHT / 360));

  newHorizontal = Math.max(0, Math.min(AZIM_RIGHT, newHorizontal));
  newVertical = Math.max(0, Math.min(AZIM_RIGHT, newVertical));

  return [newHorizontal, newVertical];
}

// The main handler method
function onDoubleClick(x, y, zoom) {
   // const cmpsStatus = parseInt(ptzMenu.dataModel.getProperty("cmps_status"));
   // if (cmpsStatus < 16 || cmpsStatus > 31) {
   //     return;
   // }

    var dataModel = 0;
    var menu_overlay;

    const screenWidth = 1920;
    const screenHeight = 1080;

    if (menuFlag) {
      if ((x >= 20 && x <= 400) && (y >= 1000 && y <= 1060)) {
          console.log("North Connect button");
      }
    }

    if ((x >= 920 && x <= 1000) && (y >= 20 && y <= 60)) {
        CommandClient.pollRangeFinder();
        return;
    }

    if ((x >= 1100 && x <= 1180) && (y >= 20 && y <= 60)) {
        console.log("Red button")
        if (menuFlag) {
          menu_overlay = {
              Flag: 0
          };
          menuFlag = 0;
        }
        else {
          menu_overlay = {
              Flag: 1
          };
          menuFlag = 1;
        }

        fs.writeFileSync(
            '/tmp/menu_overlay.json',
            JSON.stringify(menu_overlay, null, 2)
        );
        return;
    }

    const clickX = x;
    const clickY = y;


    console.log("Where is clicked", clickX, clickY)

    let oldHorizontalEnc = parseInt(CommandClient.getCrctEncoderAz());
    let oldVerticalEnc = parseInt(CommandClient.getCrctEncoderEl());

    console.log("oldValues :", oldHorizontalEnc, oldVerticalEnc)

    console.log("OLD ENC HOR:", oldHorizontalEnc);
    console.log("OLD ENC VER:", oldVerticalEnc);

    let newHorizontalEnc = oldHorizontalEnc;
    let newVerticalEnc = oldVerticalEnc;

    [newHorizontalEnc, newVerticalEnc] = calculateNewPositionEncoderCrosshair(
        clickX, clickY, screenWidth, screenHeight,
        oldHorizontalEnc, oldVerticalEnc,
        zoom,
        dataModel, 1.8, 1.2
    );
    //ptzMenu.setPtzSpeedByLevel(6);

    //ptzMenu.motionNetworkHandler.sendCommand('stmd', "str_STMD_set_turget_position_encoder_Az", newHorizontalEnc);
    //ptzMenu.motionNetworkHandler.sendCommand('stmd', "str_STMD_set_turget_position_encoder_El", newVerticalEnc);
    CommandClient.setTargetPosition(newHorizontalEnc, newVerticalEnc, 1)

    console.log("NEW HOR ENC:", newHorizontalEnc);
    console.log("NEW VER ENC:", newVerticalEnc);

    return [newHorizontalEnc, newVerticalEnc];
}

module.exports = {
    onDoubleClick
};