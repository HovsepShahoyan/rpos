
from PySide6 import QtCore, QtGui, QtWidgets
from PySide6.QtCore import Qt
from PySide6.QtGui import QPalette, QColor, QFont
from PySide6.QtWidgets import QLabel
from camside.AACam.qt.CamScreen import CamScreen
from camside.AACam.qt.LabelButton import LabelButton
from camside.AACam.qt.OutlinedLabel import OutlinedLabel

class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(1920, 1080)
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.centralwidget.setObjectName("centralwidget")
        self.primary_camera_view = CamScreen(self.centralwidget)
        self.primary_camera_view.setAlignment(Qt.AlignCenter)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Maximum, QtWidgets.QSizePolicy.Maximum)
        sizePolicy.setVerticalPolicy(sizePolicy.verticalPolicy())
        sizePolicy.setHorizontalPolicy(sizePolicy.horizontalPolicy())
        sizePolicy.setHeightForWidth(self.primary_camera_view.sizePolicy().hasHeightForWidth())
        self.primary_camera_view.setSizePolicy(sizePolicy)
        self.primary_camera_view.setMinimumSize(QtCore.QSize(1920, 1080))
        self.primary_camera_view.setMaximumSize(QtCore.QSize(1920, 1080))
        self.primary_camera_view.setStyleSheet("background-color: transparent;")
        self.primary_camera_view.setObjectName("primary_camera_view")
        MainWindow.setCentralWidget(self.centralwidget)

        self.retranslateUi(MainWindow)
        QtCore.QMetaObject.connectSlotsByName(MainWindow)

    def retranslateUi(self, MainWindow):
        _translate = QtCore.QCoreApplication.translate

