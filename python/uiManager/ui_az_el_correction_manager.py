import time
import json, math, os
from pathlib import Path
import PySide6.QtWidgets as qtw

from PySide6.QtCore import Qt, QRegularExpression, QTimer
from PySide6.QtWidgets import QApplication, QMainWindow, QDialog
from PySide6.QtGui import QRegularExpressionValidator, QScreen 

from  uiManager.ui_functions import UI_Functions
from  uiManager.ui_progressbar_manager import ProgressDialog
from models.data_model import DataModel

class AzElCorrectionUI(qtw.QDialog):
    def __init__(self, motion_connection):
        super().__init__()

        self.motion_connection = motion_connection
        self.data_model = DataModel()
        self.ui_progressbar_manager = ProgressDialog()

        self.__WindowStyle()
        self.main_layout = qtw.QHBoxLayout()
        self.setLayout(self.main_layout)
        self.__AzElCorrectionLayout()


    def __AzElCorrectionLayout(self):
        num_regex = QRegularExpression(r'[+-]?\d*$')  # Regex for numbers only
        validator = QRegularExpressionValidator(num_regex, self)

        correcitons_layout = qtw.QHBoxLayout()
        
        az_correction_layout = qtw.QVBoxLayout()
        el_correction_layout = qtw.QVBoxLayout()
        
        az_label =  qtw.QLabel("Azimuth correction")
        az_correction_layout.addWidget(az_label)

        az_generate_zona_label = qtw.QLabel("Zona Count")
        az_generate_zona_label.setStyleSheet("border: 0px;")
        az_correction_layout.addWidget(az_generate_zona_label)
        self.az_generate_zona_lineedit = qtw.QLineEdit()
        self.az_generate_zona_lineedit.setValidator(validator)
        az_correction_layout.addWidget(self.az_generate_zona_lineedit)

        az_generate_btn = qtw.QPushButton("Generate file")
        az_correction_layout.addWidget(az_generate_btn)
        az_generate_btn.clicked.connect(lambda: self.generate_file(False))
        az_set_btn = qtw.QPushButton("Set file")
        az_set_btn.clicked.connect(lambda: self.set_corrections(False))
        az_correction_layout.addWidget(az_set_btn)
        az_reset_btn = qtw.QPushButton("Reset Corrections")
        az_reset_btn.clicked.connect(lambda: self.reset_corrections(False))
        az_correction_layout.addWidget(az_reset_btn)
        az_get_btn = qtw.QPushButton("Get Corrections")
        az_get_btn.clicked.connect(lambda: self.get_corrections(False))
        az_correction_layout.addWidget(az_get_btn)
        
        el_label =  qtw.QLabel("Elevation correction")
        el_correction_layout.addWidget(el_label)

        el_generate_zona_label = qtw.QLabel("Zona Count")
        el_generate_zona_label.setStyleSheet("border: 0px;")
        el_correction_layout.addWidget(el_generate_zona_label)
        self.el_generate_zona_lineedit = qtw.QLineEdit()
        self.el_generate_zona_lineedit.setValidator(validator)
        el_correction_layout.addWidget(self.el_generate_zona_lineedit)

        el_generate_btn = qtw.QPushButton("Generate file")
        el_correction_layout.addWidget(el_generate_btn)
        el_generate_btn.clicked.connect(lambda: self.generate_file(True))
        el_set_btn = qtw.QPushButton("Set file")
        el_set_btn.clicked.connect(lambda: self.set_corrections(True))
        el_correction_layout.addWidget(el_set_btn)
        el_reset_btn = qtw.QPushButton("Reset Corections")
        el_reset_btn.clicked.connect(lambda: self.reset_corrections(True))
        el_correction_layout.addWidget(el_reset_btn)
        el_get_btn = qtw.QPushButton("Get Corrections")
        el_get_btn.clicked.connect(lambda: self.get_corrections(True))
        el_correction_layout.addWidget(el_get_btn)

        correcitons_layout.addLayout(az_correction_layout)
        correcitons_layout.addLayout(el_correction_layout)

        self.main_layout.addLayout(correcitons_layout)

    def generate_file(self, is_elevation):
        if not UI_Functions.yes_no_dialog("The old file will be deleted, do you want to continue?", self):
            return
        
        #encoder_range = self.data_model.getDefValue("encoder_el_range" if is_elevation else "encoder_az_range")[1] 
        encoder_range = self.data_model.encoder_el_range() if is_elevation else self.data_model.encoder_az_range()
        txt = self.el_generate_zona_lineedit.text() if is_elevation else self.az_generate_zona_lineedit.text()
        if not txt.isnumeric():
            return
        
        length = int(txt)
        steps = encoder_range / length
        start = self.data_model.encoder_el_down() if is_elevation else self.data_model.encoder_az_left()
        #data = {}

        #for i in range(length):
        #    value = round(start + (i + 1) * steps)
        #    data[i] = [value, value + 1]
        

        # with open("JSONS/Corrections/El_correction.txt" if is_elevation else "JSONS/Corrections/Az_correction.txt", "w") as outfile:
        #     json.dump(data, outfile, indent=2)
        f = open("JSONS/Corrections/El_correction.txt" if is_elevation else "JSONS/Corrections/Az_correction.txt", "w")
        for i in range(length):
            value = round(start + (i + 1) * steps)
            f.write(f"{i}    ,    {value}    ,    {value + 1}")
            if i != length - 1:
                f.write('\n')
        f.close()

    def read_file(self, is_elevation):
        path = Path(("./JSONS/Corrections/El_correction.txt" if is_elevation else "./JSONS/Corrections/Az_correction.txt"))
        if not path.is_file():
            UI_Functions.show_error_messagebox(f"File doesnt exists")
            return (False, [])


        f = open("JSONS/Corrections/El_correction.txt" if is_elevation else "JSONS/Corrections/Az_correction.txt", "r")
        data2 = f.read()
        txt = data2.replace(" ", "").replace("	", "").split("\n")

        all_values = []
        i = 1
        for t in txt:
            if len(txt) == i and t.count(',') != 2:
                break

            if t.count(',') != 2:
                UI_Functions.show_error_messagebox(f"{i}th line value error")
                return (False, [])
            
            line = t.split(",")
            validate = self.validate_line(line)
            if not validate[1]:
                UI_Functions.show_error_messagebox(f"{i}th line value error")
                return (False, [])
            all_values.append(line)
            i+=1

        f.close()
        return (True, all_values)

    def set_corrections(self, is_elevation):
        if not UI_Functions.yes_no_dialog("The old data will be deleted, do you want to continue?", self):
            return
        
        # with open("JSONS/Corrections/El_correction.json" if is_elevation else "JSONS/Corrections/Az_correction.json", 'r') as file:
        #     data = json.load(file)

        read = self.read_file(is_elevation) 
        if not read[0]:
            return

        all_values = read[1]
        

        self.ui_progressbar_manager.show_progressbar_dialog()
        if is_elevation:
            self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correction_zona_number", len(all_values))
            time.sleep(0.2)
            self.set_data(0, all_values, is_elevation)
        else:
            self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correction_zona_number", len(all_values))
            time.sleep(0.2)
            self.set_data(0, all_values, is_elevation)
        
        # validate = self.validate_data(data)
        # if not validate[1]:
        #     UI_Functions.show_error_messagebox(f"{validate[0]} value error")
        
        # if is_elevation:
        #     self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correction_zona_number", len(data))
        #     for key, value in data.items():
        #         self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correction_member_number", key)
        #         self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correction_member", value[1])
        #         #self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_reference_member", value[1])
        #     self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correctors_matrix_save")
        # else:
        #     self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correction_zona_number", len(data))
        #     for key, value in data.items():
        #         self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correction_member_number", key)
        #         self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correction_member", value[1])
        #         #self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_reference_member", value[1])
        #     self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correctors_matrix_save")
    
    def set_data(self, i, all_values, is_elevation):

        if is_elevation:
            self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correction_member_number", all_values[i][0])
            time.sleep(0.2)
            self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correction_member", all_values[i][2])
        else:   
            self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correction_member_number", all_values[i][0])
            time.sleep(0.2)
            self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correction_member", all_values[i][2])
        
        i += 1
        self.ui_progressbar_manager.progress_bar.setValue((i / len(all_values)) * 100)
        if len(all_values) == i:
            self.ui_progressbar_manager.close()
            QTimer.singleShot(200, lambda : self.save_matrix(is_elevation))
            return
        QTimer.singleShot(200, lambda : self.set_data(i, all_values, is_elevation))

    def save_matrix(self, is_elevation):
        if is_elevation:
            self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correctors_matrix_save")
        else:
            self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correctors_matrix_save")

    def reset_corrections(self, is_elevation):
        if not UI_Functions.yes_no_dialog("The old data will be deleted, do you want to continue?", self):
            return
        
        if is_elevation:
            self.motion_connection.SendCommand("El_enc_crct", "str_El_encoder_correctors_matrix_reset")
        else:
            self.motion_connection.SendCommand("Az_enc_crct", "str_Az_encoder_correctors_matrix_reset")

    def get_corrections(self, is_elevation):
        self.motion_connection.SendCommand("El_enc_crct" if is_elevation else "Az_enc_crct","str_El_encoder_correction_zona_number" if is_elevation else "str_Az_encoder_correction_zona_number", 0)

        self.ui_progressbar_manager.show_progressbar_dialog()
        values = []
        QTimer.singleShot(200, lambda : self.get_corrections_members(0, is_elevation, values))

    def get_corrections_members(self, i, is_elevation, values):
        if i != 0:
            zona_member =  int(self.data_model.getProperty('El_enc_cr_Mem' if is_elevation else 'Az_enc_cr_Mem'))
            values.append(zona_member)

        zona_number =  int(self.data_model.getProperty('El_enc_cr_ZN' if is_elevation else 'Az_enc_cr_ZN'))
        if zona_number == 0:
            self.ui_progressbar_manager.close()
            self.write_corrections(values, is_elevation)
            return
        
        self.ui_progressbar_manager.progress_bar.setValue((i / zona_number) * 100)

        if zona_number <= i:
            self.ui_progressbar_manager.close()
            self.write_corrections(values, is_elevation)
            return
        
        self.motion_connection.SendCommand("El_enc_crct" if is_elevation else "Az_enc_crct","str_get_El_encoder_correction_member" if is_elevation else "str_get_Az_encoder_correction_member", i)
        i += 1
        QTimer.singleShot(200, lambda : self.get_corrections_members(i, is_elevation, values))

    def write_corrections(self, values, is_elevation):

        encoder_range = self.data_model.encoder_el_range() if is_elevation else self.data_model.encoder_az_range()
        steps = encoder_range / len(values)
        start = self.data_model.encoder_el_down() if is_elevation else self.data_model.encoder_az_left()

        path = 'JSONS/Corrections/exported_El_correction' if is_elevation else 'JSONS/Corrections/exported_Az_correction'
        with open(path, 'w') as file:
            for i in range(len(values)):
                file.write(f"{i},   {round(start + (i + 1) * steps)},    {values[i]}\n")

        read = self.read_file(is_elevation) 
        if not read[0]:
            return

        if len(values) != len(read[1]):
            UI_Functions.show_error_messagebox(f"Different values")
            return
        for i in range(len(values)):
            if int(read[1][i][2]) != values[i]:
                UI_Functions.show_error_messagebox(f"Different values ({i})")
                return
        UI_Functions.show_info_messagebox(f"Everything is fine")

    def validate_data(self, data):
        for key, value in data.items():
            if (not str(key).isnumeric()) or (not str(value[0]).isnumeric()) or (not str(value[1]).isnumeric()):
                return (key, False)
        return (0, True)
    
    def validate_line(self, txt):
        if (not str(txt[0]).isnumeric()) or (not str(txt[1]).isnumeric()) or (not str(txt[2]).isnumeric()):
            return (txt[0], False)
        return (0, True)

    def AzElCorrectionUI_Show(self):
        self.show()

    #Window style
    def __WindowStyle(self):
        self.setWindowTitle("3D_01_TESTER_AZ_EL_CORRECTIONS")
        center = QScreen.availableGeometry(QApplication.primaryScreen()).center()
        self.setFixedSize(350, 250)
        x = (center.x() - self.width()/2) 
        y = (center.y() - self.height()/2) 
        self.move(x, y)
        self.setModal(True)
