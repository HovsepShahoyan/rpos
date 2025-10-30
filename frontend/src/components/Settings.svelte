<script>
	import { showToast } from '../stores/ui.js';
	import { setResolution, fetchCameras } from '../utils/api.js';

	let selectedResolution = '1920x1080';
	let cameraName = '';
	let cameras = [];

	async function handleResolutionChange() {
		const [width, height] = selectedResolution.split('x').map(Number);
		try {
			await setResolution(width, height);
			showToast('Resolution updated', 'success');
		} catch (error) {
			showToast('Failed to update resolution', 'error');
		}
	}

	function saveCameraName() {
		if (!cameraName) {
			showToast('Camera name cannot be empty', 'error');
			return;
		}
		showToast('Camera name will be updated after restart', 'info');
	}

	async function loadCameras() {
		try {
			cameras = await fetchCameras();
		} catch (error) {
			showToast('Failed to load cameras', 'error');
		}
	}

	// Load cameras on component mount
	loadCameras();
</script>

<div class="page-header">
	<h1 class="page-title">Camera Settings</h1>
	<p class="page-subtitle">Configure advanced camera parameters</p>
</div>

<div class="card">
	<div class="card-header">
		<h3 class="card-title">General Settings</h3>
	</div>
	
	<div class="settings-table">
		<!-- Camera Name -->
		<div class="settings-row">
			<div class="settings-label">Camera Name</div>
			<input 
				type="text" 
				bind:value={cameraName}
				class="form-control" 
				placeholder="Enter camera name" 
			/>
			<button class="btn btn-primary" on:click={saveCameraName}>Save</button>
		</div>

		<!-- Video Resolution -->
		<div class="settings-row">
			<div class="settings-label">Video Resolution</div>
			<select 
				bind:value={selectedResolution}
				on:change={handleResolutionChange}
				class="form-control"
			>
				<option value="1920x1080">1920x1080 (Full HD)</option>
				<option value="1280x720">1280x720 (HD)</option>
			</select>
			<div></div>
		</div>

		<!-- Frame Rate -->
		<div class="settings-row">
			<div class="settings-label">Frame Rate</div>
			<input type="range" class="form-control" min="15" max="60" value="30" />
			<output>30 fps</output>
		</div>

		<!-- Bitrate -->
		<div class="settings-row">
			<div class="settings-label">Bitrate</div>
			<input type="range" class="form-control" min="1000" max="10000" value="5000" step="500" />
			<output>5000 kbps</output>
		</div>
	</div>
</div>



<div class="card">
	<div class="card-header">
		<h3 class="card-title">Camera List</h3>
	</div>

	<div class="camera-list">
		{#each cameras as camera}
			<div class="camera-item">
				<div class="camera-info">
					<strong>{camera.name}</strong> ({camera.type === 1 ? 'DAY' : 'THERMAL'})
				</div>
				<div class="camera-details">
					IP: {camera.ip_address}:{camera.port}
				</div>
			</div>
		{/each}
		{#if cameras.length === 0}
			<p class="no-cameras">No cameras configured.</p>
		{/if}
	</div>
</div>

<style>
	/* Military Settings Styling */
	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
		padding: 2rem;
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		border-radius: 12px;
		border: 2px solid #555555;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	}

	.page-title {
		font-size: 2.25rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		color: #00ff41;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 2px;
		text-shadow: 0 0 20px #00ff41;
		display: inline-block;
	}

	.page-subtitle {
		color: #cccccc;
		font-size: 1.15rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.card {
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		backdrop-filter: blur(12px);
		border: 2px solid #555555;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		position: relative;
		overflow: hidden;
	}

	.card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #00ff41 0%, #39ff77 50%, #00ff41 100%);
		box-shadow: 0 0 10px #00ff41;
	}

	.card-header {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #555555;
		position: relative;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #00ff41;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-shadow: 0 0 10px #00ff41;
	}

	.settings-table {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.settings-row {
		display: grid;
		grid-template-columns: minmax(200px, 1fr) 2fr minmax(120px, 0.5fr);
		gap: 2rem;
		padding: 2rem;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border: 2px solid #555555;
		border-radius: 8px;
		align-items: center;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	.settings-row:hover {
		border-color: #00ff41;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 255, 65, 0.2);
	}

	.settings-row:hover::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: #00ff41;
		box-shadow: 0 0 10px #00ff41;
	}

	.settings-label {
		color: #cccccc;
		font-weight: 600;
		font-size: 1.1rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-control {
		width: 100%;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		border: 2px solid #555555;
		border-radius: 6px;
		color: #ffffff;
		font-size: 1.1rem;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.form-control:focus {
		outline: none;
		border-color: #00ff41;
		box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
		background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
	}

	.form-control:hover {
		border-color: #777777;
	}

	.btn {
		padding: 1rem 2.5rem;
		border: 2px solid #555555;
		border-radius: 6px;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 120px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.btn-primary {
		background: linear-gradient(135deg, #00ff41 0%, #39ff77 100%);
		color: #000000;
		border-color: #00ff41;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, #39ff77 0%, #00ff41 100%);
		border-color: #39ff77;
		transform: translateY(-3px);
		box-shadow: 0 8px 20px rgba(0, 255, 65, 0.4);
	}

	.btn-primary:active {
		transform: translateY(-1px);
	}



	output {
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		color: #00ff41;
		font-weight: 700;
		font-size: 1.1rem;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		min-width: 90px;
		text-align: center;
		border: 2px solid #555555;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-shadow: 0 0 5px #00ff41;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	/* Range slider styling */
	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 8px;
		border-radius: 4px;
		background: linear-gradient(135deg, #555555 0%, #777777 100%);
		outline: none;
		cursor: pointer;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #00ff41 0%, #39ff77 100%);
		cursor: pointer;
		box-shadow: 0 0 10px #00ff41;
		border: 2px solid #000000;
	}

	input[type="range"]::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #00ff41 0%, #39ff77 100%);
		cursor: pointer;
		box-shadow: 0 0 10px #00ff41;
		border: 2px solid #000000;
	}

	.camera-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.camera-item {
		padding: 1rem;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border: 2px solid #555555;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	.camera-item:hover {
		border-color: #00ff41;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 255, 65, 0.2);
	}

	.camera-info {
		color: #00ff41;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-shadow: 0 0 5px #00ff41;
	}

	.camera-details {
		color: #cccccc;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.no-cameras {
		color: #cccccc;
		font-style: italic;
		text-align: center;
		padding: 2rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.settings-row {
			grid-template-columns: 1fr;
			gap: 1rem;
			text-align: center;
		}

		.settings-label {
			margin-bottom: 0.5rem;
		}

		.camera-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}

	@media (max-width: 768px) {
		.page-header {
			padding: 1.5rem;
			margin-bottom: 2rem;
		}

		.page-title {
			font-size: 1.8rem;
		}

		.card {
			padding: 1.5rem;
		}

		.settings-row {
			padding: 1.5rem;
		}

		.btn {
			padding: 0.875rem 2rem;
			font-size: 1rem;
		}

		.camera-item {
			padding: 0.75rem;
		}
	}
</style>
