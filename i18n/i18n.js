import txt from '../Carte.fr.js'

/** i18n : InternationlizatioN tools
 * @constructor
 * @param {string} lang default language
 */
const I18N = function(lang) {
  this.setLanguage(lang||'en');
}

/** Set default language
 * @param {string} lang default language
 */
I18N.prototype.setLanguage = function(lang) {
  if (lang) {
    this.language = lang;
    if (!this[lang]) this[lang] = {};
  }
};

/** Set internationalization
 * @param {string} lang language
 * @param {*} options a list of key/value
 */
I18N.prototype.set = function(lang, options) {
  for (let i in options) {
    this[lang][i] = options[i]
  }
};

/** Set Element content using data-i18n value
 * @param {Element} elt
 */
I18N.prototype.template = function (elt) {
  if (elt && elt.getAttribute) {
    if (elt.dataset.i18n) {
      elt.innerHTML = _T(elt.dataset.i18n);
    } else {
      Array.prototype.forEach.call(elt.querySelectorAll('[data-i18n]'), (e) => {
        e.innerHTML = _T(e.dataset.i18n);
      });
    }
  }
};

/** Internationalization singleton
 * @member I18N
 */
const i18n = new I18N('fr');

// Internationalisation
i18n.set('fr', txt);

/** i18n : InternationlizatioN tools
 * Internationalization is defined through i18n oject
 * @example
 * i18n.set('fr', { test: 'This is a  test' });
 * console.log(_T('test'));
 * // Output > This is a  test
 * @param {string} s string to translated
 * @param {boolean} [empty=false] return the key string if not defined
 * @return {string} the translated string or the string itself or empty string if empty=true
 */
function _T(s, empty) {
  return i18n[i18n.language][s] || (empty ? '' : s);
}

export { I18N }
export { i18n }
export default _T
