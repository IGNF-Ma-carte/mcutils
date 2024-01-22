import ol_ext_element from 'ol-ext/util/element';
import api from '../../api/api'
import charte from '../../charte/macarte'
import dialog from '../../dialog/dialog';
import md2html from '../../md/md2html';

import '../../font/loadFonts'
import 'font-gis/css/font-gis.css'

import dialogSave from '../../dialog/saveCarte'
import emptyCarte from './emptyCarte'

import '../../api/ListCarte.responsive.css'
import notification from '../../dialog/notification';
import {getMediaURL} from '../../api/serviceURL';

import './api.scss'

function log(what) {
  if (what instanceof Element) {
    charte.getAppElement().appendChild(what);
  } else {
    ol_ext_element.create('DIV', {
      html: what,
      parent: charte.getAppElement()
    })
  }
}

charte.setApp('api', 'api');

document.body.appendChild(charte.getToolbarElement())

// Save button
ol_ext_element.create('BUTTON', {
  html: 'Save carte',
  className: 'button button-colored',
  click: () => {
    dialogSave({ title: 'test', theme: 'Agriculture', type: 'macarte', premium: 'default', bbox: [0,0,0,0] }, (carte) => {
      dialog.showWait('Enregistrement en cours...')
      api.postMap(carte, emptyCarte, (r) => {
        if (r.error) {
          dialog.showAlert(r.statusText + '<br/>' + r.xhttp.response)
        } else {
          dialog.hide();
          notification.show('Carte enregistrée')
        }
      })
    })
  },
  parent: charte.getAppElement()
})

// Show user info
function showUser(name) {
  api.getUser(name, (user) => {
    if (!user.error) {
      log(user.public_name + (user.presentation ? '<br/>' + md2html(user.presentation) : ''))
    }
  })
}

// Load maps
function loadMaps(what) {
  const value = searchInput.value;
  dialog.showWait('Chargement en cours...');
  api.getMaps({ 
      context: what,
      query: value
    }, (e) => {
      if (e.error) {
        if (e.status===401) {
          dialog.showAlert(
            'Vous devez être connecté pour accéder aux cartes...',
            { ok: 'ok', 'connect': 'connexion' },
            (b) => {
              if (b==='connect') {
                setTimeout(() => charte.connect(), 200);
              }
            })
        } else {
          dialog.showAlert('Impossible d\'accéder aux cartes...')
        }
        log(e.status + ' : ' + e.statusText);
      } else {
        log('Cartes ' + (what || api.getMe().public_name) + ' : ' + e.maps.length + ' / ' + e.count.toLocaleString() + ' carte(s)');
        if (value && e.maps.length) {
          console.log(e.maps[0])
          log('<hr />')
          if (e.maps[0].img_url) {
            ol_ext_element.create('IMG', {
              src: getMediaURL(e.maps[0].img_url),
              parent: charte.getAppElement()
            })
          }
          const m = ol_ext_element.create('DIV', {
            html: e.maps[0].title + ' (' + e.maps[0].type + ') par '
          })
          const user = e.maps[0].user;
          ol_ext_element.create('A', {
            html: user,
            target: '_new',
            href: '#',
            click: (e) =>  {
              e.preventDefault();
              showUser(user)
            },
            parent: m
          })
          log(m);
          log('<hr />')
        }
      }
      dialog.hide();
    }
  );
}

// Load amdin maps
charte.addTool('maps', 'fg-map-lock', 'Admin', () => {
  loadMaps('admin');
})

// Load public maps
charte.addTool('maps', 'fg-map-share', 'Atlas', () => {
  loadMaps('atlas');
});

// Load user maps
charte.addTool('maps', 'fg-map-user', 'Mes cartes', () => {
  loadMaps();
});

// Search input
const searchInput = ol_ext_element.create('INPUT', {
  type: 'search',
  placeHolder: 'Rechercher dans l\'Atlas',
  parent: ol_ext_element.create('DIV', {
    className: 'search',
    parent: charte.getToolbarElement()
  })
})

// Gestion login/logout
api.on(['login', 'logout', 'error', 'disconnect'], (e) => {
  log(e.type.toUpperCase() + (e.type==='login' ? ' > '+e.user.public_name : ''));
});

/**/
window.api = api;
window.charte = charte;
window.dialog = dialog;
/**/