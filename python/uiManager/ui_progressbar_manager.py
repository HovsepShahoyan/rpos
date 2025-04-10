import PySide6.QtWidgets as qtw

from PySide6.QtCore import Qt, QSize, QRegularExpression
from PySide6.QtCore import QRegularExpression
from PySide6.QtGui import QRegularExpressionValidator, QScreen 
from PySide6.QtWidgets import QApplication, QMainWindow, QDialog

class ProgressDialog(qtw.QDialog):
    def __init__(self):
        super().__init__()

        self.__WindowStyle()

        # Create layout
        layout = qtw.QVBoxLayout()
        # Create label to describe progress
        self.label = qtw.QLabel("Processing...", self)
        layout.addWidget(self.label)
        # Create the progress bar
        self.progress_bar = qtw.QProgressBar(self)
        self.progress_bar.setRange(0, 100)  # Min and max range
        layout.addWidget(self.progress_bar)

        self.setLayout(layout)

    def show_progressbar_dialog(self):
        self.show()
        self.raise_()
        #Window style
    def __WindowStyle(self):
        self.setWindowTitle("3D_01_TESTER_Progress_bar")
        center = QScreen.availableGeometry(QApplication.primaryScreen()).center()
        self.setFixedSize(350, 100)
        x = (center.x() - self.width()/2) 
        y = (center.y() - self.height()/2) 
        self.move(x, y)
        self.setModal(True)

    def closeEvent(self, event):
        if self.progress_bar.value() <= 0 or self.progress_bar.value() >= 90:
            event.accept()
        else:
            event.ignore()