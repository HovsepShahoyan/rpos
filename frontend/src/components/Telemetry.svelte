<script>
	import { telemetryData } from '../stores/telemetry.js';
</script>

<div class="page-header">
	<h1 class="page-title">Telemetry Data</h1>
	<p class="page-subtitle">Real-time sensor and position data</p>
</div>

<div class="telemetry-grid">
	<!-- Range Data -->
	<div class="card">
		<div class="card-header">
			<h3 class="card-title">Range Data</h3>
		</div>
		<div class="data-row">
			<span class="data-label">Max Range</span>
			<span class="data-value">{$telemetryData.rangeData?.maxRange || 'Loading...'}</span>
		</div>
	</div>

	<!-- Inclination Data -->
	<div class="card">
		<div class="card-header">
			<h3 class="card-title">Inclination Data</h3>
		</div>
		<div class="data-row">
			<span class="data-label">Temperature</span>
			<span class="data-value">{$telemetryData.inclinoData?.temperature || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Inclination X</span>
			<span class="data-value">{$telemetryData.inclinoData?.inclinationX || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Inclination Y</span>
			<span class="data-value">{$telemetryData.inclinoData?.inclinationY || '...'}</span>
		</div>
	</div>

	<!-- GPS Data -->
	<div class="card">
		<div class="card-header">
			<h3 class="card-title">GPS Data</h3>
		</div>
		<div class="data-row">
			<span class="data-label">Time</span>
			<span class="data-value">{$telemetryData.gpsData?.time || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Latitude</span>
			<span class="data-value">{$telemetryData.gpsData?.latitude || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Longitude</span>
			<span class="data-value">{$telemetryData.gpsData?.longitude || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Altitude</span>
			<span class="data-value">{$telemetryData.gpsData?.altitude || '...'}</span>
		</div>
	</div>

	<!-- STMD Position Data -->
	<div class="card">
		<div class="card-header">
			<h3 class="card-title">STMD Position Data</h3>
		</div>
		<div class="data-row">
			<span class="data-label">Azimuth Position (Steps)</span>
			<span class="data-value">{$telemetryData.stmdData?.currentPosAz || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Elevation Position (Steps)</span>
			<span class="data-value">{$telemetryData.stmdData?.currentPosEl || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Encoder Azimuth</span>
			<span class="data-value">{$telemetryData.stmdData?.EncoderAz || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Encoder Elevation</span>
			<span class="data-value">{$telemetryData.stmdData?.EncoderEl || '...'}</span>
		</div>
	</div>

	<!-- Movement Data -->
	<div class="card">
		<div class="card-header">
			<h3 class="card-title">Movement Data</h3>
		</div>
		<div class="data-row">
			<span class="data-label">Azimuth (Degrees)</span>
			<span class="data-value">{$telemetryData.movementData?.DegreesAz || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Encoder Azimuth</span>
			<span class="data-value">{$telemetryData.movementData?.EncoderAz || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Elevation (Degrees)</span>
			<span class="data-value">{$telemetryData.movementData?.DegreesEl || '...'}</span>
		</div>
		<div class="data-row">
			<span class="data-label">Encoder Elevation</span>
			<span class="data-value">{$telemetryData.movementData?.EncoderEl || '...'}</span>
		</div>
	</div>
</div>

<style>
	/* Military Telemetry Styling */
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
		max-width: 60ch;
		margin: 0 auto;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.telemetry-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 2rem;
	}

	.card {
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		backdrop-filter: blur(12px);
		border: 2px solid #555555;
		border-radius: 8px;
		padding: 2rem;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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

	.card:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 40px rgba(21, 105, 138, 0.2);
		border-color: #15698a;
	}

	.card-header {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #555555;
		position: relative;
	}

	.card-title {
		font-size: 1.4rem;
		font-weight: 700;
		color: #15698a;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-shadow: 0 0 10px #15698a;
	}

	.data-row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 1.25rem;
		padding: 1.5rem;
		border-radius: 6px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		border: 1px solid #555555;
		position: relative;
	}

	.data-row:hover {
		background: linear-gradient(135deg, #3d3d3d 0%, #4d4d4d 100%);
		border-color: #15698a;
		transform: translateX(3px);
		box-shadow: 0 0 15px rgba(21, 105, 138, 0.1);
	}

	.data-row:hover::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: #15698a;
		box-shadow: 0 0 10px #15698a;
	}

	.data-label {
		color: #cccccc;
		font-weight: 600;
		font-size: 1rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.data-value {
		font-family: 'Courier New', monospace;
		color: #15698a;
		font-weight: 700;
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		padding: 0.875rem 1.5rem;
		border-radius: 4px;
		min-width: 140px;
		text-align: center;
		border: 2px solid #555555;
		text-shadow: 0 0 5px #15698a;
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.data-value:hover {
		border-color: #15698a;
		box-shadow: 0 0 15px rgba(21, 105, 138, 0.3);
	}

	/* Loading state styling */
	.data-value:has-text('Loading...'),
	.data-value:has-text('...') {
		color: #ffaa00;
		text-shadow: 0 0 5px #ffaa00;
		animation: blink 1.5s infinite;
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0.6; }
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.telemetry-grid {
			grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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

		.page-subtitle {
			font-size: 1rem;
		}

		.telemetry-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.card {
			padding: 1.5rem;
		}

		.data-row {
			padding: 1rem;
			grid-template-columns: 1fr;
			gap: 0.5rem;
			text-align: center;
		}

		.data-value {
			min-width: 120px;
		}
	}
</style>
