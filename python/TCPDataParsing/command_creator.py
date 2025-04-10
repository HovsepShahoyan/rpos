import json
from  TCPDataParsing.command_builder import CommandStringBuilder

class CommandCreator():
    def __init__(self, config_path, module_name):
        with open(config_path, 'r') as file:
            self.config = json.load(file)
        self.module_name = module_name
        self.builder = CommandStringBuilder("JSONS/Commands/string_build_module.json")

    def create_command(self, command_category, command_key, data=None):
        command_name = None
        for command in self.config[command_category]:
            if command_key in command:
                command_name = command[command_key]
                break
        if command_name is None:
            raise ValueError(f"Command key {command_key} not found in {command_category}")

        self.builder.reset()
        self.builder.add_begin()
        self.builder.add_address(self.module_name)

        command_type = 'SMDD' if data is not None else 'SMD'
        self.builder.add_command(command_type, command_name, data)
        return self.builder.build()

    def create_combined_command(self, command_list, data_list):
        if len(command_list) != len(data_list):
            raise ValueError("The length of data_list should be equal to the length of command_list")
        
        self.builder.reset()
        self.builder.add_begin()
        self.builder.add_address(self.module_name)

        for i, (command_category, command_key) in enumerate(command_list):
            command_name = None
            for command in self.config[command_category]:
                if command_key in command:
                    command_name = command[command_key]
                    break
            if command_name is None:
                raise ValueError(f"Command key {command_key} not found in {command_category}")

            data = data_list[i]
            command_type = 'SMDD' if data is not None else 'SMD'
            self.builder.add_command(command_type, command_name, data)

        return self.builder.build()

