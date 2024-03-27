import Chart from 'chart.js/auto';
import ol_ext_element from 'ol-ext/util/element';

/* Escape chars */
function doSecure (md) {
  return md.replace(/</g, "&lt;")
    .replace(/'/g,"&apos;")
    .replace(/"/g,"&quot;");
}

/** Prepare charts
 * @private
 */
function prepareCharts(type, md) {
  type = type.split(' ');
  let param = { 'class': 'md-chart', 'data-type': type[1] };
  if (type[2]) {
    const wh = type[2].split('x');
    let style = '';
    if (wh[0]) style += 'width:' + wh[0] + 'px; ';
    if (wh[1]) style += 'height:' + wh[1] + 'px; ';
    param.style = style;
  }
  if (type[3] && /^center$|^left$|^right$/.test(type[3])) {
    param.class = 'md-chart md-chart-' + type[3];
  }
  let p = '';
  for (let i in param) {
    p += ' ' + i + '="' + doSecure(param[i]) + '"';
  }
  return '<div ' + p + '><textarea>' 
    + md.replace(/</g, '&lt;') 
    + '</textarea></div>'
}

/** Chart color list
 * @namespace md2html
 */
const chartColors = {
  standard: [[31,119,180],[174,199,232],[255,127,14],[255,187,120],[44,160,44],[152,223,138],[214,39,40],[255,152,150],[148,103,189],[197,176,213],[140,86,75],[196,156,148],[227,119,194],[247,182,210],[127,127,127],[199,199,199],[188,189,34],[219,219,141],[23,190,207],[158,218,229]],
  hue: [[27,163,198],[44,181,192],[48,188,173],[33,176,135],[51,166,92],[87,163,55],[162,182,39],[213,187,33],[248,182,32],[248,146,23],[240,103,25],[224,52,38],[246,73,113],[252,113,158],[235,115,179],[206,105,190],[162,109,194],[120,115,192],[79,124,186]],
  excel: [[153,153,255],[153,51,102],[255,255,204],[204,255,255],[102,0,102],[255,128,128],[0,102,204],[204,204,255],[0,0,128],[255,0,255],[255,255,0],[0,0,255],[128,0,128],[128,0,0],[0,128,128],[0,0,255]],
  classic: [[78,121,167],[160,203,232],[242,142,43],[255,190,125],[89,161,79],[140,209,125],[182,153,45],[241,206,99],[73,152,148],[134,188,182],[225,87,89],[255,157,154],[121,112,110],[186,176,172],[211,114,149],[250,191,210],[176,122,161],[212,166,200],[157,118,96],[215,181,166]],
}
const chartBackColors = {};
const chartLineColors = {};
for (let i in chartColors) {
  chartBackColors[i] = [];
  chartBackColors[i+'-2'] = [];
  chartLineColors[i] = [];
  chartLineColors[i+'-2'] = [];
  chartColors[i].forEach(c => {
    c[3] = .2;
    chartBackColors[i].push('rgba('+c.join(',')+')');
    c[3] = 1;
    chartBackColors[i+'-2'].push('rgba('+c.join(',')+')');
    chartLineColors[i].push('rgba('+c.join(',')+')');
    chartLineColors[i+'-2'].push('rgba('+c.join(',')+')');
  })
}

/** Get param as array
 * @param {string} param
 * @param {boolean} [br=false] use <br>
 * @private
 */
function getArrayParam(param, br) {
  if (!param) return false;
  param = param.split(';');
  param.forEach((p,i) => {
    param[i] = p.trim()
    if (br && /<br>/.test(param[i])) {
      param[i] = param[i].split('<br>')
    }
  })
  return param;
}

/** Create charts from element
 * @namespace md2html
 * @param {Element} element
 */
function mdCharts(element) {
  element.querySelectorAll('.md-chart').forEach(dchart => {
    // Don't do it twice
    if (dchart.querySelector('canvas') || !dchart.querySelector('textarea')) return;
    // Chart type
    let type = dchart.getAttribute('data-type');
    let horizontal = false;
    switch(type) {
      case 'donut': {
        type = 'doughnut';
        break;
      }
      case 'polar': {
        type = 'polarArea';
        break;
      }
      case 'hbar': {
        type = 'bar';
        horizontal = true;
        break;
      }
      case 'pie':
      case 'doughnut':
      case 'bar':
      case 'line':
      case 'radar':
      case 'polarArea':
        break;
      default:  {
        // console.warn (type, 'not defined');
        return;
      }
    }
    // Decode chart
    const lines = dchart.querySelector('textarea').value.split('\n');
    dchart.querySelector('textarea').remove();
    // const attr = JSON.parse(lines.shift(0));
    const param = {};
    lines.forEach(d => {
      const i = d.indexOf(':');
      const att = d.substr(0,i);
      if (att) {
        const content = d.substr(i+1).trim();
        // Create label using att names
        if (att==='data' && !param['labels'] && /%/.test(content)) {
          param['labels'] = getArrayParam(content.replace(/%/g,''), true);
        } 
        if (/^data$|^data-title$|^data-type$/.test(att)) {
          if (!param[att]) param[att] = [];
          param[att].push(getArrayParam(content));
        } else {
          if (/^labels$|^colors$/.test(att)) {
            param[att] = getArrayParam(content, att==='labels');
          } else {
            param[att] = content; // md2html.doData(content, attr)
          }
        }
      }
    });
    if (!param.data) {
      dchart.remove();
      return;
    }
    // Background-color
    dchart.style.backgroundColor = param['backgroundColor'] || param['background-color'] || '';
    // not visible
    if ((Object.prototype.hasOwnProperty.call(param, 'visible') && !param.visible)) {
      dchart.classList.add('md-chart-hidden');
    }
    // Create canvas
    const canvas = ol_ext_element.create('CANVAS', { parent: dchart });
    // Create chart
    const titles = param['data-title'] || [];
    const types = param['data-type'] || [];
    const labels = param['labels'] || [];
    if (!labels.length) {
      param.data[0].forEach(() => labels.push(''))
    }
    const colors = param.colors || '';
    const dataSet = [];
    const multi = /radar|line|bar/.test(type);
    const scales = {};
    const scale = {};
    if (/radar/.test(type) && param.min !== 'auto') {
      scale.min = 0;
    }
    if (/line|bar/.test(type)) {
      scales.y = {
        title: {
          text: param.ylabel,
          display: !!param.ylabel
        },
        ticks: { 
          callback: function (val, /* index */) { return this.getLabelForValue(Number(val)) }
        },
        beginAtZero: param.min !== 'auto'
      };
      scales.x = { 
        title: {
          text: param.xlabel,
          display: !!param.xlabel
        }
      };
    }
    if (param.min && !isNaN(parseFloat(param.min))) {
      scale.min = parseFloat(param.min);
    }
    if (param.max && !isNaN(parseFloat(param.max))) {
      scale.max = parseFloat(param.max);
    }

    const bcolor = chartBackColors[param.theme] || chartBackColors['standard'];
    const lcolor = chartLineColors[param.theme] || chartLineColors['standard'];
    param.data.forEach((d,i) => {
      dataSet.push({
        label: titles[i],
        type: types[i] ? (types[i][0]||'').replace('donut', 'doughnut').replace('polar','polarArea') : undefined,
        data: d,
        backgroundColor: multi ? colors[i] || bcolor[i] : colors || bcolor,
        borderColor: multi ? colors[i] || lcolor[i] :  colors || lcolor,
        borderWidth: 1
      })
    })
    try {
      const opt = {
        type: type,
        responsive: true,
        data: {
          labels: labels,
          datasets: dataSet
        },
        options: {
          maintainAspectRatio: false,
          scales: scales,
          scale: scale,
          indexAxis: horizontal ? 'y' : 'x',
          plugins: {
            title: {
              text: param.title || undefined,
              display: !!param.title,
            },
            legend: {
              title: {
                text: param['legend-title'] || undefined,
                display: !!param['legend-title'],
                font: {
                  weight: 'bold'
                }
              },
              display: !!param.legend,
              position: /left|right|top|bottom/.test(param.legend) ? param.legend : 'right',
              labels: {
                boxHeight: 12,
                boxWidth: 12
              }
            }
          }
        }
      }
      new Chart(canvas.getContext('2d'), opt);
    } catch(e) {
      // Chart is not set
      canvas.remove();
      console.log(e);
    }
  });
}

export { prepareCharts }
export default mdCharts