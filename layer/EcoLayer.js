import VectorLayer from 'ol/layer/Vector';
import VectorStyle from './VectorStyle';

/**
 * Source for Espace Coll/** Set popupcontent of the layer
 *	@param {string} content
 */
class EcoLayer extends VectorLayer {
  constructor(options) {
    options = options || {};
    super(options);
    this.set('type', 'ECo')
    this.getSource().on('addfeature', e => {
      e.feature._layer = this;
    });
  }
}

/** Get popupcontent of the layer
 *	@return {html} popupcontent
 */
EcoLayer.prototype.getPopupContent = VectorStyle.prototype.getPopupContent

/** Set popupcontent of the layer
 *	@param {string} content
 */
EcoLayer.prototype.setPopupContent = VectorStyle.prototype.setPopupContent

/** Check if layer is selectable
 * @param {boolean} [selectable] if define set selectable, default only test selection is enabled
 * @returns {boolean}
 */
EcoLayer.prototype.selectable = VectorStyle.prototype.selectable

/** Check if layer is selectable
 * @param {boolean} [selectable] if define set selectable, default only test selection is enabled
 * @returns {boolean}
 */
EcoLayer.prototype.getIgnStyle = function() { return {}; }


export default EcoLayer