import ol_ext_element from 'ol-ext/util/element';
import organization from './organization';
import api from './api'

/** OrganizationSelector controler
 * @typedef {Object} organizationSelectorCtrl
 * @property {Element} element the select element
 * @property {function} setOptions a function to reset the select
 * @property {function} onselect a function that takes a callback with the selected organization
 * @property {function} onready a function that takes a callback with the list of organizattions
 */

/** Create an organizations select element
 * @param {Element} [parent]
 * @return {organizationSelectorCtrl}
 */
function organizationSelector(parent) {
  let myOrga = {};
  let onselect = function() {}
  let onready =  function() {}
  // Select new Organization
  const orgasel = ol_ext_element.create('SELECT', {
    disabled: true,
    change: () => {
      onselect(myOrga[orgasel.value])
    },
    parent: parent
  })

  function setOptions() {
    orgasel.innerHTML = '';
    // None
    const none = ol_ext_element.create('OPTION', {
      text: 'chargement...',
      value: '',
      parent: orgasel
    });
    // List my organizations
    api.getOrganizations(organisations => {
      if (!organisations || !organisations.length) {
        none.innerText = 'Aucune organisation';
        return;
      }
      none.innerText = 'hors organisation';
      myOrga = {};
      organisations.forEach(o => {
        myOrga[o.public_id] = o;
        const opt = ol_ext_element.create('OPTION', {
          text: o.name,
          value: o.public_id,
          parent: orgasel
        })
        if (organization.get().public_id === o.public_id) {
          opt.selected = true;
        }
      });
      orgasel.disabled = false;
      onready(organisations);
      onselect(myOrga[orgasel.value])
      organization.checkIn(organisations)
    })
  }
  setOptions();
  // API to control the select
  const selectCtrl = {
    element: orgasel,
    setOptions: setOptions,
    getValue: () => orgasel.value,
    getOrganization: () => myOrga[orgasel.value],
    onselect: fn => {
      if (typeof(fn) === 'function') onselect = fn
      return selectCtrl;
    },
    onready: fn => {
      if (typeof(fn) === 'function') onready = fn
      return selectCtrl;
    }
  }
  return selectCtrl;
}

export { organizationSelector }