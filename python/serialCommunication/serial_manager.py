import serial
from PySide6.QtCore import QObject, Signal, Slot

class SerialManager(QObject):
    data_received = Signal(str)

    def __init__(self, serial_port='/dev/ttyUSB0', baudrate=9600):
        super().__init__()
        # self.serial_port = serial.Serial(serial_port, baudrate)
        # self.serial_port.timeout = 1  # Set a timeout for reading

    @Slot()
    def read_serial_data(self):
        while True:
            data = self.serial_port.readline().decode('utf-8').strip()
            if data:
                self.data_received.emit(data)