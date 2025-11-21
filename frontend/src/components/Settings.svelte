<script>
	import { showToast } from '../stores/ui.js';
	import { setResolution, fetchCameras, addCamera, deleteCamera } from '../utils/api.js';

	let selectedResolution = '1920x1080';
	let cameraName = '';
	let cameras = [];

	// New camera form variables
	let newCameraName = '';
	let newCameraIp = '';
	let newCameraPort = 554;
	let newCameraType = 1; // 1 for DAY, 2 for THERMAL

	// Edit mode variables
	let editingCamera = null;
	let editCameraName = '';
	let editCameraIp = '';
	let editCameraPort = 554;
	let editCameraType = 1;

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

	async function addNewCamera() {
		if (!newCameraName || !newCameraIp) {
			showToast('Camera name and IP address are required', 'error');
			return;
		}
		try {
			await addCamera({
				name: newCameraName,
				ip_address: newCameraIp,
				port: newCameraPort,
				type: newCameraType
			});
			showToast('Camera added successfully', 'success');
			// Reset form
			newCameraName = '';
			newCameraIp = '';
			newCameraPort = 554;
			newCameraType = 1;
			// Reload cameras
			await loadCameras();
		} catch (error) {
			showToast('Failed to add camera', 'error');
		}
	}

	function startEditCamera(camera) {
		editingCamera = camera;
		editCameraName = camera.name;
		editCameraIp = camera.ip_address;
		editCameraPort = camera.port;
		editCameraType = camera.type;
	}

	async function saveEditCamera() {
		if (!editCameraName || !editCameraIp) {
			showToast('Camera name and IP address are required', 'error');
			return;
		}
		try {
			// Note: updateCamera function was removed due to duplication. Camera update functionality may need to be re-implemented if required.
			showToast('Camera update functionality temporarily disabled', 'warning');
			editingCamera = null;
			await loadCameras();
		} catch (error) {
			showToast('Failed to update camera', 'error');
		}
	}

	function cancelEdit() {
		editingCamera = null;
	}

	async function removeCamera(cameraId) {
		if (confirm('Are you sure you want to delete this camera?')) {
			try {
				await deleteCamera(cameraId);
				showToast('Camera deleted successfully', 'success');
				await loadCameras();
			} catch (error) {
				showToast('Failed to delete camera', 'error');
			}
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
		<h3 class="card-title">Add New Camera</h3>
	</div>

	<div class="settings-table">
		<div class="settings-row">
			<div class="settings-label">Camera Name</div>
			<input
				type="text"
				bind:value={newCameraName}
				class="form-control"
				placeholder="Enter camera name"
			/>
			<div></div>
		</div>

		<div class="settings-row">
			<div class="settings-label">IP Address</div>
			<input
				type="text"
				bind:value={newCameraIp}
				class="form-control"
				placeholder="192.168.1.100"
			/>
			<div></div>
		</div>

		<div class="settings-row">
			<div class="settings-label">Port</div>
			<input
				type="number"
				bind:value={newCameraPort}
				class="form-control"
				min="1"
				max="65535"
			/>
			<div></div>
		</div>

		<div class="settings-row">
			<div class="settings-label">Type</div>
			<select
				bind:value={newCameraType}
				class="form-control"
			>
				<option value={1}>DAY</option>
				<option value={2}>THERMAL</option>
			</select>
			<button class="btn btn-primary" on:click={addNewCamera}>Add Camera</button>
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
				{#if editingCamera && editingCamera.id === camera.id}
					<div class="edit-form">
						<div class="edit-row">
							<input type="text" bind:value={editCameraName} class="form-control" placeholder="Name" />
							<input type="text" bind:value={editCameraIp} class="form-control" placeholder="IP" />
							<input type="number" bind:value={editCameraPort} class="form-control" min="1" max="65535" />
							<select bind:value={editCameraType} class="form-control">
								<option value={1}>DAY</option>
								<option value={2}>THERMAL</option>
							</select>
							<button class="btn btn-primary" on:click={saveEditCamera}>Save</button>
							<button class="btn btn-secondary" on:click={cancelEdit}>Cancel</button>
						</div>
					</div>
				{:else}
					<div class="camera-info">
						<strong>{camera.name}</strong> ({camera.type === 1 ? 'DAY' : 'THERMAL'})
					</div>
					<div class="camera-details">
						IP: {camera.ip_address}:{camera.port}
					</div>
					<div class="camera-actions">
						<button class="btn btn-edit" on:click={() => startEditCamera(camera)}>Edit</button>
						<button class="btn btn-delete" on:click={() => removeCamera(camera.id)}>Delete</button>
					</div>
				{/if}
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
		color: #15698a;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 2px;
		text-shadow: 0 0 20px #15698a;
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
		background: linear-gradient(90deg, #15698a 0%, #1a7a9e 50%, #15698a 100%);
		box-shadow: 0 0 10px #15698a;
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
		color: #15698a;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-shadow: 0 0 10px #15698a;
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
		border-color: #15698a;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(21, 105, 138, 0.2);
	}

	.settings-row:hover::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: #15698a;
		box-shadow: 0 0 10px #15698a;
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
		border-color: #15698a;
		box-shadow: 0 0 20px rgba(21, 105, 138, 0.3);
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
		background: linear-gradient(135deg, #15698a 0%, #1a7a9e 100%);
		color: #000000;
		border-color: #15698a;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, #1a7a9e 0%, #15698a 100%);
		border-color: #1a7a9e;
		transform: translateY(-3px);
		box-shadow: 0 8px 20px rgba(21, 105, 138, 0.4);
	}

	.btn-primary:active {
		transform: translateY(-1px);
	}

	.btn-edit {
		padding: 0.5rem 1rem;
		border: 2px solid #ffa500;
		border-radius: 4px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 60px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
		color: #000000;
		text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
	}

	.btn-edit:hover {
		background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%);
		border-color: #ff8c00;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 165, 0, 0.4);
	}

	.btn-delete {
		padding: 0.5rem 1rem;
		border: 2px solid #ff4444;
		border-radius: 4px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 60px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
		color: #ffffff;
		text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
	}

	.btn-delete:hover {
		background: linear-gradient(135deg, #cc0000 0%, #ff4444 100%);
		border-color: #cc0000;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
	}

	.btn-secondary {
		padding: 0.5rem 1rem;
		border: 2px solid #666666;
		border-radius: 4px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 60px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		background: linear-gradient(135deg, #666666 0%, #888888 100%);
		color: #ffffff;
		text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
	}

	.btn-secondary:hover {
		background: linear-gradient(135deg, #888888 0%, #666666 100%);
		border-color: #888888;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(136, 136, 136, 0.4);
	}



	output {
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		color: #15698a;
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
		text-shadow: 0 0 5px #15698a;
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
		background: linear-gradient(135deg, #15698a 0%, #1a7a9e 100%);
		cursor: pointer;
		box-shadow: 0 0 10px #15698a;
		border: 2px solid #000000;
	}

	input[type="range"]::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #15698a 0%, #1a7a9e 100%);
		cursor: pointer;
		box-shadow: 0 0 10px #15698a;
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
		flex-wrap: wrap;
		gap: 1rem;
	}

	.edit-form {
		width: 100%;
	}

	.edit-row {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.camera-actions {
		display: flex;
		gap: 0.5rem;
	}

	.camera-item:hover {
		border-color: #15698a;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(21, 105, 138, 0.2);
	}

	.camera-info {
		color: #15698a;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-shadow: 0 0 5px #15698a;
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
