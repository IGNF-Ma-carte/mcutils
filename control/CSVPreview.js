import olObject from 'ol/Object'
import papa from 'papaparse';
import element from 'ol-ext/util/element';
import ol_ext_element from 'ol-ext/util/element';

import './CSVPreview.css'

/** Create a preview for a CSV
 * @memberof mcutils.control
 * @constructor
 * @extends {olObject}
 * @param {Object} options
 *  @param {Element} options.target
 *  @param {string} options.csv
 *  @param {number} [options.nbLines=5]
 *  @param {boolean} [options.line=false] display line number
 */
class CSVPreview extends olObject {
  constructor(options) {
    // Create object
    super();

    // Table element
    this.element = ol_ext_element.create('TABLE', {
      className: 'mc-csv-preview',
      parent: options.target
    })
    // Data
    this.csv = options.csv || 'nodata';
    this.set('nbLines', options.nbLines || 5);
    this.set('line', options.line || false);
  }
}

/** Show data according to papaparse options
 * @param {Object} papaOptions
 * @param {Object|Array()} papaOptions
 * @returns {*} parsed data
 */
CSVPreview.prototype.showData = function(papaOptions, selected0) {
  // Default values
  let selected = {};
  if (Array.isArray(selected0)) {
    selected0.forEach(s => selected[s] = s)
  } else if (selected0) {
    selected = selected0;
  }
  papaOptions = papaOptions || {}
  if (papaOptions.dynamicTyping === undefined) papaOptions.dynamicTyping = true;
  // Skip lines
  let skip = 0;
  if (papaOptions.skipLines) {
    for (let i=0; i<papaOptions.skipLines; i++) {
      skip = this.csv.indexOf('\n', skip) +1;
    }
  }

  // Parse file
  const result = this.result = papa.parse(this.csv.substr(skip), papaOptions);
  const header = result.meta.fields;
  const datas = result.data;
  
  // Clear tab
  this.element.innerHTML = '';

  let line = 1;
  // Add a new line
  const showLine = (li, data, values) => {
    if (this.get('line')) {
      element.create('TD', {
        className: 'lnum',
        text: li === trHead ? '#' : line++,
        parent: li,
      })
    }
    data.forEach(att => {
      let val = values ? values[att] : att;
      const sel = (li === trHead && selected[val]);
      if (sel) {
        val = selected[val];
      }
      element.create('TD', {
        className: (sel ? 'selected' : '') + ' ' + typeof(val),
        title: val, 
        text: val,
        parent: li,
      })
    })
  }

  // Header
  const trHead = element.create('TR', {
    parent: element.create('THEAD', {
      parent: this.element,
    })
  });
  if (header) {
    showLine(trHead, header)
  } else {
    // ...or numbers
    const d = [];
    datas[0].forEach((a,i) => d.push(i))
    showLine(trHead, d);
  }

  // Show body
  const tbody = element.create('TBODY', {
    parent: this.element,
  });
  // Show lines
  const max = Math.min(this.get('nbLines'), datas.length)
  for (let i=0; i < max; i++){
    const tr = element.create('TR', {
      parent: tbody,
    });
    showLine(tr, Object.keys(datas[i]), datas[i]);
  } 

  return result;
}

/** Get the current result
 * @returns {*} parsed data
 */
CSVPreview.prototype.getResult = function() {
  return this.result;
}

/** Set current CSV data
 * @param {string} csv
 */
CSVPreview.prototype.setCSV = function(csv) {
  this.csv = csv || '';
}

export default CSVPreview;