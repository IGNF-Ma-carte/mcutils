import PopupBase from 'ol-ext/util/input/PopupBase'

import ol_style_FillPattern from 'ol-ext/style/FillPattern'
import ol_ext_element from 'ol-ext/util/element';

import './PopupPattern.css'

// Array of patterns id
const patterns = Object.keys(ol_style_FillPattern.prototype.patterns || ol_style_FillPattern.patterns);
patterns.unshift('');

// List of style parameters
const styleParams = {
  size: 'Taille', 
  spacing: 'Espacement',
  angle: 'Angle',
  offset: 'Décalage',
  scale: 'Echelle'
}

/** Input to select symbols in a popup
 * @memberof mcutils.input
 * @extends {PopupBase}
 * @param {Object} options a list of options
 *  @param {Element} options.input the input
 *  @param {string} [option.symbol='ign-form-poi'] the current symbol
 *  @param {booelan} [options.position='fixed'] popup position on the page
 */
 class PopupPattern extends PopupBase {
  constructor(options) {
    options = options || {};
    if (!options.position) options.position = 'fixed';
    options.className = 'popup-pattern';
    super(options);
    // Pattern
    this._elt.pattern = ol_ext_element.create('DIV', {
      className: 'ol-vignet',
      parent: this.element
    })
    // List
    const ul = ol_ext_element.create('UL', {
      parent: this._elt.popup
    })
    // Add patterns
    patterns.forEach(k => {
      const p = new ol_style_FillPattern({ pattern: k });
      ol_ext_element.create('LI', {
        title: k,
        className: k||'none',
        style: {
          backgroundImage: k ? 'url("' + p.getImage().toDataURL()+'")' : ''
        },
        click: () => {
          this.setPattern(k);
        },
        parent: ul
      })
    })
    // Parameters
    const param = ol_ext_element.create('DIV', {
      className: 'parameters',
      parent: this._elt.popup
    })
    ol_ext_element.create('P', {
      html: 'Paramètres :',
      className: 'param-title',
      parent: param
    })
    const opt = this.getOptions();
    Object.keys(styleParams).forEach(k => {
      ol_ext_element.create('LABEL', { 
        html: styleParams[k], 
        className: k,
        parent: param 
      });
      if (k==='angle') {
        const i = ol_ext_element.createCheck({ 
          type: 'checkbox',
          className: k + ' small',
          parent: param,
        });
        i.addEventListener('change', () => {
          this.setAngle(i.checked ? 1 : 0);
          i.nextSibling.value = (i.checked ? 1 : 0);
        });
      }
      ol_ext_element.create('INPUT', { 
        type: 'number',
        className: k,
        value: opt[k],
        min: 0,
        step: (k==='scale' ? .1 : 0),
        change: (e) => {
          this.set(k, parseFloat(e.target.value));
          if (k==='angle') e.target.previousSibling.querySelector('input').checked = (e.target.value != 0);
          this.setValue();
        },
        parent: param 
      });
    })
    ol_ext_element.create('BUTTON', { 
      html: 'OK',
      className: 'button button-colored',
      click: () => {
        this.collapse(true);
      },
      parent: param 
    });
  }
}

/** Set pattern 
 * @param {string} p
 */
PopupPattern.prototype.setPattern = function(p) {
  if (patterns.indexOf(p) < 0) return;
  this.set('pattern', p);
  this.element.dataset.pattern = p;
  this.element.querySelectorAll('li').forEach( li => delete li.dataset.selected);
  this.element.querySelector('li.'+(p||'none')).dataset.selected = '';
  this.setValue();
}

/** Set pattern size
 * @param {number} s
 */
PopupPattern.prototype.setSize = function(s) {
  this.set('size', s);
  this.element.querySelector('input.size').value = s;
  this.setValue();
}

/** Set pattern spacing
 * @param {number} s
 */
PopupPattern.prototype.setSpacing = function(s) {
  this.set('spacing', s);
  this.element.querySelector('input.spacing').value = s;
  this.setValue();
}

/** Set pattern angle
 * @param {number} s
 */
PopupPattern.prototype.setAngle = function(s) {
  this.set('angle', s);
  this.element.querySelector('.ol-ext-check.angle input[type="checkbox"]').checked = (s!=0); 
  this.element.querySelector('input[type="number"].angle').value = s;
  this.setValue();
}

/** Set pattern offset
 * @param {number} s
 */
PopupPattern.prototype.setOffset = function(s) {
  this.set('offset', s);
  this.element.querySelector('input.offset').value = s;
  this.setValue();
}

/** Set pattern scale
 * @param {number} s
 */
PopupPattern.prototype.setScale = function(s) {
  this.set('scale', s);
  this.element.querySelector('input.scale').value = s;
  this.setValue();
}

/** Get pattern options
 * @returns {Object}
 */
PopupPattern.prototype.getOptions = function() {
  const opt = {
    pattern: this.get('pattern') || '',
    size: this.get('size') || 5,
    spacing: this.get('spacing') || 10,
    angle: this.get('angle') || 0,
    offset: this.get('offset') || 0,
    scale: this.get('scale') || 1
  }
  if (opt.pattern !== 'hatch') opt.angle = (opt.angle > 0 ? 1 : 0);
  return opt;
};

/** Change the current value
 * @param {string} value 
 */
PopupPattern.prototype.setValue = function(value) {
  if (value) {
    if (typeof(value)==='string') {
      const t = value.split('-');
      value = {
        pattern: t[0] || '',
        size: t[1] || 5,
        spacing: t[2] || 10,
        angle: t[3] || 0,
        offset: t[4] || 0,
        scale: t[5] || 1
      }
    }
    this.setPattern(value.pattern);
    this.setSize(value.size);
    this.setSpacing(value.spacing);
    this.setAngle(value.angle);
    this.setOffset(value.offset);
    this.setScale(value.scale);
  }
  const opt = this.getOptions();
  // Format value
  value = '';
  Object.keys(opt).forEach(k => value += (value ? '-':'') + opt[k])
  // Change
  if (this.input.value !== value) {
    this.input.value = value;
    const p = new ol_style_FillPattern(opt);
    this._elt.pattern.style.backgroundImage = opt.pattern ? 'url("' + p.getImage().toDataURL()+'")' : '';
    opt.type = 'change';
    this.dispatchEvent(opt);
  }
};

export default PopupPattern
