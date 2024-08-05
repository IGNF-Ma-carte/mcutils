import ol_ext_element from 'ol-ext/util/element';
import md2html from './md2html';

import './mdQCM.css'

// Responses
const responses = {};
// Count responses
let nbQCM = 0;
let nbQCMok = 0;

// Create QCM
function prepareQCM(type, data) {
  let content = '';
  type = (type||'').split(' ')
  if (!type[1]) console.warn('[QCM] sans nom !')
  const name = (type[1] || '').trim();
  data = ('\n'+data).split(/\n-{3,}REP/)
  content += doQCM(name, data.shift())
  data.forEach(d => {
    const n = d.indexOf('\n')
    const type = d.substr(0,n).trim() || 'all';
    content += doResponse(type, name, d.substr(n+1))
  })
  return content;
}

// Create Response
function doResponse(type, name, data) {
  const content = ol_ext_element.create('DIV')
  // Response
  ol_ext_element.create('DIV', {
    html: md2html(data),
    className: 'md-qcm-response md-response-'+type,
    'data-response': name,
    parent: content
  })
  //
  return content.innerHTML;
}

// Create QCM
function doQCM(name, data) {
  if (!data) return '';
  // Get params
  const lines = data.split('\n');
  const qcm = {
    question: '',
    responses: [],
    actions: []
  }
  lines.forEach(d => {
    let i = (d.charAt(0)==='[' ? 3 : d.indexOf(':'));
    const att = d.substr(0,i).trim();
    const val = d.substr(i+1).trim();
    switch (att) {
      case 'q':
      case 'Q': {
        qcm.question = val
        break;
      }
      case '[x]':
      case '[X]':
      case '[ ]':
      case '[]': {
        qcm.responses.push({
          check: /x/i.test(att),
          val: val
        })
        break;
      }
      case 'action': {
        qcm.actions.push(val)
        break;
      }
      default: {
        break;
      }
    }
  })
  if (!qcm.question && qcm.responses.length===0) return '';
  const content = ol_ext_element.create('DIV')
  // Create QCM
  const dqcm  = ol_ext_element.create('DIV', {
    className: 'md-qcm',
    'data-response': name,
    parent: content
  })
  ol_ext_element.create('DIV', {
    html: md2html(qcm.question),
    className: 'qcm-q',
    parent: dqcm
  })
  // Create checks
  qcm.responses.forEach(r => {
    const check = ol_ext_element.createCheck({
      className: 'qcm-r',
      parent: dqcm
    })
    check.parentNode.dataset.check = r.check
    ol_ext_element.create('DIV', {
      html: md2html(r.val),
      parent: check.parentNode
    })
  })
  // Actions
  let actions = ''
  qcm.actions.forEach(a => {
    actions += md2html('[]('+a+')')
  })
  ol_ext_element.create('DIV', {
    className: 'md-action',
    html: actions,
    parent: dqcm
  })
  return content.innerHTML;
}

// Event on response
function mdQCM(element) {
  element.querySelectorAll('.md-qcm .qcm-r input').forEach(q => {
    q.addEventListener('change', () => {
      const elt = q.parentNode;
      const qcmElt = elt.parentNode;
      qcmElt.dataset.valid = elt.dataset.valid = elt.dataset.check;
      // Show responses
      const name = qcmElt.dataset.response;
      const type = (elt.dataset.check === 'true' ? 'ok' : 'nok');
      element.querySelectorAll('.md-qcm-response.md-response-' + type + '[data-response="' + name + '"]').forEach(d => d.dataset.visible = '')
      element.querySelectorAll('.md-qcm-response.md-response-all[data-response="' + name + '"]').forEach(d => d.dataset.visible = '')
      // Update responses
      if (name && !responses[name]) {
        responses[name] = type;
        // Update counts
        nbQCM++;
        document.querySelectorAll('.md .md-nb-qcm').forEach(e => e.innerText = nbQCM);
        if (type==='ok') {
          nbQCMok++;
          document.querySelectorAll('.md .md-nb-qcm-ok').forEach(e => e.innerText = nbQCMok);
        }
      }
      // Do actions
      qcmElt.querySelectorAll('.md-action a').forEach(a => {
        a.click()
      })
    })
  })
}

export { prepareQCM, nbQCM, nbQCMok }
export default mdQCM