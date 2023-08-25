import api from '../../api/api'
import charte from '../../charte/macarte'

import '../../font/loadFonts'

import openMedia, { addMediaDialog, updateMediaDialog } from '../../dialog/openMedia'
import ListMedias from '../../api/ListMedias';
import InputMedia from '../../control/InputMedia'
import ol_ext_element from 'ol-ext/util/element';
import dialog from '../../dialog/dialog';

import './index.css'
import dialogMessage from '../../dialog/dialogMessage';

/* Openmedia dialog */
document.querySelector('button').addEventListener('click', () => {
  openMedia({ 
    thumb: false,
    add: true,
    callback: console.log
  });
})

charte.setApp('media', 'Médias');

/* Input media to select a media */
const imedia = new InputMedia({ 
  thumb: false,
  add: true,
  fullpath: true,
  input: document.querySelector('input')
});

/* Create list media */
const list = new ListMedias(api, { 
  // Enable selection
  selection: true,
  // Search input
  search: true,
  // Add check box
  check: true,
  // Limit select input
  limit: true,
  target: charte.getAppElement() 
});

// List header element
const listHeader = list.getHeaderElement();

// Disable button when no check
list.on(['check', 'draw:list'], () => {
  const btn = listHeader.querySelectorAll('button.select')
  if (list.getChecked().length) {
    btn.forEach(b => b.classList.remove('button-disabled'))
  } else {
    btn.forEach(b => b.classList.add('button-disabled'))
  }
});

// Add button
ol_ext_element.create('BUTTON', {
  className: 'button button-ghost',
  html: '<i class="fa fa-plus-circle fa-fw"></i> Ajouter un média...',
  click: () => {
    addMediaDialog({
      callback: (e) => {
        if (!e.error) {
          list.updateFolders();
          list.setFolder(e.item.folder);
        }
      }
    }, list.get('folders'))
  },
  parent: listHeader
});

// Add button
ol_ext_element.create('BUTTON', {
  className: 'button button-ghost select',
  html: '<i class="fi-galerie-image fa-fw"></i> Modifier un média...',
  click: () => {
    updateMediaDialog({
      media: list.getChecked()[0],
      folders: list.get('folders'),
      callback: (e) => {
        if (!e.error) {
          list.updateFolders();
          list.setFolder(e.item.folder);
        }
      }
    })
  },
  parent: listHeader
});

// Add update folder button
ol_ext_element.create('BUTTON', {
  className: 'button button-ghost select',
  html: '<i class="fa fa-folder fa-fw"></i> Changer de dossier...',
  click: () => {
    const sel = list.getChecked();
    if (!sel || !sel.length) {
      dialogMessage.showMessage('Sélectionnez des images à changer de dossier...')
      return;
    }
    list.getFolderDialog({
      prompt: 'Nom du dossier où déplacer les images :'
    }, (folder) => {
      // Update media recursively
      const updateMedia = (e) => {
        if (e && e.error) {
          dialogMessage.showAlert('Une erreur est survenue !<br/>Impossible de changer de dossier...')
          list.updateFolders();
          list.showPage();
          return;
        }
        // Next selection
        const s = sel.pop()
        if (s) {
          if (s.folder !== folder) api.updateMediaFolder(s.id, folder, updateMedia);
          else updateMedia();
        } else {
          list.updateFolders();
          list.showPage();
        }
      }
      updateMedia();
    });
  },
  parent: listHeader
})

// Delete media button
ol_ext_element.create('BUTTON', {
  className: 'button button-accent select',
  html: '<i class="fa fa-trash fa-fw"></i> Supprimer...',
  click: () => {
    const sel = list.getChecked();
    if (!sel || !sel.length) {
      dialogMessage.showMessage('Sélectionnez des images à supprimer...')
      return;
    }
    // Delete media recursively
    const deleteMedia = (e) => {
      if (e && e.error) {
        dialogMessage.showAlert('Une erreur est survenue !<br/>Impossible de supprimer une image...')
        list.showPage(list.get('currentPage'));
        return;
      }
      // Next selection
      const s = sel.pop()
      if (s) {
        api.deleteMedia(s.id, deleteMedia);
      } else {
        list.updateFolders((folders) => {
          if (folders.indexOf(list.get('folder')) < 0) {
            list.setFolder();
          } else {
            list.showPage(list.get('currentPage'));
          }
        });
      }
    }
    // Ask for delete
    dialogMessage.showAlert(
      'Êtes-vous sûr de vouloir supprimer <b>' + sel.length + '</b> image' + (sel.length > 1 ? 's ?':' ?')
      + '<br/>Une fois supprimées, les images ne s\'afficheront plus sur les cartes.'
      + '<br/><b class="accent">Cette action est irréversible.</b>',
      { ok: 'supprimer', cancel: 'annuler'},
      (b) => {
        if (b==='ok') {
          deleteMedia();
        }
        dialogMessage.close();
      } 
    )
    // Color button
    dialogMessage.element.querySelector('.ol-buttons input').className = 'button button-accent';
  },
  parent: listHeader
});

// Show list
list.showPage();

// Show lisqt on login
api.on(['login', 'logout'], () => {
  const btn = document.querySelectorAll('button');
  if (api.isConnected()) {
    btn.forEach(b => b.classList.remove('button-disabled'))
  } else {
    btn.forEach(b => b.classList.add('button-disabled'))
  }
  list.updateFolders();
  list.search();
});

console.log(api.getMe())
api.on('me', console.log)
charte.on('user', console.log)
api.on('login', console.log)

/**/
window.list = list;
window.input = imedia
window.charte = charte
window.api = api
/**/
