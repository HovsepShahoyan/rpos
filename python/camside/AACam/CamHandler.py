import logging
import os
from datetime import datetime

import gi
from PySide6.QtCore import QTimer
from PySide6 import QtGui


from config import config
from camside.helpers.device import DeviceEnum
###from communicationside.models.properties_model import PropertiesModel


gi.require_version("Gst", "1.0")
gi.require_version("GstVideo", "1.0")
from gi.repository import Gst

log = logging.getLogger()


class CamHandler:
    def __init__(self, container_primary=None, container_secondary=None):
        self.device_primary = None
        self.aspect_ratio_flag = 0

        self.container_primary = container_primary
        self.container_secondary = container_secondary

        self.pipeline = None
        self.bus = None

        ###self.properties_model = PropertiesModel()

        self.switch_timer = QTimer()
        self.switch_timer.setSingleShot(True)  # Ensure the timer only triggers once per start
        self.switch_timer.setInterval(1000)  # Set delay interval to 1000 milliseconds (1 second)
        self.switch_timer.timeout.connect(self.perform_switch)  # Connect timeout signal to the switch method

        self.pending_source_number = 1  # To hold the source number pending for switch





        # video caps
        self.stream_to = "127.0.0.1"
        width = 1280
        height = 1024
        framerate = "30/1"
        format = "YUY2"
        self.caps_filter = f"video/x-raw,format={format},width={width},height={height},framerate={framerate}"
        self.recording_location = os.path.expandvars(config.get("recording_dir"))

    def set_primary_device(self, device: DeviceEnum = None):
        self.device_primary = device

    def set_secondary_device(self, device: DeviceEnum = None):
        self.device_secondary = device



    def reset(self):
        if self.pipeline:
            self.stop()
        self.pipeline = None
        print("Pipeline reset succeeded")

    def new_sample_receiver_primary(self, app_sink):
        return self.new_buffer(app_sink, container=self.container_primary)
    
    def new_sample_receiver_secondary(self, app_sink):
        return self.new_buffer(app_sink, container=self.container_secondary)

    def new_buffer(self, app_sink, container):
        """
        :param app_sink: Appsink is provided by GStreamer when the signal is emitted
        :param container: QT Container which draws the image
        :return: GStreamer state
        """
        buf = app_sink.emit("pull-sample")
        caps = buf.get_caps()
        struct = caps.get_structure(0)
        b = buf.get_buffer()
        buffer_map = None
        try:
            (ret, buffer_map) = b.map(Gst.MapFlags.READ)
            current_width = struct.get_value("width")
            current_height = struct.get_value("height")

            # current_width = 1920
            # current_height = 1080

            image = QtGui.QPixmap.fromImage(QtGui.QImage(buffer_map.data,
                                                         current_width,
                                                         current_height,
                                                         QtGui.QImage.Format_RGBA8888))
            container.new_pixmap.emit(image)
        finally:
            if buffer_map is not None:
                b.unmap(buffer_map)

        return Gst.FlowReturn.OK
    
    def request_switch_source(self, source_number):
        self.pending_source_number = source_number 
        self.switch_timer.start()  # Restart timer

    def request_switch_source_unspecified(self):
        if self.pending_source_number == 1:
            self.pending_source_number = 2
        elif self.pending_source_number == 2:
            self.pending_source_number = 1
        elif self.pending_source_number == None:
            self.pending_source_number = 1
        
        #self.properties_model.current_camera = self.pending_source_number
        
        self.switch_timer.start()  # Restart timer

    def perform_switch(self):
        if self.pending_source_number is not None:
            source_number = self.pending_source_number
            self.reset()
            self.create_pipeline(source_number)
            self.play()
            # self.pending_source_number = None

    def create_pipeline(self, source=1):
        try: 
            self.pipeline = None

            # parent_dir_name = datetime.now().strftime('%Y-%m-%d')
            # child_dir_name = datetime.now().strftime('%H%M%S%f')
            # recording_path = f"{self.recording_location}/{parent_dir_name}/{child_dir_name}"

            # os.makedirs(recording_path, exist_ok=True)

            main_screen_width = 1920
            main_screen_height = 1080

            mini_screen_width = 640
            mini_screen_height = 512

            # xpos = main_screen_width + mini_screen_width

            source_1_res = f',width=1920,height=1080'
            source_2_res = f',width=1350,height=1080'

            nvcompositor = " ".join([
                "nvcompositor",
                "name=comp",
                f"sink_0::width={main_screen_width}",
                f"sink_0::height={main_screen_height}"
            ])
            clockoverlay = " ".join([
                'clockoverlay',
                'time-format="%Y-%m-%d %H:%M:%S"',
                'draw-outline=true',
                'font-desc="Monospace, 8"'
            ])
            # splitmuxsink = " ".join([
            #     "splitmuxsink",
            #     f"location={recording_path}/%02d.mp4",
            #     f"max-size-time={int(1e9 * 60 * 5)}",
            #     "max-files=96",
            #     "async-finalize=true"
            # ])
            appsink = " ".join([
                "appsink",
                "max-buffers=2",
                "drop=true",
                "emit-signals=true",
                "sync=false"
            ])
            screen_capture = " ".join("ximagesrc use-damage=0 ! video/x-raw,framerate=30/1 ! nvvidconv")



            if source == 1:
            # Day Pipeline
                pipeline_str = \
                    f"{nvcompositor} " \
                    f"rtspsrc location={config.get('Day_cam_rtsp')} latency=100 ! rtph264depay ! nvv4l2decoder ! tee name=tee_source_1 " \
                    "tee_source_1. ! queue ! comp. " \
                    f"tee_source_1. ! queue max-size-buffers=10 leaky=downstream max-size-time=100000 ! nvvidconv ! video/x-raw,format=RGBA{source_1_res} ! {appsink} name=sink_primary " \
                    f"comp. ! video/x-raw(memory:NVMM){source_1_res}! nvvidconv "

            
            elif source == 2:
            #Thermal Pipeline
                pipeline_str = f"{nvcompositor} " \
                    f"rtspsrc location={config.get('IR_cam_rtsp')} latency=50 ! decodebin ! nvvidconv ! video/x-raw(memory:NVMM){source_2_res} ! tee name=tee_source_1 " \
                    "tee_source_1. ! queue ! comp. " \
                    f"tee_source_1. ! queue max-size-buffers=1 leaky=downstream max-size-time=0 ! nvvidconv ! video/x-raw ! nvvidconv ! video/x-raw,format=BGRx{source_2_res} ! {appsink} name=sink_primary " \
                    f"comp. ! video/x-raw(memory:NVMM) ! nvvidconv "

            
            print(pipeline_str)
            self.pipeline = Gst.parse_launch(pipeline_str)
            self.bus = self.pipeline.get_bus()
            self.bus.add_signal_watch()
            self.bus.connect("message::error", self.on_error)

            self.pipeline.get_by_name("sink_primary").connect("new-sample", self.new_sample_receiver_primary)
            # self.pipeline.get_by_name("sink_secondary").connect("new-sample", self.new_sample_receiver_secondary)
            self.pipeline.set_state(Gst.State.READY)
        except:
            print("Unexpected gstreamer error")

    def on_error(self, bus, msg):
        print(msg.parse_error())

    def get_gst_state(self, timeout=5):
        if not self.pipeline:
            return None
        return self.pipeline.get_state(timeout).state

    def play(self):
        if self.pipeline is None:
            self.create_pipeline()

        if self.get_gst_state() == Gst.State.PLAYING:
            log.debug("Setting state to NULL")
            self.stop()
            self.pipeline.set_state(Gst.State.READY)

        log.debug("Setting state to PLAYING")
        self.pipeline.set_state(Gst.State.PLAYING)

    def pause(self):
        if self.get_gst_state() == Gst.State.PLAYING:
            self.pipeline.set_state(Gst.State.PAUSED)

    def stop(self):
        if self.get_gst_state() == Gst.State.PLAYING:
            Gst.Element.send_event(self.pipeline, Gst.Event.new_eos())
            self.bus.timed_pop_filtered(Gst.CLOCK_TIME_NONE, Gst.MessageType.EOS)
            self.pipeline.set_state(Gst.State.NULL)
