import threading
from PySide6.QtCore import QObject, Signal
import random
import json

class DataModel(QObject):
    _instance = None
    _lock = threading.Lock()
    propertyChanged = Signal(str, object)

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if not cls._instance:
                cls._instance = super(DataModel, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if hasattr(self, '_initialized'): return
        super(DataModel, self).__init__()
        self._properties = {
            'joystick_Az': 0,
            'joystick_El': 0,
            'board_volt': 0,
            'MC_Tmpr_ADC': 0,
            'Encoder_Az': 0,
            'Encoder_El': 0,
            'curr_pos_Az': 0,
            'curr_pos_El': 0,
            'Enc_Az_crct': 0,
            'Enc_El_crct': 0,

            'Az_enc_cr_ZN' : 0,
            'El_enc_cr_ZN' : 0,
            'Az_enc_cr_Mem' : 0,
            'El_enc_cr_Mem' : 0,

            'incl_t': 0,
            # 'incl_X_a': 0,
            # 'incl_Y_a': 0,
            'incl_X_ag': 0.0,
            'incl_Y_ag': 0.0,
            'T_incl_X_ag': 0.0,
            'T_incl_Y_ag': 0.0,
            'cmps_ag': 0.0,
            'GPS_Lat': 0.0,
            'GPS_Lng': 0.0,
            'GPS_Alt': 0.0,  
            'GPS_Time': 0,
            # 'GPS_3': 0,
            # 'GPS_4': 0,
            # 'GPS_5': 0,
            # 'GPS_6': 0,
            #LRF
            'LRF_Range_1': 0,
            'LRF_Range_2': 0,
            'LRF_Range_3': 0,
            'LRF_status': 0,
            'LRF_current_mode': 0,
            'LRF_3.3V':0,
            'LRF_5V':0,
            'LRF_HV':0,
            'LRF_BatV':0,
            'LRF_Tempr':0,
            'LRF_BlndZn':0,
            # Angular Props
            'alphaD': 0,
            'mestoC': 0,
            'azimuth_angle': 0.0,
            'elevation_angle': 0.0,
            'encoder_azimuth_zero': 0.0,
            'delta_azimuthal_bearing': 0.0,
            'encoder_azimuth_zero_is_set': False,
            # Camera Props
            'camera_position_X': 0.0,
            'camera_position_Y': 0.0,
            'camera_position_Lat': 0.0,
            'camera_position_Lng': 0.0,
            'camera_H': 0.0,
            'camera_position_is_set': False,
            'day_zoom' : 1,
            'IR_zoom' : 1,

            # Target Props
            'measured_position_X': 0.0,
            'measured_position_Y': 0.0,
            'measured_position_Lat': 0.0,
            'measured_position_Lng': 0.0,
            'measured_elevation': 0.0,            
            'LRF_is_busy': False,      



            # Constant Corrections From Device
            'CC_cmps_ofst': 0.0,
            'CC_H_V_angle' : 0.0,
            'CC_inclX_ofst': 0.0,
            'CC_inclY_ofst': 0.0,
            'CC_err_angl_l': 0.0,
            'CC_err_angl_k': 0.0, 

            # DAY Zooms' crosshair positions
            'CC_DCm_bX_x1' : 960,
            'CC_DCm_bY_x1' : 540,

            'CC_DCm_bX_x5' : 960,
            'CC_DCm_bY_x5' : 540,

            'CC_DCm_bX_x15' : 960,
            'CC_DCm_bY_x15' : 540,

            'CC_DCm_bX_x30' : 960,
            'CC_DCm_bY_x30' : 540,

            'CC_DCm_bX_x60' : 960,
            'CC_DCm_bY_x60' : 540,

            'CC_DCm_bX_x68' : 960,
            'CC_DCm_bY_x68' : 540,

            # IR Zooms' crosshair positions
            'CC_IRC_bX_x1' : 960,
            'CC_IRC_bY_x1' : 540,

            'CC_IRC_bX_x2' : 960,
            'CC_IRC_bY_x2' : 540,

            'CC_IRC_bX_x4' : 960,
            'CC_IRC_bY_x4' : 540,

            'CC_IRC_bX_x8' : 960,
            'CC_IRC_bY_x8' : 540,
            

        }

        self.__default_values = {
            'accel_az' : 20,
            'min_freq_az' : 200,
            'max_freq_az' : 2000,

            'accel_el' : 20,
            'min_freq_el' : 200,
            'max_freq_el' : 2000,

            'accel_az_range': (1, 200),
            'min_freq_az_range': (1, 4000),
            'max_freq_az_range': (1, 20000),
            'accel_el_range': (1, 200),
            'min_freq_el_range': (1, 4000),
            'max_freq_el_range': (1, 20000),

            'encoder_az_range' : (0, 271000),
            'encoder_el_range' : (0, 262143),
            'step_az_range' : (-210000, 210000),
            'step_el_range' : (-50000, 50000),
            'degree_az_range' : (-210, 210),
            'degree_el_range' : (-90, 90),
            'inclinometer_el_range' : (-20, 30),

            'encoder_az2degree' : 0.0013732910302,
            'step_az2degree' : 0.00141732283, 
            'encoder_el2degree' :  0.0013732910302,
            'step_el2degree' : 0.0009,
            'elevation_null_point' : 131000,
            'az_null_point' : 136000,

            'zoom_range': (1, 68),
            'zoom_fixed_day' : (1, 5, 15, 30, 60, 68),
            'zoom_fixed_IR' : (1, 2, 4, 8),

            'IR_brightness_range': (-32, 31),
            'IR_contrast_range': (0, 63),
            'IR_brightness': 20,
            'IR_contrast': 20,
            
            'LRF_range':(0, 1700),
            'LRF_measurement_mode' : (("single", "command"), ("2hz", "command"))
        }

        self.el_enc_crct_file_path = "JSONS/Corrections/El_encoder_correction_constants.json"
        self._initialized = True

        self.Camera_window = None

    def setProperty(self, key, value, force = False):
        if self._properties.get(key) != value or force:
            with self._lock:
                self._properties[key] = value
        self.propertyChanged.emit(key, value) 

    def getProperty(self, key):
        with self._lock:
            return self._properties.get(key, None)
    

    def getDefValue(self, key):
        while self._lock:
            return self.__default_values.get(key, None)

    def degree2encoder_az(self, value):
        encoder = self.getDefValue("az_null_point") + value * 1 / self.getDefValue("encoder_az2degree")
        return encoder
    def encoder_az2degree(self, value):
        degree = (value - self.getDefValue("az_null_point")) * self.getDefValue("encoder_az2degree")
        return round(degree, 3)

    def degree2encoder_el(self, value):
        return self.getDefValue("elevation_null_point") + value * 1 / self.getDefValue("encoder_el2degree")
    def encoder_el2degree(self, value):
        degree = (value - self.getDefValue("elevation_null_point")) * self.getDefValue("encoder_el2degree")
        return round(degree,3)
    
    def encoder_az_left(self):
        return self.getDefValue("az_null_point") - (185 / self.getDefValue("encoder_az2degree"))
    def encoder_az_right(self):
        return self.getDefValue("az_null_point") + (185 / self.getDefValue("encoder_az2degree"))
    def encoder_az_range(self):
        return self.encoder_az_right() - self.encoder_az_left()
    
    def encoder_el_down(self):
        return self.getDefValue("elevation_null_point") - (40 / self.getDefValue("encoder_el2degree"))
    def encoder_el_up(self):
        return self.getDefValue("elevation_null_point") + (40 / self.getDefValue("encoder_el2degree"))
    def encoder_el_range(self):
        return self.encoder_el_up() - self.encoder_el_down()
    
    #Correction settings
    def compass_offset(self, value):
        return int(value * 100)
    def inclinometer_offset(self, value):
        return int(value * 1000 + 131000)
    def error_angle_l_k(self, value):
        return int(value * 10)
    
    def inlinometer2elevation(self, value):
        return int((value * 1000))
    
    def set_null_point(self, connection_type):
        az_null_point = self.getDefValue("az_null_point")
        elevation_null_point = self.getDefValue("elevation_null_point")

        connection_type.SendCommand("stmd", "str_STMD_set_turget_position_encoder_Az", int(az_null_point))
        connection_type.SendCommand("stmd", "str_STMD_set_turget_position_encoder_El", int(elevation_null_point))
    
    def zoom_day_camera(self, connection_type, zoom):
        self.setProperty("day_zoom", zoom)
        connection_type.SendCommand("Dey_Camera", "str_DeyCam_set_zoom", zoom)
    def zoom_IR_camera(self, connection_type, zoom):
        self.setProperty("IR_zoom", zoom)
        connection_type.SendCommand("IR_Camera", "str_IRCam_set_zoom", zoom)

    def set_el_enc_crct(self, connection_type):
        pass
        # Open the file and read its contents
        #with open(self.el_enc_crct_file_path, 'r') as file:
        #    data = json.load(file)
        # Iterating over keys and values
        # for key, value in data.items():
        #     connection_type.SendCommand("El_enc_crct", "str_El_encoder_correction_zona_number", key)
        #     connection_type.SendCommand("El_enc_crct", "", value[0])
        #     connection_type.SendCommand("El_enc_crct", "", value[1])
    