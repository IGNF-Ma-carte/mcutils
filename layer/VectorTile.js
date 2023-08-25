import VectorTileLayer from 'ol/layer/VectorTile';
import VectorStyle from './VectorStyle'
import '../ol/Feature'
import { getStyleFn } from '../style/ignStyleFn';

/** Extend Vector tile 
 * - add layer in features attributes
 * - add layer ignStyle
 * - add selectable
 * @memberof ol.layer
 * @extends {VectorTileLayer}
 */
class VectorTile extends VectorTileLayer {
  constructor(options) {
    super(options);
    this.selectable(false);
    this.setStyle(getStyleFn());
  }
}

/** Set source to add layer in features attributes when loaded
 * @param {*} source
 */
VectorTile.prototype.setSource = function(source) {
  if (source) {
    source.on('tileloadend', (e) => {
      e.tile.getFeatures().forEach(f => f.setLayer(this));
    })
    if (!source.getAttributions() && this.get('attributions')) {
      source.setAttributions(this.get('attributions'));
    }
  }
  VectorTileLayer.prototype.setSource.call(this, source);
}

/** Set default ignStyle for a layer
 *	@param {string|ignStyle} property the property to set
 *	@param {string|number} val the value to set
 */
VectorTileLayer.prototype.setIgnStyle = VectorStyle.prototype.setIgnStyle
/** Get ignStyle for the layer or a feature
 *	@param {Object} ignStyle
 */
VectorTileLayer.prototype.getIgnStyle = VectorStyle.prototype.getIgnStyle
/** Default IGN style
 */
VectorTileLayer.prototype.defaultIgnStyle = VectorStyle.prototype.defaultIgnStyle
/** Get popupcontent of the layer
 *	@return {html} popupcontent
 */
VectorTileLayer.prototype.getPopupContent = VectorStyle.prototype.getPopupContent
/** Set popupcontent of the layer
 *	@param {string} content
 */
VectorTileLayer.prototype.setPopupContent = VectorStyle.prototype.setPopupContent
/** Check if layer is selectable
 * @param {boolean} [selectable] if define set selectable, default only test selection is enabled
 * @returns {boolean}
 */
VectorTileLayer.prototype.selectable = VectorStyle.prototype.selectable

export default VectorTile
