import BaseFormat from "../Base";
import LegendFormat from '../Legend'

/** MousePosition contorl reader/writer
 * @memberof mcutils.format.control
 * @extends mcutils.format.Base
 */
class Legend extends BaseFormat {
  /** Constructor 
   * @param {ol.control.Legend} ctrl if defined, read the options
   * @param {Object} options
   * @param {boolean} [append=false]
   * @param {Array<olLayer>} [layers]
   */
  constructor(ctrl, options, append, layers) {
    super();
    if (ctrl) this.read(ctrl, options, append, layers)
  }
}

/** Read Legend
 * @param {ol.control.Legend} ctrl
 * @param {Object} options
 * @param {boolean} [append=false]
 * @param {Array<olLayer>} [layers]
 */
Legend.prototype.read = function(ctrl, options, append, layers) {
  new LegendFormat(ctrl.getLegend(), options, append, layers);
  if (!append) {
    ctrl.collapse(!options.collapsed);
  }
};

/** Write Legend
 * @param {ol.control.Legend} ctrl
 * @return {Object}
 */
Legend.prototype.write = function(ctrl) {
  const options = (new LegendFormat()).write(ctrl.getLegend())
  options.legendVisible = !ctrl.isCollapsed();
  return options
}

export default Legend
  