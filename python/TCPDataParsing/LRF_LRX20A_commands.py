import json
from  TCPDataParsing.command_creator import CommandCreator

json_path = "JSONS/Commands/Drv_LRF_LRX20A_module.json"

def create_LRF_LRX20A_common_command(command_key):
    creator = CommandCreator(json_path, "LRF_LRX20A")
    return creator.create_command("commonCommands", command_key)

def create_LRF_LRX20A_set_command(command_key, data):
    creator = CommandCreator(json_path, "LRF_LRX20A")
    return creator.create_command("setCommands", command_key, data)

def create_LRF_LRX20A_get_command(command_key):
    creator = CommandCreator(json_path, "LRF_LRX20A")
    return creator.create_command("getCommands", command_key)

def create_general_combined_command(command_specs):
    creator = CommandCreator(json_path, "LRF_LRX20A")
    commands = []
    for spec in command_specs:
        category, key, data = spec['category'], spec['key'], spec.get('data', None)
        commands.append((category, key, data))
    return creator.create_combined_command(commands)

# Common Commands
def str_LRF_Request_diagnostic_data():
    return create_LRF_LRX20A_common_command("str_LRF_Request_diagnostic_data")
def str_LRF_single_range_measurument():
    return create_LRF_LRX20A_common_command("str_LRF_single_range_measurument")
def str_LRF_Quick_1_single_range_measurument():
    return create_LRF_LRX20A_common_command("LRF_Q1SgRengM")
def str_LRF_Quick_2_single_range_measurument():
    return create_LRF_LRX20A_common_command("LRF_Q2SgRengM")
def str_LRF_Pointer_OFF():
    return create_LRF_LRX20A_common_command("str_LRF_Pointer_OFF")
def str_LRF_Pointer_ON():
    return create_LRF_LRX20A_common_command("str_LRF_Pointer_ON")
def str_LRF_Save_Settings():
    return create_LRF_LRX20A_common_command("str_LRF_Save_Settings")
def str_LRF_Check_optical_crosstalk():
    return create_LRF_LRX20A_common_command("str_LRF_Check_optical_crosstalk")

# Set Commands
def str_LRF_set_Minimum_Range(data):
    return create_LRF_LRX20A_set_command("str_LRF_set_Minimum_Range", data)

# Get Commands
def str_g_LRF_status():
    return create_LRF_LRX20A_get_command("str_g_LRF_status")
def str_g_LRF_range_1():
    return create_LRF_LRX20A_get_command("str_g_LRF_range_1")
def str_g_LRF_range_2():
    return create_LRF_LRX20A_get_command("str_g_LRF_range_2")
def str_g_LRF_range_3():
    return create_LRF_LRX20A_get_command("str_g_LRF_range_3")
def str_g_LRF_signal_level_1():
    return create_LRF_LRX20A_get_command("g_LRF_SgLvl_1")
def str_g_LRF_signal_level_2():
    return create_LRF_LRX20A_get_command("g_LRF_SgLvl_2")
def str_g_LRF_signal_level_3():
    return create_LRF_LRX20A_get_command("g_LRF_SgLvl_3")
def str_g_LRF_blind_zone():
    return create_LRF_LRX20A_get_command("str_g_LRF_blind_zone")
def str_g_Cumulative_light_output_data():
    return create_LRF_LRX20A_get_command("str_g_Cumulative_light_output_data")
def str_g_LRF_3_3V():
    return create_LRF_LRX20A_get_command("str_g_LRF_3_3V")
def str_g_LRF_5V():
    return create_LRF_LRX20A_get_command("str_g_LRF_5V")
def str_g_LRF_High_Volt():
    return create_LRF_LRX20A_get_command("str_g_LRF_High_Volt")
def str_g_LRF_Battery_V():
    return create_LRF_LRX20A_get_command("str_g_LRF_Battery_V")
def str_g_LRF_Receiver_Temperature():
    return create_LRF_LRX20A_get_command("str_g_LRF_Receiver_Temperature")
def str_g_LRF_optical_crosstalk_effect_range():
    return create_LRF_LRX20A_get_command("str_g_LRF_optical_crosstalk_effect_range")

