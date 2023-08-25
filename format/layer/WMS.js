/**	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import ol_layer_Tile from 'ol/layer/Tile'
import ol_source_TileWMS from 'ol/source/TileWMS'
import LayerFormat from './Layer';

/** WMS layer format reader/writer
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class WMS extends LayerFormat {
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
WMS.prototype.read = function (options) {
  if (options.type !== 'WMS') return false;
  const layer = new ol_layer_Tile({
    extent: options.wmsparam.layer.extent,
    queryable: !!options.wmsparam.layer.queryable,
    minResolution: options.wmsparam.layer.minResolution,
    maxResolution: options.wmsparam.layer.maxResolution,
    source: new ol_source_TileWMS(options.wmsparam.source)  
  })
  layer.set('wmsparam', options.wmsparam);
  this.readOptions(layer, options);
  if (!layer.get('title')) layer.set('title', options.wmsparam.layer.title);
  return layer;
};

/* Write layer
 * @param {ol.layer.Image} 
 * @param {} options
 * @return {object} source
 */
WMS.prototype.write = function (layer /*, options */) {
  if (layer.get('type') !== 'WMS') return null;
  var s = this.writeOptions(layer, { 
    wms: true  // ???
  });
  s.wmsparam = layer.get('wmsparam') || layer.WMSParams;
  return s;
};

export default WMS
