import { style2IgnStyle } from '../style/ignStyleFn'
import ol_ext_element from 'ol-ext/util/element'
import ol_format_Guesser from '../format/Guesser'
import dialog from './dialog';

import './dialogImportFile.css'
import notification from './notification';

/** Load file and try to get feature or returns the result
 * @memberof import
 * @param {File} file file to import
 * @param {function} onload a function taht take the retuned values
 * @param {Object} options
 *  @param {boolean} options.useStyle extract style 
 *  @param {boolean} options.useLayer if want to use the layer 
 *  @param {boolean} options.ignStyle transform style to ignStyle
 *  @param {boolean} options.silent silent mode
 *  @param {ol/ProjectionLike} options.projection data projection
 */
function loadFile(file, onload, options) {
  if (!file) return false;
  options = options || {};

  var reader = new FileReader();
  if (!options.silent) dialog.showWait('Chargement en cours...')

  // Handling other file types
  let name = file.name;
  // Extract file name
  name = name.substr(0,name.lastIndexOf('.')) || file.name;
  const result = {
    features: false,
    name: name,
    fileName: file.name,
    style: options.useStyle,
    layer: options.useLayer,
    replace: options.replace
  }

  // Read
  reader.onload = function () {
    dialog.hide();
    // Import '*.carte'
    if (/\.carte$/.test(file.name)) {
      result.carte = JSON.parse(reader.result);
    } else {
      // Try to read features with every different format
      const format = new ol_format_Guesser();
      const features = format.readFeatures(reader.result, {
        featureProjection: options.projection || 'EPSG:3857',
        extractStyles: options.useStyle
      })

      // Check features
      if (features.length) {
        // Convert feature style?
        if (options.ignStyle) {
          if (options.useStyle) {
            features.forEach(f => style2IgnStyle(f));
          } 
          features.forEach(f => f.setStyle(false));
        }

        // Handle geometry errors
        const validFeatures = getValidFeatures(features);
        const error = features.length - validFeatures.length;
        if (!options.silent) {
          if (error) {
            dialog.showAlert(error + ' objet(s) non chargés...')
          }
          notification.show(validFeatures.length + ' objets importés...')
        }

        // Features loaded
        result.features = validFeatures;
        result.error = error;
      } else {
        result.data = reader.result;
      }
    }
    onload(result);
  }

  // Error handler : corrupted file content, etc ... : do not add it to the map
  reader.addEventListener('error', () => {
    // console.error(`Error occurred reading file: ${file.name}`);
    dialog.hide();
    onload(result);
  });

  reader.readAsText(file);
}

/** A ol-ext dialog to import a file
 * @memberof dialog
 * @instance
 * @param {function} onImport a function that takes the imported features or a carte and the name of the file
 * @param {Object} options
 *  @param {string} [options.title] dialog title
 *  @param {string} [options.className] 
 *  @param {string} [options.format] format info
 *  @param {string} [options.accept] accepted formats
 *  @param {boolean} [options.readCarte=false] can read carte
 *  @param {boolean} [options.ignStyle=true] read features with ignStyle
 *  @param {boolean} [options.useLayer=false] checkbox to use layer
 *  @param {Projection} [options.projection=EPSG:3857] result projection
 */
function dialogImportFile(onImport, options) {
  options = options || {};

  // Ask for file
  dialog.show({
    title: options.title || 'Importer des données',
    className: ('importFile ' + (options.className || '')).trim(),
    content: '<div class="loader"><span>' +
      (options.format || 'Charger un fichier (kml, GeoJSON, gpx'+(options.readCarte ? ', carte)' : ')')) +
      '</span></div>',
    buttons: {cancel: 'annuler'},
  })
  const content = dialog.getContentElement();

  // Loader
  function load(file) {
    if (!file) return;
    dialog.showWait('Chargement...');
    loadFile(file, onImport, {
      useStyle: extract.checked,
      useLayer: useLayer.checked, 
      ignStyle: options.ignStyle !== false, 
      projection: options.projection,
      replace: replace.checked
    })
  }
  // Input file
  const iFile = ol_ext_element.create('INPUT', {
    type: 'file',
    accept: options.accept || '.kml,.geojson,.gpx,.json' + (options.readCarte ? ',.carte' : ''),
    parent: content,
    change: () => {
      //content.querySelector('.loader span').innerText = 'Charger ' + iFile.files[0].name;
      load(iFile.files[0]);
    }
  })
  iFile.addEventListener('dragover', () => content.dataset.drop = '');
  iFile.addEventListener('dragleave', () => delete content.dataset.drop);
  iFile.addEventListener('drop', () =>  {
    delete content.dataset.drop;
  });

  // Extract Style?
  const extract = ol_ext_element.createCheck({
    after: 'extraire les styles (si possible)',
    parent: content
  })

  // Input current layer
  const useLayer = ol_ext_element.createCheck({
    after: 'ajouter au calque courant',
    parent: content
  })
  // Force use current layer
  if (!options.useLayer) useLayer.parentNode.style.display = 'none';

  // Remove current
  const replace = ol_ext_element.createCheck({
    after: 'remplacer le contenu existant',
    parent: content
  })
  // Force use current layer
  if (!options.replace) replace.parentNode.style.display = 'none';
}

/** Test geometry and returns the valid features
 * @memberof import
 * @param {Array<Feature>} features
 * @returns {Array<Feature>} 
 */
function getValidFeatures(features) {
  const validFeatures = [];
  features.forEach(f => {
    // Detect feature with wrong geometries
    if (f.getGeometry()) {
      // Split geometry collection
      if (f.getGeometry().getType() === 'GeometryCollection') {
        f.getGeometry().getGeometries().forEach(g => {
          const fc = f.clone();
          fc.setGeometry(g);
          validFeatures.push(fc)
        })
      } else {
        validFeatures.push(f);
      }
    }
  });
  return validFeatures
}

/* DEBUG */
window.dialogImportFile = dialogImportFile
/* */

export { getValidFeatures, loadFile }
export default dialogImportFile
