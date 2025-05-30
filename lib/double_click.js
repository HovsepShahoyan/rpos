const CommandClient = require("./CommandClient");
const fs = require('fs');

// Constants
const BASE_FOV_HORIZONTAL = 66.0;
const BASE_FOV_VERTICAL = 40.3;
const AZIM_RIGHT = 271000;
const AZIM_LEFT = 0;
const ELEV_UP = 262143;
const ELEV_DOWN = 0;

let menuFlag = false;
let activeField = null;
let field1Value = "0";
let field2Value = "0";

// Initialize JSON files with default values
function initOverlayFiles() {
    const defaultMenuOverlay = { Flag: 0 };
    const defaultMenuInput = {
        field1Flag: 0,
        field2Flag: 0,
        field1_value: "0",
        field2_value: "0"
    };

    try {
        fs.writeFileSync('/tmp/menu_overlay.json', JSON.stringify(defaultMenuOverlay, null, 2));
        fs.writeFileSync('/tmp/menu_input.json', JSON.stringify(defaultMenuInput, null, 2));
    } catch (error) {
        console.error("Error initializing overlay files:", error);
    }
}

// Update the menu input JSON file
function updateMenuInputJSON() {
    const menuInput = {
        field1Flag: activeField === 'field1' ? 1 : 0,
        field2Flag: activeField === 'field2' ? 1 : 0,
        field1_value: field1Value,
        field2_value: field2Value
    };

    try {
        fs.writeFileSync('/tmp/menu_input.json', JSON.stringify(menuInput, null, 2));
    } catch (error) {
        console.error("Error updating menu input:", error);
    }
}

// Handle numpad button presses
function handleNumpadButton(buttonText) {
    switch (buttonText) {
        case "OK":
            // Confirm and close numpad
            activeField = null;
            break;
            
        case "C":
            // Clear current field
            if (activeField === 'field1') {
                field1Value = "0";
            } else if (activeField === 'field2') {
                field2Value = "0";
            }
            break;
            
        default:
            // Handle digit input
            if (activeField === 'field1') {
                field1Value = (field1Value === "0") ? buttonText : field1Value + buttonText;
            } else if (activeField === 'field2') {
                field2Value = (field2Value === "0") ? buttonText : field2Value + buttonText;
            }
    }
    updateMenuInputJSON();
}

// Check if click is within a numpad button
function handleNumpadClick(x, y) {
    // Numpad dimensions and position (centered)
    const numpadWidth = 300;
    const numpadHeight = 300;
    const numpadX = (1920 - numpadWidth) / 2;  // 810 for 1920x1080
    const numpadY = (1080 - numpadHeight) / 2; // 390 for 1920x1080

    // Numpad button definitions
    const buttons = [
        { text: "1", x: numpadX + 20, y: numpadY + 70, width: 80, height: 50 },
        { text: "2", x: numpadX + 120, y: numpadY + 70, width: 80, height: 50 },
        { text: "3", x: numpadX + 220, y: numpadY + 70, width: 80, height: 50 },
        { text: "4", x: numpadX + 20, y: numpadY + 140, width: 80, height: 50 },
        { text: "5", x: numpadX + 120, y: numpadY + 140, width: 80, height: 50 },
        { text: "6", x: numpadX + 220, y: numpadY + 140, width: 80, height: 50 },
        { text: "7", x: numpadX + 20, y: numpadY + 210, width: 80, height: 50 },
        { text: "8", x: numpadX + 120, y: numpadY + 210, width: 80, height: 50 },
        { text: "9", x: numpadX + 220, y: numpadY + 210, width: 80, height: 50 },
        { text: "0", x: numpadX + 20, y: numpadY + 280, width: 80, height: 50 },
        { text: "C", x: numpadX + 120, y: numpadY + 280, width: 80, height: 50 },
        { text: "OK", x: numpadX + 220, y: numpadY + 280, width: 80, height: 50 }
    ];

    // Check each button for click
    for (const button of buttons) {
        if (x >= button.x && x <= button.x + button.width &&
            y >= button.y && y <= button.y + button.height) {
            handleNumpadButton(button.text);
            return true; // Click was handled
        }
    }
    return false; // Click wasn't on any numpad button
}


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
    const invertedY = 1080 - y;

    var scaledX = x;

    const screenWidth = 1920;
    const screenHeight = 1080;

    // 1. Handle numpad clicks first if active
    if (activeField && handleNumpadClick(x, invertedY)) {
        return;
    }

    // 2. Green button (Poll Range Finder)
    if ((scaledX >= 920 && scaledX <= 1000) && (y >= 20 && y <= 60)) {
        CommandClient.pollRangeFinder();
        return;
    }

    // 3. Red button (Toggle Menu)
    if ((scaledX >= 1100 && scaledX <= 1180) && (y >= 20 && y <= 60)) {
        console.log("Red button clicked")
        menuFlag = !menuFlag;
        const menuOverlay = { Flag: menuFlag ? 1 : 0 };
        
        try {
            fs.writeFileSync('/tmp/menu_overlay.json', JSON.stringify(menuOverlay, null, 2));
        } catch (error) {
            console.error("Error toggling menu:", error);
        }

        // Clear active field when closing menu
        if (!menuFlag) {
            activeField = null;
            updateMenuInputJSON();
        }
        return;
    }

    const getValues = () => {
      try {
        const data = fs.readFileSync('/tmp/menu_input.json', 'utf-8');
        const { field1_value, field2_value } = JSON.parse(data);
        return { field1_value, field2_value };
      } catch (error) {
        console.error('Failed to read or parse JSON:', error);
        return null;
      }
    };

    // 4. Handle menu interactions if menu is open
    if (menuFlag) {
        console.log(`Menu is open, checking click at (${x}, ${invertedY})`); 

        // NorthConnect button (20-400x, 20-80y)
        if ((x >= 20 && x <= 400) && (invertedY >= 20 && invertedY <= 80)) {
            const { field1_value, field2_value } = getValues();
            CommandClient.northConnectWithButton(field1_value, field2_value);
            console.log("Field Values", field1_value, field2_value);
            return;
        }

        // Field 1 (30-390x, 100-140y)
        if ((scaledX >= 30 && scaledX <= 390) && (invertedY >= 100 && invertedY <= 140)) {
            activeField = 'field1';
            updateMenuInputJSON();
            return;
        }

        // Field 2 (30-390x, 160-200y)
        if ((scaledX >= 30 && scaledX <= 390) && (invertedY >= 160 && invertedY <= 200)) {
            activeField = 'field2';
            updateMenuInputJSON();
            return;
        }
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