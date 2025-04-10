import PySide6.QtWidgets as qtw

from PySide6.QtCore import Qt, QSize, QRegularExpression
from PySide6.QtCore import QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator, QScreen 
from PySide6.QtWidgets import QApplication, QMainWindow, QDialog

from   uiManager.ui_functions import UI_Functions
from models.data_model import DataModel

class CorrectionUI(QDialog):
    def __init__(self):
        super().__init__()
        self.__WindowStyle()

        self.main_layout = qtw.QVBoxLayout()
        self.setLayout(self.main_layout)
        self.data_model = DataModel()
        self.__CorrectionLayout()


    #Window style
    def __WindowStyle(self):
        self.setWindowTitle("3D_01_TESTER_CORRECTIONS")
        center = QScreen.availableGeometry(QApplication.primaryScreen()).center()
        self.setFixedSize(200, 330)
        x = (center.x() - self.width()/2) 
        y = (center.y() - self.height()/2) 
        self.move(x, y)
        #self.setModal(True)
    
    def __CorrectionLayout(self):
         compass_label = qtw.QLabel("Compass Offset")
         self.main_layout.addWidget(compass_label)
         self.compass_lineedit = qtw.QLineEdit()
         self.compass_lineedit.setReadOnly(True)
         self.main_layout.addWidget(self.compass_lineedit)

         incl_x_label = qtw.QLabel("Inclinometer X offset")
         self.main_layout.addWidget(incl_x_label)
         self.incl_x_lineedit = qtw.QLineEdit()
         self.incl_x_lineedit.setReadOnly(True)
         self.main_layout.addWidget(self.incl_x_lineedit)

         incl_y_label = qtw.QLabel("Inclinometer Y offset")
         self.main_layout.addWidget(incl_y_label)
         self.incl_y_lineedit = qtw.QLineEdit()
         self.incl_y_lineedit.setReadOnly(True)
         self.main_layout.addWidget(self.incl_y_lineedit)

         cc_l_label = qtw.QLabel("CC_err_angl_l")
         self.main_layout.addWidget(cc_l_label)
         self.cc_l_lineedit = qtw.QLineEdit()
         self.cc_l_lineedit.setReadOnly(True)
         self.main_layout.addWidget(self.cc_l_lineedit)

         cc_k_label = qtw.QLabel("CC_err_angl_k")
         self.main_layout.addWidget(cc_k_label)
         self.cc_k_lineedit = qtw.QLineEdit()
         self.cc_k_lineedit.setReadOnly(True)
         self.main_layout.addWidget(self.cc_k_lineedit)


    def CorrectionUIshow(self):
        
        self.show()