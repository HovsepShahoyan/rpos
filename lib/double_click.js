// Constants
const BASE_FOV_HORIZONTAL = 66.0;
const BASE_FOV_VERTICAL = 40.3;
const AZIM_RIGHT = 271000;
const AZIM_LEFT = 0;
const ELEV_UP = 262143;
const ELEV_DOWN = 0;

const DAY_ZOOM_COEFFICIENT_GRID = {
  68: [1.1, 1.05],
  60: [1.45, 1.35],
  30: [1.8, 1.7],
  15: [1.8, 1.65],
  5: [1.62, 1.45],
  1: [1.03, 0.9],
};

class CameraCorrection {
  constructor(dataModel) {
    this.dataModel = dataModel;
  }

  getCorrection(isDay, zoom) {
    if (isDay) {
      const x = this.latestOdData.properties[`CC_DCm_bX_x${zoom}`];
      const y = this.latestOdData.properties[`CC_DCm_bY_x${zoom}`];
      return [x, y];
    }
    return [0, 0];
  }
}

function calculateNewPositionEncoderCrosshair(clickX, clickY, screenWidth, screenHeight,
  currentHorizontal, currentVertical, zoom, dataModel) {

  const fovHorizontal = BASE_FOV_HORIZONTAL / zoom;
  const fovVertical = BASE_FOV_VERTICAL / zoom;

  const [correctionCoefficientH, correctionCoefficientV] = DAY_ZOOM_COEFFICIENT_GRID[zoom];
  const cameraCorrections = new CameraCorrection(dataModel);
  const [xCrossPos, yCrossPos] = cameraCorrections.getCorrection(true, zoom);

  const xCrossCorrection = 960 - xCrossPos;
  const yCrossCorrection = 540 - yCrossPos;

  const relX = (clickX / screenWidth) - 0.5;
  const relY = (clickY / screenHeight) - 0.5;

  const angleOffsetH = (relX + xCrossCorrection / screenWidth) * fovHorizontal * correctionCoefficientH;
  const angleOffsetV = -(relY + yCrossCorrection / screenHeight) * fovVertical * correctionCoefficientV;

  let newHorizontal = currentHorizontal + Math.floor(angleOffsetH * (AZIM_RIGHT / 360));
  let newVertical = currentVertical + Math.floor(angleOffsetV * (AZIM_RIGHT / 360));

  newHorizontal = Math.max(0, Math.min(AZIM_RIGHT, newHorizontal));
  newVertical = Math.max(0, Math.min(AZIM_RIGHT, newVertical));

  return [newHorizontal, newVertical];
}

// The main handler method
function onDoubleClick(pos, ptzMenu, propertiesModel, canvasElement) {
  if (ptzMenu.calibrationInProgress || ptzMenu.isExplicitInteractionWithPtzFunctionalityBlocked) {
    return;
  }

  const cmpsStatus = parseInt(ptzMenu.dataModel.getProperty("cmps_status"));
  if (cmpsStatus < 16 || cmpsStatus > 31) {
    return;
  }

  ptzMenu.cancelDestinationMovement();

  const screenWidth = canvasElement.width;
  const screenHeight = canvasElement.height;

  const clickX = pos.x;
  const clickY = pos.y;

  const oldHorizontalEnc = parseInt(ptzMenu.dataModel.getProperty("Enc_Az_crct"));
  const oldVerticalEnc = parseInt(ptzMenu.dataModel.getProperty("Enc_El_crct"));

  console.log("OLD ENC HOR:", oldHorizontalEnc);
  console.log("OLD ENC VER:", oldVerticalEnc);

  let newHorizontalEnc = oldHorizontalEnc;
  let newVerticalEnc = oldVerticalEnc;

  if (propertiesModel.currentCamera === 1) {
    const zoom = ptzMenu.dayZoomManager.currentValue;
    [newHorizontalEnc, newVerticalEnc] = calculateNewPositionEncoderCrosshair(
      clickX, clickY, screenWidth, screenHeight,
      oldHorizontalEnc, oldVerticalEnc,
      zoom,
      ptzMenu.dataModel
    );
  }

  ptzMenu.setPtzSpeedByLevel(6);

  moveCameraToPosition(newHorizontalEnc, newVerticalEnc);
  ptzMenu.motionNetworkHandler.sendCommand('stmd', "str_STMD_set_turget_position_encoder_Az", newHorizontalEnc);
  ptzMenu.motionNetworkHandler.sendCommand('stmd', "str_STMD_set_turget_position_encoder_El", newVerticalEnc);

  console.log("NEW HOR ENC:", newHorizontalEnc);
  console.log("NEW VER ENC:", newVerticalEnc);

  return [newHorizontalEnc, newVerticalEnc];
}