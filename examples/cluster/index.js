import Carte from '../../Carte';
import charte from '../../charte/macarte'
import ColorBrewer from '../../control/ColorBrewer';
import PopupFeature from 'ol-ext/overlay/PopupFeature'
import Statistic from '../../layer/Statistic';
import ol_ext_element from 'ol-ext/util/element';
import notification from '../../dialog/notification';
import dialog from '../../dialog/dialog';
import element from 'ol-ext/util/element';

import './index.css'
import RepartitionGraph from '../../control/RepartitionGraph';
import BaseLayer from 'ol/layer/Base';
import Base from '../../format/Base';

charte.setApp('macarte', 'Cluster');

form = document.getElementById("form")

// colonne(s) à représenter
const selectAttr = form.querySelector('[data-stat="cols"]');
selectAttr.addEventListener('change', () => {
    const cols = [];
    selectAttr.querySelectorAll('option').forEach(o => {
        if (o.selected) {
            cols.push(o.value);
        }
    })
});


// Load carte statistic
const carte = new Carte({
  target: 'map', 
  // id: '32abd17790a2c94c703a9e7a2b8269ab',
  // id: '81dd3298118b6cc4704c11726e065092',
  url: './data/adresses.carte'
})
carte.showControl('legend');

// Get statistical layer on read
let layer = null;
carte.on('read', () => {
  carte.getMap().getLayers().forEach(l => {
    if (l.values_.type === "Vector") {
      layer = l
    }
  })
  // Fill attributes
  features = layer.getSource().getFeatures();
  if (features.length) {
    Object.keys(features[0].getProperties()).forEach(property => {
        if (property !== features[0].getGeometryName()) {
            element.create('OPTION', {
                value: property,
                text: property,
                parent: selectAttr
            });
        }
    });
  }
})

// Add a popupfeature
// carte.getMap().addOverlay(new PopupFeature({
//   canFix: true,
//   closeBox: true,
//   minibar: true,
//   template: (f) => {
//     const prop = f.getProperties();
//     delete prop.geometry;
//     return {
//       attributes: Object.keys(prop)
//     }
//   },
//   select: carte.getSelect()
// }))
carte.setSelectStyle({points: true});


// Update on select
carte.getSelect().on('select', updateSelection)

function updateSelection() {
  // Display nb object selected
  carte.getSelect().getFeatures().forEach(f => {
    f.getProperties().features.forEach(l => {
      const prop = l.getProperties()
      delete prop.geometry
    })
  });

}

/* DEBUG */
window.carte = carte
window.layer = layer
/**/