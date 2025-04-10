import serial
import time

from PySide6.QtCore import Signal, QThread



class SerialHandler(QThread):

    data_received = Signal(list)     
    idata = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]       

    def __init__(self, parent=None):
        super(SerialHandler, self).__init__(parent)
        self.serial = serial.Serial(
            port="/dev/ttyTHS0",
            baudrate=115200,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            bytesize=serial.EIGHTBITS,
            timeout=0
            )
        # self.serial.setDTR(1)
        # self.serial.setRTS(1)
        self.terminate = False

    def finalize(self):
        self.terminate = True

    def connect(self):
        self.serial.close()
        while not self.terminate:
            try:
                self.serial.open()
                self.sleep(1)
                if self.serial.is_open:
                    return
            except serial.SerialException as e:
                print("Failed to connect - retrying!")
                self.sleep(1)

    def run(self) -> None:
        # Reset flag
        self.terminate = False

        self.connect()

        try:
            while not self.terminate:
                # FOR DEBUG
                # self.sleep(5)
                # data = [randrange(0, 128), randrange(0, 128), randrange(1, 4), randrange(1, 4), 0, randrange(1, 5), randrange(0, 128), 255, 255, 30, 255, 45,
                #         10, randrange(0, 3)]
                # self.data_received.emit(data)
                # continue

                try:
                    data = self.serial.readline().decode('ascii', 'ignore')
                    time.sleep(0.25)
                except serial.SerialException:
                    # Disconnected
                    self.connect()
                    continue
                except Exception:
                    # TODO Might need additional handline
                    continue
                if not data:
                    continue
                

                print(data)

                

                if(str(data) == "up\r\n"):
                    self.idata[0] = 1
                elif(str(data) == "down\r\n"):
                    self.idata[1] = 1
                elif(str(data) == "left\r\n"):
                    self.idata[2] = 1
                elif(str(data) == "right\r\n"):
                    self.idata[3] = 1
                elif(str(data) == "cross\r\n"):
                    self.idata[4] = 1
                elif(str(data[:5]) == "brig_"):
                    if(data[7] is None):
                        self.idata[5] = int(data[5:6])
                    else:
                        self.idata[5] = int(data[5:7])
                elif(str(data[:5]) == "cont_"):
                    if(data[7] is None):
                        self.idata[6] = int(data[5:6])
                    else:
                        self.idata[6] = int(data[5:7])
                elif(str(data) == "brig\r\n"):
                    self.idata[7] = 1
                elif(str(data) == "cont\r\n"):
                    self.idata[7] = 2
                elif(str(data) == "neg\r\n"):
                    self.idata[8] = 1    
                elif(str(data) == "pos\r\n"):
                    self.idata[8] = 2
                elif(str(data[:4]) == "zoom"):
                    self.idata[9] = int(data[4])

                self.data_received.emit(self.idata)
                
                for i in range(len(self.idata)):
                    self.idata[i-1] = 0
                # -------- working code from previous version, uncomment when finished --------------
                # data = [i for i in data]
                # self.data_received.emit(self.idata)
                # self.sleep(0.1)
        finally:
            if self.serial.is_open:
                self.serial.close()
