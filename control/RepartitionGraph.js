import ol_ext_element from 'ol-ext/util/element';
import ol_Object from 'ol/Object'

import './RepartitionGraph.css'

/** Repartition graph control
 * @memberof mcutils.control
 * @constructor
 * @extends {ol_Object}
 * @param {Object} options
 *  @param {Element} target element to place in
 *  @param {number} [width=260] canvas width
 *  @param {number} [height=150] canvas height
 * @fires change:limit
 */
class RepartitionGraph extends ol_Object {
  constructor(options) {

    options = options || {};
    super(options);

    const element = this.element = ol_ext_element.create('DIV', {
      className: 'repartionGraph',
      parent: options.target
    })
    this.graph = ol_ext_element.create('DIV', {
      className: 'rgGraph',
      parent: element
    })

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = options.width || 260;
    this.canvas.height = options.height || 150;
    this.ctx = this.canvas.getContext('2d');

    this.graph.append(this.canvas);

    // Smooth option
    const d = ol_ext_element.create('DIV', {
      className: 'rgOptions',
      parent: element
    })
    const smooth = ol_ext_element.createCheck({
      className: 'small',
      after: 'lisser',
      parent: d
    })
    smooth.addEventListener('change', (e) => {
      this.set('smooth', e.target.checked);
      this.draw();
    });
    // Radio button histogram/distribution
    const dist = ol_ext_element.createCheck({
      type: 'radio',
      className: 'small',
      name: 'rgtypgraph',
      after: 'répartition',
      parent: d
    })
    dist.addEventListener('change', () => {
      this.setType('distribution');
    });
    const hist = ol_ext_element.createCheck({
      type: 'radio',
      className: 'small',
      name: 'rgtypgraph',
      after: 'histogramme',
      checked: true,
      parent: d
    })
    hist.addEventListener('change', () => {
      this.setType('histogram');
    })
    this.limitDiv = ol_ext_element.create('DIV', {
      className: 'rgLimits',
      parent: element
    })

    this.limits = [];
    this.wbar = 3;
  }
}

/** Set graphe type
 *	@param {string} type histogram or distribution
 */
RepartitionGraph.prototype.setType = function(type) {
  this.type = type;
  this.draw();
}

/** Convert pixel to value
 *	@param {number} x
 *	@return {number}
 */
RepartitionGraph.prototype.px2value = function(x) {
  return (x-10)/this.wbar *this.scale + this.stat.limits[0];
};

/** Convert value to pixel
*	@param {number} value
*	@return {number}
*/
RepartitionGraph.prototype.value2px = function(v) {
  return (v - this.stat.limits[0]) * this.wbar / this.scale +10;
};


/** Show new repartition
 * @param {Object} stat
 *  @param {string} mode
 *  @param {Array<number>} values
 *  @param {Array<number>} limits
 *  @param {Array<string>} colors
 */
RepartitionGraph.prototype.setRepartition = function(stat) {
  this.stat = stat;

  function equaltab(t1,t2) {
    if (t1.length !== t2.length) return false;
    return t1.every(function(element, index) {
      return element === t2[index]; 
    });
  }

  this.element.dataset.edit = stat.mode;

  // if (stat.limits && stat.limits.length && stat.limits[0] < stat.limits[stat.limits.length-1]) {
  if (stat.limits && !equaltab(stat.limits, this.limits)) {
    // remove existing
    this.graph.querySelectorAll('.rgMarker').forEach(e => e.remove());
    this.limitDiv.innerHTML = '';

    // Start dragging elements
    let drag = false;
    const dragLimitStart = (id, e) => {
      var px = e.pageX || e.originalEvent.touches[0].pageX;
      drag = {
        id: id, 
        px: px, 
        limit: this.limitDiv.querySelector('.limit_' + id,), 
        elt: e.target, 
        x0: parseFloat(e.target.style.left)
      };
    
      document.addEventListener('mousemove', dragLimitDrag)
      document.addEventListener('touchmove', dragLimitDrag)
      document.addEventListener('mouseup', dragLimitEnd)
      document.addEventListener('touchend', dragLimitEnd)
    }
    // Drag elements
    const dragLimitDrag = (e) => {
      if (drag) {
        var px = e.pageX || e.originalEvent.touches[0].pageX;
        var x = drag.x0 + px - drag.px;
        var v = this.px2value(x);
        if (v < this.limits[drag.id-1]) return;
        if (v > this.limits[drag.id+1]) return;
        drag.elt.style.left = x + 'px';
        this.limits[drag.id] = drag.limit.value = v;
      }
    }
    // Stop dragging
    const dragLimitEnd = () => {
      if (drag) {
        drag = false;
        document.removeEventListener('mousemove', dragLimitDrag)
        document.removeEventListener('touchmove', dragLimitDrag)
        document.removeEventListener('mouseup', dragLimitEnd)
        document.removeEventListener('touchend', dragLimitEnd)
        this.dispatchEvent({ type: 'change:limit', limits: this.limits });
      }
    }

    // Copy current limits
    this.limits = stat.limits.slice();

    // Add limits
    stat.limits.forEach((limit ,i) => {
      // Limits on the graph
      ol_ext_element.create('DIV', {
        className: (i===0 || i === stat.limits.length-1 ? 'disable ' : '' ) + 'rgMarker marker_' + i,
        on: {
          'mousedown touchstart': (e) => {
            console.log(this.stat.mode)
            if (this.stat.mode === 'c') {
              dragLimitStart(i, e);
            }
          }
        },
        parent: this.graph
      });
      // Limit inputs
      ol_ext_element.create('INPUT', {
        className: 'rgLimit limit_' + i,
        value: stat.limits[i],
        change: (e) => {
          const stat = this.stat;
          let n = Number(e.target.value);
          if (i===0) {
            if (n > stat.limits[i+1]) n = stat.limits[i+1];
          } else if (i===stat.limits.length-1) {
            if (n < stat.limits[i-1]) n = stat.limits[i-1];
          } else {
            if (n > stat.limits[i+1]) n = stat.limits[i+1];
            if (n < stat.limits[i-1]) n = stat.limits[i-1];
          }
          e.target.value = n;
          this.limits[i] =  n;
          this.dispatchEvent({ type: 'change:limit', limits: this.limits });
        },
        // Filter numbers only
        on: {
          keydown: e => {
            if (e.key.length === 1) {
              if (e.key === '.') {
                if (/\./.test(this.value)) e.preventDefault();
              } else {
                if (e.key !== '-' && (e.key<'0' || e.key> '9')) e.preventDefault();
              }
            }
          },
          keyup: e => {
            if (e.target.value !== '-') {
              const n = parseFloat(e.target.value.replace(/^-{1,}/, '-'));
              if (n != e.target.value) e.target.value = n || '';
            }
          }
        },
        parent: this.limitDiv
      });
    })
  }
  
  this.draw();
}

/** Dessin du graphe 
 */
RepartitionGraph.prototype.draw = function() {
  if (!this.stat) return;
  var ctx = this.ctx;
  // Clear canvas
  var width = this.canvas.width;
  var height = this.canvas.height;
  ctx.fillStyle = 'transparent';
  ctx.clearRect(0,0,width,height);

  const limits = this.stat.limits;
  if (!limits || !limits.length) {
    return;
  }
  // Get amplitude
  var min = limits[0];
  var max = limits[limits.length-1];
  var amplitude = max - min;
  
  if (!amplitude || !isFinite(amplitude)) {
    return;
  }

  // Prevent crash
  try {
    height -= 20;
    width -= 20;

    const getInterval = function(v) {
      for (let i=1; i<limits.length; i++) {
        if (limits[i] > v) {
          return i-1;
        }
      }
      return limits.length-2;
    }

    var dw = Math.round(width / this.wbar);
    // Calcul des valeurs
    var s = this.scale = amplitude / dw;
    var t = [];
    for (var i=0; i <= dw; i++) {
      t[i] = {
        val: (i+0.5)*s+min,  
        vmin: i*s+min,  
        vmax: (i+1)*s+min,  
        interval: getInterval((i+0.5)*s+min), 
        color: this.stat.colors[getInterval((i+0.5)*s+min)] || '#999', 
        nb:0 
      };
    }

    // Repere 
    ctx.setTransform(1, 0, 0, -1, 10, height+10);
  
    // Smooth histogram
    const smoothHisto = function (t) {
      var t2 = [];
      t2[0] = (t[0].nb+t[1].nb/2)/1.5;
      for (let i=1; i<t.length-1; i++) {
        t2[i] = (t[i].nb + (t[i-1].nb+t[i+1].nb)/2)/2;
      }
      t2[i] = (t[i].nb+t[i-1].nb/2)/1.5;
      for (let i=0; i<t.length; i++) t[i].nb = t2[i];
      return t;
    }

    // Dessin
    var hmax=0;
    this.stat.values.forEach(v => {
      v = Number(v);
      var ii = Math.round((v-min)/s);
      if (t[ii]) {
        t[ii].nb++;
        if (t[ii].nb>hmax) hmax = t[ii].nb;
      }
    })
    if (this.type=="distribution") {
      for (let i=1; i<=dw; i++) {
        t[i].nb += t[i-1].nb;
      }
      hmax = t[dw].nb;
    } else {
      if (this.get('smooth')) t = smoothHisto(t);
    }
    // Draw bars
    for (let i=0; i<=dw; i++) {
      ctx.fillStyle = t[i].color;
      ctx.fillRect(i*this.wbar,0,this.wbar,t[i].nb*height/hmax);
    }

    // Reset limits position
    if (this.stat.limits && this.stat.limits.length) {
      this.stat.limits.forEach((l, i) => {
        this.graph.querySelector('.marker_' + i).style.left = this.value2px(l) + 'px';
      })
    }
  } catch(e) { 
    // console.error(e); 
  }
};


export default RepartitionGraph