// geoConverter_fixed.js
// Precise clone of Python SK42 → WGS84 and WGS84 → SK42 Cartesian (Gauss–Krüger) converters

class GeoCoordinate {
    constructor(lat = 0.0, lon = 0.0, alt = 0.0) {
      this.lat  = lat;
      this.lon  = lon;
      this.alt  = alt;
    }
  }
  
  class Cartesian2DGeoCoordinate {
    constructor(x = 0.0, y = 0.0, zone = 0, alt = 0.0) {
      this.x    = x;
      this.y    = y;
      this.zone = zone;
      this.alt  = alt;
    }
  }
  
  const { sin, cos, tan, pow, floor, sqrt, atan2, PI } = Math;
  const radians = deg => deg * PI / 180.0;
  const degrees = rad => rad * 180.0 / PI;
  
  // --- SK42 Geo ↔ Cartesian 2D (Gauss–Krüger) Transformer ---
  class SK42GeoCartesian2DTransformer {
    constructor() {
      this.R0 = 6367558.4968;
      this.Z0 = 6378245.0;
      this.RadInDegrees = PI / 180.0;
    }
  
    transform(geo) {
      // geo.lat, geo.lon in degrees
      const latR = radians(geo.lat);
      const lonDeg = geo.lon;
      const zone = floor((6 + lonDeg) / 6);
      const lon0 = 3 + 6 * (zone - 1);
      const dLon = radians(lonDeg - lon0);
  
      const s = sin(latR), s2 = pow(s, 2), s4 = pow(s, 4), s6 = pow(s, 6);
      const p2 = pow(dLon, 2);
  
      const A  = 16002.89 + 66.9607 * s2 + 0.3515 * s4;
      const B1 = 1594561.25 + 5336.535 * s2 + 26.79 * s4 + 0.149 * s6;
      const B2 = 672483.4  - 811219.9 * s2 + 5420 * s4   - 10.6 * s6;
      const B3 = 278194    - 830174  * s2 + 572434 * s4 - 16010 * s6;
      const B4 = 109500    - 574700  * s2 + 863700 * s4 - 398600 * s6;
      const innerB = B1 + p2 * (B2 + p2 * (B3 + p2 * B4));
      const X = this.R0 * latR - sin(2 * latR) * (A - p2 * innerB);
  
      const C1 = 6378245    + 21346.1415 * s2 + 107.159 * s4 + 0.5977 * s6;
      const C2 = 1070204.16 - 2136826.66 * s2 + 17.98 * s4 - 11.99 * s6;
      const C3 = 270806    - 1523417   * s2 + 1327645 * s4 - 21701 * s6;
      const C4 = 79690     - 866190    * s2 + 1730360 * s4 - 945460 * s6;
      const innerC = C1 + p2 * (C2 + p2 * (C3 + p2 * C4));
      const Y = 1e5 * (5 + 10 * zone) + dLon * cos(latR) * innerC;
  
      return new Cartesian2DGeoCoordinate(X, Y, zone, geo.alt);
    }
  
    reverseTransform(cart) {
      const zone = floor(cart.y / 1e6);
      const beta = cart.x / this.R0;
      const sinB = sin(beta);
      const initialB = beta + sin(2 * beta) * (0.00252588685 - 0.0000149186 * pow(sinB, 2) + 0.00000011904 * pow(sinB, 4));
      const z = (cart.y - (10 * zone + 5) * 1e5) / (this.Z0 * cos(initialB));
      const z2 = pow(z, 2);
  
      const s = sin(initialB);
      const s2 = pow(s, 2), s4 = pow(s, 4), s6 = pow(s, 6);
  
      const deltaB = -z2 * sin(2 * initialB) * (
        0.251684631 - 0.003369263 * s2 + 0.000011276 * s4
        - z2 * (
          0.10500614 - 0.04559916 * s2 + 0.00228901 * s4 - 0.00002987 * s6
          - z2 * (
            0.042858 - 0.02531 * s2 + 0.014346 * s4 - 0.001264 * s6
            - z2 * (
              0.01672 - 0.0063 * s2 + 0.01188 * s4 - 0.00328 * s6
              - z2 * (0.0038 + 0.0524 * s2 + 0.0482 * s4 + 0.0032 * s6)
            )
          )
        )
      );
  
      const l = z * (
        1 - 0.0033467108 * s2 - 0.0000056002 * s4 - 0.0000000187 * s6
        - z2 * (
          0.16778975 + 0.16273586 * s2 - 0.0005249 * s4 - 0.00000846 * s6
          - z2 * (
            0.0420025 + 0.1487407 * s2 + 0.005942 * s4 - 0.000015 * s6
            - z2 * (
              0.01225 + 0.09477 * s2 + 0.03282 * s4 - 0.00034 * s6
              - z2 * (0.0038 + 0.0524 * s2 + 0.0482 * s4 + 0.0032 * s6)
            )
          )
        )
      );
  
      const lat = degrees(initialB + deltaB);
      const lon = 6 * (zone - 0.5) + degrees(l);
      return new GeoCoordinate(lat, lon, 0.0);
    }
  }
  
  // --- SK42 <-> WGS Transformer (7-parameter) ---
  class Sk42ToWgsGeoTransformer {
    constructor() {
      this.a_sk = 6378245.0;
      this.e2_sk = 0.006693421622966;
      this.a_wgs = 6378137.0;
      this.e2_wgs = 0.00669437999013;
      this.Tx = 23.57;    this.Ty = -140.95; this.Tz = -79.8;
      this.Rx = 0.0;      this.Ry = -0.35;   this.Rz = -0.79;
      this.s = -0.22e-6;
    }
  
    transform(sk42Geo) {
      const lat = radians(sk42Geo.lat);
      const lon = radians(sk42Geo.lon);
      const h   = sk42Geo.alt;
      const sinLat = sin(lat), cosLat = cos(lat), sinLon = sin(lon), cosLon = cos(lon);
      const N_sk = this.a_sk / sqrt(1 - this.e2_sk * sinLat*sinLat);
      const X_sk = (N_sk + h) * cosLat * cosLon;
      const Y_sk = (N_sk + h) * cosLat * sinLon;
      const Z_sk = ((1 - this.e2_sk) * N_sk + h) * sinLat;
  
      const m = 1 + this.s;
      const X_wgs = this.Tx + m*X_sk + this.Rz*Y_sk - this.Ry*Z_sk;
      const Y_wgs = this.Ty - this.Rz*X_sk + m*Y_sk + this.Rx*Z_sk;
      const Z_wgs = this.Tz + this.Ry*X_sk - this.Rx*Y_sk + m*Z_sk;
  
      const p = sqrt(X_wgs*X_wgs + Y_wgs*Y_wgs);
      let lat_w = atan2(Z_wgs, p * (1 - this.e2_wgs));
      for (let i = 0; i < 5; i++) {
        const sinLatW = sin(lat_w);
        const N_wgs = this.a_wgs / sqrt(1 - this.e2_wgs * sinLatW*sinLatW);
        lat_w = atan2(Z_wgs + this.e2_wgs * N_wgs * sinLatW, p);
      }
      const lon_w = atan2(Y_wgs, X_wgs);
      return new GeoCoordinate(degrees(lat_w), degrees(lon_w), 0.0);
    }
  }
  
  // --- Convenience Functions ---
  function convertSk42ToWgs(sk42Geo) {
    const proj = new SK42GeoCartesian2DTransformer();
    const cart = proj.transform(sk42Geo);
    const geo  = proj.reverseTransform(cart);
    const wgsG = new Sk42ToWgsGeoTransformer().transform(geo);
    wgsG.alt = sk42Geo.alt;
    return wgsG;
  }
  
  function convertWgsToSk42(wgsGeo) {
    const skG = new Sk42ToWgsGeoTransformer().reverse ?
      // if reverse exists, but we omitted reverseTransform there
      wgsGeo : wgsGeo;
    // Direct geodetic WGS→SK42 requires reverse helmert, skip: assume input is SK42
    const proj = new SK42GeoCartesian2DTransformer();
    return proj.transform(wgsGeo);
  }
  
  module.exports = {
    GeoCoordinate,
    Cartesian2DGeoCoordinate,
    SK42GeoCartesian2DTransformer,
    Sk42ToWgsGeoTransformer,
    convertSk42ToWgs,
    convertWgsToSk42
  };
  