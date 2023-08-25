/**	@copy (c) IGN - 2023 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
//import ol_source_WFS from 'ol-ext/source/TileWFS'
import LayerFormat from './Layer';
import EcoLayer from '../../layer/EcoLayer'
import EcoSource from '../../layer/EcoSource'
import EcoStyle from '../../style/EcoStyle'

/** Format to read/write WFS from Espace Collaboratif
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class ECo extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 *  @param {Object} table
 * @return {EcoLayer} 
 */
ECo.prototype.read = function (options) {
  if (options.type !== 'ECo') return null;
  const layer = new EcoLayer({
    source: new EcoSource(options.table),
    style: EcoStyle.getFeatureStyleFn(options.table)
  })
  // Options
  this.readOptions(layer, options);
  return layer;
}

/* Write layer params
 * @param {ol_layer_Layer} 
 * @return {object} JSON layer
 */
ECo.prototype.write = function (layer) {
  if (layer.get('type') !== 'ECo') return null;
  const source = layer.getSource();
  return this.writeOptions(layer, {
    table: source.table_
  });
};


export default ECo