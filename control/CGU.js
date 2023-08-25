import './cgu.css'

import _T from '../i18n/i18n'

import ol_ext_element from "ol-ext/util/element";
import Control from "ol/control/Control";

/* CGU control
 * @api
 */
 class CGU extends Control {
  /* Constructor 
   * @param {*} options
   *  @param {string|Element} [target]
   *  @param {string} key GPP api key
   */
  constructor(options) {
    options = options || {};
    const element = ol_ext_element.create('UL', {
      className: 'ol-control ol-cgu'
    })
    super({ 
      element: element,
      target: options.target
    });

    ol_ext_element.create('LI', {
      html: _T('macarte_link'),
      parent: element
    });
    ol_ext_element.create('LI', {
      html: _T('cgu_link'),
      parent: element
    });
    ol_ext_element.create('LI', {
      html: _T('report_link'),
      parent: element
    });
  }
}

export default CGU
