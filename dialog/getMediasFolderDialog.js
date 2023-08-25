import ol_ext_element from "ol-ext/util/element";
import dialog from "./dialog";

/** Create an input folder list
 * @param {Array<string>} folders
 * @param {Element} parent
 * @returns {Element} input element
 */
function inputFolderList (folders, parent) {
  folders = folders || [];
  const folderInput = ol_ext_element.create('INPUT', {
    type: 'text',
    placeholder: 'choisir une galerie',
    on: {
      'focusout': () => setTimeout(() => listFolder.style.display = 'none', 100)
    },
    parent: parent
  });
  ol_ext_element.addListener(
    folderInput,       
    ['click', 'keyup'],
    () => {
      const val = folderInput.value;
      listFolder.innerHTML = '';
      let count = 0;
      folders.forEach(f => {
        if (new RegExp(val.replace(/\*/,''), 'i').test(f)) {
          ol_ext_element.create('LI', { 
            html: f,
            on: {
              pointerdown: () => {
                folderInput.value = f;
              }
            },
            parent: listFolder 
          });
          count++
        }
      });
      if (count) listFolder.style.display = 'block';
      else listFolder.style.display = 'none';
    }
  );
  const listFolder = new ol_ext_element.create('UL', { 
    className: 'folder-list',
    parent: parent 
  });
  return folderInput;
}

/** Get media folder dialog
 * @param {Object} options
 *  @param {Array<string>} options.folders
 *  @param {string} options.prompt
 * @param {function} callback a function that get the uploaded media
 */
function getMediaFolderDialog (options, callback) {
  const dlog = ol_ext_element.create('DIV', {
    html: options.prompt
  });
  const folderInput = inputFolderList(options.folders, dlog);
  dialog.show({
    title: 'Choisir une galerie',
    className: 'mc-folder-media',
    content: dlog,
    buttons: { submit: 'ok', cancel: 'annuler' },
    onButton: (b) => {
      if (b==='submit') {
        dialog.close();
        return callback(folderInput.value);
      }
    }
  })
}

export { inputFolderList }
export default getMediaFolderDialog;
