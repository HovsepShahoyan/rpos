<script>
	import { onMount } from 'svelte';
	import { currentStream, currentSpeed } from '../stores/camera.js';
	import { angles, distance } from '../stores/telemetry.js';
	import { showToast } from '../stores/ui.js';
	import { setSpeed, setCurrentStream, sendControlValue, setPTZDirection } from '../utils/api.js';
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
		setPTZDirection(control, value === 'true').catch(err => console.error('PTZ control error:', err));
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
		movePTZ(newHorizontal, newVertical).then(function(response) {
			console.log('PTZ move sent successfully');
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
			img.style.zIndex = String(9999 + streamNumber);
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
		sendControlValue('UserControls', 'day_zoom', value).then(() => {
			document.getElementById('dayZoomValue').textContent = value + 'x';
			showToast('Day Zoom set to ' + value + 'x', 'success');
		}).catch(err => {
			console.error('Failed to set day zoom:', err);
			showToast('Failed to set day zoom', 'error');
		});
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
		sendControlValue('UserControls', 'digital_zoom', value).then(() => {
			document.getElementById('nightZoomValue').textContent = value + 'x';
			showToast('Night Zoom set to ' + value + 'x', 'success');
		}).catch(err => {
			console.error('Failed to set night zoom:', err);
			showToast('Failed to set night zoom', 'error');
		});
	}

	function setZoomLevel(level) {
		// Placeholder for setZoomLevel if needed
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
	<div class="zoom-controls">
		<div class="zoom-section">
			<div class="control-label">DAY ZOOM</div>
			<div class="zoom-controls-inline">
				<button class="zoom-btn" on:click={() => setDayZoom('down')}>-</button>
				<span id="dayZoomValue" class="zoom-value">1x</span>
				<button class="zoom-btn" on:click={() => setDayZoom('up')}>+</button>
			</div>
		</div>
		<div class="zoom-section">
			<div class="control-label">NIGHT ZOOM</div>
			<div class="zoom-controls-inline">
				<button class="zoom-btn" on:click={() => setDigitalZoom('down')}>-</button>
				<span id="nightZoomValue" class="zoom-value">1x</span>
				<button class="zoom-btn" on:click={() => setDigitalZoom('up')}>+</button>
			</div>
		</div>
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
				style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto; z-index: 998; background: transparent; cursor: crosshair;">
			</div>

			<div class="video-overlay">
				<div class="stream-status">
					<span class="status-indicator status-online"></span>
					<span>Live Stream Active</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Military-Style CSS Variables for consistent theming */
	:root {
		--primary-bg: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		--secondary-bg: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
		--accent-color:rgb(21, 105, 138); /* Military green */
		--accent-hover:rgb(21, 105, 138);
		--warning-color: #ffaa00; /* Military amber */
		--warning-hover: #ffcc00;
		--danger-color: #ff4444; /* Military red */
		--text-primary: #ffffff;
		--text-secondary: #cccccc;
		--text-muted: #888888;
		--border-color: #555555;
		--border-hover: #777777;
		--shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		--shadow-hover: 0 12px 40px rgba(21, 105, 138, 0.15);
		--border-radius: 6px;
		--transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Global improvements */
	* {
		box-sizing: border-box;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
		flex-wrap: nowrap;
		padding: 0.75rem;
		background: var(--primary-bg);
		border-radius: var(--border-radius);
		border: 1px solid var(--border-color);
		box-shadow: var(--shadow);
		backdrop-filter: blur(20px);
		font-size: 0.9rem;
	}

	.angles-top {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
		align-items: center;
	}

	.angles-top div {
		background: var(--secondary-bg);
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--border-color);
		transition: var(--transition);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-weight: 500;
		min-width: 100px;
		justify-content: space-between;
		font-size: 0.8rem;
	}

	.angles-top div:hover {
		border-color: var(--accent-color);
		box-shadow: 0 0 20px rgba(21, 105, 138, 0.1);
	}

	.angles-top span {
		color: var(--accent-color);
		font-weight: 700;
		font-size: 1.1rem;
		text-shadow: 0 0 10px var(--accent-color);
		font-family: 'Courier New', monospace;
	}

	.stream-selector {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.stream-btn {
		background: var(--secondary-bg);
		color: var(--text-primary);
		border: 2px solid var(--border-color);
		border-radius: var(--border-radius);
		padding: 0.5rem 1rem;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: var(--transition);
		min-width: 100px;
		position: relative;
		overflow: hidden;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stream-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(21, 105, 138, 0.2), transparent);
		transition: left 0.5s;
	}

	.stream-btn:hover::before {
		left: 100%;
	}

	.stream-btn:hover {
		border-color: var(--accent-color);
		transform: translateY(-2px);
		box-shadow: var(--shadow-hover);
	}

	.stream-btn.active {
		background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
		color: #000000;
		border-color: var(--accent-color);
		font-weight: 700;
		box-shadow: 0 0 30px var(--accent-color);
		transform: translateY(-1px);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	.standard-button {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, var(--warning-color) 0%, var(--warning-hover) 100%);
		color: #000000;
		border: 2px solid var(--border-color);
		border-radius: var(--border-radius);
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
		transition: var(--transition);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		position: relative;
		overflow: hidden;
		box-shadow: 0 4px 15px var(--warning-color);
		font-family: 'Courier New', monospace;
	}

	.standard-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.standard-button:hover::before {
		left: 100%;
	}

	.standard-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 25px rgba(21, 105, 138, 0.5);
	}

	.standard-button:active {
		transform: translateY(-1px);
	}

	.stream-interface {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		height: calc(100vh - 80px);
		padding: 0 1rem;
	}

	.video-container {
		position: relative;
		background: linear-gradient(135deg, #000000 0%, #111111 100%);
		border-radius: var(--border-radius);
		overflow: hidden;
		height: 100%;
		border: 2px solid var(--border-color);
		box-shadow: var(--shadow);
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
		border-radius: var(--border-radius);
	}

	:global(#overlay-container) {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 9998;
		background: transparent;
		overflow: visible;
	}

	:global(.crosshair-overlay) {
		position: absolute;
		pointer-events: none;
		z-index: 9999;
		width: auto;
		height: auto;
		max-width: none;
		max-height: none;
		transform: translate(-50%, -50%);
		filter: drop-shadow(0 0 10px rgba(21, 105, 138, 0.5));
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
		top: 1.5rem;
		left: 1.5rem;
		right: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		pointer-events: none;
		z-index: 10;
	}

	.stream-status {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		backdrop-filter: blur(10px);
		padding: 0.75rem 1.25rem;
		border-radius: 8px;
		color: var(--accent-color);
		font-size: 0.9rem;
		font-weight: 600;
		border: 2px solid var(--border-color);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--accent-color);
		box-shadow: 0 0 15px var(--accent-color);
		animation: pulse 2s infinite;
		border: 1px solid var(--accent-color);
	}

	@keyframes pulse {
		0% { opacity: 1; }
		50% { opacity: 0.5; }
		100% { opacity: 1; }
	}

	@keyframes clickFeedback {
		0% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.8; transform: scale(1.5); }
		100% { opacity: 0; transform: scale(2); }
	}

	@keyframes header-scan {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@keyframes tactical-scan {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.zoom-controls {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.zoom-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.control-label {
		font-size: 0.7rem;
		font-weight: 800;
		color: var(--accent-color);
		text-transform: uppercase;
		letter-spacing: 1px;
		margin: 0;
		text-align: center;
	}

	.zoom-controls-inline {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.zoom-value {
		font-size: 0.85rem;
		color: var(--accent-color);
		font-weight: 700;
		min-width: 35px;
		text-align: center;
		text-shadow: 0 0 10px var(--accent-color);
		padding: 0.2rem 0.4rem;
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		border-radius: 4px;
		border: 1px solid var(--border-color);
		font-family: 'Courier New', monospace;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}

	/* Shared Button Styles for Zoom and Adjustments */
	.zoom-btn {
		width: 28px;
		height: 28px;
		background: var(--secondary-bg);
		border: 2px solid var(--border-color);
		border-radius: 4px;
		color: var(--text-primary);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: var(--transition);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.zoom-btn::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(21, 105, 138, 0.2);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width 0.3s, height 0.3s;
	}

	.zoom-btn:hover::before {
		width: 120%;
		height: 120%;
	}

	.zoom-btn:hover {
		border-color: var(--accent-color);
		transform: translateY(-1px);
		box-shadow: var(--shadow-hover);
		color: var(--accent-color);
	}
	.zoom-btn:active {
		background: var(--accent-color);
		color: #000000;
		transform: translateY(0);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	/* Responsive design */
	@media (max-width: 1200px) {
		.stream-interface {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
			height: auto;
			gap: 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.angles-top {
			justify-content: center;
			flex-wrap: wrap;
		}

		.stream-selector {
			justify-content: center;
		}
	}
</style>
