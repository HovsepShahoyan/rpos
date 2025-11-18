import { writable } from 'svelte/store';
import { showToast } from './ui.js';

export const isAuthenticated = writable(false);
export const accessToken = writable(null);
export const refreshToken = writable(null);
export const currentUser = writable(null);

const API_BASE = 'http://192.168.0.104:8000';

export async function login(username, password) {
	try {
		const response = await fetch(`${API_BASE}/api/v1/login/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});

		if (response.ok) {
			const data = await response.json();
			accessToken.set(data.access);
			refreshToken.set(data.refresh);
			isAuthenticated.set(true);
			currentUser.set({ username });
			localStorage.setItem('accessToken', data.access);
			localStorage.setItem('refreshToken', data.refresh);
			showToast('Login successful', 'success');
			return true;
		} else {
			const error = await response.json();
			showToast(error.detail || 'Login failed', 'error');
			return false;
		}
	} catch (error) {
		showToast('Network error during login', 'error');
		return false;
	}
}

export async function logout() {
	try {
		const token = localStorage.getItem('accessToken');
		if (token) {
			await fetch(`${API_BASE}/api/v1/logout/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});
		}
	} catch (error) {
		console.error('Logout error:', error);
	}

	// Clear local state
	accessToken.set(null);
	refreshToken.set(null);
	isAuthenticated.set(false);
	currentUser.set(null);
	localStorage.removeItem('accessToken');
	localStorage.removeItem('refreshToken');
	showToast('Logged out successfully', 'info');
}

export async function refreshAccessToken() {
	const refresh = localStorage.getItem('refreshToken');
	if (!refresh) {
		logout();
		return false;
	}

	try {
		const response = await fetch(`${API_BASE}/api/v1/token/refresh/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refresh })
		});

		if (response.ok) {
			const data = await response.json();
			accessToken.set(data.access);
			localStorage.setItem('accessToken', data.access);
			return true;
		} else {
			logout();
			return false;
		}
	} catch (error) {
		logout();
		return false;
	}
}

// Initialize auth state from localStorage
export function initAuth() {
	const token = localStorage.getItem('accessToken');
	const refresh = localStorage.getItem('refreshToken');
	if (token && refresh) {
		accessToken.set(token);
			refreshToken.set(refresh);
		isAuthenticated.set(true);
		// Optionally validate token here
	}
}
