const API_BASE = '';

export async function fetchTelemetry() {
	const response = await fetch(`${API_BASE}/api/telemetry`);
	if (!response.ok) throw new Error('Failed to fetch telemetry');
	return response.json();
}

export async function movePTZ(az, el) {
	const response = await fetch(`${API_BASE}/api/ptzMove`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ az, el })
	});
	if (!response.ok) throw new Error('Failed to move PTZ');
	return response.json();
}

export async function setSpeed(speed) {
	const response = await fetch(`${API_BASE}/api/setSpeed`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ speed })
	});
	if (!response.ok) throw new Error('Failed to set speed');
	return response.json();
}

export async function setCurrentStream(stream) {
	const response = await fetch(`${API_BASE}/api/setCurrentStream`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ stream })
	});
	if (!response.ok) throw new Error('Failed to set stream');
	return response.json();
}

export async function getCurrentZoom() {
	const response = await fetch(`${API_BASE}/api/currentZoom`);
	if (!response.ok) throw new Error('Failed to get zoom');
	return response.json();
}

export async function setZoomLevel(level) {
	const response = await fetch(`${API_BASE}/api/setZoomLevel`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ level })
	});
	if (!response.ok) throw new Error('Failed to set zoom level');
	return response.json();
}

export async function getCrossPositions(zoom) {
	const response = await fetch(`${API_BASE}/api/crossPositions?zoom=${zoom}`);
	if (!response.ok) throw new Error('Failed to get cross positions');
	return response.json();
}

export async function getPTZPosition() {
	const response = await fetch(`${API_BASE}/api/ptzPosition`);
	if (!response.ok) throw new Error('Failed to get PTZ position');
	return response.json();
}

export async function setResolution(width, height) {
	const response = await fetch(`${API_BASE}/api/setResolution`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ width, height })
	});
	if (!response.ok) throw new Error('Failed to set resolution');
	return response.json();
}

export async function sendControlValue(prop, key, value) {
	const body = `${prop}.${key}=${encodeURIComponent(value)}`;
	const response = await fetch('/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});
	if (!response.ok) throw new Error('Failed to send control value');
	return response;
}

export async function fetchAngles() {
	const response = await fetch(`${API_BASE}/api/angles`);
	if (!response.ok) throw new Error('Failed to fetch angles');
	return response.json();
}

export async function fetchDistance() {
	const response = await fetch(`${API_BASE}/api/distance`);
	if (!response.ok) throw new Error('Failed to fetch distance');
	return response.json();
}

export async function fetchLoginAttempts() {
	const response = await fetch(`${API_BASE}/api/loginAttempts`);
	if (!response.ok) throw new Error('Failed to fetch login attempts');
	return response.json();
}

export async function scheduleReboot(time, password, scriptPath, runAs) {
	const body = `time=${encodeURIComponent(time)}&password=${encodeURIComponent(password)}&scriptPath=${encodeURIComponent(scriptPath)}&runAs=${encodeURIComponent(runAs)}`;
	const response = await fetch(`${API_BASE}/api/scheduleReboot`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});
	if (!response.ok) throw new Error('Failed to schedule reboot');
	return response.json();
}
