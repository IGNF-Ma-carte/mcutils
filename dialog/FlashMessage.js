import ol_Object from 'ol/Object'
import ol_ext_element from "ol-ext/util/element";

import './FlashMessage.css'

/* Container for the flash messages */
const flashContainer = ol_ext_element.create('DIV', {
  'data-role': 'flashMessage',
  parent: document.body
})


/** Show a flash message
 * @memberof mcutils.dialog
 * @constructor
 * @extends ol_Object
 * @param {Object} param
 *  @param {string} type info, success, error, warning
 *  @param {string|Element} message
 *  @param {string} id an id to returned on close
 * @fires close
 * @api
 */
class FlashMessage extends ol_Object {
  /** Constructor 
   */
  constructor(options) {
    options = options || {};
    super();
    const id = this.id = options.id || '';
    const element = this.element = ol_ext_element.create('DIV', {
      className: 'fmessage flash-' + (options.type || 'info'),
      'data-id': id,
      parent: flashContainer
    })
    ol_ext_element.create('I', {
      className: 'fi-close',
      role: 'button',
      'aria-label': 'Fermer',
      title: 'Fermer',
      click: () => {
        this.hide()
      },
      parent: element
    });
    ol_ext_element.create('DIV', {
      html: options.message || '',
      parent: element
    });
    setTimeout(() => element.dataset.visible = '', 200);
  }
  /** Hide the message
   */
  hide(){
    this.element.classList.add('hide');
    setTimeout(() => this.element.remove(), 250);
    this.dispatchEvent({ type: 'close', id: this.id })
  }
}

export default FlashMessage
