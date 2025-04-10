import json
from  TCPDataParsing.command_creator import CommandCreator

json_path = "JSONS/Commands/Drv_Day_Camera_module.json"

def create_Dey_Camera_common_command(command_key):
    creator = CommandCreator(json_path, "Dey_Camera")
    return creator.create_command("commonCommands", command_key)

def create_Dey_Camera_set_command(command_key, data):
    creator = CommandCreator(json_path, "Dey_Camera")
    return creator.create_command("setCommands", command_key, data)

def create_Dey_Camera_get_command(command_key):
    creator = CommandCreator(json_path, "Dey_Camera")
    return creator.create_command("getCommands", command_key)

def create_general_combined_command(command_specs):
    creator = CommandCreator(json_path, "Dey_Camera")
    commands = []
    for spec in command_specs:
        category, key, data = spec['category'], spec['key'], spec.get('data', None)
        commands.append((category, key, data))
    return creator.create_combined_command(commands)

# Common Commands
def str_DeyCam_zoom_stop():
    return create_Dey_Camera_common_command("str_DeyCam_zoom_stop")
def str_DeyCam_zoom_tele():
    return create_Dey_Camera_common_command("str_DeyCam_zoom_tele")
def str_DeyCam_zoom_wide():
    return create_Dey_Camera_common_command("str_DeyCam_zoom_wide")

# Set Commands
def str_DeyCam_set_zoom(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_zoom", data)
def str_DeyCam_set_AE_Mode(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_AE_Mode", data)
def str_DeyCam_set_Dzoom_Mode(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_Dzoom_Mode", data)
def str_DeyCam_set_move_Bright(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_move_Bright", data)
def str_DeyCam_set_Bright(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_Bright", data)
def str_DeyCam_set_AF_on_off(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_AF_on_off", data)
def str_DeyCam_set_AF_Near_Limit_Mode(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_AF_Near_Limit_Mode", data)
def str_DeyCam_set_Dzoom_parametric(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_Dzoom_parametric", data)
def str_DeyCam_set_DNR_level(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_DNR_level", data)
def str_DeyCam_set_move_focuse(data):
    return create_Dey_Camera_set_command("str_DeyCam_set_move_focuse", data)

# Get Commands
def str_get_DeyCam_zoom_INQUIRY_data():
    return create_Dey_Camera_get_command("str_get_DeyCam_zoom_INQUIRY_data")