<script>
	import { onMount } from 'svelte';
	import { currentStream, currentSpeed } from '../stores/camera.js';
	import { angles, distance } from '../stores/telemetry.js';
	import { showToast } from '../stores/ui.js';
	import { setSpeed, setCurrentStream, sendControlValue } from '../utils/api.js';
	import { GO2RTC_BASE } from '../utils/constants.js';

	let iframeUrl = '';
	let selectedSpeed = 4;

	$: {
		// Update iframe URL when stream changes
		const streamNum = $currentStream;
		const srcName = `stream${streamNum}`;
		iframeUrl = `${GO2RTC_BASE}/webrtc.html?src=${encodeURIComponent(srcName)}`;
	}

	function switchStream(streamNumber) {
		currentStream.set(streamNumber);
		setCurrentStream(streamNumber === 1 ? 2 : 1).catch(err => {
			console.error('Failed to switch stream:', err);
			showToast('Failed to switch stream', 'error');
		});
	}

	function handleSetSpeed(speed) {
		selectedSpeed = speed;
		currentSpeed.set(speed);
		setSpeed(speed).catch(err => {
			console.error('Failed to set speed:', err);
			showToast('Failed to set speed', 'error');
		});
	}

	function handlePTZButton(control, value) {
		const body = `UserControls.${control}=${value}`;
		fetch('/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body
		}).catch(err => console.error('PTZ control error:', err));
	}

	function measureRange() {
		handlePTZButton('range_finder', 'true');
		setTimeout(() => handlePTZButton('range_finder', 'false'), 100);
	}

	onMount(() => {
		// Initialize with stream 1
		switchStream(1);
	});
</script>

<div class="page-header">
	<div class="angles-top">
		<div>angleD: <span>{$angles.azimuth_degrees || '--'}</span></div>
		<div>mestoC: <span>{$angles.elevation_degrees || '--'}</span></div>
		<div>Distance: <span>{$distance.D || '--'}</span></div>
	</div>
	<button class="standard-button" on:click={measureRange}>
		Measure Range
	</button>
</div>

<div class="stream-interface">
	<!-- Video Container -->
	<div class="video-container">
		<div class="video-wrapper">
			<iframe
				id="webrtcFrame"
				title="Live camera stream"
				src={iframeUrl}
				allow="autoplay; camera; microphone; fullscreen"
			></iframe>

			<div class="video-overlay">
				<div class="stream-status">
					<span class="status-indicator status-online"></span>
					<span>Live Stream Active</span>
				</div>
				<div class="stream-selector">
					<button
						class="stream-btn"
						class:active={$currentStream === 1}
						on:click={() => switchStream(1)}
					>
						Stream 1
					</button>
					<button
						class="stream-btn"
						class:active={$currentStream === 2}
						on:click={() => switchStream(2)}
					>
						Stream 2
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Controls Panel -->
	<div class="controls-panel">
		<!-- PTZ Controls -->
		<div class="control-section">
			<div class="control-label">PTZ CONTROLS</div>
			<div class="ptz-controls-fast">
				<div class="ptz-grid-fast">
					<button class="ptz-arrow-fast">↖</button>
					<button
						class="ptz-arrow-fast"
						on:mousedown={() => handlePTZButton('ptz_up', 'true')}
						on:mouseup={() => handlePTZButton('ptz_up', 'false')}
					>↑</button>
					<button class="ptz-arrow-fast">↗</button>
					<button
						class="ptz-arrow-fast"
						on:mousedown={() => handlePTZButton('ptz_left', 'true')}
						on:mouseup={() => handlePTZButton('ptz_left', 'false')}
					>←</button>
					<button
						class="ptz-center-fast"
						on:mousedown={() => handlePTZButton('ptz_middle', 'true')}
						on:mouseup={() => handlePTZButton('ptz_middle', 'false')}
					>⏺</button>
					<button
						class="ptz-arrow-fast"
						on:mousedown={() => handlePTZButton('ptz_right', 'true')}
						on:mouseup={() => handlePTZButton('ptz_right', 'false')}
					>→</button>
					<button class="ptz-arrow-fast">↙</button>
					<button
						class="ptz-arrow-fast"
						on:mousedown={() => handlePTZButton('ptz_down', 'true')}
						on:mouseup={() => handlePTZButton('ptz_down', 'false')}
					>↓</button>
					<button class="ptz-arrow-fast">↘</button>
				</div>
			</div>
		</div>

		<!-- Speed Controls -->
		<div class="control-section">
			<div class="control-label">SPEED</div>
			<div class="speed-controls">
				<div class="speed-row">
					{#each [1, 2, 3, 4] as speed}
						<button
							class="speed-btn"
							class:active={selectedSpeed === speed}
							on:click={() => handleSetSpeed(speed)}
						>
							{speed}
						</button>
					{/each}
				</div>
				<div class="speed-row">
					{#each [5, 6, 7, 8] as speed}
						<button
							class="speed-btn"
							class:active={selectedSpeed === speed}
							on:click={() => handleSetSpeed(speed)}
						>
							{speed}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Focus Controls -->
		<div class="control-section">
			<div class="control-label">FOCUS</div>
			<div class="focus-controls">
				<button
					class="focus-btn"
					on:mousedown={() => handlePTZButton('near_focus', 'true')}
					on:mouseup={() => handlePTZButton('near_focus', 'false')}
				>
					Near -
				</button>
				<button
					class="focus-btn"
					on:mousedown={() => handlePTZButton('far_focus', 'true')}
					on:mouseup={() => handlePTZButton('far_focus', 'false')}
				>
					Far +
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		gap: 2rem;
	}

	.angles-top {
		display: flex;
		gap: 1rem;
		font-size: 0.9rem;
		color: #b8c2e0;
	}

	.angles-top div {
		background: #1a2036;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #3a4258;
	}

	.angles-top span {
		color: #00d4aa;
		font-weight: 700;
	}

	.standard-button {
		padding: 0.75rem 1.5rem;
		background-color: #00d4aa;
		color: #0f111a;
		border: none;
		border-radius: 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.standard-button:hover {
		background-color: #00f5c2;
		transform: translateY(-2px);
	}

	.stream-interface {
		display: grid;
		grid-template-columns: minmax(0, 3fr) 340px;
		gap: 1.5rem;
		height: calc(100vh - 200px);
	}

	.video-container {
		position: relative;
		background: #000;
		border-radius: 0.75rem;
		overflow: hidden;
		height: 100%;
	}

	.video-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}

	.video-overlay {
		position: absolute;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		pointer-events: none;
		z-index: 10;
	}

	.stream-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(0, 0, 0, 0.7);
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		color: #f0f4ff;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.stream-selector {
		display: flex;
		gap: 0.75rem;
		pointer-events: auto;
	}

	.stream-btn {
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: 1px solid #00d4aa;
		border-radius: 0.5rem;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 120px;
	}

	.stream-btn.active {
		background: #00d4aa;
		color: #0f111a;
		font-weight: 600;
	}

	.controls-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background: rgba(26, 32, 54, 0.6);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 1.25rem;
		height: 100%;
		overflow-y: auto;
	}

	.control-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.control-label {
		font-size: 0.9rem;
		font-weight: 700;
		color: #00d4aa;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.ptz-controls-fast {
		display: flex;
		justify-content: center;
	}

	.ptz-grid-fast {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.6rem;
		width: 100%;
		max-width: 220px;
	}

	.ptz-arrow-fast {
		aspect-ratio: 1;
		background: #1a2036;
		border: 1px solid #3a4258;
		border-radius: 0.5rem;
		color: #f0f4ff;
		font-size: 1.3rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
	}

	.ptz-center-fast {
		background: #00d4aa;
		color: #0f111a;
		font-size: 1.6rem;
	}

	.speed-controls {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.speed-row {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.speed-btn {
		flex: 1;
		padding: 0.6rem 0.5rem;
		font-size: 0.95rem;
		background: #1a2036;
		border: 1px solid #3a4258;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
	}

	.speed-btn.active {
		background: #00d4aa;
		color: #0f111a;
		font-weight: 600;
	}

	.focus-controls {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.focus-btn {
		flex: 1;
		padding: 0.75rem;
		font-size: 0.95rem;
		background: #1a2036;
		border: 1px solid #3a4258;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
	}

	.focus-btn:hover {
		background: #00f5c2;
		color: #0f111a;
	}
</style>
