/* eslint sonarjs/no-duplicate-string: 0 */

import Geoportail from 'ol-ext/layer/Geoportail'
import './GeoportailMacarte'

/** Get the Geoplatforme api key for a layer
 * @param {string} key default key
 * @param {string} layer layer name
 */
function getGppKey(key, layer) {
  const capabilities = window.geoportailConfig.capabilities['default']
  return capabilities && capabilities[layer] ? key : null
}

class GeoportailLayer extends Geoportail {
  constructor(options, tileoptions) {
    // Use key in config
    options.gppKey = options.key = '';
    super(options, tileoptions)
  }
}

export { getGppKey }
export default GeoportailLayer
