import BaseFormat from "../Base";

/** MousePosition contorl reader/writer
 * @memberof mcutils.format.control
 * @extends mcutils.format.Base
 */
class MousePosition extends BaseFormat {
  /** Constructor 
   */
  constructor(ctrl, options) {
    super();
    if (ctrl) this.read(ctrl, options)
  }
}

/** Read control format
 * @param {ol/control/MousePosition} ctrl
 * @param {Object} options
 */
MousePosition.prototype.read = function(ctrl, options) {
  options = options || {};
  ctrl.setProjection(options.proj || 'EPSG:4326');
  ctrl.set('unit', options.unit || 'dms');
};

/** Write control format
 * @return {ol/control/MousePosition} ctrl
 * @return {Object} options
 */
MousePosition.prototype.write = function(ctrl) {
  return {
    valeur: ctrl.getProjection().getCode(),
    unite: ctrl.get('units')
  }
};

export default MousePosition
  