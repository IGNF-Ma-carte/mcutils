import ol_ext_element from "ol-ext/util/element";

import './mdFilterLayer.css'

const prepareFilterLayer = function(type, data) {
  const container = ol_ext_element.create('DIV');
  const atts = {};
  data.split('\n').forEach(d => {
    const i = d.indexOf(':');
    const att = d.substr(0,i).trim();
    const val = d.substr(i+1).trim();
    atts[att] = val;
  });
  // LayerId
  const filterDiv = ol_ext_element.create('DIV', { 
    className: 'mdFilterLayer ' + (atts.className || ''),
    parent: container
  });
  filterDiv.dataset.layerId = atts.layerId;

  // Title
  if (atts.title) {
    ol_ext_element.create('H2', { 
      text: atts.title, 
      parent: filterDiv 
    })
  }

  return container.innerHTML;
}


const mdFilterLayer = function(element, story) {
  if (!story || !story.getCarte()) return;
  const filters = element.querySelectorAll('.mdFilterLayer')
  if (filters.length) {
    const layers = story.getCarte().getMap().getLayers().getArray();
    filters.forEach(elt => {
      const lid = elt.dataset.layerId
      const layer = layers.find(l => l.get('id') == lid )
      if (layer && layer.getConditionStyle()) {
        layer.getConditionStyle().forEach(cond => {
          const c = ol_ext_element.createCheck({
            after: cond.title,
            on: {
              change: (e) => {
                cond.filtered = !e.target.checked
                layer.getSource().changed();
              }
            },
            parent: elt
          })
          c.parentNode.querySelector('span').after(cond.symbol.getImage(true))
          c.checked = (cond.filtered !== true)
        })
      }
    })
  }
}

export default mdFilterLayer
export { prepareFilterLayer }