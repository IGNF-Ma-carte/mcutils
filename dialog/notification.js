import Notification from 'ol-ext/control/Notification'
import ol_ext_element from 'ol-ext/util/element';
import fakemap from './fakeMap'

import './notification.css'

/** A notification object to display non-intrusive information 
 * See {@link http://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Notification.html|ol/control/Notification}
 * @example
 * import notification from 'mcutils/dialog/notification'
 * notification.show('Hello World!', 3000);
 * @example
 * // Display a cancel message
 * import notification from 'mcutils/dialog/notification'
 * notification.cancel('One feature deleted', cancelCallbackFn, 'annuler' ));
 */
const notification = new Notification({ target: document.body, className: 'ol-collapsed' });

fakemap.addControl(notification);

/** Diplay a cancel message
 * @memberof notification
 * @param {string} msg
 * @param {function} [onCancel]
 * @param {string} [cancelTitle='annuler']
 */
notification.cancel = function(msg, onCancel, cancelTitle) {
  const notif = ol_ext_element.create('DIV', { html: msg  });
  
  if (typeof(onCancel) === 'function'){
    ol_ext_element.create('A', {
      html: cancelTitle ||'annuler',
      className: 'cancel',
      click: () => {
        notification.hide();
        onCancel()
      },
      parent : notif
    })
  }

  notification.show(notif, 8000);
}

export default notification;
