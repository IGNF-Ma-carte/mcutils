import BaseFormat from '../format/Carte.js';
import { ignStyleDef } from '../style/ignStyleFn.js';
import Layer from '../format/layer/Layer';
import GeopfExtensionsFormat from './GeopfExtensionsFormat.js';


/** Base class for reading / writing .macarte
 * @memberof mcutils.format
 * @api
 */
class CarteFormat extends BaseFormat {
  /** Constructor 
   */
  constructor() {
    super();
  }

  /**
   * Add a layer format to the list of existing formats
   * @param {import("../format/layer/Layer").default} format Format to add
   */
  static addLayerFormat(format) {
    if (format instanceof Layer || format.prototype instanceof Layer) {
      this.layerFormats?.push(format);
    } else {
      console.warn(`format is not an instance of mcutils.format.Layer.`);
    }
  }

  /** Read a single layer
   * @param {Object} options layer options (json object)
   * @param {string} key GPP API key
   * @return {ol/layer/Layer}
   */
  readLayer(options, key) {
    const layer = super.readLayer(options, key);
    if (layer && (options.logo || options.thumbnail)) {
      // Met le logo dans thumbnail pour compatibilité ext-gpf
      layer.set("thumbnail", options.logo || options.thumbnail);
    }
    if (layer && (options.description)) {
      // Met le logo dans thumbnail pour compatibilité ext-gpf
      layer.set("description", options.description);
    }
    return layer;
  }

  /** Write method
   * @param {mcutils.Carte} carte
   * @param {boolean} uncompressed if true, the output will not be compressed (for debug purpose)
   * @return {Object} options json object
   */
  write(carte, uncompressed) {
    const options = super.write(carte, uncompressed);
    options.version = 3.01; // Force version to 3.01 for backward compatibility

    // Options pour la storymap
    if (carte.get("story")) {
      options.param.story = Object.assign({}, carte.get("story"));
    }
    return options;
  }

  /** Read method
   * @param {mcutils.Carte} carte
   * @param {Object} options json object
   * @return {mcutils.Carte}
   */
  read(carte, options) {
    const v4 = (options.version > 3);
    // upgradeCarte(options);
    super.read(carte, options);
    // Update layer styles to V4 format
    if (!v4) {
      carte.getMap().getLayers().forEach(layer => {
        if (layer.setIgnStyle) {
          for (let k in ignStyleDef) {
            layer.setIgnStyle(k, ignStyleDef[k].defaultV4);
          }
        }
      });
    }

    // Options pour la storymap
    if (options.param?.story) {
      const story = Object.assign({}, options.param?.story);
      carte.set("story", story);
    }
    return carte;
  }
}

CarteFormat.addLayerFormat(GeopfExtensionsFormat);

export default CarteFormat;