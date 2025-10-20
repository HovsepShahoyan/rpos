ye<script>
	import { onMount } from 'svelte';
	import { currentStream, currentSpeed } from '../stores/camera.js';
	import { angles, distance } from '../stores/telemetry.js';
	import { showToast } from '../stores/ui.js';
	import { setSpeed, setCurrentStream, sendControlValue } from '../utils/api.js';
	import {
		GO2RTC_BASE,
		BASE_FOV_HORIZONTAL,
		BASE_FOV_VERTICAL,
		AZIM_RIGHT,
		AZIM_LEFT,
		ELEV_UP,
		ELEV_DOWN,
		DAY_ZOOM_COEFFICIENT_GRID,
		IR_ZOOM_COEFFICIENT_GRID,
		IR_CROSSHAIR_POSITIONS
	} from '../utils/constants.js';

	let iframeUrl = '';
	let selectedSpeed = 4;

	// PTZ Click and Crosshair Variables
	let currentVideoWidth = 1920;
	let currentVideoHeight = 1080;
	let currentCameraType = 1; // 1=day, 2=ir
	let streamPositions = { 1: { x: 0.5, y: 0.5 }, 2: { x: 0.5, y: 0.5 } };
	let crosshairElements = {};
	let pollingActive = true;
	let currentActiveStream = 1;

	$: {
		// Update iframe URL when stream changes
		const streamNum = $currentStream;
		const srcName = `stream${streamNum}`;
		iframeUrl = `${GO2RTC_BASE}/webrtc.html?src=${encodeURIComponent(srcName)}`;
	}

	// Switch stream: keep mapping consistent with original JS
	// stream 1 => IR (cameraType=2) width 1350, stream 2 => Day (cameraType=1) width 1920
	function switchStream(streamNumber) {
		currentActiveStream = streamNumber;

		if (streamNumber === 1) {
			currentVideoWidth = 1350;
			currentCameraType = 2; // IR
		} else {
			currentVideoWidth = 1920;
			currentCameraType = 1; // Day
		}

		currentStream.set(streamNumber);

		// send actual camera type to backend
		setCurrentStream(currentCameraType).catch(err => {
			console.error('Failed to set current stream on backend:', err);
			showToast('Failed to set current stream', 'error');
		});

		// update overlay and coords
		updateCrosshairVisibility();
		fetchAndUpdateCoords(streamNumber);

		// update iframe source quickly
		const iframe = document.getElementById('webrtcFrame');
		if (iframe) iframe.src = iframeUrl;
	}

	function handleSetSpeed(speed) {
		selectedSpeed = speed;
		currentSpeed.set(speed);
		setSpeed(speed).catch(err => {
			console.error('Failed to set speed:', err);
			showToast('Failed to set speed', 'error');
		});
	}

	function handlePTZButton(control, value) {
		const body = `UserControls.${control}=${value}`;
		fetch('/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body
		}).catch(err => console.error('PTZ control error:', err));
	}

	function movePTZ(dir) {
		// convenience wrapper for directional buttons
		switch (dir) {
			case 'up': handlePTZButton('ptz_up', 'true'); setTimeout(()=>handlePTZButton('ptz_up','false'), 150); break;
			case 'down': handlePTZButton('ptz_down', 'true'); setTimeout(()=>handlePTZButton('ptz_down','false'), 150); break;
			case 'left': handlePTZButton('ptz_left', 'true'); setTimeout(()=>handlePTZButton('ptz_left','false'), 150); break;
			case 'right': handlePTZButton('ptz_right', 'true'); setTimeout(()=>handlePTZButton('ptz_right','false'), 150); break;
			case 'up-left': movePTZ('up'); movePTZ('left'); break;
			case 'up-right': movePTZ('up'); movePTZ('right'); break;
			case 'down-left': movePTZ('down'); movePTZ('left'); break;
			case 'down-right': movePTZ('down'); movePTZ('right'); break;
		}
	}

	function measureRange() {
		handlePTZButton('range_finder', 'true');
		setTimeout(() => handlePTZButton('range_finder', 'false'), 100);
	}

	// PTZ Click Handler
	async function handleVideoClick(event) {
		event.preventDefault();
		event.stopPropagation();

		const videoElement = event.target;
		const rect = videoElement.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

	// Account for object-fit: contain scaling and centering
		const scale = Math.min(rect.width / currentVideoWidth, rect.height / currentVideoHeight);
		const displayedWidth = currentVideoWidth * scale;
		const displayedHeight = currentVideoHeight * scale;
		const offsetLeft = (rect.width - displayedWidth) / 2;
		const offsetTop = (rect.height - displayedHeight) / 2;

		const clickX_in_video = (clickX - offsetLeft) / scale;
		const clickY_in_video = (clickY - offsetTop) / scale;

		// Clamp to video bounds
		const percentX = Math.max(0, Math.min(currentVideoWidth, clickX_in_video));
		const percentY = Math.max(0, Math.min(currentVideoHeight, clickY_in_video));

		showClickFeedback(clickX, clickY, rect);

		// Get current zoom
		let currentZoomValue = 1;
		try {
			const zoomResponse = await fetch('/api/currentZoom');
			if (zoomResponse.ok) {
				const zoomData = await zoomResponse.json();
				currentZoomValue = zoomData.zoom || currentZoomValue;
			}
		} catch (error) {
			console.error('Error getting current zoom:', error);
		}

		// Get current crosshair pixel positions
		const currentPos = streamPositions[$currentStream];
		let xCrossPos = currentPos.x * currentVideoWidth;
		let yCrossPos = currentPos.y * currentVideoHeight;

		try {
			const positionResponse = await fetch('/api/ptzPosition');
			if (!positionResponse.ok) throw new Error('ptzPosition not ok ' + positionResponse.status);
			const positionData = await positionResponse.json();
			const currentHorizontal = positionData.az;
			const currentVertical = positionData.el;

			doPTZMove(percentX, percentY, currentZoomValue, currentHorizontal, currentVertical, xCrossPos, yCrossPos, currentCameraType);
		} catch (error) {
			console.error('Error getting current PTZ position:', error);
		}

		return false;
	}

	function showClickFeedback(clickX, clickY, rect) {
		const existingFeedback = document.getElementById('click-feedback');
		if (existingFeedback) existingFeedback.remove();

		const feedback = document.createElement('div');
		feedback.id = 'click-feedback';
		feedback.style.position = 'absolute';
		feedback.style.left = (clickX - 15) + 'px';
		feedback.style.top = (clickY - 15) + 'px';
		feedback.style.width = '30px';
		feedback.style.height = '30px';
		feedback.style.border = '3px solid #00ff00';
		feedback.style.borderRadius = '50%';
		feedback.style.pointerEvents = 'none';
		feedback.style.zIndex = '10000';
		feedback.style.animation = 'clickFeedback 0.5s ease-out forwards';

		const videoContainer = document.querySelector('.video-container');
		if (videoContainer) {
			videoContainer.appendChild(feedback);
			setTimeout(() => {
				if (feedback.parentNode) {
					feedback.parentNode.removeChild(feedback);
				}
			}, 500);
		}
	}

	function calculateNewPositionEncoderCrosshair(clickX, clickY, screenWidth, screenHeight, currentHorizontal, currentVertical, zoom, xCrossPos, yCrossPos, cameraType) {
		let zoomForCalculations = 0;
		if (zoom == 1) zoomForCalculations = 1;
		if (zoom == 2) zoomForCalculations = 5;
		if (zoom == 3) zoomForCalculations = 15;
		if (zoom == 4) zoomForCalculations = 30;
		if (zoom == 5) zoomForCalculations = 60;
		if (zoom == 6) zoomForCalculations = 68;

		let isIR = cameraType === 2;
		let fovHorizontal, fovVertical, correctionCoefficientH, correctionCoefficientV;

		let cross_x = 960;
		let cross_y = 520;

		if (isIR) {
			let irZoomMap = {1:1, 2:2, 3:4, 4:8, 5:8, 6:8};
			zoomForCalculations = irZoomMap[zoom] || 1;
			fovHorizontal = (BASE_FOV_HORIZONTAL / 15) / zoomForCalculations;
			fovVertical = (BASE_FOV_VERTICAL / 15) / zoomForCalculations;
			[correctionCoefficientH, correctionCoefficientV] = IR_ZOOM_COEFFICIENT_GRID[zoomForCalculations] || [1.0, 1.0];
			let crossPos = IR_CROSSHAIR_POSITIONS[zoomForCalculations] || [960, 520];
			cross_x = crossPos[0];
			cross_y = crossPos[1];
		} else {
			fovHorizontal = BASE_FOV_HORIZONTAL / zoomForCalculations;
			fovVertical = BASE_FOV_VERTICAL / zoomForCalculations;
			[correctionCoefficientH, correctionCoefficientV] = DAY_ZOOM_COEFFICIENT_GRID[zoom] || [1.0, 1.0];
			cross_y = 520;
			cross_x = 960;
			if (zoomForCalculations == 1)   {cross_y = 557; cross_x = 959}
			else if (zoomForCalculations == 5)   cross_y = 563;
			else if (zoomForCalculations == 15)   cross_y = 564;
			else if (zoomForCalculations == 30)  cross_y = 557;
			else if (zoomForCalculations == 60)  cross_y = 535;
			else if (zoomForCalculations == 68)  cross_y = 527;
		}

		let xCrossCorrection = cross_x - xCrossPos;
		let yCrossCorrection = cross_y - yCrossPos;

		let relX = (clickX / screenWidth) - 0.5;
		let relY = 0.5 - (clickY / screenHeight);

		let angleOffsetH = (relX + xCrossCorrection / screenWidth) * fovHorizontal * correctionCoefficientH;
		let angleOffsetV = (relY + yCrossCorrection / screenHeight) * fovVertical * correctionCoefficientV;

		let newHorizontal = currentHorizontal + Math.floor(angleOffsetH * (AZIM_RIGHT / 360));
		let newVertical = currentVertical + Math.floor(angleOffsetV * (ELEV_UP / 360)); // use ELEV_UP vertically

		newHorizontal = Math.max(0, Math.min(AZIM_RIGHT, newHorizontal));
		newVertical = Math.max(0, Math.min(ELEV_UP, newVertical));

		return [newHorizontal, newVertical];
	}

	function doPTZMove(clickX, clickY, zoom, currentHorizontal, currentVertical, xCrossPos, yCrossPos, cameraType) {
		let result = calculateNewPositionEncoderCrosshair(
			clickX, clickY, currentVideoWidth, currentVideoHeight, currentHorizontal, currentVertical, zoom, xCrossPos, yCrossPos, cameraType
		);

		let newHorizontal = result[0];
		let newVertical = result[1];

		// Send PTZ command
		const body = `az=${encodeURIComponent(newHorizontal)}&el=${encodeURIComponent(newVertical)}`;
		fetch('/api/ptzMove', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body
		}).then(function(response) {
			if (response.ok) {
				console.log('PTZ move sent successfully');
			} else {
				console.error('Failed to send PTZ move command:', response.status);
			}
		}).catch(function(error) {
			console.error('Error sending PTZ move command:', error);
		});

		return [newHorizontal, newVertical];
	}

	// Crosshair Management
	function createOverlayContainer() {
		let container = document.getElementById('overlay-container');
		if (!container) {
			container = document.createElement('div');
			container.id = 'overlay-container';
			container.style.position = 'absolute';
			container.style.inset = '0px';
			container.style.pointerEvents = 'none';
			container.style.zIndex = '9999';
			container.style.background = 'transparent';
			container.style.overflow = 'visible';
			const videoWrapper = document.querySelector('.video-wrapper');
			if (videoWrapper) {
				videoWrapper.appendChild(container);
			}
		}
		return container;
	}

	function createCrosshairInContainer(streamNumber, container) {
		let id = 'crosshair-stream-' + streamNumber;
		let img = container.querySelector('#' + id);
		if (!img) {
			img = document.createElement('img');
			img.id = id;
			img.className = 'crosshair-overlay';
			img.dataset.stream = String(streamNumber);

			img.style.position = 'absolute';
			img.style.pointerEvents = 'none';
			img.style.zIndex = String(10000 + streamNumber);
			img.style.width = 'auto';
			img.style.height = 'auto';
			img.style.maxWidth = 'none';
			img.style.maxHeight = 'none';

			img.addEventListener('load', function() {
				img.dataset.naturalWidth = img.naturalWidth;
				img.dataset.naturalHeight = img.naturalHeight;
				updateCrosshairScale();
			});
			img.addEventListener('error', function(e) {
				console.warn('Crosshair failed to load for stream', streamNumber, e);
				// Fallback to SVG
				img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="2" fill="' + (streamNumber === 1 ? 'red' : 'blue') + '"/><line x1="0" y1="24" x2="48" y2="24" stroke="' + (streamNumber === 1 ? 'red' : 'blue') + '" stroke-width="1"/><line x1="24" y1="0" x2="24" y2="48" stroke="' + (streamNumber === 1 ? 'red' : 'blue') + '" stroke-width="1"/></svg>');
			});

			container.appendChild(img);
		}

		img.style.transform = 'translate(-50%, -50%)';

		let desiredSrc = window.location.origin + '/tmp/active_cross' + streamNumber + '.png';
		// always add cache buster
		img.src = desiredSrc + '?_=' + Date.now();

		applyNormalizedPositionToEl(img, streamPositions[streamNumber]);

		img.style.display = (streamNumber === $currentStream) ? 'block' : 'none';

		crosshairElements[streamNumber] = img;
		return img;
	}

	function applyNormalizedPositionToEl(el, norm) {
		if (!el || !norm) return;
		let nx = Math.max(0, Math.min(1, norm.x));
		let ny = Math.max(0, Math.min(1, norm.y));
		el.style.left = (nx * 100) + '%';
		el.style.top  = (ny * 100) + '%';
		el.style.transform = 'translate(-50%, -50%)';
	}

	function updateCrosshairScale() {
		const containerEl = document.querySelector('.video-wrapper');
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const scale = rect.width / 1920;
		const crosshairs = document.querySelectorAll('.crosshair-overlay');
		crosshairs.forEach(function(img) {
			let nw = img.dataset.naturalWidth;
			let nh = img.dataset.naturalHeight;
			if (nw && nh) {
				img.style.width = (nw * scale) + 'px';
				img.style.height = (nh * scale) + 'px';
			}
		});
	}

	function updateCrosshairPosition(streamNumber, coords) {
		if (!coords || typeof streamNumber === 'undefined') return;

		let norm = { x: 0.5, y: 0.5 };

		if (typeof coords.x === 'number' && typeof coords.y === 'number') {
			if (coords.x <= 1 && coords.y <= 1) {
				norm.x = coords.x;
				norm.y = coords.y;
			} else {
				norm.x = coords.x / 1920;
				norm.y = coords.y / 1080;
			}
		} else {
			console.warn('Coords missing numeric x/y for stream', streamNumber, coords);
			return;
		}

		norm.x = Math.max(0, Math.min(1, norm.x));
		norm.y = Math.max(0, Math.min(1, norm.y));

		streamPositions[streamNumber] = norm;

		const container = document.getElementById('overlay-container');
		if (!container) return;
		let el = container.querySelector('#crosshair-stream-' + streamNumber);
		if (!el) {
			el = createCrosshairInContainer(streamNumber, container);
		}
		applyNormalizedPositionToEl(el, norm);
	}

	function updateCrosshairVisibility() {
		Object.keys(crosshairElements).forEach(stream => {
			const img = crosshairElements[stream];
			if (img) {
				img.style.display = (parseInt(stream) === $currentStream) ? 'block' : 'none';
			}
		});
	}

	function fetchAndUpdateCoords(streamNumber) {
		if (!streamNumber) return;
		const COORD_PATHS_TRY = [
			'/tmp/overlay_coords' + streamNumber + '.json',
			'/overlay/overlay_coords' + streamNumber + '.json',
			'/overlay_coords' + streamNumber + '.json'
		];
		function tryPath(idx) {
			if (idx >= COORD_PATHS_TRY.length) {
				console.warn('No coords available for stream', streamNumber);
				return;
			}
			const path = COORD_PATHS_TRY[idx] + '?_=' + Date.now();
			fetch(path, { cache: 'no-store' })
				.then(resp => {
					if (!resp.ok) throw new Error('Status ' + resp.status);
					return resp.json();
				})
				.then(data => {
					updateCrosshairPosition(streamNumber, data);
				})
				.catch(e => {
					tryPath(idx + 1);
				});
		}
		tryPath(0);
	}

	// Polling for coords and images
	let coordIntervals = {};
	let imageIntervals = {};

	function startPolling() {
		[1, 2].forEach(stream => {
			coordIntervals[stream] = setInterval(() => {
				if (pollingActive) fetchAndUpdateCoords(stream);
			}, 500);

			const imgUrlBase = window.location.origin + '/tmp/active_cross' + stream + '.png';
			imageIntervals[stream] = setInterval(() => {
				if (pollingActive) {
					const img = crosshairElements[stream];
					if (img) {
						img.src = imgUrlBase + '?_=' + Date.now();
					}
				}
			}, 700);
		});
	}

	function stopPolling() {
		Object.values(coordIntervals).forEach(clearInterval);
		Object.values(imageIntervals).forEach(clearInterval);
		coordIntervals = {};
		imageIntervals = {};
	}

	// Zoom / image / thermal wrappers (wire UI buttons)
	function setDayZoom(dir) {
		const dayZoomValues = [1, 5, 15, 30, 60, 68];
		let currentDayZoomIndex = dayZoomValues.indexOf(parseInt(document.getElementById('dayZoomValue').textContent.replace('x', '')));
		if (currentDayZoomIndex === -1) currentDayZoomIndex = 0;
		if (dir === 'up') {
			currentDayZoomIndex = Math.min(dayZoomValues.length - 1, currentDayZoomIndex + 1);
		} else {
			currentDayZoomIndex = Math.max(0, currentDayZoomIndex - 1);
		}
		const value = dayZoomValues[currentDayZoomIndex];
		sendControlValue('UserControls', 'day_zoom', value);
		const level = currentDayZoomIndex + 1;
		fetch('/api/setZoomLevel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ level })
		}).catch(console.error);
		document.getElementById('dayZoomValue').textContent = value + 'x';
		showToast('Day Zoom set to ' + value + 'x', 'success');
	}

	function setDigitalZoom(dir) {
		const digitalZoomValues = [1, 2, 4, 8];
		let currentDigitalZoomIndex = digitalZoomValues.indexOf(parseInt(document.getElementById('nightZoomValue').textContent.replace('x', '')));
		if (currentDigitalZoomIndex === -1) currentDigitalZoomIndex = 0;
		if (dir === 'up') {
			currentDigitalZoomIndex = Math.min(digitalZoomValues.length - 1, currentDigitalZoomIndex + 1);
		} else {
			currentDigitalZoomIndex = Math.max(0, currentDigitalZoomIndex - 1);
		}
		const value = digitalZoomValues[currentDigitalZoomIndex];
		sendControlValue('UserControls', 'digital_zoom', value);
		document.getElementById('nightZoomValue').textContent = value + 'x';
		showToast('Night Zoom set to ' + value + 'x', 'success');
	}

	function setThermalMode(mode) {
		sendControlValue('UserControls', 'palette', mode === 'blackhot' ? 1 : 0);
		document.querySelectorAll('.mode-btn').forEach(function(btn) {
			var btnMode = btn.textContent.toLowerCase().replace(' hot', 'hot');
			btn.classList.toggle('active', btnMode === mode);
		});
		showToast('Thermal mode set to ' + mode, 'success');
	}

	function adjustBrightness(dir) {
		let currentBrightness = parseInt(document.getElementById('brightnessValue').textContent);
		if (dir === 'up') {
			currentBrightness = Math.min(100, currentBrightness + 10);
		} else {
			currentBrightness = Math.max(0, currentBrightness - 10);
		}
		document.getElementById('brightnessValue').textContent = currentBrightness;
		sendControlValue('UserControls', 'brightness', currentBrightness);
		showToast('Brightness set to ' + currentBrightness, 'success');
	}

	function adjustContrast(dir) {
		let currentContrast = parseInt(document.getElementById('contrastValue').textContent);
		if (dir === 'up') {
			currentContrast = Math.min(100, currentContrast + 10);
		} else {
			currentContrast = Math.max(0, currentContrast - 10);
		}
		document.getElementById('contrastValue').textContent = currentContrast;
		sendControlValue('UserControls', 'contrast', currentContrast);
		showToast('Contrast set to ' + currentContrast, 'success');
	}

	onMount(() => {
		// Initialize with stream 1
		switchStream(1);

		// Create overlays
		const container = createOverlayContainer();
		createCrosshairInContainer(1, container);
		createCrosshairInContainer(2, container);

		// Attach click handler
		const videoOverlay = document.getElementById('videoOverlay');
		if (videoOverlay) {
			videoOverlay.addEventListener('click', handleVideoClick);
		}

		// Start polling
		startPolling();

		// Handle resize
		const resizeHandler = () => updateCrosshairScale();
		window.addEventListener('resize', resizeHandler);

		// Handle visibility
		const visibilityHandler = () => {
			pollingActive = !document.hidden;
			if (!pollingActive) stopPolling();
			else startPolling();
		};
		document.addEventListener('visibilitychange', visibilityHandler);

		return () => {
			stopPolling();
			window.removeEventListener('resize', resizeHandler);
			document.removeEventListener('visibilitychange', visibilityHandler);
			if (videoOverlay) videoOverlay.removeEventListener('click', handleVideoClick);
		};
	});
</script>


<div class="page-header">
	<div class="angles-top">
		<div>angleD: <span>{$angles.azimuth_degrees || '--'}</span></div>
		<div>mestoC: <span>{$angles.elevation_degrees || '--'}</span></div>
		<div>Distance: <span>{$distance.D || '--'}</span></div>
	</div>
	<div class="stream-selector">
		<button
			class="stream-btn"
			class:active={$currentStream === 1}
			on:click={() => switchStream(1)}
		>
			Stream 1
		</button>
		<button
			class="stream-btn"
			class:active={$currentStream === 2}
			on:click={() => switchStream(2)}
		>
			Stream 2
		</button>
	</div>
	<button class="standard-button" on:click={measureRange}>
		Measure Range
	</button>
</div>

<div class="stream-interface">
	<!-- Video Container -->
	<div class="video-container">
		<div class="video-wrapper">
			<!-- overlay container sits above the iframe -->
			<div id="overlay-container" aria-hidden="true"></div>

			<iframe
				id="webrtcFrame"
				title="Live camera stream"
				src={iframeUrl}
				allow="autoplay; camera; microphone; fullscreen"
			></iframe>

			<!-- Transparent overlay to capture clicks -->
			<div id="videoOverlay"
				style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto; z-index: 1000; background: transparent; cursor: crosshair;">
			</div>

			<div class="video-overlay">
				<div class="stream-status">
					<span class="status-indicator status-online"></span>
					<span>Live Stream Active</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Controls Panel -->
	<div class="controls-panel">
		<!-- Stream mode selector -->
		<div class="control-section">
			<div class="control-label">THERMAL MODE</div>
			<div class="mode-selector">
				<button class="mode-btn active" on:click={() => setThermalMode('blackhot')}>Black Hot</button>
				<button class="mode-btn" on:click={() => setThermalMode('whitehot')}>White Hot</button>
			</div>
		</div>

		<!-- PTZ Controls -->
		<div class="control-section">
			<div class="control-label">PTZ CONTROLS</div>
			<div class="ptz-controls-fast">
				<div class="ptz-grid-fast">
					<button class="ptz-arrow-fast">↖</button>
					<button
						class="ptz-arrow-fast"
						on:mousedown={() => handlePTZButton('ptz_up', 'true')}
						on:mouseup={() => handlePTZButton('ptz_up', 'false')}
					>↑</button>
					<button class="ptz-arrow-fast">↗</button>
					<button
						class="ptz-arrow-fast"
						on:mousedown={() => handlePTZButton('ptz_left', 'true')}
						on:mouseup={() => handlePTZButton('ptz_left', 'false')}
					>←</button>
					<button
						class="ptz-center-fast"
						on:mousedown={() => handlePTZButton('ptz_middle', 'true')}
						on:mouseup={() => handlePTZButton('ptz_middle', 'false')}
					>⏺</button>
					<button
						class="ptz-arrow-fast"
						on:mousedown={() => handlePTZButton('ptz_right', 'true')}
						on:mouseup={() => handlePTZButton('ptz_right', 'false')}
					>→</button>
					<button class="ptz-arrow-fast">↙</button>
					<button
						class="ptz-arrow-fast"
						on:mousedown={() => handlePTZButton('ptz_down', 'true')}
						on:mouseup={() => handlePTZButton('ptz_down', 'false')}
					>↓</button>
					<button class="ptz-arrow-fast">↘</button>
				</div>
			</div>
		</div>

		<!-- North Connect -->
		<div class="control-section">
			<div class="control-label">NORTH</div>
			<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
				D1: <input type="number" min="0" max="59" value="1" class="form-control" style="width: 80px;" on:change={(e) => sendControlValue('UserControls', 'alphaD1', e.target.value)} />
			</div>
			<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
				D2: <input type="number" min="0" max="99" value="1" class="form-control" style="width: 80px;" on:change={(e) => sendControlValue('UserControls', 'alphaD2', e.target.value)} />
			</div>
			<button class="standard-button" on:mousedown={() => handlePTZButton('north_connect', 'true')} on:mouseup={() => handlePTZButton('north_connect', 'false')}>Connect</button>
		</div>

		<!-- Speed Controls -->
		<div class="control-section">
			<div class="control-label">SPEED</div>
			<div class="speed-controls">
				<div class="speed-row">
					{#each [1, 2, 3, 4] as speed}
						<button
							class="speed-btn"
							class:active={selectedSpeed === speed}
							on:click={() => handleSetSpeed(speed)}
						>
							{speed}
						</button>
					{/each}
				</div>
				<div class="speed-row">
					{#each [5, 6, 7, 8] as speed}
						<button
							class="speed-btn"
							class:active={selectedSpeed === speed}
							on:click={() => handleSetSpeed(speed)}
						>
							{speed}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Image adjustments -->
		<div class="control-section">
			<div class="control-label">IMAGE ADJUSTMENTS</div>
			<div class="image-controls">
				<div class="adjustment-row">
					<span>Brightness</span>
					<button class="zoom-btn" on:click={() => adjustBrightness('down')}>-</button>
					<span id="brightnessValue">50</span>
					<button class="zoom-btn" on:click={() => adjustBrightness('up')}>+</button>
				</div>
				<div class="adjustment-row">
					<span>Contrast</span>
					<button class="zoom-btn" on:click={() => adjustContrast('down')}>-</button>
					<span id="contrastValue">50</span>
					<button class="zoom-btn" on:click={() => adjustContrast('up')}>+</button>
				</div>
			</div>
		</div>

		<!-- Day Camera Zoom controls -->
		<div class="control-section">
			<div class="control-label">DAY CAMERA ZOOM</div>
			<div class="zoom-controls">
				<button class="zoom-btn" on:click={() => setDayZoom('down')}>-</button>
				<span id="dayZoomValue" class="zoom-value">1x</span>
				<button class="zoom-btn" on:click={() => setDayZoom('up')}>+</button>
			</div>
		</div>

		<!-- Night Camera Zoom controls -->
		<div class="control-section">
			<div class="control-label">NIGHT CAMERA ZOOM</div>
			<div class="zoom-controls">
				<button class="zoom-btn" on:click={() => setDigitalZoom('down')}>-</button>
				<span id="nightZoomValue" class="zoom-value">1x</span>
				<button class="zoom-btn" on:click={() => setDigitalZoom('up')}>+</button>
			</div>
		</div>

		<!-- Focus controls -->
		<div class="control-section">
			<div class="control-label">FOCUS</div>
			<div class="focus-controls">
				<button
					class="focus-btn"
					on:mousedown={() => handlePTZButton('near_focus', 'true')}
					on:mouseup={() => handlePTZButton('near_focus', 'false')}
				>
					Near -
				</button>
				<button
					class="focus-btn"
					on:mousedown={() => handlePTZButton('far_focus', 'true')}
					on:mouseup={() => handlePTZButton('far_focus', 'false')}
				>
					Far +
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.angles-top {
		display: flex;
		gap: 1rem;
		font-size: 0.9rem;
		color: #b8c2e0;
	}

	.angles-top div {
		background: #1a2036;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #3a4258;
	}

	.angles-top span {
		color: #00d4aa;
		font-weight: 700;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.stream-selector {
		display: flex;
		gap: 0.75rem;
	}

	.stream-btn {
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: 1px solid #00d4aa;
		border-radius: 0.5rem;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 120px;
	}

	.stream-btn.active {
		background: #00d4aa;
		color: #0f111a;
		font-weight: 600;
	}

	.standard-button {
		padding: 0.75rem 1.5rem;
		background-color: #00d4aa;
		color: #0f111a;
		border: none;
		border-radius: 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.standard-button:hover {
		background-color: #00f5c2;
		transform: translateY(-2px);
	}

	.stream-interface {
		display: grid;
		grid-template-columns: minmax(0, 3fr) 340px;
		gap: 1.5rem;
		height: calc(100vh - 200px);
	}

	.video-container {
		position: relative;
		background: #000;
		border-radius: 0.75rem;
		overflow: hidden;
		height: 100%;
	}

	.video-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}

	:global(#overlay-container) {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 9999;
		background: transparent;
		overflow: visible;
	}

	:global(.crosshair-overlay) {
		position: absolute;
		pointer-events: none;
		z-index: 10000;
		width: auto;
		height: auto;
		max-width: none;
		max-height: none;
		transform: translate(-50%, -50%);
	}

	:global(#videoOverlay) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: auto;
		z-index: 1000;
		background: transparent;
		cursor: crosshair;
	}

	.video-overlay {
		position: absolute;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		pointer-events: none;
		z-index: 10;
	}

	.stream-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(0, 0, 0, 0.7);
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		color: #f0f4ff;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.stream-selector {
		display: flex;
		gap: 0.75rem;
		pointer-events: auto;
	}

	.stream-btn {
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: 1px solid #00d4aa;
		border-radius: 0.5rem;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 120px;
	}

	.stream-btn.active {
		background: #00d4aa;
		color: #0f111a;
		font-weight: 600;
	}

	.controls-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background: rgba(26, 32, 54, 0.6);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 1.25rem;
		height: 100%;
		overflow-y: auto;
	}

	.control-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.control-label {
		font-size: 0.9rem;
		font-weight: 700;
		color: #00d4aa;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.ptz-controls-fast {
		display: flex;
		justify-content: center;
	}

	.ptz-grid-fast {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.6rem;
		width: 100%;
		max-width: 220px;
	}

	.ptz-arrow-fast {
		aspect-ratio: 1;
		background: #1a2036;
		border: 1px solid #3a4258;
		border-radius: 0.5rem;
		color: #f0f4ff;
		font-size: 1.3rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
	}

	.ptz-center-fast {
		background: #00d4aa;
		color: #0f111a;
		font-size: 1.6rem;
	}

	.speed-controls {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.speed-row {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.speed-btn {
		flex: 1;
		padding: 0.6rem 0.5rem;
		font-size: 0.95rem;
		background: #1a2036;
		border: 1px solid #3a4258;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
	}

	.speed-btn.active {
		background: #00d4aa;
		color: #0f111a;
		font-weight: 600;
	}

	.focus-controls {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.focus-btn {
		flex: 1;
		padding: 0.75rem;
		font-size: 0.95rem;
		background: #1a2036;
		border: 1px solid #3a4258;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
	}

	.focus-btn:hover {
		background: #00f5c2;
		color: #0f111a;
	}

	/* Thermal Mode Buttons */
	.mode-selector {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.mode-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		font-weight: 500;
		background: #1a2036;
		border: 1px solid #3a4258;
		border-radius: 0.5rem;
		color: #f0f4ff;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.mode-btn:hover {
		background: #2a3441;
		border-color: #00d4aa;
		transform: translateY(-1px);
	}

	.mode-btn.active {
		background: #00d4aa;
		color: #0f111a;
		border-color: #00d4aa;
		font-weight: 600;
		box-shadow: 0 0 10px rgba(0, 212, 170, 0.3);
	}

	/* Image Adjustments */
	.image-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.adjustment-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.adjustment-row span {
		font-size: 0.9rem;
		color: #b8c2e0;
		font-weight: 500;
		min-width: 80px;
	}

	.adjustment-row span[id] {
		font-size: 1rem;
		color: #00d4aa;
		font-weight: 700;
		text-align: center;
		min-width: 40px;
	}

	/* Zoom Controls */
	.zoom-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.zoom-value {
		font-size: 1rem;
		color: #00d4aa;
		font-weight: 700;
		min-width: 40px;
		text-align: center;
	}

	/* Shared Button Styles for Zoom and Adjustments */
	.zoom-btn {
		width: 40px;
		height: 40px;
		background: #1a2036;
		border: 1px solid #3a4258;
		border-radius: 0.5rem;
		color: #f0f4ff;
		font-size: 1.2rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.zoom-btn:hover {
		background: #2a3441;
		border-color: #00d4aa;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.zoom-btn:active {
		background: #00d4aa;
		color: #0f111a;
		transform: translateY(0);
	}

	@keyframes clickFeedback {
		0% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.8; transform: scale(1.5); }
		100% { opacity: 0; transform: scale(2); }
	}
</style>
