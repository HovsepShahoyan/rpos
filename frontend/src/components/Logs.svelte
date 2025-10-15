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

	.logs-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.form-control {
		padding: 0.75rem 1rem;
		background-color: #242d47;
		border: 1px solid #3a4258;
		border-radius: 0.75rem;
		color: #f0f4ff;
		font-size: 1rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.btn-primary {
		background-color: #00d4aa;
		color: #0f111a;
	}

	.btn-primary:hover {
		background-color: #00f5c2;
	}

	.logs-table-wrapper {
		overflow-x: auto;
	}

	.logs-table {
		width: 100%;
		border-collapse: collapse;
	}

	.logs-table th,
	.logs-table td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid #3a4258;
	}

	.logs-table th {
		color: #00d4aa;
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.9rem;
	}

	.logs-table td {
		color: #f0f4ff;
	}

	.logs-table tr.failed {
		background-color: rgba(255, 107, 107, 0.1);
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.badge.success {
		background-color: rgba(0, 212, 170, 0.2);
		color: #00d4aa;
	}

	.badge.failed {
		background-color: rgba(255, 107, 107, 0.2);
		color: #ff6b6b;
	}

	.no-logs {
		text-align: center;
		padding: 2rem;
		color: #b8c2e0;
	}
</style>
