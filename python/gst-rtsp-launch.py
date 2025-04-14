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
from  TCPDataParsing import stmd_commands
from   TCPCommunication import client_network, connection
from   uiManager.ui_conection_manager import ConnectionUI
from   uiManager.ui_manager import UI_Manager
from   uiManager.gst_test import VideoPlayer

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
        
        self.codec_options = {0:"h264", 1:"MJPEG"}
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
        self.saturation_range = [0, 100]
        self.saturation = 0
        
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

                # Call the external UART brightness script
#               try:
 #                   subprocess.run(
  #                      ["python3", "/home/jetson/send_brightness.py", "--value", str(new_brightness)],
   #                     check=True,
    #                    stdout=subprocess.PIPE,
     #                   stderr=subprocess.PIPE
      #                  )
       #             log.info(f"[UART] Brightness script executed for value {new_brightness}")
        #        except subprocess.CalledProcessError as e:
         #           log.error(f"[UART ERROR] Brightness script failed: {e.stderr.decode().strip()}")
                # new_brightness = config["UserControls"]["brightness"]
                # if self.check_range(new_brightness, self.brightness_range):
                #     if new_brightness != self.brightness:
                #         log.info(f"[Changed] brightness: {self.brightness} → {new_brightness}")
                #         self.brightness = new_brightness

                #         # Safe UART call to external script
                #         try:
                #             subprocess.Popen(
                #                 ["python3", "/home/jetson/rpos/scripts/send_brightness.py", "--value", str(new_brightness)],
                #                 stdout=subprocess.DEVNULL,
                #                 stderr=subprocess.DEVNULL
                #             )
                #             log.info(f"[UART] Sent brightness {new_brightness} via external script.")
                #         except Exception as e:
                #             log.error(f"[UART ERROR] Failed to launch brightness script: {e}")

                # new_digital_zoom = config["UserControls"]["digital_zoom"]
                # #log.info("new_digital_zoom {new_digital_zoom}")
                # if self.check_range(new_digital_zoom, self.digital_zoom_range):
                #     if new_digital_zoom != self.digital_zoom:
                #         #log.info(f"[Changed] digital_zoom: {self.digital_zoom} → {new_digital_zoom}")
                #         self.digital_zoom = new_digital_zoom

                #         # Safe UART call to external script
                #         try:
                #             subprocess.Popen(
                #                 ["python3", "/home/jetson/rpos/scripts/send_zoom.py", "--level", str(new_digital_zoom)],
                #                 stdout=subprocess.DEVNULL,
                #                 stderr=subprocess.DEVNULL
                #             )
                #             #log.info(f"[UART] Sent digital_zoom {new_digital_zoom} via external script.")
                #         except Exception as e:
                #             #log.error(f"[UART ERROR] Failed to launch digital_zoom script: {e}")

                # new_palette = config["UserControls"]["palette"]
                # if 0 <= new_palette <= 14:
                #     if new_palette != self.palette:
                #         log.info(f"[Changed] palette: {self.palette} → {new_palette}")
                #         self.palette = new_palette
                #         try:
                #             subprocess.Popen(
                #                 ["python3", "/home/jetson/rpos/scripts/send_palette.py", "--value", str(new_palette)],
                #                 stdout=subprocess.DEVNULL,
                #                 stderr=subprocess.DEVNULL
                #             )
                #             #log.info(f"[UART] Sent palette {new_palette} via external script.")
                #         except Exception as e:
                            #log.error(f"[UART ERROR] Failed to launch palette script: {e}")

                # new_ip = config["UserControls"]["ip_address"]
                # new_username = config["UserControls"]["username"]
                # new_password = config["UserControls"]["password"]
                # log.info(f" {new_ip} {new_username} {new_password} ")

                # if (new_ip != self.ip_address or
                #     new_username != self.username or
                #     new_password != self.password):

                #     log.info("[Changed] IP/Username/Password has changed")
                #     try:
                #         subprocess.Popen(
                #             ["bash", "/home/jetson/rpos/scripts/update_rpos_config.sh",
                #              "--ip", new_ip,
                #              "--user", new_username,
                #              "--pass", new_password],
                #              stdout=subprocess.DEVNULL,
                #              stderr=subprocess.DEVNULL
                #         )
                #         log.info("[SCRIPT] Ran update_config.sh to apply IP/Login/Password changes.")
                #     except Exception as e:
                #         log.error(f"[SCRIPT ERROR] Failed to launch config update script: {e}")



                if self.check_range(config["UserControls"]["contrast"], self.contrast_range):
                   self.contrast = config["UserControls"]["contrast"]
                else:
                   log.error("contrast out of range: " + str(config["UserControls"]["contrast"]))
                
                # new_contrast = config["UserControls"]["contrast"]
                # if self.check_range(new_contrast, self.contrast_range):
                #     if new_contrast != self.contrast:
                #         log.info(f"[Changed] contrast: {self.contrast} → {new_contrast}")
                #         self.contrast = new_contrast
                #         # Safe UART call to external contrast script
                #         try:
                #             subprocess.Popen(
                #                 ["python3", "/home/jetson/rpos/scripts/send_contrast.py", "--value", str(new_contrast)],
                #                 stdout=subprocess.DEVNULL,
                #                 stderr=subprocess.DEVNULL
                #             )
                #             log.info(f"[UART] Sent contrast {new_contrast} via external script.")
                #         except Exception as e:
                #             log.error(f"[UART ERROR] Failed to launch contrast script: {e}")


                if self.check_range(config["UserControls"]["saturation"], self.saturation_range):
                    self.saturation = config["UserControls"]["saturation"]
                else:
                    log.error("saturation out of range: " + str(config["UserControls"]["saturation"]))

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

            # FIRST STREAM
            launch_str_1 = (
                'rtspsrc location=rtsp://admin:Aragats777@192.168.0.31:3333/stream timeout=5000000 connection-speed=30000000 '
                'do-reconnect=true drop-on-latency=true latency=100 ! '
                'rtph264depay ! queue ! h264parse config-interval=1 ! '
                'video/x-h264,stream-format=byte-stream,alignment=au ! queue ! '
                'nvv4l2decoder enable-max-performance=1 ! queue ! nvvidconv ! queue ! '
                'nvv4l2h264enc insert-sps-pps=true idrinterval=15 bitrate=2000000 maxperf-enable=1 ! queue ! '
                'rtph264pay name=pay0 pt=96 config-interval=1'
            )
            factory1 = self._create_factory(launch_str_1)
            self.stream_launch_str = launch_str_1 
            self.mounts.add_factory("/stream", factory1)

            # SECOND STREAM (same pay0, different pipeline, guarded)
            try:
                launch_str_2 = (
                'rtspsrc location=rtsp://admin:Aragats777@192.168.0.31:1111 timeout=5000000 connection-speed=30000000 '
                'do-reconnect=true drop-on-latency=true latency=100 ! '
                'rtph264depay ! queue ! h264parse config-interval=1 ! '
                'video/x-h264,stream-format=byte-stream,alignment=au ! queue ! '
                'nvv4l2decoder enable-max-performance=1 ! queue ! nvvidconv ! queue ! '
                'nvv4l2h264enc insert-sps-pps=true idrinterval=15 bitrate=2000000 maxperf-enable=1 ! queue ! '
                'rtph264pay name=pay0 pt=96 config-interval=1'
                )
                factory2 = self._create_factory(launch_str_2)
                self.mounts.add_factory("/altstream", factory2)
            except Exception as e:
                log.warning("[RTSP] Could not mount /altstream: " + str(e))

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


    