import ol_Object from 'ol/Object'

// Current organization
let _organization = {};

class Organization extends ol_Object {
  constructor() {
    super();
    try {
      _organization = JSON.parse(localStorage.getItem('MC@organization')) || {}
    } catch(e) {
      _organization = {};
    }
    // Save organization on page focus
    window.addEventListener('focus', () => {
      localStorage.setItem('MC@organization', JSON.stringify(_organization))
    })
    this.dispatchEvent({ type: 'change', organization: _organization })
  }
  /** Set the current organization
   * @param {Object} [orga]
   */
  set(orga) {
    if (orga && orga.organization_id) {
      _organization = orga;
    } else {
      _organization = {}
    }
    localStorage.setItem('MC@organization', JSON.stringify(_organization))
    this.dispatchEvent({ type: 'change', organization: _organization })
  }
  /** Get the current organization
   * @return {Object}
   */
  get() {
    return _organization
  }
  /** Get the current organization name
   * @return {string}
   */
  getName() {
    return _organization.organization_name || ''
  }
  /** Get the current organization id
   * @return {string}
   */
  getId() {
    return _organization.organization_id || '';
  }
  /** Check if organization is in the list if not remove the organization
   * @param {Array<Object>} list
   * @returns {boolean}
   */
  checkIn(list) {
    let i;
    for (i=0; i < list.length; i++) {
      if (list[i].organization_id === _organization.organization_id) {
        break;
      }
    }
    const isok = (i !== list.length) 
    if (!isok) {
      this.set();
    }
    return isok;
  }
}

/* Set organization when exist */
const organization = new Organization;

export default organization