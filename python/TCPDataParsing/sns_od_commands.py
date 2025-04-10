import json
from  TCPDataParsing.command_creator import CommandCreator

json_path = "JSONS/Commands/Drv_Sensors_Od_module.json"

def create_sns_common_command(command_key):
    creator = CommandCreator(json_path, "Sns_OD")
    return creator.create_command("commonCommands", command_key)

def create_sns_set_command(command_key, data):
    creator = CommandCreator(json_path, "Sns_OD")
    return creator.create_command("setCommands", command_key, data)

def create_sns_get_command(command_key):
    creator = CommandCreator(json_path, "Sns_OD")
    return creator.create_command("getCommands", command_key)

def create_general_combined_command(command_specs):
    creator = CommandCreator(json_path, "Sns_OD")
    commands = []
    for spec in command_specs:
        category, key, data = spec['category'], spec['key'], spec.get('data', None)
        commands.append((category, key, data))
    return creator.create_combined_command(commands)

# Common Commands
def str_On():
    return create_sns_common_command("str_On")
def str_Off():
    return create_sns_common_command("str_Off")
def str_Polling_Sensors_Off():
    return create_sns_common_command("str_Polling_Sensors_Off")
def str_Polling_Sensors_On():
    return create_sns_common_command("str_Polling_Sensors_On")
def str_Polling_Sensors():
    return create_sns_common_command("str_Polling_Sensors")
def str_compass_start_horizontal_calibration():
    return create_sns_common_command("str_compass_start_horizontal_calibration")
def str_compass_save_horizontal_calibration():
    return create_sns_common_command("str_compass_save_horizontal_calibration")

# Set Commands

# Get Commands
def str_get_inclinometer_temperature():
    return create_sns_get_command("str_get_inclinometer_temperature")
def str_get_inclinometer_X_accel():
    return create_sns_get_command("str_get_inclinometer_X_accel")
def str_get_inclinometer_Y_accel():
    return create_sns_get_command("str_get_inclinometer_Y_accel")
def str_get_inclinometer_X_angle():
    return create_sns_get_command("str_get_inclinometer_X_angle")
def str_get_inclinometer_Y_angle():
    return create_sns_get_command("str_get_inclinometer_Y_angle")
def str_get_T_C_inclinometer_X_angle():
    return create_sns_get_command("str_get_T_C_inclinometer_X_angle")
def str_get_T_C_inclinometer_Y_angle():
    return create_sns_get_command("str_get_T_C_inclinometer_Y_angle")
def str_get_compass_angle():
    return create_sns_get_command("str_get_Temperature_Corrected_compass_angle")
def str_get_GPS_0():
    return create_sns_get_command("str_get_GPS_0")
def str_get_GPS_1():
    return create_sns_get_command("str_get_GPS_1")
def str_get_GPS_2():
    return create_sns_get_command("str_get_GPS_2")
def str_get_GPS_3():
    return create_sns_get_command("str_get_GPS_3")
def str_get_GPS_4():
    return create_sns_get_command("str_get_GPS_4")
def str_get_GPS_5():
    return create_sns_get_command("str_get_GPS_5")
def str_get_GPS_6():
    return create_sns_get_command("str_get_GPS_6")
def str_get_GPS_status():
    return create_sns_get_command("str_get_GPS_status")



# Example usage
# common_command = str_STMD_on()
# set_command = str_STMD_set_min_frequency_Az(10)
# get_command = str_get_El_corrected()

# print(common_command)
# print(set_command)
# print(get_command)
