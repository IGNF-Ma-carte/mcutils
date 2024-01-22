import ol_ext_element from 'ol-ext/util/element';
import api from '../../api/api'
import charte from '../../charte/macarte'
import dialog from '../../dialog/dialog';
import md2html from '../../md/md2html';
import UserInput from '../../api/UserInput'

import './organisation.scss'

charte.setApp('api', 'Organizations');

// Organization list
const list = ol_ext_element.create('UL', {
  parent: charte.getAppElement().querySelector('.organizations')
})


function addUser(orga) {
  dialog.show({
    title: 'Ajouter un membre',
    content: '<input type="text" class="userId" />',
    buttons: { ok: 'ok', cancel: 'annuler'},
    onButton: (b, inputs) => {
      if (b==='ok') {
        dialog.showWait('ajout...')
        api.addOrganizationMember(orga.organization_id, inputs.userId.value, 'member', () => {
          showOrga(orga);
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
  dialog.showWait('Chargement...');
  api.getOrganizations(orga => {
    orga.forEach(o => {
      ol_ext_element.create('LI', {
        text: o.organization_name + ' (' + o.user_role + ')',
        click: () => {
          dialog.showWait('Organisation ' + o.organization_name + '...')
          showOrga(o);
        },
        parent: list
      })
    });
    dialog.hide();
  })
}

function showOrga(o)  {
  api.getOrganization(o.organization_id, orga => {
    dialog.show({
      title: orga.name,
      content: md2html(orga.presentation),
      buttons: { delete: 'Supprimer', addUser: 'Ajouter un membre', cancel: 'annuler' },
      onButton: b => {
        if (b === 'delete') {
          dialog.showWait('Suppression');
          api.deleteOrganization(o.organization_id, () => {
            dialog.hide();
            showList();
          })
        }
        if (b === 'addUser') {
          addUser(o)
        }
      }
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
          api.setOrganizationMember(orga.public_id, user.public_id, sel.value, () => showOrga(o))
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
          api.removeOrganizationMember(orga.public_id, user.public_id, () => showOrga(o))
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
        api.newOrganization({
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
/**/