# opencv_rtsp_server.py

import cv2
import numpy as np
import os
import time
import gi

gi.require_version('Gst', '1.0')
gi.require_version('GstRtspServer', '1.0')
from gi.repository import Gst, GstRtspServer, GObject, GLib

Gst.init(None)

OVERLAY_PATH = "/tmp/active_cross.png"

# Function to overlay image

def overlay_image_alpha(img, overlay):
    if overlay is None:
        return img
    h, w = img.shape[:2]
    oh, ow = overlay.shape[:2]
    if oh > h or ow > w:
        overlay = cv2.resize(overlay, (w // 2, h // 2))
        oh, ow = overlay.shape[:2]
    y1, x1 = h // 2 - oh // 2, w // 2 - ow // 2
    y2, x2 = y1 + oh, x1 + ow
    alpha = overlay[:, :, 3] / 255.0
    for c in range(3):
        img[y1:y2, x1:x2, c] = (alpha * overlay[:, :, c] +
                               (1 - alpha) * img[y1:y2, x1:x2, c])
    return img


class SensorFactory(GstRtspServer.RTSPMediaFactory):
    def __init__(self, rtsp_url, mount_name):
        super(SensorFactory, self).__init__()
        self.rtsp_url = rtsp_url
        self.mount_name = mount_name
        self.cap = cv2.VideoCapture(self.rtsp_url)
        if not self.cap.isOpened():
            raise Exception(f"Failed to open {self.rtsp_url}")
        _, frame = self.cap.read()
        self.height, self.width = frame.shape[:2]
        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS)) or 25
        self.overlay = cv2.imread(OVERLAY_PATH, cv2.IMREAD_UNCHANGED)
        self.launch_string = (
            f'appsrc name=source is-live=true block=true format=GST_FORMAT_TIME '
            f'caps=video/x-raw,format=BGR,width={self.width},height={self.height},framerate={self.fps}/1 '
            f'! videoconvert ! x264enc speed-preset=ultrafast tune=zerolatency ! '
            f'rtph264pay config-interval=1 name=pay0 pt=96'
        )
        self.set_shared(True)

    def do_create_element(self, url):
        return Gst.parse_launch(self.launch_string)

    def do_configure(self, rtsp_media):
        self.frame_count = 0
        appsrc = rtsp_media.get_element().get_child_by_name("source")
        appsrc.connect("need-data", self.on_need_data)

    def on_need_data(self, src, length):
        ret, frame = self.cap.read()
        if not ret:
            return
        if self.frame_count % 30 == 0:
            new_overlay = cv2.imread(OVERLAY_PATH, cv2.IMREAD_UNCHANGED)
            if new_overlay is not None:
                self.overlay = new_overlay
        frame = overlay_image_alpha(frame, self.overlay)
        data = frame.tobytes()
        buf = Gst.Buffer.new_allocate(None, len(data), None)
        buf.fill(0, data)
        duration = Gst.SECOND // self.fps
        timestamp = self.frame_count * duration
        buf.pts = buf.dts = timestamp
        buf.duration = duration
        self.frame_count += 1
        src.emit("push-buffer", buf)


if __name__ == '__main__':
    camera1_url = "rtsp://admin:Aragats777@192.168.0.31:3333/stream"
    camera2_url = "rtsp://admin:Aragats777@192.168.0.31:1111/"

    loop = GLib.MainLoop()
    server = GstRtspServer.RTSPServer()
    mounts = server.get_mount_points()

    factory1 = SensorFactory(camera1_url, "stream")
    factory2 = SensorFactory(camera2_url, "altstream")

    mounts.add_factory("/stream", factory1)
    mounts.add_factory("/altstream", factory2)

    server.attach(None)
    print("RTSP Server is running at rtsp://<jetson-ip>:8554/stream and /altstream")
    loop.run()