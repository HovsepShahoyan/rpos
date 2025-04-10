from PySide6.QtWidgets import (QApplication, QDialog, QVBoxLayout, QPushButton, QLineEdit, QFileDialog, 
                               QMessageBox, QProgressBar)
from PySide6.QtCore import Signal, Slot, QTimer
import sys

class FileParserDialog(QDialog):
    parsed_line = Signal(int, int, int)  # Signal to emit parsed values

    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle("File Parser")
        self.setGeometry(100, 100, 400, 200)

        self.layout = QVBoxLayout()

        self.select_file_button = QPushButton("Select File", self)
        self.select_file_button.clicked.connect(self.select_file)
        self.layout.addWidget(self.select_file_button)

        self.file_path_line_edit = QLineEdit(self)
        self.file_path_line_edit.setReadOnly(True)
        self.layout.addWidget(self.file_path_line_edit)

        self.send_command_button = QPushButton("Send Commands", self)
        self.send_command_button.clicked.connect(self.send_commands)
        self.layout.addWidget(self.send_command_button)

        self.progress_bar = QProgressBar(self)
        self.layout.addWidget(self.progress_bar)

        self.setLayout(self.layout)

    def select_file(self):
        file_dialog = QFileDialog()
        file_path, _ = file_dialog.getOpenFileName(self, "Open File", "", "Text Files (*.txt);;All Files (*)")
        if file_path:
            self.file_path_line_edit.setText(file_path)

    def send_commands(self):
        file_path = self.file_path_line_edit.text()
        if not file_path:
            QMessageBox.warning(self, "No File Selected", "Please select a file before sending commands.")
            return

        self.command_queue = list(self.parse_file(file_path))
        self.progress_bar.setMaximum(len(self.command_queue))
        self.progress_bar.setValue(0)
        self.send_next_command()

    def send_next_command(self):
        if self.command_queue:
            zone, delta_degree, delta_encoder = self.command_queue.pop(0)
            self.parsed_line.emit(zone, delta_degree, delta_encoder)
            self.progress_bar.setValue(self.progress_bar.maximum() - len(self.command_queue))
            QTimer.singleShot(250, self.send_next_command)

    def parse_file(self, file_path):
        with open(file_path, 'r') as file:
            for _ in range(2):
                next(file)
            for line in file:
                parts = line.strip().split(',')
                if len(parts) == 3:
                    zone = int(parts[0].strip())
                    delta_degree = int(parts[1].strip())
                    delta_encoder = int(parts[2].strip())
                    yield zone, delta_degree, delta_encoder

if __name__ == "__main__":
    app = QApplication(sys.argv)
    dialog = FileParserDialog()
    dialog.show()
    sys.exit(app.exec())
