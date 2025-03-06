/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_Overlay_Popup from 'ol-ext/overlay/Popup.js'
import ol_ext_element from 'ol-ext/util/element'
import md2html from '../md/md2html';

/**
 * A popup element to be displayed on a feature.
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @fires show
 * @fires hide
 * @fires change
 * @param {Object} options Extend PopupFeatures options
 *  @param {import('./SelectMultiple').default} options.select Select control of the map
 * @api stable
 */
var ol_Overlay_PopupMultiple = class olOVerlayPopupMultiple extends ol_Overlay_Popup {
  constructor(options) {
    options = options || {};

    super(options);

    /**
     * @public
     * @type {SelectMultiple}
    */
    this.select = options.select
  }

  /** Show the popup on the map
   * @param {ol.coordinate|undefined} coordinate Position of the popup
   * @param {string|Element|Array<string|Element>} contents Contents of the popup
   * @param {string|Element|Array<string|Element>} features Corresponding features for contents
   * @param {string|Element|Array<string|Element>} count The count of the feature to display
   */
  show(coordinate, contents, features, count) {
    if (!(contents instanceof Array)) {
      contents = [contents];
    }
    if (!(features instanceof Array)) {
      features = [features];
    }
    this._contents = contents.slice();
    this._features = features;

    // [TODO] remove count
    this._count = 1;
    // Set _count to count if given
    if (count && Number.isInteger(count) && 0 < count && count < this._contents.length + 1) {
      this._count = count
    }

    // Calculate html upon content values
    let content = contents[this._count - 1]
    var html = this._getHtml(content, count);
    if (html && html.innerText) {
      if (!this.element.classList.contains('ol-fixed')) {
        this.hide();
      }
      this.select.setIndex(this._count)
      this.select.setShownFeature(this._features[this._count - 1])
      super.show(coordinate, html);
    } else {
      this.hide();
    }
  }


  /**
   * @private
   */
  _getHtml(content, count) {
    let html = ol_ext_element.create('DIV', { className: 'ol-popupfeature' });

    // Counter
    if (this._contents.length > 1) {
      return md2html.showSelection(html, this.select, count || 1, this._contents, this._features);
    }

    // Insert content
    if (content instanceof Element) {
      html.appendChild(content);
    } else {
      ol_ext_element.create('DIV', {
        className: 'ol-popup-content',
        html: content,
        parent: html
      });
    }
    return html;
  }
}

/** Get a function to use as format to get local string for an attribute
 * if the attribute is a number: Number.toLocaleString()
 * if the attribute is a date: Date.toLocaleString()
 * otherwise the attibute itself
 * @param {string} locales string with a BCP 47 language tag, or an array of such strings
 * @param {*} options Number or Date toLocaleString options
 * @return {function} a function that takes an attribute and return the formated attribute
 */
var ol_Overlay_PopupMultiple_localString = function (locales , options) {
  return function (a) {
    if (a && a.toLocaleString) {
      return a.toLocaleString(locales , options);
    } else {
      // Try to get a date from a string
      var date = new Date(a);
      if (isNaN(date)) return a;
      else return date.toLocaleString(locales , options);
    }
  };
};

export {ol_Overlay_PopupMultiple_localString}
export default ol_Overlay_PopupMultiple
