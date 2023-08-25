/**	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import LayerFormat from './Layer';
import VectorTileLayer from '../../layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile';
import FormatMVT from 'ol/format/MVT'

/** PBF layer format reader/writer
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class PBF extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 *  @param {string} url url of the static image
 * @return {VectorTileLayer} 
 */
 PBF.prototype.read = function (options) {
  if (options.type !== 'PBF') return null;
  const layer = new VectorTileLayer({
    source: new VectorTileSource({
      url: options.url,
      format: new FormatMVT()
    })  
  })
  this.readOptions(layer, options);
  return layer;
};

/* Write layer params
 * @param {ol_layer_Tile} 
 * @return {object} source
 */
PBF.prototype.write = function (layer) {
  if (layer.get('type') !== 'PBF') return null;
  const source = layer.getSource();
  return this.writeOptions(layer, {
    url: source.getUrls()[0]
  });
};

export default PBF
