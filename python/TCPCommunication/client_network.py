from PySide6.QtCore import QDataStream, QIODevice, QObject, Signal
from PySide6.QtNetwork import QTcpSocket, QAbstractSocket

import importlib


# Command Factory Interface
class ICommandFactory:
    def generate_command(self, module_name, command_name, data=None):
        pass

    def generate_combined_command(self, module_name, command_name, data=None):
        pass

# Network Communication Interface
class INetworkCommunication:
    def connect(self, host: str, port: int):
        pass

    def disconnect(self):
        pass

    def send_message(self, message: str):
        pass

    def setup_signals(self, connected: Signal, disconnected: Signal, errorOccurred: Signal, dataReceived: Signal):
        pass


# Command Factory
class CommandFactory(ICommandFactory):
    def __init__(self):
        self.command_module_base = "TCPDataParsing"

    def generate_command(self, module_name, command_name, data=None):
        command_module = importlib.import_module(f"{self.command_module_base}.{module_name}_commands")
        command_function = getattr(command_module, command_name)
        return command_function(data) if data is not None else command_function()

    def generate_combined_command(self, module_name, command_name, data=[None]):
        # Implement combined command logic if necessary
        command_module = importlib.import_module(f"{self.command_module_base}.{module_name}_commands")
        command_function = getattr(command_module, command_name)
        return self.generate_command(module_name, command_name, data)
    


# Network Client
class ClientNetwork(QObject):

    
    connected = Signal()
    disconnected = Signal()
    errorOccurred = Signal(str)
    dataReceived = Signal(str)
    
    def __init__(self, network_communication: INetworkCommunication):
        super().__init__()
        self.commandFactory = CommandFactory()
        self.networkCommunication = network_communication
        self.networkCommunication.setup_signals(self.connected, self.disconnected, self.errorOccurred, self.dataReceived)

    def sendCommand(self, module_name, command_name, data=None):
        command = self.commandFactory.generate_command(module_name, command_name, data)
        self.networkCommunication.send_message(command)

    def sendCombinedCommand(self, module_name, command_name, data=None):
        command = self.commandFactory.generate_combined_command(module_name, command_name, data)
        self.networkCommunication.send_message(command)

    def makeRequest(self, host: str, port: int):
        self.networkCommunication.connect(host, port)

    def sendRawMessage(self, message:str):
        self.networkCommunication.send_message(message)

    def disconnect(self):
        self.networkCommunication.disconnect()


class TCPNetworkCommunication(INetworkCommunication):
    def __init__(self):
        self.tcpSocket = QTcpSocket()

    def connect(self, host: str, port: int):
        self.tcpSocket.connectToHost(host, port, QTcpSocket.ReadWrite)

    def disconnect(self):
        self.tcpSocket.disconnectFromHost()

    def send_message(self, message: str):
        if message:
            self.tcpSocket.write(message.encode())
            print(message)

    def setup_signals(self, connected: Signal, disconnected: Signal, errorOccurred: Signal, dataReceived: Signal):
        self.tcpSocket.connected.connect(connected.emit)
        self.tcpSocket.disconnected.connect(disconnected.emit)
        self.tcpSocket.errorOccurred.connect(lambda e: errorOccurred.emit(str(e)))
        self.tcpSocket.readyRead.connect(lambda: self._handle_data_received(dataReceived))


    def _handle_data_received(self, dataReceived: Signal):
        while self.tcpSocket.bytesAvailable():
            response = self.tcpSocket.readAll().data()
            if response:
                decoded_response = response.decode('ascii')
                dataReceived.emit(decoded_response)
