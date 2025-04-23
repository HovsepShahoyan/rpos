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

const RadInDegrees = 180 / Math.PI;

class SK42GeoCartesian2DTransformer {
    constructor() {
        this.CONSTANT_RADIUS = 6367558.4968;
        this.CONSTANT_Z_VALUE = 6378245;
    }

    transform(geoPoint) {
        const latRad = toRadians(geoPoint.latitude);
        const zone = Math.floor((6 + geoPoint.longitude) / 6);
        const dLonRad = toRadians(geoPoint.longitude - (3 + 6 * (zone - 1)));

        const sinLat = Math.sin(latRad);
        const sin2Lat = sinLat ** 2;
        const sin4Lat = sin2Lat ** 2;
        const sin6Lat = sin4Lat * sin2Lat;
        const dLon2 = dLonRad ** 2;

        const x = this.CONSTANT_RADIUS * latRad -
            Math.sin(2 * latRad) * (
                16002.89 + 66.9607 * sin2Lat + 0.3515 * sin4Lat -
                dLon2 * (
                    1594561.25 + 5336.535 * sin2Lat + 26.79 * sin4Lat + 0.149 * sin6Lat -
                    dLon2 * (
                        672483.4 - 811219.9 * sin2Lat + 5420 * sin4Lat - 10.6 * sin6Lat +
                        dLon2 * (
                            278194 - 830174 * sin2Lat + 572434 * sin4Lat - 16010 * sin6Lat +
                            dLon2 * (109500 - 574700 * sin2Lat + 863700 * sin4Lat - 398600 * sin6Lat)
                        )
                    )
                )
            );

        const y = 100000 * (5 + 10 * zone) +
            dLonRad * Math.cos(latRad) *
            (
                6378245 + 21346.1415 * sin2Lat + 107.159 * sin4Lat + 0.5977 * sin6Lat +
                dLon2 * (
                    1070204.16 - 2136826.66 * sin2Lat + 17.98 * sin4Lat - 11.99 * sin6Lat +
                    dLon2 * (
                        270806 - 1523417 * sin2Lat + 1327645 * sin4Lat - 21701 * sin6Lat +
                        dLon2 * (
                            79690 - 866190 * sin2Lat + 1730360 * sin4Lat - 945460 * sin6Lat
                        )
                    )
                )
            );

        return new Cartesian2DGeoCoordinate(x, y);
    }

    reverseTransform(coord) {
        const zone = Math.floor(coord.y / 1e6);
        const beta = coord.x / this.CONSTANT_RADIUS;
        const sinBeta = Math.sin(beta);

        const initB = beta + Math.sin(2 * beta) * (
            0.00252588685 - 0.00001491860 * sinBeta ** 2 + 0.00000011904 * sinBeta ** 4
        );

        const z = (coord.y - (10 * zone + 5) * 1e5) / (this.CONSTANT_Z_VALUE * Math.cos(initB));
        const z2 = z ** 2;

        const sinB = Math.sin(initB);
        const sin2 = sinB ** 2;
        const sin4 = sin2 ** 2;
        const sin6 = sin4 * sin2;

        const deltaB = -z2 * Math.sin(2 * initB) *
            (
                0.251684631 - 0.003369263 * sin2 + 0.000011276 * sin4 -
                z2 * (
                    0.10500614 - 0.04559916 * sin2 + 0.00228901 * sin4 - 0.00002987 * sin6 -
                    z2 * (
                        0.042858 - 0.02531 * sin2 + 0.014346 * sin4 - 0.001264 * sin6 -
                        z2 * (0.01672 - 0.00630 * sin2 + 0.01188 * sin4 - 0.00328 * sin6)
                    )
                )
            );

        const lValue = z * (
            1 - 0.0033467108 * sin2 - 0.0000056002 * sin4 - 0.0000000187 * sin6 -
            z2 * (
                0.16778975 + 0.16273586 * sin2 - 0.00052490 * sin4 - 0.00000846 * sin6 -
                z2 * (
                    0.0420025 + 0.1487407 * sin2 + 0.0059420 * sin4 - 0.0000150 * sin6 -
                    z2 * (
                        0.01225 + 0.09477 * sin2 + 0.03282 * sin4 - 0.00034 * sin6 -
                        z2 * (0.0038 + 0.0524 * sin2 + 0.0482 * sin4 + 0.0032 * sin6)
                    )
                )
            )
        );

        const lat = initB + deltaB;
        const lon = (6 * (zone - 0.5)) / RadInDegrees + lValue;

        return new GeoCoordinate(toDegrees(lat), toDegrees(lon), 0);
    }
}

class Sk42ToWgsGeoTransformer {
    transform(coord) {
        // For simplification, just returns the same for now — implement actual datum shift here if needed
        return coord;
    }
}

function convertSk42ToWgs(sk42Coord) {
    const transformer = new SK42GeoCartesian2DTransformer();
    const cart2D = new Cartesian2DGeoCoordinate(sk42Coord.latitude, sk42Coord.longitude);
    const geoCoord = transformer.reverseTransform(cart2D);
    geoCoord.altitude = sk42Coord.altitude;

    const wgsTransformer = new Sk42ToWgsGeoTransformer();
    return wgsTransformer.transform(geoCoord);
}

function toRadians(deg) {
    return deg * Math.PI / 180;
}

function toDegrees(rad) {
    return rad * 180 / Math.PI;
}

module.exports = {
    GeoCoordinate,
    Cartesian2DGeoCoordinate,
    SK42GeoCartesian2DTransformer
};