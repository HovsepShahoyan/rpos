import re
import PySide6.QtWidgets as qtw

from PySide6.QtCore import Qt, QSize, QRegularExpression
from PySide6.QtCore import QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator, QScreen 
from PySide6.QtWidgets import QApplication, QMainWindow, QDialog

from   uiManager.ui_functions import UI_Functions
from   uiManager.ui_progressbar_manager import ProgressDialog

class CameraCorrectionUI(QDialog):
    def __init__(self, devices_connection, data_model):
        super().__init__()
        self.__WindowStyle()

        self.UI_Functions = UI_Functions()
        self.main_layout = qtw.QHBoxLayout()

        self.devices_connection = devices_connection
        self.data_model = data_model

        #Connection Layout 
        self.__CorrectionLayout()
        
        self.setLayout(self.main_layout)
        self.ui_progressbar_manager = ProgressDialog()


    def __CorrectionLayout(self):
        correction_layout = qtw.QVBoxLayout()
        
        combobox_layout = qtw.QVBoxLayout()
        camera_label = qtw.QLabel("Camera")
        camera_label.setStyleSheet("border: 0px;")
        combobox_layout.addWidget(camera_label, alignment=Qt.AlignmentFlag.AlignLeft)
        self.camera_combobox = qtw.QComboBox()
        self.camera_combobox.setFixedWidth(150)
        self.camera_combobox.addItem("___")
        self.camera_combobox.addItem("Day")
        self.camera_combobox.addItem("IR")
        combobox_layout.addWidget(self.camera_combobox, alignment=Qt.AlignmentFlag.AlignLeft)
        correction_layout.addLayout(combobox_layout)        

        get_button = qtw.QPushButton("Get")
        get_button.clicked.connect(self.__get_clicked)
        set_button = qtw.QPushButton("Set")
        set_button.clicked.connect(self.__set_clicked)

        correction_layout.addWidget(get_button)
        correction_layout.addWidget(set_button)

        self.tableWidget = qtw.QTableWidget() 
        self.tableWidget.setRowCount(1)
        self.tableWidget.setColumnCount(3) 
        self.tableWidget.setItem(0,0, qtw.QTableWidgetItem("Zoom")) 
        self.tableWidget.setItem(0,1, qtw.QTableWidgetItem("X")) 
        self.tableWidget.setItem(0,2, qtw.QTableWidgetItem("Y")) 

        correction_layout.addWidget(self.tableWidget)

        correction_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.main_layout.addLayout(correction_layout)

    #Window style
    def __WindowStyle(self):
        self.setWindowTitle("3D_01_TESTER_CORRECTIONS")
        center = QScreen.availableGeometry(QApplication.primaryScreen()).center()
        self.setFixedSize(350, 450)
        x = (center.x() - self.width()/2) 
        y = (center.y() - self.height()/2) 
        self.move(x, y)
        #self.setModal(True)

    def __get_clicked(self):
        if self.camera_combobox.currentIndex()  == 0:
            self.tableWidget.setRowCount(1)
            return
        
        self.devices_connection.SendCommand("Correct_constOD", "str_CC_set_get_full_CC")


        self.tableWidget.setRowCount(len(self.data_model.getDefValue("zoom_fixed_day" if self.camera_combobox.currentIndex() == 1 else "zoom_fixed_IR")) + 1)
        row_index = 1
        for zoom in self.data_model.getDefValue("zoom_fixed_day" if self.camera_combobox.currentIndex() == 1 else "zoom_fixed_IR"):
            self.tableWidget.setItem(row_index,0, qtw.QTableWidgetItem(f"{zoom}x")) 
            self.tableWidget.setItem(row_index,1, qtw.QTableWidgetItem(str(self.data_model.getProperty(("CC_DCm_bX_x" if self.camera_combobox.currentIndex() == 1 else "CC_IRC_bX_x") + str(zoom))))) 
            self.tableWidget.setItem(row_index,2, qtw.QTableWidgetItem(str(self.data_model.getProperty(("CC_DCm_bY_x" if self.camera_combobox.currentIndex() == 1 else "CC_IRC_bY_x") + str(zoom))))) 
            row_index += 1

    def __set_clicked(self):
        if self.camera_combobox.currentIndex()  == 0:
            return
        
        index = self.camera_combobox.currentIndex()
        row_index = 1

        if len(self.data_model.getDefValue("zoom_fixed_day" if index == 1 else "zoom_fixed_IR")) != self.tableWidget.rowCount() - 1:
            return

        self.ui_progressbar_manager.show_progressbar_dialog()
        bias_x = []
        bias_y = []

        for zoom in self.data_model.getDefValue("zoom_fixed_day" if index == 1 else "zoom_fixed_IR"):
            bias_x.append(self.tableWidget.item(row_index, 1).text())
            bias_y.append(self.tableWidget.item(row_index, 2).text())

            if not re.match(r'^[+-]?\d+$', bias_x[row_index - 1]) or not re.match(r'^[+-]?\d+$', bias_y[row_index - 1]):
                UI_Functions.show_error_messagebox("Please enter a number")
                return
            self.devices_connection.SendCommand("Correct_constOD", ("str_CC_set_day_camera_bias_X_x" if index == 1 else "str_CC_set_night_camera_bias_X_x") + str(zoom), bias_x[row_index - 1])
            self.devices_connection.SendCommand("Correct_constOD", ("str_CC_set_day_camera_bias_Y_x" if index == 1 else "str_CC_set_night_camera_bias_Y_x") + str(zoom), bias_y[row_index - 1])

            row_index += 1


    def CorrectionUIshow(self):
        self.show()
