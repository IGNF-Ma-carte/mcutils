/**	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import ol_layer_Tile from 'ol/layer/Tile'
import ol_source_XYZ from 'ol/source/XYZ';
import LayerFormat from './Layer';

/** XYZ layer format reader/writer
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class XYZ extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 *  @param {string} url url of the static image
 * @return {ol_layer_Tile} 
 */
XYZ.prototype.read = function (options) {
  if (options.type !== 'XYZ') return null;
  const layer = new ol_layer_Tile({
    source: new ol_source_XYZ({
      url: options.url,
      minZoom: options.sourceMinZoom,
      maxZoom: options.sourceMaxZoom,
      crossOrigin: options.crossOrigin
    })  
  })
  layer.getSource().set('minZoom', options.sourceMinZoom);
  layer.getSource().set('maxZoom', options.sourceMaxZoom);
  this.readOptions(layer, options);
  return layer;
};

/* Write layer params
 * @param {ol_layer_Tile} 
 * @return {object} source
 */
XYZ.prototype.write = function (layer) {
  if (layer.get('type') !== 'XYZ') return null;
  return this.writeOptions(layer, {
    url: layer.getSource().getUrls()[0],
    sourceMinZoom: layer.getSource().get('minZoom'),
    sourceMaxZoom: layer.getSource().get('maxZoom'),
    crossOrigin: layer.getSource().crossOrigin
  });
};

export default XYZ
