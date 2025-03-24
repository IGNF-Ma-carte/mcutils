import olObject from 'ol/Object'
import InputMedia from '../control/InputMedia';
import SizeInput from 'ol-ext/util/input/Size';
import WidthInput from 'ol-ext/util/input/Width';
import DashInput from './PopupDash'

import { defaultIgnStyle, pointFrameList, symbolFormList, textFontList } from '../style/ignStyle'
import help from './formStyleHelp'

import '../font/loadFonts'

import PopupSymbol from './PopupSymbol';
import ColorInput from 'ol-ext/util/input/Color'
import ol_ext_element from 'ol-ext/util/element'
import charte from '../charte/charte';
import helpDialog from '../dialog/helpDialog'
import PopupPattern from './PopupPattern';
import PopupArrow from './PopupArrow';
import SymbolLib from '../style/SymbolLib';
import dialog from '../dialog/dialogMessage';
import SymbolLibInput from './SymbolLibInput';
import _T from '../i18n/i18n';

import './page-FormStyle.css'
import content from './page-FormStyle.html'

const tab = { point: 'Point', line: 'LineString', polygon: 'Polygon' };

/** Form to update Macarte styles
 * @memberof mcutils.input
 * @extends {olObject}
 * @param {Object} options a list of options
 *  @param {Element} options.target the input target element
 *  @param {Object} options.style current style (or use setStyle)
 *  @param {boolean|string} [options.preview=false] preview position: bottom, left, right (default no preview)
 *  @param {Collection<symbolLib>} [options.symbolLib] a symbol lib
 */
class FormStyle extends olObject {
  constructor(options) {
    // Create object
    super();
    this._style = Object.assign({}, defaultIgnStyle);
    this._inputs = {};

    // Create form
    const element = this.element = ol_ext_element.create('DIV', {
      html: content,
      parent: options.target
    });
    element.className = '';
    element.dataset.formstyle = '';

    // Initialize
    charte.initTabList(element)

    this._initFormCommon(element, options);
    this._initFormPointSymbol(element, options);
    this._initFormPointText(element, options);
    this._initFormDraw(element, options);

    charte.setInputPlaceholder();

    // set current style
    this.setStyle(options.style || defaultIgnStyle)

    // Symbol lib
    if (options.symbolLib) {
      helpDialog(element.querySelector('.symbolLib h3'), _T('mc-help-symbolLib'), { className: 'medium' });
      // Select symbol 
      element.querySelector('.symbolLib button.lib').addEventListener('click', () => {
        const symbolList = new SymbolLibInput({
          filter: tab[element.className] ? [tab[element.className]] : undefined,
          symbolLib: options.symbolLib
        })
        const setSymbol = (s) => {
          const style = s.getIgnStyle();
          this.setStyle(style, true);
          Object.keys(style).forEach(k => {
            this.dispatchEvent({ type: 'change', attr: k, value: style[k] })
          })
        };
        dialog.show({
          title: 'Bibliothèque de symboles',
          className: 'symbolLib',
          content: symbolList.element,
          buttons: { ok: 'Utiliser', cancel: 'annuler'},
          onButton: (b) => {
            if (b==='ok') {
              setSymbol(symbolList.getSelect());
            }
          }
        })
        dialog.element.querySelector('.ol-buttons input').disabled = true;
        symbolList.on(['item:select','item:remove'], (e) => {
          dialog.element.querySelector('.ol-buttons input').disabled = e.type!=='item:select';
        })
        symbolList.on('item:dblclick', () => {
          setSymbol(symbolList.getSelect());
          dialog.close();
        })
        symbolList.on('item:duplicate', (e) => {
          FormStyle.addSymbolLibDialog(options.symbolLib, e.item, s => {
            setSymbol(s)
          })
        })
        const removeCollection = () => { 
          symbolList.removeCollection();
          dialog.un('hide', removeCollection)
        }
        dialog.on('hide', removeCollection)
      });
      // Add symbol to lib
      element.querySelector('.symbolLib button.add').addEventListener('click', () => {
        this.addSymbol(options.symbolLib)
      });
      // Create a new symbol in the lib
      element.querySelector('.symbolLib .lib button.lib').addEventListener('click', () => {
        FormStyle.showDialogEditor(options.symbolLib)
      })
    } else {
      element.querySelector('.symbolLib').className = 'noSymbolLib';
    }

    // Handle preview
    if (options.preview) {
      this.element.querySelector('.preview').classList.add('visible');
      this.element.dataset.preview = options.preview;
    }
    const preview = this._preview = [];
    const types = {
      Point: {
        margin: 0,
        size: [100, 100]
      },
      LineString: {
        margin: 5,
        size: [90, 90]
      },
      Polygon: {
        margin: 10,
        size: [60, 40]
      },
    }
    Object.keys(types).forEach(k => {
      preview.push ({
        symbol: new SymbolLib({
          type: k,
          style: this.getStyle(),
          margin: types[k].margin,
          size: types[k].size
        }),
        element: this.element.querySelector('.preview .' + k)
      })
    })
    preview.forEach(p => {
      p.element.querySelector('div').appendChild(p.symbol.getImage())
    })
    // Delay update on change
    let tout;
    this.on('change', (e) => {
      if (/width|radius|size|offset/i.test(e.attr)) {
        this._style[e.attr] = Number(e.value);
      } else {
        this._style[e.attr] = e.value;
      }
      if (tout) clearTimeout(tout)
      tout = setTimeout(() => {
        preview.forEach(p => {
          p.symbol.setIgnStyle(this.getStyle());
        })
      });
    })
  }
}

/** Add a new symbol to the symbol lib
 * @param {Collection<SymbolLib>} symbolLib SymbolLib to update
 * @param {function} [cback] a function that takes a SymbolLib
 */
FormStyle.prototype.addSymbol = function(symbolLib, cback) {
  const type = tab[this.element.className];
  if (!type) return;
  const symb = new SymbolLib({
    name: '',
    style: this.getStyle(),
    type: type
  });
  dialog.show({
    title: 'Ajouter à la bibliothèque',
    content: 'Nom du symbole : <input class="name" type="text" />',
    className: 'addSymbolLib',
    buttons: { submit: 'ajouter', cancel: 'annuler'},
    onButton: (b, inputs) => {
      if (b==='submit') {
        symb.set('name', inputs.name.value);
        symbolLib.push(symb);
        dialog.hide();
        if (typeof(cback) === 'function') cback(symb)
      }
    }
  })
  dialog.getContentElement().appendChild(symb.getImage());
}

/** Dispatch event (if not silence)
 */
FormStyle.prototype.dispatchEvent = function(event) {
  if (!this._silence) {
    olObject.prototype.dispatchEvent.call(this, event)
  }
};

/** Form for symbol section of points
 * @private
 */
FormStyle.prototype._initFormPointSymbol = function(element) {
  // Point type
  const pointType = this._inputs.pointType = element.querySelector('[data-type="symbol"] select')
  pointType.addEventListener('change', () => {
    switch (pointType.value) {
      case 'label': {
        this._inputs.pointRadius.setValue(0);
        break;
      }
      case 'symbol': {
        this._inputs.pointIcon.setValue('');
      }
      //@fallthrough
      default: {
        if (!this.getStyle().pointRadius) {
          this._inputs.pointRadius.setValue(defaultIgnStyle.pointRadius);
        }
        break;
      }
    }
    this.element.dataset.pointType = pointType.value;
  })

  // pointIcon = media
  this._inputs.pointIcon = new InputMedia({ 
    thumb: true,
    add: true,
    useCors: true,
    input: element.querySelector('[data-attr="pointIcon"] input')
  });
  /* test cors ? */
  this.setDispatch('pointIcon', true);
  /*/
  this._inputs.pointIcon.on('load', () => {
    if (!this.silence) {
      this.dispatchEvent({ type:'change', attr: 'pointCors', value: this._inputs.pointIcon.get('cro') })
      this.dispatchEvent({ type:'change', attr: 'pointIcon', value: input.getValue() })
    }
  })
  /**/

  // pointFrame
  this._inputs.pointFrame = element.querySelector('[data-attr="pointFrame"] select'); 
  Object.keys(pointFrameList).forEach(k => {
    ol_ext_element.create('OPTION' ,{
      value: k,
      html: pointFrameList[k].title,
      parent: this._inputs.pointFrame
    })
  })
  this._inputs.pointFrame.addEventListener('change', () => {
    this.element.dataset.frame = this._inputs.pointFrame.value || 'none';
  })
  this.setDispatch('pointFrame');             

  // pointCrop
  this._inputs.pointCrop = element.querySelector('[data-attr="pointCrop"] input');
  this._inputs.pointCrop.addEventListener('change', () => {
    this.dispatchEvent({ type:'change', attr: 'pointCrop', value: this._inputs.pointCrop.checked })
  })

  // pointStrokeWidth
  this._inputs.pointStrokeWidth = new WidthInput({
    input: element.querySelector('[data-attr="pointStrokeWidth"] input') 
  })
  this.setDispatch('pointStrokeWidth', true);

  // pointRadius
  this._inputs.pointRadius = new SizeInput({
    input: element.querySelector('[data-attr="pointRadius"] input') 
  })
  this.setDispatch('pointRadius', true);

  // pointGlyph
  this._inputs.pointGlyph = new PopupSymbol({
    input: element.querySelector('[data-attr="pointGlyph"] input')
  })
  this._inputs.pointGlyph.on('select', () => {
    this.dispatchEvent({ type:'change', attr: 'pointGlyph', value: this._inputs.pointGlyph.getValue() })
  })

  // symbolColor
  this._inputs.symbolColor = new ColorInput({
    input: element.querySelector('[data-attr="symbolColor"] input'),
    position: 'fixed'
  })
  this.setDispatch('symbolColor', true);

  // poinForm
  this._inputs.pointForm = element.querySelector('[data-attr="pointForm"] select'); 
  Object.keys(symbolFormList).forEach(k => {
    ol_ext_element.create('OPTION' ,{
      value: k,
      html: symbolFormList[k].title,
      parent: this._inputs.pointForm
    })
  })
  this.setDispatch('pointForm');
  const hashtab = {
    shield: 'bouclier',
    circle: 'rond',
    square: 'carre',
    hexagon: 'hexagone',
    lozenge: 'carre lozenge',
    bubble: 'bulle',
    coma: 'virgule',
    sign: 'triangle triangle',
    ban: 'rond',
  }
  this._inputs.pointForm.addEventListener('change', (e) => {
    e.target.previousSibling.className = 'ign-form-' + (hashtab[e.target.value] || e.target.value);
  })

  // pointStrokeColor 
  this._inputs.pointStrokeColor = new ColorInput({
    input: element.querySelector('[data-attr="pointStrokeColor"] input'),
    position: 'fixed'
  })
  this.setDispatch('pointStrokeColor', true);

  // pointColor
  this._inputs.pointColor = new ColorInput({
    input: element.querySelector('[data-attr="pointColor"] input'),
    position: 'fixed'
  })
  this.setDispatch('pointColor', true);

  // pointGradient
  this._inputs.pointGradient = element.querySelector('[data-attr="pointGradient"] input');
  this._inputs.pointGradient.addEventListener('change', () => {
    this.dispatchEvent({ type:'change', attr: 'pointGradient', value: this._inputs.pointGradient.checked })
  })
}

/** Form for text section of points
 * @private
 */
FormStyle.prototype._initFormPointText = function(element) {
  element.querySelectorAll('i[data-help]').forEach(h => {
    helpDialog(h, help[h.dataset.help], { className: 'medium' });
  })

  // labelAttribute 
  this._inputs.labelAttribute = element.querySelector('[data-attr="labelAttribute"] textarea');
  this.setDispatch('labelAttribute');

  // textColor 
  this._inputs.textColor = new ColorInput({
    input: element.querySelector('[data-attr="textColor"] input'),
    position: 'fixed'
  })
  this.setDispatch('textColor', true);

  // textSize
  this._inputs.textSize = element.querySelector('[data-attr="textSize"] input');
  this.setDispatch('textSize');

  // textFont
  this._inputs.textFont = element.querySelector('[data-attr="textFont"] select'); 

  Object.keys(textFontList).forEach(k => {
    ol_ext_element.create('OPTION' ,{
      value: textFontList[k].font,
      style: { fontFamily: textFontList[k].font },
      html: textFontList[k].title,
      parent: element.querySelector('[data-attr="textFont"] select')
    })
  })
  this.setDispatch('textFont');
  this._inputs.textFont.addEventListener('change', () => {
    this._inputs.textFont.style.fontFamily = this._inputs.textFont.value; 
  })

  // textAlign 
  this._inputs.textAlign = element.querySelector('[data-attr="textAlign"] select');
  const align = {
    right: 'à gauche / fin',
    center: 'centré',
    left: 'à droite / début'
  };
  Object.keys(align).forEach(k => {
    ol_ext_element.create('OPTION', {
      class: k,
      value: k,
      html: align[k],
      parent:this._inputs.textAlign,
    })
  })
  this.setDispatch('textAlign');

  // textBaseline 
  this._inputs.textBaseline = element.querySelector('[data-attr="textBaseline"] select'); 
  const baseline = {
    bottom: 'en haut',
    middle: 'centré',
    top: 'en bas'
  };
  Object.keys(baseline).forEach((k) => {
    ol_ext_element.create('OPTION', {
      class: k,
      value: k,
      html: baseline[k],
      parent:this._inputs.textBaseline,
    })
  })
  this.setDispatch('textBaseline');

  // textFillColor
  this._inputs.textBgFill = new ColorInput({
    input: element.querySelector('[data-attr="textBgFill"] input'),
    position: 'fixed'
  })
  this.setDispatch('textBgFill', true);
  
  // textBgStroke
  this._inputs.textBgStroke = new ColorInput({
    input: element.querySelector('[data-attr="textBgStroke"] input'),
    position: 'fixed'
  })
  this.setDispatch('textBgStroke', true);
  
  // textPlacement
  this._inputs.textPlacement = element.querySelector('[data-attr="textPlacement"] input');
  this._inputs.textPlacement.addEventListener('change', () => {
    this.dispatchEvent({ type:'change', attr: 'textPlacement', value: this._inputs.textPlacement.checked ? 'line' : 'point' })
  })
  // textOverflow
  this._inputs.textOverflow = element.querySelector('[data-attr="textOverflow"] input');
  this._inputs.textOverflow.addEventListener('change', () => {
    this.dispatchEvent({ type:'change', attr: 'textOverflow', value: this._inputs.textOverflow.checked})
  })
}

/** Form for common params
 * @private
 */
FormStyle.prototype._initFormCommon = function(element) {
  this._inputs.zIndex = element.querySelector('[data-attr="zIndex"] input'),
  this.setDispatch('zIndex')
}

/** Form for draw section of stroke
 * @private
 */
FormStyle.prototype._initFormDraw = function(element) {
  // strokeColor
  this._inputs.strokeColor = new ColorInput({
    input: element.querySelector('[data-attr="strokeColor"] input'),
    position: 'fixed'
  })
  this.setDispatch('strokeColor', true)

  // fillColor 
  this._inputs.fillColor = new ColorInput({
    input: element.querySelector('[data-attr="fillColor"] input'),
    position: 'fixed'
  })
  this.setDispatch('fillColor', true);

  // fillPattern 
  this._inputs.fillPattern = new PopupPattern({
    input: element.querySelector('[data-attr="fillPattern"] input')
  })
  this._inputs.fillPattern.on('change', (pattern) => {
    if (pattern.pattern) this.element.dataset.pattern = '';
    else delete this.element.dataset.pattern;
    this.dispatchEvent({ type:'change', attr: 'fillPattern', value: pattern.pattern })
    this.dispatchEvent({ type:'change', attr: 'sizePattern', value: pattern.size })
    this.dispatchEvent({ type:'change', attr: 'spacingPattern', value: pattern.spacing })
    this.dispatchEvent({ type:'change', attr: 'anglePattern', value: pattern.angle })
    this.dispatchEvent({ type:'change', attr: 'offsetPattern', value: pattern.offset })
    this.dispatchEvent({ type:'change', attr: 'scalePattern', value: pattern.scale })
  })
  // fillColorPattern 
  this._inputs.fillColorPattern = new ColorInput({
    input: element.querySelector('[data-attr="fillColorPattern"] input'),
    position: 'fixed'
  })
  this.setDispatch('fillColorPattern', true);

  // strokeWidth
  this._inputs.strokeWidth = new WidthInput({
    input: element.querySelector('[data-attr="strokeWidth"] input'),
    position: 'fixed'
  })
  this.setDispatch('strokeWidth', true);

  // strokeDash
  this._inputs.strokeDash = new DashInput({
    input: element.querySelector('[data-attr="strokeDash"] input') 
  })
  this.setDispatch('strokeDash', true)

  // strokeArrow
  this._inputs.strokeArrow = new PopupArrow({ 
    input: element.querySelector('[data-attr="strokeArrow"] input')
  });
  this.setDispatch('strokeArrow', true);
}

/** Add event on input and dispatch on change
 * @param {string} name 
 * @private
 */
FormStyle.prototype.setDispatch = function(name, isinput) {
  const input = isinput ? this._inputs[name].input : this._inputs[name];
  if (!input) {
    return;
  }
  const listener = input.on ? 'on' : 'addEventListener';
  input[listener]('change', () => {
    let val = input.getValue ? input.getValue() : input.value;
    if (name === 'labelAttribute') val = val.replace(/\n{1,}$/g, '');
    if (!this.silence) {
      this.dispatchEvent({ type:'change', attr: name, value: val })
    }
  })
}

/** Set style associated with a feature
 * @param {Feature} feature
 */
FormStyle.prototype.setFeature = function(feature) {
  const style = feature.getIgnStyle(true);
  if (feature.getIgnStyle().pointGlyph && !feature.getIgnStyle().pointIcon) style.pointIcon = '';
  this.setStyle(style);
  this._preview.forEach(p => p.symbol.setFeatureProperties(feature.getProperties()) );
};

/** Set current style and display in the form
 * @param {Object} style
 * @param {boolean} silence if true don't change point style type
 */
FormStyle.prototype.setStyle = function(style, silence) {
  this._silence = silence;
  if (!silence) {
    // Get point style type
    if (!style.pointRadius) {
      this._inputs.pointType.value = 'label';
    } else if (style.pointIcon) {
      this._inputs.pointType.value = 'image';
    } else {
      this._inputs.pointType.value = 'symbol';
    }
    this.element.dataset.pointType = this._inputs.pointType.value;
  }

  // Set input value
  for (let k in style) {
    if (k === 'textPlacement') {
      this._inputs[k].checked = style[k] === 'line';
    } else if (k === 'fillPattern') {
      this._inputs.fillPattern.setValue({
        pattern: style.fillPattern,
        size: style.sizePattern,
        spacing: style.spacingPattern,
        angle: style.anglePattern,
        offset: style.offsetPattern,
        scale: style.scalePattern
      })
    } else if (this._inputs[k]) {
      if (this._inputs[k].setColor) {
        this._inputs[k].setColor(style[k]);
      } else if (this._inputs[k].type === 'checkbox') {
        this._inputs[k].checked = style[k];
      } else if (this._inputs[k].setValue) {
        this._inputs[k].setValue(style[k]);
      } else {
        charte.setInputValue(this._inputs[k], style[k]);
      }
    }
    this._style[k] = style[k];
  }
  this._silence = false;
};

/** Get currnet style
 * @return {Object} style
 */
FormStyle.prototype.getStyle = function() {
  return this._style;
};

/** Set geom type
 * @param {string[]} [type] Point,Line,Polygon default all geom
 */
FormStyle.prototype.setTypeGeom = function(type) {

  // const ongletElt = this.element.querySelector('.onglets')
  this.element.className = '';
  if (!type) charte.setTabList(this.element, '')
  
  // Display onglets
  if (/polygon/i.test(type)) {
    this.element.classList.add('polygon')
    if (this.element.dataset.tab !== 'text'){
      charte.setTabList(this.element, 'stroke')
    }
  } 
  if (/line/i.test(type)) {
    this.element.classList.add('line')
    if (this.element.dataset.tab !== 'text'){
      charte.setTabList(this.element, 'stroke')
    }
  } 
  if (/point/i.test(type)) {
    this.element.classList.add('point')
    if (this.element.dataset.tab !== 'text' || this.element.dataset.pointType === 'label'){
      charte.setTabList(this.element, 'symbol')
    }
  }
}

/** Display a dialog to create a new symbol in a SymbolLib
 * @param {Collection<SymbolLib>} symbolLib SymbolLib to update
 * @param {SymbolLib} symbol Default symbol
 * @param {function} [cback] a function that takes a SymbolLib
 */
FormStyle.addSymbolLibDialog = function(symbolLib, symbol, cback) {
  // Select geometry
  const select = ol_ext_element.create('SELECT');
  ['Point', 'LineString', 'Polygon'].forEach(k => ol_ext_element.create('OPTION', { text: 'Géométrie : ' + _T('geom_'+k), value: k, parent: select }))
  select.addEventListener('change', () => form.setTypeGeom(select.value))
  // Buttons
  const buttons = symbol ? { submit: 'modifier', add: 'ajouter', cancel: 'annuler' } : { submit: 'ajouter', cancel: 'annuler' };
  // Show dialog
  dialog.show({
    className: 'symbolLibEditor',
    content: select,
    buttons: buttons,
    onButton: b => {
      if (b==='submit' && symbol) {
        // Update symbol
        const st = form.getStyle();
        Object.keys(st).forEach(k => {
          symbol.setIgnStyle(k, st[k]);
        })
        if (typeof(cback) === 'function') cback(symbol)
      } else if (b==='submit' || b==='add') {
        // New Symbol
        form.addSymbol(symbolLib, cback)
      }
    }
  })
  // Symbol form
  const form = new FormStyle({
    target: dialog.getContentElement(),
    preview: 'left',
    symbolLib
  })
  if (symbol) {
    select.value = symbol.getType();
    form.setStyle(symbol.getIgnStyle());
    select.style.display = 'none';
  }
  form.setTypeGeom(select.value)
}

/** Display a dialog to create new symbols in a SymbolLib
 * @param {Collection<SymbolLib>} symbolLib
 */
FormStyle.showDialogEditor = function(symbolLib) {
  // No symbol > start one
  if (!symbolLib.getLength()) {
    FormStyle.addSymbolLibDialog(symbolLib);
    return
  }
  // New symbol list
  const symbolList = new SymbolLibInput({
    symbolLib
  })
  // Dialog
  dialog.show({
    title: 'Bibliothèque de symboles',
    className: 'symbolLib',
    content: symbolList.element,
    buttons: { ok: 'ajouter...', cancel: 'annuler'},
    onButton: (b) => {
      if (b==='ok') {
        FormStyle.addSymbolLibDialog(symbolLib)
      }
    }
  })
  // Remove focus
  document.activeElement.blur();
  // Set symbol on dblclick
  symbolList.on(['item:dblclick', 'item:duplicate'], e => {
    FormStyle.addSymbolLibDialog(symbolLib, e.item)
  })
  // Remove collection on finish
  const removeCollection = () => { 
    symbolList.removeCollection();
    dialog.un('hide', removeCollection)
  }
  dialog.on('hide', removeCollection)
}

export default FormStyle
