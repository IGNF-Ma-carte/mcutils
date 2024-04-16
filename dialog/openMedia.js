import UserMedia from '../api/ListMedias'
import Dialog from 'ol-ext/control/Dialog'
import fakeMap from './fakeMap';
import waitDialog from './waitDialog';
import api from '../api/api';
import { connectDialog } from '../charte/macarte';
import { inputFolderList } from './getMediasFolderDialog'

import './openMedia.css'
import ol_ext_element from 'ol-ext/util/element';
import dialogMessage from './dialogMessage';

/* A ol-ext dialog to show information on the map */
const mediaDialog = new Dialog({ 
  className: 'md',
  closeOnSubmit: false,
  closeBox: true,
  target: document.body
});
mediaDialog.setMap(fakeMap);

// Current callback
let currentOptions = {};

// Media list to display in dialog
const list = new UserMedia(api, { thumb: false });
// Select > callback
list.on('select', (e) => {
  e.thumb = list.get('thumb');
  if (typeof(currentOptions.callback) === 'function') {
    currentOptions.callback(e);
  }
  mediaDialog.close();
});
list.on('error', (e) => {
  if (e.status===401) {
    mediaDialog.hide();
    dialogMessage.showAlert(
      'Vous devez être connecté pour effectuer cette opération...',
      { connect: 'se connecter', cancel: 'annuler' },
      (b) => {
        if (b==='connect') connectDialog(() => {
          openMedia(currentOptions)
        });
      }
    );
  } else {
    list.showError('Impossible de se connecter au serveur');
  }
})

/** Open media dialog
 * @param {Object} options
 *  @param {function} options.callback a function that get a file to open
 *  @param {string} [options.title='Choisir un média'] dialog title
 *  @param {boolean} [options.thumb=false] thumbnail default checkbox value
 *  @param {boolean} [options.add=true] ajouter un media
 */
function openMedia(options) {
  currentOptions = options || {};
  currentOptions.callback = (typeof(currentOptions.callback) === 'function' ? currentOptions.callback : ()=>{});
  list.setThumb(options.thumb)
  // Add button
  const buttons = (options.add ? { add: 'ajouter...', cancel: 'annuler' } : { cancel: 'annuler' });
  // Show media dialog
  mediaDialog.show({
    title: currentOptions.title || 'Choisir un média',
    className: 'mc-user-media',
    content: list.element,
    buttons: buttons,
    onButton: (b) => {
      if (b === 'add') addMediaDialog(currentOptions, list.get('folders'));
    }
  });
  list.updateFolders();
  list.search();
}

/** Dialog to upload a new media
 * @param {Object} 
 *  @param {function} options.callback a function that get the uploaded media
 *  @param {boolean} [options.getError=false] true to get the error if one
 *  @param {Array<string>} options.folders
 */
function addMediaDialog(options, folders) {
  _uploadMediaDialog(null, folders || options.folders, (file, folder, name) => {
    waitDialog.show({ content: 'Chargement du média...' });
    api.postMedia(file, folder, name, (r) => {
      // console.log(r)
      waitDialog.close();
      if (!options.getError && r.error) {
        let error = '';
        switch (r.status) {
          case 401: error = 'Vous devez être connecté !'; break;
          case 413: error = 'Fichier trop volumineux !'; break;
          default: break;
        }
        dialogMessage.showAlert('Impossible de charger le fichier...' + (error ? '<br/>' + error : ''));
      } else {
        options.callback({
          thumb: list.get('thumb'),
          item: r
        });
        list.updateFolders();
      }
    });
  });
}

/** Dialog to modify a media
 * @param {Object} 
 *  @param {function} options.callback a function that get the uploaded media
 *  @param {MCMedia} options.media true to get the error if one
 *  @param {string} [options.title] dialog title
 *  @param {boolean} [options.getError=false] true to get the error if one
 *  @param {Array<string>} options.folders a list of folders
 */
 function updateMediaDialog(options) {
  const media = options.media;
  _uploadMediaDialog(media, options.folders, (file, folder, name) => {
    waitDialog.show({ content: 'Chargement du média...' });
    function done(r) {
      // console.log(r)
      waitDialog.close();
      if (!options.getError && r && r.error) {
        let error = '';
        switch (r.status) {
          case 401: error = 'Vous devez être connecté !'; break;
          case 413: error = 'Fichier trop volumineux !'; break;
          default: break;
        }
        dialogMessage.showAlert('Impossible de charger le fichier...' + (error ? '<br/>' + error : ''));
      } else {
        media.name = name;
        media.folder = folder;
        if (r) {
          if (r.img) media.view_url = r.img;
          if (r.thumb) media.thumb_url = r.thumb;
        }
        options.callback({
          thumb: list.get('thumb'),
          item: media
        });
        list.updateFolders();
      }
    }
    // Update the file => done
    function updateFile(r) {
      if (r && r.error) done(r);
      (file) ? api.updateMediaFile(media.id, file, done) : done();
    }
    // Update folder => update file
    function updateFolder(r) {
      if (r && r.error) done(r);
      (folder !== media.folder) ? api.updateMediaFolder(media.id, folder, updateFile) : updateFile();
    }
    // Update name => update folder
    function updateName(r) {
      if (r && r.error) done(r);
      (name !== media.name) ? api.updateMediaName(media.id, name, updateFolder) : updateFolder();
    }
    // Update
    updateName();
  }, options.title || 'Modifier un média');
}

/** Dialog to upload a new media
 * @param {Object} 
 *  @param {function} options.callback a function that get the uploaded media
 *  @param {boolean} [getError=false] true to get the error if one
 * @param {Array<string>} folders
 */
function _uploadMediaDialog(media, folders, callback, title) {
  if (!api.isConnected()) {
    dialogMessage.showAlert('Vous devez être connecté pour ajouter un médià a votre mediathèque.')
    return;
  }
  const dlog = new ol_ext_element.create('DIV');
  const folderInput = inputFolderList(folders, dlog);
  if (media) {
    folderInput.value = media.folder;
  }
  
  const content = new ol_ext_element.create('DIV', { className: 'upload', parent: dlog });
  if (media) {
    ol_ext_element.create('IMG', { 
      className: 'oldImage',
      src: media.thumb_url + '?' + (new Date).getTime(), 
      parent: content
    });
  }
  const fileInput = ol_ext_element.create('INPUT', {
    type: 'file',
    accept: 'image/png, image/jpeg, image/gif, image/svg',
    parent: content
  });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      img.src = '';
      img.name = file.name;
      img.src = URL.createObjectURL(file)
    }
  }, false);
  ol_ext_element.create('LABEL', { 
    html: 'choisir un fichier<br/>ou coller une image (Ctrl+V)...<span>Impossible de charger cette image...</span>',
    parent: content 
  });
  const img = ol_ext_element.create('IMG', { parent: content });
  img.onload = () => {
    mediaDialog.element.classList.remove('error');
    mediaDialog.element.classList.add('img');
    inputName.value = img.name.replace(/\.(jpe?g|png|gif|svg)$/,'').replace(/_/g,' ');
  };
  img.onerror = () => {
    mediaDialog.element.classList.add('error');
    mediaDialog.element.classList.remove('img');
  };
  // Media name
  const inputName = ol_ext_element.create('INPUT', {
    placeholder: 'Nom du média',
    type: 'text',
    value: media ? media.name : '',
    parent: dlog
  })

  // Show dialog
  mediaDialog.show({
    title: currentOptions.title || title || 'Importer une image',
    className: 'mc-upload-media' + (media ? ' mc-update' : ''),
    content: dlog,
    buttons: { ok: media ? 'modifier' : 'charger', cancel: 'annuler' },
    onButton: (b) => {
      const file = fileInput.files[0];
      if (b === 'ok' && (media || file)) {
        callback(file, folderInput.value, inputName.value);
      }
    }
  });

  // Paste clipboard image
  function paste(e) {
    const files = e.clipboardData.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      fileInput.files = files;
      img.src = URL.createObjectURL(files[0]);
      fileInput.focus();
      e.preventDefault();
      e.stopPropagation();
    }
  }
  window.addEventListener('paste', paste);
  mediaDialog.on('hide', () => {
    window.removeEventListener('paste', paste);
  });
}

export { addMediaDialog }
export { updateMediaDialog }

export default openMedia
