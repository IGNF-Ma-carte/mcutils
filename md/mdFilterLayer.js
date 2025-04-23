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
  const atts = {};
  data.split('\n').forEach(d => {
    const i = d.indexOf(':');
    const att = d.substr(0,i).trim();
    const val = d.substr(i+1).trim();
    atts[att] = val;
  });

  // LayerId
  const filterDiv = ol_ext_element.create('DIV', { 
    className: 'mdFilterLayer ' + (atts.className || '') + (atts.border ? ' mdSwitcherBorder': ''),
    parent: container
  });
  filterDiv.dataset.layerId = atts.layerId;
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
      const lid = elt.dataset.layerId
      const layer = layers.find(l => l.get('id') == lid )
      if (layer && layer.getConditionStyle()) {
        layer.getConditionStyle().forEach(cond => {
          if (elt.dataset.reset) {
            cond.filtered = false;
          }
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
        if (elt.dataset.reset) {
          layer.getSource().changed();
        }
      }
    })
  }
}

export default mdFilterLayer
export { prepareFilterLayer }