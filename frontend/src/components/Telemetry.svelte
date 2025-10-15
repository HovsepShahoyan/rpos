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
	.page-header {
		margin-bottom: 2.5rem;
	}

	.page-title {
		font-size: 2.25rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		color: #f0f4ff;
		background: linear-gradient(90deg, #00d4aa, #00b8ff);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		display: inline-block;
	}

	.page-subtitle {
		color: #b8c2e0;
		font-size: 1.15rem;
		max-width: 60ch;
	}

	.telemetry-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 1.75rem;
	}

	.card {
		background: rgba(26, 32, 54, 0.6);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 1.75rem;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
		border-color: rgba(0, 212, 170, 0.3);
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

	.data-row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		border-radius: 0.75rem;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		margin-bottom: 0.75rem;
		background-color: #1a2036;
	}

	.data-row:hover {
		background-color: rgba(0, 212, 170, 0.15);
		transform: translateX(5px);
	}

	.data-label {
		color: #b8c2e0;
		font-weight: 600;
		font-size: 1.05rem;
	}

	.data-value {
		font-family: 'Fira Code', 'Courier New', monospace;
		color: #00d4aa;
		font-weight: 700;
		background-color: rgba(0, 212, 170, 0.1);
		padding: 0.75rem 1.25rem;
		border-radius: 0.75rem;
		min-width: 120px;
		text-align: center;
		border: 1px solid rgba(0, 212, 170, 0.2);
	}
</style>
