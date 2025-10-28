const API_BASE = 'http://192.168.0.104:8000';

export async function fetchTelemetry() {
	console.log('[DEBUG] Frontend: Calling fetchTelemetry to Django');
	const response = await fetch(`${API_BASE}/api/telemetry/`);
	if (!response.ok) throw new Error('Failed to fetch telemetry');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received telemetry data:', data);
	return data;
}

export async function movePTZ(az, el) {
	console.log('[DEBUG] Frontend: Calling movePTZ to Django with az:', az, 'el:', el);
	const response = await fetch(`${API_BASE}/api/move`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ azimuth: az, elevation: el })
	});
	if (!response.ok) throw new Error('Failed to move PTZ');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received movePTZ response:', data);
	return data;
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
	console.log('[DEBUG] Frontend: Calling getCurrentZoom to Django');
	const response = await fetch(`${API_BASE}/api/currentZoom/`);
	if (!response.ok) throw new Error('Failed to get zoom');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received current zoom:', data);
	return data;
}

export async function setZoomLevel(level) {
	console.log('[DEBUG] Frontend: Calling setZoomLevel to Django with level:', level);
	const response = await fetch(`${API_BASE}/api/zoom`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ level })
	});
	if (!response.ok) throw new Error('Failed to set zoom level');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received setZoomLevel response:', data);
	return data;
}

export async function getCrossPositions(zoom) {
	console.log('[DEBUG] Frontend: Calling getCrossPositions to Django with zoom:', zoom);
	const response = await fetch(`${API_BASE}/api/crossPositions/?zoom=${zoom}`);
	if (!response.ok) throw new Error('Failed to get cross positions');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received cross positions:', data);
	return data;
}

export async function getPTZPosition() {
	console.log('[DEBUG] Frontend: Calling getPTZPosition to Django');
	const response = await fetch(`${API_BASE}/api/ptzPosition/`);
	if (!response.ok) throw new Error('Failed to get PTZ position');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received PTZ position:', data);
	return data;
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

export async function sendControlValue(prop, key, value) {
	const response = await fetch(`${API_BASE}/api/sendControl`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ prop, key, value })
	});
	if (!response.ok) throw new Error('Failed to send control value');
	return response.json();
}

export async function setPTZDirection(direction, start) {
	const response = await fetch(`${API_BASE}/api/setPTZDirection`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ direction, start })
	});
	if (!response.ok) throw new Error('Failed to set PTZ direction');
	return response.json();
}
