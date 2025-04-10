import PySide6.QtWidgets as qtw
import re

from PySide6.QtCore import Qt, QSize, QRegularExpression
from PySide6.QtCore import QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator, QScreen 
from PySide6.QtWidgets import QApplication, QMainWindow, QDialog
from PySide6.QtGui import QKeyEvent

from uiManager.ui_functions import UI_Functions
from models.data_model import DataModel

class CrossCorrectionUI(qtw.QWidget):
    def __init__(self, ui_camera_manager, devices_connection):
        super().__init__()
        self.__WindowStyle()

        self.main_layout = qtw.QHBoxLayout()

        self.ui_camera_manager = ui_camera_manager
        self.devices_connection = devices_connection
        self.data_model = DataModel()

        num_regex = QRegularExpression(r'[+-]?\d*$')  # Regex for numbers only
        self.validator = QRegularExpressionValidator(num_regex, self)

        #Connection Layout 
        self.__CrossCorrectionLayout()
        
        self.setLayout(self.main_layout)

    #Window style
    def __WindowStyle(self):
        self.setWindowTitle("3D_01_TESTER_CROSS_CORRECTIONS")
        self.setFixedSize(350, 300)
        x = (1920 - self.width()/2) 
        y = (1080 - self.height()/2) 
        self.move(x, y)

    def __CrossCorrectionLayout(self):
        cross_correction_layout = qtw.QVBoxLayout()
        
        day_cross_correction_layout = qtw.QVBoxLayout()
        common_correction_layout = qtw.QHBoxLayout()
        IR_cross_correction_layout = qtw.QVBoxLayout()

        day_label_combobox_layout = qtw.QHBoxLayout()

        day_label = qtw.QLabel("Day Camera Cross")
        day_label_combobox_layout.addWidget(day_label)
        day_zoom_label = qtw.QLabel("Zoom")
        day_label_combobox_layout.addWidget(day_zoom_label)
        self.day_zoom_combobox = qtw.QComboBox()
        self.day_zoom_combobox.activated.connect(self.__day_zoom_onchanged)
        for zoom in self.data_model.getDefValue("zoom_fixed_day"):
            self.day_zoom_combobox.addItem(f"{zoom}x")
        day_label_combobox_layout.addWidget(self.day_zoom_combobox)
        day_cross_correction_layout.addLayout(day_label_combobox_layout)

        day_xy_layout = qtw.QHBoxLayout()
        day_x_label = qtw.QLabel("X:")
        self.day_x_lineedit =  qtw.QLineEdit()
        self.day_x_lineedit.setValidator(self.validator)
        self.day_x_lineedit.textChanged.connect(self.__day_x_y_changed)
        day_xy_layout.addWidget(day_x_label)
        day_xy_layout.addWidget(self.day_x_lineedit)
        day_y_label = qtw.QLabel("Y:")
        self.day_y_lineedit =  qtw.QLineEdit()
        self.day_y_lineedit.setValidator(self.validator)
        self.day_y_lineedit.textChanged.connect(self.__day_x_y_changed)
        day_xy_layout.addWidget(day_y_label)
        day_xy_layout.addWidget(self.day_y_lineedit)
        day_cross_correction_layout.addLayout(day_xy_layout)


        btns_layout = qtw.QVBoxLayout()
        up_btn = qtw.QPushButton("↑")
        up_btn.clicked.connect(self.__up)
        up_btn.setFixedWidth(40)
        btns_layout.addWidget(up_btn, alignment=Qt.AlignmentFlag.AlignCenter)
        btns_middle_layout = qtw.QHBoxLayout()
        left_btn = qtw.QPushButton("←")
        left_btn.clicked.connect(self.__left)
        left_btn.setFixedWidth(40)
        btns_middle_layout.addWidget(left_btn)
        null_btn = qtw.QPushButton("O")
        null_btn.clicked.connect(self.__null_point_clicked)
        null_btn.setFixedWidth(40)
        btns_middle_layout.addWidget(null_btn)
        right_btn = qtw.QPushButton("→")
        right_btn.clicked.connect(self.__right)
        right_btn.setFixedWidth(40)
        btns_middle_layout.addWidget(right_btn)
        btns_layout.addLayout(btns_middle_layout)
        down_btn = qtw.QPushButton("↓")
        down_btn.clicked.connect(self.__down)
        down_btn.setFixedWidth(40)
        btns_layout.addWidget(down_btn, alignment=Qt.AlignmentFlag.AlignCenter)

        get_set_btns_layout = qtw.QVBoxLayout()
        get_cross_position_btn = qtw.QPushButton("Get")
        get_cross_position_btn.setFixedWidth(150)
        get_cross_position_btn.clicked.connect(self.__get_clicked)
        set_cross_position_btn = qtw.QPushButton("Set")
        set_cross_position_btn.setFixedWidth(150)
        set_cross_position_btn.clicked.connect(self.__set_clicked)
        self.aim_checkbox = qtw.QCheckBox("Cross aim box")
        self.aim_checkbox.stateChanged.connect(self.__aim_checkbox_checked)
        get_set_btns_layout.addWidget(self.aim_checkbox)
        get_set_btns_layout.addWidget(get_cross_position_btn)
        get_set_btns_layout.addWidget(set_cross_position_btn)
        
        common_correction_layout.addLayout(btns_layout)
        common_correction_layout.addLayout(get_set_btns_layout)
        common_correction_layout.setContentsMargins(0, 10, 0, 10)

        IR_label_combobox = qtw.QHBoxLayout()
        
        IR_label = qtw.QLabel("IR Camera Cross")
        IR_label_combobox.addWidget(IR_label)
        IR_zoom_label = qtw.QLabel("Zoom")
        IR_label_combobox.addWidget(IR_zoom_label)
        self.IR_zoom_combobox = qtw.QComboBox()
        for zoom in self.data_model.getDefValue("zoom_fixed_IR"):
            self.IR_zoom_combobox.addItem(f"{zoom}x")
        self.IR_zoom_combobox.activated.connect(self.__IR_zoom_onchanged)
        IR_label_combobox.addWidget(self.IR_zoom_combobox)
        IR_cross_correction_layout.addLayout(IR_label_combobox)

        IR_xy_layout = qtw.QHBoxLayout()
        IR_x_label = qtw.QLabel("X:")
        self.IR_x_lineedit =  qtw.QLineEdit()
        self.IR_x_lineedit.setValidator(self.validator)
        self.IR_x_lineedit.textChanged.connect(self.__IR_x_y_changed)
        IR_xy_layout.addWidget(IR_x_label)
        IR_xy_layout.addWidget(self.IR_x_lineedit)
        IR_y_label = qtw.QLabel("Y:")
        self.IR_y_lineedit =  qtw.QLineEdit()
        self.IR_y_lineedit.setValidator(self.validator)
        self.IR_y_lineedit.textChanged.connect(self.__IR_x_y_changed)
        IR_xy_layout.addWidget(IR_y_label)
        IR_xy_layout.addWidget(self.IR_y_lineedit)
        IR_cross_correction_layout.addLayout(IR_xy_layout)


        cross_correction_layout.addLayout(day_cross_correction_layout)
        cross_correction_layout.addLayout(common_correction_layout)
        cross_correction_layout.addLayout(IR_cross_correction_layout)

        self.main_layout.addLayout(cross_correction_layout)

    def __day_zoom_onchanged(self, index):
        zoom = self.data_model.getDefValue("zoom_fixed_day")[index]
        self.devices_connection.SendCommand("Correct_constOD", "str_CC_set_get_full_CC")
        self.data_model.zoom_day_camera(self.devices_connection, zoom)
        self.day_x_lineedit.setText(self.data_model.getProperty(f"CC_DCm_bX_x{zoom}"))
        self.day_y_lineedit.setText(self.data_model.getProperty(f"CC_DCm_bY_x{zoom}"))

    def __IR_zoom_onchanged(self, index):
        zoom = self.data_model.getDefValue("zoom_fixed_IR")[index]
        self.devices_connection.SendCommand("Correct_constOD", "str_CC_set_get_full_CC")
        self.data_model.zoom_IR_camera(self.devices_connection, index + 1)
        self.IR_x_lineedit.setText(self.data_model.getProperty(f"CC_IRC_bX_x{zoom}"))
        self.IR_y_lineedit.setText(self.data_model.getProperty(f"CC_IRC_bY_x{zoom}"))

    def __get_clicked(self):
        self.devices_connection.SendCommand("Correct_constOD", "str_CC_set_get_full_CC")
        if self.ui_camera_manager.camera_handler.pending_source_number == 1:
            zoom = self.data_model.getDefValue("zoom_fixed_day")[self.day_zoom_combobox.currentIndex()]
            self.data_model.zoom_day_camera(self.devices_connection, zoom)
            self.day_x_lineedit.setText(self.data_model.getProperty(f"CC_DCm_bX_x{zoom}"))
            self.day_y_lineedit.setText(self.data_model.getProperty(f"CC_DCm_bY_x{zoom}"))
        else:
            zoom = self.data_model.getDefValue("zoom_fixed_IR")[self.IR_zoom_combobox.currentIndex()]
            self.data_model.zoom_IR_camera(self.devices_connection, self.IR_zoom_combobox.currentIndex() + 1)
            self.IR_x_lineedit.setText(self.data_model.getProperty(f"CC_IRC_bX_x{zoom}"))
            self.IR_y_lineedit.setText(self.data_model.getProperty(f"CC_IRC_bY_x{zoom}"))
    def __set_clicked(self):
        if self.ui_camera_manager.camera_handler.pending_source_number == 1:
            if not re.match(r'^[+-]?\d+$', self.day_x_lineedit.text()) or not re.match(r'^[+-]?\d+$', self.day_y_lineedit.text()):
                UI_Functions.show_error_messagebox("Invalid value")
                return
            zoom = self.data_model.getDefValue("zoom_fixed_day")[self.day_zoom_combobox.currentIndex()]
            self.devices_connection.SendCommand("Correct_constOD", f"str_CC_set_day_camera_bias_X_x{zoom}", self.day_x_lineedit.text())
            self.devices_connection.SendCommand("Correct_constOD", f"str_CC_set_day_camera_bias_Y_x{zoom}", self.day_y_lineedit.text())
        else:
            if not re.match(r'^[+-]?\d+$', self.IR_x_lineedit.text()) or not re.match(r'^[+-]?\d+$', self.IR_y_lineedit.text()):
                UI_Functions.show_error_messagebox("Invalid value")
                return
            zoom = self.data_model.getDefValue("zoom_fixed_IR")[self.IR_zoom_combobox.currentIndex()]
            self.devices_connection.SendCommand("Correct_constOD", f"str_CC_set_night_camera_bias_X_x{zoom}", self.IR_x_lineedit.text())
            self.devices_connection.SendCommand("Correct_constOD", f"str_CC_set_night_camera_bias_Y_x{zoom}", self.IR_y_lineedit.text())

    def __up(self):
        if self.ui_camera_manager.camera_handler.pending_source_number == 1:
            if not re.match(r'^[+-]?\d+$', self.day_y_lineedit.text()):
                return
            y = int(self.day_y_lineedit.text()) - 1
            self.day_y_lineedit.setText(str(y))
        else:
            if not re.match(r'^[+-]?\d+$', self.IR_y_lineedit.text()):
                return
            y = int(self.IR_y_lineedit.text()) - 1
            self.IR_y_lineedit.setText(str(y))
    def __down(self):
        if self.ui_camera_manager.camera_handler.pending_source_number == 1:
            if not re.match(r'^[+-]?\d+$', self.day_y_lineedit.text()):
                return
            y = int(self.day_y_lineedit.text()) + 1
            self.day_y_lineedit.setText(str(y))
        else:
            if not re.match(r'^[+-]?\d+$', self.IR_y_lineedit.text()):
                return
            y = int(self.IR_y_lineedit.text()) + 1
            self.IR_y_lineedit.setText(str(y))
    def __left(self):
        if self.ui_camera_manager.camera_handler.pending_source_number == 1:
            if not re.match(r'^[+-]?\d+$', self.day_x_lineedit.text()):
                return
            x = int(self.day_x_lineedit.text()) - 1
            self.day_x_lineedit.setText(str(x))
        else:
            if not re.match(r'^[+-]?\d+$', self.IR_x_lineedit.text()):
                return
            x = int(self.IR_x_lineedit.text()) - 1
            self.IR_x_lineedit.setText(str(x))
    def __right(self):
        if self.ui_camera_manager.camera_handler.pending_source_number == 1:
            if not re.match(r'^[+-]?\d+$', self.day_x_lineedit.text()):
                return
            x = int(self.day_x_lineedit.text()) + 1
            self.day_x_lineedit.setText(str(x))
        else:
            if not re.match(r'^[+-]?\d+$', self.IR_x_lineedit.text()):
                return
            x = int(self.IR_x_lineedit.text()) + 1
            self.IR_x_lineedit.setText(str(x))

    def __day_x_y_changed(self):
        if self.ui_camera_manager.camera_handler.pending_source_number != 1:
            return
        
        self.__shift_aim_box(1)

    def __IR_x_y_changed(self):    
        if self.ui_camera_manager.camera_handler.pending_source_number != 2:
            return
        
        self.__shift_aim_box(2)

    def __null_point_clicked(self):
        if self.ui_camera_manager.camera_handler.pending_source_number == 1:
            #zoom = self.data_model.getDefValue("zoom_fixed_day")[self.day_zoom_combobox.currentIndex()]
            #self.data_model.zoom_day_camera(self.devices_connection, zoom)
            self.day_x_lineedit.setText("960")
            self.day_y_lineedit.setText("540")
        else:
            #zoom = self.data_model.getDefValue("zoom_fixed_IR")[self.IR_zoom_combobox.currentIndex()]
            #self.data_model.zoom_IR_camera(self.devices_connection, zoom)
            self.IR_x_lineedit.setText("960")
            self.IR_y_lineedit.setText("540")
    
    def __aim_checkbox_checked(self, state):
        mode = self.ui_camera_manager.camera_handler.pending_source_number

        zoom = self.data_model.getProperty("day_zoom") if mode == 1 else self.data_model.getProperty("IR_zoom")
        if mode == 2:
            if zoom == 3:
                zoom = 4
            elif zoom == 4:
                zoom = 8
                
        if state == 0:
            self.ui_camera_manager.ui.primary_camera_view.show_aim_box_zoom_dependent(camera_mode=mode, zoom=zoom)
        else:
            self.ui_camera_manager.ui.primary_camera_view.show_aim_box(zoom, True, self.ui_camera_manager.camera_handler.pending_source_number)
        self.__shift_aim_box(self.ui_camera_manager.camera_handler.pending_source_number)

    
    def __shift_aim_box(self, mode):
        x_txt = self.day_x_lineedit.text() if mode == 1 else self.IR_x_lineedit.text()
        y_txt = self.day_y_lineedit.text() if mode == 1 else self.IR_y_lineedit.text()

        if ((not re.match(r'^[+-]?\d+$',x_txt)) or (not re.match(r'^[+-]?\d+$', y_txt))):
            return
        
        x = int(x_txt)
        y = int(y_txt)

        self.ui_camera_manager.ui.primary_camera_view.shift_aim_box_centered(x,y)

    def CrossCorrectionUIshow(self):
        self.show()
        self.activateWindow()
        self.raise_()