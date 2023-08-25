import ol_ext_element from 'ol-ext/util/element';
import charte from '../../charte/macarte'
import CSVPreview from '../../control/CSVPreview';

import './index.css'

import csv from './natalite_fecondite.txt'

charte.setApp('macarte', 'CSV');

// On change
function onchange() {
  const selected = {};
  selected[sel.value] = 'ID';
  selected[sel2.value] = sel2.value;
  data = preview.showData({
    header: true
  }, selected);
}
// Select field
const sel = ol_ext_element.create('SELECT', { 
  change: onchange,
  parent: charte.getAppElement() 
})
const sel2 = ol_ext_element.create('SELECT', { 
  change: onchange,
  parent: charte.getAppElement() 
})

// Create preview
const preview = new CSVPreview({
  csv: csv,
  line: true,
  target: ol_ext_element.create('DIV', {
    className: 'csv',
    parent: charte.getAppElement()
  })
})

// Show data
let data = preview.showData({
	header: true
});

// Select options
ol_ext_element.create('OPTION', {
  text: 'Sélectionner un identifiant',
  parent: sel
})
ol_ext_element.create('OPTION', {
  text: 'Sélectionner une colonne',
  parent: sel2
})
data.meta.fields.forEach(d => {
  ol_ext_element.create('OPTION', {
    value: d,
    text: d,
    parent: sel
  })
  ol_ext_element.create('OPTION', {
    value: d,
    text: d,
    parent: sel2
  })
})

/* DEBUG */
window.preview = preview;
/**/