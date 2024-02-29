import ol_ext_element from 'ol-ext/util/element';
import api from '../../api/api'
import charte from '../../charte/macarte'
import dialog from '../../dialog/dialog';

import '../../font/loadFonts'
import './index.css'

import ListCarte from '../../api/ListCarte'
import '../../api/ListCarte.responsive.css'

import dialogOpen from '../../dialog/openCarte'
import dialogSave from '../../dialog/saveCarte'
import shareCarte from '../../dialog/shareCarte';

charte.setApp('atlas', 'listCarte');

// Gestion login/logout
api.on(['login', 'logout', 'error', 'disconnect'], (e) => {
  console.log(e.type.toUpperCase() + (e.type==='login' ? ' > '+e.user.public_name : ''));
});
// Select mode
charte.getAppElement().querySelector('select').addEventListener('change', (e) => {
  list.setMode(e.target.value);
})

// HasCheck
charte.getAppElement().querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
  list.hasCheck(e.target.checked);
})
// Search field
charte.getAppElement().querySelector('input[type="search"]').addEventListener('change', (e) => {
  list.search(e.target.value);
})
// Mes cartes
const tmap = ['macarte', 'storymap', '']
let currentMap = {};
charte.getAppElement().querySelectorAll('button').forEach((b, i) => {
  switch (i) {
    case 3: {
      b.addEventListener('click', () => {
        dialogSave(currentMap, (v) => {
          console.log(v)
          currentMap = v;
        })
      })
      break;
    }
    default: {
      b.addEventListener('click', () => {
        dialogOpen({ 
          type: tmap[i],
          callback: console.log 
        })
      })
    }
  }
})

// Create list
const list = new ListCarte(api, { 
  // context: 'profile',
  // context: 'organization',
  context: 'atlas',
  selection: true,
  search: true,
  permalink: true,
  target: charte.getAppElement() 
});
// Handle click on the list
list.on('check', () => {
  console.log(list.getChecked().length + ' item(s) selected...');
});
list.on('select', (e) => {
  console.log(e);
});
list.on('dblclick', (e) => {
  console.log(e);
  shareCarte({ carte: e.item })
});
list.on('select:user', (e) => {
  console.log(e.user)
});
// list.on('draw:item', console.log);
list.on('change:page', (e) => {
  console.log(e)
});
list.on('error', (e) => {
  switch (e.status) {
    case 401: {
      list.showError('Vous devez être connecté...');
      charte.connect();
      break;
    }
    default: {
      break;
    }
  }
})
// Show list
list.showPage();
// Login/out
api.on('login', () => {
  list.showPage();
})

/**/
window.list = list;
window.api = api;
window.charte = charte;
window.dialog = dialog;
window.dialogOpen = dialogOpen
/**/