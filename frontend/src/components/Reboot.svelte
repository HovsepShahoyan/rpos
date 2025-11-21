<script>
	import { showToast } from '../stores/ui.js';
	import { scheduleReboot } from '../utils/api.js';

	let rebootTime = '';
	let password = '';
	let scriptPath = '';
	let runAs = 'root';
	let message = '';

	async function handleScheduleReboot() {
		if (!rebootTime) {
			showToast('Please select a date and time', 'error');
			return;
		}

		if (!password) {
			showToast('Password is required', 'error');
			return;
		}

		try {
			const result = await scheduleReboot(rebootTime, password, scriptPath, runAs);
			message = result.message || 'Reboot scheduled successfully';
			showToast('Reboot scheduled', 'success');
		} catch (error) {
			console.error('Failed to schedule reboot:', error);
			showToast('Failed to schedule reboot', 'error');
		}
	}

	function clearForm() {
		rebootTime = '';
		password = '';
		scriptPath = '';
		runAs = 'root';
		message = '';
	}
</script>

<div class="page-header">
	<h1 class="page-title">Schedule Reboot</h1>
	<p class="page-subtitle">Pick a time when the server will reboot and run the post-reboot script</p>
</div>

<div class="card">
	<div class="card-header">
		<h3 class="card-title">Reboot Scheduler</h3>
	</div>

	<form on:submit|preventDefault={handleScheduleReboot}>
		<div class="form-grid">
			<div class="form-group">
				<label for="rebootTime">When (local):</label>
				<input 
					id="rebootTime"
					type="datetime-local" 
					bind:value={rebootTime}
					class="form-control" 
					required 
				/>
			</div>

			<div class="form-group">
				<label for="scriptPath">Script path (optional):</label>
				<input 
					id="scriptPath"
					type="text" 
					bind:value={scriptPath}
					class="form-control" 
					placeholder="/usr/local/sbin/schedule_reboot_and_run.sh" 
				/>
				<small>If empty, server will use the default scheduler script.</small>
			</div>

			<div class="form-group">
				<label for="runAs">Run as user:</label>
				<input 
					id="runAs"
					type="text" 
					bind:value={runAs}
					class="form-control" 
				/>
			</div>

			<div class="form-group">
				<label for="password">Sudo Password:</label>
				<input 
					id="password"
					type="password" 
					bind:value={password}
					class="form-control" 
					placeholder="Enter password" 
					required 
				/>
			</div>
		</div>

		<div class="button-group">
			<button type="button" class="btn btn-secondary" on:click={clearForm}>
				Clear
			</button>
			<button type="submit" class="btn btn-primary">
				Schedule Reboot
			</button>
		</div>

		{#if message}
			<div class="message">
				{message}
			</div>
		{/if}
	</form>
</div>

<style>
	/* Military Reboot Styling */
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
		background: linear-gradient(90deg, #ffaa00 0%, #ffcc00 50%, #ffaa00 100%);
		box-shadow: 0 0 10px #ffaa00;
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
		color: #ffaa00;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-shadow: 0 0 10px #ffaa00;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 2rem;
		margin-bottom: 2.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border-radius: 8px;
		border: 2px solid #555555;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.form-group:hover {
		border-color: #ffaa00;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(255, 170, 0, 0.2);
	}

	label {
		color: #cccccc;
		font-weight: 600;
		font-size: 1rem;
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
		border-color: #ffaa00;
		box-shadow: 0 0 20px rgba(255, 170, 0, 0.3);
		background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
	}

	.form-control:hover {
		border-color: #777777;
	}

	small {
		color: #888888;
		font-size: 0.85rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		opacity: 0.9;
	}

	.button-group {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		flex-wrap: wrap;
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
		min-width: 140px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.btn-primary {
		background: linear-gradient(135deg, #ffaa00 0%, #ffcc00 100%);
		color: #000000;
		border-color: #ffaa00;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, #ffcc00 0%, #ffaa00 100%);
		border-color: #ffcc00;
		transform: translateY(-3px);
		box-shadow: 0 8px 20px rgba(255, 170, 0, 0.4);
	}

	.btn-primary:active {
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		color: #cccccc;
		border-color: #555555;
	}

	.btn-secondary:hover {
		background: linear-gradient(135deg, #3d3d3d 0%, #4d4d4d 100%);
		border-color: #777777;
		color: #ffffff;
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
	}

	.message {
		margin-top: 2rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		border-left: 4px solid #ffaa00;
		border-radius: 8px;
		color: #ffffff;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 2px solid #555555;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		text-shadow: 0 0 5px #ffaa00;
		font-size: 1rem;
		text-align: center;
	}

	/* Warning styling for reboot functionality */
	.card-title::before {
		content: '⚠';
		margin-right: 0.5rem;
		font-size: 1.2em;
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.form-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
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

		.form-group {
			padding: 1rem;
		}

		.button-group {
			flex-direction: column;
			align-items: stretch;
		}

		.btn {
			padding: 0.875rem 2rem;
			font-size: 1rem;
		}
	}
</style>
