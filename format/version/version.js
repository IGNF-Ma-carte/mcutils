/** @module version
 * @description Convert to V4 format
 */

import { carteV4 } from './tov4'
import { carteGPF } from './toGPF'

/** Update carte format
 * - Convert Carte options to V4 format
 * - Update Geoplateforme services
 * @param {} options
 */
function upgradeCarte(options) {
  // Update to V4 struct
  carteV4(options);
  // Update services to Geoplateforme
  carteGPF(options)
}

export { upgradeCarte }