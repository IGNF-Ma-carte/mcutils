import ol_Object from 'ol/Object'
import ol_ext_element from "ol-ext/util/element";

import './UserInput.css'

/** User input to get public name with autocomplete list
 */
class UserInput extends ol_Object {
  /** Constructor
   * @fires select
   * @param {MacarteAPI} api
   * @param {Object} options
   *  @param {Element} [options.target] element to place in
   */
  constructor(api, options) {
    super();
    options = options || {};

    this.api = api;
    const user = this.element = ol_ext_element.create('DIV', { className: 'author-list', parent: options.target });

    // Search input
    const searchAut = this.searchInput = ol_ext_element.create('INPUT', { 
      type: 'text', 
      className: 'author', 
      placeholder: 'chercher un auteur...',
      parent: user 
    });
    const autolist = ol_ext_element.create('UL', { className: 'autocomplete', parent: user });
    // Autocomplete
    searchAut.addEventListener('keyup', () => {
      this.autocompleteAuthor(searchAut.value, autolist);
    });
    searchAut.addEventListener('focus', () => {
      autolist.style.display = 'block';
    })
    searchAut.addEventListener('focusout', () => {
      setTimeout(() => autolist.style.display = 'none', 200);
    })
  }
}

/** Set the autor value
 * @param {string} public_name
 */
UserInput.prototype.setUser = function(public_name) {
  this.searchInput.value = public_name;
}

let autocompleteTout;

/** Autocomplete author list
 * @param {string} value
 */
UserInput.prototype.autocompleteAuthor = function(value, autolist) {
  if (autocompleteTout) clearTimeout(autocompleteTout);
  autocompleteTout = setTimeout(() => {
    this.api.searchUsers({
      public_name: value
    }, (users) => {
      autolist.innerHTML = '';
      if (users && users.forEach) {
        users.forEach(u => {
          ol_ext_element.create('LI', {
            html: u,
            click: () => {
              this.dispatchEvent({ type: 'select', public_name: u })
            },
            parent: autolist
          })
        })
      }
    })
  }, 500);
};

export default UserInput