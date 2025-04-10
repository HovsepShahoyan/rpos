from PySide6.QtCore import QDataStream, QIODevice
from PySide6.QtWidgets import QApplication, QDialog, QVBoxLayout,QLabel, QPushButton, QLineEdit, QTextEdit, QStatusBar
from PySide6.QtNetwork import QTcpSocket, QAbstractSocket

from  TCPDataParsing import stmd_commands
from   TCPCommunication import client_network, connection
from   uiManager.ui_conection_manager import ConnectionUI
from   uiManager.ui_manager import UI_Manager
from   uiManager.gst_test import VideoPlayer




if __name__ == '__main__':
    import sys

    app = QApplication(sys.argv)
    
    # setup stylesheet
    extra = {

    # Button colors
    'danger': '#dc3545',
    'warning': '#ffc107',
    'success': '#17a2b8',

    # Font
    'font_family': 'Roboto',
    'font_size': '12px',
    'line_height': '12px',

    # Density Scale
    'density_scale': '-3',

    # environ
    'pyside6': True,
    'linux': True,
    }
    #apply_stylesheet(app, theme='dark_yellow.xml', invert_secondary=False, extra=extra, css_file='custom_text.css' )

    ##test camera
    #camera_window = VideoPlayer()
    #camera_window.camera_show()

    motion_connection = connection.Connection()
    devices_connection = connection.Connection()

    motion_connection.IP = "192.168.0.31"
    motion_connection.Port = 8888
    devices_connection.IP = "192.168.0.21"
    devices_connection.Port = 2222

    client_ui = UI_Manager(app, motion_connection, devices_connection)
    client_ui.UI_Manager_show()
    
    sys.exit(app.exec())