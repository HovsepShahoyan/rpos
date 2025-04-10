import json
from  TCPDataParsing.command_creator import CommandCreator

json_path = "JSONS/Commands/correction_constants_module.json"

def create_El_enc_crct_common_command(command_key):
    creator = CommandCreator(json_path, "El_enc_crct")
    return creator.create_command("commonCommands", command_key)

def create_El_enc_crct_set_command(command_key, data):
    creator = CommandCreator(json_path, "El_enc_crct")
    return creator.create_command("setCommands", command_key, data)

def create_El_enc_crct_get_command(command_key):
    creator = CommandCreator(json_path, "El_enc_crct")
    return creator.create_command("getCommands", command_key)

def create_general_combined_command(command_specs):
    creator = CommandCreator(json_path, "El_enc_crct")
    commands = []
    for spec in command_specs:
        category, key, data = spec['category'], spec['key'], spec.get('data', None)
        commands.append((category, key, data))
    return creator.create_combined_command(commands)

# Common Commands
def str_El_encoder_correctors_matrix_reset():
    return create_El_enc_crct_common_command("str_El_encoder_correctors_matrix_reset")
def str_El_encoder_correctors_matrix_save():
    return create_El_enc_crct_common_command("str_El_encoder_correctors_matrix_save")

# Set Commands
def str_El_encoder_correction_zona_number(data):
    return create_El_enc_crct_set_command("str_El_encoder_correction_zona_number",data)
def str_El_encoder_correction_member_number(data):
    return create_El_enc_crct_set_command("str_El_encoder_correction_member_number",data)
def str_El_encoder_correction_member(data):
    return create_El_enc_crct_set_command("str_El_encoder_correction_member",data)
def str_El_encoder_reference_member(data):
    return create_El_enc_crct_set_command("str_El_encoder_reference_member",data)


# Get Commands
def str_get_El_encoder_correction_zona_number():
    return create_El_enc_crct_get_command("str_get_El_encoder_correction_zona_number")
def str_get_El_encoder_correction_zona_number():
    return create_El_enc_crct_get_command("str_get_El_encoder_correction_zona_number")
def str_get_El_encoder_correction_member():
    return create_El_enc_crct_get_command("str_get_El_encoder_correction_member")
def str_get_El_encoder_reference_member():
    return create_El_enc_crct_get_command("str_get_El_encoder_reference_member")