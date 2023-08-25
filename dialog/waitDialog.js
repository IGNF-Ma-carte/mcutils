// Import ol styles
import Dialog from 'ol-ext/control/Dialog'
import fakemap from '../dialog/fakeMap'

/** @namespace dialog */
/** A wait dialog
 * @memberof dialog
 * @instance
 */
const waitDialog = new Dialog({ 
  closeBox: true,
  className: 'wait',
  target: document.body
});
waitDialog.setMap(fakemap);

export default waitDialog
