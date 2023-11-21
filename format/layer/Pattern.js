import LayerFormat from 'mcutils/format/layer/Layer';
import XYZ from 'ol/source/XYZ'
import TileLayer from 'ol/layer/Tile';

/** Format to read/write 
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class Pattern extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 *  @param {Object} table
 * @return {ColorLayer} 
 */
Pattern.prototype.read = function (options) {
  if (options.type !== 'Pattern') return null;
  const layer = new TileLayer({
    source: new XYZ({
      url: options.url
    })
  })
  // Options
  this.readOptions(layer, options);
  return layer;
}

/* Write layer params
 * @param {ol_layer_Layer} 
 * @return {object} JSON layer
 */
Pattern.prototype.write = function (layer) {
  if (layer.get('type') !== 'Pattern') return null;
  return this.writeOptions(layer, {
    url: layer.getSource().getUrls()[0]
  });
};

export default Pattern