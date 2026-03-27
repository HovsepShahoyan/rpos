import { writable } from 'svelte/store';

export const telemetryData = writable({
	inclinoData: {},
	gpsData: {},
	stmdData: {},
	movementData: {},
	rangeData: {}
});

export const angles = writable({
	azimuth_degrees: '--',
	azimuth_angle: '--',
	elevation_degrees: '--',
	elevation_angle: '--'
});

export const distance = writable({
	D: '--'
});

// Poll telemetry every 100ms
let telemetryInterval;
export function startTelemetryPolling() {
	if (telemetryInterval) return;
	
	telemetryInterval = setInterval(async () => {
		try {
			const response = await fetch('/api/telemetry');
			if (response.ok) {
				const data = await response.json();
				telemetryData.set(data);
			}
		} catch (error) {
			console.error('Failed to fetch telemetry:', error);
		}
	}, 100);
}

export function stopTelemetryPolling() {
	if (telemetryInterval) {
		clearInterval(telemetryInterval);
		telemetryInterval = null;
	}
}

// Poll angles every 1 second
let anglesInterval;
export function startAnglesPolling() {
	if (anglesInterval) return;
	
	anglesInterval = setInterval(async () => {
		try {
			const response = await fetch('/api/angles');
			if (response.ok) {
				const data = await response.json();
				angles.set(data);
			}
		} catch (error) {
			console.error('Failed to fetch angles:', error);
		}
	}, 1000);
}

export function stopAnglesPolling() {
	if (anglesInterval) {
		clearInterval(anglesInterval);
		anglesInterval = null;
	}
}

// Poll distance every 1 second
let distanceInterval;
export function startDistancePolling() {
	if (distanceInterval) return;
	
	distanceInterval = setInterval(async () => {
		try {
			const response = await fetch('/api/distance');
			if (response.ok) {
				const data = await response.json();
				distance.set(data);
			}
		} catch (error) {
			console.error('Failed to fetch distance:', error);
		}
	}, 1000);
}

export function stopDistancePolling() {
	if (distanceInterval) {
		clearInterval(distanceInterval);
		distanceInterval = null;
	}
}
