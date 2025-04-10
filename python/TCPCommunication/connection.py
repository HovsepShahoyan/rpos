from  TCPCommunication import client_network
from  uiManager import ui_conection_manager

import logging
logging.basicConfig()
log = logging.getLogger()

class Connection:

    def __init__(self):
        self.communication = client_network.TCPNetworkCommunication()
        self.network = client_network.ClientNetwork(self.communication)

        self.network.connected.connect(self.__connected)
        self.network.errorOccurred.connect(self.__connection_error)
        self.network.disconnected.connect(self.__disconnected)
        self.network.dataReceived.connect(self.__datareceived)
        
        self.connected = False
        self.IP = "0"
        self.Port = 0

    def Connect(self, ip: str, port: int):
        self.network.makeRequest(ip, port)
        self.IP = ip
        self.Port = port
    def Disconnect(self):
        self.network.disconnect()
    def SendCommand(self, module_name, command_name, data = None):
        if self.connected:
            self.network.sendCommand(module_name, command_name, data)

    def __connected(self):
        self.connected = True
    def __connection_error(self):
        self.connected = False
        #self.IP = "0"
        #self.Port = 0
    def __disconnected(self):
        self.connected = False
        #self.IP = "0"
        #self.Port = 0
    def __datareceived(self, data: str):
        pass