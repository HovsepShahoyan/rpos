/**
 * Video Click PTZ Handler
 * Simplified version for detecting clicks on video player and moving PTZ to clicked position
 */

const cmdClient = require("./CommandClient");
const fs = require('fs');

// Constants for video resolution and PTZ calculations
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;
const BASE_FOV_HORIZONTAL = 66.0;
const BASE_FOV_VERTICAL = 40.3;
const AZIM_RIGHT = 271000;
const AZIM_LEFT = 0;
const ELEV_UP = 262143;
const ELEV_DOWN = 0;

// Zoom correction coefficients
const DAY_ZOOM_COEFFICIENT_GRID = {
  6: [1.1,  1.05],
  5: [1.45, 1.35],
  4: [1.8,  1.7 ],
  3: [1.8,  1.65],
  2: [1.62, 1.45],
  1: [1.03, 0.9 ]
};

/**
 * Calculate new PTZ position based on click coordinates
 */
function calculateNewPositionEncoderCrosshair(clickX, clickY, screenWidth, screenHeight, currentHorizontal, currentVertical, zoom) {
  // Determine zoom calculation value
  let zoomForCalculations = 0;
  if (zoom == 1) zoomForCalculations = 1;
  if (zoom == 2) zoomForCalculations = 5;
  if (zoom == 3) zoomForCalculations = 15;
  if (zoom == 4) zoomForCalculations = 30;
  if (zoom == 5) zoomForCalculations = 60;
  if (zoom == 6) zoomForCalculations = 68;

  // Calculate field of view based on zoom
  const fovHorizontal = BASE_FOV_HORIZONTAL / zoomForCalculations;
  const fovVertical = BASE_FOV_VERTICAL / zoomForCalculations;

  // Get correction coefficients
  const [correctionCoefficientH, correctionCoefficientV] = DAY_ZOOM_COEFFICIENT_GRID[zoom] || [1.0, 1.0];

  // Get current crosshair position
  const xCrossPos = cmdClient.getEncCrctZoomAz(zoom);
  const yCrossPos = cmdClient.getEncCrctZoomEl(zoom);

  // Crosshair center positions for different zoom levels
  let cross_y = 520;
  let cross_x = 960;
  if (zoomForCalculations == 1)   {cross_y = 557; cross_x = 959}
  else if (zoomForCalculations == 5)   cross_y = 563;
  else if (zoomForCalculations == 15)   cross_y = 564;
  else if (zoomForCalculations == 30)  cross_y = 557;
  else if (zoomForCalculations == 60)  cross_y = 535;
  else if (zoomForCalculations == 68)  cross_y = 527;

  const xCrossCorrection = cross_x - xCrossPos;
  const yCrossCorrection = cross_y - yCrossPos;

  // Calculate relative position from center
  const relX = (clickX / screenWidth) - 0.5;
  const relY = (clickY / screenHeight) - 0.5;

  // Calculate angle offsets
  const angleOffsetH = (relX + xCrossCorrection / screenWidth) * fovHorizontal * correctionCoefficientH;
  const angleOffsetV = (relY + yCrossCorrection / screenHeight) * fovVertical * correctionCoefficientV;

  // Calculate new encoder positions
  let newHorizontal = currentHorizontal + Math.floor(angleOffsetH * (AZIM_RIGHT / 360));
  let newVertical = currentVertical + Math.floor(angleOffsetV * (AZIM_RIGHT / 360));

  // Clamp values to valid range
  newHorizontal = Math.max(0, Math.min(AZIM_RIGHT, newHorizontal));
  newVertical = Math.max(0, Math.min(AZIM_RIGHT, newVertical));

  return [newHorizontal, newVertical];
}

/**
 * Main PTZ move function
 */
function doPTZMove(clickX, clickY, zoom) {
  try {
    const oldHorizontalEnc = parseInt(cmdClient.getCrctEncoderAz(), 10);
    const oldVerticalEnc = parseInt(cmdClient.getCrctEncoderEl(), 10);

    const [newHorizontalEnc, newVerticalEnc] = calculateNewPositionEncoderCrosshair(
      clickX,
      clickY,
      VIDEO_WIDTH,
      VIDEO_HEIGHT,
      oldHorizontalEnc,
      oldVerticalEnc,
      zoom
    );

    cmdClient.setTargetPosition(newHorizontalEnc, newVerticalEnc, 1);
    return [newHorizontalEnc, newVerticalEnc];
  } catch (error) {
    console.error('Error in doPTZMove:', error);
    return null;
  }
}

/**
 * Handle video click event
 */
function handleVideoClick(event, videoElement) {
  try {
    // Get click coordinates relative to the video element
    const rect = videoElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Calculate coordinates as percentage of video dimensions
    const percentX = (clickX / rect.width) * VIDEO_WIDTH;
    const percentY = (clickY / rect.height) * VIDEO_HEIGHT;

    // Get current zoom level
    const currentZoom = global.currentDayZoom || 1;

    console.log(`Video clicked at: ${clickX}, ${clickY} (video coords: ${percentX.toFixed(0)}, ${percentY.toFixed(0)})`);

    // Show visual feedback
    showClickFeedback(clickX, clickY, rect);

    // Perform PTZ move
    const result = doPTZMove(percentX, percentY, currentZoom);

    if (result) {
      console.log(`PTZ moved to: ${result[0]}, ${result[1]}`);
    }

  } catch (error) {
    console.error('Error handling video click:', error);
  }
}

/**
 * Show visual feedback for click
 */
function showClickFeedback(clickX, clickY, rect) {
  // Remove any existing feedback
  const existingFeedback = document.getElementById('click-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Create feedback element
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

  // Add to video container
  const videoContainer = document.querySelector('.video-container');
  if (videoContainer) {
    videoContainer.style.position = 'relative';
    videoContainer.appendChild(feedback);

    // Remove feedback after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 500);
  }
}

/**
 * Initialize video click functionality
 */
function initVideoClickPTZ() {
  const videoElement = document.getElementById('webrtcFrame');

  if (!videoElement) {
    console.warn('Video element not found, retrying in 1 second...');
    setTimeout(initVideoClickPTZ, 1000);
    return;
  }

  console.log('Initializing video click PTZ functionality');

  // Add click event listener
  videoElement.addEventListener('click', function(event) {
    handleVideoClick(event, videoElement);
  });

  // Add CSS for click feedback animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes clickFeedback {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.5);
      }
      100% {
        opacity: 0;
        transform: scale(2);
      }
    }
  `;
  document.head.appendChild(style);

  console.log('Video click PTZ initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoClickPTZ);
} else {
  initVideoClickPTZ();
}

module.exports = {
  handleVideoClick,
  doPTZMove,
  calculateNewPositionEncoderCrosshair,
  initVideoClickPTZ
};
