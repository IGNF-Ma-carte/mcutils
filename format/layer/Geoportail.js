import GeoportailLayer from '../../layer/Geoportail'
import LayerFormat from './Layer';

/** Geoportail layer format reader/writer.
 * @memberof mcutils.format.layer
 * @extends mcutils.format.layer.Layer
 * @api
 */
class Geoportail extends LayerFormat {
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
Geoportail.prototype.read = function (options, key) {
  if (options.type !== 'Geoportail') return;
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
      gppKey: key,
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
Geoportail.prototype.write = function (layer) {
  if (layer.get('type') !== 'Geoportail') return false;
  var s = this.writeOptions(layer);
  s.layer = layer.get('layer');
  return s;
};

export default Geoportail
