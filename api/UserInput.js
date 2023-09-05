import ol_ext_element from "ol-ext/util/element";



class UserInput {
  constructor(api, options) {
    this.api = api;
    const user = ol_ext_element.create('DIV', { className: 'author', parent: options.parent });

    const searchAut = ol_ext_element.create('INPUT', { 
      type: 'text', 
      className: 'author', 
      placeholder: 'chercher un auteur...',
      parent: user 
    });
    searchAut.addEventListener('keyup', () => {
      this.autocompleteAuthor(searchAut.value, autolist);
    });
    searchAut.addEventListener('focus', () => {
      autolist.style.display = 'block';
    })
    searchAut.addEventListener('focusout', () => {
      setTimeout(() => autolist.style.display = 'none', 200);
    })
    const autolist = ol_ext_element.create('UL', { className: 'autocomplete', parent: user });
  }
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
              this.removeFilter('user')
              this.setFilter('user', u);
              this.showPage();
            },
            parent: autolist
          })
        })
      }
    })
  }, 500);
};

export default UserInput