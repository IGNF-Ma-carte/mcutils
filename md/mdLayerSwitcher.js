import ol_ext_element from "ol-ext/util/element";

import './mdLayerSwitcher.css'
import md2html from "mcutils/md/md2html";

let radio = 0;

const prepareLayerSwitcher = function(type, data) {
  const container = ol_ext_element.create('DIV');
  const atts = { layers: []};
  data.split('\n').forEach(d => {
    const i = d.indexOf(':');
    const att = d.substr(0,i).trim();
    const val = d.substr(i+1).trim();
    if (att==='layer') {
      atts.layers.push(val)
    } else {
      atts[att] = val;
    }
  });
  atts.size = (atts.size || 'x').split('x')
  // LayerId
  const switcher = ol_ext_element.create('UL', { 
    className: 'mdLayerSwitcher ' + (atts.className || '') + (atts.type==='button' ? ' mdSwitcherButton': ''),
    parent: container
  });
  // Title
  if (atts.title) {
    ol_ext_element.create('H2', { 
      text: atts.title, 
      parent: switcher 
    })
  }
  // Layers
  atts.layers.forEach(l => {
    const d = ol_ext_element.create('LI', {
      text: l,
      style: {
        width: (atts.size[0] ? atts.size[0]+'px' : ''),
        height: (atts.size[1] ? atts.size[1]+'px' : '')
      },
      className: 'mdLayer',
      parent: switcher
    })
    d.dataset.layerId = l;
    if (atts.radio) d.dataset.radio = 1;
  })


  return container.innerHTML;
}

const mdLayerSwitcher = function(element, story) {
  if (!story || !story.getCarte()) return;
  const switchers = element.querySelectorAll('.mdLayerSwitcher')
  if (switchers.length) {
    const layers = story.getCarte().getMap().getLayers().getArray();
    switchers.forEach(swt => {
      const name = 'layer_' + (radio++);
      let lgroup = []
      swt.querySelectorAll('.mdLayer').forEach(elt => {
        const lid = elt.dataset.layerId.split(' ')
        lgroup = lgroup.concat(lid)
        const layer = layers.find(l => l.get('id') == lid[0] )
        // display layer
        elt.innerHTML = '';
        if (layer) {
          const label = ol_ext_element.create('LABEL', {
            className: 'ol-ext-check ol-ext-checkbox' + (elt.dataset.radio ? ' ol-ext-radio' : ''),
            parent: elt
          })
          ol_ext_element.create('INPUT', {
            type: elt.dataset.radio ? 'radio' : 'checkbox',
            checked: layer.getVisible(),
            name: name,
            on: {
              change: e => {
                if (elt.dataset.radio) {
                  lgroup.forEach(id => {
                    const layer = layers.find(l => l.get('id') == id )
                    layer.setVisible(false)
                  })
                }
                lid.forEach(id => {
                  const layer = layers.find(l => l.get('id') == id )
                  layer.setVisible(e.target.checked)
                })
              }
            },
            parent: label
          })
          ol_ext_element.create('SPAN', {
            parent: label
          })
          if (layer.get('logo')) {
            ol_ext_element.create('DIV', {
              className: 'mdLayerLogo',
              html: ol_ext_element.create('IMG', { src: layer.get('logo') }),
              parent: label
            })
          }
          ol_ext_element.create('TEXT', {
            html: md2html(layer.get('title') || layer.get('name')),
            parent: label
          })
        }
      })
    })
  }
}

export default mdLayerSwitcher
export { prepareLayerSwitcher }