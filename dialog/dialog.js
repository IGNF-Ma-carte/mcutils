import './dialog.css'
import Dialog from 'ol-ext/control/Dialog'
import fakemap from './fakeMap'
import md2html from '../md/md2html';
import _T from '../i18n/i18n'
import ol_ext_element from 'ol-ext/util/element'

/** @namespace dialog */
/** A ol-ext dialog to show information on the map 
 * See {@link http://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Dialog.html|ol/control/Dialog}
 * @memberof dialog
 * @instance
 */
const dialog = new Dialog({ 
  closeOnSubmit: false,
  closeBox: true,
  target: document.body
});
dialog.setMap(fakemap);

/** Extend ol-ext show method with markdown content.
 * See ol-ext documentaion for more information: 
 * {@link http://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Dialog.html#show__anchor|ol/control/Dialog~show}
 * @param {Object} options
 *  @param {string} options.md the dialog content as a markdown
 * @memberof! dialog#
 */
dialog.show = function(options) {
  // Show markdown
  if (options && options.md) {
    options.content = md2html(options.md);
    options.className += (options.className ? ' md' : 'md');
  }
  // Show
  Dialog.prototype.show.call(this, options);
  options = options || {};
  // Hide on back
  if (options.hideOnBack) {
    dialog.set('hideOnBack', true);
    const listener = setTimeout(()=> { dialog.hide() }, options.hideOnBack);
    dialog.once('hide', () => {
      dialog.set('hideOnBack', false)
      if (listener) clearTimeout(listener);
    });
  }
  // Load twitter widget
  md2html.renderWidget(dialog.element);
}

/** Display an message dialog
 * @param {string} msg
 * @param {*} [buttons] a list of buttons to show on the dialog, default only one ok button
 * @param {function} [onButton] a fucntion that takes the button id, when click on a button
 * @memberof! dialog#
 */
dialog.showMessage = function(msg, buttons, onButton) {
  dialog.show({
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
 * @memberof! dialog#
 */
dialog.showAlert = function(msg, buttons, onButton) {
  dialog.show({
    className: 'alert',
    content: msg,
    buttons: buttons || { cancel: _T('ok')},
    onButton: onButton
  })
};

/** Display a wait dialog
 * @param {string} msg
 * @memberof! dialog#
 */
dialog.showWait = function(msg) {
  dialog.show({
    className: 'wait',
    closeBox: false,
    content: msg
  });
};

/** Display a 404 page
 * @param {string} msg message
 * @param {string} error information
 * @memberof! dialog#
 */
dialog.show404 = function(msg, error) {
  const d = ol_ext_element.create('DIV');
  ol_ext_element.create('DIV', { className: 'mc-image-boussole', parent: d })
  ol_ext_element.create('B', { className: 'mc-info', html: error, parent: d })
  ol_ext_element.create('DIV', { className: 'mc-info', html: msg, parent: d })
  dialog.show({
    className: 'page404',
    closeBox: false,
    content: d
  })
};

export default dialog
