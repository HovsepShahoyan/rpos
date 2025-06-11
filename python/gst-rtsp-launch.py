#!/usr/bin/python
# --------------------------------------------------------------------------- # 
# Supporting arguments
# --------------------------------------------------------------------------- # 
import argparse
parser = argparse.ArgumentParser(description="gst-rtsp-launch-py V0.2")
parser.add_argument('-v', '--verbose', action='store_true', help='Make script chatty')
parser.add_argument('-f', '--file', action='store', default="v4l2ctl.json", help='Video Configuration file')
parser.add_argument('-t', '--type', action='store', default="picam", help='picam, usbcam, filesrc or testsrc')
parser.add_argument('-d', '--device', action='store', default="/dev/video0", help='Video Device eg /dev/video0 or File eg /home/pi/testimage.jpg')
parser.add_argument('-P', '--rtspport', action='store', default=554, help='Set RTSP port')
parser.add_argument('-u', '--rtspname', action='store', default="live", help='Set RTSP name')
parser.add_argument('-W', '--rtspresolutionwidth', action='store', default=1280, help='Set RTSP resolution width')
parser.add_argument('-H', '--rtspresolutionheight', action='store', default=720, help='Set RTSP resolution height')
parser.add_argument('-M', '--mjpeg', action='store_true', help='Start with MJPEG codec')
args = parser.parse_args()

# Import TCP Communication
from PySide6.QtCore import QDataStream, QIODevice
from PySide6.QtWidgets import QApplication, QDialog, QVBoxLayout,QLabel, QPushButton, QLineEdit, QTextEdit, QStatusBar
from PySide6.QtNetwork import QTcpSocket, QAbstractSocket
from multiprocessing import Process

# --------------------------------------------------------------------------- # 
# configure the service logging
# --------------------------------------------------------------------------- # 
import logging
logging.basicConfig()
log = logging.getLogger()

# --------------------------------------------------------------------------- # 
# import misc standard libraries
# --------------------------------------------------------------------------- # 
import json
import time
import os.path
import subprocess
import signal
import sys
from multiprocessing import Process, set_start_method
import cv2
import numpy as np

from ctypes import *

if args.verbose:
    log.setLevel(logging.DEBUG)
else:
    log.setLevel(logging.INFO)

# --------------------------------------------------------------------------- # 
# Use gi to import GStreamer functionality
# --------------------------------------------------------------------------- # 
import gi
gi.require_version('Gst','1.0')
gi.require_version('GstRtspServer','1.0')
gi.require_version('GstVideo','1.0')
from gi.repository import GObject, Gst, Gio, GstVideo, GstRtspServer, GLib

from threading import Thread, Lock
cam_mutex = Lock()
# -------------------
def run_opencv_stream(mount_name, rtsp_url):
    ss = StreamServer("testsrc", "", "", 8554, mount_name, 1920, 1080, 0)
    ss.start_opencv_overlay_stream(mount_name, rtsp_url)
    GObject.MainLoop().run()

class StreamServer:
    def __init__(self, type, device, file, port, name, width, height, codec):
        signal.signal(signal.SIGTERM, self.exit_gracefully)
        Gst.init(None)

        self.mainloop = GObject.MainLoop()
        self.server = GstRtspServer.RTSPServer()
        self.mounts = self.server.get_mount_points()
        self.current_pipeline = None
        self.current_launch_str = None


        self.device = device
        self.type = type
        self.file = file
        
        self.port = port
        self.name = name
        
        self.factory = GstRtspServer.RTSPMediaFactory()
        # Factory must be shared to allow multiple connections
        self.factory.set_shared(True)
        self.context_id = 0
        self.running = False
        self.stayAwake = True
        
        GObject.threads_init()
        log.info("StreamServer initialized")
        
        self.codec_options = "h264"
        self.codec = codec
        
        # Declaring stream settings and initialize with safe default values
        self.bitrate_range = [200000, 20000000]
        self.bitrate = 5000000
        
        # dynamic range compression
        self.drc_options = {0:"off", 1:"low", 2:"medium", 3:"high"}
        self.drc = 3
        
        # key frame control (autmoatic = -1)
        self.h264_i_frame_period_range = [-1, 60]
        self.h264_i_frame_period = 15
        
        # Shutter speed
        #    0:                 Automatic (default)
        #    1 to 10000000:    Fixed shutter speed in microseconds
        self.shutter_range = [0, 10000001]
        self.shutter = 0
        
        # ISO level
        #    0:                Automatic (default)
        #    100 to 3200:    Fixed ISO mode
        self.iso_options = {0:"auto", 100:"ISO 100", 200:"ISO 200", 400:"ISO 400", 800:"ISO 800"}
        self.iso = 0
        
        ##################################################################################################################################################################
        # Sharpness
        #    0 to 100: Tweak sharpness filter (default=0)
        self.sharpness_range = [0, 100]
        self.sharpness = 0
        
        ##################################################################################################################################################################
        # Birghtness
        #    0 to 100: Tweak brightness (default=50)
        self.brightness_range = [0, 100]
        self.brightness = 50

        ##################################################################################################################################################################
        # Digital Zoom 
        #    0 to 100: Tweak digital zoom (default=1)
        #self.digital_zoom_range = [1, 8]
        #self.digital_zoom = 1

        ##################################################################################################################################################################
        # IP address, username, password   
        #    0 to 100: Tweak IP address, username, password
        #self.ip_address = "192.168.0.86"
        #self.username = "admin"
        #self.password = "admin"

        ##################################################################################################################################################################
        # Palette 
        #    0 to 100: Tweak palette (default=0)
        self.palette_range = [0, 14]
        self.palette = 0

        ##################################################################################################################################################################
        # Saturation
        #    0 to 100: Tweak saturation (default=0)
        #self.saturation_range = [0, 100]
        #self.saturation = 0
        
        ##################################################################################################################################################################
        # Contrast
        #    0 to 100: Tweak contrast (default=0 for video stream)
        self.contrast_range = [0, 100]
        self.contrast = 0
        
        ##################################################################################################################################################################
        # Frames per second
        #    15 to 90: >30fps only available at 640x480
        self.fps = 30
        self.fps_range = [15, 90]
        
        self.horizontal_mirroring     = False
        self.vertical_mirroring     = False
        self.video_stabilisation    = False
        
        # White balance
        #    000:            Off
        #    001:            Automatic (default)
        #    002:            sunlight
        #    003:            Cloudy
        #    004:            Shade
        #    005:            Tungsten bulp
        #    006:            Fluorescent
        #    007:            Incandescent
        #    008:            Xenon flash
        #    009:            Horizon
        self.white_balance_options = {0:"Off", 1:"auto", 2:"sunlight", 3:"cloudy", 4:"shade", 5:"tungsten", 6:"flourescent", 7:"incandescent", 8:"xenon", 9:"horizon"}
        self.white_balance = 1
        
        # RGB channels might be controlled individually, if white balance mode is "Off"
        self.gain_red_range = [0.0, 8.0]
        self.gain_red = 1.0
        self.gain_green_range = [0.0, 8.0]
        self.gain_green = 1.0
        self.gain_blue_range = [0.0, 8.0]
        self.gain_blue = 1.0
        
        self.width_options = {0:640, 1:800, 2:1024, 3:1280, 4:1640, 5:1920}
        self.width = width
        self.height_options = {0:480, 1:600, 2:720, 3:768, 4:1024, 5:1232, 6:1080}
        self.height = height
        
        self.rotation = 0
        
        self.configDate = 0

    def exit_gracefully(self, signum, frame):
        self.stop()
        self.stayAwake = False
    
    def _create_factory(self, launch_str):
        factory = GstRtspServer.RTSPMediaFactory()
        factory.set_launch(launch_str)
        factory.set_latency(0)                # no internal buffer
        factory.set_sync(False)
        factory.set_block(False)
        factory.set_drop(True)
        factory.set_shared(True)

        def on_media_configure(factory, media):
            self.current_launch_str = launch_str
            #pipeline = media.get_pipeline()
            #self.current_pipeline = pipeline

            #bus = pipeline.get_bus()
            #bus.add_signal_watch()
            #bus.connect("message", self._on_gst_message)

            log.info("[GStreamer] Bus watcher attached for stream errors.")

        factory.connect("media-configure", on_media_configure)
        return factory
    
    def start_opencv_overlay_stream(self, mount_name, rtsp_input_url, overlay_path):
        import cv2
        import numpy as np
        import os
        import json
        import threading
        import time
        from gi.repository import Gst, GstRtspServer

        log.debug(f"[DEBUG] Starting OpenCV overlay stream for mount: {mount_name}")
        log.debug(f"[DEBUG] RTSP input URL: {rtsp_input_url}")
        log.debug(f"[DEBUG] Overlay path: {overlay_path}")
        
        if mount_name == "stream":
            gst_pipeline = (
                f'rtspsrc location={rtsp_input_url} latency=0 ! '
                f'rtph264depay ! h264parse ! nvv4l2decoder ! '
                f'queue max-size-buffers=10 max-size-time=100000 leaky=downstream ! '
                f'nvvidconv ! video/x-raw, format=BGRx, width=1350, height=1080 !'
                f'appsink drop=true max-buffers=3 sync=false'
            )
        else:
            gst_pipeline = (
                f'rtspsrc location={rtsp_input_url} latency=0 ! '
                f'rtph264depay ! h264parse ! nvv4l2decoder ! '
                f'queue max-size-buffers=10 max-size-time=100000 leaky=downstream ! '
                f'nvvidconv ! video/x-raw, format=BGRx ! '
                f'appsink drop=true max-buffers=3 sync=false'
            )

        cap = cv2.VideoCapture(gst_pipeline, cv2.CAP_GSTREAMER)

        if not cap.isOpened():
            log.error(f"[ERROR] Cannot open RTSP stream: {rtsp_input_url}")
            raise Exception(f"[ERROR] Cannot open RTSP stream: {rtsp_input_url}")
        log.debug(f"[DEBUG] Successfully opened RTSP stream: {rtsp_input_url}")

        # Get video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        if mount_name == "altstream":
            width = 1920
            height = 1080
        elif mount_name == "stream":
            width = 1350
            height = 1080

        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 25  # Target FPS

        log.debug(f"[DEBUG] Camera resolution: {width}x{height}, FPS: {fps}")

        if mount_name == "stream": 
            pipeline_str = (
                f"appsrc name=source block=true is-live=true do-timestamp=true format=time "
                f"latency=0 sync=false "
                f"! video/x-raw,format=BGRx,width=1350,height=1080,framerate={fps}/1 "
                f"! videobox left=-285 right=-285 border-alpha=0 "
                f"! video/x-raw,width=1920,height=1080 "
                f"! nvvidconv ! video/x-raw(memory:NVMM),format=NV12 "
                f"! queue max-size-buffers=1 max-size-time=10000 leaky=downstream "
                f"! nvv4l2h264enc control-rate=constant-bitrate preset-level=UltraFastPreset "
                f"profile=baseline iframeinterval=25 bitrate=4096000 tune=zerolatency "
                f"insert-sps-pps=1 "
                f"! h264parse "
                f"! rtph264pay name=pay0 pt=96 config-interval=0"
            )
        else:
            pipeline_str = (
                f"appsrc name=source block=true is-live=true do-timestamp=true format=time "
                f"latency=0 sync=false "
                f"! video/x-raw,format=BGRx,width={width},height={height},framerate={fps}/1 "
                f"! queue max-size-buffers=1 max-size-time=10000 leaky=downstream "
                f"! nvvidconv ! video/x-raw(memory:NVMM),format=NV12,framerate={fps}/1 "
                f"! nvv4l2h264enc control-rate=constant-bitrate preset-level=UltraFastPreset "
                f"profile=baseline iframeinterval=25 bitrate=4096000 tune=zerolatency "
                f"insert-sps-pps=1 "
                f"! h264parse "
                f"! rtph264pay name=pay0 pt=96 config-interval=0"
            )

        log.debug(f"[DEBUG] GStreamer pipeline: {pipeline_str}")

        # Create and configure the media factory
        factory = GstRtspServer.RTSPMediaFactory()
        factory.set_launch(pipeline_str)
        factory.set_shared(True)
        log.debug(f"[DEBUG] Successfully created and configured GStreamer media factory")

        # Define paths for overlay data
        coords_path = f"/tmp/overlay_coords1.json" if mount_name == "stream" else f"/tmp/overlay_coords2.json"
        gps_path = "/tmp/overlay_coords.json"
        angles_path = "/tmp/overlay_angles.json"
        hyusis_path = "/tmp/overlay_hyusis.json"
        distance_path = "/tmp/overlay_distance.json"
        menu_path = "/tmp/menu_overlay.json"
        menu_input_path = "/tmp/menu_input.json"
        network_path = "/tmp/network.json"
        network_input_path = "/tmp/network_numpad.json"
        presets_path     = "/tmp/presets.json"
        presets_numpad_path = "/tmp/presets_numpad.json"
        log.debug(f"[DEBUG] Overlay data paths: {coords_path}, {gps_path}, {angles_path}, {hyusis_path}")

        # Initialize overlay data
        overlay_data = {
            "x": None,
            "y": None,
            "gps_x": 0.0,
            "gps_y": 0.0,
            "az_a": "0.00",
            "el_a": "0.00",
            "az_d_s": "0.00",
            "el_d_s": "0.00",
            "delta_x": 0,
            "delta_y": 0,
            "flag": 0,
            "menu_flag": 0,
            "D": 0,
            "field1Flag": 0,
            "field2Flag": 0,    
            "field1_value": "0",
            "field2_value": "0",
            "network_flag": 0, 
            "active_network_field": "ip_address",
            "ip_address": "0.0.0.0",
            "subnet_mask": "0.0.0.0",
            "gateway": "0.0.0.0",
            "DNS1": "0.0.0.0",
            "DNS2": "0.0.0.0",
            "numpad_flag": 0,
            "presets_flag":      0,
            "add_marker_flag":   0,
            "delete_marker_flag":0,
            "current_preset_index": 0,     # 0–9
            "marker_name":       "",
            "markers":           [""] * 10,
        }

        log.debug(f"[DEBUG] Initialized overlay data: {overlay_data}")

        # Preload overlay image with size adjustment for "stream"
        overlay = None
        if os.path.exists(overlay_path):
            overlay = cv2.imread(overlay_path, cv2.IMREAD_UNCHANGED)
            if overlay is not None and overlay.shape[2] == 4:
                log.debug(f"[DEBUG] Successfully preloaded overlay image: {overlay_path}")

        # File watcher thread with improved timing
        def file_watcher():
            nonlocal overlay
            last_overlay_mtime = 0
            last_menu_mtime = 0  
            last_coords_mtime = 0
            last_network_mtime = 0
            while True:
                # Check menu flag file

                # Inside file_watcher() while loop:
                try:
                    if os.path.exists(presets_path):
                        with open(presets_path, "r") as f:
                            p = json.load(f)
                        overlay_data["presets_flag"] = int(p.get("presets_flag", 0))
                        overlay_data["current_preset_index"] = int(p.get("current_preset_index", 0))
                        overlay_data["add_marker_flag"] = int(p.get("add_marker_flag", 0))
                        overlay_data["delete_marker_flag"] = int(p.get("delete_marker_flag", 0))
                        overlay_data["markers"] = p.get("markers", [""] * 10)
                        # Initialize marker_name when add_marker_flag is set
                        if overlay_data["add_marker_flag"] == 1:
                            overlay_data["marker_name"] = ""
                        log.debug(f"[DEBUG] Loaded presets.json → add_marker_flag={overlay_data['add_marker_flag']}")
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read presets: {e}")

                try:
                    if overlay_data.get("add_marker_flag", 0) == 1 and os.path.exists(presets_numpad_path):
                        with open(presets_numpad_path, "r") as f:
                            pad = json.load(f)
                        flag = int(pad.get("numpad_flag", 0))
                        digit = str(pad.get("digit", ""))
                        if flag == 1:
                            if digit == "C":
                                overlay_data["marker_name"] = ""
                            elif digit == "OK":
                                # Save marker into the current slot
                                idx = overlay_data["current_preset_index"]
                                overlay_data["markers"][idx] = overlay_data["marker_name"]
                                overlay_data["marker_name"] = ""
                                overlay_data["add_marker_flag"] = 0  # Reset the flag
                                # Persist everything back to presets.json
                                with open(presets_path, "w") as pf:
                                    json.dump({
                                        "presets_flag": overlay_data["presets_flag"],
                                        "current_preset_index": overlay_data["current_preset_index"],
                                        "add_marker_flag": overlay_data["add_marker_flag"],
                                        "delete_marker_flag": overlay_data["delete_marker_flag"],
                                        "markers": overlay_data["markers"],
                                    }, pf)
                            else:
                                # Append digit or dot
                                overlay_data["marker_name"] += digit
                            # Reset the numpad flag after processing


                            # —— Persist the updated name so next frame still sees it —— 
                            with open(presets_path, "w") as pf:
                                json.dump({
                                    "presets_flag":         overlay_data["presets_flag"],
                                    "current_preset_index": overlay_data["current_preset_index"],
                                    "add_marker_flag":      overlay_data["add_marker_flag"],
                                    "delete_marker_flag":   overlay_data["delete_marker_flag"],
                                    "markers":              overlay_data["markers"],
                                    "marker_name":          overlay_data["marker_name"]
                                }, pf, indent=2)
                            # with open(presets_numpad_path, "w") as f:
                            #     json.dump({"numpad_flag": 0, "digit": ""}, f)  # Reset the digit
                except Exception as e:
                    log.warning(f"[Overlay Watcher] presets numpad error: {e}")

                try:
                    if os.path.exists(network_path):
                        current_network_mtime = os.path.getmtime(network_path)
                        if current_network_mtime != last_network_mtime:
                            last_network_mtime = current_network_mtime
                            with open(network_path, "r") as f:
                                net_data = json.load(f)
                                overlay_data["network_flag"]        = int(net_data.get("network_flag", 0))
                                overlay_data["active_network_field"] = net_data.get("activeField", None)
                                overlay_data["ip_address"]   = str(net_data.get("ip_address", "0.0.0.0"))
                                overlay_data["subnet_mask"]  = str(net_data.get("subnet_mask", "0.0.0.0"))
                                overlay_data["gateway"]      = str(net_data.get("gateway", "0.0.0.0"))
                                overlay_data["DNS1"]         = str(net_data.get("DNS1", "0.0.0.0"))
                                overlay_data["DNS2"]         = str(net_data.get("DNS2", "0.0.0.0"))
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read network data: {e}")

                try:
                    if os.path.exists(network_input_path):
                        with open(network_input_path, "r") as f:
                            pad = json.load(f)
                            overlay_data["numpad_flag"] = int(pad.get("numpad_flag", 0))
                            pressed = pad.get("digit", "")
                            if overlay_data["numpad_flag"] == 1 and overlay_data["active_network_field"]:
                                fld = overlay_data["active_network_field"]
                                cur = overlay_data.get(fld, "")
                                if pressed == "C":
                                    overlay_data[fld] = ""
                                elif pressed == "OK":
                                    overlay_data["numpad_flag"] = 0  # Close numpad
                                    # Optionally write back to network.json here to freeze the value.
                                else:
                                    if cur == "":  # Only append if current value is empty
                                        overlay_data[fld] = str(pressed)
                                    else:
                                        overlay_data[fld] = cur + str(pressed)
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read network numpad data: {e}")

                time.sleep(0.05)

                try:
                    if os.path.exists(menu_input_path):
                        with open(menu_input_path, "r") as f:
                            input_data = json.load(f)
                            overlay_data["field1Flag"] = int(input_data.get("field1Flag", 0))
                            overlay_data["field2Flag"] = int(input_data.get("field2Flag", 0))
                            overlay_data["field1_value"] = str(input_data.get("field1_value", "0"))
                            overlay_data["field2_value"] = str(input_data.get("field2_value", "0"))
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read menu input: {e}")
                    
                try:
                    if os.path.exists(menu_path):
                        current_menu_mtime = os.path.getmtime(menu_path)
                        if current_menu_mtime != last_menu_mtime:
                            last_menu_mtime = current_menu_mtime
                            with open(menu_path, "r") as f:
                                menu_data = json.load(f)
                                overlay_data["menu_flag"] = int(menu_data.get("Flag"))
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read menu flag data: {e}")

                try:
                    # Check if the overlay file has been modified
                    if os.path.exists(overlay_path):
                        current_mtime = os.path.getmtime(overlay_path)
                        if current_mtime != last_overlay_mtime:
                            last_overlay_mtime = current_mtime
                            # Reload the overlay image
                            overlay = cv2.imread(overlay_path, cv2.IMREAD_UNCHANGED)
                            log.debug(f"[DEBUG] Reloaded overlay image: {overlay_path}")
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to reload overlay image: {e}")

                # Check crosshair coordinates
                try:
                    if os.path.exists(coords_path):
                        current_coords_mtime = os.path.getmtime(coords_path)
                        if current_coords_mtime != last_coords_mtime:
                            last_coords_mtime = current_coords_mtime
                            with open(coords_path, "r") as f:
                                coords = json.load(f)
                                x = coords.get("x")
                                y = coords.get("y")
                                if x is not None:
                                    overlay_data["x"] = int(x)
                                if y is not None:
                                    overlay_data["y"] = int(y)
                            log.debug(f"[DEBUG] Reloaded crosshair coordinates: {coords_path}")
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to reload crosshair coordinates: {e}")

                # Check other files...
                try:
                    if os.path.exists(gps_path):
                        with open(gps_path, "r") as f:
                            gps = json.load(f)
                            overlay_data["gps_x"] = float(gps.get("x", 0.0))
                            overlay_data["gps_y"] = float(gps.get("y", 0.0))
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read GPS coords: {e}")

                try:
                    if os.path.exists(angles_path):
                        with open(angles_path, "r") as f:
                            angles = json.load(f)
                            overlay_data["az_a"] = str(angles.get("azimuth_angle", "0.00"))
                            overlay_data["el_a"] = str(angles.get("elevation_angle", "0.00"))
                            overlay_data["az_d_s"] = f"{float(angles.get('azimuth_degrees', 0.0)):.2f}"
                            overlay_data["el_d_s"] = f"{float(angles.get('elevation_degrees', 0.0)):.2f}"
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read angle data: {e}")

                try:
                    if os.path.exists(distance_path):
                        with open(distance_path, "r") as f:
                            distance = json.load(f)
                            overlay_data["D"] = str(distance.get("D", "0"))
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read distance data: {e}")

                try:
                    if os.path.exists(hyusis_path):
                        with open(hyusis_path, "r") as f:
                            hyusis_data = json.load(f)
                            overlay_data["delta_x"] = hyusis_data.get("DeltaX", 0)
                            overlay_data["delta_y"] = hyusis_data.get("DeltaY", 0)
                            overlay_data["flag"] = hyusis_data.get("Flag", 0)
                except Exception as e:
                    log.warning(f"[Overlay Watcher] Failed to read Hyusis data: {e}")

                time.sleep(0.05)  # Adjusted for better performance

        watcher_thread = threading.Thread(target=file_watcher, daemon=True)
        watcher_thread.start()

        # Media configuration callback with optimizations
        def on_configure(factory, media):
            appsrc = media.get_element().get_child_by_name("source")
            frame_count = 0
            processing_times = []
            last_push_time = time.time()
            last_network_mtime = 0   #
            lock = threading.Lock()

            def push_frame(_appsrc, _):
                nonlocal frame_count, last_push_time, cap, overlay
                start_time = time.time()

                # Grab frame with improved retry logic
                retry_counter = 0
                while retry_counter < 3:  # Reduced retries for lower latency
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        break
                    retry_counter += 1
                    log.warning(f"[Overlay] Read failed (attempt {retry_counter}), reopening RTSP...")
                    cap.release()
                    cap = cv2.VideoCapture(gst_pipeline, cv2.CAP_GSTREAMER)
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    time.sleep(0.001)

                if not ret or frame is None:
                    log.error("[Overlay] Failed to grab frame after retries")
                    return

                # Calculate processing time
                processing_time = time.time() - start_time
                processing_times.append(processing_time)

                # Calculate FPS
                if len(processing_times) > 10:
                    avg_pt = sum(processing_times) / len(processing_times)
                    fps_estimate = 1 / avg_pt
                    # log.info(f"[INFO] Estimated FPS: {fps_estimate:.2f}")
                    processing_times.pop(0)

                # Apply overlay if available
                if overlay is not None:
                    h, w = frame.shape[:2]
                    
                    # Original resolution (based on mount_name)
                    if mount_name == "stream":
                        original_width = 1350
                        original_height = 1080
                    else:
                        original_width = 1920
                        original_height = 1080
                    
                    # Calculate scaling factors
                    scale_x = w / original_width
                    scale_y = h / original_height

                    # Get crosshair coordinates from overlay_data
                    x1 = overlay_data["x"] if overlay_data["x"] is not None else int(original_width // 2)
                    y1 = overlay_data["y"] if overlay_data["y"] is not None else int(original_height // 2)

                    # Scale coordinates to match the processed frame size
                    if mount_name == "stream":
                        # Scale x coordinate
                        x1_scaled = int(x1 * (1350 / 1920))
                        # Scale y coordinate
                        y1_scaled = int(y1 * (1080 / 1080))
                        x1, y1 = x1_scaled, y1_scaled
                    else:
                        x1_scaled = int(x1 * scale_x)
                        y1_scaled = int(y1 * scale_y)
                        x1, y1 = x1_scaled, y1_scaled

                    oh, ow = overlay.shape[:2]
                    x1c = max(0, x1 - ow // 2)
                    y1c = max(0, y1 - oh // 2)
                    x2 = min(w, x1c + ow)
                    y2 = min(h, y1c + oh)

                    if x2 > x1c and y2 > y1c:
                        crop = overlay[0:(y2 - y1c), 0:(x2 - x1c)]
                        alpha = crop[:, :, 3] / 255.0
                        for c in range(3):
                            frame[y1c:y2, x1c:x2, c] = (
                                alpha * crop[:, :, c] +
                                (1 - alpha) * frame[y1c:y2, x1c:x2, c]
                            )

                # ... rest of the code remains the same ...
                # Draw text overlays with improved efficiency

                h, w = frame.shape[:2]

                # 1. Camera Coordinates (X and Y) - Yellow, Top-Right
                camera_coords_label = "Camera Coordinates"
                cv2.putText(frame, camera_coords_label, (w - 550, h - 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (64, 224, 208), 3, cv2.LINE_AA)
                cv2.putText(frame, camera_coords_label, (w - 550, h - 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 128, 0), 2, cv2.LINE_AA)
                coords_label = f"X: {overlay_data['gps_x']}, Y: {overlay_data['gps_y']}"
                cv2.putText(frame, coords_label, (w - 550, h - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (64, 224, 208), 3, cv2.LINE_AA)
                cv2.putText(frame, coords_label, (w - 550, h - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 128, 0), 2, cv2.LINE_AA)

                # 2. Target Label - Red, Top-Left
                target_label = "Target"
                cv2.putText(frame, target_label, (30, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (64, 224, 208), 3, cv2.LINE_AA)
                cv2.putText(frame, target_label, (30, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (102, 153, 153), 2, cv2.LINE_AA)

                # 3. Delta X - Blue, Below Target
                delta_x_label = f"X: {overlay_data['delta_x']}"
                cv2.putText(frame, delta_x_label, (30, 100),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 3, cv2.LINE_AA)
                cv2.putText(frame, delta_x_label, (30, 100),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (102, 153, 153), 2, cv2.LINE_AA)

                # 4. Delta Y - Blue, Below Delta X
                delta_y_label = f"Y: {overlay_data['delta_y']}"
                cv2.putText(frame, delta_y_label, (30, 150),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (64, 224, 208), 3, cv2.LINE_AA)
                cv2.putText(frame, delta_y_label, (30, 150),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (102, 153, 153), 2, cv2.LINE_AA)

                # 5. Distance - Blue, Top-Left
                distance_label = f"Distance: {overlay_data['D']}"
                cv2.putText(frame, distance_label, (30, 200),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (64, 224, 208), 3, cv2.LINE_AA)
                cv2.putText(frame, distance_label, (30, 200),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (102, 153, 153), 2, cv2.LINE_AA)

                # 6. Azimuth and Elevation (Az and El) - Green, Top-Middle
                angle_label = f"AngleD: {overlay_data['az_a']} ({overlay_data['az_d_s']}°)   MestoC: {overlay_data['el_a']} ({overlay_data['el_d_s']}°)"
                cv2.putText(frame, angle_label, (w//2 - 200, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (64, 224, 208), 3, cv2.LINE_AA)
                cv2.putText(frame, angle_label, (w//2 - 200, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (102, 153, 153), 2, cv2.LINE_AA)
                

                ################## BUTTONS (Green Theme) ###########################

                # Define dark‐green palette
                DARK_GREEN        = (128, 128, 0)
                MEDIUM_GREEN      = (208, 224, 64)
                WHITE             = (255, 255, 255)
                BLACK             = (0, 0, 0)

                h, w = frame.shape[:2]

                # 1. Camera Coordinates (X and Y) - keep original yellow/black outline
                camera_coords_label = "Camera Coordinates"
                cv2.putText(frame, camera_coords_label, (w - 550, h - 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, BLACK, 3, cv2.LINE_AA)
                cv2.putText(frame, camera_coords_label, (w - 550, h - 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_GREEN, 2, cv2.LINE_AA)
                coords_label = f"X: {overlay_data['gps_x']}, Y: {overlay_data['gps_y']}"
                cv2.putText(frame, coords_label, (w - 550, h - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, BLACK, 3, cv2.LINE_AA)
                cv2.putText(frame, coords_label, (w - 550, h - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_GREEN, 2, cv2.LINE_AA)

                # 2. Target Label - Red outline, unchanged
                target_label = "Target"
                cv2.putText(frame, target_label, (30, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, BLACK, 3, cv2.LINE_AA)
                cv2.putText(frame, target_label, (30, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_GREEN, 2, cv2.LINE_AA)

                # 3. Delta X, Delta Y, Distance, Azimuth/Elevation - keep original colors
                delta_x_label = f"X: {overlay_data['delta_x']}"
                cv2.putText(frame, delta_x_label, (30, 100),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, BLACK, 3, cv2.LINE_AA)
                cv2.putText(frame, delta_x_label, (30, 100),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_GREEN, 2, cv2.LINE_AA)

                delta_y_label = f"Y: {overlay_data['delta_y']}"
                cv2.putText(frame, delta_y_label, (30, 150),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, BLACK, 3, cv2.LINE_AA)
                cv2.putText(frame, delta_y_label, (30, 150),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_GREEN, 2, cv2.LINE_AA)

                distance_label = f"Distance: {overlay_data['D']}"
                cv2.putText(frame, distance_label, (30, 200),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, BLACK, 3, cv2.LINE_AA)
                cv2.putText(frame, distance_label, (30, 200),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_GREEN, 2, cv2.LINE_AA)

                angle_label = (
                    f"AngleD: {overlay_data['az_a']} ({overlay_data['az_d_s']}°)   "
                    f"MestoC: {overlay_data['el_a']} ({overlay_data['el_d_s']}°)"
                )
                cv2.putText(frame, angle_label, (w // 2 - 200, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, BLACK, 3, cv2.LINE_AA)
                cv2.putText(frame, angle_label, (w // 2 - 200, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, DARK_GREEN, 2, cv2.LINE_AA)

                # Dark‐turquoise in BGR:
                DARK_TURQUOISE   = (128, 128, 0)   # RGB (0, 128, 128) → BGR (128, 128, 0)
                MEDIUM_TURQUOISE = (208, 224, 64)  # RGB (64, 224, 208) → BGR (208, 224, 64)
                WHITE            = (255, 255, 255)

                h, w = frame.shape[:2]

                rect_width = 80
                rect_height = 40
                bottom_offset = 20
                horizontal_spacing = 100

                # Shift entire button group 400px to the left
                button1_top_left_x = (w - rect_width) // 2 - 400
                button1_top_left_y = h - rect_height - bottom_offset

                # BUTTON 1
                cv2.rectangle(frame,
                              (button1_top_left_x, button1_top_left_y),
                              (button1_top_left_x + rect_width, button1_top_left_y + rect_height),
                              DARK_TURQUOISE, thickness=-1)
                cv2.rectangle(frame,
                              (button1_top_left_x, button1_top_left_y),
                              (button1_top_left_x + rect_width, button1_top_left_y + rect_height),
                              MEDIUM_TURQUOISE, thickness=2)

                # BUTTON 2 (to the right of Button 1)
                button2_top_left_x = button1_top_left_x + rect_width + horizontal_spacing
                button2_top_left_y = button1_top_left_y
                cv2.rectangle(frame,
                              (button2_top_left_x, button2_top_left_y),
                              (button2_top_left_x + rect_width, button2_top_left_y + rect_height),
                              DARK_TURQUOISE, thickness=-1)
                cv2.rectangle(frame,
                              (button2_top_left_x, button2_top_left_y),
                              (button2_top_left_x + rect_width, button2_top_left_y + rect_height),
                              MEDIUM_TURQUOISE, thickness=2)

                # BUTTON 3 (NetCfg) further to the right
                button3_w = rect_width + 40
                button3_h = rect_height
                button3_x = button2_top_left_x + rect_width + horizontal_spacing
                button3_y = button1_top_left_y
                cv2.rectangle(frame,
                              (button3_x, button3_y),
                              (button3_x + button3_w, button3_y + button3_h),
                              DARK_TURQUOISE, thickness=-1)
                cv2.rectangle(frame,
                              (button3_x, button3_y),
                              (button3_x + button3_w, button3_y + button3_h),
                              MEDIUM_TURQUOISE, thickness=2)
                text = "NetCfg"
                (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                tx = button3_x + (button3_w - tw) // 2
                ty = button3_y + (button3_h + th) // 2
                cv2.putText(frame, text, (tx, ty),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, WHITE, 2, cv2.LINE_AA)
                
                # BUTTON  4 PRESET
                
                button4_w, button4_h = rect_width + 60, rect_height
                button4_x = button3_x + button3_w + horizontal_spacing
                button4_y = button1_top_left_y
                cv2.rectangle(frame,
                            (button4_x, button4_y),
                            (button4_x + button4_w, button4_y + button4_h),
                            DARK_TURQUOISE, thickness=-1)
                cv2.rectangle(frame,
                            (button4_x, button4_y),
                            (button4_x + button4_w, button4_y + button4_h),
                            MEDIUM_TURQUOISE, thickness=2)
                text = "Presets"
                (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                tx = button4_x + (button4_w - tw) // 2
                ty = button4_y + (button4_h + th) // 2
                cv2.putText(frame, text, (tx, ty),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, WHITE, 2, cv2.LINE_AA)
                

                if overlay_data.get("presets_flag", 0) == 1:
                    # Panel dimensions & position
                    panel_w, panel_h = 350, 550  # increased height to fit 10 entries
                    panel_x = w - panel_w - 10
                    panel_y = 80  # move panel slightly up so it’s centered
                    # Background & border
                    cv2.rectangle(frame,
                                (panel_x, panel_y),
                                (panel_x + panel_w, panel_y + panel_h),
                                DARK_GREEN, thickness=-1)
                    cv2.rectangle(frame,
                                (panel_x, panel_y),
                                (panel_x + panel_w, panel_y + panel_h),
                                MEDIUM_GREEN, thickness=2)
                    # “Add Marker” button
                    btn_h = 50
                    add_btn_y = panel_y + 20
                    cv2.rectangle(frame,
                                (panel_x + 10, add_btn_y),
                                (panel_x + panel_w - 10, add_btn_y + btn_h),
                                MEDIUM_GREEN, thickness=-1)
                    cv2.putText(frame, "Add Marker",
                                (panel_x + 20, add_btn_y + btn_h // 2 + 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, BLACK, 2, cv2.LINE_AA)
                    # “Delete Marker” button
                    del_btn_y = add_btn_y + btn_h + 10
                    cv2.rectangle(frame,
                                (panel_x + 10, del_btn_y),
                                (panel_x + panel_w - 10, del_btn_y + btn_h),
                                MEDIUM_GREEN, thickness=-1)
                    cv2.putText(frame, "Delete Marker",
                                (panel_x + 20, del_btn_y + btn_h // 2 + 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, BLACK, 2, cv2.LINE_AA)
                    # List of 10 markers
                    slot_h = 30
                    slots_start_y = del_btn_y + btn_h + 30  # extra padding so list sits well below buttons
                    for i in range(10):
                        y = slots_start_y + i * (slot_h + 8)
                        name = overlay_data["markers"][i] # or f"<empty {i + 1}>"
                        color = MEDIUM_GREEN if i == overlay_data["current_preset_index"] else WHITE
                        cv2.putText(frame,
                                    f"{i + 1}. {name}",
                                    (panel_x + 20, y),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)

                # ── Delete logic ────────────────────────────────────────────────────────
                if overlay_data.get("delete_marker_flag", 0) == 1:
                    idx = overlay_data["current_preset_index"]
                    overlay_data["markers"][idx] = ""
                    overlay_data["delete_marker_flag"] = 0  # Reset the flag
                    # persist
                    with open(presets_path, "w") as f:
                        json.dump({
                            "presets_flag": overlay_data["presets_flag"],
                            "current_preset_index": overlay_data["current_preset_index"],
                            "add_marker_flag": overlay_data["add_marker_flag"],
                            "delete_marker_flag": overlay_data["delete_marker_flag"],
                            "markers": overlay_data["markers"],
                        }, f)
                # ── On-screen keyboard for naming new marker ───────────────────────────
                if overlay_data.get("add_marker_flag", 0) == 1:
                    # Darken background
                    mask = frame.copy()
                    cv2.rectangle(mask, (0, 0), (w, h), BLACK, thickness=-1)
                    cv2.addWeighted(mask, 0.6, frame, 0.4, 0, frame)
                    # Keyboard container
                    kb_w, kb_h = 300, 360
                    kb_x, kb_y = (w - kb_w) // 2, (h - kb_h) // 2 + 40
                    cv2.rectangle(frame, (kb_x, kb_y),
                                (kb_x + kb_w, kb_y + kb_h),
                                DARK_GREEN, thickness=-1)
                    cv2.rectangle(frame, (kb_x, kb_y),
                                (kb_x + kb_w, kb_y + kb_h),
                                MEDIUM_GREEN, thickness=2)
                    # Current input at top
                    cv2.putText(frame, overlay_data.get("marker_name", ""),
                                (kb_x + 10, kb_y + 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.0, WHITE, 2, cv2.LINE_AA)
                    # 4×4 grid buttons: numbers, dot, C, OK
                    buttons = [
                        ("1", kb_x + 10, kb_y + 70),
                        ("2", kb_x + 80, kb_y + 70),
                        ("3", kb_x + 150, kb_y + 70),
                        ("4", kb_x + 10, kb_y + 140),
                        ("5", kb_x + 80, kb_y + 140),
                        ("6", kb_x + 150, kb_y + 140),
                        ("7", kb_x + 10, kb_y + 210),
                        ("8", kb_x + 80, kb_y + 210),
                        ("9", kb_x + 150, kb_y + 210),
                        (".", kb_x + 10, kb_y + 280),
                        ("0", kb_x + 80, kb_y + 280),
                        ("C", kb_x + 150, kb_y + 280),
                        ("OK", kb_x + 220, kb_y + 280),
                    ]
                    btn_w, btn_h = 60, 50
                    for txt, bx, by in buttons:
                        # Draw button background & border
                        cv2.rectangle(frame,
                                    (bx, by),
                                    (bx + btn_w, by + btn_h),
                                    DARK_GREEN, thickness=-1)
                        cv2.rectangle(frame,
                                    (bx, by),
                                    (bx + btn_w, by + btn_h),
                                    MEDIUM_GREEN, thickness=2)
                        # Center the text
                        (tw, th), _ = cv2.getTextSize(txt, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)
                        tx = bx + (btn_w - tw) // 2
                        ty = by + (btn_h + th) // 2
                        cv2.putText(frame, txt, (tx, ty),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, WHITE, 2, cv2.LINE_AA)
                # ===========================
                # MAIN MENU (when overlay_data["menu_flag"] == 1)
                # ===========================
                if overlay_data.get("menu_flag", 0) == 1:
                    menu_width = 400
                    menu_height = 300
                    margin_top = 10
                    margin_left = 10

                    # Background (dark green fill, medium green border)
                    cv2.rectangle(frame,
                                  (margin_left, margin_top),
                                  (margin_left + menu_width, margin_top + menu_height),
                                  DARK_GREEN, thickness=-1)
                    cv2.rectangle(frame,
                                  (margin_left, margin_top),
                                  (margin_left + menu_width, margin_top + menu_height),
                                  MEDIUM_GREEN, thickness=2)

                    # NorthConnect button (medium green fill, dark green border)
                    button_height = 60
                    button_width = menu_width - 20
                    button_x = margin_left + 10
                    button_y = margin_top + 10
                    cv2.rectangle(frame,
                                  (button_x, button_y),
                                  (button_x + button_width, button_y + button_height),
                                  MEDIUM_GREEN, thickness=-1)
                    cv2.rectangle(frame,
                                  (button_x, button_y),
                                  (button_x + button_width, button_y + button_height),
                                  DARK_GREEN, thickness=2)

                    # NorthConnect text (white on dark green)
                    text = "NorthConnect"
                    font_scale = 1.0
                    thickness = 2
                    (text_width, text_height), _ = cv2.getTextSize(text,
                                                                  cv2.FONT_HERSHEY_SIMPLEX,
                                                                  font_scale, thickness)
                    text_x = button_x + (button_width - text_width) // 2
                    text_y = button_y + (button_height + text_height) // 2
                    cv2.putText(frame, text, (text_x, text_y),
                                cv2.FONT_HERSHEY_SIMPLEX, font_scale,
                                BLACK, thickness + 2, cv2.LINE_AA)  # Black outline
                    cv2.putText(frame, text, (text_x, text_y),
                                cv2.FONT_HERSHEY_SIMPLEX, font_scale,
                                WHITE, thickness, cv2.LINE_AA)

                    # Input fields (green when active, gray otherwise)
                    input_height = 40
                    input_y_start = button_y + button_height + 20

                    # Field 1
                    field1_rect = (
                        margin_left + 20,
                        input_y_start,
                        menu_width - 40,
                        input_height
                    )
                    field1_color = MEDIUM_GREEN if overlay_data.get("field1Flag", 0) == 1 else (200, 200, 200)
                    cv2.rectangle(frame,
                                  (field1_rect[0], field1_rect[1]),
                                  (field1_rect[0] + field1_rect[2], field1_rect[1] + field1_rect[3]),
                                  field1_color, thickness=-1)
                    cv2.putText(frame, "Field 1:",
                                (field1_rect[0] - 80, field1_rect[1] + field1_rect[3] // 2 + 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, BLACK, 2)
                    # Display current value
                    cv2.putText(frame, overlay_data.get("field1_value", "0"),
                                (field1_rect[0] + 10, field1_rect[1] + field1_rect[3] // 2 + 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, BLACK, 2)

                    # Field 2
                    field2_rect = (
                        margin_left + 20,
                        input_y_start + input_height + 20,
                        menu_width - 40,
                        input_height
                    )
                    field2_color = MEDIUM_GREEN if overlay_data.get("field2Flag", 0) == 1 else (200, 200, 200)
                    cv2.rectangle(frame,
                                  (field2_rect[0], field2_rect[1]),
                                  (field2_rect[0] + field2_rect[2], field2_rect[1] + field2_rect[3]),
                                  field2_color, thickness=-1)
                    cv2.putText(frame, "Field 2:",
                                (field2_rect[0] - 80, field2_rect[1] + field2_rect[3] // 2 + 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, BLACK, 2)
                    # Display current value
                    cv2.putText(frame, overlay_data.get("field2_value", "0"),
                                (field2_rect[0] + 10, field2_rect[1] + field2_rect[3] // 2 + 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, BLACK, 2)

                    # Draw menu‐numpad (if Field 1 or Field 2 is active)
                    if overlay_data.get("field1Flag", 0) == 1 or overlay_data.get("field2Flag", 0) == 1:
                        # Semi‐transparent dark overlay (unchanged)
                        overlay_alpha = np.zeros((h, w, 3), dtype=np.uint8)
                        overlay_alpha[:] = BLACK
                        alpha = 0.6
                        #cv2.addWeighted(overlay_alpha, alpha, frame, 1 - alpha, 0, frame)

                        # Numpad container (now GREEN theme instead of dark gray)
                        numpad_width  = 300
                        numpad_height = 360
                        numpad_x      = (w - numpad_width) // 2
                        numpad_y      = (h - numpad_height) // 2 + 40

                        # Background & border for numpad
                        cv2.rectangle(frame,
                                      (numpad_x, numpad_y),
                                      (numpad_x + numpad_width, numpad_y + numpad_height),
                                      DARK_GREEN, thickness=-1)
                        cv2.rectangle(frame,
                                      (numpad_x, numpad_y),
                                      (numpad_x + numpad_width, numpad_y + numpad_height),
                                      MEDIUM_GREEN, thickness=2)

                        # Draw active field’s current value at top (WHITE text on dark green)
                        active_value = (
                            overlay_data.get("field1_value", "0")
                            if overlay_data.get("field1Flag", 0) == 1
                            else overlay_data.get("field2_value", "0")
                        )
                        cv2.putText(frame, active_value,
                                    (numpad_x + 10, numpad_y + 40),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, WHITE, 2, cv2.LINE_AA)

                        # Numpad buttons (4×4 grid, including “.”)
                        buttons = [
                            ("1", numpad_x + 10,  numpad_y + 70),
                            ("2", numpad_x + 80,  numpad_y + 70),
                            ("3", numpad_x + 150, numpad_y + 70),
                            ("",  numpad_x + 220, numpad_y + 70),

                            ("4", numpad_x + 10,  numpad_y + 140),
                            ("5", numpad_x + 80,  numpad_y + 140),
                            ("6", numpad_x + 150, numpad_y + 140),
                            ("",  numpad_x + 220, numpad_y + 140),

                            ("7", numpad_x + 10,  numpad_y + 210),
                            ("8", numpad_x + 80,  numpad_y + 210),
                            ("9", numpad_x + 150, numpad_y + 210),
                            ("",  numpad_x + 220, numpad_y + 210),

                            (".",  numpad_x + 10,  numpad_y + 280),
                            ("0",  numpad_x + 80,  numpad_y + 280),
                            ("C",  numpad_x + 150, numpad_y + 280),
                            ("OK", numpad_x + 220, numpad_y + 280),
                        ]

                        btn_width  = 60
                        btn_height = 50
                        for txt, bx, by in buttons:
                            if txt == "":
                                continue
                            # Button background = DARK_GREEN, border = MEDIUM_GREEN
                            cv2.rectangle(frame,
                                          (bx, by),
                                          (bx + btn_width, by + btn_height),
                                          DARK_GREEN, thickness=-1)
                            cv2.rectangle(frame,
                                          (bx, by),
                                          (bx + btn_width, by + btn_height),
                                          MEDIUM_GREEN, thickness=2)

                            # Text centered in button (WHITE)
                            (tw, th), _ = cv2.getTextSize(txt,
                                                         cv2.FONT_HERSHEY_SIMPLEX,
                                                         0.8, 2)
                            text_x = bx + (btn_width - tw) // 2
                            text_y = by + (btn_height + th) // 2
                            cv2.putText(frame, txt, (text_x, text_y),
                                        cv2.FONT_HERSHEY_SIMPLEX,
                                        0.8, WHITE, 2, cv2.LINE_AA)

                # ===========================
                # NETWORK CONFIG (Green Theme) – Revert Numpad to “Menu” Style, Panel Above Numpad
                # ===========================
                if overlay_data.get("network_flag", 0) == 1:
                    # 1) Draw panel near top so it sits entirely above the centered numpad
                    net_w = 500
                    net_h = 300
                    margin_top = 50
                    margin_left = (w - net_w) // 2

                    # Panel background (white) and border (medium green)
                    cv2.rectangle(frame,
                                  (margin_left, margin_top),
                                  (margin_left + net_w, margin_top + net_h),
                                  WHITE, thickness=-1)
                    cv2.rectangle(frame,
                                  (margin_left, margin_top),
                                  (margin_left + net_w, margin_top + net_h),
                                  MEDIUM_GREEN, thickness=3)

                    # 2) Position labels and input boxes
                    x0 = margin_left + 40    # label start
                    box_h = 40
                    # Space fields evenly so they fit comfortably in 300px height
                    y_start = margin_top + 30

                    labels = ["IP Address:", "Subnet Mask:", "Gateway:", "DNS 1:", "DNS 2:"]
                    keys   = ["ip_address",   "subnet_mask",   "gateway",  "DNS1",   "DNS2"]
                    field_boxes = {}

                    for i, (lbl, key) in enumerate(zip(labels, keys)):
                        y0 = y_start + i * (box_h + 10)  # row‐height = 50px

                        # Draw label (black)
                        cv2.putText(frame, lbl,
                                    (x0, y0 + box_h // 2 + 5),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, BLACK, 2, cv2.LINE_AA)

                        # Compute box coords (wider fields so IP fits)
                        bx0 = x0 + 160
                        by0 = y0
                        bx1 = margin_left + net_w - 20   # 20px right padding
                        by1 = by0 + box_h

                        # Draw input‐box (green if active, gray otherwise)
                        is_act = (overlay_data.get("active_network_field") == key)
                        col   = MEDIUM_GREEN if is_act else (200, 200, 200)
                        field_boxes[key] = (bx0, by0, bx1, by1)

                        cv2.rectangle(frame, (bx0, by0), (bx1, by1), col, thickness=-1)
                        cv2.rectangle(frame, (bx0, by0), (bx1, by1), BLACK, thickness=2)

                        # Draw current value (red)
                        cur_txt = overlay_data.get(key, "")
                        cv2.putText(frame, cur_txt,
                                    (bx0 + 10, by0 + box_h // 2 + 5),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, DARK_TURQUOISE, 2, cv2.LINE_AA)

                    # 3) Add “Set” button inside panel, below last field
                    btn_w = 100
                    btn_h = 40
                    # Position “Set” 20px below the last field (DNS2 ends at y = y_start + 4*50 + 40 = margin_top+30+200+40=margin_top+270)
                    btn_x = margin_left + net_w - btn_w - 20     # 20px right padding
                    btn_y = margin_top + 270 + 20                # 20px below DNS2
                    cv2.rectangle(frame,
                                  (btn_x, btn_y),
                                  (btn_x + btn_w, btn_y + btn_h),
                                  MEDIUM_GREEN, thickness=-1)
                    cv2.rectangle(frame,
                                  (btn_x, btn_y),
                                  (btn_x + btn_w, btn_y + btn_h),
                                  DARK_GREEN, thickness=2)
                    text = "Set"
                    (tw, th), _ = cv2.getTextSize(text,
                                                  cv2.FONT_HERSHEY_SIMPLEX,
                                                  0.8, 2)
                    text_x = btn_x + (btn_w - tw) // 2
                    text_y = btn_y + (btn_h + th) // 2
                    cv2.putText(frame, text, (text_x, text_y),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, WHITE, 2, cv2.LINE_AA)

                    # 4) Draw network‐numpad exactly as menu‐numpad (centered), so it no longer overlaps the panel
                    if overlay_data.get("numpad_flag", 0) == 1 and overlay_data.get("active_network_field"):
                        # Semi‐transparent overlay
                        overlay_alpha = np.zeros((h, w, 3), dtype=np.uint8)
                        overlay_alpha[:] = BLACK
                        alpha = 0.6
                        #cv2.addWeighted(overlay_alpha, alpha, frame, 1 - alpha, 0, frame)

                        # Centered numpad (same as menu)
                        numpad_w = 300
                        numpad_h = 360
                        numpad_x = (w - numpad_w) // 2
                        numpad_y = (h - numpad_h) // 2 + 40

                        # Background & border (green theme)
                        cv2.rectangle(frame,
                                      (numpad_x, numpad_y),
                                      (numpad_x + numpad_w, numpad_y + numpad_h),
                                      DARK_GREEN, thickness=-1)
                        cv2.rectangle(frame,
                                      (numpad_x, numpad_y),
                                      (numpad_x + numpad_w, numpad_y + numpad_h),
                                      MEDIUM_GREEN, thickness=2)

                        # Display active field’s current value (white text)
                        act = overlay_data["active_network_field"]
                        val = overlay_data.get(act, "")
                        cv2.putText(frame, val,
                                    (numpad_x + 10, numpad_y + 40),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, WHITE, 2, cv2.LINE_AA)

                        # Numpad buttons (4×4 grid, including “.”)
                        buttons = [
                            ("1", numpad_x + 10,   numpad_y + 70),
                            ("2", numpad_x + 80,   numpad_y + 70),
                            ("3", numpad_x + 150,  numpad_y + 70),
                            ("",  numpad_x + 220,  numpad_y + 70),

                            ("4", numpad_x + 10,   numpad_y + 140),
                            ("5", numpad_x + 80,   numpad_y + 140),
                            ("6", numpad_x + 150,  numpad_y + 140),
                            ("",  numpad_x + 220,  numpad_y + 140),

                            ("7", numpad_x + 10,   numpad_y + 210),
                            ("8", numpad_x + 80,   numpad_y + 210),
                            ("9", numpad_x + 150,  numpad_y + 210),
                            ("",  numpad_x + 220,  numpad_y + 210),

                            (".",  numpad_x + 10,   numpad_y + 280),
                            ("0",  numpad_x + 80,   numpad_y + 280),
                            ("C",  numpad_x + 150,  numpad_y + 280),
                            ("OK", numpad_x + 220,  numpad_y + 280),
                        ]

                        bw = 60
                        bh = 50
                        for txt, bx, by in buttons:
                            if txt == "":
                                continue
                            cv2.rectangle(frame,
                                          (bx, by),
                                          (bx + bw, by + bh),
                                          DARK_GREEN, thickness=-1)
                            cv2.rectangle(frame,
                                          (bx, by),
                                          (bx + bw, by + bh),
                                          MEDIUM_GREEN, thickness=2)

                            (tw, th), _ = cv2.getTextSize(
                                txt, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2
                            )
                            tx = bx + (bw - tw) // 2
                            ty = by + (bh + th) // 2
                            cv2.putText(frame, txt, (tx, ty),
                                        cv2.FONT_HERSHEY_SIMPLEX,
                                        0.8, WHITE, 2, cv2.LINE_AA)


                ################## END OF BUTTONS / MENUS ###########################

                # Convert frame to GStreamer buffer as before...
                data = frame.tobytes()
                buf = Gst.Buffer.new_allocate(None, len(data), None)
                buf.fill(0, data)

                # Push it downstream
                _appsrc.emit("push-buffer", buf)

                frame_count += 1

            appsrc.connect("need-data", push_frame)
            log.debug(f"[DEBUG] Successfully connected push_frame callback")

        factory.connect("media-configure", on_configure)
        self.mounts.add_factory(f"/{mount_name}", factory)
        log.debug(f"[DEBUG] Successfully added factory for mount: {mount_name}")


    def _restart_pipeline(self):
        log.warning("[GStreamer] Restarting RTSP stream pipeline due to failure.")
        if self.current_pipeline:
            self.current_pipeline.set_state(Gst.State.NULL)
            self.current_pipeline = None
            time.sleep(1.0)
            if self.current_launch_str:
                pipeline = Gst.parse_launch(self.current_launch_str)
                pipeline.set_state(Gst.State.PLAYING)
                log.info("[GStreamer] RTSP pipeline restarted.")

    def check_range(self, value, value_range):
        return value >= value_range[0] and value <= value_range[1]
        
    def check_option(self, option, options):
        return options.has_key(option)
    
    def readConfig(self):
        try:
            with open(self.file, 'r') as file:
                # Filter out special characters that break the json parser
                filter = ''.join(e for e in file.read() \
                    if e.isalnum() \
                    or e.isdigit() \
                    or e.isspace() \
                    or e == '"' or e == ':' or e == '.' or e == ',' \
                    or e == '#' or e == '(' or e == ')' or e == '{' \
                    or e == '}' or e == '[' or e == ']' \
                    or e == '-' or e == '_')
                config = json.loads(filter)
                log.info("Video settings loaded from "+str(self.file))
                self.configDate = os.stat(self.file).st_mtime
                
                if self.check_range(config["CodecControls"]["video_bitrate"], self.bitrate_range):
                    self.bitrate = config["CodecControls"]["video_bitrate"]
                else:
                    log.error("bitrate out of range: " + str(config["CodecControls"]["video_bitrate"]))
                
                if self.check_range(config["CodecControls"]["h264_i_frame_period"], self.h264_i_frame_period_range):
                    self.h264_i_frame_period = config["CodecControls"]["h264_i_frame_period"]
                else:
                    log.error("i-frame period invalid: " + str(config["CodecControls"]["h264_i_frame_period"]))
                
                if self.check_range(config["UserControls"]["brightness"], self.brightness_range):
                   self.brightness = config["UserControls"]["brightness"]
                else:
                   log.error("brightness out of range: " + str(config["UserControls"]["brightness"]))
                new_brightness = config["UserControls"]["brightness"]
                if self.check_range(new_brightness, self.brightness_range):
                   if new_brightness != self.brightness:
                       log.info(f"[Changed] brightness: {self.brightness} → {new_brightness}")
                       self.brightness = new_brightness

                if self.check_range(config["UserControls"]["contrast"], self.contrast_range):
                   self.contrast = config["UserControls"]["contrast"]
                else:
                   log.error("contrast out of range: " + str(config["UserControls"]["contrast"]))

                if self.check_range(config["UserControls"]["sharpness"], self.sharpness_range):
                    self.sharpness = config["UserControls"]["sharpness"]
                else:
                    log.error("sharpness out of range: " + str(config["UserControls"]["sharpness"]))

                if self.check_range(config["UserControls"]["red_balance"] / 1000.0, self.gain_red_range):
                    self.gain_red = config["UserControls"]["red_balance"] / 1000.0
                else:
                    log.error("red balance out of range: " + str(config["UserControls"]["red_balance"] / 1000.0))

                if self.check_range(config["UserControls"]["blue_balance"] / 1000.0, self.gain_blue_range):
                    self.gain_blue = config["UserControls"]["blue_balance"] / 1000.0
                else:
                    log.error("blue balance out of range: " + str(config["UserControls"]["blue_balance"] / 1000.0))
                
                self.horizontal_mirroring = config["UserControls"]["horizontal_flip"]
                self.vertical_mirroring = config["UserControls"]["vertical_flip"]
                self.rotation = config["UserControls"]["rotate"]
                
                if config["CameraControls"]["auto_exposure"] == False and self.check_range(config["CameraControls"]["exposure_time_absolute"], self.saturation_range):
                    self.shutter = config["CameraControls"]["exposure_time_absolute"]
                else:
                    self.shutter = 0
                
                if self.check_option(config["CameraControls"]["white_balance_auto_preset"], self.white_balance_options):
                    self.white_balance = config["CameraControls"]["white_balance_auto_preset"]
                else:
                    log.error("Invalid AWB preset: "+str(config["CameraControls"]["white_balance_auto_preset"]))
                    self.white_balance = 1
                
                if self.check_option(config["CameraControls"]["iso_sensitivity"], self.iso_options):
                    self.iso = config["CameraControls"]["iso_sensitivity"]
                else:
                    log.error("invalid ISO option: " + str(config["CameraControls"]["iso_sensitivity"]))
                    self.iso = 0
                
                self.video_stabilisation = config["CameraControls"]["image_stabilization"]
                
                # These settings will be ignored:
                self.bitrate_mode = config["CodecControls"]["video_bitrate_mode"]
                self.repeat_sequence_header = config["CodecControls"]["repeat_sequence_header"]
                self.h264_level = config["CodecControls"]["h264_level"]
                self.h264_profile = config["CodecControls"]["h264_profile"]
        except Exception as e:
            print ("Unable to read config!")
            print (e)
            
    
    def launch(self):
        log.debug("StreamServer.launch")
        if self.running:
            log.debug("StreamServer.launch called on running instance.")
            self.stop() # Need to stop any instances first
        
        if self.type == "picam":
                        # This asks the Pi GPU to generate H264 video data which is then passed out via RTSP
                        # Because the pipleline receives H264 video data (NALs) is not possible to add the clock overlay
                        # To add a clock, we must get raw video from the GPU and then add the clock, and then pass into the GPU to encode (or use libx264 to encode in software)

            launch_str =     '( rpicamsrc preview=false bitrate='+str(self.bitrate)+' keyframe-interval='+str(self.h264_i_frame_period)+' drc='+str(self.drc)+ \
                                ' image-effect=denoise shutter-speed='+str(self.shutter)+' iso='+str(self.iso)+ \
                                ' brightness='+str(self.brightness)+' contrast='+str(self.contrast)+' saturation='+str(self.saturation)+ \
                                ' sharpness='+str(self.sharpness)+' awb-mode='+str(self.white_balance)+ ' rotation='+str(self.rotation) + \
                                ' hflip='+str(self.horizontal_mirroring)+' vflip='+str(self.vertical_mirroring) + ' video-stabilisation='+str(self.video_stabilisation)
                                
            if self.white_balance == 0:
                log.info("Using custom white balance settings")
                launch_str = launch_str + 'awb-gain-red='+self.gain_red
                launch_str = launch_str + 'awb-gain-green='+self.gain_green
                launch_str = launch_str + 'awb-gain-blue='+self.gain_blue
            
            # Completing the pipe
            # By defining the video/x-264 or image/jpeg, the rpicamsrc module learns what output format to generate
            if self.codec == 0:
                launch_str = launch_str + ' ! video/x-h264, framerate='+str(self.fps)+'/1, width='+str(self.width)+', height='+str(self.height)+' ! h264parse ! rtph264pay name=pay0 pt=96 )'
            elif self.codec == 1:
                launch_str = launch_str + ' ! image/jpeg, framerate='+str(self.fps)+'/1, width='+str(self.width)+', height='+str(self.height)+' ! jpegparse ! rtpjpegpay name=pay0 pt=96 )'
            else:
                log.error("Illegal codec")

        elif self.type == "testsrc":
            # Generate a test image, encoded to H264 using libx264 or MJPEG. On a Pi this could have passed the raw image to the GPU (eg omxh264enc)

            # Ignore most of the parameters
            log.info("Test camera ignored most of the parameters")
            launch_str = '( rtspsrc location=rtsp://admin:Aragats777@192.168.0.31:3333/stream latency=0 ! rtph264depay ! h264parse config-interval=1 ! rtph264pay name=pay0 pt=96'
            launch_str = launch_str + ' ! clockoverlay '

            # Completing the pipe
            if self.codec == 0:
                launch_str = launch_str + ' ! x264enc tune=zerolatency ! h264parse ! rtph264pay name=pay0 pt=96 )'
            elif self.codec == 1:
                launch_str = launch_str + ' ! jpegenc ! jpegparse ! rtpjpegpay name=pay0 pt=96 )'
            else:
                log.error("Illegal codec")

        elif self.type == "filesrc":
            # Generate a black test image and overlay a jpeg (scaling to fit the image). Encoded to H264 using libx264.
                        # On a Pi this could have passed the raw image to the GPU (omxh264enc)
                        # I did try the videomixer/compositor and a filesrc plus imagefreeze but the only thing I could get working real-time was gdkpixbuffer

            # Ignore most of the parameters
            log.info("Test camera ignored most of the parameters")

            launch_str = '( rtspsrc location=rtsp://192.168.0.31:554/ latency=0 ! rtph264depay ! h264parse '
            launch_str = launch_str + ' ! gdkpixbufoverlay location="' + self.device + '" overlay-width=' + str(self.width) + ' overlay-height=' + str(self.height) + ' '
            launch_str = launch_str + ' ! clockoverlay '

            # Completing the pipe
            if self.codec == 0:
                launch_str = launch_str + ' ! queue ! x264enc tune=zerolatency ! h264parse ! rtph264pay name=pay0 pt=96 '
            elif self.codec == 1:
                launch_str = launch_str + ' ! jpegenc ! jpegparse ! rtpjpegpay name=pay0 pt=96 '
            else:
                log.error("Illegal codec")
            launch_str = launch_str + ' )'

        else: # usbcam USB Camera
            # Ignore most of the parameters
            log.info("USB camera ignored most of the parameters")
            launch_str = '( v4l2src is-live=true device='+self.device+' brightness='+str(self.brightness)+' contrast='+str(self.contrast)+' saturation='+str(self.saturation)
            launch_str = launch_str + ' ! queue ! jpegdec ! clockoverlay ! queue ! x264enc tune=zerolatency ! h264parse ! rtph264pay name=pay0 pt=96 )'

            # TODO .... allow MJPEG output codec

        log.debug(launch_str)
        cam_mutex.acquire()

        try:
            log.info("Starting RTSP service on port " + str(self.port))
            self.server.set_service(str(self.port))

            # Replace both GStreamer pipelines with OpenCV overlays
            # Wait until OpenCV is able to fetch frames, blocking startup until ready
            def wait_for_opencv_ready(rtsp_url, max_attempts=10):
                import cv2, time
                for attempt in range(max_attempts):
                    gst_pipeline = (
                        f'rtspsrc location={rtsp_url} latency=50 ! '
                        f'rtph264depay ! h264parse ! nvv4l2decoder ! '
                        f'queue max-size-buffers=10 max-size-time=100000 leaky=downstream ! '
                        f'nvvidconv ! video/x-raw, format=RGBA ! '
                        f'appsink drop=true max-buffers=1 sync=false'
                    )
                    cap = cv2.VideoCapture(gst_pipeline, cv2.CAP_GSTREAMER)

                    if cap.isOpened():
                        ret, _ = cap.read()
                        cap.release()
                        if ret:
                            return True
                    time.sleep(1)
                raise Exception(f"[ERROR] Could not open stream {rtsp_url} after {max_attempts} attempts.")

            wait_for_opencv_ready("rtsp://admin:Aragats777@192.168.0.33:3333/")
            self.start_opencv_overlay_stream("stream", "rtsp://admin:Aragats777@192.168.0.33:3333/stream", "/tmp/active_cross1.png")

            wait_for_opencv_ready("rtsp://admin:Aragats777@192.168.0.33:1111/")
            self.start_opencv_overlay_stream("altstream", "rtsp://admin:Aragats777@192.168.0.33:1111/", "/tmp/active_cross2.png")

            self.context_id = self.server.attach(None)
            self.mainthread = Thread(target=self.mainloop.run)
            self.mainthread.daemon = True
            self.mainthread.start()
            self.running = True


        finally:
            cam_mutex.release()

        log.info("Running dual RTSP Server: /stream and /altstream")

        
    def start(self):
        p = subprocess.Popen("ps -ax | grep rpos.js", shell=True, stdout=subprocess.PIPE)
        output = p.stdout.read().decode('utf-8')
        while self.stayAwake and "rpos" in output:
            if os.stat(self.file).st_mtime != self.configDate:
                log.info("Updating stream settings")
                self.readConfig()
            else:
                time.sleep(1.0)
        log.warning("Quitting service")
    
    def disconnect_all(self, a, b):
        return GstRtspServer.RTSPFilterResult.REMOVE
    
    def stop(self):
        if self.running:
            log.debug("Suspending RTSP Server")
            cam_mutex.acquire()
            try:
                self.server.client_filter(self.disconnect_all)
                time.sleep(0.3)
                self.mainloop.quit()
                self.mainthread.join()
                self.mounts.remove_factory("/h264")
                GLib.Source.remove(self.context_id)
                self.running = False
            finally:
                cam_mutex.release()
    
    #def updateConfig(self):
        #TODO: Manipulate the running pipe rather than destroying and recreating it.
        #self.stop()
        #self.launch()

    def b(self):
        print("Br")
    

i = 0 

if __name__ == '__main__':
    codec = 0         # Default to H264
    if args.mjpeg:
        codec = 1
    streamServer = StreamServer(args.type, args.device, args.file, args.rtspport, args.rtspname, \
                                args.rtspresolutionwidth, args.rtspresolutionheight,\
                                codec)
    streamServer.readConfig()
    i = i + 1
    #if (i == 0):
    streamServer.launch()
    streamServer.start()


    