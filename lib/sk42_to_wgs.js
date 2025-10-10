const { sin, cos, tan, pow, floor, radians, degrees } = Math;

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

class GeoCoordinate {
    constructor(latitude, longitude, altitude = 0) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
    }
}

class Cartesian2DGeoCoordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Vector3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

// Constants
const RadInDegrees = 180 / Math.PI;
const DegInSeconds = 3600;
const RadInSeconds = RadInDegrees * DegInSeconds;
const MajorSemiAxisKrassowsky = 6378245;
const SquareOfEccentricityKrassowsky = 0.006693421622;
const MajorSemiAxisWGS84 = 6378137;
const SquareOfEccentricityWGS84 = 0.006694379901;

class SK42GeoCartesian2DTransformer {
    static CONSTANT_RADIUS = 6367558.4968;
    static CONSTANT_Z_VALUE = 6378245;

    transform(geoPoint) {
        const latitudeInRads = toRadians(geoPoint.latitude);
        const numberOfZone = floor((6 + geoPoint.longitude) / 6);
        const distanceFromZoneMeridianInRads = toRadians(
            geoPoint.longitude - (3 + 6 * (numberOfZone - 1))
        );

        const powDistance = pow(distanceFromZoneMeridianInRads, 2);
        const sinLat = sin(latitudeInRads);
        const sin2Lat = pow(sinLat, 2);
        const sin4Lat = pow(sinLat, 4);
        const sin6Lat = pow(sinLat, 6);

        const xValue = 
            SK42GeoCartesian2DTransformer.CONSTANT_RADIUS * latitudeInRads -
            sin(2 * latitudeInRads) * (
                16002.89 + 
                66.9607 * sin2Lat + 
                0.3515 * sin4Lat -
                powDistance * (
                    1594561.25 + 
                    5336.535 * sin2Lat + 
                    26.79 * sin4Lat + 
                    0.149 * sin6Lat +
                    powDistance * (
                        672483.4 - 
                        811219.9 * sin2Lat + 
                        5420 * sin4Lat - 
                        10.6 * sin6Lat +
                        powDistance * (
                            278194 - 
                            830174 * sin2Lat + 
                            572434 * sin4Lat - 
                            16010 * sin6Lat +
                            powDistance * (
                                109500 - 
                                574700 * sin2Lat + 
                                863700 * sin4Lat - 
                                398600 * sin6Lat
                            )
                        )
                    )
                )
            );

        const yValue = 
            1e5 * (5 + 10 * numberOfZone) +
            distanceFromZoneMeridianInRads * cos(latitudeInRads) * (
                6378245 + 
                21346.1415 * sin2Lat + 
                107.159 * sin4Lat + 
                0.5977 * sin6Lat +

                powDistance * (
                    1070204.16 - 
                    2136826.66 * sin2Lat + 
                    17.98 * sin4Lat - 
                    11.99 * sin6Lat +

                    powDistance * (
                        270806 - 
                        1523417 * sin2Lat + 
                        1327645 * sin4Lat - 
                        21701 * sin6Lat +

                        powDistance * (
                            79690 - 
                            866190 * sin2Lat + 
                            1730360 * sin4Lat - 
                            945460 * sin6Lat
                        )
                    )
                )
            );

        return new Cartesian2DGeoCoordinate(xValue, yValue);
    }

    reverseTransform(coordinate) {
        const numberOfZone = floor(coordinate.y * 1e-6);
        const beta = coordinate.x / SK42GeoCartesian2DTransformer.CONSTANT_RADIUS;
        const sinBeta = sin(beta);

        const initialB = beta + sin(2 * beta) * (
            0.00252588685 - 
            0.0000149186 * pow(sinBeta, 2) + 
            0.00000011904 * pow(sinBeta, 4)
        );

        const zValue = (coordinate.y - (10 * numberOfZone + 5) * 1e5) / 
            (SK42GeoCartesian2DTransformer.CONSTANT_Z_VALUE * cos(initialB));

        const pow2Z = pow(zValue, 2);
        const sinB = sin(initialB);
        const sin2B = pow(sinB, 2);
        const sin4B = pow(sinB, 4);
        const sin6B = pow(sinB, 6);

        const deltaB = -pow2Z * sin(2 * initialB) * (
            0.251684631 - 
            0.003369263 * sin2B + 
            0.000011276 * sin4B -
            pow2Z * (
                0.10500614 - 
                0.04559916 * sin2B + 
                0.00228901 * sin4B - 
                0.00002987 * sin6B -
                pow2Z * (
                    0.042858 - 
                    0.02531 * sin2B + 
                    0.014346 * sin4B - 
                    0.001264 * sin6B -
                    pow2Z * (
                        0.01672 - 
                        0.00630 * sin2B + 
                        0.01188 * sin4B - 
                        0.00328 * sin6B
                    )
                )
            )
        );

        const lValue = zValue * (
            1 - 
            0.0033467108 * sin2B - 
            0.0000056002 * sin4B - 
            0.0000000187 * sin6B -
            pow2Z * (
                0.16778975 + 
                0.16273586 * sin2B - 
                0.00052490 * sin4B - 
                0.00000846 * sin6B -
                pow2Z * (
                    0.0420025 + 
                    0.1487407 * sin2B + 
                    0.0059420 * sin4B - 
                    0.0000150 * sin6B -
                    pow2Z * (
                        0.01225 + 
                        0.09477 * sin2B + 
                        0.03282 * sin4B - 
                        0.00034 * sin6B -
                        pow2Z * (
                            0.0038 + 
                            0.0524 * sin2B + 
                            0.0482 * sin4B + 
                            0.0032 * sin6B
                        )
                    )
                )
            )
        );

        const latitudeInRads = initialB + deltaB;
        const longitudeInRads = 6 * (numberOfZone - 0.5) / RadInDegrees + lValue;

        return new GeoCoordinate(
            toDegrees(latitudeInRads),
            toDegrees(longitudeInRads),
            0
        );
    }
}

class GeoCoordinateSystemTransformer {
    constructor(fromSemiMajorAxis, fromEccentricity, toSemiMajorAxis, toEccentricity) {
        this.deltaSemiMajorAxis = toSemiMajorAxis - fromSemiMajorAxis;
        this.meanOfSemiMajorAxis = (toSemiMajorAxis + fromSemiMajorAxis) / 2;
        this.deltaEccentricity = toEccentricity - fromEccentricity;
        this.meanOfEccentricity = (toEccentricity + fromEccentricity) / 2;
    }

    _prepareCalculationValues(fromCoord) {
        const latRad = toRadians(fromCoord.latitude);
        const longRad = toRadians(fromCoord.longitude);
        const sin2Lat = pow(sin(latRad), 2);
        const val = 1 - this.meanOfEccentricity * sin2Lat;

        return {
            latDegs: fromCoord.latitude,
            latRad,
            longDegs: fromCoord.longitude,
            longRad,
            altitude: fromCoord.altitude,
            mValue: this.meanOfSemiMajorAxis * (1 - this.meanOfEccentricity) * pow(val, -1.5),
            nValue: this.meanOfSemiMajorAxis * pow(val, -0.5),
            sinLat: sin(latRad),
            cosLat: cos(latRad),
            sinLong: sin(longRad),
            cosLong: cos(longRad)
        };
    }

    transform(fromCoord) {
        const values = this._prepareCalculationValues(fromCoord);
        return new GeoCoordinate(
            fromCoord.latitude + this._deltaLatitude(values),
            fromCoord.longitude + this._deltaLongitude(values),
            fromCoord.altitude + this._deltaAltitude(values)
        );
    }

    reverseTransform(fromCoord) {
        const values = this._prepareCalculationValues(fromCoord);
        return new GeoCoordinate(
            fromCoord.latitude - this._deltaLatitude(values),
            fromCoord.longitude - this._deltaLongitude(values),
            fromCoord.altitude - this._deltaAltitude(values)
        );
    }

    _deltaLatitude(values) {
        const d = this.dValues();
        const w = this.wValues();
        const wTemp = 1 + this.meanOfEccentricity * cos(2 * values.latRad);

        return (RadInSeconds / (values.mValue + values.altitude) *
            ((values.nValue / this.meanOfSemiMajorAxis) * this.meanOfEccentricity *
            values.sinLat * values.cosLat * this.deltaSemiMajorAxis +
            (pow(values.nValue, 2) / pow(this.meanOfSemiMajorAxis, 2) + 1) *
            values.nValue * values.sinLat * values.cosLat * this.deltaEccentricity * 0.5 -
            (d.x * values.cosLong + d.y * values.sinLong) * values.sinLat +
            d.z * values.cosLat) -
            w.x * values.sinLong * wTemp +
            w.y * values.cosLong * wTemp -
            RadInSeconds * this.scaleFactor() * this.meanOfEccentricity *
            values.sinLat * values.cosLat) / DegInSeconds;
    }

    _deltaLongitude(values) {
        const d = this.dValues();
        const w = this.wValues();
        const mul = RadInSeconds / ((values.nValue + values.altitude) * values.cosLat);

        return (mul * (-d.x * values.sinLong + d.y * values.cosLong) +
            tan(values.latRad) * (1 - this.meanOfEccentricity) *
            (w.x * values.cosLong + w.y * values.sinLong) -
            w.z) / DegInSeconds;
    }

    _deltaAltitude() {
        return 0;
    }

    scaleFactor() {
        throw new Error("Not implemented");
    }

    wValues() {
        throw new Error("Not implemented");
    }

    dValues() {
        throw new Error("Not implemented");
    }
}

class Sk42ToWgsGeoTransformer extends GeoCoordinateSystemTransformer {
    static _sScaleFactor = -0.22e-6;
    static _wValues = new Vector3D(0, -0.35, -0.79);
    static _dValues = new Vector3D(23.57, -140.95, -79.8);

    constructor() {
        super(
            MajorSemiAxisKrassowsky,
            SquareOfEccentricityKrassowsky,
            MajorSemiAxisWGS84,
            SquareOfEccentricityWGS84
        );
    }

    scaleFactor() {
        return Sk42ToWgsGeoTransformer._sScaleFactor;
    }

    wValues() {
        return Sk42ToWgsGeoTransformer._wValues;
    }

    dValues() {
        return Sk42ToWgsGeoTransformer._dValues;
    }
}

function convertWgsToSk42(wgsCoordinate) {
    const wgsTransformer = new Sk42ToWgsGeoTransformer();
    const geoCoordinates = wgsTransformer.reverseTransform(wgsCoordinate);
    const transformer = new SK42GeoCartesian2DTransformer();
    const cart2d = transformer.transform(geoCoordinates);
    return new GeoCoordinate(cart2d.x, cart2d.y, wgsCoordinate.altitude);
}

module.exports = {
  GeoCoordinate,
  Cartesian2DGeoCoordinate,
  SK42GeoCartesian2DTransformer,
  Sk42ToWgsGeoTransformer,
  convertWgsToSk42
};