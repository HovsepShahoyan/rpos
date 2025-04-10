import logging

from PySide6 import QtGui, QtWidgets
from PySide6.QtCore import Signal, Qt, QPoint, QTimer, QEvent
from PySide6.QtGui import QPen, QPixmap, QPainter, QColor, QFont
from PySide6.QtOpenGLWidgets import QOpenGLWidget
from PySide6.QtWidgets import (
    QGraphicsView,
    QGraphicsScene,
    QGraphicsRectItem,
    QGraphicsLineItem,
    QGraphicsItemGroup,
    QGraphicsPixmapItem,
    QGraphicsTextItem,
    QGraphicsItem,
    QVBoxLayout,
    QWidget
)



from camside.AACam.camera_corrections.camera_correction import CameraCorrection
from camside.AACam.qt.customControls.outlinedTextView import OutlinedTextItem
from config import config

log = logging.getLogger()

from OpenGL import GL
error = GL.glGetError()
if error != GL.GL_NO_ERROR:
    print('OpenGL error:', error)

pictures_base_path = "camside/AACam/resources/CameraPictures/"

class CamScreen(QtWidgets.QGraphicsView):
    startBlinkingSignal = Signal(object, int, int) 

    new_pixmap = Signal(QtGui.QPixmap)
    destroy_widget = Signal()
    arrow_key_pressed = Signal(Qt.Key)
    arrow_key_released = Signal(Qt.Key)
    def __init__(self, parent=None):
        super(CamScreen, self).__init__(parent)


        self.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.verticalScrollBar().setDisabled(True)
        self.horizontalScrollBar().setDisabled(True)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Maximum, QtWidgets.QSizePolicy.Maximum)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)

        self.setViewport(QOpenGLWidget().setUpdateBehavior(QOpenGLWidget.NoPartialUpdate))
        self.setViewportUpdateMode(QGraphicsView.FullViewportUpdate)

        self.setFrameStyle(0)
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)

        self.new_pixmap.connect(self.on_new_pixmap)
        self.pix = QGraphicsPixmapItem()
        
        self.scene.addItem(self.pix)
        self.text_box = QGraphicsTextItem()
        self.scene.addItem(self.text_box)

        self.text_box.setPos(40, 25)
        self.text_box.setDefaultTextColor(QColor(225, 1, 40))
        self.text_box.setFont(QFont("Arial", 36))

        self.text_box_timer = QTimer(self)
        self.text_box_timer.timeout.connect(self.hide_message)


        # AlphaD, MestoC textbox
        self.alphaD_text_box = OutlinedTextItem()
        self.mestoC_text_box = OutlinedTextItem()
        self.scene.addItem(self.alphaD_text_box)
        self.scene.addItem(self.mestoC_text_box)


        # Compass, enc_az_zero, azim_angle textbox
        self.compass_text_box = OutlinedTextItem()
        self.enc_az_zero_text_box = OutlinedTextItem()
        self.azim_angle_text_box = OutlinedTextItem()
        self.scene.addItem(self.compass_text_box)
        self.scene.addItem(self.enc_az_zero_text_box)
        self.scene.addItem(self.azim_angle_text_box)

        # Rangefinder textbox
        #self.rangefinder_text_box = QGraphicsPixmapItem()
        #self.scene.addItem(self.rangefinder_text_box)

        #self.rangefinder_text_box_timer = QTimer(self)
        #self.rangefinder_text_box_timer.timeout.connect(self.hide_range_message)



        # zoom params
        self.zoom_enabled = False
        self.zoom_level = 1

        self.crosshair = QPixmap()
        self.crosshair_item = QGraphicsPixmapItem()
        self.crosshair_item.setCacheMode(QGraphicsItem.NoCache)

        self.crosshair_corrections = CameraCorrection()


        # LRF Indicators
        self.not_ready_mode_indicator = QPixmap(f'{pictures_base_path}TargetRed.png')
        self.distance_mode_indicator = QPixmap(f'{pictures_base_path}TargetDistance.png')
        self.target_mode_indicator = QPixmap(f'{pictures_base_path}TargetTarget.png')
        self.expl_mode_indicator = QPixmap(f'{pictures_base_path}TargetExplosion.png')
        self.front_mode_indicator = QPixmap(f'{pictures_base_path}TargetFront.png')
        
        # LRF Indicator Items
        #self.measurement_indicator = QGraphicsPixmapItem(self.not_ready_mode_indicator)
        #self.measurement_indicator.setCacheMode(QGraphicsItem.NoCache)

        # self.measurement_indicator.setPos(0, 200)
        #self.scene.addItem(self.measurement_indicator)
        # self.scene.update()



        self.ref_pos_x = 0
        self.ref_pos_y = 0



        self.blink_timer = QTimer(self)
        self.blink_timer.timeout.connect(self.toggle_visibility)
        self.blinking_item = None
        self.blinking = False
        self.blink_duration_timer = QTimer(self)
        self.blink_duration_timer.timeout.connect(self.stop_blinking)


        # Connect the signal to the start_blinking method
        self.startBlinkingSignal.connect(self.start_blinking)



    def keyPressEvent(self, event):
        if event.key() in [Qt.Key_Left, Qt.Key_Right, Qt.Key_Up, Qt.Key_Down]:
            # print(f"Pressed {event.key()}")
            self.arrow_key_pressed.emit(event.key()) 
        else:
            super(CamScreen, self).keyPressEvent(event)

    def keyReleaseEvent(self, event):
        if event.key() in [Qt.Key_Left, Qt.Key_Right, Qt.Key_Up, Qt.Key_Down]:
            self.arrow_key_released.emit(event.key()) 
        else:
            super(CamScreen, self).keyReleaseEvent(event) 


    def show_positioned_text(self, textBoxElement : QGraphicsTextItem, text,  posX, posY, color = QColor(1, 225, 40), font = QFont("Arial", 36)):
        textBoxElement.setOpacity(1.0)
        textBoxElement.setPos(posX, posY)
        textBoxElement.setDefaultTextColor(color)
        textBoxElement.setFont(font)
        textBoxElement.setHtml(text)


    def show_positioned_text_temporary(self, textBoxElement : QGraphicsTextItem, text, posX, posY, textBoxTimer: QTimer, intervalMilliseconds = 5000,  color = QColor(1, 225, 40), font = QFont("Arial", 36)):
        textBoxElement.setOpacity(1.0)
        textBoxElement.setPos(posX, posY)
        textBoxElement.setDefaultTextColor(color)
        textBoxElement.setFont(font)


        textBoxElement.setPlainText(text)
        
        textBoxTimer.start(intervalMilliseconds)

    
    def show_alphaD_text(self, value, posX, posY, color = QColor(1, 225, 40), font = QFont("Arial", 36)):
        fullText = 'α<sub>դ.</sub>:' + str(value) 
        self.show_positioned_text(self.alphaD_text_box, fullText, posX, posY, color, font)
    
    def show_mestoC_text(self, value, posX, posY, color = QColor(1, 225, 40), font = QFont("Arial", 36)):
        fullText = 'M<sub>նշ.</sub>:' + str(value) 
        self.show_positioned_text(self.mestoC_text_box, fullText, posX, posY, color, font)
    
    def show_compass_text(self, value, posX, posY, color = QColor(1, 225, 40), font = QFont("Arial", 36)):
        fullText = 'Cmps:' + str(value) 
        self.show_positioned_text(self.compass_text_box, fullText, posX, posY, color, font)
    
    def show_enc_az_zero_text(self, value, posX, posY, color = QColor(1, 225, 40), font = QFont("Arial", 36)):
        fullText = 'Enc Azimuth Zero:' + str(value) 
        self.show_positioned_text(self.enc_az_zero_text_box, fullText, posX, posY, color, font)
    
    def show_azim_angle_text(self, value, posX, posY, color = QColor(1, 225, 40), font = QFont("Arial", 36)):
        fullText = 'Azimuth:' + str(value) 
        self.show_positioned_text(self.azim_angle_text_box, fullText, posX, posY, color, font)
    

    #def show_rangefinder_range_text(self, posX, posY, color = QColor(1, 225, 40), font = QFont("Arial", 36)):
        #self.show_positioned_text(self.rangefinder_text_box, posX, posY, color, font)



    def show_measurement_mode(self, mode):
        self.scene.removeItem(self.measurement_indicator)
        self.measurement_indicator = QGraphicsPixmapItem()
        self.scene.addItem(self.measurement_indicator)
        if mode == 0:
            self.measurement_indicator.setPixmap(self.not_ready_mode_indicator)
            self.measurement_indicator.setPos(0, 200)


        elif mode == 1:
            self.measurement_indicator.setPixmap(self.distance_mode_indicator)
            self.measurement_indicator.setPos(0, 200)


        elif mode == 2:
            self.measurement_indicator.setPixmap(self.target_mode_indicator)
            self.measurement_indicator.setPos(0, 200)

        elif mode == 3:
            self.measurement_indicator.setPixmap(self.expl_mode_indicator)
            self.measurement_indicator.setPos(0, 200)

        elif mode == 4:
            self.measurement_indicator.setPixmap(self.front_mode_indicator)
            self.measurement_indicator.setPos(0, 200)

        # self.viewport().update()


    def start_blinking(self, item, blink_interval=500, duration=5000):
        self.blinking_item = item
        self.blinking = True
        self.blink_timer.start(blink_interval)
        self.blink_duration_timer.start(duration)

    def toggle_visibility(self):
        if self.blinking_item:
            current_opacity = self.blinking_item.opacity()
            self.blinking_item.setOpacity(0.0 if current_opacity > 0 else 1.0)

    def stop_blinking(self):
        self.blinking = False
        self.blink_timer.stop()
        self.blink_duration_timer.stop()
        if self.blinking_item:
            self.blinking_item.setOpacity(1.0)
            self.blinking_item = None



    def show_aim_box(self, zoom, enable_crosshair=True, camera_mode=1):
        
        self.reset_crosshair()
        self.crosshair = QPixmap()
        self.crosshair_item = QGraphicsPixmapItem()
        countme = 0

        if camera_mode == 1:
            # self.crosshair = QPixmap(f'{pictures_base_path}Busol_Reticle/90x.png')
            self.crosshair = QPixmap(f'{pictures_base_path}RedCameraCrossBlacked.png')
            self.crosshair_item = QGraphicsPixmapItem(self.crosshair)
        elif camera_mode == 2:
            self.crosshair = QPixmap(f'{pictures_base_path}GreenCameraCrossBlacked.png')
            self.crosshair_item = QGraphicsPixmapItem(self.crosshair)

        camera_x, camera_y = self.crosshair_corrections.get_correction(camera_mode == 1, zoom)

        self.crosshair_item.setPos(camera_x - (self.crosshair.width() / 2), camera_y - (self.crosshair.height()/2))

        #self.crosshair_item.setPos(960 - (self.crosshair.width() / 2), 540 - (self.crosshair.height()/2))
            # print(self.width())
        # print(self.height()) 

        if countme == 0:
            self.scene.addItem(self.crosshair_item)
            countme = countme + 1

        if enable_crosshair:
            self.crosshair_item.setVisible(True)
        else:
            self.crosshair_item.setVisible(False)

    def reset_crosshair(self):
        #old
        #self.crosshair = QPixmap()
        #self.crosshair_item = QGraphicsPixmapItem()
        #self.crosshair_item.setCacheMode(QGraphicsItem.NoCache)
        self.scene.removeItem(self.crosshair_item)
        self.crosshair_item = QGraphicsPixmapItem()
        self.scene.addItem(self.crosshair_item)

    
    def show_aim_box_zoom_dependent(self, enable_crosshair=True, zoom = 1, camera_mode=1):
        # self.crosshair = QPixmap()
        # self.crosshair_item = QGraphicsPixmapItem()
        # self.crosshair_item.setCacheMode(QGraphicsItem.NoCache)

        countme = 0

        camera_x, camera_y = 960, 540
            
        # self.crosshair = QPixmap()
        # self.crosshair_item = QGraphicsPixmapItem()

        self.reset_crosshair()
        
        day_zoom_paths = {
            68 : "Busol_Reticle/68x.png",            
            60 : "Busol_Reticle/60x.png",            
            30 : "Busol_Reticle/30x.png",            
            15 : "Busol_Reticle/15x.png",            
            5 : "Busol_Reticle/5x.png",            
            1 : "Busol_Reticle/1x.png",            
        }
        
        ir_zoom_paths = {        
            8 : "Busol_Reticle/Thermal_4X.png",            
            4 : "Busol_Reticle/Thermal_3X.png",            
            2 : "Busol_Reticle/Thermal_2X.png",            
            1 : "Busol_Reticle/Thermal_1X.png",            
        }

        if camera_mode == 1:
            
            self.crosshair = QPixmap(f'{pictures_base_path}{day_zoom_paths[zoom]}')

            camera_x, camera_y = self.crosshair_corrections.get_correction(True, zoom)
            # self.crosshair = QPixmap(f'{pictures_base_path}CameraCrossSquaredWithMarks_Zoom90.png')
        elif camera_mode == 2:
            self.crosshair = QPixmap(f'{pictures_base_path}{ir_zoom_paths[zoom]}')
            
            camera_x, camera_y = self.crosshair_corrections.get_correction(False, zoom)

        self.crosshair_item.setPixmap(self.crosshair)

        self.crosshair_item.setPos(camera_x - (self.crosshair.width() / 2), camera_y - (self.crosshair.height()/2))
            # print(self.width())
        # print(self.height()) 

        if countme == 0:
            self.scene.addItem(self.crosshair_item)
            countme = countme + 1

        if enable_crosshair:
            self.crosshair_item.setVisible(True)
        else:
            self.crosshair_item.setVisible(False)

    def shift_aim_box(self, new_ref_pos_x, new_ref_pos_y, mode=1):

        self.ref_pos_x = 960 - (self.crosshair.width() / 2) + new_ref_pos_x
        self.ref_pos_y = 540 - (self.crosshair.height()/ 2) + new_ref_pos_y
        self.crosshair_item.setPos(self.ref_pos_x, self.ref_pos_y)
        
    def shift_aim_box_centered(self, new_ref_pos_x, new_ref_pos_y, mode=1):

        self.ref_pos_x = -(self.crosshair.width() / 2) + new_ref_pos_x
        self.ref_pos_y = -(self.crosshair.height()/ 2) + new_ref_pos_y
        self.crosshair_item.setPos(self.ref_pos_x, self.ref_pos_y)


    def show_temporary_message(self, message, intervalMilliseconds = 1000):
        self.text_box.setOpacity(1.0)
        self.text_box.setPlainText(message)
        
        self.text_box_timer.start(intervalMilliseconds)

    def change_colour(self, neg_pos):
        if(neg_pos == 1):
            self.text_box.setDefaultTextColor(QColor(1, 75, 40))
        elif(neg_pos == 2):
            self.text_box.setDefaultTextColor(QColor(1, 225, 40))


    def hide_message(self):
        self.text_box_timer.stop()
        # self.text_box.setPlainText("")
        self.text_box.setOpacity(0.0)

    def hide_range_message(self):
        self.text_box_timer.stop()
        # self.text_box.setPlainText("")
        self.text_box.setOpacity(0.0)


    @staticmethod
    def calculate_aspect(width: int, height: int) -> str:
        def gcd(a, b):
            return a if b == 0 else gcd(b, a % b)

        r = gcd(width, height)
        x = int(width / r)
        y = int(height / r)

        return f"{x}:{y}"

    def on_new_pixmap(self, pixmap):
        view_pixmap = QPixmap(self.width(), self.height())
        view_pixmap.fill(QColor("black"))

        pos_x = 0
        pos_y = 0
        if pixmap.width() < view_pixmap.width():
            pos_x = (view_pixmap.width() - pixmap.width()) / 2

        painter = QPainter(view_pixmap)
        painter.drawPixmap(pos_x, pos_y, pixmap)
        painter.end()

        self.pix.setPixmap(view_pixmap)
