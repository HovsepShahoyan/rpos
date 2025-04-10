import PySide6.QtWidgets as qtw
import PySide6.QtGui as qtg

class UI_Functions:
    @staticmethod
    def enable_disable_attempt(client_ui, connection_type, enable):
        if connection_type == client_ui.motion_connection:
            client_ui.motion_connect_button.setEnabled(enable)
            client_ui.motion_ip_line_edit.setEnabled(enable)
            client_ui.motion_port_line_edit.setEnabled(enable)
        else:
            client_ui.devices_connect_button.setEnabled(enable)
            client_ui.devices_ip_line_edit.setEnabled(enable)
            client_ui.devices_port_line_edit.setEnabled(enable)

    @staticmethod
    def connection_label_message(client_ui, connection_type, message: str):
        if connection_type == client_ui.motion_connection:
            client_ui.motion_connection_info_label.setText(message)
        else:
            client_ui.devices_connection_info_label.setText(message)

    @staticmethod
    def connection_error_ui(client_ui, connection_type, message: str):
        UI_Functions.connection_label_message(client_ui, connection_type, message)
        UI_Functions.show_error_messagebox(message)
        UI_Functions.enable_disable_attempt(client_ui, connection_type, True)

    @staticmethod
    def enable_disable__btn_ui(client_ui, connection_type, enabled):
        if connection_type == client_ui.motion_connection:
            client_ui.motion_disconnect_button.setEnabled(enabled)
        else:
            client_ui.devices_disconnect_button.setEnabled(enabled)

    
    @staticmethod
    def show_error_messagebox(Info: str):
        msg = qtw.QMessageBox()
        msg.setIcon(qtw.QMessageBox.Icon.Critical)
        msg.setText(Info)
        msg.setWindowTitle("Error MessageBox")
        msg.setStandardButtons(qtw.QMessageBox.StandardButton.Ok)
        msg.exec()
    
    @staticmethod
    def show_info_messagebox(Info: str):
        msg = qtw.QMessageBox()
        msg.setIcon(qtw.QMessageBox.Icon.Information)
        msg.setText(Info)
        msg.setWindowTitle("Info MessageBox")
        msg.setStandardButtons(qtw.QMessageBox.StandardButton.Ok)
        msg.exec()

    @staticmethod
    def yes_no_dialog(Info: str, parent):
        msg = qtw.QMessageBox(parent)

        msg.setIcon(qtw.QMessageBox.Question)
        msg.setWindowTitle("Message Box")
        msg.setText(Info)
        msg.setStandardButtons(qtw.QMessageBox.Yes | qtw.QMessageBox.No)
        response = msg.exec()

        return response == qtw.QMessageBox.Yes
    