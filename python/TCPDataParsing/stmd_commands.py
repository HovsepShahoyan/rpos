import json
from  TCPDataParsing.command_creator import CommandCreator

json_path = "JSONS/Commands/Drv_Stmd_module.json"

def create_stmd_common_command(command_key):
    creator = CommandCreator(json_path, "STMD")
    return creator.create_command("commonCommands", command_key)

def create_stmd_set_command(command_key, data):
    creator = CommandCreator(json_path, "STMD")
    return creator.create_command("setCommands", command_key, data)

def create_stmd_get_command(command_key):
    creator = CommandCreator(json_path, "STMD")
    return creator.create_command("getCommands", command_key)

def create_general_combined_command(command_specs):
    creator = CommandCreator(json_path, "STMD")
    commands = []
    for spec in command_specs:
        category, key, data = spec['category'], spec['key'], spec.get('data', None)
        commands.append((category, key, data))
    return creator.create_combined_command(commands)

# Common Commands
def str_Polling_STMD_Off():
    return create_stmd_common_command("str_Polling_STMD_Off")
def str_Polling_STMD_On():
    return create_stmd_common_command("str_Polling_STMD_On")
def str_Polling_STMD_Full_Off():
    return create_stmd_common_command("str_Polling_STMD_Full_Off")
def str_Polling_STMD_Full_On():
    return create_stmd_common_command("str_Polling_STMD_Full_On")
def str_Polling_STMD():
    return create_stmd_common_command("str_Polling_STMD")
def str_STMD_off():
    return create_stmd_common_command("str_STMD_off")
def str_STMD_on():
    return create_stmd_common_command("str_STMD_on")
def str_STMD_stop_Az():
    return create_stmd_common_command("str_STMD_stop_Az")
def str_STMD_stop_El():
    return create_stmd_common_command("str_STMD_stop_El")
def str_STMD_reset_position_Az():
    return create_stmd_common_command("str_STMD_reset_position_Az")
def str_STMD_reset_position_El():
    return create_stmd_common_command("str_STMD_reset_position_El")
def str_STMD_anchor_steps_to_angular_sensor():
    return create_stmd_common_command("str_STMD_anchor_steps_to_angular_sensor")

# Set Commands
def str_STMD_set_min_frequency_Az(data):
    return create_stmd_set_command("str_STMD_set_min_frequency_Az", data)
def str_STMD_set_max_frequency_Az(data):
    return create_stmd_set_command("str_STMD_set_max_frequency_Az", data)
def str_STMD_set_min_frequency_El(data):
    return create_stmd_set_command("str_STMD_set_min_frequency_El", data)
def str_STMD_set_max_frequency_El(data):
    return create_stmd_set_command("str_STMD_set_max_frequency_El", data)
def str_STMD_set_acceleration_Az(data):
    return create_stmd_set_command("str_STMD_set_acceleration_Az", data)
def str_STMD_set_acceleration_El(data):
    return create_stmd_set_command("str_STMD_set_acceleration_El", data)
def str_STMD_set_turget_position_Az(data):
    return create_stmd_set_command("str_STMD_set_turget_position_Az", data)
def str_STMD_set_turget_position_El(data):
    return create_stmd_set_command("str_STMD_set_turget_position_El", data)
def str_STMD_set_current_position_Az(data):
    return create_stmd_set_command("str_STMD_set_current_position_Az", data)
def str_STMD_set_current_position_El(data):
    return create_stmd_set_command("str_STMD_set_current_position_El", data)
def str_STMD_set_turget_position_encoder_Az(data):
    return create_stmd_set_command("str_STMD_set_turget_position_encoder_Az", data)
def str_STMD_set_turget_position_encoder_El(data):
    return create_stmd_set_command("str_STMD_set_turget_position_encoder_El", data)
def str_STMD_set_turget_position_inclinometer_El(data):
    return create_stmd_set_command("str_STMD_set_turget_position_inclinometer_El", data)
def str_STMD_set_joystick_Az(data):
    return create_stmd_set_command("str_STMD_set_joystick_Az", data)
def str_STMD_set_joystick_El(data):
    return create_stmd_set_command("str_STMD_set_joystick_El", data)

# Get Commands
def str_get_current_position_Az():
    return create_stmd_get_command("str_STMD_get_current_position_Az")
def str_get_current_position_El():
    return create_stmd_get_command("str_STMD_get_current_position_El")
def str_get_turget_position_Az():
    return create_stmd_get_command("str_STMD_get_turget_position_Az")
def str_get_turget_position_El():
    return create_stmd_get_command("str_STMD_get_turget_position_El")
def str_get_motor_status():
    return create_stmd_get_command("str_STMD_get_motor_status")
def str_get_switcher_byte():
    return create_stmd_get_command("str_STMD_get_switcher_byte")
def str_get_Encoder_az():
    return create_stmd_get_command("str_STMD_get_Encoder_az")
def str_get_Encoder_el():
    return create_stmd_get_command("str_STMD_get_Encoder_el")
def str_get_joystick_Az():
    return create_stmd_get_command("str_STMD_get_joystick_Az")
def str_get_joystick_El():
    return create_stmd_get_command("str_STMD_get_joystick_El")
def str_get_board_voltage():
    return create_stmd_get_command("str_STMD_get_board_voltage")
def str_get_consol_key_status_byte():
    return create_stmd_get_command("str_STMD_get_consol_key_status_byte")
def str_get_MC_Temperature_ADC():
    return create_stmd_get_command("str_STMD_get_MC_Temperature_ADC")
def str_get_Az_corrected():
    return create_stmd_get_command("str_STMD_get_Az_corrected")
def str_get_El_corrected():
    return create_stmd_get_command("str_STMD_get_El_corrected")



# Example usage
# common_command = str_STMD_on()
# set_command = str_STMD_set_min_frequency_Az(10)
# get_command = str_get_El_corrected()

# print(common_command)
# print(set_command)
# print(get_command)
