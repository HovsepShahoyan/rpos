class GPSConverter:
    @staticmethod
    def convertRawGPSData(gpsData):
        """
        Convert raw GPS data to a more readable format.
        :param gpsData: Dictionary containing raw GPS data.
        :return: Dictionary with converted GPS data.
        """
        convertedData = {}

        # Convert Time
        timeStr = gpsData['GPS_0'] + gpsData['GPS_1']
        convertedData['Time'] = GPSConverter._convertGPSTime(timeStr)

        # Convert Latitude
        latitudeStr = gpsData['GPS_2'] + gpsData['GPS_3']
        convertedData['Latitude'] = GPSConverter._convertGPSLatitudeLongitude(latitudeStr, isLatitude=True)

        # Convert Longitude
        longitudeStr = gpsData['GPS_4'] + gpsData['GPS_5']
        convertedData['Longitude'] = GPSConverter._convertGPSLatitudeLongitude(longitudeStr, isLatitude=False)

        # Altitude (Assuming it's already in a readable format)
        convertedData['Altitude'] = gpsData['GPS_6']

        return convertedData

    @staticmethod
    def _convertGPSTime(timeStr):
        """
        Convert GPS time to a readable format.
        :param timeStr: String in the format hhmmss.sss
        :return: Converted time string.
        """
        hours, minutes, seconds = timeStr[:2], timeStr[2:4], timeStr[4:]
        return f"{hours}:{minutes}:{seconds}"

    @staticmethod
    def _convertGPSLatitudeLongitude(coordinateStr, isLatitude):
        """
        Convert GPS latitude/longitude to decimal degrees.
        :param coordinateStr: Latitude or Longitude string in the format ddmm.mmmm or dddmm.mmmm
        :param isLatitude: Boolean indicating whether it's latitude or longitude.
        :return: Converted coordinate in decimal degrees.
        """
        try:
            if isLatitude:
                degrees, minutes = coordinateStr[:2], coordinateStr[2:]
            else:
                degrees, minutes = coordinateStr[:3], coordinateStr[3:]

            # Validate if degrees and minutes are not empty and can be converted to float
            if degrees and minutes:
                return str(degrees) + '.' + str(minutes)
            else:
                return None
        except ValueError:
            return None
