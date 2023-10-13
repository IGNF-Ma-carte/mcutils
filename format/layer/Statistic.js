/**	@copy (c) IGN - 2017
  @author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import LayerFormat from './Layer';
import VectorSource from 'ol/source/vector';
import Feature from 'ol/Feature';
import StatisticLayer from '../../layer/Statistic'
import GeoJSONXFormat from 'ol-ext/format/GeoJSONX'

import { ol_geom_createFromType } from 'ol-ext/geom/GeomUtils'
import { roundCoords } from './VectorStyle'

/** Layer statistic format reader/writer.
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 * @param {} options Options.
 */
class Statistic extends LayerFormat {
  // Constructor 
  constructor() {
    super();
  }
}

/** Lecture
 *	@param {} opions
 *	@return {StatisticLayer}
 */
Statistic.prototype.read = function (options) {
  if (options.type !== 'Statistique') return;
  // Read features
  let features = [];
  // Compressed data?
  if (options.data) {
    const format = new GeoJSONXFormat()
    features = format.readFeaturesFromObject(options.data);
  } else {
    options.features.forEach((f) => {
      const feature = new Feature(ol_geom_createFromType(f.type, f.coords));
      feature.setProperties(f.attributes);
      features.push(feature);
    });
  }
  // Create
  const source = new VectorSource();
  source.addFeatures(features);
  const layer = new StatisticLayer({
    source: source
  });
  // Default not selectable
  if (options.selectable === undefined) options.selectable = false;
  this.readOptions(layer, options);
  layer.setStatistic(options.stat);
  if (options.popupContent) {
    layer.setPopupContent(options.popupContent);
  }

  // The layer
  return layer;
};

/** Ecriture
 *	@param {StatisticLayer} layer
 *  @param {boolean} [uncompressed=false]
 *	@return {object} options
 */
Statistic.prototype.write = function (layer, uncompressed) {
  if (!(layer instanceof StatisticLayer)) return false;
  var s = this.writeOptions(layer, { type: 'Statistique' });

  s.stat = layer.getStatistic();
  if (s.stat.cols.length === 1) s.stat.cols.push(s.stat.cols[0]);
  s.popupContent = layer.getPopupContent();

  const features = layer.getSource().getFeatures();
  // Compress data
  if (uncompressed) {
    // Uncompressed features
    s.features = [];
    features.forEach((f) => {
      const feat = {
        type: f.getGeometry().getType(),
        coords: roundCoords(f.getGeometry().getCoordinates()),
        attributes: f.getProperties()
      }
      delete feat.attributes[f.getGeometryName()];
      s.features.push(feat);
    });
  } else {
    // Compress GeoJSONX
    const format = new GeoJSONXFormat({ decimals: 3 })
    s.data = format.writeFeaturesObject(features);
  }
    
  return s;
};

export default Statistic
