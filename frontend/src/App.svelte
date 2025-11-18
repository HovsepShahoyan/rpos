<script>
	import { onMount, onDestroy } from 'svelte';
	import Navigation from './components/Navigation.svelte';
	import Login from './components/Login.svelte';
	import FastLive from './components/FastLive.svelte';
	import Fullscreen from './components/Fullscreen.svelte';
	import Map from './components/Map.svelte';
	import Telemetry from './components/Telemetry.svelte';
	import Settings from './components/Settings.svelte';
	import Controls from './components/Controls.svelte';
	import Logs from './components/Logs.svelte';
	import Reboot from './components/Reboot.svelte';
	import { currentPage, toasts } from './stores/ui.js';
	import { isAuthenticated, initAuth } from './stores/auth.js';
	import {
		startTelemetryPolling,
		stopTelemetryPolling,
		startAnglesPolling,
		stopAnglesPolling,
		startDistancePolling,
		stopDistancePolling
	} from './stores/telemetry.js';

	onMount(() => {
		// Initialize authentication state
		initAuth();

		// Start polling for telemetry data only if authenticated
		if ($isAuthenticated) {
			startTelemetryPolling();
			startAnglesPolling();
			startDistancePolling();
		}
	});

	onDestroy(() => {
		// Stop polling when component is destroyed
		stopTelemetryPolling();
		stopAnglesPolling();
		stopDistancePolling();
	});
</script>

{#if !$isAuthenticated}
	<Login />
{:else}
	<Navigation />

	<main class="main-container {$currentPage === 'fullscreen' ? 'fullscreen-page' : ''}">
		{#if $currentPage === 'fastlive'}
			<FastLive />
		{:else if $currentPage === 'fullscreen'}
			<Fullscreen />
		{:else if $currentPage === 'map'}
			<Map />
		{:else if $currentPage === 'telemetry'}
			<Telemetry />
		{:else if $currentPage === 'settings'}
			<Settings />
		{:else if $currentPage === 'controls'}
			<Controls />
		{:else if $currentPage === 'logs'}
			<Logs />
		{:else if $currentPage === 'reboot'}
			<Reboot />
		{/if}
	</main>
{/if}

<!-- Toast notifications -->
<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<div class="toast {toast.type}">
			{toast.message}
		</div>
	{/each}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background-color: #0f111a;
		color: #f0f4ff;
		line-height: 1.6;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-container {
		flex: 1;
		max-width: 1400px;
		margin: 2rem auto;
		padding: 6rem 2rem 0 2rem;
		width: 100%;
	}

	:global(.fullscreen-page .main-container) {
		margin: 0;
		padding: 4rem 0 0 0;
		max-width: none;
		width: 100vw;
	}

	.toast-container {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 2000;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.toast {
		background: rgba(26, 32, 54, 0.9);
		backdrop-filter: blur(12px);
		border-left: 4px solid #00d4aa;
		border-radius: 0.875rem;
		padding: 1.25rem;
		min-width: 320px;
		max-width: 400px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		font-weight: 600;
		color: #f0f4ff;
		animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.toast.info {
		border-left-color: #00d4aa;
	}

	.toast.success {
		border-left-color: #00d4aa;
	}

	.toast.error {
		border-left-color: #ff6b6b;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
