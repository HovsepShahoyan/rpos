<script>
	// This component will display the legacy user controls
	// For now, it's a placeholder
</script>

<div class="page-header">
	<h1 class="page-title">Camera Controls</h1>
	<p class="page-subtitle">Advanced camera control settings</p>
</div>

<div class="card">
	<div class="card-header">
		<h3 class="card-title">User Controls</h3>
	</div>
	<p style="color: #b8c2e0; padding: 2rem;">
		Legacy controls interface - to be migrated from camera.js
	</p>
</div>

<style>
	/* Military Controls Styling */
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

	p {
		color: #cccccc !important;
		font-family: 'Courier New', monospace !important;
		text-transform: uppercase !important;
		letter-spacing: 0.5px !important;
		font-size: 1.1rem !important;
		text-align: center !important;
		padding: 3rem 2rem !important;
		margin: 0 !important;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%) !important;
		border-radius: 6px !important;
		border: 2px solid #555555 !important;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
	}

	/* Responsive Design */
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

		p {
			padding: 2rem 1.5rem !important;
			font-size: 1rem !important;
		}
	}
</style>
