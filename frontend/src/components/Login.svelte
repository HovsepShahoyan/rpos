<script>
	import { login } from '../stores/auth.js';
	import { showToast } from '../stores/ui.js';

	let username = '';
	let password = '';
	let isLoading = false;

	async function handleSubmit(event) {
		event.preventDefault();
		isLoading = true;

		const success = await login(username, password);

		if (!success) {
			showToast('Invalid credentials', 'error');
		}

		isLoading = false;
	}
</script>

<div class="login-container">
	<div class="login-card">
		<div class="login-header">
			<div class="logo">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
				</svg>
			</div>
			<h1>Aragats ONVIF</h1>
			<p class="subtitle">Login</p>
		</div>

		<form on:submit={handleSubmit} class="login-form">
			<div class="form-group">
				<label for="username" class="form-label">Username</label>
				<input
					type="text"
					id="username"
					bind:value={username}
					required
					autofocus
					class="form-input"
					placeholder="Enter your username"
					disabled={isLoading}
				/>
			</div>

			<div class="form-group">
				<label for="password" class="form-label">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					class="form-input"
					placeholder="Enter your password"
					disabled={isLoading}
				/>
			</div>

			<button type="submit" class="login-btn" disabled={isLoading}>
				{#if isLoading}
					<span class="spinner"></span>
					Authenticating...
				{:else}
					Access System
				{/if}
			</button>
		</form>

	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2d2d2d 75%, #1a1a1a 100%);
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	.login-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 20% 50%, rgba(0, 136, 0, 0.05) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(0, 136, 0, 0.03) 0%, transparent 50%),
			radial-gradient(circle at 40% 80%, rgba(170, 136, 0, 0.02) 0%, transparent 50%);
		pointer-events: none;
	}

	.login-card {
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 2px solid #008800;
		border-radius: 12px;
		padding: 3rem;
		width: 100%;
		max-width: 420px;
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.8),
			0 0 60px rgba(0, 136, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		position: relative;
		z-index: 1;
	}

	.login-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.logo {
		margin-bottom: 1rem;
		color: #008800;
		filter: drop-shadow(0 0 10px #008800);
	}

	.login-header h1 {
		color: #008800;
		font-size: 2.5rem;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 2px;
		margin: 0 0 0.5rem 0;
		text-shadow: 0 0 15px #008800;
	}

	.subtitle {
		color: #cccccc;
		font-size: 1rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin: 0;
		opacity: 0.8;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-label {
		color: #cccccc;
		font-weight: 600;
		font-size: 0.9rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-input {
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border: 2px solid #555555;
		border-radius: 6px;
		padding: 1rem;
		color: #ffffff;
		font-size: 1rem;
		font-family: 'Courier New', monospace;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.form-input:focus {
		outline: none;
		border-color: #008800;
		box-shadow: 0 0 20px rgba(0, 136, 0, 0.3);
		background: linear-gradient(135deg, #3d3d3d 0%, #4d4d4d 100%);
	}

	.form-input::placeholder {
		color: #888888;
		opacity: 0.7;
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.login-btn {
		background: linear-gradient(135deg, #008800 0%, #00aa00 100%);
		border: 2px solid #008800;
		border-radius: 6px;
		padding: 1rem 2rem;
		color: #000000;
		font-size: 1.1rem;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 15px rgba(0, 136, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 50px;
	}

	.login-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, #00aa00 0%, #00cc00 100%);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 136, 0, 0.5);
	}

	.login-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: 0 2px 8px rgba(0, 136, 0, 0.2);
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid #000000;
		border-top: 2px solid transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.login-footer {
		text-align: center;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #555555;
	}

	.login-footer p {
		color: #888888;
		font-size: 0.8rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0;
		opacity: 0.7;
	}

	/* Responsive Design */
	@media (max-width: 480px) {
		.login-container {
			padding: 1rem;
		}

		.login-card {
			padding: 2rem;
		}

		.login-header h1 {
			font-size: 2rem;
		}

		.form-input {
			padding: 0.875rem;
		}

		.login-btn {
			padding: 0.875rem 1.5rem;
			font-size: 1rem;
		}
	}
</style>
