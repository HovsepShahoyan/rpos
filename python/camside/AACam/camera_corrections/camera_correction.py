

from models.data_model import DataModel


class CameraCorrection():
    def __init__(self) -> None:
        self.data_model = DataModel()


    def get_correction(self, is_day, zoom : int):
        if is_day:
            x = int(self.data_model.getProperty(f'CC_DCm_bX_x{zoom}'))
            y = int(self.data_model.getProperty(f'CC_DCm_bY_x{zoom}'))
        else:
            x = int(self.data_model.getProperty(f'CC_IRC_bX_x{zoom}'))
            y = int(self.data_model.getProperty(f'CC_IRC_bY_x{zoom}'))
        
        return (x, y)
