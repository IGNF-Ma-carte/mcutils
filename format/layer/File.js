/**	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import ol_format_Guesser from '../Guesser';
import VectorStyle from '../../layer/VectorStyle'
import VectorSource from 'ol/source/Vector';
import LayerFormat from './Layer';

/** File layer format reader/writer
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class File extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 *  @param {string} options.url 
 *  @param {boolean} options.extractStyle
 * @return {VectorStyle} 
 */
File.prototype.read = function (options) {
  if (options.type !== 'file') return false;
  const layer = new VectorStyle({ source: new VectorSource() });
  this.readOptions(layer, options);
  layer.set('url', options.url);
  layer.set('extractStyles', options.extractStyles);
  // Read feature
  fetch(options.url)
    .then(resp => resp.text())
    .then(data => {
      const format = new ol_format_Guesser();
      const features = format.readFeatures(data, {
        featureProjection: 'EPSG:3857',
        extractStyles: options.extractStyles
      })
      if (features.length) {
        layer.getSource().dispatchEvent('featuresloadstart')
        layer.getSource().addFeatures(features)
        layer.getSource().dispatchEvent('featuresloadend')
      } else {
        layer.getSource().dispatchEvent('featuresloaderror')
      }
    })
    .catch(() => {
      layer.getSource().dispatchEvent('featuresloaderror')
     })
  return layer;
};

/* Write layer
 * @param {VectorStyle} 
 * @return {object} source
 */
File.prototype.write = function (layer) {
  if (layer.get('type') !== 'file') return null;
  return this.writeOptions(layer, {
    url: layer.get('url'),
    extractStyles: !!layer.get('extractStyles')
  });
};

export default File
