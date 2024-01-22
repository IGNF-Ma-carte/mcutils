import config from '../../config/config'
import setLayout from '../../layout/layout'

import Carte from '../../Carte'

import '../index.css'
import './layout.scss'

const carte = new Carte({ 
  target: 'map', 
  key: config.gppKey,
  id: 'b8d7c7f37733d992051adb4c2dbb8a2d'
  //url: '../data/JeudiPhoto.carte',
  //url: '../data/georef.carte',
  //url: '../data/stat.carte',
  //url: '../data/camembert.carte'
});
carte.getSelect().on('select', (e) => {
  let feature = e.selected[0];
  carte.popupFeature(feature, e.mapBrowserEvent.coordinate);
})

const selTheme = document.getElementById('theme');
selTheme.addEventListener('change', () => {
  const c = setLayout(selTheme.value);
  console.log(c)
});

import ColorPicker from 'ol-ext/util/input/Color';
const cpicker = new ColorPicker({
  color: '#ccc',
  input: document.querySelector('input')
});
cpicker.on('color', e => {
  setLayout([e.color]);
});

/* Debug */
window.carte = carte;
window.map = carte.map;
window.setLayout = setLayout
/**/