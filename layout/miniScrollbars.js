/* DEPRECATED */

import 'overlayscrollbars/css/OverlayScrollbars.css'
import './miniScrollbars.css'
import Popup from 'ol-ext/overlay/Popup'
import OverlayScrollbars from 'overlayscrollbars'

console.log('miniScroll')

// No mini Scrollbars
let miniScrollBars = function() {}

/* Overwrite the show function on desktop (non touch devices)
 * to add mini Scrollbars
 */
if (!('ontouchstart' in window) &&
  navigator.maxTouchPoints <= 0 &&
  navigator.msMaxTouchPoints <= 0) {

  var show = Popup.prototype.show;

  Popup.prototype.show = function(coord, html) {
    // Create Scrollbar if none
    if (this.stopEvent && this.content.className !== 'os-content') {
      OverlayScrollbars(this.content, {
        overflowBehavior : {
          x : "none",
          y : "scroll"
        },
        scrollbars: {
          autoHide: 'leave'
        }
      });
      // New content
      this.content = this.content.querySelector('.os-content');
    }
    // Show!
    show.call(this, coord, html);
    // Goto top
    this.content.parentNode.scrollTop = 0;
  };
  miniScrollBars = OverlayScrollbars;
}

export default miniScrollBars
