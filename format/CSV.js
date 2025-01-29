import ol_Object from 'ol/Object.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import ol_format_WKT from 'ol/format/WKT'
import { fromLonLat } from 'ol/proj'
import papa from 'papaparse'

class olFormatCSV extends ol_Object {
  constructor(options) {
    options = options || {}
    super(options)
  }

  /**
   * Read all features.  Works with both a single feature and a feature
   * collection.
   *
   * @param {Document|Node|string} source Source.
   * @param {*} options Read options.
   *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
   * @return {Array<ol.Feature>} Features.
   * @api
   */
  readFeatures(source, options) {
    const features = []
    const csv = papa.parse(source, { header: true })
    if (csv.meta.fields && csv.meta.fields.length) {
      const lonField = getField(/^lon$|^long$|^longitude$|^ln$|^x$/i, csv.meta.fields)
      const latField = getField(/^lat$|^latitude$|^lt$|^y$/i, csv.meta.fields)
      const wktField = getWKTField(csv.data[0])
      if (wktField || (lonField && latField)) {
        csv.data.forEach(c => {
          const geom = getGeom(c, wktField, lonField, latField);
          if (geom) {
            geom.transform('EPSG:4326', options.featureProjection)
            if (geom.getFirstCoordinate().length) {
              const feature = new Feature(geom)
              Object.keys(c).forEach(k => {
                feature.set(k, c[k], true);
              })
              features.push(feature)
            }
          }
        })
      }
    }
    return features
  }
}

const wktFormat = new ol_format_WKT()

/** Get geometry from fields (lon lat) or WKT
 * @param {Object} c
 * @param {string} wkfField
 * @param {string} lonField
 * @param {string} latField
 */
function getGeom(c, wkfField, lonField, latField) {
  if (lonField && latField) {
    return new Point([c[lonField], c[latField]]);
  }
  if (!c[wkfField]) return false;
  return wktFormat.readGeometry(c[wkfField])
}

/** Check if is a number is finite or NaN
 * @package {number} n
 * @returns {boolean}
 */ 
function isNumber(n) {
  return Number.isFinite(n) && !Number.isNaN(n)
}

/** Get field by name
 * @param {RegExp} rex
 * @param {Array<string>} fields 
 * @returns 
 */
function getField(rex, fields) {
  return fields.find(f => {
    if (rex.test(f)) {
      return f;
    }
  })
}

/** Get field with that is a WKT
 * @param {RegExp} rex
 * @param {Array<string>} fields 
 * @returns 
 */
function getWKTField(data) {
  for (let f in data) {
    if (/^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON) ?\(/.test(data[f])) return f;
  }
}
export default olFormatCSV
