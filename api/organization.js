import ol_Object from 'ol/Object'
import './organization.fr'

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
    // Dispatch event when ready
    setTimeout(() => {
      this.dispatchEvent({ type: 'change', organization: _organization })
    })
  }
  /** Set the current organization
   * @param {Object} [orga]
   * @param {boolean} [force] true to force change
   */
  set(orga, force) {
    if (!orga || !orga.public_id) {
      if (!organization.getId()) return;
      orga = {}
    }
    if (force || this.canChange(orga)) {
      _organization = orga
      localStorage.setItem('MC@organization', JSON.stringify(_organization))
      this.dispatchEvent({ type: 'change', organization: _organization })
    }
  }
  /** Test if organization can be changed
   * @param {Objet} newOrga
   * @returns {boolean}
   */
  canChange(/* newOrga */) {
    return true;
  }
  /** Get organization
   * @return {Object}
   */
  get() {
    return _organization
  }
  /** Get organization name
   * @return {string}
   */
  getName() {
    return _organization.name || ''
  }
  /** Get organization image url
   * @return {string}
   */
  getImage() {
    return _organization.profile_picture || ''
  }
  /** Get organization cover image url
   * @return {string}
   */
  getCoverImage() {
    return _organization.cover_picture || ''
  }
  /** Get organization info
   * @return {string}
   */
  getPresentation() {
    return _organization.presentation || ''
  }
  /** Get organization id
   * @return {string}
   */
  getId() {
    return _organization.public_id || '';
  }
  /** Check if organization is in the list if not remove the organization
   * @param {Array<Object>} list
   * @returns {boolean}
   */
  checkIn(list) {
    let i;
    for (i=0; i < list.length; i++) {
      if (list[i].public_id === _organization.public_id) {
        break;
      }
    }
    const isok = (i !== list.length) 
    if (!isok) {
      this.set();
    }
    return isok;
  }
  /** Get user role in organization
   * @return {string}
   */
  getUserRole() {
    return _organization.user_role
  }
  /** Is admin?
   */
  isOwner() {
    return _organization.user_role === 'owner'
  }
  /** Set the user
   * @param {Object}
   */
  setUser(user) {
    if (user && user.organizations) {
      const corg = user.organizations.find(o => o.public_id === this.getId())
      if (corg) {
        _organization.user_role = corg.user_role
        document.body.dataset.orgaRole = corg.user_role
        this.changed()
      } else {
        this.set();
      }
    }
  }
}

/* Set organization when exist */
const organization = new Organization;

export default organization