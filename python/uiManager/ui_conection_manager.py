import PySide6.QtWidgets as qtw
import  TCPDataParsing

from PySide6.QtCore import QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator, QScreen 
from PySide6.QtWidgets import QApplication, QMainWindow, QDialog

from  TCPCommunication import client_network, connection
from  uiManager.ui_functions import UI_Functions

class ConnectionUI(QDialog):
    def __init__(self, motion_connection, devices_connection):
        #get and set connections
        self.motion_connection = motion_connection
        self.devices_connection = devices_connection
        self.motion_connection_process = False
        self.devices_connection_process = False
        ####connections events in UI
        motion_connection.network.connected.connect(lambda: self.successfully_connected(motion_connection))
        devices_connection.network.connected.connect(lambda: self.successfully_connected(devices_connection))

        motion_connection.network.errorOccurred.connect(lambda: self.connection_error(motion_connection))
        devices_connection.network.errorOccurred.connect(lambda: self.connection_error(devices_connection))
        
        motion_connection.network.disconnected.connect(lambda: self.successfully_disconnected(motion_connection))
        devices_connection.network.disconnected.connect(lambda: self.successfully_disconnected(devices_connection))
        
        
        ####
        
        super().__init__()

        self.__WindowStyle()
        #Main Layout
        self.main_layout = qtw.QHBoxLayout()

        #Connection Layout 
        self.__ConnectionLayout()
        

        self.setLayout(self.main_layout)

    #Window style
    def __WindowStyle(self):
        self.setWindowTitle("3D_01_TESTER_CONNECTIONS")
        center = QScreen.availableGeometry(QApplication.primaryScreen()).center()
        self.setFixedSize(500, 210)
        x = (center.x() - self.width()/2) 
        y = (center.y() - self.height()/2) 
        self.move(x, y)
        self.setModal(True)

        
    #Design Connection Layout
    def __ConnectionLayout(self):
        only_num_regex = QRegularExpression(r'^[0-9]*$')  # Regex for numbers only
        ip_regex = QRegularExpression(r'^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')

        only_num_validator = QRegularExpressionValidator(only_num_regex, self)
        ip_validator = QRegularExpressionValidator(ip_regex, self)

        #Motion 
        motion_connection_layout = qtw.QFormLayout()
        motion_connection_layout.addRow(qtw.QLabel("Motion contoller connection:"))

        self.motion_ip_line_edit = qtw.QLineEdit()
        self.motion_ip_line_edit.setMaxLength(15)
        self.motion_ip_line_edit.setText(self.motion_connection.IP)
        self.motion_ip_line_edit.setValidator(ip_validator)
        motion_connection_layout.addRow("IP: ", self.motion_ip_line_edit)

        self.motion_port_line_edit = qtw.QLineEdit()
        self.motion_port_line_edit.setMaxLength(4)
        self.motion_port_line_edit.setText(str(self.motion_connection.Port))
        self.motion_port_line_edit.setValidator(only_num_validator)
        motion_connection_layout.addRow("Port: ", self.motion_port_line_edit)
        
        #Info label
        self.motion_connection_info_label = qtw.QLabel("Motion connection info")
        self.motion_connection_info_label.setStyleSheet("border: 0px;")
        motion_connection_layout.addRow(self.motion_connection_info_label)

        #Motion connect button
        self.motion_connect_button = qtw.QPushButton("Connect")
        self.motion_connect_button.clicked.connect(lambda: self.__connect_click(self.motion_connection))
        motion_connection_layout.addRow(self.motion_connect_button)

        #Motion disconnect button
        self.motion_disconnect_button = qtw.QPushButton("Disconnect")
        self.motion_disconnect_button.clicked.connect(lambda: self.__disconnect_click(self.motion_connection))
        motion_connection_layout.addRow(self.motion_disconnect_button)
        UI_Functions.enable_disable__btn_ui(self, self.motion_connection, False)

        self.main_layout.addLayout(motion_connection_layout)
        
        #Devices
        devices_connection_layout = qtw.QFormLayout()

        devices_connection_layout.addRow(qtw.QLabel("Devices contoller connection:"))

        self.devices_ip_line_edit = qtw.QLineEdit()
        self.devices_ip_line_edit.setMaxLength(15)
        self.devices_ip_line_edit.setText(self.devices_connection.IP)
        self.devices_ip_line_edit.setValidator(ip_validator)
        devices_connection_layout.addRow("IP: ", self.devices_ip_line_edit)

        self.devices_port_line_edit = qtw.QLineEdit()
        self.devices_port_line_edit.setMaxLength(4)
        self.devices_port_line_edit.setText(str(self.devices_connection.Port))
        self.devices_port_line_edit.setValidator(only_num_validator)
        devices_connection_layout.addRow("Port: ", self.devices_port_line_edit)
        
        #Info label
        self.devices_connection_info_label = qtw.QLabel("Devices connection info")
        self.devices_connection_info_label.setStyleSheet("border: 0px;")
        devices_connection_layout.addRow(self.devices_connection_info_label)

        #Devices connect button
        self.devices_connect_button = qtw.QPushButton("Connect")
        self.devices_connect_button.clicked.connect(lambda: self.__connect_click(self.devices_connection))
        devices_connection_layout.addRow(self.devices_connect_button)

        #Devices disconnect button
        self.devices_disconnect_button = qtw.QPushButton("Disconnect")
        self.devices_disconnect_button.clicked.connect(lambda: self.__disconnect_click(self.devices_connection))
        devices_connection_layout.addRow(self.devices_disconnect_button)

        #Enable or disabel 
        if self.motion_connection.connected:
            UI_Functions.connection_label_message(self, self.motion_connection, "Connected")
            UI_Functions.enable_disable__btn_ui(self, self.motion_connection, True)
            UI_Functions.enable_disable_attempt(self, self.motion_connection, False)
        else:
            UI_Functions.connection_label_message(self, self.motion_connection, "Not connected")
            UI_Functions.enable_disable__btn_ui(self, self.motion_connection, False)
            UI_Functions.enable_disable_attempt(self, self.motion_connection, True)

        if self.devices_connection.connected:
            UI_Functions.connection_label_message(self, self.devices_connection, "Connected")
            UI_Functions.enable_disable__btn_ui(self, self.devices_connection, True)
            UI_Functions.enable_disable_attempt(self, self.devices_connection, False)
        else:
            UI_Functions.connection_label_message(self, self.devices_connection, "Not connected")
            UI_Functions.enable_disable__btn_ui(self, self.devices_connection, False)
            UI_Functions.enable_disable_attempt(self, self.devices_connection, True)
        
        self.main_layout.addLayout(devices_connection_layout)
    
    def __connect_click(self, connection_type):

        #get info about ip and port from clinet
        if connection_type == self.motion_connection:
            info = self.__get_ip_port(self.motion_ip_line_edit, self.motion_port_line_edit)
        else:
            info = self.__get_ip_port(self.devices_ip_line_edit, self.devices_port_line_edit)

        #check value error
        if(not info[0]):
            UI_Functions.connection_error_ui(self, connection_type, "Invalid value")
            return
        
        #check does same value
        if self.devices_connection.connected and connection_type == self.motion_connection:
            if info[1] == self.devices_connection.IP and info[2] == self.devices_connection.Port:
                UI_Functions.connection_error_ui(self, connection_type, "Same values")
                return
        elif self.motion_connection.connected and connection_type == self.devices_connection:
            if info[1] == self.motion_connection.IP and info[2] == self.motion_connection.Port:
                UI_Functions.connection_error_ui(self, connection_type, "Same values")
                return

         #network connect
        if connection_type == self.motion_connection:
            self.motion_connection.Connect(info[1], info[2]) 
        else:
            self.devices_connection.Connect(info[1], info[2]) 

        UI_Functions.enable_disable_attempt(self,connection_type, False)
        if connection_type == self.motion_connection:
            self.motion_connection_process = True
        else:
            self.devices_connection_process = True
        
    def __disconnect_click(self, connection_type):

        #network connect
        if connection_type == self.motion_connection:
            self.motion_connection.Disconnect() 
        else:
            self.devices_connection.SendCommand("LRF_LRX20A", "str_LRF_Pointer_OFF")
            self.devices_connection.Disconnect()

        UI_Functions.enable_disable__btn_ui(self, connection_type, False)


    def __get_ip_port(self, ip_line_edit, port_line_edit):
        #get info from UI
        ip = ip_line_edit.text()
        if(not port_line_edit.text().isnumeric()):
            return (False, 0, 0)
        port = int(port_line_edit.text())

        return (True, ip, port)
    
    ####Connections events
    
    def successfully_connected(self, connection_type):
        UI_Functions.connection_label_message(self, connection_type, "Successfully connected")
        UI_Functions.enable_disable__btn_ui(self, connection_type, True)
        if connection_type == self.motion_connection:
            self.motion_connection_process = False
        else:
            self.devices_connection_process = False

    def connection_error(self, connection_type):
        UI_Functions.connection_error_ui(self, connection_type, "Connection error")
        if connection_type == self.motion_connection:
            self.motion_connection_process = False
        else:
            self.devices_connection_process = False

    def successfully_disconnected(self, connection_type):
        UI_Functions.connection_label_message(self, connection_type, "Disconnected")
        UI_Functions.enable_disable_attempt(self, connection_type, True)
        if connection_type == self.motion_connection:
            self.motion_connection_process = False
        else:
            self.devices_connection_process = False

    ####

    def closeEvent(self, event):
        if(self.motion_connection_process or self.devices_connection_process):
            event.ignore()
        

    def ConnectionUIshow(self):
        self.show()

    