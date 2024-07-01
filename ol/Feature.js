/* @File extent openlayers features with getLayer and ignStyle Methods */
import Feature from 'ol/Feature'
import RenderFeature from 'ol/render/Feature'

import {getLength as ol_sphere_getLength} from 'ol/sphere'
import {getArea as ol_sphere_getArea} from 'ol/sphere'
import {toStringHDMS as ol_coordinate_toStringHDMS} from 'ol/coordinate'
import {getCenter as ol_extent_getCenter} from 'ol/extent'
import {transform as ol_proj_transform} from 'ol/proj'

import { ol_geom_createFromType } from 'ol-ext/geom/GeomUtils'
import ol_ext_element from 'ol-ext/util/element'

import md2html from '../md/md2html'
import { defaultIgnStyle, ignStyleDef } from '../style/ignStyle'

const cloneFeatureFn = Feature.prototype.clone;

/** Overwrite feature clone
 */
Feature.prototype.clone = function() {
  const f = cloneFeatureFn.call(this);
  f.setIgnStyle(Object.assign({}, this.getIgnStyle()));
  f.setPopupContent(this.getPopupContent());
  return f;
}

/** Get layer for a feature
 * @method ol.Feature#getLayer
 * @return { ol.layer.Layer | undefined } the layer
 */
Feature.prototype.getLayer= function() {
  return this._layer;
};

/** Set layer for a feature
 * @method ol.Feature#setLayer
 * @param { ol.layer.Layer } layer
 */
Feature.prototype.setLayer= function(layer) {
  this._layer = layer;
};

/** Get IGN style for a feature
 * @method ol.Feature#getIgnStyle
 * @param { string | boolean | undefined } [property]
 *  - if string will return the named property
 *  - if true will return all properties
 *  - if undefined will return all properties on the feature
 * @param {Object} [iStyle] prevalent style
 * @return {string|number|Array} the style
 */
Feature.prototype.getIgnStyle = function(property, iStyle) {
  if (!this._ignStyle  || Array.isArray(this._ignStyle)) {
    this._ignStyle = {};
  }
  // Test property
  if (!property) {
    return this._ignStyle;
  } else if (property===true) {
    iStyle = iStyle || {};
    const style = {};
    const geomType = this.getGeometry().getType();
    // Get all properties
    for (var i in ignStyleDef) {
      if (ignStyleDef[i].geom.test(geomType)) {
        style[i] = iStyle[i] || this.getIgnStyle(i);
      }
    }
    return style;
  } else {
    // Prevalent
    if (iStyle && Object.prototype.hasOwnProperty.call(iStyle, property)) {
      return iStyle[property];
    }
    var val;
    // Feature property
    if (Object.prototype.hasOwnProperty.call(this._ignStyle, property)) {
      val = this._ignStyle[property];
    } else {
      // or default layer property
      if (this.getLayer() 
        && this.getLayer()._ignStyle 
        && Object.prototype.hasOwnProperty.call(this.getLayer()._ignStyle, property)
        ) {
        val = this.getLayer()._ignStyle[property];
      } else {
        // or default property
        val = defaultIgnStyle[property];
      }
    }
    return val;
  }
};

/** Set IGN style for a feature
 * @method ol.Feature#setIgnStyle
 * @param {string|Object} property the property to set or a full ignStyle
 * @param {string|number} val the value to set
 */
Feature.prototype.setIgnStyle = function(property, val) {
  if (!this._ignStyle  || Array.isArray(this._ignStyle)) {
    this._ignStyle = {};
  }
  if (val === undefined) {
    if (property && typeof(property) !== 'string') {
        this._ignStyle = property;
    }
    return;
  } else if (val !== '' && /width|radius|size|offset/i.test(property)) {
    val = Number(val);
  }
  // Set properties assiated with feature geom
  if (!ignStyleDef[property] || !ignStyleDef[property].geom.test(this.getGeometry().getType())) {
    return;
  }
  // Set property if not layer prop
  if (this.getLayer()
    && this.getLayer()._ignStyle
    && Object.prototype.hasOwnProperty.call(this.getLayer()._ignStyle, property)
    && val != this.getLayer()._ignStyle[property]
    ) {
    this._ignStyle[property] = val;
  } else if (val !== '' && val != defaultIgnStyle[property]) {
    this._ignStyle[property] = val;
  } else {
    delete this._ignStyle[property];
  }
};

/** Check if a feature has a popupcontent
 * @method ol.Feature#hasPopupContent
 * @return {boolean}
 */
Feature.prototype.hasPopupContent = function() {
  if ((this._popupContent && this._popupContent.active!==false)
  || (this.getLayer() && this.getLayer().getPopupContent && this.getLayer().getPopupContent())) return true;
    return false;
};

/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 * @private
 */
function formatLength(line) {
  const length = ol_sphere_getLength(line);
  return (length > 100) ? (Math.round(length / 1000 * 100) / 100) + ' ' + 'km'
      : (Math.round(length * 100) / 100) + ' ' + 'm';
}

/**
 * Format area output.
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 * @private
 */
function formatArea(polygon) {
  const area = Math.abs(ol_sphere_getArea(polygon));
  return (area > 10000) ? (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km²'
    : (Math.round(area * 100) / 100) + ' ' + 'm²';
}

/** Get popupcontent for a feature
 * @method ol.Feature#getPopupContent
 * @param {Object|true|undefined} options popup options (with a content propertie) or undefined to get the popupcontent object
 *  @param {string} options.titre
 *  @param {string} options.desc description as Markdown
 *	@param {string} options.img image url
 *  @param {boolean} options.coord
 * @param {boolean} [html=false] true return html string
 * @return {string|Element} popupcontent
 */
Feature.prototype.getPopupContent = function(content, html) {
  if (!content) return (this._popupContent || {});

  if (this._popupContent && this._popupContent.active) content = this._popupContent;
  else if (content===true) content = (this.getLayer() && this.getLayer().getPopupContent ? this.getLayer().getPopupContent() : '');
  if (!content) return '';

  var format = (content.titre ? '####' + content.titre + '\n' : '')
    + (content.desc ? content.desc + '\n': '')
    + (content.img ? '!(' + content.img + ')' + '\n' : '')
    + (content.coord ? '**%COORD%**' : '');
  format = format.replace(/\n$/, '');
  // if (!format) return '';

  const list = this.getMDProperties();

  var md = md2html(format, list);
  if (html) return md;

  const div = ol_ext_element.create('DIV', {
    html: md,
    className: 'md'
  });
  md2html.renderWidget(div);
  return div;
};

/** Get feature properties for use in MD with extra info
 * (COORD, COORDDMS, LON, LAT, LENGTH, AREA)
 */
Feature.prototype.getMDProperties = function() {
  const list = this.getProperties();
  delete list[this.getGeometryName()]
  let pt; 
  const geom = this.getGeometry();
  switch (geom.getType()) {
    case 'LineString':
    case 'MultiLineString':
      pt = geom.getClosestPoint(ol_extent_getCenter(geom.getExtent()));
      if (!list.LENGTH) {
        list.LENGTH = formatLength(geom);
      }
      break;
    case 'Polygon':
    case 'MultiPolygon':
      if (geom.getInteriorPoint) {
        pt = geom.getInteriorPoint().getCoordinates();
      } else {
        pt = geom.getInteriorPoints().getCoordinates()[0];
      }
      if (!list.AREA) {
        list.AREA = formatArea(geom);
      }
      break;
    default: {
      pt = geom.getFirstCoordinate();
      break;
    }
  }
  const coord = ol_proj_transform(pt, 'EPSG:3857', 'EPSG:4326');
  const lon = coord[0].toFixed(6);
  const lat = coord[1].toFixed(6);
  if (!list.COORD) {
    list.COORD = (lat < 0 ? -lat : lat) + '&deg;' + (lat < 0 ? 'S' : 'N')
      + ' ' + (lon < 0 ? -lon : lon) + '&deg;' + (lon < 0 ? 'O' : 'E');
  }
  if (!list.COORDMS) {
    list.COORDMS = ol_coordinate_toStringHDMS(coord).replace(/ /g, '').replace('N', 'N ').replace('S', 'S ');
  }
  if (!list.LON) list.LON = lon;
  if (!list.LAT) list.LAT = lat;
  // Add indicator (if one)
  if (this._indicator) {
    list['INDICATOR'] = this._indicator;
    list['INDICATOR='+this._indicator] = this._indicator;
  }
  //
  return list;
}

/** Get info content (1 line abstract)
 * @method ol.Feature#getInfoContent
 * @returns {string}
 */
Feature.prototype.getInfoContent = function() {
  const html = this.getPopupContent(true, true).replace(/<br ?\/>|<\/h.?>/g,' ');
  return ol_ext_element.create('DIV', { html: html }).innerText.substr(0, 50);
};

/** Set popupcontent for a feature
 * @method ol.Feature#setPopupContent
 * @param {} options
 *  @param {boolean} options.active
 *  @param {string} options.titre
 *  @param {string} options.desc description as Markdown
 *  @param {string} options.img image url
 *  @param {string} options.img
 *  @param {boolean} options.coord
 */
Feature.prototype.setPopupContent = function(content) {
  if (!content || content instanceof Array) this._popupContent = {};
  else this._popupContent = content;
};

/** Get labelcontent for a feature
 * @method ol.Feature#getLabelContent
 *	@param {Object|true|undefined} options popup options (with a content propertie) or undefined to get the popupcontent object
 *
 *	@return {html} labelcontent
 */
Feature.prototype.getLabelContent = function(content) {
  if (!content) return '';

  var format = content;
  format = format.replace(/\n$/, '');
  var list = this.getProperties();
  var md = md2html.doData (format, list);
  md = md.replace(/<br \/>/, '');
  md = md.replace(/<br\/>/, '');
  return md;
};

/** Show a popup at the right place
 * If the feature has no content the popup is hidden.
 * The popup is placed on the object (closest point)
 * and use the feature style to calculate the offset from the point symbol.
 * @method ol.Feature#showPopup
 * @param {ol.Overlay.Popup} popup the popup to display on the map
 * @param {ol.Coordinate} coord popup position (the closest point will be used)
 * @param {ol.geom|undefined} [geom] use as geometry, default use object geom
 * @returns {string} the popup content
 */
Feature.prototype.showPopup = function(popup, coord, geom) {
  var f = this;
  const cluster = f.get('features');
  if (cluster) {
    if (cluster.length === 1) {
      f = cluster[0];
    } else {
      popup.hide();
      return '';
    }
  }
  var content = f.getPopupContent(true);
  if (content.innerText.trim() || content.querySelector('canvas') || content.querySelector('img')) {
    if (!coord) coord = popup.getPosition() || (geom||f.getGeometry()).getFirstCoordinate();
    popup.setOffset([0, 0]);
    if (f.getGeometry().getType() === 'Point') {
      var offset = popup.offsetBox;
      // Statistic layer has no style
      if (f.getLayer().getIgnStyle) {
        var style = f.getLayer().getIgnStyle(f);
        var offsetX = /left|right/.test(popup.autoPositioning[0]) ? style.pointRadius : 0;
        popup.offsetBox = [-offsetX, (style.pointOffsetY ? -2:-1)*style.pointRadius, offsetX, style.pointOffsetY ? 0:style.pointRadius];
      }
      if (geom) popup.show(geom.getClosestPoint(coord), content);
      else popup.show(f.getGeometry().getFirstCoordinate(), content);
      popup.offsetBox = offset;
    } else {
      if (/polygon/i.test(f.getGeometry().getType())) {
        popup.show(coord, content);
      } else {
        popup.show(f.getGeometry().getClosestPoint(coord), content);
      }
    }
  } else {
    popup.hide();
  }
  // Load Twitter widget
  md2html.renderWidget(popup.getElement());
  return content;
};

// Handle style
RenderFeature.prototype.getIgnStyle = Feature.prototype.getIgnStyle;
RenderFeature.prototype.getLayer = Feature.prototype.getLayer;
RenderFeature.prototype.setLayer = Feature.prototype.setLayer;
RenderFeature.prototype.showPopup = function(popup, coord, geom) {
  return render2Feature(this).showPopup(popup, coord, geom);
}
RenderFeature.prototype.getPopupContent = Feature.prototype.getPopupContent;
RenderFeature.prototype.getInfoContent = Feature.prototype.getInfoContent;
RenderFeature.prototype.getMDProperties = function() {
  return this.getProperties();
};

/** Convert RenderFeature to feature
 * @param {RenderFeature} feature
 * @returns {Feature}
 */
function render2Feature(feature) {
  // Create new feature from renderFeature
  let coords = [];
  const c = feature.getFlatCoordinates();
  for (var i=0; i<c.length; i+=2) {
    coords.push ([c[i],c[i+1]]);
  }
  switch (feature.getType()) {
    case 'Point': {
      coords = coords.pop();
      break;
    }
    case 'LineString' : {
      break;
    }
    case 'MultiLineString' : 
    case 'Polygon' : {
      coords = [coords];
      break;
    }
  }
  const geom = ol_geom_createFromType(feature.getType(), coords);
  const f2 = new Feature(geom);
  f2.setProperties(feature.getProperties());
  f2.setLayer(feature.getLayer());
  return f2;
}

export { render2Feature }
export default Feature