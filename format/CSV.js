import ol_Object from 'ol/Object.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
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
      const pointField = getPointField(csv.data[0])
      if (pointField || (lonField && latField)) {
        csv.data.forEach(c => {
          const pt = fromLonLat(getPoint(c, pointField, lonField, latField), options.featureProjection)
          if (isNumber(pt[0]) && isNumber(pt[1])) {
            const feature = new Feature(new Point(pt))
            Object.keys(c).forEach(k => {
              feature.set(k, c[k], true);
            })
            features.push(feature)
          }
        })
      } 
    }
    return features
  }
}

const pointRex = /^POINT\((\d*(\.\d*)?) (\d*(\.\d*)?)\)$/;

/** Get field as POINT(lon lat)
 * @param {Object} c
 * @param {string} pointField
 * @param {string} lonField
 * @param {string} latField
 */
function getPoint(c, pointField, lonField, latField) {
  if (lonField && latField) return [c[lonField], c[latField]]
  const lon = parseFloat(c[pointField].replace(pointRex, "$1"))
  const lat = parseFloat(c[pointField].replace(pointRex, "$3"))
  return [lon, lat]
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

/** Get field with POINT(x,y)
 * @param {RegExp} rex
 * @param {Array<string>} fields 
 * @returns 
 */
function getPointField(data) {
  for (let f in data) {
    if (pointRex.test(data[f])) return f;
  }
}

export default olFormatCSV
