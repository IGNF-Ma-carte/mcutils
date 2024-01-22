import Carte from '../../Carte';
import charte from '../../charte/macarte'
import ColorBrewer from '../../control/ColorBrewer';
import PopupFeature from 'ol-ext/overlay/PopupFeature'
import Statistic from '../../layer/Statistic';
import ol_ext_element from 'ol-ext/util/element';
import notification from '../../dialog/notification';
import dialog from '../../dialog/dialog';

import './index.css'
import RepartitionGraph from '../../control/RepartitionGraph';

charte.setApp('macarte', 'Colors');

// Add stat type
const select = ol_ext_element.create('SELECT', {
  change: () => {
    slayer.setStatistic({ typeMap: select.value }, 300);
  },
  parent: document.getElementById('form')
})
Statistic.type.forEach(t => {
  ol_ext_element.create('OPTION', {
    value: t,
    html: t,
    parent: select
  })
})

// Add stat type
const mode = ol_ext_element.create('SELECT', {
  change: () => {
    slayer.setStatistic({ mode: mode.value }, 300);
  },
  parent: document.getElementById('form')
})
Object.keys(Statistic.mode).forEach(k => {
  ol_ext_element.create('OPTION', {
    value: k,
    html: Statistic.mode[k],
    parent: mode
  })
})

// NB classes
const classes = ol_ext_element.create('DIV', {
  parent: document.getElementById('form')
})
ol_ext_element.create('SPAN', {
  html: 'Nb classes : ',
  parent: classes
})
ol_ext_element.create('INPUT', {
  type: 'number',
  value: 5,
  min: 2,
  change: (e) => {
    brewer.setSize(e.target.value);
    slayer.setStatistic({
      nbClass: e.target.value,
      brewerColors: brewer.getColors()
    }, 300);
  },
  parent: classes
})

// Add brewer
const brewer = new ColorBrewer({ 
  target: document.getElementById('form')
});
brewer.on(['change:scheme', 'check', 'change:color'], (e) => {
  slayer.setStatistic({ brewerColors: brewer.getColors()}, 300)
  console.log('change')
})

// Add repartition graph
const graph = new RepartitionGraph({
  target: document.getElementById('form')
})

graph.on('change:limit', (e) => {
  slayer.setStatistic({ limits: e.limits })
})

// Radius
const radius = ol_ext_element.create('DIV', {
  parent: document.getElementById('form')
})
ol_ext_element.create('LABEL', {
  text: 'Radius: ',
  parent: radius
})
ol_ext_element.create('INPUT', {
  type: 'number',
  value: 3,
  min: -1,
  change: (e) => {
    slayer.setStatistic({ rmin: parseFloat(e.target.value) })
  },
  parent: radius
})
ol_ext_element.create('INPUT', {
  type: 'number',
  value: 20,
  min: 0,
  change: (e) => {
    slayer.setStatistic({ rmax: parseFloat(e.target.value) })
  },
  parent: radius
})

// Blendmode
ol_ext_element.createSwitch({
  html: 'normal',
  after: 'multiply',
  checked: true,
  change: (e) => {
    slayer.setBlendMode(e.target.checked ? 'multiply' : 'normal');
  },
  parent: document.getElementById('form')
})

// Show border
const stroke = ol_ext_element.createCheck({
  after: 'afficher les contours',
  checked: true,
  parent: document.getElementById('form')
})
stroke.addEventListener('change', e => {
  slayer.setStatistic({
    stroke: stroke.checked ? 'red' : false
  }, 300)
})

// Load carte statistic
const carte = new Carte({
  target: 'map', 
  // id: '32abd17790a2c94c703a9e7a2b8269ab',
  // id: '81dd3298118b6cc4704c11726e065092',
  url: './data/stat.carte'
})
carte.showControl('legend');

// Get statistical layer on read
let slayer = null;
carte.on('read', () => {
  window.slayer = slayer = null;
  carte.getMap().getLayers().forEach(l => {
    if (l.stat) {
      window.slayer = slayer = l;
      slayer.on('stat:start', () => {
        notification.show('calcul...', -1)
      })
      slayer.on('stat:end', (e) => {
        notification.hide();
        if (e.error) {
          dialog.showAlert('Impossible de calculer la statistique...<br/>' + e.statusText)
          return;
        } 
        // Handle size
        switch (e.stat.typeMap) {
          case 'categorie': {
            brewer.setSize(slayer.getValues().length);
            break;
          }
          case 'sectoriel': {
            brewer.setSize(e.stat.cols.length);
            break;
          }
          default: {
            brewer.setSize(e.stat.nbClass);
            break;
          }
        }
        // Show repartition on change
        graph.setRepartition({
          mode: slayer.getMode(), 
          values: slayer.getValues(),
          limits: slayer.getLimits(),
          colors: brewer.getColors()
        })
        // Legend
        const legendCtrl = carte.getControl('legend').getLegend();
        legendCtrl.getItems().clear();
        slayer.getStatLegend().forEach(l => {
          legendCtrl.addItem(l);
        });
      })
    }
  })
})

// Add a popupfeature
carte.getMap().addOverlay(new PopupFeature({
  canFix: true,
  closeBox: true,
  minibar: true,
  template: (f) => {
    const prop = f.getProperties();
    delete prop.geometry;
    return {
      attributes: Object.keys(prop)
    }
  },
  select: carte.getSelect()
}))
carte.setSelectStyle({points: false});

/* DEBUG */
window.brewer = brewer
window.carte = carte
window.graph = graph
/**/