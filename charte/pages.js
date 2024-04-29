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
    if (id !== this.getId()) {
      page.dataset.hidden = '';
    }
    // Top page
    const top = page.querySelector(".breadcrumb .link-macarte")
    if (top) {
      top.setAttribute('href', config.server);
    }
    return page
  }
  /** Show current page
   * @param {string} id page id
   * @param {boolean} [nohistory=false]
   */
  show(id, nohistory) {
    // console.log('showpage', id)
    if (id==='home') id = '';
    if (nohistory) this.previous = null;
    window.location.hash = '#' + (id || '');
  }
  /** Get current page id
   * @return {string}
   */
  getId() {
    const id = window.location.hash.replace('#', '');
    return id || 'home'
  }
  /** Get page element
   * @param {string} [id='home'] 
   * @returns {Element}
   */
  getPage(id) {
    return document.querySelector('[data-role="page"]#' + (id || 'home'))
  }
  /** Set title */
  setTitle(title) {
    title = title || document.title.split(' - ')[0];
    const id = window.location.hash.replace('#', '');
    if (id) title += ' - ' + id
    document.title = title;
  }
  /** Page change event
   * @private
   */
  _onpage() {
    this.setTitle();
    window.scrollTo(0,0);
    const fromPage = this.previous || ''
    const id = this.previous = this.getId();
    let current = this.getPage(id)
    if (!current) {
      this.show();
      return;
    }
    document.querySelectorAll('[data-role="page"]').forEach(p => {
      if (p===current) {
        delete p.dataset.hidden;
      } else {
        p.dataset.hidden = '';
      }
    })
    this.dispatchEvent({ type: 'change', id: id, page: current, from: fromPage })
  }
}

// Singleton
const pages = new Pages

export default pages