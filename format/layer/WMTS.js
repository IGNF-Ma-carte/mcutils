/**	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import ol_layer_Tile from 'ol/layer/Tile'
import ol_source_WMTS from 'ol/source/WMTS'
import LayerFormat from './Layer';
import WMTSCapabilities from 'ol-ext/control/WMTSCapabilities'

/** WMTS layer format reader/writer
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class WMTS extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 *  @param {string} url url of the static image
 *  @param {ol.Coordinate} options.imageCenter center of the image
 *  @param {ol.Size|Number} options.imageScale [scalex, scaley] of the image
 *  @param {number} options.imageRotate angle of the image in radian, default 0
 *  @param {ol.Extent} imageCrop image crop to be show (in the image) default: [0,0,imageWidth,imageHeight]
 *  @param {Array.<ol.Coordinate>} imageMask linestring to mask the image on the map
 * @return {ol_layer_Tile} 
 */
WMTS.prototype.read = function (options) {
  if (options.type !== 'WMTS') return null;
  const param = options.wmtsparam;
  param.source.tileGrid = WMTSCapabilities.prototype.getTileGrid(param.source.matrixSet, param.source.minZoom, param.source.maxZoom);
  const layer = new ol_layer_Tile({
    extent: param.layer.extent,
    minResolution: param.layer.minResolution,
    maxResolution: param.layer.maxResolution,
    source: new ol_source_WMTS(param.source)  
  })
  // Restore options
  delete param.source.tileGrid;
  // 
  layer.set('wmtsparam', param);
  this.readOptions(layer, options);
  if (!layer.get('title')) layer.set('title', param.layer.title);
  return layer;
};

/* Writel layer params
 * @param {ol.layer.Image} 
 * @param {} options
 * @return {object} source
 */
WMTS.prototype.write = function (layer /*, options */) {
  if (layer.get('type') !== 'WMTS') return null;
  var s = this.writeOptions(layer, {});
  s.wmtsparam = layer.get('wmtsparam') || layer.wmtsparams;
  return s;
};

export default WMTS
