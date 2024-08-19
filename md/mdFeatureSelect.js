import ol_ext_element from "ol-ext/util/element";
import SelectBase from 'ol-ext/control/SelectBase'
import md2html from "./md2html";

import './mdFeatureSelect.css'

const selectBase = new SelectBase;

// Chack params as dataset
function getParam(content, data) {
  if (!data) return;
  data.split('\n').forEach(d => {
    const i = d.indexOf(':');
    const att = d.substr(0,i).trim();
    const val = d.substr(i+1).trim();
    switch(att) {
      case 'attr':
      case 'op':
      case 'value':
      case 'matchCase':
      case 'display':
      case 'QCM':
      case 'layerId': {
        content.dataset[att] = val;
        break;
      }
      default: {
        break;
      }
    }
  })
}

/** Create feature popup div in a markdown
 * @private
 */
const prepareFeatureSelect = function(type, data) {
  const container = ol_ext_element.create('DIV');
  const content = ol_ext_element.create('DIV', { className: 'mdFeatureSelect', parent: container });
  ol_ext_element.create('DIV', { className: 'md-feature', parent: content });
  const info = ol_ext_element.create('DIV', { className: 'md-feature-info', parent: content });
  // Get params
  data = ('\n'+data).split(/\n-{3,}INFO/)
  getParam(content, data.shift())
  // Get popup
  data.forEach(d => {
    const n = d.indexOf('\n')
    const type = d.substr(0,n).trim() || 'all';
    if (type==='all' || type==='ok' || type==='nok') {
      info.dataset['md_'+type] = d.substr(n);
    }
  })
  // Use a QCM
  if (content.dataset.QCM) {
    // QCM ok
    info.dataset.md_ok = [
      '\n```QCM ' + content.dataset.QCM,
      '[x] valider la réponse\n',
      '---REP ok',
      info.dataset.md_ok,
      '```'
    ].join('\n')
    // QCM nok
    info.dataset.md_nok = [
      '\n```QCM ' + content.dataset.QCM,
      '[ ] valider la réponse\n',
      '---REP nok',
      info.dataset.md_nok,
      '```'
    ].join('\n')
  }
  return container.innerHTML;
}

/* Test if layer id is in a list
 * @param {string} [n]
 * @param {*} id
 * @returns {boolean}
 */
function testLayreId(n, id) {
  if (!n) return true;
  let isid = false;
  n.split(',').forEach(k => {
    isid = isid || k.trim() == id;
  });

  return isid;
}
/** Display feature info on select
 * @param {Feature} feature
 * @return {boolean} true if display in the md element
 */
const mdFeatureSelect = function(feature) {
  let isok = false;
  let display = false;
  document.querySelectorAll('div.mdFeatureSelect').forEach(d => {
    const md = d.querySelector('.md-feature');
    const displayType  = d.dataset.display || 'layer'
    // Clear
    md.innerHTML = '';
    const info = d.querySelector('.md-feature-info')
    info.innerHTML = '';
    // Display info
    if (feature) {
      if (testLayreId(d.dataset.layerId, feature.getLayer().get('id'))) {
        const cond = { attr: d.dataset.attr, op: d.dataset.op, val: d.dataset.value };
        isok = true;
        if (cond.attr) {
          isok = selectBase._checkCondition(feature, cond, !!d.dataset.matchCase);
        }
        if (displayType === 'none') {
          display = true
        } else if (displayType !== 'popup') {
          if (displayType === 'all' || displayType === 'layer' || isok) {
            md.appendChild(feature.getPopupContent(true));
            display = true
          }
        }
      } else if (displayType === 'all') {
        md.appendChild(feature.getPopupContent(true));
        display = true
      }
      // Display info
      if (display) {
        const md = (info.dataset.md_all || '') + info.dataset['md_'+ (isok ? 'ok' : 'nok')]
        md2html.element(md, info, feature.getProperties());
      }
    }
  })
  return display
}

export { prepareFeatureSelect }
export default mdFeatureSelect