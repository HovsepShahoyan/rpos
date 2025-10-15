<script>
	import { currentPage } from '../stores/ui.js';

	const pages = [
		{ id: 'fastlive', label: 'Fast Live' },
		{ id: 'map', label: 'Map' },
		{ id: 'telemetry', label: 'Telemetry' },
		{ id: 'settings', label: 'Settings' },
		{ id: 'controls', label: 'Controls' },
		{ id: 'logs', label: 'Logs' },
		{ id: 'reboot', label: 'Reboot' }
	];

	function navigateTo(pageId) {
		currentPage.set(pageId);
	}
</script>

<nav class="navbar">
	<div class="nav-container">
		<div class="nav-brand">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
			</svg>
			Aragats ONVIF
		</div>
		<ul class="nav-menu">
			{#each pages as page}
				<li>
					<button 
						class="nav-link" 
						class:active={$currentPage === page.id}
						on:click={() => navigateTo(page.id)}
					>
						{page.label}
					</button>
				</li>
			{/each}
			<li>
				<span class="status-indicator status-online"></span>
				<span>Online</span>
			</li>
		</ul>
	</div>
</nav>

<style>
	.navbar {
		background: rgba(26, 32, 54, 0.6);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1rem 2rem;
		position: sticky;
		top: 0;
		z-index: 1000;
	}

	.nav-container {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nav-brand {
		font-size: 1.5rem;
		font-weight: 700;
		color: #00d4aa;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-menu {
		display: flex;
		list-style: none;
		gap: 1.5rem;
		align-items: center;
		margin: 0;
		padding: 0;
	}

	.nav-link {
		color: #b8c2e0;
		background: none;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		cursor: pointer;
		font-weight: 500;
		font-size: 1rem;
		font-family: inherit;
	}

	.nav-link:hover,
	.nav-link.active {
		color: #f0f4ff;
		background-color: rgba(0, 212, 170, 0.15);
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 24px;
		height: 3px;
		background-color: #00d4aa;
		border-radius: 2px;
	}

	.status-indicator {
		display: inline-flex;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		margin-right: 0.75rem;
		vertical-align: middle;
		position: relative;
	}

	.status-online {
		background-color: #00d4aa;
		box-shadow: 0 0 12px rgba(0, 212, 170, 0.7);
		animation: pulse 2s infinite ease-out;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.7);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 0 0 10px rgba(0, 212, 170, 0);
		}
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(0, 212, 170, 0);
		}
	}
</style>
