import json
from  TCPDataParsing.command_creator import CommandCreator

json_path = "JSONS/Commands/correction_constants_module.json"

def create_Correct_constOD_common_command(command_key):
    creator = CommandCreator(json_path, "Correct_constOD")
    return creator.create_command("commonCommands", command_key)

def create_Correct_constOD_set_command(command_key, data):
    creator = CommandCreator(json_path, "Correct_constOD")
    return creator.create_command("setCommands", command_key, data)

def create_Correct_constOD_get_command(command_key):
    creator = CommandCreator(json_path, "Correct_constOD")
    return creator.create_command("getCommands", command_key)

def create_general_combined_command(command_specs):
    creator = CommandCreator(json_path, "Correct_constOD")
    commands = []
    for spec in command_specs:
        category, key, data = spec['category'], spec['key'], spec.get('data', None)
        commands.append((category, key, data))
    return creator.create_combined_command(commands)

# Common Commands
def str_CC_set_get_full_CC():
    return create_Correct_constOD_common_command("str_CC_set_get_full_CC")

# Set Commands
def str_CC_set_compass_offset(data):
    return create_Correct_constOD_set_command("str_CC_set_compass_offset",data)
def str_CC_set_inclinometer_angle_X_offset(data):
    return create_Correct_constOD_set_command("str_CC_set_inclinometer_angle_X_offset",data)
def str_CC_set_inclinometer_angle_Y_offset(data):
    return create_Correct_constOD_set_command("str_CC_set_inclinometer_angle_Y_offset",data)
def str_CC_set_horizontal_vertical_angle(data):
    return create_Correct_constOD_set_command("str_CC_set_horizontal_vertical_angle",data)
def str_CC_set_error_angle_l(data):
    return create_Correct_constOD_set_command("str_CC_set_error_angle_l",data)
def str_CC_set_error_angle_k(data):
    return create_Correct_constOD_set_command("str_CC_set_error_angle_k",data)
def str_CC_set_day_camera_bias_X(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_X",data)
def str_CC_set_day_camera_bias_Y(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_Y",data)
def str_CC_set_night_camera_bias_X(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_X",data)
def str_CC_set_night_camera_bias_Y(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_Y",data)

# DAY Zooms
def str_CC_set_day_camera_bias_X_x1(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_X_x1",data)
def str_CC_set_day_camera_bias_Y_x1(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_Y_x1",data)
def str_CC_set_day_camera_bias_X_x5(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_X_x5",data)
def str_CC_set_day_camera_bias_Y_x5(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_Y_x5",data)
def str_CC_set_day_camera_bias_X_x15(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_X_x15",data)
def str_CC_set_day_camera_bias_Y_x15(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_Y_x15",data)
def str_CC_set_day_camera_bias_X_x30(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_X_x30",data)
def str_CC_set_day_camera_bias_Y_x30(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_Y_x30",data)
def str_CC_set_day_camera_bias_X_x60(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_X_x60",data)
def str_CC_set_day_camera_bias_Y_x60(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_Y_x60",data)
def str_CC_set_day_camera_bias_X_x68(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_X_x68",data)
def str_CC_set_day_camera_bias_Y_x68(data):
    return create_Correct_constOD_set_command("str_CC_set_day_camera_bias_Y_x68",data)

# IR Zooms
def str_CC_set_night_camera_bias_X_x1(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_X_x1",data)
def str_CC_set_night_camera_bias_Y_x1(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_Y_x1",data)
def str_CC_set_night_camera_bias_X_x2(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_X_x2",data)
def str_CC_set_night_camera_bias_Y_x2(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_Y_x2",data)
def str_CC_set_night_camera_bias_X_x4(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_X_x4",data)
def str_CC_set_night_camera_bias_Y_x4(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_Y_x4",data)
def str_CC_set_night_camera_bias_X_x8(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_X_x8",data)
def str_CC_set_night_camera_bias_Y_x8(data):
    return create_Correct_constOD_set_command("str_CC_set_night_camera_bias_Y_x8",data)

# Get Commands
def str_CC_get_compass_offset(data):
    return create_Correct_constOD_get_command("str_CC_get_compass_offset",data)
def str_CC_get_inclinometer_angle_X_offset(data):
    return create_Correct_constOD_get_command("str_CC_get_inclinometer_angle_X_offset",data)
def str_CC_get_inclinometer_angle_Y_offset(data):
    return create_Correct_constOD_get_command("str_CC_get_inclinometer_angle_Y_offset",data)
def str_CC_get_horizontal_vertical_angle(data):
    return create_Correct_constOD_get_command("str_CC_get_horizontal_vertical_angle",data)
def str_CC_get_error_angle_l(data):
    return create_Correct_constOD_get_command("str_CC_get_error_angle_l",data)
def str_CC_get_error_angle_k(data):
    return create_Correct_constOD_get_command("str_CC_get_error_angle_k",data)
def str_CC_get_day_camera_bias_X(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_X",data)
def str_CC_get_day_camera_bias_Y(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_Y",data)
def str_CC_get_night_camera_bias_X(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_X",data)
def str_CC_get_night_camera_bias_Y(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_Y",data)

# DAY Zooms
def str_CC_get_day_camera_bias_X_x1(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_X_x1",data)
def str_CC_get_day_camera_bias_Y_x1(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_Y_x1",data)
def str_CC_get_day_camera_bias_X_x5(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_X_x5",data)
def str_CC_get_day_camera_bias_Y_x5(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_Y_x5",data)
def str_CC_get_day_camera_bias_X_x15(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_X_x15",data)
def str_CC_get_day_camera_bias_Y_x15(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_Y_x15",data)
def str_CC_get_day_camera_bias_X_x30(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_X_x30",data)
def str_CC_get_day_camera_bias_Y_x30(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_Y_x30",data)
def str_CC_get_day_camera_bias_X_x60(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_X_x60",data)
def str_CC_get_day_camera_bias_Y_x60(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_Y_x60",data)
def str_CC_get_day_camera_bias_X_x68(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_X_x68",data)
def str_CC_get_day_camera_bias_Y_x68(data):
    return create_Correct_constOD_get_command("str_CC_get_day_camera_bias_Y_x68",data)

# IR Zooms
def str_CC_get_night_camera_bias_X_x1(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_X_x1",data)
def str_CC_get_night_camera_bias_Y_x1(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_Y_x1",data)
def str_CC_get_night_camera_bias_X_x2(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_X_x2",data)
def str_CC_get_night_camera_bias_Y_x2(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_Y_x2",data)
def str_CC_get_night_camera_bias_X_x4(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_X_x4",data)
def str_CC_get_night_camera_bias_Y_x4(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_Y_x4",data)
def str_CC_get_night_camera_bias_X_x8(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_X_x8",data)
def str_CC_get_night_camera_bias_Y_x8(data):
    return create_Correct_constOD_get_command("str_CC_get_night_camera_bias_Y_x8",data)
