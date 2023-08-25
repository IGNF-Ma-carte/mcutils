import './dialog.css'
import Dialog from 'ol-ext/control/Dialog'
import fakemap from './fakeMap'
import md2html from '../md/md2html';
import ol_ext_element from 'ol-ext/util/element';
import _T from '../i18n/i18n';

/* A ol-ext dialog to show information on the map
 */
const dialog = new Dialog({ 
  className: 'md',
  closeBox: true,
  target: document.body
});
dialog.setMap(fakemap);

dialog.on('hide', () => dialog.setContent('none'));
dialog.on('show', () => dialog.getContentElement().scrollTop = 0);

/** Add an help dialog on an element
 * @param {Element} elt an I element to connect the help or an element to add a I element
 * @param {string} md dialog content as markdown
 * @param {Object} [options]
 *  @param {string} [title="aide..."]
 *  @param {string} [className=large] small large or medium
 */
function helpDialog(elt, md, options) {
  options = options || '';
  if (elt.tagName==='I') {
    elt.classList.add('mc-help');
    elt.title = options.title || 'aide...';
  } else {
    elt = ol_ext_element.create('I', {
      className: 'mc-help',
      title: options.title || 'aide...',
      parent: elt
    })
  }
  elt.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    showHelp(md, options);
  })
}

/** Show an help dialog
 * @param {string} md dialog content as markdown
 * @param {Object} [options]
 *  @param {string} [title="aide..."]
 *  @param {string} [className=large] small large or medium
 */
function showHelp(md, options) {
  options = options || {};
  dialog.show({
    title: options.title || '',
    content: md2html(md, options.mdOptions),
    className: 'help',
    buttons: options.buttons || ['ok'],
    onButton: options.onButton
  });
  dialog.element.classList.remove('large');
  dialog.element.classList.remove('medium');
  dialog.element.classList.remove('small');
  (options.className || '').split(' ').forEach(c => {
    dialog.element.classList.add(c || 'large');
  });
  // Load twitter widget
  md2html.renderWidget(dialog.element);
}


/** Handles data-help
 * @param {element} content
 */
function helpData(content) {
  content.querySelectorAll('[data-help]').forEach((elt) => {
    const help = elt.getAttribute('data-help').split(' ');
    helpDialog(elt, _T(help[0]), { className: help[1] || 'small' });
  })
}

export {showHelp, helpData}

export default helpDialog
