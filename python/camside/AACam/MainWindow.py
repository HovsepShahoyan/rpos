from enum import IntEnum

from PySide6 import QtGui, QtWidgets
from PySide6.QtCore import Qt, QTimer, QEvent, Signal
from PySide6.QtGui import QKeyEvent
from PySide6.QtWidgets import QMainWindow


from camside.AACam.CamHandler import CamHandler
from camside.AACam.camera_corrections.camera_correction import CameraCorrection
from camside.AACam.qt.ui_mainwindow import Ui_MainWindow
from camside.AACam.qt.CamScreen import CamScreen

from models.data_model import DataModel
class AACamMainWindow(QMainWindow):

    class ViewMode(IntEnum):
        CAM_SOURCE_1_2 = 0
        CAM_SOURCE_2_1 = 1
        CAM_SOURCE_1_1 = 2
        CAM_SOURCE_2_2 = 3

    def __init__(self, app):
        super(AACamMainWindow, self).__init__()

        # if config.get("camera_source_test"):
        #     self.CAMERA_SOURCE_1 = DeviceEnum.TESTSRC_1
        #     self.CAMERA_SOURCE_2 = DeviceEnum.TESTSRC_2
        # else:
        #     self.CAMERA_SOURCE_1 = DeviceEnum.VIDEO_SOURCE_1
        #     self.CAMERA_SOURCE_2 = DeviceEnum.VIDEO_SOURCE_2


        # Construct the UI
        self.ui = Ui_MainWindow()
        self.ui.setupUi(self)
        self.camscr = CamScreen()
        self.cam_widget = self.ui.primary_camera_view


        self.app = app
        self.view_mode = None

        self.dataModel = DataModel()
        self.dataModel.propertyChanged.connect(self.onAngularChanged)
        self.dataModel.propertyChanged.connect(self.onLRFChanged)

        self.ui.primary_camera_view.show_aim_box_zoom_dependent()
        # self.ui.primary_camera_view.show_measurement_mode(0)
        self.camera_handler = CamHandler(container_primary=self.ui.primary_camera_view)
        self.set_view_mode(self.ViewMode.CAM_SOURCE_1_2)
        self.setFocus()








    def changeAngular(self, value1, value2):
        self.ui.primary_camera_view.show_alphaD_text(str(value1), 600, 150)
        self.ui.primary_camera_view.show_mestoC_text(str(value2), 950, 150) 
           

         
         


    # def onCameraChanged(self, value):
    #     self.ui.primary_camera_view.show_aim_box_zoom_dependent(camera_mode=value, zoom = zoom)

    def onCameraZoomChanged(self, camera_mode, zoom):
        self.ui.primary_camera_view.show_aim_box_zoom_dependent(camera_mode=camera_mode, zoom=zoom)
        # self.ui.primary_camera_view.show_aim_box(camera_mode=camera_mode)


    def onLrfModeChanged(self, value):
        self.ui.primary_camera_view.show_measurement_mode(mode = value)
        
    


    def onAngularChanged(self, key, value):
        # self.dataModel.testUpdate()

        if key == "alphaD":
            # Update alphaD text display
            self.ui.primary_camera_view.show_alphaD_text(str(value), 600, 20)
        elif key == "mestoC":
            # Update mestoC text display
            self.ui.primary_camera_view.show_mestoC_text(str(value), 950, 20)

        # if key == "azimuth_angle":
        #     # Update alphaD text display
        #     self.ui.primary_camera_view.show_azim_angle_text(str(value), 400, 200)
        # elif key == "encoder_azimuth_zero":
        #     # Update mestoC text display
        #     self.ui.primary_camera_view.show_enc_az_zero_text(str(value), 600, 400)
        # elif key == "cmps_ag":
        #     # Update mestoC text display
        #     self.ui.primary_camera_view.show_compass_text(str(value), 900, 200)

    def onLRFChanged(self, key, value):
        # self.dataModel.testUpdate()

        if key == "LRF_Range_1":
            # Update alphaD text display
            self.ui.primary_camera_view.show_temporary_message(f"D: {str(value)}", 4000)     
    
    def update_buttons_state(self, data):
        self.serial_data = data

 
    def set_view_mode(self, view_mode):
        if view_mode == self.view_mode:
            return

        self.camera_handler.reset()
       
        self.view_mode = view_mode
        self.camera_handler.play()

    def keyPressEvent(self, event: QKeyEvent) -> None:
        super(AACamMainWindow, self).keyPressEvent(event)
        if event.key() in (Qt.Key_Q, Qt.Key_Escape):
            # Quit
            self.close()
            event.accept()
        elif event.key() == Qt.Key_1:
            self.camera_handler.request_switch_source(1)
            event.accept()
        elif event.key() == Qt.Key_2:
            self.camera_handler.request_switch_source(2)
            event.accept()

    def closeEvent(self, event):
        """ Finalize application """
        self.camera_handler.reset()

        # if self.serial_thread.isRunning():
        #     self.serial_thread.finalize()
        #     self.serial_thread.wait()

        event.accept()
        super(AACamMainWindow, self).closeEvent(event)
