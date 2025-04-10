import json
import logging
import os.path
from os import environ

logger = logging.getLogger()


class Config:
        
    SSD_UUID = "7e90eda3-bab1-4667-b07f-c31c7c467d43"  # Replace this with your SSD's UUID

    def __init__(self, config_path="/home/jetson2/Projects/3D_01_Tester/3D_01_Tester/config.json"):
        self.config = {
        "debug": True,
        "recording_dir": self.get_recording_dir(),
        "crosshair_color": "#FF0000",
        "record_duration": 10,
        "record_active": False,
        # "Day_cam_rtsp": "rtsp://admin:Aragats777@192.168.0.21:1111",
        # "IR_cam_rtsp": "rtsp://admin:Aragats777@192.168.0.21:3333",
        # "Motion_Address": "192.168.0.23",
        # "Motion_Port": "8888",
        # "Devices_Address": "192.168.0.23",
        # "Devices_Port": "2222",
        "18-bit": False,
        "history_path": f"{environ.get('HOME')}/history/",
        "history_screenshot_path": f"{environ.get('HOME')}/history_screenshot/",
        # "day_camera_bias" : {
        #         90 : (960, 540),
        #         60 : (960, 540),
        #         30 : (960, 540),
        #         15 : (960, 540),
        #         5  : (960, 540),
        #         1  : (960, 540),
        #     },
        #     "ir_camera_bias" : {
        #         4 : (930, 525),
        #         3 : (940, 525),
        #         2  : (950, 525),
        #         1  : (960, 525),
        #     },
        }

        # Button styles
        # self.button_styles = {
        #     'danger': 'background-color: #dc3545; color: white;',
        #     'warning': 'background-color: #ffde07; color: black;',
        #     'success': 'background-color: #4CAC50; color: white;'
        # }
        self.button_styles = {
            'danger':  'color: #dc3545; ',
            'warning': 'color: #ffde07;',
            'success': 'color: #4CAC50;'
        }
        # Attempt to load the configuration from a JSON file
        self.load_config(config_path)

    @classmethod
    def get_recording_dir(cls):
        # Check if the SSD is mounted by searching in /dev/disk/by-uuid
        possible_mount_point = f"/dev/disk/by-uuid/{cls.SSD_UUID}"

        if os.path.islink(possible_mount_point):
            device_file = os.path.realpath(possible_mount_point)
        else:
            return os.path.expanduser("~/recordings")

        
        with open("/etc/mtab", "r") as f:
            for line in f:
                if device_file in line:
                    mount_point = line.split()[1]
                    return os.path.join(mount_point, "recordings")
        
        return os.path.expanduser("~/recordings")

        
    def get(self, key, default=None):
        return self.config.get(key, default)

    def load_config(self, cfg_path):
        try:
            with open(os.path.expanduser(cfg_path)) as CFG:
                cfg = json.load(CFG)
                self.config.update(cfg)

                # Post-process loaded data to ensure it matches the original Python structure
                self._post_process_config()

            
        except FileNotFoundError:
            logger.error(f"Config file not found: {cfg_path}")
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in the config file: {cfg_path}")
        except Exception as e:
            logger.exception("Failed to load the config file.")
        finally:
            logger.info("Using default config.")

    def _post_process_config(self):
        # Ensure keys of day_camera_bias and ir_camera_bias are integers and values are tuples
        if "day_camera_bias" in self.config:
            self.config["day_camera_bias"] = {int(k): tuple(v) for k, v in self.config["day_camera_bias"].items()}
        if "ir_camera_bias" in self.config:
            self.config["ir_camera_bias"] = {int(k): tuple(v) for k, v in self.config["ir_camera_bias"].items()}
        
        # Ensure paths are correctly expanded with environment variables
        self.config["history_path"] = os.path.expanduser(self.config.get("history_path", "~/history/"))
        self.config["history_screenshot_path"] = os.path.expanduser(self.config.get("history_screenshot_path", "~/history_screenshot/"))
config = Config( os.path.dirname(os.path.realpath(__file__))+ "/config.json")
