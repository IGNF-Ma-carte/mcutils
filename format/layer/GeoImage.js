/*	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import ol_layer_Image from 'ol/layer/Image'
import ol_source_GeoImage from 'ol-ext/source/GeoImage'
import LayerFormat from './Layer';

/** Lecture de layer image au format macarte.
 * @memberof mcutils.format.layer
 * @extends mcutils.format.layer.Layer
 * @param {} options Options.
 */
class GeoImage extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Reader
 * @param {*} options extend layer options
 *  @param {string} url url of the static image
 *  @param {ol.Coordinate} options.imageCenter center of the image
 *  @param {ol.Size|Number} options.imageScale [scalex, scaley] of the image
 *  @param {number} options.imageRotate angle of the image in radian, default 0
 *  @param {ol.Extent} imageCrop image crop to be show (in the image) default: [0,0,imageWidth,imageHeight]
 *  @param {Array.<ol.Coordinate>} imageMask linestring to mask the image on the map
 * @return {ol_layer_Image} 
 */
GeoImage.prototype.read = function (options) {
  if (options.type !== 'GeoImage') return false;
  var source = new ol_source_GeoImage({
    "url": options.url,
    "imageCenter": options.imageCenter,
    "imageRotate": options.imageRotate,
    "imageScale": options.imageScale,
    "imageMask": options.imageMask
  });
  var layer = new ol_layer_Image({
    source: source
  });
  this.readOptions(layer, options);
  return layer;
};

/* Writer
 * @param {ol.layer.Image} 
 * @return {object} source
 */
GeoImage.prototype.write = function (layer) {
  if (layer.get('type') !== 'GeoImage') return false;
	return this.writeOptions(layer, { 
    url: layer.getSource().getGeoImage().src,
    imageCenter: layer.getSource().getCenter(),
    imageRotate: layer.getSource().getRotation(),
    imageScale: layer.getSource().getScale(),
    imageMask: layer.getSource().getMask()
  });
};

export default GeoImage
