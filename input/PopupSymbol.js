import PopupBase from 'ol-ext/util/input/PopupBase'

import '../fonts/fontign.def'
import '../fonts/fontmaki.def'
import '../fonts/fontpirate.def'
import '../fonts/fontsjjb.def'
import '../fonts/princesse.def'
import '../fonts/fontevilz.def'

import FontSymbol from 'ol-ext/style/FontSymbol'
import ol_ext_element from 'ol-ext/util/element'

import './PopupSymbol.css'

// Glyph info
const fontdef = (FontSymbol.prototype.defs || FontSymbol.defs)
const glyph = fontdef.glyphs;
const fonts = fontdef.fonts;
let tags = {};
Object.keys(glyph).forEach(g => {
  if (glyph[g].theme) tags[glyph[g].theme.split(',')] = true;
})
delete tags.FontAwesome;
delete tags.evilz;
tags = Object.keys(tags).sort();
const lsGlyphs = 'MC@RecentGlyphs';

/** Input to select symbols in a popup
 * @memberof mcutils.input
 * @extends {PopupBase}
 * @fires select
 * @param {Object} options a list of options
 *  @param {Element} options.input the input
 *  @param {string} [option.symbol='ign-form-poi'] the current symbol
 *  @param {booelan} [options.position='fixed'] popup position on the page
 */
class PopupSymbol extends PopupBase {
  constructor(options) {
    options = options || {};
    if (!options.position) options.position = 'fixed';
    options.className = 'popup-symbol';
    super(options);
    this._elt.symbol = ol_ext_element.create('I',{
      parent: this.element
    })
    this.setValue(options.symbol || 'ign-form-poi')
    // On change > change symbol
    this.input.addEventListener('change', () => {
      this.setValue();
    })
    // Seach tool
    const search = ol_ext_element.create('INPUT',{
      type: 'search',
      placeholder: 'Rechercher un symbol...',
      parent: this._elt.popup
    })
    this.on('change:visible', () => {
      setTimeout(() => search.focus(), 100)
    })
    // Filter
    const filter = ol_ext_element.create('DIV',{
      className: 'filter',
      parent: this._elt.popup
    });
    const filterFont = ol_ext_element.create('SELECT',{
      parent: filter
    });
    ol_ext_element.create('OPTION',{
      html: 'toutes les polices',
      value: '',
      parent: filterFont
    });
    Object.keys(fonts).forEach(f => {
      ol_ext_element.create('OPTION',{
        html: f,
        parent: filterFont
      });
    })
    const filterTheme = ol_ext_element.create('SELECT',{
      parent: filter
    });
    ol_ext_element.create('OPTION',{
      html: 'tous les thèmes',
      value: '',
      parent: filterTheme
    });
    tags.forEach(f => {
      ol_ext_element.create('OPTION',{
        html: f,
        parent: filterTheme
      });
    })
    // Draw element
    const drawGlyph = (k, ul) => {
      if (!glyph[k]) return;
      ol_ext_element.create('LI', {
        html: glyph[k].char,
        'data-id': k,
        title: glyph[k].name,
        style: { 'font-family': glyph[k].font },
        click: () => {
          this.setValue(k);
          this.collapse(true);
        },
        parent: ul
      })
    }
    // Recent
    ol_ext_element.create('H2', {
      html: 'Récents',
      parent: this._elt.popup
    });
    const rul = ol_ext_element.create('UL', {
      className: 'recent',
      parent: this._elt.popup
    })
    let recent = [];
    try {
      recent = localStorage.getItem(lsGlyphs).split(',');
      recent.forEach(k => drawGlyph(k, rul));
    } catch(e) { /* ok */ }

    // Save recent on select
    this.on('select', (e) => {
      const p = recent.indexOf(e.value);
      if (p>=0) recent.splice(p,1);
      recent.unshift(e.value);
      if (recent.length>10) recent.pop();
      try {
        localStorage.setItem(lsGlyphs, recent.join(','));
      } catch(e) { /* ok */ }
      rul.innerHTML = '';
      recent.forEach(k => drawGlyph(k, rul));
    })

    // List
    ol_ext_element.create('H2', {
      html: 'Symboles',
      parent: this._elt.popup
    });
    const ul = ol_ext_element.create('UL', {
      parent: this._elt.popup
    })
    // Glyph
    Object.keys(glyph).forEach(k => drawGlyph(k,ul))
    // Search tool
    window.popup = this;
    const searchFn = function(e) {
      const rex = new RegExp(search.value);
      const theme = filterTheme.value;
      const font = filterFont.value;
      ul.querySelectorAll('li').forEach(li => {
        const g = glyph[li.dataset.id];
        if (
          (rex.test(g.search) || rex.test(g.name))
          && (!theme || theme === g.theme)
          && (!font || font === g.font)
        ) {
          li.style.display = '';
        } else {
          li.style.display = 'none';
        }
      })
      if (e.type === 'change' || e.type === 'search') {
        this.collapse(false)
      }
    }.bind(this);
    ol_ext_element.addListener(search, ['change', 'keyup', 'search'], searchFn);
    filterTheme.addEventListener('change', searchFn)
    filterFont.addEventListener('change', searchFn)
  }
}

/** Change the current value
 * @param {string} value the symbol name
 * @return {boolean}
 */
PopupSymbol.prototype.setValue = function(value) {
  if (value && !glyph[value]) return false;
  if (this.input.value !== value) {
    if (value) this.input.value = value;
    this._elt.symbol.className = 'fa ' + this.input.value;
    if (glyph[this.input.value]) {
      this.dispatchEvent({ type: 'select', value: this.input.value });
    } else {
      return false;
    }
  }
  return true;
};

export default PopupSymbol