import md2html from '../../md/md2html'
import ol_filter_Colorize from 'ol-ext/filter/Colorize'
import CanvasFilter from 'ol-ext/filter/CanvasFilter'
import CSSFilter from 'ol-ext/filter/CSS'

import './reader.scss'
import '../index.css'

// App i18n
import _T from '../../i18n/i18n'
import { i18n } from '../../i18n/i18n'
import txt from '../examples.fr.js'

i18n.set('fr', txt);
console.log(_T('macarte'));
// i18n.template(document.getElementById('i18n'));

import Carte from '../../Carte'
import dialog from '../../dialog/dialog'

const carte = new Carte({ 
  target: 'map', 
  key: '0gd4sx9gxx6ves3hf3hfeyhw',
  // url: '../data/JeudiPhoto.carte',
  id: 'f41eb1e858922dc6d4a4a60e96362604',
  id : '85110b95a26e57fd07d9cdcb915f5c1e',
  //url: '../data/BUG.carte',
  //url: '../data/georef.carte',
  //url: '../data/stat.carte',
  //url: '../data/camembert.carte',
//  cgu: document.body
});
// carte.read('../data/JeudiPhoto.carte');

carte.on(['read:start', 'loading'], () => {
  dialog.showWait('Chargement en cours...')
})
carte.on('read', () => {
  console.log('lecture OK !');
  dialog.hide();
})
carte.on('error', (e) => {
  console.log('Impossible de lire la carte...')
  dialog.hide();
})

let isNB = false;
document.querySelector('.NB').addEventListener('click', () => {
  isNB = !isNB;
  if (isNB) {
    carte.getMap().getLayers().forEach(l => {
      l.grayscale(true);
    });
  } else {
    carte.getMap().getLayers().forEach(l => {
      l.grayscale(false);
    });
  }
})

// Load carte
const uid = document.querySelector('input');
uid.addEventListener('change', () => {
  carte.load(uid.value);
})

carte.getSelect().on('select', (e) => {
  let feature = e.selected[0];
  carte.popupFeature(feature, e.mapBrowserEvent.coordinate);
})

/* Debug */
window.md2html = md2html
window.carte = carte;
window.map = carte.map;
window._T = _T
/**/