import json
from  TCPDataParsing.command_creator import CommandCreator

json_path = "JSONS/Commands/Drv_IR_Camera_module.json"

def create_IR_Camera_common_command(command_key):
    creator = CommandCreator(json_path, "IR_Camera")
    return creator.create_command("commonCommands", command_key)

def create_IR_Camera_set_command(command_key, data):
    creator = CommandCreator(json_path, "IR_Camera")
    return creator.create_command("setCommands", command_key, data)

def create_IR_Camera_get_command(command_key):
    creator = CommandCreator(json_path, "IR_Camera")
    return creator.create_command("getCommands", command_key)

def create_general_combined_command(command_specs):
    creator = CommandCreator(json_path, "IR_Camera")
    commands = []
    for spec in command_specs:
        category, key, data = spec['category'], spec['key'], spec.get('data', None)
        commands.append((category, key, data))
    return creator.create_combined_command(commands)

# Common Commands
def str_IRCam_white_hot():
    return create_IR_Camera_common_command("str_IRCam_white_hot")
def str_IRCam_black_hot():
    return create_IR_Camera_common_command("str_IRCam_black_hot")
def str_IRCam_Near_focusing():
    return create_IR_Camera_common_command("str_IRCam_Near_focusing")
def str_IRCam_Far_focusing():
    return create_IR_Camera_common_command("str_IRCam_Far_focusing")
def str_IRCam_Stop_focusing():
    return create_IR_Camera_common_command("str_IRCam_Stop_focusing")

# Set Commands
def str_IRCam_set_zoom(data):
    return create_IR_Camera_set_command("str_IRCam_set_zoom", data)
def str_IRCam_set_contrast(data):
    return create_IR_Camera_set_command("str_IRCam_set_contrast", data)
def str_IRCam_set_brithness(data):
    return create_IR_Camera_set_command("str_IRCam_set_brithness", data)

# Get Commands
def str_get_IRCam_status_byte():
    return create_IR_Camera_get_command("str_get_IRCam_status_byte")