const CommandClient = require("./CommandClient");
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// Constants and JSON paths
// ─────────────────────────────────────────────────────────────────────────────

const BASE_FOV_HORIZONTAL = 66.0;
const BASE_FOV_VERTICAL   = 40.3;
const AZIM_RIGHT          = 271000;
const AZIM_LEFT           = 0;
const ELEV_UP             = 262143;
const ELEV_DOWN           = 0;

// Paths for all overlay JSONs
const MENU_OVERLAY_PATH       = "/tmp/menu_overlay.json";
const MENU_INPUT_PATH         = "/tmp/menu_input.json";
const NETWORK_JSON_PATH       = "/tmp/network.json";
const NETWORK_INPUT_JSON_PATH = "/tmp/network_numpad.json";

// ─────────────────────────────────────────────────────────────────────────────
// 1) “Default” contents for each JSON—used when creating them if they don’t exist
// ─────────────────────────────────────────────────────────────────────────────

const defaultMenuOverlay = { Flag: 0 };

const defaultMenuInput = {
  field1Flag: 0,
  field2Flag: 0,
  field1_value: "0",
  field2_value: "0"
};

const defaultNetwork = {
  network_flag: 0,
  activeField: null,
  ip_address: "192.168.0.10",
  subnet_mask: "255.255.255.0",
  gateway: "192.168.0.1",
  DNS1: "8.8.8.8",
  DNS2: "8.8.4.4"
};

const defaultNetworkInput = {
  numpad_flag: 0,
  digit: ""
};

// ─────────────────────────────────────────────────────────────────────────────
// 2) In‐memory state for menu/numpad
// ─────────────────────────────────────────────────────────────────────────────

let menuFlag    = false;   // true when the menu window is open
let activeField = null;    // "field1" or "field2" when menu numpad is open
let field1Value = "0";
let field2Value = "0";

// ─────────────────────────────────────────────────────────────────────────────
// 3) Ensure each JSON file exists; if not, create with defaults
// ─────────────────────────────────────────────────────────────────────────────

function ensureJsonFile(path, defaultContent) {
  try {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify(defaultContent, null, 2));
    }
  } catch (error) {
    console.error(`Error ensuring ${path}:`, error);
  }
}

// At module load:
ensureJsonFile(MENU_OVERLAY_PATH,       defaultMenuOverlay);
ensureJsonFile(MENU_INPUT_PATH,         defaultMenuInput);
ensureJsonFile(NETWORK_JSON_PATH,       defaultNetwork);
ensureJsonFile(NETWORK_INPUT_JSON_PATH, defaultNetworkInput);

// ─────────────────────────────────────────────────────────────────────────────
// 4) MENU‐RELATED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function updateMenuInputJSON() {
  const menuInput = {
    field1Flag: activeField === 'field1' ? 1 : 0,
    field2Flag: activeField === 'field2' ? 1 : 0,
    field1_value: field1Value,
    field2_value: field2Value
  };
  try {
    fs.writeFileSync(MENU_INPUT_PATH, JSON.stringify(menuInput, null, 2));
  } catch (error) {
    console.error("Error updating menu_input.json:", error);
  }
}

function handleNumpadButton(buttonText) {
  switch (buttonText) {
    case "OK":
      activeField = null;
      break;
    case "C":
      if (activeField === 'field1') {
        field1Value = "0";
      } else if (activeField === 'field2') {
        field2Value = "0";
      }
      break;
    default:
      if (activeField === 'field1') {
        field1Value = (field1Value === "0") ? buttonText : field1Value + buttonText;
      } else if (activeField === 'field2') {
        field2Value = (field2Value === "0") ? buttonText : field2Value + buttonText;
      }
      break;
  }
  updateMenuInputJSON();
}

function handleNumpadClick(x, y) {
  const numpadX = 810;
  const numpadY = 390;
  const btnWidth = 80;
  const btnHeight = 50;
  const colsX = [numpadX + 20, numpadX + 120, numpadX + 220];
  const rowOffsets = [70, 140, 210, 280];
  const labels = ["1","2","3","4","5","6","7","8","9","0","C","OK"];
  for (let i = 0; i < 12; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const btnLeft = colsX[col];
    const btnTop = numpadY + rowOffsets[row];
    if (
      x >= btnLeft && x <= btnLeft + btnWidth &&
      y >= btnTop && y <= btnTop + btnHeight
    ) {
      handleNumpadButton(labels[i]);
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5) NETWORK‐RELATED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function updateNetworkJSON(networkState) {
  try {
    fs.writeFileSync(NETWORK_JSON_PATH, JSON.stringify(networkState, null, 2));
  } catch (error) {
    console.error("Error updating network.json:", error);
  }
}

function handleNetworkNumpadButton(buttonText, networkState) {
  const field = networkState.activeField;
  if (!field) return;
  switch (buttonText) {
    case "OK":
      networkState.activeField = null;
      break;
    case "C":
      networkState[field] = "0";
      break;
    default:
      const cur = networkState[field] || "0";
      networkState[field] = (cur === "0") ? buttonText : cur + buttonText;
      break;
  }
  updateNetworkJSON(networkState);
}

function updateNetworkNumpadJSON(numpadState) {
  try {
    fs.writeFileSync(NETWORK_INPUT_JSON_PATH, JSON.stringify(numpadState, null, 2));
  } catch (error) {
    console.error("Error updating network_numpad.json:", error);
  }
}

function loadNetworkState() {
  try {
    const raw = fs.readFileSync(NETWORK_JSON_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading network.json, using defaults:", err);
    return { ...defaultNetwork };
  }
}

function handleNetworkFieldClick(x, y) {
  y = 1080 - y
  const state = loadNetworkState();
  if (state.network_flag !== 1) return false;
  const FRAME_H = 1080; // Define the frame height
  const netW = 400;
  const marginTop = 50;
  const marginLeft = (1920 - netW) / 2; // Center the network window
  const boxH = 40;
  const boxW = netW - 40;
  const yStart = marginTop + 40;
  for (let i = 0; i < 5; i++) {
    const topY = yStart + i * (boxH + 20);
    const bottomY = topY + boxH;
    const leftX = marginLeft + 130;
    const rightX = leftX + boxW;
    if (
      x >= leftX && x <= rightX &&
      y >= topY && y <= bottomY
    ) {
      const keys = ["ip_address", "subnet_mask", "gateway", "DNS1", "DNS2"];
      state.activeField = keys[i];
      updateNetworkJSON(state);
      // Open the numpad
      updateNetworkNumpadJSON({ numpad_flag: 1, digit: "" });
      return true;
    }
  }
  return false;
}

function handleNetworkNumpadClick(x, y) {
  y =  1080 - y
  const state = loadNetworkState();
  if (state.network_flag !== 1 || !state.activeField) return false;
  const numpadX = 810;
  const numpadY = 390;
  const btnWidth = 80;
  const btnHeight = 50;
  const colsX = [numpadX + 20, numpadX + 120, numpadX + 220];
  const rowOffsets = [70, 140, 210, 280];
  const labels = ["1","2","3","4","5","6","7","8","9","0","C","OK"];
  for (let i = 0; i < 12; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const btnLeft = colsX[col];
    const btnTop = numpadY + rowOffsets[row];
    const btnBottom = btnTop + btnHeight;
    if (
      x >= btnLeft && x <= btnLeft + btnWidth &&
      y >= btnTop && y <= btnBottom
    ) {
      handleNetworkNumpadButton(labels[i], state);
      return true;
    }
  }
  return false;
}


// ─────────────────────────────────────────────────────────────────────────────
// 6) CAMERA & PTZ CROSSHAIR FUNCTIONS (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

class CameraCorrection {
  constructor(dataModel) {
    this.dataModel = dataModel;
  }

  getCorrection(isDay, zoom) {
    if (isDay) {
      const x = CommandClient.getEncCrctZoomAz(1);
      const y = CommandClient.latestOdData.properties[`CC_DCm_bY_x${zoom}`];
      return [x, y];
    }
    return [0, 0];
  }
}

function calculateNewPositionEncoderCrosshair(
  clickX, clickY, screenWidth, screenHeight,
  currentHorizontal, currentVertical, zoom, dataModel,
  correction_coefficient_h, correction_coefficient_v
) {
  var zoomForCaluculations = 0;
  if (zoom == 1) zoomForCaluculations = 1;
  if (zoom == 2) zoomForCaluculations = 5;
  if (zoom == 3) zoomForCaluculations = 15;
  if (zoom == 4) zoomForCaluculations = 30;
  if (zoom == 5) zoomForCaluculations = 60;
  if (zoom == 6) zoomForCaluculations = 68;

  const fovHorizontal = BASE_FOV_HORIZONTAL / zoomForCaluculations;
  const fovVertical   = BASE_FOV_VERTICAL / zoomForCaluculations;

  const [correctionCoefficientH, correctionCoefficientV] = DAY_ZOOM_COEFFICIENT_GRID[zoom];
  const cameraCorrections = new CameraCorrection(dataModel);
  const xCrossPos = CommandClient.getEncCrctZoomAz(zoom);
  const yCrossPos = CommandClient.getEncCrctZoomEl(zoom);

  var cross_y = 520;
  if (zoomForCaluculations == 1)   cross_y = 492;
  else if (zoomForCaluculations == 5)   cross_y = 502;
  else if (zoomForCaluculations == 30)  cross_y = 530;
  else if (zoomForCaluculations == 60)  cross_y = 548;
  else if (zoomForCaluculations == 68)  cross_y = 560;

  const xCrossCorrection = 960 - xCrossPos;
  const yCrossCorrection = cross_y - yCrossPos;

  const relX = (clickX / screenWidth)  - 0.5;
  const relY = (clickY / screenHeight) - 0.5;

  const angleOffsetH = (relX + xCrossCorrection / screenWidth) * fovHorizontal * correctionCoefficientH;
  const angleOffsetV = (relY + yCrossCorrection / screenHeight) * fovVertical * correctionCoefficientV;

  let newHorizontal = currentHorizontal + Math.floor(angleOffsetH * (AZIM_RIGHT / 360));
  let newVertical   = currentVertical   + Math.floor(angleOffsetV * (AZIM_RIGHT / 360));

  newHorizontal = Math.max(0, Math.min(AZIM_RIGHT, newHorizontal));
  newVertical   = Math.max(0, Math.min(AZIM_RIGHT, newVertical));

  return [newHorizontal, newVertical];
}

const DAY_ZOOM_COEFFICIENT_GRID = {
  6: [1.1,  1.05],
  5: [1.45, 1.35],
  4: [1.8,  1.7 ],
  3: [1.8,  1.65],
  2: [1.62, 1.45],
  1: [1.03, 0.9 ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 7) MAIN “onDoubleClick” HANDLER
// ─────────────────────────────────────────────────────────────────────────────

function onDoubleClick(x, y, zoom) {
  const scaledX = x;

  // 1) If menu’s numpad is open, let it consume clicks first
  if (activeField && handleNumpadClick(x, y)) {
    return;
  }

  // 2) Green button (Poll Range Finder) — top‐based coords
  if ((scaledX >= 920 && scaledX <= 1000) && (y >= 20 && y <= 60)) {
    CommandClient.pollRangeFinder();
    return;
  }

  // 3) Red button (Toggle Menu) — top‐based coords
  if ((scaledX >= 1100 && scaledX <= 1180) && (y >= 20 && y <= 60)) {
    menuFlag = !menuFlag;
    const menuOverlay = { Flag: menuFlag ? 1 : 0 };
    try {
      fs.writeFileSync(MENU_OVERLAY_PATH, JSON.stringify(menuOverlay, null, 2));
    } catch (error) {
      console.error("Error toggling menu_overlay.json:", error);
    }
    if (!menuFlag) {
      activeField = null;
      updateMenuInputJSON();
    }
    return;
  }

  // 4) Network Config button (Toggle Network) — bottom‐based coords
  //    In Python, drawn at x∈[1280..1400], bottom‐based y∈[20..60].
  if ((scaledX >= 1280 && scaledX <= 1400) && (y >= 20 && y <= 60)) {
    const state = loadNetworkState();
    if (state.network_flag === 0) {
      state.network_flag = 1;
      state.activeField = "DNS 1";
    } else {
      state.network_flag = 0;
      state.activeField = null;
    }
    updateNetworkJSON(state);
    return;
  }

  // 5) If menu is open, handle menu interactions (using y)
  if (menuFlag) {
    // 5A) NorthConnect: x∈[20..400], bottom‐based y∈[20..80] → test y=1080-invertedY, but easier to use y from bottom if needed. 
    // Since menu drawn near top, invert-y not needed for these.
    if ((scaledX >= 20 && scaledX <= 400) && ((1080 - y) >= 20 && (1080 - y) <= 80)) {
      try {
        const data = fs.readFileSync(MENU_INPUT_PATH, 'utf-8');
        const { field1_value, field2_value } = JSON.parse(data);
        CommandClient.northConnectWithButton(field1_value, field2_value);
      } catch (error) {
        console.error("Error reading menu_input.json:", error);
      }
      return;
    }

    // 5B) Field1: top‐based x∈[30..390], bottom‐based y∈[100..140] → test (1080 - y)
    if ((scaledX >= 30 && scaledX <= 390) && ((1080 - y) >= 100 && (1080 - y) <= 140)) {
      activeField = 'field1';
      updateMenuInputJSON();
      return;
    }

    // 5C) Field2: top‐based x∈[30..390], bottom‐based y∈[160..200] → test (1080 - y)
    if ((scaledX >= 30 && scaledX <= 390) && ((1080 - y) >= 160 && (1080 - y) <= 200)) {
      activeField = 'field2';
      updateMenuInputJSON();
      return;
    }
  }

  // 6) If network window is open, detect clicks on its five fields (using y directly)
  if (handleNetworkFieldClick(x, y)) {
    return;
  }

  // 7) If network numpad is open, detect clicks on that 300×300 numpad (using y)
  if (handleNetworkNumpadClick(x, y)) {
    return;
  }

  // 8) Anything else: reposition PTZ crosshair
  const oldHorizontalEnc = parseInt(CommandClient.getCrctEncoderAz());
  const oldVerticalEnc   = parseInt(CommandClient.getCrctEncoderEl());

  let newHorizontalEnc = oldHorizontalEnc;
  let newVerticalEnc   = oldVerticalEnc;

  [newHorizontalEnc, newVerticalEnc] = calculateNewPositionEncoderCrosshair(
    x, y, 1920, 1080,
    oldHorizontalEnc, oldVerticalEnc,
    zoom,
    0,      // dataModel unused
    1.8, 1.2
  );

  CommandClient.setTargetPosition(newHorizontalEnc, newVerticalEnc, 1);
  return [newHorizontalEnc, newVerticalEnc];
}

module.exports = {
  onDoubleClick
};

