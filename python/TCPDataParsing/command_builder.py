import json


class CommandStringBuilder:
    def __init__(self, config_path):
        with open(config_path, 'r') as file:
            config = json.load(file)
            self.config = {k: v for d in config['commandBlocks'] for k, v in d.items()}
        
        self.reset()

    def reset(self):
        self.components = []
        self.is_begin_added = False
        self.is_adr_added = False

    def add_begin(self):
        if not self.is_begin_added:
            self.components.append(self.config['str_Begin'])
            self.is_begin_added = True
        else:
            raise ValueError("Begin literal '>' already added")

    def add_address(self, module_name):
        if not self.is_adr_added:
            self.components.append(f"{self.config['str_ADR']}={module_name}")
            self.is_adr_added = True
        else:
            raise ValueError("Address can only be added once")

    def add_command(self, command_type, command_name, data=None):
        if command_type not in [self.config['str_SMD'], self.config['str_SMDD']]:
            raise ValueError("Invalid command type")

        command_str = f"/{command_type}={command_name}"
        if command_type == self.config['str_SMDD'] and data is not None:
            command_str += f"/{self.config['str_LD']}={data}"
        self.components.append(command_str)

    def build(self):
        if not self.is_begin_added or not self.is_adr_added:
            raise ValueError("Begin literal and Address must be added before building the string")
        return ''.join(self.components) + '/'

# Example usage
# config_path = 'JSONS/Commands/string_build_module.json'
# builder = CommandStringBuilder(config_path)
# builder.add_begin()
# builder.add_address("Module1")
# builder.add_command("SMD", "Command1")
# builder.add_command("SMDD", "Command2", "Data1")
# command_string = builder.build()
# print(command_string)
