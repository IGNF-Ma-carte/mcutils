import ol_Object from 'ol/Object'
import chroma from "chroma-js";
import ol_ext_element from 'ol-ext/util/element';
import ColorPicker from 'ol-ext/util/input/Color'
import { toHexa } from 'ol-ext/util/color';

import './ColorBrewer.css'

// Add Pure colors
chroma.brewer.Pure = ["#d66", "#fa0", "#ff0", "#080", /*"#6ff",*/ "#66f"];

// Bivariate color
chroma.brewer.DkViolet1 = ["#f5fdff", "#b4dae3", "#72b7c8", "#3194ac"];
chroma.brewer.DkViolet2 = ["#fff5fa", "#e4b2b8", "#ca6f75", "#af2c33"];
chroma.brewer.DkBlue1 = ["#f3ffff", "#b0ebea", "#6cd6d5", "#29c2c0"];
chroma.brewer.DkBlue2 = ["#fdecfa", "#e0aad6", "#c468b3", "#a7268f"];
chroma.brewer.BluOr1 = ["#f3fbff", "#abd7ee", "#63b3dd", "#1b8fcc"];
chroma.brewer.BluOr2 = ["#fdede7", "#f3b8a3", "#e98260", "#df4d1c"];
chroma.brewer.Brown1 = ["#fffcee", "#ede2a9", "#dcc965", "#caaf20"];
chroma.brewer.Brown2 = ["#f1e6f7", "#cca6de", "#a666c5", "#8126ac"];
chroma.brewer.Berlin1 = ["#e9f4fd", "#aad5f2", "#6bb7e6", "#2c98db"];
chroma.brewer.Berlin2 = ["#fff2f1", "#f8baba", "#f28382", "#eb4b4b"];


/** Color brewer control
 * @memberof mcutils.control
 * @constructor
 * @extends {ol_Object}
 * @param {Object} options
 *  @param {Element} target element to place in
 *  @param {number} [size=5] color size
 *  @param {Array<string>} colors a list of color to initialize
 */
class ColorBrewer extends ol_Object {
  constructor(options) {
    options = options || {};
    super(options);
    this.set('size', options.size || 5);
    this.colors = [];
    this.elements = {};
    const element = this.element = ol_ext_element.create('DIV', {
      className: 'color-brewer',
      'data-type': 'colored',
      parent: options.target
    })
    // Type menu select
    const cbrType = ol_ext_element.create('DIV', {
      className: 'cbr-type',
      parent: element
    })
    ol_ext_element.create('LABEL', {
      text: 'Couleurs :',
      parent: cbrType
    })
    const select = this.elements.type = ol_ext_element.create('SELECT', {
      change: () => {
        element.dataset.type = select.value;
        if (select.value === 'custom') {
          this._custom = true;
          this.elements.schemes.querySelectorAll('.selected').forEach(elt => elt.className = '');
        }      
        this._showColors(this.elements.colors, this.getScheme(), this.get('size'));
      },
      parent: cbrType
    })
    // Theme color list
    this.elements.schemes = ol_ext_element.create('DIV', {
      className: 'cbr-scheme',
      parent: element
    })
    Object.keys(ColorBrewer.types).forEach(k => {
      ol_ext_element.create('OPTION', {
        value: k,
        text: ColorBrewer.types[k].title,
        parent: this.elements.type
      })
      const div = ol_ext_element.create('DIV', {
        className: k,
        parent: this.elements.schemes
      })      
      ColorBrewer.types[k].scheme.forEach(sc => {
        const d = ol_ext_element.create('DIV', {
          'data-scheme': sc,
          title: sc,
          click: () => {
            this.setScheme(sc);
          },
          parent: div
        })
        this._showColors(d, sc);
      })
    })
    // Custom scheme
    this.elements.custom = this.elements.schemes.querySelector('.custom');
    this.picker = new ColorPicker({
      hastab: true,
      position: 'inline',
      opacity: false,
      parent: this.elements.custom
    })
    this.picker.on('color', (e) => {
      const color = this.colors[this.currentColor] = toHexa(e.color);
      if (this._custom && this.currentBox && this.currentBox.dataset.color !== color) {
        this.currentBox.style.backgroundColor = color;
        this.currentBox.dataset.color = color;
        this.dispatchEvent({ type: 'change:color' });
      }
    })
    // Modifiers
    this.elements.modifiers = ol_ext_element.create('DIV', {
      className: 'cbr-modifiers',
      parent: element
    })
    // Saturate
    const sat = ol_ext_element.createCheck({
      className: 'small',
      after: '+saturé',
      parent: this.elements.modifiers
    })
    sat.addEventListener('change', (e) => { 
      this.set('saturate', e.target.checked);
      this.dispatchEvent({ type: 'check', property: 'saturate', checked: e.target.checked});
    });
    // Saturate
    const dark = ol_ext_element.createCheck({
      className: 'small',
      after: '+sombre',
      parent: this.elements.modifiers
    })
    dark.addEventListener('change', (e) => { 
      this.set('darken', e.target.checked);
      this.dispatchEvent({ type: 'check', property: 'darken', checked: e.target.checked});
    });
    // Revers
    const revers = ol_ext_element.createCheck({
      className: 'small',
      after: 'inverser',
      parent: this.elements.modifiers
    })
    revers.addEventListener('change', (e) => { 
      this.set('revers', e.target.checked);
      this.dispatchEvent({ type: 'check', property: 'revers', checked: e.target.checked});
    });
    // Set default current theme / colors
    this.elements.colors = ol_ext_element.create('DIV', {
      className: 'cbr-colors',
      parent: element
    })
    ol_ext_element.create('BUTTON', {
      text: 'dégradé',
      className: 'button button-ghost',
      click: () => {
        let colors = [];
        for (let i=0; i<this.colorBR.length-1; i++) {
          colors.pop();
          const tab = [this.colors[this.colorBR[i]],this.colors[this.colorBR[i+1]]];
          const size = this.colorBR[i+1] - this.colorBR[i] + (this.colorBR.length > 1 ? 1 : 0);
          colors = colors.concat(chroma.scale(tab).colors(size));
        }
        const equalColors = (this.colors.length === colors.length)
          && this.colors.every(function(element, index) {
            return element === colors[index]; 
          });
        if (!equalColors) {
          this.colors = colors;
          this._showColors(this.elements.colors, this.getScheme(), this.get('size'));
          this.dispatchEvent({ type: 'change:color' });
        }
      },
      parent: ol_ext_element.create('DIV', {
        className: 'cbr-gradient',
        parent: element
      })
    })
    this.setScheme('Oranges');
    this.setColors(options.colors);
    // Update on change properties
    this.on('propertychange', () => {
      this._updateColors();
    })
  }
}

/** Set the current scheme
 * @param {string} scheme
 */
ColorBrewer.prototype.setScheme = function(scheme) {
  const sc = this.elements.schemes.querySelector('[data-scheme="'+scheme+'"]')
  if (sc && (this.element.dataset.scheme !== scheme || this._custom)) {
    this._custom = false;
    this.element.dataset.scheme = scheme;
    this.elements.schemes.querySelectorAll('.selected').forEach(elt => elt.className = '');
    sc.className = 'selected';
    this._showColors(this.elements.colors, scheme, this.get('size'));
    this.dispatchEvent({
      type: 'change:scheme',
      scheme: scheme
    })
  }
}

/** Get the current scheme
 * @returns {string} scheme
 */
ColorBrewer.prototype.getScheme = function() {
  return this.element.dataset.scheme;
}

/** Set color size
 * @param {number} size
 */
ColorBrewer.prototype.setSize = function(size) {
  size = parseInt(size);
  if (size && size !== this.get('size')) {
    this.set('size', size);
    if (!this._custom) {
      this.dispatchEvent({ type: 'change:color' });
    }
  }
}

/** Update colors
 * @private
 */
ColorBrewer.prototype._updateColors = function() {
  this.elements.schemes.querySelectorAll('.cbr-scheme [data-scheme]').forEach(d => {
    this._showColors(d, d.dataset.scheme);
  })
  this._showColors(this.elements.colors, this.getScheme(), this.get('size'));
}

/** Display colors
 * @param {Element} div
 * @param {string} scheme
 * @param {number} [nb=5]
 * @private
 */
ColorBrewer.prototype._showColors = function(div, scheme, nb) {
  const custom = (div===this.elements.colors && this._custom);
  nb = nb || 5;
  let colors = chroma.brewer[scheme];
  // Custom colors
  if (custom) {
    if (!this.colorBR.length) {
      this.colorBR = [0, this.colors.length-1];
      this.currentColor = 0;
    }
    if (this.colors.length > nb) {
      while (this.colors.length > nb) this.colors.pop();
      this.colorBR = [0, this.colors.length-1];
    } else if (this.colors.length < nb) {
      const c = this.colors.pop();
      for (let i=this.colors.length; i<nb; i++) this.colors.push(c);
      this.colorBR = [0, this.colors.length-1];
    }
    colors = this.colors;
  } else {
    this.colorBR = [];
    colors = chroma.scale(colors).colors(nb);
    if (this.get('revers')) colors = colors.slice().reverse();
    if (this.element.dataset.type !== 'custom') this.colors = colors;
  }
  div.innerHTML = '';
  colors.forEach((c, i) => {
    if (!custom) {
      if (this.get('saturate')) colors[i] = chroma(colors[i]).saturate(2).hex();
      if (this.get('darken')) colors[i] = chroma(colors[i]).darken().hex();
    }
    const className = [];
    if (this.colorBR.indexOf(i) >= 0) className.push('br')
    if (i === this.currentColor) {
      this.picker.setColor(colors[i]);
      className.push('selected')
    }
    const cbox = ol_ext_element.create('DIV', {
      className: className.join(' '),
      'data-index': i,
      'data-color': colors[i],
      style: {
        backgroundColor: colors[i]
      },
      parent: div
    })
    if (custom) {
      if (i === this.currentColor) this.currentBox = cbox;
      cbox.addEventListener('click', () => {
        this.selectColor(i);
        if (i!==0 && i!==nb-1) cbox.classList.toggle('br');
        // Br
        this.colorBR = [];
        div.querySelectorAll('.br').forEach(b => {
          this.colorBR.push(parseInt(b.dataset.index));
        })
      })
    } else {
      this.currentBox = false;
    }
  })
};

/** Get current colors in the brewer
 * @returns {Array<string>} a list of colors
 */
ColorBrewer.prototype.getColors = function() {
  return this.colors;
}

/** Set current colors in the brewer
 * @param {Array<string>} colors 
 */
ColorBrewer.prototype.setColors = function(colors) {
  if (colors && colors instanceof Array) {
    this.set('size', colors.length, true);
    this.colors = colors;
    this.setType('custom');
    this._updateColors();
  }
};

/** Select a color
 * @param {number} c color index (manual mode)
 */
ColorBrewer.prototype.selectColor = function(c) {
  const div = this.elements.colors
  const cbox = div.querySelector('[data-index="'+c+'"]')
  if (cbox) {
    div.querySelectorAll('div').forEach(d => {
      d.classList.remove('selected')
    })
    cbox.classList.add('selected');
    this.currentColor = c;
    this.currentBox = cbox;
    this.picker.setColor(cbox.dataset.color);
  }
};

/** Set brewer type
 * @param {string} type 
 */
ColorBrewer.prototype.setType = function(type) {
  if (ColorBrewer.types[type] && this.element.dataset.type !== type) {
    this.elements.type.value = this.element.dataset.type = 'custom';
    this._custom = true;
    this.elements.type.dispatchEvent(new Event('change'))
  }
}

/** Color brewer types
 */
ColorBrewer.types = {
  colored: {
    title: 'coloré',
    scheme: ["Oranges", "Blues", "Greens", "Purples", "Reds", "Greys"]
  },
  sequential: {
    title: 'séquentiel',
    scheme: ["BuGn", "BuPu", "GnBu", "OrRd", "PuBu", "PuBuGn", "PuRd", "RdPu", "YlGn", "YlGnBu", "YlOrBr", "YlOrRd"]
  },
  diverging: {
    title: 'divergent',
    scheme: ["BrBG", "PiYG", "PRGn", "PuOr", "RdBu", "RdGy", "RdYlBu", "RdYlGn", "Spectral"]
  },
  qualitative: {
    title: 'qualitatif',
    scheme: ["Accent", "Dark2", "Paired", "Pastel1", "Pastel2", "Set1", "Set2", "Set3", "Pure"]
  },
  bivariate: {
    title: 'bivarié',
    scheme: ["DkViolet1", "DkViolet2", "DkBlue1", "DkBlue2", "BluOr1", "BluOr2", "Brown1", "Brown2", "Berlin1", "Berlin2"]
  },
  custom: {
    title: 'manuel',
    scheme: []
  }
};


export default ColorBrewer
