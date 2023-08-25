import LayerFormat from './Layer';
import VectorStyleLayer from '../../layer/VectorStyle'
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import GeoJSONXFormat from 'ol-ext/format/GeoJSONX'
import roundCoords from './roundCoords'

import { ol_geom_createFromType } from 'ol-ext/geom/GeomUtils'

import { ignStyleDef } from '../../style/ignStyle'

const shortStyle = {}

// Style / short hashtable
Object.keys(ignStyleDef).forEach(s => {
  const short = ignStyleDef[s].short
  if (!short) {
    console.error('MISSING style: ', s)
  } else if (!shortStyle[short]) {
    shortStyle[short] = s;
  } else {
    console.error('DUPLICATE style: ', s, '-', shortStyle[short],  '('+short+')')
  }
})

/** VectorStyle layer format reader/writer.
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 * @api
 */
class VectorStyle extends LayerFormat {
  /** Constructor 
   */
  constructor() {
    super();
  }
}

/** Read VectorStyle layer
 * @param {options} json source
 * @return {VectorStyleLayer}
 */
VectorStyle.prototype.read = function (options) {
  if (options.type !== 'Vector') return;
  const source = new VectorSource();
  const layer = new VectorStyleLayer({ source: source });
  this.readOptions(layer, options);
  return this.readFeatures(layer, options);
}

/** Read VectorStyle features
 * @param {options} json source
 * @return {VectorStyleLayer}
 */
VectorStyle.prototype.readFeatures = function (layer, options) {
  const source = layer.getSource();
  // Read features
  let features = [];
  // Compressed features?
  if (options.data) {
    const format = new GeoJSONXFormat()
    features = format.readFeaturesFromObject(options.data);
    options.data.style.forEach((s, i) => {
      const style = {}
      Object.keys(s).forEach(k => style[shortStyle[k]] = s[k])
      features[i].setIgnStyle(style)
    })
    options.data.popupContent.forEach((s, i) => features[i].setPopupContent(s))
  } else {
    options.features.forEach((f) => {
      const feature = new Feature(ol_geom_createFromType(f.type, f.coords));
      feature.setProperties(f.attributes);
      feature.setIgnStyle(f.style);
      feature.setPopupContent(f.popupcontent);
      features.push(feature);
    });
  }
  source.addFeatures(features)

  // Attributes
  layer.setAttributes(options.attributes);
  // layer.set('fixAttributes', options.fixAttributes)

  return layer;
};

/** Write layer
 * @param {VectorStyleLayer}
 * @param {boolean} [uncompressed=false]
 * @return {object} json data
 */
VectorStyle.prototype.write = function (layer, uncompressed) {
  if (layer.get('type') !== 'Vector') return null;
  const options = this.writeOptions(layer, {
    dessin: true,
    // Attributes
    attributes: Object.values(layer.getAttributes()),
    // fixAttributes: layer.get('fixAttributes')
  });
  return this.writeFeatures(layer, options, uncompressed)
}

/** Write the features
 * @param {VectorStyleLayer} layer the layer to write
 * @param {*} options
 * @param {boolean} [uncompressed=true]
 * @return {object} json data
 */
VectorStyle.prototype.writeFeatures = function (layer, options, uncompressed) {
  // Write features
  const features = layer.getSource().getFeatures();
  if (uncompressed === false) {
    options.features = [];
    features.forEach(f => {
      const feat = {
        type: f.getGeometry().getType(),
        coords: roundCoords(f.getGeometry().getCoordinates()),
        attributes: f.getProperties(),
        style: f.getIgnStyle(),
        popupcontent: f.getPopupContent()
      }
      delete feat.attributes[f.getGeometryName()];
      options.features.push(feat);
    });
  } else {
    // Compress GeoJSONX
    const format = new GeoJSONXFormat({ deleteNullProperties: false, decimals: 3, layout: 'XYZM' })
    options.data = format.writeFeaturesObject(features);
    options.data.style = [];
    options.data.popupContent = [];
    features.forEach(f => {
      const st = f.getIgnStyle();
      const short = {};
      Object.keys(st).forEach(k => short[ignStyleDef[k].short] = st[k])
      options.data.style.push(short);
      // Popup
      const popup = f.getPopupContent();
      if (!popup.active) options.data.popupContent.push({});
      else options.data.popupContent.push(f.getPopupContent());
    });
  }
  return options;
};

export { roundCoords }
export default VectorStyle
