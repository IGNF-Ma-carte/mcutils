/** Get geometry type as Point/LineString/Polygon
 * @param {string} type
 * @returms {string}
 */
function getSimpleGeomType(type) {
  switch (type) {
    case 'Point':
    case 'MultiPoint': {
      return 'Point';
    }
    case 'LineString':
    case 'LinearRing':
    case 'MultiLineString': {
      return 'LineString';
    }
    case 'Polygon':
    case 'MultiPolygon': {
      return 'Polygon';
    }
    case 'GeometryCollection':
    case 'Circle': {
      return false;
    }
  }
}

export default getSimpleGeomType