import LayerSwitcher from 'ol-ext/control/LayerShop'
import ol_ext_element from 'ol-ext/util/element';
import md2html from '../md/md2html'
import dialog from '../dialog/dialog'
import ol_ext_input_Checkbox from 'ol-ext/util/input/Checkbox';
import removeDiacritics from "../config/removeDiacritics";
import GeoJSON from "ol/format/GeoJSON"
import FileSaver from 'file-saver'
import notification from '../dialog/notification'

import './layerSwitcher.css'
import { getMediaURL } from '../api/serviceURL'

function showInfo(layer, map) {
  const content = ol_ext_element.create('DIV', { className: 'md' });
  // Description
  ol_ext_element.create('DIV', {
    html: md2html(layer.get('desc') || layer.get('description'), layer.getProperties()),
    parent: content
  })
  // Copyright
  if (layer.getSource().getAttributions()) {
    ol_ext_element.create('DIV', {
      className: 'copy',
      html: layer.getSource().getAttributions()({ extent: [-Infinity,-Infinity,Infinity,Infinity] }).join(' - '),
      parent: content
    })
  }
  // Show
  dialog.show({
    className: 'layer-info' + (layer.get('exportable') ? ' exportable' : ''),
    title: layer.get('title'),
    content: content,
    buttons: { pk: 'ok' }
  })

  // Render content
  md2html.renderWidget(content);

  // Export layer
  if (layer.get('exportable') && layer.getSource().getFeatures().length) {
    ol_ext_element.create('BUTTON', {
      html: '<i class="fi-download"></i> télécharger',
      className: 'button, button-ghost',
      click: () => {
        // Features to save
        const features = layer.getSource().getFeatures();
        if (!features.length) {
          dialog.showAlert('Aucune données à enregistrer<br/>dans ce calque...')
          return;
        }
        const format = new GeoJSON;
        const data = format.writeFeatures(features, {
          featureProjection: map.getView().getProjection(),
          rightHanded: true
        })
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, layer.get('title') + '.geojson');
        dialog.close();
        notification.show(features.length + ' objets enregistrés...')
      },
      parent: dialog.element.querySelector('.ol-buttons')
    })
  }
}

/** Return the layers switcher
 */
function getLayerSwitcher() {
  const layerSwitcher = new LayerSwitcher({
    switcherClass: 'mainSwitcher ol-layer-shop ol-layerswitcher',
    oninfo: (layer) => { showInfo(layer, layerSwitcher.getMap()) },
    selection: false,
    minibar: true
  })
  // No selection
  layerSwitcher.set('selection', false);
  // Inview layers
  layerSwitcher.on('drawlist', e => {
    if (e.layer.get('inview') || e.layer.getVisible()) {
      if (!e.layer.get('inview')) e.layer.set('inview', true)
      e.li.dataset.inview = '';
    }
  })
  // Add layers inview
  ol_ext_element.create('BUTTON', {
    html: '+ de données',
    click: () => { showThemeDialog(layerSwitcher) },
    parent: layerSwitcher.getBarElement('bottom')
  })
  // 
  return layerSwitcher
}

/* Show select dialog / theme */
function showThemeDialog(layerSwitcher) {
  const layers = layerSwitcher.getMap().getLayers();
  const content = ol_ext_element.create('DIV')
  // Search input
  const search = ol_ext_element.create('INPUT', {
    type: 'search',
    placeHolder: 'rechercher...',
    parent: content
  })
  let delayTout;
  ol_ext_element.addListener(search, ['input'], () => {
    if (delayTout) clearTimeout(delayTout)
    setTimeout(() => {
      const val = new RegExp(removeDiacritics(search.value), 'i')
      dialog.getContentElement().querySelectorAll('.theme li').forEach(li => {
        if (val.test(removeDiacritics(li.innerText))) {
          delete li.dataset.hidden;
          li.dataset.visible = ''
        } else {
          delete li.dataset.visible;
          li.dataset.hidden = ''
        }
      })
      dialog.getContentElement().querySelectorAll('.theme').forEach(li => {
        if (li.querySelector('li[data-visible]')) {
          delete li.dataset.hidden
        } else {
          li.dataset.hidden = ''
        }
      });

    }, 300)
  })
  const list = ol_ext_element.create('UL', { parent: content })

  // Layers by themes
  const themes = {}
  layers.forEach(l => {
    const th = l.get('theme') || '';
    if (!themes[th]) themes[th] = [];
    themes[th].push(l)
  })

  // Add layers by themes
  Object.keys(themes).reverse().forEach(th => {
    const li = ol_ext_element.create('LI', {
      class: 'theme',
      html: ol_ext_element.create('H3', { 
        html: md2html.iconize(th),
        click: () => {
          if (li.dataset.expended !== undefined) {
            delete li.dataset.expended;
          } else {
            li.dataset.expended = '';
          }
        }
      }),
      parent: list
    })
    ol_ext_element.create('SPAN', {
      className: 'count',
      parent: li
    })
    const ul = ol_ext_element.create('UL', { parent: li });

    themes[th].forEach(l => {
      const li = ol_ext_element.create('LI')
      ul.prepend(li)
      const check = new ol_ext_input_Checkbox({
        type: 'checkbox',
        after: l.get('title') || l.get('name'),
        checked: l.get('inview')  || l.getVisible(),
        parent: li
      })
      if (l.get('logo')) {
        ol_ext_element.create('DIV', {
          className: 'img',
          html: ol_ext_element.create('IMG', { src: getMediaURL(l.get('logo'))}),
          parent: li
        })
      }
      ol_ext_element.create('DIV', {
        html: md2html(l.get('desc') || l.get('description'), l.getProperties()),
        parent: li
      })
      check.on('check', e => {
        l.setVisible(e.checked)
        l.set('inview', e.checked)
        updateList();
      })
    })

    // Select all / none
    const seli = ol_ext_element.create('LI', {
      className: 'selall',
    })
    ul.prepend(seli)
    ol_ext_element.create('BUTTON', {
      text: 'tout sélectionner',
      click: () => {
        seli.parentNode.querySelectorAll('[type="checkbox"]').forEach(i => {
          if (!i.checked) i.click()
        })
      },
      parent: seli
    })
    ol_ext_element.create('SPAN', {
      text: '/',
      parent: seli
    })
    ol_ext_element.create('BUTTON', {
      text: 'tout supprimer',
      click: () => {
        seli.parentNode.querySelectorAll('[type="checkbox"]').forEach(i => {
          if (i.checked) i.click()
        })
      },
      parent: seli
    })
  })

  const updateList = function() {
    list.querySelectorAll('.count').forEach(count => {
      const c = count.parentNode.querySelectorAll('[type="checkbox"]:checked').length
      const nb = count.parentNode.querySelectorAll('[type="checkbox"]').length
      count.innerText = c + ' / ' + nb;
    })
  }
  updateList()

  // Add dialog
  dialog.show({
    className: 'layer-inview medium',
    title: 'Ajouter des données',
    closeBox: false,
    content: content,
    buttons: ['Terminé'],
    onButton: () => {
      layerSwitcher.drawPanel();
    }
  })
  dialog.set('hideOnBack', true);
  dialog.once('hide', () => { dialog.set('hideOnBack', false) })
}

export default getLayerSwitcher