/**	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import { intersects as ol_extent_intersects } from 'ol/extent.js'
import ol_source_WFS from 'ol-ext/source/TileWFS'
import LayerFormat from './Layer';
import VectorStyle from '../../layer/VectorStyle'

/** WFS layer format reader/writer
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class WFS extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 *  @param {string} url url of the static image
 * @return {VectorStyle} 
 */
 WFS.prototype.read = function (options) {
  if (options.type !== 'WFS') return null;
  const layer = new VectorStyle({
    source: new ol_source_WFS({
      url: options.url,
      typeName: options.typeName,
      tileZoom: options.tileZoom,
      outputFormat: options.format,
      version: options.version || '2.0.0'
    }),
  })
  layer.setMinZoom(options.tileZoom)
  // Prevent load outside extent
  const loader = layer.getSource().loader_;
  const layerExtent = options.extent;
  layer.getSource().loader_ = function(extent, resolution, projection) {
    if (layerExtent && ol_extent_intersects(extent, layerExtent)) {
      loader.call(this, extent, resolution, projection)
    }
  }

  // Save parameters
  layer.getSource().set('url', options.url)
  layer.getSource().set('version', options.version)
  layer.getSource().set('format', options.format)
  layer.getSource().set('typeName', options.typeName)
  layer.getSource().set('tileZoom', options.tileZoom)
  // Options
  this.readOptions(layer, options);
  return layer;
};

/* Write layer params
 * @param {ol_layer_Layer} 
 * @return {object} JSON layer
 */
WFS.prototype.write = function (layer) {
  if (layer.get('type') !== 'WFS') return null;
  const source = layer.getSource();
  return this.writeOptions(layer, {
    url: source.get('url'),
    typeName: source.get('typeName'),
    format: source.get('format'),
    version: source.get('version'),
    tileZoom: source.get('tileZoom')
  });
};

export default WFS
