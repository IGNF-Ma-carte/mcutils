import ol_Object from 'ol/Object'

/** Abstract base class; normally only used for creating subclasses and not instantiated in apps.
 * Base class for reading / writing .macarte
 * @memberof mcutils.format
 * @api
 */
class Base extends ol_Object {
  /** Constructor 
   */
  constructor() {
    super();
  }
}

/** Read method
 * @return {Object|boolean}
 */
Base.prototype.read = function() {
  console.warn('[Abstract] read method not implemented...')
  return null
};

/** Write method 
 * @return {Object|boolean} JSON data
 */
Base.prototype.write = function() {
  console.warn('[Abstract] write method not implemented...')
  return '';
};

export default Base
