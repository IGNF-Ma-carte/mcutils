import config from '../../config/config'
import './index.css'
import '../index.css'
// App i18n
import _T from '../../i18n/i18n'
import { i18n } from '../../i18n/i18n'
import txt from '../examples.fr.js'


import md2html from '../../md/md2html'
import ol_ext_element from 'ol-ext/util/element'

i18n.set('fr', txt);
console.log(_T('macarte'));

import Carte from '../../Carte'
import StoryMap from '../../StoryMap.js'
import dialog from '../../dialog/dialog'

const carte = new StoryMap({ 
  target: 'map', 
  key: config.gppKey,
  // url: '../data/multi-select.carte',
  id: '1xiwBM',
});

carte.on(['read:start', 'loading'], () => {
  dialog.showWait('Chargement en cours...')
})

const divFeature = document.querySelector('#shownFeature')
window.divFeature = divFeature

carte.on('read', () => {
  dialog.hide();

  window.select = carte.getCarte().getSelect();

  carte.getCarte().getSelect().on('select:show', (e) => {
    const f = e.shown_feature

    // Add attributes to table
    if (f) {
      const prop = f.getMDProperties();

      let attributes = '<table>';
      // Add ol uid and layer name
      attributes += '<tr><td>' + 'ol_uid' + '</td><td>' + f.ol_uid +'</td></tr>';
      attributes += '<tr><td>' + 'LAYER_NAME' + '</td><td>';
      let l;
      if (f.get('features') instanceof Array) {
        l = f.get('features')[0].getLayer();
      } else {
        l = f.getLayer();
      }
      window.layer = l;
      attributes += l.get('title') +'</td></tr>';
      for (let value in prop) {
        attributes += '<tr><td>' + value + '</td><td>' + prop[value] +'</td></tr>';
      }

      attributes += '</table>';

      const div = ol_ext_element.create('DIV', {
        html: attributes,
        className: 'md'
      });
      
      divFeature.replaceChildren(div);
    } else {
      divFeature.replaceChildren()
    }
  })
})
carte.on('error', (e) => {
  console.log(e)
  dialog.hide();
})



/* DEBUG */
window.carte = carte
/**/