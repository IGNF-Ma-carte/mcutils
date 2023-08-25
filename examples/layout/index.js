import 'ol/ol.css'
import 'ol-ext/dist/ol-ext.css'
import '../index.css'
import setLayout from '../../layout/layout'

import Carte from '../../Carte'

const carte = new Carte({ 
  target: 'map', 
  key: '0gd4sx9gxx6ves3hf3hfeyhw',
  url: '../data/JeudiPhoto.carte',
  //url: '../data/georef.carte',
  //url: '../data/stat.carte',
  //url: '../data/camembert.carte',
//  cgu: document.body
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