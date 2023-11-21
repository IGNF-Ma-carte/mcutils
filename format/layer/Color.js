import LayerFormat from './Layer';
import ColorLayer from '../../layer/Color'

/** Format to read/write 
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class Color extends LayerFormat {
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
Color.prototype.read = function (options) {
  if (options.type !== 'Color') return null;
  const layer = new ColorLayer(options)
  // Options
  this.readOptions(layer, options);
  return layer;
}

/* Write layer params
 * @param {ol_layer_Layer} 
 * @return {object} JSON layer
 */
Color.prototype.write = function (layer) {
  if (layer.get('type') !== 'Color') return null;
  return this.writeOptions(layer, {
    color: layer.get('color')
  });
};

export default Color