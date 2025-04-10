from PySide6.QtCore import QTimer
from PySide6.QtWidgets import QLabel



class LabelButton(QLabel):

    def __init__(self, *args, **kwargs):
        super(LabelButton, self).__init__(*args, **kwargs)

        self.timer = QTimer(parent=self)
        self.timer.timeout.connect(self.disable)

    def enable(self):
        self.timer.stop()
        self.setEnabled(True)
        self.timer.start(700)

    def disable(self):
        self.setEnabled(False)
