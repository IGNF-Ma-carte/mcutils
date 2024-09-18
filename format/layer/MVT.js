/**	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import LayerFormat from './Layer';
import LayerMVT from '../../layer/MVT';
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';

/** MVT layer format reader/writer
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class MVT extends LayerFormat {
  /** Constructor 
   */
   constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 *  @param {string} url url of the static image
 * @return {LayerMVT} 
 */
 MVT.prototype.read = function (options) {
  if (options.type !== 'MVT') return null;
  
  // Style
  let mbstyle, layer;
  try {
    if (options.mbstyle) {
      mbstyle = JSON.parse(options.mbstyle);
    }
  } catch(e) { /* oops */ }

  // Create layer
  if (mbstyle && Object.keys(mbstyle.sources).length > 1) {
    // Maplibre layer
    layer = new MapLibreLayer({
      title: options.title,
      mapLibreOptions: {
        style: mbstyle
      },
      attributions: options.copyright
    });
    layer.set('style', options.mbstyle);
  } else {
    layer = new LayerMVT({
      title: options.title,
      url: options.url,
      attributions: options.copyright
    })
    if (options.mbstyle) {
      try {
        layer.set('style', options.mbstyle);
        const data = mbstyle;
        layer.applyStyle(data);
      } catch(e) { /* oops */ }
    }
  }
  this.readOptions(layer, options);
  return layer;
};

/* Write layer params
 * @param {LayerMVT} 
 * @return {object} source
 */
MVT.prototype.write = function (layer) {
  if (layer.get('type') !== 'MVT') return null;
  return this.writeOptions(layer, {
    title: layer.get('title'),
    url: layer.get('styleUrl'),
    mbstyle: layer.get('style'),
  });
};

export default MVT
