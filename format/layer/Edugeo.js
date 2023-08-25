import GeoportailLayer from 'ol-ext/layer/Geoportail'
import LayerFormat from '../../format/layer/Layer'

/** Geoportail layer format reader/writer.
 * @memberof mcutils.format.layer
 * @extends mcutils.format.layer.Layer
 * @api
 */
class Edugeo extends LayerFormat {
  /** Constructor 
   */
  constructor() {
    super();
  }
}

/** Read Geoportail layer
 * @param {options} json source
 * @return {ol/layer/Geoportail}
 */
Edugeo.prototype.read = function (options) {
  if (options.type !== 'Edugeo') return;
  // Old GPP services
  switch (options.layer) {
    case 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD':
    case 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.ROUTIER': {
      options.layer = 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2';
      break;
    }
    case 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.NIVEAUXGRIS': {
      options.layer = 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2';
      options.grayscale = true;
      break;
    } 
    case 'GEOGRAPHICALGRIDSYSTEMS.PLANIGN': {
      options.layer = 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2';
      break;
    }
  }
  // Create
  try {
    const layer = new GeoportailLayer({
      gppKey: options.key,
      layer: options.layer,
      preload: 10
    });
    this.readOptions(layer, options);
    return layer;
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

/** Write Geoportail layer
 *	@param {ol/layer/Geoportail}
 *	@return {object} json data
 */
 Edugeo.prototype.write = function (layer) {
  if (layer.get('type') !== 'Edugeo') return false;
  var s = this.writeOptions(layer);
  s.layer = layer.get('layer');
  s.key = layer.get('key');
  return s;
};

export default Edugeo
