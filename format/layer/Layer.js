import BaseFormat from '../Base'
import roundCoords from './roundCoords'
import '../../ol/BaseLayer'
import LegendFormat from '../Legend'
import olLegend from 'ol-ext/legend/Legend'
import SymbolLib from '../../style/SymbolLib'

/** Abstract base class; normally only used for creating subclasses and not instantiated in apps.
 * Generic format for reading/writing layer.
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Base
 * @api
 */
class Layer extends BaseFormat {
  /** Constructor 
   */
  constructor() {
    super();
  }
}

/** Abstract class for reading layer
 * @param {Object} options JSON object
 * @return {Layer|boolean}
 * @api
 */
Layer.prototype.read = function(/* options */) {
  return false;
};

/** Abstract class for reading layer
 * @return {Layer|boolean}
 */
Layer.prototype.write = function(/* layer, options */) {
  return false;
};

/** Set the layers options (visibility, opacity, etc.)
 * @param {ol.layer} layer ol layer
 * @param {Object} options
 * 	@param {String} options.name name of the layer
 * 	@param {String} options.title title of the layer
 * 	@param {bool} options.opacity opacity of the layer, default 1
 * 	@param {bool} options.visibility visibility of the layer
 * 	@param {String} options.copyright layer copyright
 * 	@param {String} options.description layer description
 * 	@param {boolean} options.cluster 
 * 	@param {number} options.maxZoomCluster 
 * 	@param {vboolean} options.popupHoverSelect 
 * @api
 */
Layer.prototype.readOptions = function(layer, options) {
  options = options || {};
  if (options.id) layer.set('id', options.id);
  if (options.type) layer.set('type', options.type);
  if (options.name) layer.set('name', options.name);
  if (options.name || options.title) layer.set('title', options.title || options.name);
  if (options.visibility !== undefined) layer.setVisible(options.visibility);
  if (options.opacity !== undefined) layer.setOpacity(parseFloat(options.opacity));
  if (options.description) layer.set('desc', options.description);
  if (options.logo) layer.set('logo', options.logo);
  if (options.theme) layer.set('theme', options.theme);
  if (options.exportable) layer.set('exportable', true);
  if (layer.getSource()) {
    if (options.attributions) {
      layer.getSource().setAttributions(options.attributions);
      layer.set('attributions', options.attributions);
    } else if (options.copyright) {
      layer.getSource().setAttributions(options.copyright);
    }
  }
  // Selectable
  if (layer.selectable) {
    layer.selectable(options.selectable);
  }
  // Multi select
  if (options.multiSelect) layer.set('multiSelect', options.multiSelect);
  // Popup
  if (layer.setPopupContent) layer.setPopupContent(options.popupContent);
  if (options.popupHoverSelect) layer.set('popupHoverSelect', options.popupHoverSelect);
  // Filters
  if (options.grayscale) layer.grayscale(true);
  if (options.blendMode) layer.setBlendMode(options.blendMode);
  // Zoom
  if (options.minZoom) layer.setMinZoom(options.minZoom);
  if (options.maxZoom) layer.setMaxZoom(options.maxZoom);
  // Declutter
  if (layer.setDeclutter) layer.setDeclutter(options.declutter);
  // Styles
  if (layer.setIgnStyle) layer.setIgnStyle(options.style || {});
  if (layer.setConditionStyle && options.conditionStyle) {
    const cond = [];
    options.conditionStyle.forEach(st => {
      cond.push({
        title: st.title,
        condition: st.condition,
        symbol: st.symbol ? new SymbolLib(st.symbol) : null
      })
    })
    layer.setConditionStyle(cond)
  }

  // Mode / cluster
  if (layer.setMode) {
    if (options.cluster || options.mode === 'cluster') {
      layer.setMode('cluster', { 
        distance: options.clusterDistance || options.radiusCluster || 40,
        maxZoomCluster: parseInt(options.maxZoomCluster),
        clusterType: options.clusterType,
        clusterColor: options.clusterColor,
        displayClusterPopup: options.displayClusterPopup,
      });
    } else if (options.mode) {
      layer.setMode(options.mode || 'vector');
    }
  }
  // Crop
  layer.setCrop(options.crop);
  // Layer extent
  if (options.extent) {
    layer.setExtent(options.extent);
  }
  // Layer legend
  if (options.legend) {
    layer._legend = new olLegend({
      size: [28,20],
      margin: 6,
      layer: layer
    });
    new LegendFormat(layer._legend, options.legend)
  }
};

/** Get the layers options (visibility, opacity, etc.)
 * @param {ol.layer} layer ol layer
 * @param {Object} options a list of options to extend. The list is extended in place.
 * @return {Object} the options
 * @api
 */
Layer.prototype.writeOptions = function(layer, options) {
  options = options || {};
  options.id = layer.get('id');
  options.type = layer.get('type');
  options.name = layer.get('name') || '';
  options.title = layer.get('title') || '';
  options.visibility = layer.getVisible();
  options.opacity = layer.getOpacity();
  options.description = layer.get('desc') || layer.get('description');
  options.logo = layer.get('logo');
  options.theme = layer.get('theme');
  if (layer.get('exportable')) options.exportable = true;
  // Copyright
  if (layer.get('attributions')) options.attributions = layer.get('attributions');
  if (layer.get('type')==='Geoportail'
    || (layer.get('type')==='WMS' && layer.get('wmsparam').source.attributions && layer.get('wmsparam').source.attributions.length)
    || (layer.get('type')==='WMTS' && layer.get('wmtsparam').source.attributions.length)
    || !layer.getSource()
    || !layer.getSource().getAttributions()
  ) {
    options.copyright = ''
  } else {
    try {
      options.copyright = layer.getSource().getAttributions()({extent: [-Infinity,-Infinity,Infinity,Infinity]}).join(' ');
    } catch(e) {
      options.copyright = ''
    }
  }
  // Layer is selectable?
  if (layer.selectable) {
    options.selectable = layer.selectable();
  }
  // Multi select
  options.multiSelect = layer.get('multiSelect');
  // PopupContent
  if (layer.getPopupContent) {
    options.popupContent = layer.getPopupContent();
    options.popupHoverSelect = layer.get('popupHoverSelect');
  }
  // Filters
  options.grayscale = layer.get('grayscale') || false;
  options.blendMode = layer.get('blendMode') || '';
  // Zoom
  options.minZoom = layer.getMinZoom();
  options.maxZoom = layer.getMaxZoom();
  // Declutter
  if (layer.getDeclutter) options.declutter = layer.getDeclutter();
  // Styles 
  if (layer.getIgnStyle) options.style = layer.getIgnStyle();
  if (layer.getConditionStyle) {
    options.conditionStyle = [];
    layer.getConditionStyle().forEach(st => {
      options.conditionStyle.push({
        title: st.title,
        condition: st.condition,
        symbol: st.symbol ? st.symbol.stringify() : null
      })
    });
  }
  
  // Layer mode
  if (layer.getMode) {
    // Mode / clusters
    options.mode = layer.getMode();
    if (layer.getMode() === 'cluster') {
      options.cluster = true;
      options.clusterDistance = options.radiusCluster = layer.get('clusterDistance');
      options.maxZoomCluster = layer.get('maxZoomCluster');
      options.clusterType = layer.get('clusterType');
      options.clusterColor = layer.get('clusterColor');
      options.displayClusterPopup = layer.get('displayClusterPopup');
    }
  }
  // Crop
  options.crop = layer.getCrop();
  if (options.crop.coordinates) options.crop.coordinates = roundCoords(options.crop.coordinates);
  // Layer extent
  options.extent = layer.getExtent();

  // Legend
  if (layer._legend) {
    const format = new LegendFormat()
    options.legend = format.write(layer._legend)
  }

  return options;
};

export default Layer
