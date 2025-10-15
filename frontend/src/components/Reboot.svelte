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

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		color: #b8c2e0;
		font-weight: 600;
		font-size: 1rem;
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

	small {
		color: #b8c2e0;
		font-size: 0.85rem;
		opacity: 0.8;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
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

	.btn-secondary {
		background-color: #242d47;
		color: #f0f4ff;
	}

	.btn-secondary:hover {
		background-color: #4a5568;
	}

	.message {
		margin-top: 1.5rem;
		padding: 1rem;
		background-color: rgba(0, 212, 170, 0.1);
		border-left: 4px solid #00d4aa;
		border-radius: 0.5rem;
		color: #f0f4ff;
	}
</style>
