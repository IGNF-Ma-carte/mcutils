import ol_ext_element from "ol-ext/util/element";

import './mdFilterLayer.css'

/** Prepare layerFilter
 * @param {string} type
 * @param {string} data
 * @returns {string}
 * @private
 */
const prepareFilterLayer = function(type, data) {
  const container = ol_ext_element.create('DIV');
  const atts = { layers: [] };
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

  // LayerId
  const filterDiv = ol_ext_element.create('DIV', { 
    className: ('mdFilterLayer ' + (atts.className || '') + (atts.border ? ' mdSwitcherBorder': '')).replace(/  /g,' '),
    parent: container
  });
  filterDiv.dataset.layers = JSON.stringify(atts.layers);
  if (atts.reset) filterDiv.dataset.reset = atts.reset;
  if (atts.background) filterDiv.style = 'background: ' + atts.background + ';';

  // Title
  if (atts.title) {
    ol_ext_element.create('H2', { 
      text: atts.title, 
      parent: filterDiv 
    })
  }

  return container.innerHTML;
}

/** Create filtering elements 
 * @param {Element} element current element
 * @param {Story} story the current story
 */
const mdFilterLayer = function(element, story) {
  if (!story || !story.getCarte()) return;
  const filters = element.querySelectorAll('.mdFilterLayer')
  if (filters.length) {
    const layers = story.getCarte().getMap().getLayers().getArray();
    filters.forEach(elt => {
      elt.innerHTML = '';
      // Linked layers
      const linked = []
      JSON.parse(elt.dataset.layers).forEach(id => {
        const l = layers.find(l => l.get('id') == id)
        console.log(id, l)
        if (l) linked.push(l)
      })
      // First layer / condition
      const layer = linked.shift()
      // Display condition
      if (layer && layer.getConditionStyle && layer.getConditionStyle()) {
        layer.getConditionStyle().forEach((cond, i) => {
          if (elt.dataset.reset) {
            cond.filtered = false;
          }
          // Checkbox
          const c = ol_ext_element.createCheck({
            after: cond.title,
            on: {
              change: (e) => {
                cond.filtered = !e.target.checked
                layer.getSource().changed();
                linked.forEach(l => {
                  if (l && l.getConditionStyle && l.getConditionStyle() && layer.getConditionStyle()[i]) {
                    l.getConditionStyle()[i].filtered = cond.filtered;
                    l.getSource().changed();
                  }
                })
              }
            },
            parent: elt
          })
          c.parentNode.querySelector('span').after(cond.symbol.getImage(true))
          c.checked = (cond.filtered !== true)
        })
        if (elt.dataset.reset) {
          layer.getSource().changed();
        }
      }
    })
  }
}

export default mdFilterLayer
export { prepareFilterLayer }