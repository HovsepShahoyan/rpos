import { writable } from 'svelte/store';

export const currentStream = writable(1); // 1=day, 2=ir
export const currentZoom = writable(1);
export const currentSpeed = writable(4);
export const currentBrightness = writable(50);
export const currentContrast = writable(50);
export const currentDayZoomIndex = writable(0);
export const currentDigitalZoomIndex = writable(0);

export const dayZoomValues = [1, 5, 15, 30, 60, 68];
export const digitalZoomValues = [1, 2, 4, 8];

// Video dimensions
export const videoWidth = writable(1920);
export const videoHeight = writable(1080);
export const cameraType = writable(1); // 1=day, 2=ir
