import { accessToken, refreshAccessToken } from '../stores/auth.js';

const API_BASE = 'http://192.168.0.104:8000';

async function getAuthHeaders() {
	let token = localStorage.getItem('accessToken');
	if (!token) return {};

	// Check if token is expired (simple check, you might want to decode JWT)
	// For now, we'll try the request and refresh if it fails with 401
	return { 'Authorization': `Bearer ${token}` };
}

async function makeAuthenticatedRequest(url, options = {}) {
	const headers = await getAuthHeaders();
	const response = await fetch(url, {
		...options,
		headers: {
			...headers,
			...options.headers
		}
	});

	if (response.status === 401) {
		// Try to refresh token
		const refreshed = await refreshAccessToken();
		if (refreshed) {
			const newHeaders = await getAuthHeaders();
			return fetch(url, {
				...options,
				headers: {
					...newHeaders,
					...options.headers
				}
			});
		}
	}

	return response;
}

export async function fetchTelemetry() {
	console.log('[DEBUG] Frontend: Calling fetchTelemetry to Django');
	const response = await makeAuthenticatedRequest(`${API_BASE}/api/system/telemetry/`);
	if (!response.ok) throw new Error('Failed to fetch telemetry');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received telemetry data:', data);
	return data;
}

export async function movePTZ(az, el) {
	console.log('[DEBUG] Frontend: Calling movePTZ to Django with az:', az, 'el:', el);
	const response = await makeAuthenticatedRequest(`${API_BASE}/api/system/move_ptz/`, {
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
	const response = await fetch(`${API_BASE}/api/system/set_speed/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ speed })
	});
	if (!response.ok) throw new Error('Failed to set speed');
	return response.json();
}

export async function setCurrentStream(stream) {
	const response = await fetch(`${API_BASE}/api/system/set_current_stream/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ stream })
	});
	if (!response.ok) throw new Error('Failed to set stream');
	return response.json();
}

export async function getCurrentZoom() {
	console.log('[DEBUG] Frontend: Calling getCurrentZoom to Django');
	const response = await fetch(`${API_BASE}/api/system/current_zoom/`);
	if (!response.ok) throw new Error('Failed to get zoom');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received current zoom:', data);
	return data;
}

export async function setZoomLevel(level) {
	console.log('[DEBUG] Frontend: Calling setZoomLevel to Django with level:', level);
	const response = await fetch(`${API_BASE}/api/system/set_zoom/`, {
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
	const response = await fetch(`${API_BASE}/api/system/cross_positions/?zoom=${zoom}`);
	if (!response.ok) throw new Error('Failed to get cross positions');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received cross positions:', data);
	return data;
}

export async function getPTZPosition() {
	console.log('[DEBUG] Frontend: Calling getPTZPosition to Django');
	const response = await fetch(`${API_BASE}/api/system/ptz_position/`);
	if (!response.ok) throw new Error('Failed to get PTZ position');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received PTZ position:', data);
	return data;
}

export async function setResolution(width, height) {
	const response = await fetch(`${API_BASE}/api/system/set_resolution/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ width, height })
	});
	if (!response.ok) throw new Error('Failed to set resolution');
	return response.json();
}

export async function fetchAngles() {
	const response = await fetch(`${API_BASE}/api/system/angles/`);
	if (!response.ok) throw new Error('Failed to fetch angles');
	return response.json();
}

export async function fetchDistance() {
	const response = await fetch(`${API_BASE}/api/system/distance/`);
	if (!response.ok) throw new Error('Failed to fetch distance');
	return response.json();
}

export async function fetchLoginAttempts() {
	const response = await fetch(`${API_BASE}/api/system/login_attempts/`);
	if (!response.ok) throw new Error('Failed to fetch login attempts');
	return response.json();
}

export async function scheduleReboot(time, password, scriptPath, runAs) {
	const response = await fetch(`${API_BASE}/api/system/schedule_reboot/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ time, password, scriptPath, runAs })
	});
	if (!response.ok) throw new Error('Failed to schedule reboot');
	return response.json();
}

export async function sendControlValue(prop, key, value) {
	const response = await fetch(`${API_BASE}/api/system/send_control/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ prop, key, value })
	});
	if (!response.ok) throw new Error('Failed to send control value');
	return response.json();
}

export async function setPTZDirection(direction, start) {
	const response = await fetch(`${API_BASE}/api/system/set_ptz_direction/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ direction, start })
	});
	if (!response.ok) throw new Error('Failed to set PTZ direction');
	return response.json();
}

export async function fetchCameras() {
	console.log('[DEBUG] Frontend: Calling fetchCameras to Django');
	const response = await fetch(`${API_BASE}/api/v1/cameras/`);
	if (!response.ok) throw new Error('Failed to fetch cameras');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received cameras data:', data);
	return data;
}

export async function addCamera(cameraData) {
	console.log('[DEBUG] Frontend: Calling addCamera to Django with data:', cameraData);
	const response = await fetch(`${API_BASE}/api/v1/cameras/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(cameraData)
	});
	if (!response.ok) throw new Error('Failed to add camera');
	const data = await response.json();
	console.log('[DEBUG] Frontend: Received addCamera response:', data);
	return data;
}

export async function deleteCamera(id) {
	console.log('[DEBUG] Frontend: Calling deleteCamera to Django with id:', id);
	const response = await fetch(`${API_BASE}/api/v1/cameras/${id}/`, {
		method: 'DELETE'
	});
	if (!response.ok) throw new Error('Failed to delete camera');
	console.log('[DEBUG] Frontend: Camera deleted successfully');
	return true;
}
