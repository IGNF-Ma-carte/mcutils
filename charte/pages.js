import ol_Object from 'ol/Object'
import element from 'ol-ext/util/element'
import config from 'mcutils/config/config'

import './page.css'

/** Pages handler using a hash tag
 * @fires change
 */
class Pages extends ol_Object {
  constructor() {
    super()
    // Page change
    window.addEventListener("hashchange", () => this._onpage(), false);
  }
  /** Add a new page
   * @param {string} id
   * @param {string|Element} html
   * @param {Element} parent
   */
  add(id, html, parent) {
    const page =  element.create('DIV', {
      id: id,
      'data-role': 'page',
      html: html,
      parent: parent
    })
    // Hide if not current
    if (id !== this.current()) {
      page.dataset.hidden = '';
    }
    // Top page
    const top = page.querySelector(".breadcrumb .link-macarte")
    if (top) {
      top.setAttribute('href', config.server);
    }
    // Home page
    const gohome = page.querySelector('.breadcrumb .link-home')
    if (gohome) {
      gohome.addEventListener('click', () => {
        this.show();
      })
    }
    return page
  }
  /** Show current page
   */
  show(id) {
    if (id==='home') id = '';
    window.location.hash = '#' + (id || '');
  }
  /** Get current page id
   * @return {string}
   */
  current() {
    const id = window.location.hash.replace('#', '');
    return id || 'home'
  }
  /** Page change event
   * @private
   */
  _onpage() {
    const id = this.current();
    let current = document.getElementById(id);
    if (current) {
      document.body.dataset.show = id;
    }
    document.querySelectorAll('[data-role="page"]').forEach(p => {
      if (p===current) {
        delete p.dataset.hidden;
      } else {
        p.dataset.hidden = '';
      }
    })
    this.dispatchEvent({ type: 'change', id: id, page: current })
  }
}

// Singleton
const pages = new Pages

export default pages