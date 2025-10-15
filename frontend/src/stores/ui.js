import { writable } from 'svelte/store';

// Current active page
export const currentPage = writable('fastlive');

// Toast notifications
export const toasts = writable([]);

export function showToast(message, type = 'info') {
	const id = Date.now();
	toasts.update(t => [...t, { id, message, type }]);
	
	setTimeout(() => {
		toasts.update(t => t.filter(toast => toast.id !== id));
	}, 3000);
}
