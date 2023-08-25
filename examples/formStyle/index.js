import charte from '../../charte/macarte'
import Carte from '../../Carte'

import './index.css'

charte.setApp('macarte', 'Styles');

import FormStyle from '../../input/FormStyle.js'

// Carte
const carte = new Carte({
  target: 'map', 
  id: 'dae605bd4a371826298a83d195fa6ee4'
})
carte.setSelectStyle({ type:'default', points: false });

// FormStyle
const form =  new FormStyle({ 
  target: document.getElementById('form'),
  // preview : 'bottom',
  symbolLib: carte.getSymbolLib()
});

let protect = false;

carte.getSelect().on('select', () => {
  const f = carte.getSelect().getFeatures().item(0);
  if (f) {
    protect = true;
    //form.setStyle(f.getIgnStyle(true));
    form.setFeature(f);
    // Type de geometry
    const typeGeom = {};
    carte.getSelect().getFeatures().forEach(f => {
      typeGeom[f.getGeometry().getType()] = true;
    })
    const m = Object.keys(typeGeom).join(',');
    form.setTypeGeom(m);
    // restore
    protect = false;
  } else {
    form.setTypeGeom();
  }
})

form.on('change', (e) => {  
  if (protect) return;
  // f contient tous les elements en cas de selection multiple
  var f = carte.getSelect().getFeatures();
  f.forEach((item) => { 
    item.setIgnStyle(e.attr, e.value);
    item.changed();
    //setTimeout(() => item.changed(),100);
  })
})

/* DEBUG */
window.form = form;
window.carte = carte;
/**/