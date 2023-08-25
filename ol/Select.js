/* @File extent openlayers select interaction to handle MVT selection */
import SelectInteraction from 'ol/interaction/Select'
import RenderFeature from 'ol/render/Feature'
import { render2Feature } from './Feature'

/** Select interaction to handle MVT selection
 */
class Select extends SelectInteraction {
  constructor(options) {
    super(options);
  }
}

/** Convert feature before dispatch select event
 */
Select.prototype.dispatchEvent = function(e) {
  if (e.type === 'select') {
    e.selected.forEach((feature, i) => {
      if (feature instanceof RenderFeature) {
        // Replace with feature object
        this.getFeatures().remove(feature);
        const f2 = render2Feature(feature);
        e.selected[i] = f2;
        this.getFeatures().push(f2);
      }
    })
  }
  SelectInteraction.prototype.dispatchEvent.call(this, e);
}

// Prevent crash on select
if (RenderFeature.prototype.getStyle || RenderFeature.prototype.addEventListener) {
  console.warn('[Select] RenderFeature is overwritten!')
}
RenderFeature.prototype.getStyle = function() {};
RenderFeature.prototype.setStyle = function() {};
RenderFeature.prototype.addEventListener = function() {};
RenderFeature.prototype.removeEventListener = function() {};

export default Select
