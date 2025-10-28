<script>
	import { onMount } from 'svelte';
	import { showToast } from '../stores/ui.js';
	import { fetchLoginAttempts } from '../utils/api.js';

	let logs = [];
	let searchTerm = '';
	let showFailedOnly = false;
	let limit = 100;

	async function loadLogs() {
		try {
			const data = await fetchLoginAttempts();
			logs = Array.isArray(data) ? data : (data.attempts || []);
		} catch (error) {
			console.error('Failed to load logs:', error);
			showToast('Failed to load logs', 'error');
		}
	}

	onMount(() => {
		loadLogs();
	});

	$: filteredLogs = logs
		.filter(log => {
			if (showFailedOnly && log.success) return false;
			if (searchTerm) {
				const search = searchTerm.toLowerCase();
				return (
					(log.username || '').toLowerCase().includes(search) ||
					(log.ipAddress || '').toLowerCase().includes(search)
				);
			}
			return true;
		})
		.slice(0, limit === 'all' ? logs.length : limit);
</script>

<div class="page-header">
	<h1 class="page-title">System Logs</h1>
	<p class="page-subtitle">View login attempts from the system</p>
</div>

<div class="card">
	<div class="card-header">
		<h3 class="card-title">Recent Login Attempts</h3>
	</div>

	<div class="logs-controls">
		<input 
			type="text" 
			bind:value={searchTerm}
			placeholder="Search username / ip..." 
			class="form-control"
		/>
		<label>
			<input type="checkbox" bind:checked={showFailedOnly} />
			Show failed only
		</label>
		<select bind:value={limit} class="form-control">
			<option value={50}>50 rows</option>
			<option value={100}>100 rows</option>
			<option value={250}>250 rows</option>
			<option value="all">All</option>
		</select>
		<button class="btn btn-primary" on:click={loadLogs}>Refresh</button>
	</div>

	<div class="logs-table-wrapper">
		{#if filteredLogs.length === 0}
			<p class="no-logs">No logs to show.</p>
		{:else}
			<table class="logs-table">
				<thead>
					<tr>
						<th>Time</th>
						<th>User</th>
						<th>IP</th>
						<th>Result</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredLogs as log}
						<tr class:failed={!log.success}>
							<td>{new Date(log.timestamp).toLocaleString()}</td>
							<td>{log.username || '(unknown)'}</td>
							<td>{log.ipAddress || '-'}</td>
							<td>
								<span class="badge" class:success={log.success} class:failed={!log.success}>
									{log.success ? 'SUCCESS' : 'FAILED'}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	/* Military Logs Styling */
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

	.logs-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		padding: 1.5rem;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border-radius: 8px;
		border: 2px solid #555555;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	.form-control {
		padding: 0.875rem 1.25rem;
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		border: 2px solid #555555;
		border-radius: 6px;
		color: #ffffff;
		font-size: 1rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		min-width: 200px;
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

	label {
		color: #cccccc;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	label input[type="checkbox"] {
		width: 16px;
		height: 16px;
		accent-color: #00ff41;
		cursor: pointer;
	}

	.btn {
		padding: 0.875rem 2rem;
		border: 2px solid #555555;
		border-radius: 6px;
		font-size: 1rem;
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

	.logs-table-wrapper {
		overflow-x: auto;
		border-radius: 8px;
		border: 2px solid #555555;
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	.logs-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'Courier New', monospace;
	}

	.logs-table th,
	.logs-table td {
		padding: 1.25rem;
		text-align: left;
		border-bottom: 1px solid #555555;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.logs-table th {
		color: #00ff41;
		font-weight: 700;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		text-shadow: 0 0 5px #00ff41;
		border-bottom: 2px solid #00ff41;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.logs-table td {
		color: #cccccc;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.logs-table tr:hover td {
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		color: #ffffff;
	}

	.logs-table tr.failed {
		background: linear-gradient(135deg, #331111 0%, #441111 100%);
		border-left: 4px solid #ff4444;
	}

	.logs-table tr.failed:hover td {
		background: linear-gradient(135deg, #441111 0%, #551111 100%);
	}

	.badge {
		display: inline-block;
		padding: 0.375rem 1rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		border: 2px solid transparent;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.badge.success {
		background: linear-gradient(135deg, #00ff41 0%, #39ff77 100%);
		color: #000000;
		border-color: #00ff41;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
		box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
	}

	.badge.failed {
		background: linear-gradient(135deg, #ff4444 0%, #ff6666 100%);
		color: #000000;
		border-color: #ff4444;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
		box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
	}

	.no-logs {
		text-align: center;
		padding: 3rem 2rem;
		color: #888888;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-size: 1.1rem;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border-radius: 6px;
		border: 2px solid #555555;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.logs-controls {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.form-control {
			min-width: auto;
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

		.logs-controls {
			padding: 1rem;
		}

		.logs-table th,
		.logs-table td {
			padding: 0.875rem 0.5rem;
			font-size: 0.8rem;
		}

		.badge {
			padding: 0.25rem 0.75rem;
			font-size: 0.7rem;
		}
	}
</style>
