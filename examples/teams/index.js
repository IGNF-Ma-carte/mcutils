import ol_ext_element from 'ol-ext/util/element';
import api from '../../api/api'
import charte from '../../charte/macarte'
import dialog from '../../dialog/dialog';
import md2html from '../../md/md2html';
import UserInput from '../../api/UserInput'

import './teams.scss'

charte.setApp('api', 'Equipes');

/* Change team */
import team from '../../api/team';
import { teamSelector } from '../../api/ListTeams'

const selctrl = teamSelector(charte.getAppElement().querySelector('.selector')).onselect(orga => {
  team.set(orga);
})
// Reset the options on login
api.on('login', () => { selctrl.setOptions() })

/* Team list */
const list = ol_ext_element.create('UL', {
  parent: charte.getAppElement().querySelector('.teams')
})

function addUser(t) {
  dialog.show({
    title: 'Ajouter un membre',
    content: '<input type="text" class="userId" />',
    buttons: { ok: 'ok', cancel: 'annuler'},
    onButton: (b, inputs) => {
      if (b==='ok') {
        dialog.showWait('ajout...')
        api.addTeamMember(t.id, inputs.userId.value, 'member', () => {
          showOrga(t);
        });
      }
    }
  })
  const user = new UserInput(api, {
    target: dialog.getContentElement()
  })
  user.on('select', console.log)
}

function showList() {
  list.innerHTML = '';
  const orga = api.getMe().organizations;
  if (orga) {
    orga.forEach(o => {
      const li = ol_ext_element.create('LI', {
        text: o.name + ' (' + o.user_role + ')',
        click: () => {
          dialog.showWait('Organisation ' + o.name + '...')
          showOrga(o);
        },
        parent: list
      })
      if (o.profile_picture) {
        ol_ext_element.create('IMG', {
          src: o.profile_picture,
          parent: li
        })
      }
    });
  }
}

/** Show team by ID */
function showOrga(o)  {
  api.getTeam(o.public_id, orga => {
    dialog.show({
      title: orga.name,
      content: md2html(orga.presentation),
      buttons: { delete: 'Supprimer', addUser: 'Ajouter un membre', cancel: 'annuler' },
      onButton: b => {
        if (b === 'delete') {
          dialog.showWait('Suppression');
          api.deleteTeam(o.public_id, () => {
            dialog.hide();
            showList();
          })
        }
        if (b === 'addUser') {
          addUser(o)
        }
      }
    })
    const img = ol_ext_element.create('INPUT', {
      value: orga.profile_picture || '',
      on: { change: () => {
        dialog.showWait('modification...')
        api.setTeam(orga.public_id, 'image', img.value, () => showOrga(o))
      }},
      parent: dialog.getContentElement()
    })
    const ul = ol_ext_element.create('UL', {
      parent: dialog.getContentElement()
    })
    orga.members.forEach(user => {
      const li = ol_ext_element.create('LI', {
        html: ol_ext_element.create('SPAN', { text: user.public_name }),
        parent: ul
      })
      // Promote
      const sel = ol_ext_element.create('SELECT', {
        on: { change: () => {
          dialog.showWait('modification...')
          api.setTeamMemberRole(orga.public_id, user.public_id, sel.value, () => showOrga(o))
        }},
        parent: li 
      });
      ['member', 'editor', 'owner'].forEach(role => {
        const opt = ol_ext_element.create('OPTION', {
          text: role,
          parent: sel
        })
        if (role === user.role) opt.selected = true
      })
      // Remove user
      ol_ext_element.create('I', {
        className: 'fi-delete button-colored',
        click: () => {
          dialog.showWait('suppression...')
          api.removeTeamMember(orga.public_id, user.public_id, () => showOrga(o))
        },
        parent: li
      });

    })
  })
}

// Gestion login/logout
api.on('me', showList)
api.on(['login', 'logout', 'error', 'disconnect'], (e) => {
  list.innerHTML = '';
});

// Add new orga
charte.getAppElement().querySelector('[data-role="add"]').addEventListener('click', () => {
  dialog.show({
    title: 'Ajouter une organisation',
    content: `<input type="text" placeholder="nom" class="name" />
    <textarea class="presentation" placeholder="presentation"></textarea>
    <input type="text" placeholder="image" class="image" />
    `,
    buttons: { ok: 'ok', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b==='ok') {
        dialog.showWait('ajout en cours...')
        api.newTeam({
          name: inputs.name.value,
          presentation: inputs.presentation.value,
          image: inputs.image.value
        }, showList)
      }
    }
  })
})

/**/
window.api = api;
window.charte = charte;
window.dialog = dialog;
window.team = team
/**/