<script>
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';

	let mapContainer;
	let terrainExaggeration = 1.5;
	let enable3D = true;
	let exaggerationValue;
	let localMapInstance = null;
	let localMapInitialized = false;

	mapboxgl.accessToken = 'pk.eyJ1Ijoidmhvdmg5OSIsImEiOiJjbTltZmNvN2IwZDJ2MmxyN2F6M2w2cnR6In0.0YZJVladhWwebBmxq1KiOw';

	function initLocalMap() {
		if (localMapInitialized) return;
		localMapInitialized = true;

		const tileTemplate = window.location.origin + '/maptiles/{z}/{x}/{y}.png';
		const terrainTemplate = window.location.origin + '/terrain/{z}/{x}/{y}';

		localMapInstance = new mapboxgl.Map({
			container: mapContainer,
			style: {
				version: 8,
				sources: {
					'local-tiles': {
						type: 'raster',
						tiles: [tileTemplate],
						tileSize: 256,
						minzoom: 1,
						maxzoom: 12
					},
					'terrain-source': {
						type: 'raster-dem',
						tiles: [terrainTemplate],
						tileSize: 256,
						minzoom: 0,
						maxzoom: 12,
						encoding: 'terrarium'
					}
				},
				layers: [
					{ id: 'local-tiles-layer', type: 'raster', source: 'local-tiles' }
				]
			},
			center: [44.5, 40.2],
			zoom: 5,
			pitch: 45,
			bearing: 0,
			minZoom: 1,
			maxZoom: 12
		});

		localMapInstance.on('load', () => {
			localMapInstance.setTerrain({
				source: 'terrain-source',
				exaggeration: terrainExaggeration
			});

			localMapInstance.addLayer({
				id: 'sky',
				type: 'sky',
				paint: {
					'sky-type': 'atmosphere',
					'sky-atmosphere-sun': [0.0, 90.0],
					'sky-atmosphere-sun-intensity': 15
				}
			});
		});

		localMapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

		localMapInstance.on('error', (e) => {
			console.error('Mapbox error:', e && e.error ? e.error : e);
		});
	}

	function handleTerrainExaggeration(event) {
		terrainExaggeration = parseFloat(event.target.value);
		exaggerationValue.textContent = terrainExaggeration.toFixed(1) + 'x';
		if (localMapInstance) {
			localMapInstance.setTerrain({
				source: 'terrain-source',
				exaggeration: terrainExaggeration
			});
		}
	}

	function handleToggle3D(event) {
		enable3D = event.target.checked;
		if (localMapInstance) {
			if (enable3D) {
				localMapInstance.setTerrain({
					source: 'terrain-source',
					exaggeration: terrainExaggeration
				});
				localMapInstance.easeTo({ pitch: 45, duration: 1000 });
			} else {
				localMapInstance.setTerrain(null);
				localMapInstance.easeTo({ pitch: 0, duration: 1000 });
			}
		}
	}

	onMount(() => {
		setTimeout(initLocalMap, 50);
	});
</script>

<div class="page-header">
	<h1 class="page-title">Map View</h1>
	<p class="page-subtitle">3D terrain visualization with Mapbox</p>
</div>

<div class="card map-card">
	<div class="controls" style="padding: 10px; display: flex; gap: 15px; align-items: center; background: rgba(0,0,0,0.3);">
		<label for="terrain-exaggeration" style="color: #fff;">Terrain Exaggeration:</label>
		<input type="range" id="terrain-exaggeration" min="0" max="3" step="0.1" bind:value={terrainExaggeration} on:input={handleTerrainExaggeration} style="width: 200px;">
		<span bind:this={exaggerationValue} style="color: #fff;">{terrainExaggeration}x</span>
		<label for="enable-3d" style="color: #fff; margin-left: 20px;">
			<input type="checkbox" id="enable-3d" bind:checked={enable3D} on:change={handleToggle3D}> Enable 3D View
		</label>
	</div>
	<div bind:this={mapContainer} id="map" class="map-container"></div>
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
		display: flex;
		flex-direction: column;
	}

	.controls {
		flex-shrink: 0;
	}

	.map-container {
		flex: 1;
		width: 100%;
		border-radius: 0 0 1rem 1rem;
		overflow: hidden;
	}
</style>
