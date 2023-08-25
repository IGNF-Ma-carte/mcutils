import UserCarte from '../api/ListUserCarte'
import dialog from './dialog';
import api from '../api/api';
import ol_ext_element from 'ol-ext/util/element';
import { connectDialog } from '../charte/macarte';

import './openCarte.css'
import { getMediaURL } from '../api/serviceURL';

let currentOptions = {};

const list = new UserCarte(api, {
  mini: 1,
  selection: true
});

window.usercarte = list

// Show info
const divInfo = ol_ext_element.create('DIV', {
  className: 'mc-list-info',
  parent: list.element
})

// Search input
const search = ol_ext_element.create('INPUT', {
  type: 'search',
  placeHolder: 'rechercher...',
  parent: list.element
});
ol_ext_element.addListener(search, ['keyup', 'search'], () => {
  const rex = new RegExp(search.value, 'i');
  let found = false;
  list.element.querySelectorAll('li').forEach(li => {
    if (rex.test(li.innerText)) {
      found = true;
      li.style.display = 'block';
    } else {
      li.style.display = 'none';
    }
  });
  if (!found) list.showError('Aucune carte...', false);
  else list.showError();
  list.clearSelection();
})


// Select an item > show info
list.on('select', (e) => {
  divInfo.innerHTML = '';
  if (!e.item) return;
  ol_ext_element.create('h4', {
    html: e.item.title,
    parent: divInfo
  })
  ol_ext_element.create('IMG', {
    src: getMediaURL(e.item.img_url) || '',
    parent: divInfo
  })
  ol_ext_element.create('p', {
    html: e.item.description,
    parent: divInfo
  })
  ol_ext_element.create('div', {
    className: 'mc-theme',
    html: e.item.theme,
    parent: divInfo
  })
  ol_ext_element.create('div', {
    className: 'mc-date',
    html: e.item.updated_at,
    parent: divInfo
  })
  ol_ext_element.create('div', {
    className: 'mc-view',
    html: e.item.nb_view,
    parent: divInfo
  })
});
// Select on dblclick
list.on('dblclick', (e) => {
  dialog.hide();
  callback(e.item);
})
// Handle error
list.on('error', (e) => {
  if (e.status === 401) {
    dialog.showAlert(
      'Vous devez être connecté pour effectuer cette opération...',
      { connect: 'se connecter', cancel: 'annuler' },
      (b) => {
        if (b==='connect') connectDialog(() => {
          openCarte(currentOptions);
        });
      }
    );
  } else {
    list.showError('Impossible de charger les cartes.');
  }
})
list.on('draw:list', (e) => {
  search.style.display = (e.list.length < 20) ? 'none' : '';
})
list.on('search', () => list.clear() );

// Callback function
let callback = function() {};

/** Open dialog
 * @param {Object} options
 *  @param {function} options.callback a function that get a carte to open
 *  @param {string} [options.title='Charger une carte'] dialog title
 *  @param {string} [options.filter] carte type 'macarte' or 'storymap', default all
 *  @param {string} [options.type] carte type 'macarte' or 'storymap', default all
 */
function openCarte(options) {
  options = options || {};
  callback = (typeof(options.callback) === 'function' ? options.callback : ()=>{});
  currentOptions = options;
  search.value = '';
  list.set('filter', options.filter);
  list.set('type', options.type);
  dialog.show({
    title: options.title || 'Charger une carte',
    className: 'mc-user-map',
    content: list.element,
    buttons: { submit: 'charger', cancel: 'annuler' },
    onButton: (b) => {
      if (b === 'submit' && list.getSelection()) {
        callback(list.getSelection());
        dialog.close();
      }
    }
  });
  divInfo.innerHTML = '';
  list.search();
}

export default openCarte
