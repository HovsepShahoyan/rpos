<script>
	import { showToast } from '../stores/ui.js';
	import { setResolution } from '../utils/api.js';

	let selectedResolution = '1920x1080';
	let cameraName = '';

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

<style>
	.page-header {
		margin-bottom: 2.5rem;
	}

	.page-title {
		font-size: 2.25rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		background: linear-gradient(90deg, #00d4aa, #00b8ff);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		display: inline-block;
	}

	.page-subtitle {
		color: #b8c2e0;
		font-size: 1.15rem;
	}

	.card {
		background: rgba(26, 32, 54, 0.6);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 1.75rem;
	}

	.card-header {
		margin-bottom: 1.25rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid #3a4258;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #00d4aa;
	}

	.settings-table {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.settings-row {
		display: grid;
		grid-template-columns: minmax(200px, 1fr) 2fr minmax(100px, 0.5fr);
		gap: 2rem;
		padding: 1.5rem;
		background: rgba(26, 32, 54, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1.25rem;
		align-items: center;
	}

	.settings-label {
		color: #b8c2e0;
		font-weight: 600;
		font-size: 1.05rem;
	}

	.form-control {
		width: 100%;
		padding: 0.875rem 1.25rem;
		background-color: #242d47;
		border: 1px solid #3a4258;
		border-radius: 0.875rem;
		color: #f0f4ff;
		font-size: 1.1rem;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.form-control:focus {
		outline: none;
		border-color: #00d4aa;
		box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.2);
	}

	.btn {
		padding: 0.875rem 2rem;
		border: none;
		border-radius: 0.875rem;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.btn-primary {
		background-color: #00d4aa;
		color: #0f111a;
	}

	.btn-primary:hover {
		background-color: #00f5c2;
		transform: translateY(-2px);
	}

	output {
		background-color: #242d47;
		color: #00d4aa;
		font-weight: 700;
		font-size: 1.1rem;
		padding: 0.5rem 1.25rem;
		border-radius: 0.75rem;
		min-width: 70px;
		text-align: center;
	}
</style>
