const cmdClient = require("./CommandClient");
const fs = require('fs');
const { exec } = require('child_process');
const config = require('/home/jetson/rpos/v4l2ctl.json');

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
const PRESETS_JSON_PATH       = "/tmp/presets.json";
const PRESETS_INPUT_JSON_PATH = "/tmp/presets_numpad.json";
const PRESETS_POSITIONS_PATH  = "/tmp/presets_positions.json"; 
const SCREENSHOT_FLAG_PATH    = "/tmp/screenshot_flag.json";
const DIGITAL_ZOOM_PATH       = "/tmp/digital_zoom.json";
const MOVE_TO_TARGET_PATH     = "/tmp/move_to_target.json";
const MOVE_NUMPAD_PATH        = "/tmp/move_numpad.json";

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
  DNS2: "8.8.4.4",
  numpad_flag: 0
};

const defaultNetworkInput = {
  numpad_flag: 0,
  digit: ""
};

const defaultPresets = {
  presets_flag: 0,
  current_preset_index: 0,
  add_marker_flag: 0,
  delete_marker_flag: 0,
  markers: ["", "", "", "", "", "", "", "", "", ""]
};

const defaultPresetsInput = {
  numpad_flag: 0,
  digit: ""
};

const defaultScreenshotInput = {
  screenshot_flag: 0
};

const defaultDigitalZoominput = {
  zoom_in_flag: 0,
  zoom_out_flag: 0,
  zoom : 1.0
}

const defaultMoveToTarget = {
  move_to_target_flag: 0,
  active_field: null,
  x: "0",
  y: "0",
  height: "0"
};

const defaultMoveNumpad = {
  numpad_flag: 0,
  digit: ""
};

// ─────────────────────────────────────────────────────────────────────────────
// 2) In‐memory state for menu/numpad/preset
// ─────────────────────────────────────────────────────────────────────────────

let menuFlag    = false;   // true when the menu window is open
let activeField = null;    // "field1" or "field2" when menu numpad is open
let field1Value = "0";
let field2Value = "0";
let lastPresetClick     = null;

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
ensureJsonFile(PRESETS_JSON_PATH,       defaultPresets);
ensureJsonFile(PRESETS_INPUT_JSON_PATH, defaultPresetsInput);
ensureJsonFile(PRESETS_POSITIONS_PATH, {});
ensureJsonFile(SCREENSHOT_FLAG_PATH, defaultScreenshotInput);
ensureJsonFile(DIGITAL_ZOOM_PATH, defaultDigitalZoominput);
ensureJsonFile(MOVE_TO_TARGET_PATH, defaultMoveToTarget);
ensureJsonFile(MOVE_NUMPAD_PATH,    defaultMoveNumpad);

// In‐memory state for presets
let presetsFlag         = false;
let currentPresetIndex  = 0;
let addMarkerFlag       = false;
let deleteMarkerFlag    = false;
let markers             = [...defaultPresets.markers];
let moveToTargetFlag = false;
let moveActiveField = null;
let moveXValue = "0";
let moveYValue = "0";
let moveHeightValue = "0";

function updateMoveToTargetJSON() {
  const moveState = {
    move_to_target_flag: moveToTargetFlag ? 1 : 0,
    active_field: moveActiveField,
    x: moveXValue,
    y: moveYValue,
    height: moveHeightValue
  };
  try {
    fs.writeFileSync(MOVE_TO_TARGET_PATH, JSON.stringify(moveState, null, 2));
  } catch (error) {
    console.error("Error updating move_to_target.json:", error);
  }
}

function updateMoveNumpadJSON(numpadState) {
  try {
    fs.writeFileSync(MOVE_NUMPAD_PATH, JSON.stringify(numpadState, null, 2));
  } catch (error) {
    console.error("Error updating move_numpad.json:", error);
  }
}

function handleMoveNumpadButton(buttonText) {
  switch (buttonText) {
    case "OK":
      moveActiveField = null;
      break;
    case "C":
      if (moveActiveField === "x") moveXValue = "0";
      else if (moveActiveField === "y") moveYValue = "0";
      else if (moveActiveField === "height") moveHeightValue = "0";
      break;
    default:
      if (moveActiveField === "x") moveXValue = (moveXValue === "0") ? buttonText : moveXValue + buttonText;
      else if (moveActiveField === "y") moveYValue = (moveYValue === "0") ? buttonText : moveYValue + buttonText;
      else if (moveActiveField === "height") moveHeightValue = (moveHeightValue === "0") ? buttonText : moveHeightValue + buttonText;
      break;
  }
  updateMoveToTargetJSON();
}

function handleMoveNumpadClick(x, y) {
  y = 1080 - y;
  const numpadX = 810, numpadY = 400;
  const btnW = 60, btnH = 50;
  const colX = [10,80,150,220], rowY = [70,140,210,280];
  const labels = [
    "1","2","3","",
    "4","5","6","",
    "7","8","9","",
    ".","0","C","OK"
  ];

  for (let i = 0; i < 16; i++) {
    const col = i % 4, row = Math.floor(i/4), lab = labels[i];
    if (!lab) continue;
    const L = numpadX + colX[col],
          R = L + btnW,
          T = numpadY + rowY[row],
          B = T + btnH;
    if (x>=L && x<=R && y>=T && y<=B) {
      handleMoveNumpadButton(lab);
      updateMoveNumpadJSON({ numpad_flag: moveActiveField ? 1 : 0, digit: moveActiveField ? (moveActiveField === "x" ? moveXValue : moveActiveField === "y" ? moveYValue : moveHeightValue) : "" });
      return true;
    }
  }
  return false;
}

function handleMoveFieldClick(x, y) {
  // X field
  if (x >= 90 && x <= 330 && y >= 960 && y <= 1000) {
    moveActiveField = "x";
    updateMoveToTargetJSON();
    updateMoveNumpadJSON({ numpad_flag: 1, digit: moveXValue });
    return true;
  }
  // Y field
  if (x >= 90 && x <= 330 && y >= 900 && y <= 940) {
    moveActiveField = "y";
    updateMoveToTargetJSON();
    updateMoveNumpadJSON({ numpad_flag: 1, digit: moveYValue });
    return true;
  }
  // Height field
  if (x >= 90 && x <= 330 && y >= 840 && y <= 880) {
    moveActiveField = "height";
    updateMoveToTargetJSON();
    updateMoveNumpadJSON({ numpad_flag: 1, digit: moveHeightValue });
    return true;
  }
  return false;
}

function handleMoveButtonClick(x, y) {
  if (x >= 150 && x <= 270 && y >= 750 && y <= 800) {
    // Call moveToTarget with current and target coordinates
    try {
      cmdClient.moveToTarget(
        cmdClient.X,         // cameraX
        cmdClient.Y,         // cameraY
        1107,                // cameraZ
        parseFloat(moveXValue),    // targetX
        parseFloat(moveYValue),    // targetY
        parseFloat(moveHeightValue) // targetZ
      );
    } catch (err) {
      console.error("Error calling moveToTarget:", err);
    }
    // Close the menu and reset state
    moveToTargetFlag = false;
    moveActiveField = null;
    updateMoveToTargetJSON();
    updateMoveNumpadJSON({ numpad_flag: 0, digit: "" });
    return true;
  }
  return false;
}

function updatePresetsJSON() {
  const out = {
    presets_flag:         presetsFlag ? 1 : 0,
    current_preset_index: currentPresetIndex,
    add_marker_flag:      addMarkerFlag ? 1 : 0,
    delete_marker_flag:   deleteMarkerFlag ? 1 : 0,
    markers
  };
  try {
    fs.writeFileSync(PRESETS_JSON_PATH, JSON.stringify(out, null, 2));
  } catch (err) {
    console.error("Error writing presets.json:", err);
  }
}

// load on start
try {
  const raw = fs.readFileSync(PRESETS_JSON_PATH, "utf-8");
  const p   = JSON.parse(raw);
  presetsFlag        = !!p.presets_flag;
  currentPresetIndex = p.current_preset_index;
  addMarkerFlag      = !!p.add_marker_flag;
  deleteMarkerFlag   = !!p.delete_marker_flag;
  markers            = p.markers;
} catch (e) {
  console.warn("Could not load presets.json, using defaults.");
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESSETS‐NUMPAD functions
// ─────────────────────────────────────────────────────────────────────────────
let markerName = ""; // In-memory variable to accumulate digits

function updatePresetsInputJSON(numpadState) {
  try {
    fs.writeFileSync(PRESETS_INPUT_JSON_PATH, JSON.stringify(numpadState, null, 2));
  } catch (err) {
    console.error("Error writing presets_numpad.json:", err);
  }
}

function handlePresetsNumpadClick(x, y) {
  // reuse same layout as network numpad
  y = 1080 - y;
  const numpadX = 810, numpadY = 400;
  const btnW = 60, btnH = 50;
  const colX = [10,80,150,220], rowY = [70,140,210,280];
  const labels = [
    "1","2","3","",
    "4","5","6","",
    "7","8","9","",
    ".","0","C","OK"
  ];

  for (let i = 0; i < 16; i++) {
    const col = i % 4, row = Math.floor(i/4), lab = labels[i];
    if (!lab) continue;
    const L = numpadX + colX[col],
          R = L + btnW,
          T = numpadY + rowY[row],
          B = T + btnH;
    if (x>=L && x<=R && y>=T && y<=B) {
      if (lab === "OK") {
        // Save marker into the current slot
        markers[currentPresetIndex] = markerName;
        // Reset markerName
        markerName = "";
        // Reset addMarkerFlag
        addMarkerFlag = false;
        updatePresetsJSON();

        // Reset the numpad flag and digit in PRESETS_INPUT_JSON_PATH
        updatePresetsInputJSON({ numpad_flag: 0, digit: "" });
      } else if (lab === "C") {
        // Clear markerName
        markerName = "";
        updatePresetsInputJSON({ numpad_flag: 1, digit: "" });
      } else {
        // Append digit or dot
        markerName += lab;
        updatePresetsInputJSON({ numpad_flag: 1, digit: markerName });
        markers[currentPresetIndex] = markerName;
      }
      return true;
    }
  }
  return false;
}

// Add this function to clear the numpad when switching fields
function clearNumpad() {
    markerName = "";
    updatePresetsInputJSON({ numpad_flag: 0, digit: "" });
}

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
  // Invert Y because overlay uses bottom‐origin
  y = 1080 - y;

  // MENU‐NUMPAD is 300×360, centered at (810, 400)
  const numpadX = 810; // (1920 ‒ 300)/2
  const numpadY = 400; // (1080 ‒ 360)/2 + 40

  const btnWidth   = 60;
  const btnHeight  = 50;
  const colOffsets = [10, 80, 150, 220];
  const rowOffsets = [70, 140, 210, 280];
  const labels     = [
    "1","2","3","",
    "4","5","6","",
    "7","8","9","",
    ".","0","C","OK"
  ];

  for (let i = 0; i < 16; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const label = labels[i];
    if (label === "") continue;

    const btnLeft = numpadX + colOffsets[col];
    const btnTop  = numpadY + rowOffsets[row];
    const btnRight  = btnLeft + btnWidth;
    const btnBottom = btnTop  + btnHeight;

    if (
      x >= btnLeft   && x <= btnRight &&
      y >= btnTop    && y <= btnBottom
    ) {
      handleNumpadButton(label);
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
  // Invert Y for bottom‐origin
  y = 1080 - y;
  const state = loadNetworkState();
  if (state.network_flag !== 1) return false;

  // NETWORK PANEL is 500×300, top‐left at (710, 50)
  const FRAME_W    = 1920;
  const netW       = 500;
  const netH       = 300;
  const marginTop  = 50;
  const marginLeft = (FRAME_W - netW) / 2; // = 710

  const boxH   = 40;
  const yStart = marginTop + 30; // = 80

  // Input‐box spans horizontally from [leftX..rightX] = [910..1190]
  const leftX  = marginLeft + 200;       // = 910
  const rightX = marginLeft + netW - 20; // = 1190

  for (let i = 0; i < 5; i++) {
    const topY    = yStart + i * (boxH + 10); // 80,130,180,230,280
    const bottomY = topY + boxH;              // 120,170,220,270,320

    if (
      x >= leftX && x <= rightX &&
      y >= topY  && y <= bottomY
    ) {
      const keys = ["ip_address", "subnet_mask", "gateway", "DNS1", "DNS2"];
      state.activeField = keys[i];
      updateNetworkJSON(state);
      updateNetworkNumpadJSON({ numpad_flag: 1, digit: "" });
      return true;
    }
  }

  return false;
}

function handleNetworkNumpadClick(x, y) {
  // Invert Y for bottom‐origin
  y = 1080 - y;
  const state = loadNetworkState();
  if (state.network_flag !== 1 || !state.activeField) return false;

  // NETWORK‐NUMPAD is 300×360, centered at (810, 400)
  const numpadX = 810; // (1920 ‒ 300)/2
  const numpadY = 400; // (1080 ‒ 360)/2 + 40

  const btnWidth   = 60;
  const btnHeight  = 50;
  const colOffsets = [10, 80, 150, 220];
  const rowOffsets = [70, 140, 210, 280];
  const labels     = [
    "1","2","3","",
    "4","5","6","",
    "7","8","9","",
    ".","0","C","OK"
  ];

  for (let i = 0; i < 16; i++) {
    const col   = i % 4;
    const row   = Math.floor(i / 4);
    const label = labels[i];
    if (label === "") continue;

    const btnLeft   = numpadX + colOffsets[col];
    const btnTop    = numpadY + rowOffsets[row];
    const btnRight  = btnLeft + btnWidth;
    const btnBottom = btnTop  + btnHeight;

    if (
      x >= btnLeft  && x <= btnRight &&
      y >= btnTop   && y <= btnBottom
    ) {
      handleNetworkNumpadButton(label, state);
      return true;
    }
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6) “Set” Button Functionality
// ─────────────────────────────────────────────────────────────────────────────

function ethernetSet() {
  // Read the network.json we wrote
  let config;
  try {
    delete require.cache[ require.resolve(NETWORK_JSON_PATH) ];
    config = require(NETWORK_JSON_PATH);
  } catch (e) {
    console.error("❌ Failed to load network.json:", e);
    return;
  }

  // Validate that each UserControls field is a non‐empty string
  const fields = ["ip_address", "subnet_mask", "gateway", "DNS1", "DNS2"];
  for (const field of fields) {
    const val = config[field];
    if (typeof val !== 'string' || val.trim() === '') {
      console.error(`❌ Network “Set” aborted: ${field} is empty or missing.`);
      return;
    }
  }

  // At this point, all five fields are present and non‐empty:
  console.log('✅  All fields present:');
  console.log('   IP      →', config.ip_address);
  console.log('   Subnet  →', config.subnet_mask);
  console.log('   Gateway →', config.gateway);
  console.log('   DNS1    →', config.DNS1);
  console.log('   DNS2    →', config.DNS2);

  // Store locally (optional)
  const ipAddress  = config.ip_address;
  const subnetMask = config.subnet_mask;
  const gateway    = config.gateway;
  const dns1       = config.DNS1;
  const dns2       = config.DNS2;

  const password  = "Aragats777";
  const interfaceName = "enP8p1s0"; // e.g. "eth0"

  const command = `echo '${password}' | sudo -S ./scripts/set_network_config.sh ${interfaceName} ${ipAddress} ${subnetMask} ${gateway} ${dns1} ${dns2}`;
  console.log('Changing Ethernet settings to:');
  console.log(`  ↳ ${ipAddress}  ${subnetMask}  ${gateway}  ${dns1}  ${dns2}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ stderr: ${stderr}`);
      return;
    }
    console.log(`✅ Output:\n${stdout}`);
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// 7) CAMERA & PTZ CROSSHAIR FUNCTIONS (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

class CameraCorrection {
  constructor(dataModel) {
    this.dataModel = dataModel;
  }

  getCorrection(isDay, zoom) {
    if (isDay) {
      const x = cmdClient.getEncCrctZoomAz(1);
      const y = cmdClient.latestOdData.properties[`CC_DCm_bY_x${zoom}`];
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
  const xCrossPos = cmdClient.getEncCrctZoomAz(zoom);
  const yCrossPos = cmdClient.getEncCrctZoomEl(zoom);

  var cross_y = 520;
  var cross_x = 960;
  if (zoomForCaluculations == 1)   {cross_y = 557; 
    cross_x = 959}
  else if (zoomForCaluculations == 5)   cross_y = 563;
  else if (zoomForCaluculations == 15)   cross_y = 564;
  else if (zoomForCaluculations == 30)  cross_y = 557;
  else if (zoomForCaluculations == 60)  cross_y = 535;
  else if (zoomForCaluculations == 68)  cross_y = 527;

  const xCrossCorrection = cross_x - xCrossPos;
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
// 8) MAIN “onDoubleClick” HANDLER
// ─────────────────────────────────────────────────────────────────────────────

let zoomVariable = 1.0
let zoomFlagForDigitalZoom = false;

function onDoubleClick(x, y, zoom) {
  const scaledX = x;
  const invY    = 1080 - y;

  if (zoom == 6) {
    zoomFlagForDigitalZoom = true;
  }

  if (zoomFlagForDigitalZoom && zoom != 6) {
      zoomVariable = Math.round((zoomVariable - 0.2) * 10) / 10; // round to 1 decima
      const digitalZoomOverlay = {zoom_in_flag: 0, zoom_out_flag: 0, zoom: 1.0};
      try {
        fs.writeFileSync(DIGITAL_ZOOM_PATH, JSON.stringify(digitalZoomOverlay, null, 2));
      } catch (error) {
        console.error("Error toggling digital_zoom.json:", error);
      }   
  }

  // 1) If a menu‐numpad (activeField) is open, let it consume clicks first.
  if (activeField) {
    if (handleNumpadClick(x, y)) {
      return;
    }

    return;
    // clicked outside of numpad → fall through
  }

  // 2) Green button (Poll Range Finder) — always active
  if (x >= 520 && x <= 600 && y >= 20 && y <= 60) {
    cmdClient.pollRangeFinder();
    return;
  }
  
  if (x >= 10 && x <= 70 && y >= 584 && y <= 644) {
    console.log("Clicked on Digital Zoom - button: ", zoomVariable);
    if (zoom == 6) {
      if (zoomVariable >= 1.2) {
        zoomVariable = Math.round((zoomVariable - 0.2) * 10) / 10; // round to 1 decimal
      }
      const digitalZoomOverlay = {zoom_in_flag: 0, zoom_out_flag: 1, zoom: zoomVariable};
      try {
        fs.writeFileSync(DIGITAL_ZOOM_PATH, JSON.stringify(digitalZoomOverlay, null, 2));
      } catch (error) {
        console.error("Error toggling digital_zoom.json:", error);
      }   
    }
    return;
  }

  if (x >= 160 && x <= 240 && y >= 20 && y <= 60) {
    moveToTargetFlag = !moveToTargetFlag;
    moveActiveField = null;
    updateMoveToTargetJSON();
    updateMoveNumpadJSON({ numpad_flag: 0, digit: "" });
    return;
  }

  if (x >= 10 && x <= 70 && y >= 434 && y <= 494) {
    if (zoom == 6) {
      zoomVariable = Math.round((zoomVariable + 0.2) * 10) / 10; // round to 1 decimal
      console.log("Clicked on Digital Zoom + button: ", zoomVariable); 
      const digitalZoomOverlay = {zoom_in_flag: 1, zoom_out_flag: 0, zoom: zoomVariable};
      try {
        fs.writeFileSync(DIGITAL_ZOOM_PATH, JSON.stringify(digitalZoomOverlay, null, 2));
      } catch (error) {
        console.error("Error toggling digital_zoom.json:", error);
      }
    }
    return;
  }

  if (x >= 340 && x <= 420 && y >= 20 && y <= 60) {
    console.log("Clicked on SCRENSHOOT button");
    const screenshotOverlay = { screenshot_flag: 1 };
    try {
      fs.writeFileSync(SCREENSHOT_FLAG_PATH, JSON.stringify(screenshotOverlay, null, 2));
    } catch (error) {
      console.error("Error toggling screenshot_flag.json:", error);
    }
    return;
  }

  // 3) Red button (Toggle Menu) — always active
  if (x >= 700 && x <= 780 && y >= 20 && y <= 60) {
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

  // 4) Network Config button (Toggle Network) — always active
  if (x >= 880 && x <= 960 && y >= 20 && y <= 60) {
    const state = loadNetworkState();
    if (state.network_flag === 0) {
      state.network_flag = 1;
      state.activeField  = null;
    } else {
      state.network_flag = 0;
      state.activeField  = null;
    }
    updateNetworkJSON(state);
    return;
  }


  // ── Presets button at bottom (still raw y) ────────────────────────
  if (x >= 1100 && x <= 1240 && y >= 20 && y <= 60) {
    presetsFlag      = !presetsFlag;
    addMarkerFlag    = false;
    deleteMarkerFlag = false;
    clearNumpad();
    updatePresetsJSON();
    return;
  }

  if (moveToTargetFlag) {
    // Handle numpad first
    if (moveActiveField && handleMoveNumpadClick(x, y)) {
      return;
    }
    // Handle field selection
    if (handleMoveFieldClick(x, y)) {
      return;
    }

    if (handleMoveButtonClick(x, y)) {
      return;
    }
    // Optionally: handle "Move" button, etc.
    // If click is inside the move_to_target menu background, ignore
    if (
    x >= 10 && x <= 410 &&
    y >= 670 && y <= 1070
  ) {    return; }
    // Otherwise, fall through to PTZ
  }

  if (presetsFlag) {
    // Invert Y so 0 is at the bottom, like your overlay draw
    const invY = 1080 - y;

    const panelW = 350, panelH = 550;
    const panelX = 1920 - panelW - 10;
    const panelY = 80;     // measured from top in draw

     const btnH    = 50;
     const addTop  = panelY + 20;
     const delTop  = addTop + btnH + 10;
     const slotsY0 = delTop + btnH + 30;
     const slotH   = 30;
     const slotW   = panelW - 40; // text draws from panelX+20..+20+slotW

     // **PRIORITY: Check for Presets Numpad clicks FIRST**
     if (addMarkerFlag && handlePresetsNumpadClick(x, y)) {
       return;
     }

     // 1) Add Marker
    if (x >= panelX + 10 && x <= panelX + panelW - 10 &&
       invY >= addTop   && invY <= addTop + btnH) {
    // start “add marker” mode
    addMarkerFlag = true;
    updatePresetsJSON();
    clearNumpad();   

    

    // grab current PTZ encoders
    const Az = cmdClient.getCrctEncoderAz();
    const El = cmdClient.getCrctEncoderEl();
    const irZoom = global.currentIRZoom;
    const dayZoom = global.currentDayZoom;

    // persist into a side‐file
    try {
      const raw = fs.readFileSync(PRESETS_POSITIONS_PATH, 'utf-8');
      const positions = JSON.parse(raw);
      // map this slot index → { az, el }
      positions[currentPresetIndex] = { az: Az, el: El, zoomIR: irZoom, zoomDay: dayZoom };
      fs.writeFileSync(
        PRESETS_POSITIONS_PATH,
        JSON.stringify(positions, null, 2)
      );
    } catch (err) {
      console.error("Error saving preset positions:", err);
    }
     return;
   }

     // 2) Delete Marker
    if (x >= panelX + 10 && x <= panelX + panelW - 10 &&
       invY >= delTop   && invY <= delTop + btnH) {

    // 1) wipe the marker text
    markers[currentPresetIndex] = "";

    // 2) also remove its saved PTZ position
    try {
      const raw = fs.readFileSync(PRESETS_POSITIONS_PATH, 'utf-8');
      const positions = JSON.parse(raw);
      delete positions[currentPresetIndex];
      fs.writeFileSync(
        PRESETS_POSITIONS_PATH,
        JSON.stringify(positions, null, 2)
      );
    } catch (err) {
      console.error("Error deleting preset position:", err);
    }

      // 3) clear delete‐mode (if you still use the flag anywhere)
      deleteMarkerFlag = false;
      updatePresetsJSON();
     return;
   }

// 3) Marker slots (1–10)
for (let i = 0; i < 10; i++) {
  const top    = slotsY0 + i*(slotH + 8) - 10;
  const bottom = top + slotH;
  if (
    x    >= panelX  &&
    x    <= panelX + 200 + slotW &&
    invY >= top    -10  &&
    invY <= bottom - 15
  ) {
    // 1) Delete‐mode: clear this slot immediately
    if (deleteMarkerFlag) {
      markers[i]         = "";
      deleteMarkerFlag   = false;
      updatePresetsJSON();
      return;
    }

    // 2) Double‐click on same slot → jump to saved Az/El
    if (lastPresetClick === i) {
      try {
        const raw    = fs.readFileSync(PRESETS_POSITIONS_PATH, 'utf-8');
        const posMap = JSON.parse(raw);
        const pos    = posMap[i];
        if (pos && pos.az != null && pos.el != null && parseInt(pos.zoomDay) != null && parseInt(pos.zoomIR) != null) {
          global.currentIRZoom = parseInt(pos.zoomIR);
          global.currentDayZoom = parseInt(pos.zoomDay);
          cmdClient.setMarkerPosition(pos.az, pos.el, parseInt(pos.zoomIR), parseInt(pos.zoomDay));
        }
      } catch (err) {
        console.error("Error loading preset position:", err);
      }
      lastPresetClick = null;
      return;
    }

    // 3) Single-click: select for future double-click
    currentPresetIndex = i;
    updatePresetsJSON();
    lastPresetClick   = i;
    return;
  }
  //return;
}

  if (x >= panelX && x <= panelX + panelW &&
      invY >= panelY && invY <= panelY + panelH) {
    // we were inside the panel but not on a specific control
    return;
  }
  }

  // 5) If the menu window is open, handle ONLY menu interactions.
  if (menuFlag) {
    const invY = 1080 - y;

    // NorthConnect button (x ∈ [20..400], invY ∈ [20..80])
    if (scaledX >= 20 && scaledX <= 400 && invY >= 20 && invY <= 80) {
      //try {
        console.log("NORTH CONNECT OVERLAY BUTTOn")
        delete require.cache[ require.resolve('/home/jetson/rpos/v4l2ctl.json') ];
        const config1 = require('/home/jetson/rpos/v4l2ctl.json');

        const data = fs.readFileSync(MENU_INPUT_PATH, "utf-8");
        const { field1_value, field2_value } = JSON.parse(data);

        config1.UserControls.alphaD1 = field1_value;
        config1.UserControls.alphaD2 = field2_value;

        fs.writeFileSync('/home/jetson/rpos/v4l2ctl.json', JSON.stringify(config1, null, 2));

        console.log("Field values !!!!!!!!!!", field1_value, field2_value)
        //cmdClient.northConnectWithButton(parseInt(field1_value), parseInt(field2_value));
        global.cmdClient.northConnect();
        global.cmdClient.northConnect();
        console.log("North Connect button values", field1_value, field2_value)
     // } catch (error) {
     //   console.error("Error reading menu_input.json:", error);
     // }
      return;
    }

    // Field1 region (x ∈ [30..390], invY ∈ [100..140])
    if (scaledX >= 30 && scaledX <= 390 && invY >= 100 && invY <= 140) {
      activeField = "field1";
      updateMenuInputJSON();
      return;
    }

    // Field2 region (x ∈ [30..390], invY ∈ [160..200])
    if (scaledX >= 30 && scaledX <= 390 && invY >= 160 && invY <= 200) {
      activeField = "field2";
      updateMenuInputJSON();
      return;
    }

    const MENU_X      = 10;
    const MENU_Y      = 10;
    const MENU_W      = 400;
    const MENU_H      = 300;

  if (
    scaledX >= MENU_X &&
    scaledX <= MENU_X + MENU_W &&
    invY    >= 0 &&
    invY    <= 320
  ) {
    // inside the grey menu background → ignore
    return;
  } 

  return doPTZMove(x, y, zoom);

    // Outside menu areas → PTZ
    //return; //doPTZMove(x, y, zoom);
  }

  // 6) If network window is open, check “Set” button first
  {
    const state = loadNetworkState();
    if (state.network_flag === 1) {
      // “Set” button rectangle: top‐left at (1090, 340), size 100×40
      //   marginLeft = 710, btnX = 710 + 500 - 100 - 20 = 1090
      //   btnY = 50 + 270 + 20 = 340
      const btnLeft = 1090;
      const btnRight = btnLeft + 100; // 1190
      const btnTop = 700;
      const btnBottom = btnTop + 40; // 700 - 740

      if (
        scaledX >= btnLeft && scaledX <= btnRight &&
        y       >= btnTop  && y       <= btnBottom
      ) {
        ethernetSet();
        return;
      }
    }
  }

  // 7) If network window is open, handle clicks on its fields
  if (handleNetworkFieldClick(x, y)) {
    return;
  }

  // 8) If network’s numpad is open, let it consume clicks
  if (handleNetworkNumpadClick(x, y)) {
    return;
  }


  // if (handlePresetsNumpadClick(x, y)) {
  //   return;
  // }

  // 9) Anything else → reposition PTZ crosshair


  let dz = zoomVariable; // Use the actual digital zoom variable!
  let finalX = x;
  let finalY = y;
  let totalZoom = zoom;

  if (dz > 1.0) {
    const cropW = 1920 / dz;
    const cropH = 1080 / dz;
    const cropX0 = (1920 - cropW) / 2;
    const cropY0 = (1080 - cropH) / 2;

    finalX = cropX0 + (x / 1920) * cropW;
    finalY = cropY0 + (y / 1080) * cropH;

    //totalZoom = zoom * dz; // Combine optical and digital zoom
    console.log("💡 Crop width:", cropW, " Crop height:", cropH);
    console.log("📍 Remapped X:", finalX, " Remapped Y:", finalY);
    console.log("🔍 Total zoom (optical × digital):", totalZoom);
  } else {
    console.log("✅ No digital zoom active, using original coordinates.");
    totalZoom = zoom;
  }

  return doPTZMove(finalX, finalY, totalZoom)

  //return doPTZMove(x, y, zoom);
}


// ───────────────────────────────────────────────────────────────────────────────
// Helper function to run the PTZ logic in one place
// ───────────────────────────────────────────────────────────────────────────────
function doPTZMove(clickX, clickY, zoom) {
  const oldHorizontalEnc = parseInt(cmdClient.getCrctEncoderAz(), 10);
  const oldVerticalEnc   = parseInt(cmdClient.getCrctEncoderEl(), 10);

  const [newHorizontalEnc, newVerticalEnc] =
    calculateNewPositionEncoderCrosshair(
      clickX,
      clickY,
      1920,
      1080,
      oldHorizontalEnc,
      oldVerticalEnc,
      zoom,
      0,      // dataModel unused here
      1.8,    // correction_coefficient_h
      1.2     // correction_coefficient_v
    );

  cmdClient.setTargetPosition(newHorizontalEnc, newVerticalEnc, 1);
  return [newHorizontalEnc, newVerticalEnc];
}

module.exports = {
  onDoubleClick
};
