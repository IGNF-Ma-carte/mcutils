import ol_Object from 'ol/Object'
import '../api/team.fr'

// Current team
let _team = {};

class Team extends ol_Object {
  constructor() {
    super();
    try {
      _team = JSON.parse(localStorage.getItem('MC@team')) || {}
    } catch(e) {
      _team = {};
    }
    // Save team on page focus
    window.addEventListener('focus', () => {
      localStorage.setItem('MC@team', JSON.stringify(_team))
    })
    // Dispatch event when ready
    setTimeout(() => {
      this.dispatchEvent({ type: 'change', team: _team })
    })
  }
  /** Set the current team
   * @param {Object} [curteam]
   * @param {boolean} [force] true to force change
   */
  set(curteam, force) {
    if (!curteam || !curteam.public_id) {
      // no change
      if (!team.getId()) return;
      curteam = {}
    }
    if (force || this.canChange(curteam)) {
      _team = curteam
      document.body.dataset.teamRole = _team.user_role
      localStorage.setItem('MC@team', JSON.stringify(_team))
      this.dispatchEvent({ type: 'change', team: _team })
    }
  }
  /** Test if team can be changed
   * @param {Objet} newTeam
   * @returns {boolean}
   */
  canChange(/* newTeam */) {
    return true;
  }
  /** Get team
   * @return {Object}
   */
  get() {
    return _team
  }
  /** Get team name
   * @return {string}
   */
  getName() {
    return _team.name || ''
  }
  /** Get team image url
   * @return {string}
   */
  getImage() {
    return _team.profile_picture || ''
  }
  /** Get team cover image url
   * @return {string}
   */
  getCoverImage() {
    return _team.cover_picture || ''
  }
  /** Get team info
   * @return {string}
   */
  getPresentation() {
    return _team.presentation || ''
  }
  /** Get team id
   * @return {string}
   */
  getId() {
    return _team.public_id || '';
  }
  /** Check if team is in the list, if not remove the team
   * @param {Array<Object>} list
   * @returns {boolean}
   */
  checkIn(list) {
    let i;
    for (i=0; i < list.length; i++) {
      if (list[i].public_id === _team.public_id) {
        break;
      }
    }
    const isok = (i !== list.length) 
    if (!isok) {
      this.set();
    }
    return isok;
  }
  /** Get user role in team
   * @return {string}
   */
  getUserRole() {
    return _team.user_role
  }
  /** Is owner?
   */
  isOwner() {
    return _team.user_role === 'owner'
  }
  /** Is locked
   */
  isLocked() {
    return !!_team.locked
  }
  /** Is redactor?
   */
  isRedactor() {
    return _team.user_role === 'owner' || _team.user_role === 'editor'
  }
  /** Set the user
   * @param {Object}
   */
  setUser(user) {
    this._user = user;
    if (user && user.organizations) {
      const corg = user.organizations.find(o => o.public_id === this.getId())
      if (corg) {
        _team.user_role = corg.user_role
        document.body.dataset.teamRole = corg.user_role
        this.changed()
      } else {
        this.set();
      }
    }
  }
}

/* Set team when exist */
const team = new Team;

export default team