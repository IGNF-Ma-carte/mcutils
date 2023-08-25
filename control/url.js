/** @module control/url 
 * @description Handle url parameters / map position
 */

import fmap from '../dialog/fakeMap';
import Permalink from 'ol-ext/control/Permalink';

// Permalink control to handle 
const plink = new Permalink();
fmap.addControl(plink);

/** Get initial position from the url
 * @returns {Object} lon, lat, z and r
 */
function getUrlPosition() {
  return plink.getInitialPosition();
}

/** Reset the url position
 */
function resetUrlPosition() {
  return plink.set('initial', false);
}

/** Get parameter from url
 * @param {string} [key] if none returns all url parmeters
 * @return {string}
 */
function getUrlParameter(key) {
  if (key) return plink.getUrlParam(key)
  else return plink.getUrlParams()
}

/** Check parameter from url
 * @param {string} [key] if none returns all url parmeters
 * @return {string}
 */
function hasUrlParameter(key) {
  return Object.prototype.hasOwnProperty.call(plink.getUrlParams(), key);
}

export { getUrlPosition } 
export { getUrlParameter } 
export { hasUrlParameter } 
export { resetUrlPosition } 
