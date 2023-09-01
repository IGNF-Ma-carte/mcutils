import Toggle from 'ol-ext/control/Toggle'
import Button from 'ol-ext/control/Button'
import ControlBar from 'ol-ext/control/Bar'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import ol_Overlay_Tooltip from 'ol-ext/overlay/Tooltip';
import EditBar from 'ol-ext/control/EditBar'
import GeoJSON from 'ol/format/GeoJSON'

import measureStyleFn from '../style/measureStyleFn';
import VectorStyle from '../layer/VectorStyle';
import { Draw, Select } from 'ol/interaction';
import Transform from 'ol-ext/interaction/Transform';

import './toolbar.css'
import FileSaver from 'file-saver';
import dialog from '../dialog/dialog';
import dialogImportFile from '../dialog/dialogImportFile'
import ol_ext_element from 'ol-ext/util/element';
import notification from '../dialog/notification';

/* Add control subbar and disable others on activate */
function newControlBar(tbar, carte, options) {
  options.className = 'centered';
  const ctrl = new Toggle(options);
  // Activate first control
  ctrl.on('change:active', (e) => {
    const b = e.active;
    // Activate one at a time
    if (b) {
      tbar.getControls().forEach(c => { 
        if (c!==ctrl && c.setActive) c.setActive(false) 
      })
    }
    // handle subbar
    ctrl.getSubBar().set('toggleOne', b)
    ctrl.getSubBar().getControls().forEach((c, i) => {
      if (c.setActive) c.setActive(b && i===0);
    });
    // Reset default selection
    carte.getSelect().setActive(!b);
    carte.getSelect().getFeatures().clear();
  })
  tbar.addControl(ctrl);
  // Init controls
  ctrl.setActive(true);
  ctrl.setActive(false);
  return ctrl;
}

/** Add measure tools to the carte
 * @param {Carte} carte
 * @private
 */
function addMeasureTools(carte) {
  const tbar = carte.getControl('toolbar')
  const measureLayer = new VectorLayer({
    source: new VectorSource,
    style: measureStyleFn
  })
  measureLayer.setMap(carte.getMap());
  const tips = new ol_Overlay_Tooltip({
    popupClass: 'tooltips black measure'
  });
  carte.getMap().addOverlay(tips);
  const draw = {};
  ['LineString', 'Polygon'].forEach(d => {
    draw[d] = new Draw({
      type: d,
      source: measureLayer.getSource()
    })
    // Set feature on drawstart
    draw[d].on('drawstart', (e) => tips.setFeature(e));
    // Remove feature on finish
    draw[d].on(['change:active','drawend'], (e) => {
      tips.removeFeature(e);
      tips.hide();
      if (e.feature) e.feature.set('measure', tips.element.innerText);
    });
  })
  // Measure tools
  newControlBar(tbar, carte, {
    title: 'outils de mesure',
    html: '<i class="fi-mesure"></i>',
    bar: new ControlBar({
      controls: [
        new Toggle({
          title: 'distance',
          html: '<i class="fg-measure-line"></i>',
          autoActivate: true,
          interaction: draw.LineString
        }),
        new Toggle({
          title: 'surface',
          html: '<i class="fg-measure-area"></i>',
          interaction: draw.Polygon
        }),
        new Button({
          title: 'effacer les mesures',
          html: '<i class="fi-delete"></i>',
          handleClick: () => measureLayer.getSource().clear()
        })
      ]
    })
  });
}

/** Add measure tools to the carte
 * @param {Carte} carte
 * @param {Array<string>} [tools] list of interactions to add 
 * @param {Layer} [layer] layer to draw in, if none create a ghost one
 * @return {Toggle}
 * @private
 */
function addDrawTools(carte, tools, layer) {
  const tbar = carte.getControl('toolbar')

  // Drawing layer
  let drawLayer = layer || new VectorStyle({ source: new VectorSource() });
  if (!layer) {
    drawLayer.layerVector_.setMap(carte.getMap());
    drawLayer.setIgnStyle({
      pointGlyph: 'ign-form-point',
      pointForm: 'marker',
      symbolColor: '#fff',
      pointColor: '#00f'
    })
  }

  // Transform tool
  const transform = new Transform({
    filter: f => {
      return f.getLayer && f.getLayer() === drawLayer
    }
  })
  transform.set('title', 'Modifier un objet')
  // Handle point rotation using the transform interaction
  let startangle = 0;
  transform.on (['rotatestart','translatestart','scalestart'], function(e){
    startangle = e.feature.getIgnStyle('pointRotation') || 0;
  });
  transform.on('rotating', function (e){
    e.feature.setIgnStyle('pointRotation', (startangle - e.angle * 180/Math.PI) % 360);
    e.feature.changed()
  });

  // Select tool
  const select = new Select({
    layers: [drawLayer.layerVector_]
  })
  select.set('title', 'Sélection');

  // Interactions to add
  const interactions = {
    Select: select, 
    Delete: false, 
    Info: false, 
    DrawPoint: 'Dessiner un point', 
    DrawLine: 'Dessiner une ligne', 
    DrawPolygon: 'Dessiner une surface', 
    DrawHole: false,
    DrawRegular: 'Dessiner un polygone',
    Transform: transform,
    Split: false,
    Offset: false
  }
  // User tools
  if (tools) {
    Object.keys(interactions).forEach(itool => {
      if (tools.indexOf(itool) < 0) {
        interactions[itool] = false
      }
    })
  }

  // Add tool bar
  const ctrl = newControlBar(tbar, carte, {
    title: 'outils de croquis',
    html: '<i class="fi-pencil"></i>',
    bar: new EditBar({
      interactions: interactions,
      source: drawLayer.getSource()
    })
  })
  ctrl.set('layer', drawLayer)

  // Delete button
  if (!tools || tools.indexOf('Delete') >= 0) {
    ctrl.getSubBar().addControl(new Button({
      title: 'Supprimer',
      html: '<i class="fi-delete"></i>',
      handleClick: () => {
        // Feature to delete
        const features = select.getFeatures().getArray().slice();
        select.getFeatures().clear();
        const nb = features.length;
        if (nb) {
          // Delete
          features.forEach(f => drawLayer.getSource().removeFeature(f))
          // Notification + undo 
          const d = ol_ext_element.create('DIV', { 
            text: nb + ' objet(s) supprimé(s) - '.replace(/\(s\)/g, nb>1 ? 's' : '') 
          })
          ol_ext_element.create('A', {
            text: 'annuler',
            click: () => {
              features.forEach(f => drawLayer.getSource().addFeature(f))
              notification.hide();
            },
            parent: d
          })
          notification.show(d)
        } else {
          notification.show('Sélectionnez les objets à supprimer...')
        }
      }
    }))
  }
  
  // Download button
  if (!tools || tools.indexOf('Export') >= 0) {
    ctrl.getSubBar().addControl(new Button({
      title: 'Charger le croquis...',
      html: '<i class="fi-download"></i>',
      handleClick: () => {
        const features = drawLayer.getSource().getFeatures();
        if (features.length) {
          const data = (new GeoJSON()).writeFeatures(features, {
            featureProjection: carte.getMap().getView().getProjection(),
            rightHanded: true
          })
          const blob = new Blob([data], {type: "text/plain;charset=utf-8"});
          FileSaver.saveAs(blob, 'carte.geojson');
        }
      }
    }))
  }

  // Upload button
  if (!tools || tools.indexOf('Import') >= 0) {
    ctrl.getSubBar().addControl(new Button({
      title: 'Importer un croquis...',
      html: '<i class="fa fa-upload"></i>',
      handleClick: () => {
        dialogImportFile(e => {
          if (e.features.length) {
            drawLayer.getSource().addFeatures(e.features);
            notification.cancel(
              e.features.length + ' objects chargés',
              () => {
                carte.getMap().getView().fit(drawLayer.getSource().getExtent());
                if (carte.getMap().getView().getZoom() > 16) {
                  carte.getMap().getView().setZoom(16)
                } else {
                  carte.getMap().getView().setZoom(carte.getMap().getView().getZoom() - 0.2)
                }
              }, '<i class="fi-fullscreen-alt"></i> center sur les données')
          } else {
            notification.show('Impossible de charger le fichier...')
          }
        }, {
          extractStyles: true
        })
      }
    }))
  }

  // Return control bar
  return ctrl;
}

/** Add measure tools to the carte
 * @param {Carte} carte
 * @private
 */
function addOptionTools(carte) {
  const tbar = carte.getControl('toolbar')

  tbar.addControl(new Button({
    html: '<i class="fi-configuration"></i>',
    title: 'Options d\'affichage',
    handleClick: () => {
      dialog.show({
        title: 'Options d\'affichage',
        className: 'optionTools',
        content: '<ul></ul>',
        buttons: ['ok']
      })
      const content = dialog.getContentElement();
      const ct = { 
        zoom: 'bouton de zoom', 
        mousePosition: 'coordonnées', 
        scaleLine: 'échelle',
        printDlg: 'impression', 
        layerSwitcher: 'gestionnaire de calques', 
        locate: 'géolocalisation'
      }
      Object.keys(ct).forEach(c => {
        ol_ext_element.createCheck({
          after: ct[c],
          checked: carte.hasControl(c),
          on: {
            change: (e) => {
              carte.showControl(c, e.target.checked);
            }
          },
          parent: content
        })
      })
    }
  }))
}

/** Add measure tools to the carte
 * @param {Carte} carte
 * @private
 */
function addOptionImport(carte) {
  const tbar = carte.getControl('toolbar')

  tbar.addControl(new Button({
    html: '<i class="fi-share"></i>',
    title: 'Covisualiser...',
    handleClick: () => {
      dialogImportFile(e => {
        if (e.features.length) {
          const layer = new VectorLayer({ 
            title: e.name,
            source: new VectorSource()
          })
          layer.getSource().addFeatures(e.features);
          carte.getMap().addLayer(layer);
          notification.cancel(
            e.features.length + ' objects chargés',
            () => {
              carte.getMap().getView().fit(layer.getSource().getExtent());
              if (carte.getMap().getView().getZoom() > 16) {
                carte.getMap().getView().setZoom(16)
              } else {
                carte.getMap().getView().setZoom(carte.getMap().getView().getZoom() - 0.2)
              }
            }, '<i class="fi-fullscreen-alt"></i> center sur les données')
        } else {
          notification.show('Impossible de charger le fichier...')
        }
      }, {
        extractStyles: true
      })
    }
  }))
}

export { addMeasureTools, addDrawTools, addOptionTools, addOptionImport }