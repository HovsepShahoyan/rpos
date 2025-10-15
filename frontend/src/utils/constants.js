// PTZ Constants
export const BASE_FOV_HORIZONTAL = 66.0;
export const BASE_FOV_VERTICAL = 40.3;
export const AZIM_RIGHT = 271000;
export const AZIM_LEFT = 0;
export const ELEV_UP = 262143;
export const ELEV_DOWN = 0;

// Day zoom coefficient grid
export const DAY_ZOOM_COEFFICIENT_GRID = {
	6: [1.1, 1.05],
	5: [1.45, 1.35],
	4: [1.8, 1.7],
	3: [1.8, 1.65],
	2: [1.62, 1.45],
	1: [1.03, 0.9]
};

// IR zoom coefficient grid
export const IR_ZOOM_COEFFICIENT_GRID = {
	8: [0.65, 0.58],
	4: [0.95, 0.85],
	2: [1.25, 1.1],
	1: [1.28, 1.1]
};

// IR crosshair positions
export const IR_CROSSHAIR_POSITIONS = {
	1: [959, 557],
	2: [960, 563],
	4: [960, 564],
	8: [960, 557]
};

// Go2RTC configuration
export const GO2RTC_BASE = 'http://192.168.0.104:1984';

// Video base resolution
export const VIDEO_BASE = { w: 1920, h: 1080 };
