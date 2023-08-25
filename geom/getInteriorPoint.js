import ol_geom_Point from 'ol/geom/Point'

/** Get one interior point in the geometry. 
 * If multipolygon, returns point in the the largest polygon
 * @param {ol.geom} geom
 * @returns {ol.Coordinate}
 */
export default function(geom) {
  if (!geom.getType) {
    return new ol_geom_Point([0, 0]);
  }
  switch (geom.getType()) {	
    // Get coordinate of the largest polygon
    case 'MultiPolygon': {
      var p = geom.getPolygons();
      if (!p.length) {
        return geom;
      }
      var max = 0;
      var g;
      for (var i = 0; i < p.length; i++) {
        var area = p[i].getArea();
        if (area > max) {
          max = area;
          g = p[i];
        }
      }
      return g.getInteriorPoint();
    }
    case 'Polygon':
      return geom.getInteriorPoint();
    case 'Point':
      return geom;
    default:
      return new ol_geom_Point(geom.getFirstCoordinate());
  }
}