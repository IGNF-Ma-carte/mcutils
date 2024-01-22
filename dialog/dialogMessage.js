// Import ol styles
import './dialog.css'
import Dialog from 'ol-ext/control/Dialog'
import fakemap from './fakeMap'
import _T from '../i18n/i18n'
import ol_ext_element from 'ol-ext/util/element'
// Dialog first
import './dialog'

/** @namespace dialogMessage
 * @description An other dialog to display message on top of other dialog.
 */
/** A ol-ext dialog to display messages on the map.    
 * See {@link http://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Dialog.html|ol/control/Dialog}
 * @memberof dialogMessage
 * @instance
 */
const dialogMessage = new Dialog({ 
  className: 'md',
  closeBox: true,
  target: document.body
});
dialogMessage.setMap(fakemap);

/** Display an message dialog
 * @param {string} msg
 * @param {*} [buttons] a list of buttons to show on the dialog, default only one ok button
 * @param {function} [onButton] a fucntion that takes the button id, when click on a button
 * @memberof! dialogMessage#
 */
dialogMessage.showMessage = function(msg, buttons, onButton) {
  dialogMessage.show({
    className: 'message',
    content: msg,
    buttons: buttons || { cancel: _T('ok')},
    onButton: onButton
  })
};

/** Display an alert dialog
 * @param {string} msg
 * @param {*} [buttons] a list of buttons to show on the dialog, default only one ok button
 * @param {function} [onButton] a fucntion that takes the button id, when click on a button
 * @memberof! dialogMessage#
 */
dialogMessage.showAlert = function(msg, buttons, onButton) {
  dialogMessage.show({
    className: 'alert',
    content: msg,
    buttons: buttons || { cancel: _T('ok')},
    onButton: onButton
  })
};

/** Display a simple wait dialog
 * @param {string} msg
 * @memberof! dialogMessage#
 */
dialogMessage.showWait = function(msg) {
  dialogMessage.show({
    className: 'wait',
    closeBox: false,
    content: msg
  });
};

/** Display a 404 page
 * @param {string} msg message
 * @param {string} error information
 * @memberof! dialogMessage#
 */
dialogMessage.show404 = function(msg, error) {
  const d = ol_ext_element.create('DIV');
  ol_ext_element.create('DIV', { className: 'mc-image-boussole', parent: d })
  ol_ext_element.create('B', { className: 'mc-info', html: error, parent: d })
  ol_ext_element.create('DIV', { className: 'mc-info', html: msg, parent: d })
  dialogMessage.show({
    className: 'page404',
    closeBox: false,
    content: d
  })
};

export default dialogMessage
