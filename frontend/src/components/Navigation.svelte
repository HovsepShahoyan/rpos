<script>
	import { currentPage } from '../stores/ui.js';
	import { logout, currentUser } from '../stores/auth.js';

	const pages = [
		{ id: 'fastlive', label: 'Fast Live' },
		{ id: 'fullscreen', label: 'Fullscreen' },
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

	function handleLogout() {
		logout();
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
				<span class="user-info">
					<span class="user-name">{$currentUser?.username || 'User'}</span>
					<button class="logout-btn" on:click={handleLogout} title="Logout">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
						</svg>
					</button>
				</span>
			</li>
			<li>
				<span class="status-indicator status-online"></span>
				<span>Online</span>
			</li>
		</ul>
	</div>
</nav>

<style>
	/* Enhanced Military Navigation Styling */
	.navbar {
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2d2d2d 75%, #1a1a1a 100%);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 3px solid #15698a;
		padding: 3rem 2rem;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10001;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.8),
			0 0 40px rgba(21, 105, 138, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		position: relative;
		overflow: hidden;
	}

	.navbar::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 20% 50%, rgba(21, 105, 138, 0.05) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(21, 105, 138, 0.03) 0%, transparent 50%),
			radial-gradient(circle at 40% 80%, rgba(170, 136, 0, 0.02) 0%, transparent 50%);
		pointer-events: none;
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
		color: #15698a;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-shadow: 0 0 10px #15698a;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.nav-brand:hover {
		transform: scale(1.02);
		text-shadow: 0 0 15px #15698a;
	}

	.nav-brand svg {
		filter: drop-shadow(0 0 5px #15698a);
	}

	.nav-menu {
		display: flex;
		list-style: none;
		gap: 1rem;
		align-items: center;
		margin: 0;
		padding: 0;
		flex: 1;
		justify-content: flex-end;
	}

	.nav-link {
		color: #cccccc;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border: 2px solid #555555;
		padding: 0.75rem 1.25rem;
		border-radius: 6px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.9rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 100px;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.nav-link:hover {
		color: #ffffff;
		border-color: #15698a;
		background: linear-gradient(135deg, #3d3d3d 0%, #4d4d4d 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(21, 105, 138, 0.3);
	}

	.nav-link.active {
		color: #ffffff;
		background: linear-gradient(135deg, #15698a 0%, #1a7a9e 100%);
		border-color: #15698a;
		font-weight: 700;
		box-shadow: 0 0 20px rgba(21, 105, 138, 0.6);
		transform: translateY(-1px);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 80%;
		height: 3px;
		background: #ffffff;
		border-radius: 2px;
		box-shadow: 0 0 10px #15698a;
	}

	.status-indicator {
		display: inline-flex;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		margin-right: 0.5rem;
		vertical-align: middle;
		position: relative;
		border: 2px solid #15698a;
	}

	.status-online {
		background-color: #15698a;
		box-shadow: 0 0 15px #15698a;
		animation: military-pulse 2s infinite ease-out;
	}

	@keyframes military-pulse {
		0% {
			transform: scale(1);
			box-shadow: 0 0 0 0 #15698a;
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			box-shadow: 0 0 0 8px rgba(21, 105, 138, 0);
			opacity: 0.8;
		}
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 #15698a;
			opacity: 1;
		}
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #cccccc;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.user-name {
		color: #15698a;
		font-weight: 600;
	}

	.logout-btn {
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border: 2px solid #555555;
		border-radius: 4px;
		padding: 0.5rem;
		color: #cccccc;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.logout-btn:hover {
		color: #ff6b6b;
		border-color: #ff6b6b;
		background: linear-gradient(135deg, #3d3d3d 0%, #4d4d4d 100%);
		transform: scale(1.05);
		box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
	}

	.logout-btn svg {
		filter: drop-shadow(0 0 3px currentColor);
	}

	@keyframes tactical-scan {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.nav-menu {
			gap: 0.5rem;
		}

		.nav-link {
			padding: 0.5rem 0.75rem;
			font-size: 0.8rem;
			min-width: 80px;
		}
	}

	@media (max-width: 768px) {
		.navbar {
			padding: 0.75rem 1rem;
		}

		.nav-brand {
			font-size: 1.2rem;
		}

		.nav-container {
			flex-direction: column;
			gap: 1rem;
		}

		.nav-menu {
			flex-wrap: wrap;
			justify-content: center;
			gap: 0.5rem;
		}

		.nav-link {
			padding: 0.5rem;
			font-size: 0.75rem;
			min-width: 70px;
		}
	}
</style>
