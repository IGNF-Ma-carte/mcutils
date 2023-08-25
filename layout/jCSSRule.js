/*  Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under MIT license
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** @module layout/JCSSRule
 * @description Manipulate CSS stylesheet
 */

/* @fileoverview A simple function to manipulate CSS styleSheet
 *  @see {@link https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript }
 *  @author  Jean-Marc VIGLINO
 *  @version 1.0
 */
// Create a new stylesheet in the bottom of the <body> 
// or the <head> depending on the place of the file
var stylesheet = document.createElement('style');
stylesheet.setAttribute('type', 'text/css');
if (document.body) document.body.appendChild(stylesheet);
else document.head.appendChild(stylesheet);

// List of rules
let rules = [];

window.getR = function() { return rules }

// Get a rule
function getRuleId (selector, property) {
  for (var i=0; i<rules.length; i++) {
    if (rules[i].selector===selector && rules[i].property===property) return i;
  }
  return -1;
}

// Set a rule
function setRule(selector, property, value) {
  var id = getRuleId (selector, property);
  if (id>=0) rules.splice(id, 1);
  if (value) rules.push({ 'selector':selector, 'property':property, 'value':value });
}

// Create the stylesheet
function setSheet() {
  var css = '\n';  
  rules.forEach(function(r) {
    css += r.selector+' {'+r.property+':'+r.value+'; }\n';
  });
  stylesheet.innerHTML = css;
}

/** Manipulate CSS styleSheet. 
 * The function will add a new property for the selector in a style sheet.
 * The style sheet will be inserted where the js is placed and will override other css style sheets placed before.
 * 
 * @example 
 * // Change background color of the body
 * jCSSRule("body", "background","red");
 * // Get propertie > return "red"
 * jCSSRule("body", "background");
 * // Set multiple properties
 * jCSSRule("body", {"background":"red", "color":"blue"});
 * // Remove previous value
 * jCSSRule("body", "background",null);
 * // Remove all values
 * jCSSRule("*", null);
 *
 * @param {string} selector the selector to apply rule to
 * @param {string|object} property a property or a key, value array of properties you want to set
 * @param {string|null|undefined} value the value you want to set, if undefined will return the current value, if null remove the property
 * @returns {Object|string} the object or the property value id value is undefined
 */
function jCSSRule(selector, property, value) {
  var p = property;
  // Reset properties
  if (selector === "*" && property === null) {
    rules = [];
    setSheet();
  } else if (property === undefined) {
    // Get all properties for the given selector
    var res = {};
    rules.forEach(function(r) {
      if (r.selector===selector) {
        res[r.property] = r.value;
      }
    });
    return res;
  } else if (typeof(property) === 'string') {
    // Get the property
    if (value===undefined) {
      var id = getRuleId(selector,property);
      return id<0 ?  null : rules[id].value;
    } else {
      // Set the property
      p = {};
      p[property] = value;
    }
  }
  // Add new properties to the sheet
  for (var i in p) {
    setRule(selector, i, p[i]);
  }
  setSheet();
}

/** Get a lighter color
 * @param {Array<number>} color color string as color array
 * @param {number} inc increment, default 5
 */
function lightenColor(color, inc) {
  if (inc === undefined) inc = Math.min(128, 255 - Math.max(color[0], color[1], color[2]));
  const rgb = [];
  for (let i=0; i<3; i++) {
    rgb[i] = Math.max(0, Math.min(255, color[i] + (inc||5)));
  }
  return rgb;
}
export { lightenColor }

/** Get a darker color
 * @param {string} color color string formated as #ffffff
 * @param {number} inc increment, default -5
 */
function darkenColor(color, inc) {
  if (inc === undefined) inc = Math.min(color[0], color[1], color[2]);
  return lightenColor(color, -(inc||5));
}
export { darkenColor }

export default jCSSRule
