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
	/* Military Map Styling */
	.page-header {
		margin-bottom: 2rem;
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

	.map-card {
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		backdrop-filter: blur(12px);
		border: 2px solid #555555;
		border-radius: 8px;
		padding: 0;
		height: calc(100vh - 300px);
		min-height: 500px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		position: relative;
		overflow: hidden;
	}

	.map-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #15698a 0%, #1a7a9e 50%, #15698a 100%);
		box-shadow: 0 0 10px #15698a;
		z-index: 10;
	}

	.controls {
		flex-shrink: 0;
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%) !important;
		border-bottom: 2px solid #555555;
		padding: 1.5rem !important;
		display: flex !important;
		gap: 2rem !important;
		align-items: center !important;
		flex-wrap: wrap !important;
		position: relative;
	}

	.controls::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent 0%, #15698a 50%, transparent 100%);
		opacity: 0.5;
	}

	label {
		color: #cccccc !important;
		font-family: 'Courier New', monospace !important;
		text-transform: uppercase !important;
		letter-spacing: 0.5px !important;
		font-size: 0.9rem !important;
		font-weight: 600 !important;
		display: flex !important;
		align-items: center !important;
		gap: 0.5rem !important;
		cursor: pointer !important;
	}

	input[type="range"] {
		width: 200px !important;
		height: 6px !important;
		border-radius: 3px !important;
		background: linear-gradient(135deg, #555555 0%, #777777 100%) !important;
		outline: none !important;
		cursor: pointer !important;
		-webkit-appearance: none !important;
		appearance: none !important;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none !important;
		appearance: none !important;
		width: 18px !important;
		height: 18px !important;
		border-radius: 50% !important;
		background: linear-gradient(135deg, #15698a 0%, #1a7a9e 100%) !important;
		cursor: pointer !important;
		box-shadow: 0 0 8px #15698a !important;
		border: 2px solid #000000 !important;
	}

	input[type="range"]::-moz-range-thumb {
		width: 18px !important;
		height: 18px !important;
		border-radius: 50% !important;
		background: linear-gradient(135deg, #15698a 0%, #1a7a9e 100%) !important;
		cursor: pointer !important;
		box-shadow: 0 0 8px #15698a !important;
		border: 2px solid #000000 !important;
	}

	input[type="checkbox"] {
		width: 16px !important;
		height: 16px !important;
		accent-color: #15698a !important;
		cursor: pointer !important;
		border-radius: 3px !important;
	}

	span {
		color: #15698a !important;
		font-family: 'Courier New', monospace !important;
		text-transform: uppercase !important;
		letter-spacing: 0.5px !important;
		font-weight: 700 !important;
		font-size: 1rem !important;
		text-shadow: 0 0 5px #15698a !important;
		min-width: 50px !important;
		text-align: center !important;
	}

	.map-container {
		flex: 1;
		width: 100%;
		border-radius: 0 0 8px 8px;
		overflow: hidden;
		position: relative;
	}



	/* Responsive Design */
	@media (max-width: 1024px) {
		.controls {
			flex-direction: column !important;
			align-items: stretch !important;
			gap: 1rem !important;
		}

		input[type="range"] {
			width: 100% !important;
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

		.map-card {
			height: calc(100vh - 350px);
		}

		.controls {
			padding: 1rem !important;
		}
	}
</style>
