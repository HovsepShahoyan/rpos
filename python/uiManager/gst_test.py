"""import gi
gi.require_version('Gst', '1.0')
from gi.repository import Gst

# Initialize GStreamer
Gst.init(None)

# Create a playbin element (high-level player)
player = Gst.ElementFactory.make('playbin', 'player')

# Set the URI to your RTSP stream
player.set_property('uri', 'rtsp://admin:Aragats777@192.168.0.21:4444')

# Start playing the stream
player.set_state(Gst.State.PLAYING)

# Wait for the stream to play (adjust as needed)
import time
time.sleep(10)  # Adjust time as needed for the stream

# Stop playback
player.set_state(Gst.State.NULL)"""

"""import sys
import gi
gi.require_version('Gst', '1.0')
from PySide6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PySide6.QtCore import Qt
from gi.repository import Gst, GObject

# Initialize GStreamer
Gst.init(None)

class VideoPlayer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowFlag(Qt.FramelessWindowHint)
        # Set up the main window
        self.setWindowTitle("Day Camera")
        self.setGeometry(100, 100, 1920, 1080)
        # Create a QWidget for the video display
        self.video_widget = QWidget(self)
        self.setCentralWidget(self.video_widget)

        # Set up the layout for the window
        layout = QVBoxLayout(self.video_widget)
        layout.setContentsMargins(0, 0, 0, 0)

        capsfilter = Gst.ElementFactory.make('capsfilter', 'capsfilter')
        caps = Gst.Caps.from_string('video/x-raw, width=1920, height=1080')  # Set desired resolution
        capsfilter.set_property('caps', caps)        # Create the GStreamer pipeline for video playback

        self.pipeline = Gst.parse_launch('playbin uri=rtsp://admin:Aragats777@192.168.0.21:4444')

        self.pipeline.add(capsfilter)
        # Link the pipeline to the video widget
        self.pipeline.set_state(Gst.State.PLAYING)

        # Set up the bus to handle messages from GStreamer
        bus = self.pipeline.get_bus()
        bus.add_signal_watch()
        bus.connect("message", self.on_message)

    def on_message(self, bus, message):
        if message.type == Gst.MessageType.EOS:
            self.pipeline.set_state(Gst.State.NULL)
            self.close()
        elif message.type == Gst.MessageType.ERROR:
            err, debug = message.parse_error()
            print(f"Error: {err}, {debug}")
            self.pipeline.set_state(Gst.State.NULL)
            self.close()

if __name__ == "__main__":
    # Set up the application
    app = QApplication(sys.argv)

    # Create and show the main window
    window = VideoPlayer()
    window.show()

    # Run the application
    sys.exit(app.exec())"""

import sys
import gi
gi.require_version('Gst', '1.0')
gi.require_version('GstVideo', '1.0')
from gi.repository import GObject, Gst, GstVideo
from PySide6.QtWidgets import *
import PySide6.QtWidgets as qtw
from PySide6.QtCore import Qt, QSize, QRegularExpression

Gst.init(sys.argv)


class VideoPlayer(QMainWindow):
    def __init__(self, parent = None):
        super().__init__()

        self.pipeline = Gst.parse_launch('playbin uri=rtsp://admin:Aragats777@192.168.0.21:1111')
        
        self.display = QWidget()

        self.setGeometry(0, 0, 1920, 1080)
        self.setWindowTitle("Camera window")

        self.windowId = self.winId()


        layout = qtw.QVBoxLayout()
        button = qtw.QPushButton("dsfdsf")
        layout.addWidget(button, alignment=Qt.AlignmentFlag.AlignTop)
        self.display.setLayout(layout)
    def setup_pipeline(self):

        self.state = Gst.State.NULL
        """self.source.set_property('pattern', 0)

        if not self.pipeline or not self.source or not self.videoconvert or not self.sink:
            print("ERROR: Not all elements could be created")
            sys.exit(1)"""

        # instruct the bus to emit signals for each received message
        # and connect to the interesting signals
        bus = self.pipeline.get_bus()

        bus.add_signal_watch()
        bus.enable_sync_message_emission()
        bus.connect('sync-message::element', self.on_sync_message)

    def on_sync_message(self, bus, msg):
        if msg.get_structure().get_name() == 'prepare-window-handle':
            msg.src.set_window_handle(self.windowId)

    def start_pipeline(self):
        self.pipeline.set_state(Gst.State.PLAYING)
    def camera_show(self):
        self.setup_pipeline()
        self.start_pipeline()
        self.show()

"""if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MainWindow()
    window.setup_pipeline()
    window.start_pipeline()
    window.show()
    sys.exit(app.exec())"""

"""from PySide6.QtGui import QIcon, QFont
from PySide6.QtCore import QDir, Qt, QUrl, QSize
from PySide6.QtMultimedia import QMediaPlayer
from PySide6.QtMultimediaWidgets import QVideoWidget
from PySide6.QtWidgets import (QApplication, QFileDialog, QHBoxLayout, QLabel, QStyleFactory,
        QPushButton, QSizePolicy, QSlider, QStyle, QVBoxLayout, QWidget, QStatusBar)


class VideoPlayer(QWidget):

    def __init__(self, parent=None):
        super(VideoPlayer, self).__init__(parent)

        self.mediaPlayer = QMediaPlayer()

        btnSize = QSize(16, 16)
        videoWidget = QVideoWidget()

        openButton = QPushButton("Open Video")   
        openButton.setToolTip("Open Video File")
        openButton.setStatusTip("Open Video File")
        openButton.setFixedHeight(24)
        openButton.setIconSize(btnSize)
        openButton.setFont(QFont("Noto Sans", 8))
        openButton.setIcon(QIcon.fromTheme("document-open", QIcon("D:/_Qt/img/open.png")))
        openButton.clicked.connect(self.abrir)

        self.playButton = QPushButton()
        self.playButton.setEnabled(False)
        self.playButton.setFixedHeight(24)
        self.playButton.setIconSize(btnSize)
        self.playButton.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_MediaPlay))
        self.playButton.clicked.connect(self.play)

        self.positionSlider = QSlider(Qt.Orientation.Horizontal)
        self.positionSlider.setRange(0, 0)
        self.positionSlider.sliderMoved.connect(self.setPosition)

        self.statusBar = QStatusBar()
        self.statusBar.setFont(QFont("Noto Sans", 7))
        self.statusBar.setFixedHeight(14)

        controlLayout = QHBoxLayout()
        controlLayout.setContentsMargins(0, 0, 0, 0)
        controlLayout.addWidget(openButton)
        controlLayout.addWidget(self.playButton)
        controlLayout.addWidget(self.positionSlider)

        layout = QVBoxLayout()
        layout.addWidget(videoWidget)
        layout.addLayout(controlLayout)
        layout.addWidget(self.statusBar)

        self.setLayout(layout)

        #help(self.mediaPlayer)
        self.mediaPlayer.setVideoOutput(videoWidget)
        self.mediaPlayer.playbackStateChanged.connect(self.mediaStateChanged)
        self.mediaPlayer.positionChanged.connect(self.positionChanged)
        self.mediaPlayer.durationChanged.connect(self.durationChanged)
        self.mediaPlayer.errorChanged.connect(self.handleError)
        self.statusBar.showMessage("Ready")

    def abrir(self):
        fileName, _ = QFileDialog.getOpenFileName(self, "Select Media",
                ".", "Video Files (*.mp4 *.flv *.ts *.mts *.avi)")

        if fileName != '':
            self.mediaPlayer.setSource(QUrl.fromLocalFile(fileName))
            self.playButton.setEnabled(True)
            self.statusBar.showMessage(fileName)
            self.play()

    def play(self):
        if self.mediaPlayer.playbackState() == QMediaPlayer.PlaybackState.PlayingState:
            self.mediaPlayer.pause()
        else:
            self.mediaPlayer.play()

    def mediaStateChanged(self, state):
        if self.mediaPlayer.playbackState() == QMediaPlayer.PlaybackState.PlayingState:
            self.playButton.setIcon(
                    self.style().standardIcon(QStyle.StandardPixmap.SP_MediaPause))
        else:
            self.playButton.setIcon(
                    self.style().standardIcon(QStyle.StandardPixmap.SP_MediaPlay))

    def positionChanged(self, position):
        self.positionSlider.setValue(position)

    def durationChanged(self, duration):
        self.positionSlider.setRange(0, duration)

    def setPosition(self, position):
        self.mediaPlayer.setPosition(position)

    def handleError(self):
        self.playButton.setEnabled(False)
        self.statusBar.showMessage("Error: " + self.mediaPlayer.errorString())

if __name__ == '__main__':
    import sys
    app = QApplication(sys.argv)
    player = VideoPlayer()
    player.setWindowTitle("Player")
    player.resize(900, 600)
    player.show()
    sys.exit(app.exec())"""