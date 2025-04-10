import math 



class ArtilleryAngle:
    def __init__(self, angle_degrees=0):
        self._angle_degrees = angle_degrees
    
    @property
    def angleDegrees(self):
        return self._angle_degrees
    
    @angleDegrees.setter
    def angleDegrees(self, value):
        self._angle_degrees = value

    @property
    def angleDirectionalFull(self):
        dirAngle = float(round_to_2_digits(self.angleDegrees / 6.0)) % 60.0
        if(dirAngle < 0.0):
            dirAngle = dirAngle + 60.0
        return round_to_2_digits(dirAngle)

    @angleDirectionalFull.setter
    def angleDirectionalFull(self, value):
        self._angle_degrees = value * 6.0

    
    @property 
    def angleDirectionalBeforeDot(self):
        try:
            strAngle = str(self.angleDirectionalFull)
        except ValueError:
            print("Not a float")
        return strAngle.split('.', 1)[0]    
    
    @property 
    def angleDirectionalAfterDot(self):
        try:
            strAngle = str(self.angleDirectionalFull)
        except ValueError:
            print("Not a float")
        return strAngle.split('.', 1)[1]
    

    @property
    def angleDirectionalRange30Full(self):
        dirRange30 = float(self.angleDirectionalFull) % 60
        if(abs(dirRange30) > 30):
            dirRange30 = dirRange30 - math.copysign(1, dirRange30) * 60.0
        
        return round_to_2_digits(dirRange30)
    

    @property 
    def angleDirectionalRange30BeforeDot(self):
        try:
            strAngle = str(self.angleDirectionalRange30Full)
        except ValueError:
            print("Not a float")
        return strAngle.split('.', 1)[0]    
    
    @property 
    def angleDirectionalRange30AfterDot(self):
        try:
            strAngle = str(self.angleDirectionalRange30Full)
        except ValueError:
            print("Not a float")
        return strAngle.split('.', 1)[1]


    


        
def round_to_2_digits(value):
    rounded_value = round(value, 2)
    return f"{rounded_value:.2f}"


# angle = ArtilleryAngle(-10)  
# print(f"Angle in Degrees: {angle.angleDegrees}")  # 
# print(f"Angle in Directional Full: {angle.angleDirectionalFull}")  # 
# print(f"Angle in Directional Before Dot: {angle.angleDirectionalBeforeDot}")  # 
# print(f"Angle in Directional After Dot: {angle.angleDirectionalAfterDot}")  # 
# print(f"Angle in Directional Range30: {angle.angleDirectionalRange30Full}")  # 
# print(f"Angle in Directional Range30: {angle.angleDirectionalRange30BeforeDot}")  # 
# print(f"Angle in Directional Range30: {angle.angleDirectionalRange30AfterDot}")  # 

# angle.angleDirectionalFull = 22.22
# print(f"Angle in degrees after Directional: {angle.angleDegrees}")  # 


