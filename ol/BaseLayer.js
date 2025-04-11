/* Add Macarte filters
 */
import 'ol-ext/filter/Base'
import ol_layer_Base from 'ol/layer/Base'
import CSSFilter from 'ol-ext/filter/CSS';
import getUid from '../format/layer/getUid';

import MaskFilter from 'ol-ext/filter/Mask'
import CropFilter from 'ol-ext/filter/Crop'
import Feature from './Feature';
import MultiPolygon from 'ol/geom/MultiPolygon'
import Fill from 'ol/style/Fill'

/* Add a CSS filter to a layer, based on the grayscale and blendMode properties */
function addFilter(layer) {
  if (layer._mcFilter) layer.removeFilter(layer._mcFilter);
  if (layer.get('grayscale') || layer.get('blendMode')) {
    const options = {};
    if (layer.get('grayscale')) options.filter = 'grayscale(1)';
    if (layer.get('blendMode')) options.blend = layer.get('blendMode');
    layer._mcFilter = new CSSFilter(options);
    layer.addFilter(layer._mcFilter);
  }
}

/* Prevent code injection
 */
const setFn = ol_layer_Base.prototype.set
ol_layer_Base.prototype.set = function(p,val) {
  if (val && (p==='name' || p==='title')) {
    const html = ol_ext_element.create('DIV', { html: val })
    val = html.innerText;
  }
  setFn.call(this, p,val)
}

/* Force layer className on layer creation
 */
const setProperties = ol_layer_Base.prototype.setProperties
ol_layer_Base.prototype.setProperties = function(properties) {
  if (this.className_ === 'ol-layer') {
    this.className_ = getUid();
  }
  setProperties.call(this, properties);
}

/** Set a grayscale filter to an ol.Layer
 * @method ol.layer.Base#grayscale
 * @param {boolean} b
 */
ol_layer_Base.prototype.grayscale = function(b) {
  this.set('grayscale', !!b);
  addFilter(this);
}

/** Set a blend mode to an ol.Layer
 * @method ol.layer.Base#setBlendMode
 * @param {string} [mode=normal] the blend mode: normal | multiply | screen | overlay | darken | lighten | color-dodge | color-burn | hard-light | soft-light | difference | exclusion | hue | saturation | color | luminosity
 */
ol_layer_Base.prototype.setBlendMode = function(mode) {
  this.set('blendMode', mode || 'normal');
  addFilter(this);
}

/** Set Crop filter to a layer
 * @method ol.layer.Base#setBlendMode
 * @param {Object} [crop]
 *  @param {ol_geom_coordinates} crop.coordinates
 *  @param {ol_color} crop.color
 *  @param {boolean} crop.shadow
 */
ol_layer_Base.prototype.setCrop = function(crop) {
  // Convert
  if (Array.isArray(crop)) {
    const c = crop;
    crop = {};
    for (let i in c) crop[i] = c[i];
  }
  // Remove current crop
  this.getFilters().forEach(c => {
    if (c instanceof MaskFilter) {
      this.removeFilter(c);
    }
  })
  // Set Crop
  if (crop && crop.coordinates) {
    // Add filter
    const f = new Feature(new MultiPolygon(crop.coordinates));
    if (crop.color && crop.color[3]) {
      const fill = new Fill({ color: crop.color })
      this.addFilter(new MaskFilter({ feature: f, wrapX: true, inner: false, shadowWidth: crop.shadow ? 2 : 0, fill: fill }));
    } else {
      this.addFilter(new CropFilter({ feature: f, wrapX: true, inner: false, shadowWidth: crop.shadow ? 5 : 0 }));
    }
  }
  this.set('crop', crop);
}

/** Set Crop filter to a layer
 * @method ol.layer.Base#setBlendMode
 * @param {Object} [crop]
 */
ol_layer_Base.prototype.getCrop = function() {
  return this.get('crop') || {}
}

/** Get popupcontent for a feature
 *	@param {ol.Feature|undefined} f the feature to get information on, if undefined get the popupcontent of the layer
 *	@return {html} popupcontent
 */
ol_layer_Base.prototype.getPopupContent = function() {
  return this._popupContent || {};
};

/** Set popupcontent of the layer
 *	@param {string} content
 */
ol_layer_Base.prototype.setPopupContent = function(content) {
  if (!content || content instanceof Array) this._popupContent = {};
  else this._popupContent = content;
};
