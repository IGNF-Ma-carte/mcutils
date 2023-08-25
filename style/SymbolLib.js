import ol_Object from 'ol/Object'
import { Feature } from 'ol';
import Legend from 'ol-ext/legend/Legend';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import getSimpleGeomType from '../geom/getSimpleGeomType';
import { getStyleFn } from './ignStyleFn';

/** A symbol for a given style
 * @extends ol_Object
 * @fires load
 * @api
 */
class SymbolLib extends ol_Object {
  /** Constructor 
   * @param {options}
   *  @param {string} options.name symbol name
   *  @param {Feature} [options.feature] feature the feature to get symbol, if none give a style / type
   *  @param {ignStyle} [options.style] style to apply (if no feature)
   *  @param {string} [options.type] geometry type Point|LineString|Polygon
   *  @param {Array<number>} [options.size] symbol size, default [60,45]
   */
  constructor(options) {
    super();
    options = options || {};
    if (options.margin === undefined) options.margin = 10;
    let f = options.feature;
    let style = Object.assign({}, options.style);
    let type = (options.type || '').replace(/^Polygone$/, 'Polygon'); // old version Polygon
    // If feature > convert to ignStyle
    if (f instanceof Feature) {
      // handle clusters
      if (f.get('features')) f = f.get('features')[0];
      if (f) {
        type = f.getGeometry().getType();
        style = f.getIgnStyle(true);
      }
    }
    // Get feature by type
    type = getSimpleGeomType(type);
    switch (type) {
      case 'Point': {
        f = new Feature(new Point([0,0]));
        break;
      }
      case 'LineString': {
        f = new Feature(new LineString([[0,0], [1,0]]))
        break;
      }
      case 'Polygon': {
        f = new Feature(new Polygon([[[0,0]]]))
        break;
      }
      default: {
        f = null;
      }
    }
    // Create object
    if (f) {
      f.setStyle(getStyleFn());
      f.setIgnStyle(style);
      // Redraw when load
      this._img = Legend.getLegendImage({
        feature: f,
        size: options.size,
        margin: options.margin,
        pixelratio: 1,
        onload: () => {
          this._drawImage()
        }
      })
      f.on('change', () => {
        this._drawImage();
      })
    }
    // Object properties
    this.set('name', options.name);
    this._margin = options.margin;
    this._feature = f;
    this._type = type;
    this.setIgnStyle(style);
    this._size = options.size;
  }
}

/** Draw image on change
 * @private
 */
SymbolLib.prototype._drawImage = function() {
  this._feature.setIgnStyle(this._style);

  const img2 = Legend.getLegendImage({
    size: this._size,
    margin: this._margin,
    pixelratio: 1,
    feature: this._feature
  });
  this._img.getContext('2d').clearRect(0,0,this._img.width, this._img.height);
  this._img.getContext('2d').drawImage(img2, 0,0);
  this.dispatchEvent({ type: 'load' })
}

/** Get symbol image
 * @param {boolean} [clone=false]
 * @returns {HTMLCanvasElement}
 */
SymbolLib.prototype.getImage = function(clone) {
  if (clone) {
    const img = document.createElement('canvas');
    img.width = this._img.width;
    img.height = this._img.height;
    img.getContext('2d').drawImage(this._img,0,0);
    return img;
  }
  return this._img;
}

/** Set ign style
 * @param {ignStyle} style
 */
SymbolLib.prototype.setIgnStyle = function(prop, value) {
  if (this._feature) {
    this._feature.setIgnStyle(prop, value);
    this._style = Object.assign({}, this._feature.getIgnStyle(true));
    delete (this._style.zIndex);
    this._feature.changed();
  }
}

/** Get ign style
 * @returns {ignStyle}
 */
SymbolLib.prototype.getIgnStyle = function() {
  return Object.assign({}, this._style);
}

/** Get geometry type
 * @returns {string} Point|LineString|Polygon
 */
SymbolLib.prototype.getType = function() {
  return this._type;
}

/** Set properties associated with the style
 * @param {Object} prop a list of properties
 */
SymbolLib.prototype.setFeatureProperties = function(prop) {
  const g = this._feature.getGeometry();
  this._feature.setProperties(prop);
  this._feature.setGeometry(g);
}

/** Get as string
 * @return {string} 
 */
SymbolLib.prototype.stringify = function() {
  return {
    name: this.get('name'),
    type: this.getType(),
    style: this.getIgnStyle()
  }
}

export default SymbolLib