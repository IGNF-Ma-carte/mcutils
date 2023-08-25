import ol_ext_element from 'ol-ext/util/element';
import PopupBase from 'ol-ext/util/input/PopupBase'

import './PopupArrow.css'

/** Input to select dash lines in a popup
 * @memberof mcutils.input
 * @extends {InputList}
 * @param {Object} options a list of options
 *  @param {Element} options.input the input
 *  @param {boolean} [options.position='fixed'] popup position on the page
 */
class PopupArrow extends PopupBase {
  constructor(options) {
    options = options || {};
    super(options);
  
    this.element.classList.add('ol-arrow');
    this.input.type = 'text';

    const vignet = ol_ext_element.create('DIV', {
      className: 'vignet',
      parent: this.element
    })
    // Popup
    const popelt = [];
    const arrow = ['','triangle','circle','square'];
    arrow.forEach(d => {
      popelt.push(ol_ext_element.create('DIV', {
        html: ol_ext_element.create('DIV', {
          className: 'arrow-'+(d || 'none'),
        }),
        click: () => {
          this.setValue(d);
          this.collapse(true);
        },
        parent: this._elt.popup
      }));
    });

    // Show on change
    this.input.addEventListener('change', () => {
      setTimeout(() => {
        // Show elt
        popelt.forEach((e,i) => {
          e.className = (this.input.value === arrow[i] ? 'selected' : '') 
        })
        vignet.className = 'vignet arrow-' + (this.input.value||'none');
      })
    })
    this.setValue(this.input.value)
  }
}

export default PopupArrow
