import ol_ext_element from 'ol-ext/util/element';
import team from 'mcutils/api/team';
import api from 'mcutils/api/api'

/** teamSelector controler
 * @typedef {Object} teamSelectorCtrl
 * @property {Element} element the select element
 * @property {function} setOptions a function to reset the select
 * @property {function} onselect a function that takes a callback with the selected team
 * @property {function} onready a function that takes a callback with the list of teams
 */

/** Create a team select element
 * @param {Element} [parent]
 * @return {teamSelectorCtrl}
 */
function teamSelector(parent) {
  let myTeam = {};
  let onselect = function() {}
  let onready =  function() {}
  // Select new Team
  const teamsel = ol_ext_element.create('SELECT', {
    disabled: true,
    change: () => {
      onselect(myTeam[teamsel.value])
    },
    parent: parent
  })

  function setOptions() {
    teamsel.innerHTML = '';
    // None
    const none = ol_ext_element.create('OPTION', {
      text: 'chargement...',
      value: '',
      parent: teamsel
    });
    // List my teams
    api.getTeams(teams => {
      if (!teams || !teams.length) {
        none.innerText = 'Aucune équipe';
        return;
      }
      none.innerText = 'hors équipe';
      myTeam = {};
      teams.forEach(o => {
        myTeam[o.public_id] = o;
        const opt = ol_ext_element.create('OPTION', {
          text: o.name,
          value: o.public_id,
          parent: teamsel
        })
        if (team.get().public_id === o.public_id) {
          opt.selected = true;
        }
      });
      teamsel.disabled = false;
      onready(teams);
      onselect(myTeam[teamsel.value])
      team.checkIn(teams)
    })
  }
  setOptions();
  // API to control the select
  const selectCtrl = {
    element: teamsel,
    setOptions: setOptions,
    getValue: () => teamsel.value,
    getOrganization: () => {
      console.warn('[DEPRECATED]')
      myTeam[teamsel.value]
    },
    getTeam: () => myTeam[teamsel.value],
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

export { teamSelector }