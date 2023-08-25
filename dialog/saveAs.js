import FileSaver from "file-saver";
import dialog from "./dialog";

/* File type list */
const fileTypes = {
  'carte': {
    description: 'Macarte document',
    accept: { 'application/json': ['.carte'] },
  },
  'geojson': {
    description: 'GIS file format',
    accept: { 'application/geo+json': ['.geojson'] },
  },
  'json': {
    description: 'JSON format',
    accept: { 'application/json': ['.json'] },
  },
  'docx': {
    description: 'Microsoft Word (OpenXML)',
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
  },
  'jpg': {
    description: 'image JPEG',
    accept: { 'image/jpeg': ['.jpg'] },
  },
  'png': {
    description: 'fichier Portable Network Graphics',
    accept: { 'image/png': ['.png'] },
  },
  'pdf': {
    description: 'Adobe Portable Document Format (PDF)',
    accept: { 'application/pdf': ['.pdf'] },
  }
}

/** Save as dialog (with file system picker or fallback)
 * @memberof mcutils.dialog
 * @constructor
 */
function saveAs(blob, options) {
  options = options || {}
  const types = []
  options.types.forEach(t => {
    if (fileTypes[t]) { 
      types.push(fileTypes[t]);
    } else {
      types.push({
        description: '',
        accept: { 'text/plain': ['.'+t] },
      })
    }
  })
  // Try to save with a dialog picker
  try {
    window.showSaveFilePicker({
      suggestedName: options.fileName,
      types: types,
    }).then(saveFile =>  {
      saveFile.createWritable().then((stream) => {
        stream.write(blob).then(() => {
          stream.close();
        });
      });
    }).catch(() => { 
      /* ok */
    })
  } catch(e) {
    console.warn(e)
    // Default save
    dialog.show({
      title: options.title,
      content: 'Nom du fichier :<br/><input class="name" type="text" />',
      buttons: { submit: 'enregistrer', cancel: 'annuler' },
      onButton: (b, inputs) => {
        if (b === 'submit') {
          FileSaver.saveAs(blob, inputs.name.value + '.' + options.types[0] || 'txt');
          dialog.close()
        }
      }
    })
    dialog.getContentElement().querySelector('input.name').value = options.fileName
  }
}

export default saveAs