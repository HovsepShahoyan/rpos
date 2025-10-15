<script>
	import { onMount } from 'svelte';

	let mapContainer;

	onMount(() => {
		// Mapbox initialization will go here
		// This is a placeholder - you'll need to add the full Mapbox GL JS integration
		console.log('Map component mounted');
	});
</script>

<div class="page-header">
	<h1 class="page-title">Map View</h1>
	<p class="page-subtitle">3D terrain visualization with Mapbox</p>
</div>

<div class="card map-card">
	<div bind:this={mapContainer} id="map" class="map-container">
		<p style="text-align: center; padding: 2rem; color: #b8c2e0;">
			Map component - Mapbox GL JS integration to be added
		</p>
	</div>
</div>

<style>
	.page-header {
		margin-bottom: 2rem;
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

	.map-card {
		background: rgba(26, 32, 54, 0.6);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 0;
		height: calc(100vh - 300px);
		min-height: 500px;
	}

	.map-container {
		width: 100%;
		height: 100%;
		border-radius: 1rem;
		overflow: hidden;
	}
</style>
