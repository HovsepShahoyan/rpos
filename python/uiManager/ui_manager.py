import PySide6.QtWidgets as qtw
import PySide6.QtGui as qtg

from PySide6.QtCore import Qt, QSize, QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator, QScreen , QFont
from PySide6.QtWidgets import QApplication, QMainWindow


from   TCPCommunication.connection import Connection
from   uiManager.ui_conection_manager import ConnectionUI
from   uiManager.ui_camera_corrrection_manager import CameraCorrectionUI
from   uiManager.ui_correction_manager import CorrectionUI
from   uiManager.ui_camera_manager import CameraUI
from   uiManager.ui_az_el_correction_manager import AzElCorrectionUI

from  TCPDataParsing import data_parser
from  models.data_model import DataModel

from  uiManager.ui_functions import UI_Functions
from  helpers.gps_converter import GPSConverter

class UI_Manager(qtw.QWidget):
    def __init__(self, app, motion_connection : Connection, devices_connection : Connection):

        self.motion_connection = motion_connection
        self.devices_connection = devices_connection

        self.data_model = DataModel()

        self.num_regex = QRegularExpression(r'[+-]?\d*$')  # Regex for numbers only
        self.float_regex = QRegularExpression(r"[-+]?\d*\.?\d+")  # Regex for float only

        #network signals
        self.motion_connection.network.connected.connect(lambda: self.successfully_connected(self.motion_connection))
        self.devices_connection.network.connected.connect(lambda: self.successfully_connected(self.devices_connection))

        self.motion_connection.network.errorOccurred.connect(lambda: self.connection_error(self.motion_connection))
        self.devices_connection.network.errorOccurred.connect(lambda: self.connection_error(self.devices_connection))
        
        self.motion_connection.network.disconnected.connect(lambda: self.successfully_disconnected(self.motion_connection))
        self.devices_connection.network.disconnected.connect(lambda: self.successfully_disconnected(self.devices_connection))

        self.motion_connection.network.dataReceived.connect(self.__motion_data_received)
        self.devices_connection.network.dataReceived.connect(self.__devices_data_received)

        super().__init__()
        
        self.__window_style()
        self.main_layout = qtw.QGridLayout()
        
        self.motion_setter_widgets = []
        self.devices_setter_widgets = []
    

        self.__data_layout()
        self.__step_motor_layout()
        self.__devices_data_layout()
        self.__info_and_joystick_layout()
        self.__camera_control_layout()
        self.__LRF_control_layout()
        self.__correction_settings_layout()
        self.__camera_open_close_layout()

        self.__enable_disable_motion_data_ui(False)
        self.__enable_disable_devices_data_ui(False)

        self.__set_defalult_data()
        self.data_model.propertyChanged.connect(self.data_model_property_changed)

        self.connectionUI = ConnectionUI(self.motion_connection, self.devices_connection)
        self.camera_correctionUI = CameraCorrectionUI(self.devices_connection, self.data_model)
        self.correctionUI = CorrectionUI()
        self.az_el_correctionUI = AzElCorrectionUI(self.motion_connection)
        self.cameraUI = CameraUI(self, self.camera_correctionUI, app)

        #self.data_model.set_el_enc_crct(self.devices_connection) #TODO
        self.setLayout(self.main_layout)

    def data_model_property_changed(self, key, value):
        if key == 'LRF_BlndZn':
            self.__set_LRF_self_check_data_ui()
        elif key == 'LRF_Range_3':
            self.__set_LRF_distance_ui()

    def __connections_click(self):
        self.connectionUI.ConnectionUIshow()

    def __window_style(self):
        self.setWindowTitle("3D_01_TESTER_MainWindow")
        center = QScreen.availableGeometry(QApplication.primaryScreen()).center()
        self.setFixedSize(800, 1000)
        x = (center.x() - self.width()/2) 
        y = (center.y() - self.height()/2) 
        self.move(x, y)

    ####events
    def successfully_connected(self, connection_type):
        ########Test TODO
        if connection_type == self.motion_connection:
            #self.data_model.set_el_enc_crct(connection_type)
            connection_type.SendCommand("stmd", "str_Polling_STMD_On")
            connection_type.SendCommand("sns", "str_Polling_Sensors_On")
            self.__enable_disable_motion_data_ui(True)
            for motion_setter in self.motion_setter_widgets:
                if isinstance(motion_setter[0], qtw.QComboBox):
                    motion_setter[0].activated.emit(motion_setter[0].currentIndex())
                elif isinstance(motion_setter[0], qtw.QLineEdit) and motion_setter[1]:
                    motion_setter[0].textChanged.emit(motion_setter[0].text())
                elif isinstance(motion_setter[0], qtw.QCheckBox):
                    motion_setter[0].stateChanged.emit(motion_setter[0].isChecked())
        else:
            connection_type.SendCommand("sns_od", "str_Polling_Sensors_On")
            connection_type.SendCommand("Correct_constOD", "str_CC_set_get_full_CC")
            self.laser_on_off.setChecked(False)
            self.__enable_disable_devices_data_ui(True)
            for devices_setter in self.devices_setter_widgets:
                if isinstance(devices_setter[0], qtw.QComboBox):
                    devices_setter[0].activated.emit(devices_setter[0].currentIndex())
                elif isinstance(devices_setter[0], qtw.QLineEdit) and devices_setter[1]:
                    devices_setter[0].textChanged.emit(devices_setter[0].text())
                elif isinstance(devices_setter[0], qtw.QCheckBox):
                    devices_setter[0].stateChanged.emit(devices_setter[0].isChecked())
            
        ########

    def successfully_disconnected(self, connection_type):
        connection_type.connected = True
        if(connection_type == self.motion_connection):
            self.motion_received_data_textbox.setPlainText("Disconnected")
            #self.motion_received_sns_data_textbox.setPlainText("Disconnected")
        else:
            self.motion_received_data_textbox.setPlainText("Disconnected")
        ########Test TODO
        if connection_type == self.motion_connection:
            connection_type.SendCommand("stmd", "str_Polling_STMD_Off")
            connection_type.SendCommand("sns", "str_Polling_Sensors_Off")
            self.__clear_motion_data_ui()
            
        else:
            connection_type.SendCommand("sns_od", "str_Polling_Sensors_Off")
            self.laser_on_off.setChecked(False)
            self.__clear_devices_data_ui()
        ########

    def connection_error(self, connection_type):
        if(connection_type == self.motion_connection):
            self.motion_received_data_textbox.setPlainText("Connection error")
            #self.motion_received_sns_data_textbox.setPlainText("Connection error")
            self.__clear_motion_data_ui()
        else:
            self.motion_received_data_textbox.setPlainText("Connection error")
            self.__clear_devices_data_ui()

    def __motion_data_received(self, data_str: str):
        mode = self.__set_data_model(data_str) #parse data and set data in data model
        self.__textbox_append_txt(data_str)
        #if mode != "Sns":
            #self.motion_received_data_textbox.setPlainText(data_str)
        #elif mode == "Sns":
            #pass
            #self.motion_received_data_textbox.setPlainText(data_str)
        self.__set_motion_data_ui()
    def __devices_data_received(self, data_str: str):
        mode = self.__set_data_model(data_str) #parse data and set data in data model
        #self.devices_received_data_textbox.setPlainText(data_str)
        self.__textbox_append_txt(data_str)
        if mode == "Sns_OD":
            self.camera_correctionUI.ui_progressbar_manager.progress_bar.setValue(0)
            self.__set_devices_data_ui()
        elif mode == "Correct_constOD":
            if "CC_DCm_b" in data_str:
                self.camera_correctionUI.ui_progressbar_manager.progress_bar.setValue(self.camera_correctionUI.ui_progressbar_manager.progress_bar.value() + 100.0/(len(self.data_model.getDefValue("zoom_fixed_day")) * 2))
            else:
                self.camera_correctionUI.ui_progressbar_manager.progress_bar.setValue(self.camera_correctionUI.ui_progressbar_manager.progress_bar.value() + 100.0/(len(self.data_model.getDefValue("zoom_fixed_IR")) * 2))
            if self.camera_correctionUI.ui_progressbar_manager.progress_bar.value() >= 90:
                self.camera_correctionUI.ui_progressbar_manager.close()
    ####

    #### set, clear and send data
    def __set_data_model(self, data_str):
        data_dict = data_parser.parse_data(data_str)
        if "GPS_0" in data_dict[1]:
            gps = GPSConverter.convertRawGPSData(data_dict[1])
            self.data_model.setProperty('GPS_Lat', gps['Latitude'])
            self.data_model.setProperty('GPS_Lng', gps['Longitude'])
            self.data_model.setProperty('GPS_Alt', gps['Altitude'])
            self.data_model.setProperty('GPS_Time', gps['Time'])

        for key in data_dict[1]:
            self.data_model.setProperty(key, data_dict[1][key])
        return data_dict[0]

    def __send_command_apply_lineedit_event(self, connection_type, module, command, line_edit, regex, elaboration, minmax = None):
        data = line_edit.text()
        if len(data) == 0:
            return
        if data[0] == '-' and not data[1:].replace('.', '').isnumeric():
            return
        if data[0] != '-' and not data.replace('.', '').isnumeric():
            return
        if not connection_type.connected:
            return
        
        if minmax is not None:
            data_num = float(data)
            if minmax[0] > data_num or minmax[1] < data_num:
                UI_Functions.show_error_messagebox("Out of range")
                return

        if elaboration is not None:
            data = str(elaboration(float(data)))
        if command == "str_DeyCam_set_zoom":
            self.data_model.zoom_day_camera(self.devices_connection, data)
            return
        connection_type.SendCommand(module, command, data)

    def _send_command_apply_checkbox_event(self, connection_type, module, command_checked, unchecked_command, checkbox):
        if checkbox.isChecked():
            connection_type.SendCommand(module, command_checked)
        else:
            connection_type.SendCommand(module, unchecked_command)

    def _send_command_apply_combobox_event(self, index, connection_type, module, command, values):
        if command == 'str_IRCam_set_zoom':
            self.data_model.zoom_IR_camera(self.devices_connection, index + 1)
            return
        
        connection_type.SendCommand(module, command, values[index][1])

    def __set_motion_data_ui(self):
        #Encoder az
        self.encoder_az_value_widget[1].setText(str(self.data_model.getProperty("Encoder_Az")))    
        self.encoder_az_degree_widget[1].setText(str(self.data_model.encoder_az2degree(int(self.data_model.getProperty("Encoder_Az")))))    
        self.encoder_az_corrected_widget[1].setText(str(self.data_model.getProperty("Enc_Az_crct")))    
        self.current_position_az_widget[1].setText(str(self.data_model.getProperty("curr_pos_Az")))    

        #Encoder el
        self.encoder_el_value_widget[1].setText(str(self.data_model.getProperty("Encoder_El")))    
        self.encoder_el_degree_widget[1].setText(str(self.data_model.encoder_el2degree(int(self.data_model.getProperty("Encoder_El")))))    
        self.encoder_el_corrected_widget[1].setText(str(self.data_model.getProperty("Enc_El_crct")))    
        self.current_position_el_widget[1].setText(str(self.data_model.getProperty("curr_pos_El")))  

        #GPS
        self.latitude_widget[1].setText(str(self.data_model.getProperty("GPS_Lat"))),
        self.longitude_widget[1].setText(str(self.data_model.getProperty("GPS_Lng"))),
        self.altitude_widget[1].setText(str(self.data_model.getProperty("GPS_Alt"))),
        self.time_widget[1].setText(str(self.data_model.getProperty("GPS_Time"))),
    
        #Board info
        board_volt = round(int(self.data_model.getProperty("board_volt")) / 100, 2)
        self.board_volt_widget[1].setText(str(board_volt)),
        MC_Tmpr_ADC = round(int(self.data_model.getProperty("MC_Tmpr_ADC")) / 100, 2)
        self.mc_temp_widget[1].setText(str(MC_Tmpr_ADC))
    
    def __set_devices_data_ui(self):
        #compass
        cmps_ag = round(int(self.data_model.getProperty("cmps_ag")) / 100, 2)
        self.compass_angle_widget[1].setText(str(cmps_ag))

        #inclinometer
        incl_X_ag = round(int(self.data_model.getProperty("incl_X_ag")) / 1000, 3)
        self.inclinometer_ax_x_widget[1].setText(str(incl_X_ag))

        T_incl_X_ag = round(int(self.data_model.getProperty("T_incl_X_ag")) / 1000, 3)
        self.inclinometer_ax_x_corrected_widget[1].setText(str(T_incl_X_ag))

        incl_Y_ag = round(int(self.data_model.getProperty("incl_Y_ag")) / 1000, 3)
        self.inclinometer_ax_y_widget[1].setText(str(incl_Y_ag))

        T_incl_Y_ag = round(int(self.data_model.getProperty("T_incl_Y_ag")) / 1000, 3)
        self.inclinometer_ax_y_corrected_widget[1].setText(str(T_incl_Y_ag))

        inclinometer_temp = round(int(self.data_model.getProperty("incl_t")) / 10, 1)
        self.inclinometer_temp_widget[1].setText(str(inclinometer_temp)),
    
    def __set_LRF_self_check_data_ui(self):
        volt_3_3 = round(int(self.data_model.getProperty("LRF_3.3V")) / 10, 1)
        volt_5 = round(int(self.data_model.getProperty("LRF_5V")) / 10, 1)
        volt_hv = round(int(self.data_model.getProperty("LRF_HV")) / 10, 1)
        volt_bat = round(int(self.data_model.getProperty("LRF_BatV")) / 10, 1)
        temp = round(int(self.data_model.getProperty("LRF_Tempr")) / 10, 1)
        self.LRF_textbox.setPlainText(f'3.3V = {volt_3_3}v,\n5V = {volt_5}v,\nHV = {volt_hv}v,\nBatV = {volt_bat}v,\nTemp = {temp}°C')

        self.blind_zone_widget[1].setText(str(self.data_model.getProperty("LRF_BlndZn")))
    
    def __set_LRF_distance_ui(self):
        value = [int(self.data_model.getProperty("LRF_Range_1")), int(self.data_model.getProperty("LRF_Range_2")), int(self.data_model.getProperty("LRF_Range_3"))]
        self.measurement_value_widget[1].setText(str(max(value)))

    def __clear_motion_data_ui(self):

        motion_line_edits = [
            #Encoder az
            self.encoder_az_value_widget[1],
            self.encoder_az_degree_widget[1],
            self.encoder_az_corrected_widget[1],
            self.current_position_az_widget[1],
            #Encoder el
            self.encoder_el_value_widget[1],
            self.encoder_el_degree_widget[1],
            self.encoder_el_corrected_widget[1],
            self.current_position_el_widget[1],
            #GPS
            self.longitude_widget[1],
            self.latitude_widget[1],
            self.altitude_widget[1],
            self.time_widget[1],
            #Board Info
            self.board_volt_widget[1],
            self.mc_temp_widget[1]
        ]
        
        for item in motion_line_edits:
            item.setText("0")
        
        self.__enable_disable_motion_data_ui(False)

    def __clear_devices_data_ui(self):
        devices_line_edits = [
            #Compass
            self.compass_angle_widget[1],
            #Inclinometer
            self.inclinometer_ax_x_widget[1],
            self.inclinometer_ax_x_corrected_widget[1],
            self.inclinometer_ax_y_widget[1],
            self.inclinometer_ax_y_corrected_widget[1],
            self.inclinometer_temp_widget[1],
            #self.inquiry_zoom_widget[1],
            #LRF
            self.measurement_value_widget[1],
            self.blind_zone_widget[1]
        ]
        
        for item in devices_line_edits:
            if item is not None:
                item.setText("0")

        self.__enable_disable_devices_data_ui(False)

    def __enable_disable_motion_data_ui(self, enable):
        for item in self.motion_setter_widgets:
            item[0].setEnabled(enable)
        self.left.setEnabled(enable)
        self.right.setEnabled(enable)
        self.set_null.setEnabled(enable)
        self.up.setEnabled(enable)
        self.down.setEnabled(enable)
    def __enable_disable_devices_data_ui(self, enbale):
        for item in self.devices_setter_widgets:
            item[0].setEnabled(enbale)

    def __stop_az_el(self):
        if not self.move_by_lsb.isChecked():
            self.motion_connection.SendCommand("stmd", "str_STMD_stop_El")
            self.motion_connection.SendCommand("stmd", "str_STMD_stop_Az")
    def __az_el_set_null(self):
        self.data_model.set_null_point(self.motion_connection)
    
    def __set_defalult_data(self):
        text = "Azimuth:\n"
        text += f'1 lsb={self.data_model.getDefValue("encoder_az2degree")}°\n'
        text += f'1°={round(1/self.data_model.getDefValue("encoder_az2degree"), 5)}lsb\n'
        text += f'1 st.={round(self.data_model.getDefValue("step_az2degree"),7)}°\n'
        text += f'1°={round(1/self.data_model.getDefValue("step_az2degree"), 5)} st.\n'

        text += "\nElevation:\n"
        text += f'1 lsb={self.data_model.getDefValue("encoder_el2degree")}°\n'
        text += f'1° = {round(1/self.data_model.getDefValue("encoder_el2degree"), 5)}lsb\n'
        text += f'1 st.={self.data_model.getDefValue("step_el2degree")}°\n'
        text += f'1°={round(1/self.data_model.getDefValue("step_el2degree"), 5)} st.\n'
        self.info_data_textbox.setPlainText(text)
    ####

    ####Layouts

    def __data_layout(self):
        self.data_layout = qtw.QVBoxLayout()

        connections_button = qtw.QPushButton("Connections")
        connections_button.clicked.connect(self.__connections_click)
        self.data_layout.addWidget(connections_button)

        motion_received_data_label = qtw.QLabel("Motion received data")
        motion_received_data_label.setStyleSheet("border: 0px;")
        self.data_layout.addWidget(motion_received_data_label)

        motion_receive_and_info_layout  = qtw.QHBoxLayout()
        
        self.motion_received_data_textbox = qtw.QPlainTextEdit("Disconnected")
        self.motion_received_data_textbox.setReadOnly(True)
        self.motion_received_data_textbox.setStyleSheet("height: 300px;")
        motion_receive_and_info_layout.addWidget(self.motion_received_data_textbox)

        #self.motion_received_sns_data_textbox = qtw.QPlainTextEdit("Disconnected")
        #self.motion_received_sns_data_textbox.setReadOnly(True)
        #self.motion_received_sns_data_textbox.setStyleSheet("height: 140px;")
        #motion_receive_and_info_layout.addWidget(self.motion_received_sns_data_textbox)

        self.data_layout.addLayout(motion_receive_and_info_layout)


        devices_received_data_label = qtw.QLabel("Devices received data")
        devices_received_data_label.setStyleSheet("border: 0px;")
        

        self.data_layout.addWidget(devices_received_data_label)

        devices_data_layout = qtw.QHBoxLayout()

        # self.devices_received_data_textbox = qtw.QPlainTextEdit("Disconnected")
        # self.devices_received_data_textbox.setReadOnly(True)
        # self.devices_received_data_textbox.setStyleSheet("height: 50px;")
        # devices_data_layout.addWidget(self.devices_received_data_textbox)
        
        
        self.data_layout.addLayout(devices_data_layout)

        self.main_layout.addLayout(self.data_layout, 0, 0)

    def __step_motor_layout(self):
        self.step_motor_layout = qtw.QVBoxLayout()

        ##########
        step_motor_az_layout = qtw.QVBoxLayout()

        step_motor_az_first_row = qtw.QHBoxLayout()
        step_motor_az_label = qtw.QLabel("Step Motor Az")
        az_accel_widget = self.__Qlineedit_sendcommand("Accel", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_acceleration_Az", True, None, self.num_regex, self.data_model.getDefValue("accel_az"), minmax=self.data_model.getDefValue("accel_az_range"))
        az_accel_min_freq_widget = self.__Qlineedit_sendcommand("Min freq", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_min_frequency_Az", True, None, self.num_regex, self.data_model.getDefValue("min_freq_az"), minmax=self.data_model.getDefValue("min_freq_az_range"))
        az_accel_max_freq_widget = self.__Qlineedit_sendcommand("Max freq", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_max_frequency_Az", True, None, self.num_regex, self.data_model.getDefValue("max_freq_az"), minmax=self.data_model.getDefValue("max_freq_az_range"))
        
        step_motor_az_first_row.addWidget(step_motor_az_label)
        step_motor_az_first_row.addLayout(az_accel_widget[0])
        step_motor_az_first_row.addLayout(az_accel_min_freq_widget[0])
        step_motor_az_first_row.addLayout(az_accel_max_freq_widget[0])

        step_motor_az_layout.addLayout(step_motor_az_first_row)

        self.encoder_az_value_widget = self.__readonly_Qlineedit("Encoder")
        self.encoder_az_degree_widget = self.__readonly_Qlineedit("Degree°")
        self.encoder_az_corrected_widget = self.__readonly_Qlineedit("Corrected encoder")
        self.current_position_az_widget = self.__readonly_Qlineedit("Current position")

        task_encoder_bydegree_az_widget = self.__Qlineedit_sendcommand("Task by degree°", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_encoder_Az", False, self.data_model.degree2encoder_az, self.float_regex, minmax=self.data_model.getDefValue("degree_az_range"))
        #task_encoder_bystep_az_widget = self.__Qlineedit_sendcommand("Step °", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_Az", False, self.data_model.degree2step_az, self.num_regex)


        task_encoder_az_widget = self.__Qlineedit_sendcommand("Task By Enc.", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_encoder_Az", False, None, self.num_regex, minmax=self.data_model.getDefValue("encoder_az_range"))
        task_step_az_widget = self.__Qlineedit_sendcommand("Task By Step.", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_Az", False, None, self.num_regex, minmax=self.data_model.getDefValue("step_az_range"))

        encoder_az_degree_layout = qtw.QHBoxLayout()
        encoder_az_degree_layout.addLayout(self.encoder_az_value_widget[0])
        encoder_az_degree_layout.addLayout(self.encoder_az_degree_widget[0])
        encoder_az_degree_layout.addLayout(task_encoder_az_widget[0])
        step_motor_az_layout.addLayout(encoder_az_degree_layout)

        encoder_az_corrected_layout = qtw.QHBoxLayout()
        encoder_az_corrected_layout.addLayout(self.encoder_az_corrected_widget[0])
        encoder_az_corrected_layout.addLayout(task_encoder_bydegree_az_widget[0])
        #encoder_az_corrected_layout.addLayout(task_encoder_bystep_az_widget[0])
        step_motor_az_layout.addLayout(encoder_az_corrected_layout)

        task_step_az_layout = qtw.QHBoxLayout()
        task_step_az_layout.addLayout(self.current_position_az_widget[0])
        task_step_az_layout.addLayout(task_step_az_widget[0])
        step_motor_az_layout.addLayout(task_step_az_layout)

        self.step_motor_layout.addLayout(step_motor_az_layout)

        ############

        ############
        step_motor_el_layout = qtw.QVBoxLayout()

        step_motor_el_first_row = qtw.QHBoxLayout()

        step_motor_el_label = qtw.QLabel("Step Motor El")
        el_accel_widget = self.__Qlineedit_sendcommand("Accel", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_acceleration_El", True, None, self.num_regex, self.data_model.getDefValue("accel_el"), minmax=self.data_model.getDefValue("accel_el_range"))
        el_accel_min_freq_widget = self.__Qlineedit_sendcommand("Min freq", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_min_frequency_El", True, None, self.num_regex, self.data_model.getDefValue("min_freq_el"), minmax=self.data_model.getDefValue("min_freq_el_range"))
        el_accel_max_freq_widget = self.__Qlineedit_sendcommand("Max freq", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_max_frequency_El", True, None, self.num_regex, self.data_model.getDefValue("max_freq_el"), minmax=self.data_model.getDefValue("max_freq_el_range"))
        
        step_motor_el_first_row.addWidget(step_motor_el_label)
        step_motor_el_first_row.addLayout(el_accel_widget[0])
        step_motor_el_first_row.addLayout(el_accel_min_freq_widget[0])
        step_motor_el_first_row.addLayout(el_accel_max_freq_widget[0])

        step_motor_el_layout.addLayout(step_motor_el_first_row)

        self.encoder_el_value_widget = self.__readonly_Qlineedit("Encoder")
        self.encoder_el_degree_widget = self.__readonly_Qlineedit("Degree°")
        self.encoder_el_corrected_widget = self.__readonly_Qlineedit("Corrected encoder")
        self.current_position_el_widget = self.__readonly_Qlineedit("Current position")

        task_encoder_bydegree_el_widget = self.__Qlineedit_sendcommand("Task by degree°", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_encoder_El", False, self.data_model.degree2encoder_el, self.float_regex, minmax=self.data_model.getDefValue("degree_el_range"))
        #task_encoder_bystep_el_widget = self.__Qlineedit_sendcommand("Step °", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_El", False, self.data_model.degree2step_el, self.num_regex)

        task_encoder_el_widget = self.__Qlineedit_sendcommand("Task By Enc.", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_encoder_El", False, None, self.num_regex, minmax=self.data_model.getDefValue("encoder_el_range"))
        task_step_el_widget = self.__Qlineedit_sendcommand("Task By Step.", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_El", False, None, self.num_regex, minmax=self.data_model.getDefValue("step_el_range"))

        encoder_el_degree_layout = qtw.QHBoxLayout()
        encoder_el_degree_layout.addLayout(self.encoder_el_value_widget[0])
        encoder_el_degree_layout.addLayout(self.encoder_el_degree_widget[0])
        encoder_el_degree_layout.addLayout(task_encoder_el_widget[0])
        step_motor_el_layout.addLayout(encoder_el_degree_layout)

        encoder_el_corrected_layout = qtw.QHBoxLayout()
        encoder_el_corrected_layout.addLayout(self.encoder_el_corrected_widget[0])
        encoder_el_corrected_layout.addLayout(task_encoder_bydegree_el_widget[0])
        #encoder_el_corrected_layout.addLayout(task_encoder_bystep_el_widget[0])
        step_motor_el_layout.addLayout(encoder_el_corrected_layout)

        task_step_el_layout = qtw.QHBoxLayout()
        task_step_el_layout.addLayout(self.current_position_el_widget[0])
        task_step_el_layout.addLayout(task_step_el_widget[0])
        step_motor_el_layout.addLayout(task_step_el_layout)
        
        self.step_motor_layout.addLayout(step_motor_el_layout)

        ############

        self.main_layout.addLayout(self.step_motor_layout, 0, 1, Qt.AlignmentFlag.AlignTop)
    
    def __devices_data_layout(self):
        self.devices_data_layout = qtw.QHBoxLayout()

        compass_data_layout = qtw.QVBoxLayout()
        compass_label = qtw.QLabel("Compass")
        compass_data_layout.addWidget(compass_label)

        self.compass_angle_widget = self.__readonly_Qlineedit("Angle")
        self.compass_angle_widget[1].setMaximumWidth(90)
        compass_data_layout.addLayout(self.compass_angle_widget[0])

        self.compass_corrected_angle_widget = self.__readonly_Qlineedit("Corrected(15 C°)")
        self.compass_corrected_angle_widget[1].setMaximumWidth(90)
        compass_data_layout.addLayout(self.compass_corrected_angle_widget[0])

        compass_data_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        #on_off_compass = self.__QCheckBox_sendcommand("On/Off cmps", self._send_command_apply_checkbox_event, self.devices_connection, "sns_od", "TestCommand1", "TestCommand2")
        #compass_data_layout.addWidget(on_off_compass)
        compass_data_layout.setContentsMargins(0,0,10, 25)

        inclinometer_layout = qtw.QVBoxLayout()
        inclinometer_label = qtw.QLabel("Inclinometer")
        inclinometer_layout.addWidget(inclinometer_label)

        inclinometer_ax_x_layout = qtw.QHBoxLayout()
        self.inclinometer_ax_x_widget = self.__readonly_Qlineedit("Ax.X(El)")
        self.inclinometer_ax_x_widget[1].setMaximumWidth(90)
        inclinometer_ax_x_layout.addLayout(self.inclinometer_ax_x_widget[0])
        self.inclinometer_ax_x_corrected_widget = self.__readonly_Qlineedit("Corrected")
        self.inclinometer_ax_x_corrected_widget[1].setMaximumWidth(90)
        inclinometer_ax_x_layout.addLayout(self.inclinometer_ax_x_corrected_widget[0])

        inclinometer_ax_y_layout = qtw.QHBoxLayout()
        self.inclinometer_ax_y_widget = self.__readonly_Qlineedit("Ax.Y(Az)")
        self.inclinometer_ax_y_widget[1].setMaximumWidth(90)
        inclinometer_ax_y_layout.addLayout(self.inclinometer_ax_y_widget[0])
        self.inclinometer_ax_y_corrected_widget = self.__readonly_Qlineedit("Corrected")
        self.inclinometer_ax_y_corrected_widget[1].setMaximumWidth(90)
        inclinometer_ax_y_layout.addLayout(self.inclinometer_ax_y_corrected_widget[0])

        inclinometer_third_layout = qtw.QHBoxLayout()
        self.inclinometer_temp_widget = self.__readonly_Qlineedit("Temperature")
        self.inclinometer_temp_widget[1].setMaximumWidth(90)
        inclinometer_third_layout.addLayout(self.inclinometer_temp_widget[0])
        inclinometer_task_widget= self.__Qlineedit_sendcommand("Task Elevation", self.__send_command_apply_lineedit_event, self.motion_connection, "stmd", "str_STMD_set_turget_position_inclinometer_El", False, self.data_model.inlinometer2elevation, self.float_regex, minmax=self.data_model.getDefValue("inclinometer_el_range"))
        inclinometer_task_widget[1].setMaximumWidth(70)
        inclinometer_third_layout.addLayout(inclinometer_task_widget[0])
        
        inclinometer_layout.setContentsMargins(0,0,10, 0)

        inclinometer_layout.addLayout(inclinometer_ax_x_layout)
        inclinometer_layout.addLayout(inclinometer_ax_y_layout)
        inclinometer_layout.addLayout(inclinometer_third_layout)

        gps_layout = qtw.QVBoxLayout()
        gps_label = qtw.QLabel("GPS")
        gps_layout.addWidget(gps_label, alignment=Qt.AlignmentFlag.AlignTop)

        coordinates_layout = qtw.QHBoxLayout()
        self.latitude_widget = self.__readonly_Qlineedit("Latitude")
        self.latitude_widget[1].setMaximumWidth(90)
        coordinates_layout.addLayout(self.latitude_widget[0])
        self.longitude_widget = self.__readonly_Qlineedit("Longitude")
        self.longitude_widget[1].setMaximumWidth(90)
        coordinates_layout.addLayout(self.longitude_widget[0])

        altitude_time_layout = qtw.QHBoxLayout()
        self.altitude_widget = self.__readonly_Qlineedit("Altitude")
        self.altitude_widget[1].setMaximumWidth(90)
        altitude_time_layout.addLayout(self.altitude_widget[0])
        self.time_widget = self.__readonly_Qlineedit("Time")
        self.time_widget[1].setMaximumWidth(90)
        altitude_time_layout.addLayout(self.time_widget[0])


        gps_layout.addLayout(coordinates_layout)
        gps_layout.addLayout(altitude_time_layout)
        gps_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.devices_data_layout.addLayout(compass_data_layout)
        self.devices_data_layout.addLayout(inclinometer_layout)
        self.devices_data_layout.addLayout(gps_layout)

        self.main_layout.addLayout(self.devices_data_layout, 1, 0, Qt.AlignmentFlag.AlignLeft)
    
    def __info_and_joystick_layout(self):
        info_and_joystick_layout = qtw.QVBoxLayout()
        
        self.move_by_lsb = qtw.QCheckBox("Move 3 lsb")
        info_and_joystick_layout.addWidget(self.move_by_lsb, alignment= Qt.AlignmentFlag.AlignRight)

        infobox_and_joystick_layout = qtw.QHBoxLayout()

        self.info_data_textbox = qtw.QPlainTextEdit("Info")
        self.info_data_textbox.setReadOnly(True)
        self.info_data_textbox.setMaximumWidth(150)

        infobox_and_joystick_layout.addWidget(self.info_data_textbox)

        joystick_vertical_layout = qtw.QVBoxLayout()

        self.up = qtw.QPushButton("↑")
        self.up.pressed.connect(self.__up_pressed)
        self.up.released.connect(self.__stop_az_el)
        self.up.setFixedWidth(25)
        #self.up.setFixedHeight(20)
        joystick_vertical_layout.addWidget(self.up, alignment=Qt.AlignmentFlag.AlignCenter)

        left_right_layout = qtw.QHBoxLayout()
        self.left = qtw.QPushButton("←")
        #self.left.clicked.connect(lambda :  if self.move_by_lsb.isChecked():self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_Az", int(self.data_model.getProperty("Encoder_Az")) - 1))
        self.left.pressed.connect(self.__left_pressed)
        self.left.released.connect(self.__stop_az_el)
        self.left.setFixedWidth(25)
        #self.left.setFixedHeight(20)
        left_right_layout.addWidget(self.left)
        self.set_null = qtw.QPushButton("o")
        self.set_null.pressed.connect(self.__az_el_set_null)
        self.set_null.setFixedWidth(25)
        #self.set_null.setFixedHeight(20)
        left_right_layout.addWidget(self.set_null)
        self.right = qtw.QPushButton("→")
        self.right.pressed.connect(self.__right_pressed)
        self.right.released.connect(self.__stop_az_el)
        self.right.setFixedWidth(25)
        #self.right.setFixedHeight(20)
        left_right_layout.addWidget(self.right)
        joystick_vertical_layout.addLayout(left_right_layout)

        self.down = qtw.QPushButton("↓")
        self.down.pressed.connect(self.__down_pressed)
        self.down.released.connect(self.__stop_az_el)
        self.down.setFixedWidth(25)
        #self.down.setFixedHeight(20)
        joystick_vertical_layout.addWidget(self.down, alignment=Qt.AlignmentFlag.AlignCenter)
        joystick_vertical_layout.setAlignment(Qt.AlignmentFlag.AlignRight)

        infobox_and_joystick_layout.addLayout(joystick_vertical_layout)

        info_and_joystick_layout.addLayout(infobox_and_joystick_layout)

        first_row_layout = qtw.QHBoxLayout()
    
        self.mc_temp_widget = self.__readonly_Qlineedit("MC Temp.")
        self.mc_temp_widget[1].setMaximumWidth(90)
        first_row_layout.addLayout(self.mc_temp_widget[0])
        self.board_volt_widget = self.__readonly_Qlineedit("Board Volt")
        self.board_volt_widget[1].setMaximumWidth(90)
        first_row_layout.addLayout(self.board_volt_widget[0])
        #on_off_motor = self.__QCheckBox_sendcommand("On/Off motors", self._send_command_apply_checkbox_event, self.motion_connection, "stmd", "str_STMD_on", "str_STMD_off")
        motor_off_button = qtw.QPushButton("Motors Off")
        motor_off_button.clicked.connect(lambda : self.motion_connection.SendCommand("stmd", "str_STMD_off"))
        self.motion_setter_widgets.append((motor_off_button, False))
        first_row_layout.addWidget(motor_off_button, alignment=Qt.AlignmentFlag.AlignBottom)

        info_and_joystick_layout.addLayout(first_row_layout)

        self.main_layout.addLayout(info_and_joystick_layout, 1, 1, Qt.AlignmentFlag.AlignTop)
    
    def __camera_control_layout(self):
        camera_control_layout = qtw.QHBoxLayout()

        day_camera_control_layout = qtw.QVBoxLayout()
        day_camera_control_layout.setContentsMargins(0,10, 0, 0)

        day_camera_control_label = qtw.QLabel("Day Camera Control")
        day_camera_control_layout.addWidget(day_camera_control_label)

        zoom_layout = qtw.QHBoxLayout()
        
        zoom_in_button = qtw.QPushButton("+")
        zoom_in_button.pressed.connect(lambda : self.devices_connection.SendCommand("Dey_Camera", "str_DeyCam_zoom_tele"))
        zoom_in_button.released.connect(lambda : self.devices_connection.SendCommand("Dey_Camera", "str_DeyCam_zoom_stop"))
        zoom_out_button = qtw.QPushButton("-")
        zoom_out_button.pressed.connect(lambda : self.devices_connection.SendCommand("Dey_Camera", "str_DeyCam_zoom_wide"))
        zoom_out_button.released.connect(lambda : self.devices_connection.SendCommand("Dey_Camera", "str_DeyCam_zoom_stop"))
        
        zoom_layout.addWidget(zoom_in_button)
        zoom_layout.addWidget(zoom_out_button)

        day_camera_control_layout.addLayout(zoom_layout)

        set_zoom_widget= self.__Qlineedit_sendcommand("Set Zoom", self.__send_command_apply_lineedit_event, self.devices_connection, "Dey_Camera", "str_DeyCam_set_zoom", False, None, self.num_regex, minmax=self.data_model.getDefValue("zoom_range"))

        self.devices_setter_widgets.append((zoom_in_button, False))
        self.devices_setter_widgets.append((zoom_out_button, False))
        
        
        day_camera_control_layout.addLayout(set_zoom_widget[0])

        day_camera_control_layout.setAlignment(Qt.AlignmentFlag.AlignTop)

        #self.inquiry_zoom_widget = self.__QLineEdit_getcommand("INQUIRY Zoom", day_camera_control_layout, self.devices_connection, "Dey_Camera", "str_get_DeyCam_zoom_INQUIRY_data")

        camera_control_layout.addLayout(day_camera_control_layout)

        Ir_camera_control_layout = qtw.QVBoxLayout()
        Ir_camera_control_layout.setContentsMargins(15,10, 15, 0)

        Ir_camera_control_label = qtw.QLabel("IR Camera Control")
        Ir_camera_control_layout.addWidget(Ir_camera_control_label)

        IR_layout = qtw.QVBoxLayout()

        IR_settings_layout = qtw.QHBoxLayout()

        focus_layout = qtw.QVBoxLayout()

        focus_layout_label = qtw.QLabel("Focus")
        focus_layout_label.setStyleSheet("border: 0px;")
        focus_layout.addWidget(focus_layout_label)
        focus_far_button = qtw.QPushButton("+")
        focus_far_button.setFixedWidth(40)
        focus_far_button.pressed.connect(lambda : self.devices_connection.SendCommand("IR_Camera", "str_IRCam_Far_focusing"))
        focus_far_button.released.connect(lambda : self.devices_connection.SendCommand("IR_Camera", "str_IRCam_Stop_focusing"))
        focus_near_button = qtw.QPushButton("-")
        focus_near_button.setFixedWidth(40)
        focus_near_button.pressed.connect(lambda : self.devices_connection.SendCommand("IR_Camera", "str_IRCam_Near_focusing"))
        focus_near_button.released.connect(lambda : self.devices_connection.SendCommand("IR_Camera", "str_IRCam_Stop_focusing"))
        focus_layout.addWidget(focus_far_button)
        focus_layout.addWidget(focus_near_button)
        focus_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.devices_setter_widgets.append((focus_far_button, False))
        self.devices_setter_widgets.append((focus_near_button, False))

        IR_colors_layout = qtw.QVBoxLayout()

        birghtness_widget= self.__Qlineedit_sendcommand("Brightness", self.__send_command_apply_lineedit_event, self.devices_connection, "IR_Camera", "str_IRCam_set_brithness", True, None, self.num_regex, def_value=self.data_model.getDefValue("IR_brightness"), minmax=self.data_model.getDefValue("IR_brightness_range"))
        contrast_widget= self.__Qlineedit_sendcommand("Contrast", self.__send_command_apply_lineedit_event, self.devices_connection, "IR_Camera", "str_IRCam_set_contrast", True, None, self.num_regex, def_value=self.data_model.getDefValue("IR_contrast"), minmax=self.data_model.getDefValue("IR_contrast_range"))
        IR_colors_layout.setContentsMargins(10, 0, 0, 0)
        IR_colors_layout.addLayout(birghtness_widget[0])
        IR_colors_layout.addLayout(contrast_widget[0])
        IR_colors_layout.setAlignment(Qt.AlignmentFlag.AlignTop)

        IR_combobox_layout = qtw.QVBoxLayout()
        IR_zooms = []
        for zoom in self.data_model.getDefValue("zoom_fixed_IR"):
            IR_zooms.append((f"{zoom}x", zoom))
        IR_zoom_widget = self.__QComboBox_sendcommand("Zoom", self._send_command_apply_combobox_event, self.devices_connection, "IR_Camera", "str_IRCam_set_zoom", IR_zooms)
        IR_combobox_layout.addLayout(IR_zoom_widget[0])
        IR_zoom_widget[1].setFixedWidth(120)
        IR_combobox_layout.setAlignment(Qt.AlignmentFlag.AlignTop)

        IR_settings_layout.addLayout(focus_layout)
        IR_settings_layout.addLayout(IR_colors_layout)
        IR_settings_layout.addLayout(IR_combobox_layout)

        IR_layout.addLayout(IR_settings_layout)

        white_black_hot = self.__QCheckBox_sendcommand("White/Black hot", self._send_command_apply_checkbox_event, self.devices_connection, "IR_Camera", "str_IRCam_white_hot", "str_IRCam_black_hot")
        IR_layout.addWidget(white_black_hot)

        Ir_camera_control_layout.addLayout(IR_layout)
        Ir_camera_control_layout.setAlignment(Qt.AlignmentFlag.AlignTop)

        camera_control_layout.addLayout(Ir_camera_control_layout)

        self.main_layout.addLayout(camera_control_layout, 2, 0, Qt.AlignmentFlag.AlignTop)

    def __LRF_control_layout(self):
        LRF_control_layout = qtw.QVBoxLayout()
        
        LRF_control_label = qtw.QLabel("LRF control")
        LRF_control_layout.addWidget(LRF_control_label)

        self_check_layout = qtw.QHBoxLayout()

        button_blind_zone_layout = qtw.QVBoxLayout()
        
        self_check_button = qtw.QPushButton("Self check")
        self_check_button.clicked.connect(lambda : self.devices_connection.SendCommand("LRF_LRX20A", "str_LRF_Request_diagnostic_data"))
        self_check_button.setFixedHeight(25)
        self.devices_setter_widgets.append((self_check_button, False))
        button_blind_zone_layout.addWidget(self_check_button, alignment=Qt.AlignmentFlag.AlignTop)
        
        self.blind_zone_widget = self.__Qlineedit_sendcommand("Blind zone", self.__send_command_apply_lineedit_event, self.devices_connection, "LRF_LRX20A", "str_LRF_set_Minimum_Range", False, None, self.num_regex, minmax=self.data_model.getDefValue("LRF_range"))
        button_blind_zone_layout.addLayout(self.blind_zone_widget[0])

        self_check_layout.addLayout(button_blind_zone_layout)

        l = qtw.QVBoxLayout()
        
        self.LRF_textbox = qtw.QPlainTextEdit("LRF info")
        self.LRF_textbox.setReadOnly(True)
        self.LRF_textbox.setFixedHeight(50)

        l.addWidget(self.LRF_textbox, alignment=Qt.AlignmentFlag.AlignTop)

        self.laser_on_off = self.__QCheckBox_sendcommand("On/Off laser", self._send_command_apply_checkbox_event, self.devices_connection, "LRF_LRX20A", "str_LRF_Pointer_ON", "str_LRF_Pointer_OFF")
        l.addWidget(self.laser_on_off)

        self_check_layout.addLayout(l)

        LRF_control_layout.addLayout(self_check_layout)

        measurement_layout = qtw.QHBoxLayout()

        measure_button = qtw.QPushButton("Measure")
        measure_button.clicked.connect(self.__measure_button_click)
        self.devices_setter_widgets.append((measure_button, False))
        measurement_layout.addWidget(measure_button, alignment=Qt.AlignmentFlag.AlignBottom)

        self.measurement_value_widget = self.__readonly_Qlineedit("Distance")
        measurement_layout.addLayout(self.measurement_value_widget[0])

        measurment_mode_widget = self.__QComboBox_sendcommand("Mode", self._send_command_apply_combobox_event, self.devices_connection, "LRF_LRX20A", "--", self.data_model.getDefValue("LRF_measurement_mode"), test=True)
        measurement_layout.addLayout(measurment_mode_widget[0])
        measurment_mode_widget[1].setFixedWidth(120)

        LRF_control_layout.addLayout(measurement_layout)

        self.main_layout.addLayout(LRF_control_layout, 2, 1, alignment = Qt.AlignmentFlag.AlignTop)
        LRF_control_layout.setContentsMargins(0, 10, 0, 0)

    def __correction_settings_layout(self):
        correction_settings_layout = qtw.QVBoxLayout()

        correction_settings_label = qtw.QLabel("Correction settings")
        correction_settings_label.setFixedWidth(300)
        correction_settings_layout.addWidget(correction_settings_label)

        #self.devices_connection.SendCommand("Correct_constOD", "str_CC_set_get_full_CC")
        correction_const_layout = qtw.QHBoxLayout()

        correction_constcombobox_layout = qtw.QVBoxLayout()
        label = qtw.QLabel("Select correction")
        label.setStyleSheet("border: 0px;")
        correction_constcombobox_layout.addWidget(label, alignment=Qt.AlignmentFlag.AlignTop)
        
        self.correction_const_combobox = qtw.QComboBox()
        self.correction_const_combobox.setFixedWidth(150)
        self.correction_const_combobox.addItem("_____")
        self.correction_const_combobox.addItem("Compass Offset")
        #self.correction_const_combobox.addItem("H_V Correction")
        self.correction_const_combobox.addItem("Inclinometer X offset")
        self.correction_const_combobox.addItem("Inclinometer Y offset")
        self.correction_const_combobox.addItem("CC_err_angl_l")
        self.correction_const_combobox.addItem("CC_err_angl_k")
        self.correction_const_combobox.activated.connect(self.__correction_const_activated)
        self.devices_setter_widgets.append((self.correction_const_combobox, False))
        correction_constcombobox_layout.addWidget(self.correction_const_combobox, alignment=Qt.AlignmentFlag.AlignTop)
        correction_const_layout.addLayout(correction_constcombobox_layout)

        correction_const_input_layout = qtw.QHBoxLayout()
        self.correction_const_QLineEdit = qtw.QLineEdit()
        validator = QRegularExpressionValidator(self.float_regex, self)
        self.correction_const_QLineEdit.setValidator(validator)
        self.correction_const_QLineEdit.setFixedWidth(100)
        self.devices_setter_widgets.append((self.correction_const_QLineEdit, False))
        correction_const_input_layout.addWidget(self.correction_const_QLineEdit)

        correction_const_apply_btn = qtw.QPushButton()
        correction_const_apply_btn.setText(">")
        correction_const_apply_btn.setFixedSize(QSize(20, 20))
        correction_const_apply_btn.clicked.connect(self.__correction_const_apply_btn_clicked)
        self.devices_setter_widgets.append((correction_const_apply_btn, False))
        correction_const_input_layout.addWidget(correction_const_apply_btn)
        correction_const_input_layout.setContentsMargins(5, 22, 0, 0)
        correction_const_layout.addLayout(correction_const_input_layout)
        
        btns_layer = qtw.QVBoxLayout()

        camera_correction_button = qtw.QPushButton("Camera Corrections")
        camera_correction_button.clicked.connect(self.__camera_corrections_clicked)
        self.devices_setter_widgets.append((camera_correction_button, False))
        btns_layer.addWidget(camera_correction_button, alignment=Qt.AlignmentFlag.AlignLeft)

        btns_2_layer = qtw.QHBoxLayout()
        az_el_correction_button = qtw.QPushButton("Az El")
        az_el_correction_button.clicked.connect(self.__az_el_corrections_clicked)
        self.motion_setter_widgets.append((az_el_correction_button, False))
        btns_2_layer.addWidget(az_el_correction_button)

        corrections_button = qtw.QPushButton("Correcitons")
        corrections_button.clicked.connect(self.__corrections_clicked)
        self.motion_setter_widgets.append((corrections_button, False))

        btns_2_layer.addWidget(corrections_button)
        btns_layer.addLayout(btns_2_layer)

        correction_const_layout.addLayout(btns_layer)

        correction_const_layout.setAlignment(Qt.AlignmentFlag.AlignLeft)

        correction_settings_layout.addLayout(correction_const_layout)

        correction_settings_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.main_layout.addLayout(correction_settings_layout, 3, 0)
    
    def __camera_open_close_layout(self):
        camera_open_close_layout = qtw.QHBoxLayout()
        
        self.open_camera_button = qtw.QPushButton("Open Camera")
        self.close_camera_button = qtw.QPushButton("Close Camera")

        self.close_camera_button.setEnabled(False)

        self.open_camera_button.clicked.connect(self.__camera_open_clicked)
        self.close_camera_button.clicked.connect(self.__camera_close_clicked)

        camera_open_close_layout.addWidget(self.open_camera_button)
        camera_open_close_layout.addWidget(self.close_camera_button)
        
        self.main_layout.addLayout(camera_open_close_layout, 3, 1)

    ####

    #### Components

    #read only lineedit
    def __readonly_Qlineedit(self, label_text):
        layout = qtw.QVBoxLayout()
        label = qtw.QLabel(label_text)
        label.setStyleSheet("border: 0px;")
        layout.addWidget(label)
        line_edit = qtw.QLineEdit()
        line_edit.setReadOnly(True)
        line_edit.setFont(QFont("Arial", 14))
        line_edit.setFixedHeight(30)
        layout.addWidget(line_edit)

        return (layout, line_edit)
    
    #lineedit
    def __Qlineedit_sendcommand(self, label_text, apply, connection_type, module, command, text_changed, elaboration, regex = None, def_value = None, minmax = None) -> qtw.QLineEdit:
        layout = qtw.QVBoxLayout()
        label = qtw.QLabel(label_text)
        label.setStyleSheet("border: 0px;")
        layout.addWidget(label)

        line_edit_layout = qtw.QHBoxLayout()

        line_edit = qtw.QLineEdit()
        if regex is not None:
            validator = QRegularExpressionValidator(regex, self)
            line_edit.setValidator(validator)

        if minmax is not None:
            line_edit.setPlaceholderText(f"{minmax[0]}-{minmax[1]}")
        line_edit_layout.addWidget(line_edit)
        if not text_changed:
            apply_btn = qtw.QPushButton()
            apply_btn.setText(">")
            apply_btn.setFixedSize(QSize(20, 20))
            apply_btn.clicked.connect(lambda: apply(connection_type, module, command, line_edit, regex, elaboration, minmax))
            line_edit_layout.addWidget(apply_btn)
            if connection_type == self.motion_connection:
                self.motion_setter_widgets.append((apply_btn, False))
            else:
                self.devices_setter_widgets.append((apply_btn, False))
        else:
            line_edit.textChanged.connect(lambda: apply(connection_type, module, command, line_edit, regex, elaboration, minmax))

        if connection_type == self.motion_connection:
            self.motion_setter_widgets.append((line_edit, text_changed))
        else:
            self.devices_setter_widgets.append((line_edit, text_changed)) 

        if def_value is not None:
            line_edit.setText(str(def_value))

        layout.addLayout(line_edit_layout)

        line_edit.setFont(QFont("Arial", 14))
        line_edit.setFixedHeight(30)

        return (layout, line_edit)
    
    def __QLineEdit_getcommand(self, label_text, layout, connection_type, module, command):
        line_edit_layout = qtw.QHBoxLayout()
        line_edit = qtw.QLineEdit()
        line_edit.setReadOnly(True)
        line_edit_layout.addWidget(line_edit)

        get_button = qtw.QPushButton(label_text)
        get_button.clicked.connect(lambda : connection_type.SendCommand(module, command))
        get_button.setMaximumWidth(120)
        get_button.setMaximumHeight(25)
        line_edit_layout.addWidget(get_button)

        if connection_type == self.motion_connection:
            self.motion_setter_widgets.append((get_button, False))
        else:
            self.devices_setter_widgets.append((get_button, False)) 

        layout.addLayout(line_edit_layout)

        line_edit.setFont(QFont("Arial", 14))
        line_edit.setFixedHeight(30)

        return (line_edit_layout, line_edit)

    def __QCheckBox_sendcommand(self, context, apply, connection_type, module, command1, command2):
        checkbox = qtw.QCheckBox(context)
        checkbox.stateChanged.connect(lambda : apply(connection_type, module, command1, command2, checkbox)) 
        if connection_type == self.motion_connection:
            self.motion_setter_widgets.append((checkbox, False))
        else:
            self.devices_setter_widgets.append((checkbox, False)) 
        return checkbox
    def __QComboBox_sendcommand(self, label_text, apply, connection_type, module, command, values, test = False):
        layout = qtw.QVBoxLayout()
        label = qtw.QLabel(label_text)
        label.setStyleSheet("border: 0px;")
        layout.addWidget(label)

        combobox = qtw.QComboBox()
        for value in values:
            combobox.addItem(value[0])

        if connection_type == self.motion_connection:
            self.motion_setter_widgets.append((combobox, True))
        else:
            self.devices_setter_widgets.append((combobox, True))

        if not test:
            combobox.activated.connect(lambda: apply(combobox.currentIndex() ,connection_type, module, command, values)) 

        combobox.setStyleSheet("QComboBox"
                                     "{"
                                     "color: #1de9b6;"
                                     "}")         
        layout.addWidget(combobox)
        layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        return (layout, combobox)
    ####
    
    #### UI methods
    def __camera_open_clicked(self):
        self.open_camera_button.setEnabled(False)
        self.close_camera_button.setEnabled(True)
        self.cameraUI.CameraUIshow()
    def __camera_close_clicked(self):
        self.cameraUI.CameraUIclose()

    def __camera_corrections_clicked(self):
        self.camera_correctionUI.CorrectionUIshow()

    def __az_el_corrections_clicked(self):
        self.az_el_correctionUI.AzElCorrectionUI_Show()

    def __corrections_clicked(self):
        self.devices_connection.SendCommand("Correct_constOD", "str_CC_set_get_full_CC")
        self.correctionUI.compass_lineedit.setText(str(int(self.data_model.getProperty("CC_cmps_ofst")) / 100))
        self.correctionUI.incl_x_lineedit.setText(str((int(self.data_model.getProperty("CC_inclX_ofst")) - 131000) / 1000))
        self.correctionUI.incl_y_lineedit.setText(str((int(self.data_model.getProperty("CC_inclY_ofst")) - 131000) / 1000))
        self.correctionUI.cc_l_lineedit.setText(str(int(self.data_model.getProperty("CC_err_angl_l")) / 10))
        self.correctionUI.cc_k_lineedit.setText(str(int(self.data_model.getProperty("CC_err_angl_k")) / 10))
        self.correctionUI.CorrectionUIshow()

    def __correction_const_activated(self, index):
        if index == 0:
            self.correction_const_QLineEdit.setText("")
            return
        
        self.devices_connection.SendCommand("Correct_constOD", "str_CC_set_get_full_CC")
        values = [int(self.data_model.getProperty("CC_cmps_ofst")) / 100, 
                  #(int(self.data_model.getProperty("CC_H_V_angle")) - 131000) / 1000,
                  (int(self.data_model.getProperty("CC_inclX_ofst")) - 131000) / 1000,
                  (int(self.data_model.getProperty("CC_inclY_ofst")) - 131000) / 1000,
                  int(self.data_model.getProperty("CC_err_angl_l")) / 10,
                  int(self.data_model.getProperty("CC_err_angl_k")) / 10,
                  ]
        self.correction_const_QLineEdit.setText(str(values[index - 1]))

    def __correction_const_apply_btn_clicked(self):
        index = self.correction_const_combobox.currentIndex()
        value = float(self.correction_const_QLineEdit.text())

        commands = [("str_CC_set_compass_offset", (-360, 360), self.data_model.compass_offset),
                    #("str_CC_set_horizontal_vertical_angle", (-90, 90), self.data_model.inclinometer_offset),
                    ("str_CC_set_inclinometer_angle_X_offset", (-90, 90), self.data_model.inclinometer_offset),
                    ("str_CC_set_inclinometer_angle_Y_offset", (-90, 90), self.data_model.inclinometer_offset),
                    ("str_CC_set_error_angle_l", (-90, 90), self.data_model.error_angle_l_k),
                    ("str_CC_set_error_angle_k", (-90, 90), self.data_model.error_angle_l_k)
                    ]
            
        if index == 0:
            return

        if commands[index - 1][1][0] > value or commands[index - 1][1][1] < value:
            UI_Functions.show_error_messagebox("Out of range")
            return
            
        self.devices_connection.SendCommand("Correct_constOD", commands[index - 1][0], commands[index - 1][2](value))

    def __measure_button_click(self):
        #self.devices_connection.SendCommand("LRF_LRX20A", "str_LRF_Pointer_OFF")
        self.laser_on_off.setChecked(False)
        self.devices_connection.SendCommand("LRF_LRX20A", "str_LRF_single_range_measurument")

    def __left_pressed(self):
        if not self.move_by_lsb.isChecked():
            self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_Az", self.data_model.getDefValue("encoder_az_range")[0])
        else:
            self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_Az", int(self.data_model.getProperty("Enc_Az_crct")) - 3)
    def __right_pressed(self):
        if not self.move_by_lsb.isChecked():
            self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_Az", self.data_model.getDefValue("encoder_az_range")[1])
        else:
            self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_Az", int(self.data_model.getProperty("Enc_Az_crct")) + 3)
    def __up_pressed(self):
        if not self.move_by_lsb.isChecked():
            self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_El", self.data_model.getDefValue("encoder_el_range")[1])
        else:
            self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_El", int(self.data_model.getProperty("Enc_El_crct")) + 3)
    def __down_pressed(self):
        if not self.move_by_lsb.isChecked():
            self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_El", self.data_model.getDefValue("encoder_el_range")[0])
        else:
            self.motion_connection.SendCommand("stmd", "str_STMD_set_turget_position_encoder_El", int(self.data_model.getProperty("Enc_El_crct")) - 3)
    
    def __textbox_append_txt(self,txt):
        if len(self.motion_received_data_textbox.toPlainText()) > 1000000:
            self.motion_received_data_textbox.setPlainText("")
        self.motion_received_data_textbox.appendPlainText(txt)
    ####
    def UI_Manager_show(self):
        self.show()

    def closeEvent(self, event):
        if self.devices_connection.connected:
            self.devices_connection.SendCommand("LRF_LRX20A", "str_LRF_Pointer_OFF")
        if UI_Functions.yes_no_dialog("Do you want to close the program?", self):
            self.cameraUI.ui_cross_correction_manager.close()
            self.cameraUI.close()
            event.accept()
        else:
            event.ignore()


