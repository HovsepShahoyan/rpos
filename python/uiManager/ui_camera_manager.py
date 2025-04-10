import PySide6.QtWidgets as qtw

from PySide6.QtCore import Qt, QSize, QRegularExpression
from PySide6.QtCore import QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator, QScreen, QKeyEvent
from PySide6.QtWidgets import QApplication, QMainWindow, QDialog

from  uiManager.ui_functions import UI_Functions
from  uiManager.ui_cross_correction_manager import CrossCorrectionUI

from camside.AACam.MainWindow import AACamMainWindow
class CameraUI(AACamMainWindow):
    def __init__(self, ui_manager, ui_correction_manager, app):
        super().__init__(app)
        self.ui_manager = ui_manager
        self.ui_correction_manager = ui_correction_manager
        self.ui_cross_correction_manager = CrossCorrectionUI(self, self.ui_manager.devices_connection)

        self.dataModel.propertyChanged.connect(self.onZoomChanged)

        self.__WindowStyle()

        toolbar = qtw.QToolBar(self)
        toolbar.setMovable(False)
        toolbar.setFixedWidth(500)
        # Add buttons to toolbar
        ui_manager_btn = qtw.QToolButton()
        ui_manager_btn.setText("Main Window")
        ui_manager_btn.clicked.connect(self.open_ui_manager)
        toolbar.addWidget(ui_manager_btn)
        ui_cross_correction_btn = qtw.QToolButton()
        ui_cross_correction_btn.setText("Cross corrections")
        ui_cross_correction_btn.clicked.connect(self.open_ui_cross_correction_manager)
        toolbar.addWidget(ui_cross_correction_btn)
        ui_correction_btn = qtw.QToolButton()
        ui_correction_btn.setText("All corrections")
        ui_correction_btn.clicked.connect(self.open_ui_correction_manager)
        toolbar.addWidget(ui_correction_btn)



    def open_ui_manager(self):
        self.ui_manager.activateWindow()
        self.ui_manager.raise_()

    def open_ui_cross_correction_manager(self):
        if self.ui_manager.devices_connection.connected:
            self.ui_cross_correction_manager.CrossCorrectionUIshow()
        else:
            UI_Functions.show_error_messagebox("Please connect devices")

    def open_ui_correction_manager(self):
        if self.ui_manager.devices_connection.connected:
            self.ui_correction_manager.CorrectionUIshow()
        else:
            UI_Functions.show_error_messagebox("Please connect devices")
    
    #Window style
    def __WindowStyle(self):
        center = QScreen.availableGeometry(QApplication.primaryScreen()).center()
        self.setFixedSize(1920, 1080)
        x = (center.x() - self.width()/2) 
        y = (center.y() - self.height()/2) 
        self.move(x, y)

    def CameraUIshow(self):
        self.showFullScreen()
    def CameraUIclose(self):
        self.ui_manager.open_camera_button.setEnabled(True)
        self.ui_manager.close_camera_button.setEnabled(False)
        self.close()

    def onZoomChanged(self, key, value):
        if self.ui_cross_correction_manager.aim_checkbox.isChecked():
            return
        if key == "day_zoom" and self.camera_handler.pending_source_number == 1:
            self.onCameraZoomChanged(1, int(value))
        elif key == "IR_zoom" and self.camera_handler.pending_source_number == 2:
            value = int(value)
            if value == 3:
                value = 4
            elif value == 4:
                value = 8
            self.onCameraZoomChanged(2, int(value))
        
    def keyPressEvent(self, event: QKeyEvent) -> None:
        super().keyPressEvent(event)
        if event.key() == Qt.Key_1:
            if not self.ui_cross_correction_manager.aim_checkbox.isChecked():
                self.onCameraZoomChanged(1, self.dataModel.getProperty("day_zoom"))
            else:
                self.ui.primary_camera_view.show_aim_box(self.dataModel.getProperty("day_zoom"), True, 1)
            event.accept()
        elif event.key() == Qt.Key_2:
            if not self.ui_cross_correction_manager.aim_checkbox.isChecked():
                zoom = int(self.dataModel.getProperty("IR_zoom"))
                if zoom == 3:
                    zoom = 4
                elif zoom == 4:
                    zoom = 8
                self.onCameraZoomChanged(2, zoom)
            else:
                zoom = int(self.dataModel.getProperty("IR_zoom"))
                if zoom == 3:
                    zoom = 4
                elif zoom == 4:
                    zoom = 8
                self.ui.primary_camera_view.show_aim_box(zoom, True, 2)
            event.accept()

    def closeEvent(self, event):
        self.ui_cross_correction_manager.close()
        self.CameraUIclose()