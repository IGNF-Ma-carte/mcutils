import ol_Object from 'ol/Object'
import ol_ext_element from "ol-ext/util/element";

import './UserInput.css'

let autocompleteTout;

/** User input to get public name with autocomplete list
 */
class UserInput extends ol_Object {
  /** Constructor
   * @fires select
   * @param {MacarteAPI} api
   * @param {Object} options
   *  @param {Element} [options.target] element to place in
   *  @param {boolean} [full] get full information (id and picture)
   */
  constructor(api, options) {
    super();
    options = options || {};
    this.set('full', !!options.full)

    this.api = api;
    const user = this.element = ol_ext_element.create('DIV', { className: 'author-list', parent: options.target });

    // Search input
    const searchAut = this.searchInput = ol_ext_element.create('INPUT', { 
      type: 'text', 
      className: 'author', 
      placeholder: 'chercher un membre...',
      parent: user 
    });
    ol_ext_element.create('I', { className: 'loading', parent: user })
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

/** Autocomplete author list
 * @param {string} value
 */
UserInput.prototype.autocompleteAuthor = function(value, autolist) {
  if (autocompleteTout) clearTimeout(autocompleteTout);
  this.element.dataset.loading = '';
  autocompleteTout = setTimeout(() => {
    if (!value) {
      autolist.innerHTML = '';
      delete this.element.dataset.loading;
      return;
    }
    // Get full user info
    if (this.get('full')) {
      this.api.getUsers(value, users => {
        delete this.element.dataset.loading;
        autolist.innerHTML = '';
        if (users && users.forEach) {
          users.forEach(u => {
            const li = ol_ext_element.create('LI', {
              text: u.public_name,
              className: 'full',
              click: () => {
                this.dispatchEvent({ type: 'select', user: u })
              },
              parent: autolist
            })
            if (u.profile_picture) {
              ol_ext_element.create('IMG', { 
                src: u.profile_picture,
                parent: li
              })
            }
          })
        }
      })
    } else {
      // Get user name
      this.api.searchMapUsers({
        public_name: value
      }, (users) => {
        delete this.element.dataset.loading;
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
    }
  }, 500);
};

export default UserInput