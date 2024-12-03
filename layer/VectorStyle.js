import ol_layer_Group from 'ol/layer/Group'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_layer_VectorImage from 'ol/layer/VectorImage'
import ol_source_Cluster from '../ol/source/Cluster'
import ol_layer_AnimatedCluster from 'ol-ext/layer/AnimatedCluster'
import ol_geom_Point from 'ol/geom/Point'
import { getCenter as ol_extent_getCenter } from 'ol/extent'
import 'ol-ext/filter/Base'

import '../ol/BaseLayer'

import '../ol/Feature'
import loadFonts from '../font/loadFonts'
import { getStyleFn, defaultIgnStyle, clearCache, getIgnStyle, ordering } from '../style/ignStyleFn'

/** Layer with a style function based on IGN style.
 *	Features in the layer are linked to the layer (f.getLayer() to get the layer it belongs to).
 * @memberof ol.layer
 * @constructor
 * @extends {ol.layer.Vector}
 * @param {ol.layer.VectorOptions=} options Options, extend olx.layer.VectorOptions.
 *	@param {boolean} options.ghostStyle true to show a ghost feature when size=0
 */
 class VectorStyle extends ol_layer_Group {
  constructor(options) {

    options = options || {};

    // Constructor
    super(options);

    // Render order based on the zindex
    options.renderOrder = ordering;
    // Style function for the layer
    options.style = getStyleFn({ ghost: options.ghostStyle });
    //
    options.displayInLayerSwitcher = false;
    options.dessin = true;
    options.popupHoverSelect = false;

    // Create layer vector
    this.layerVector_ = new ol_layer_Vector(options);
    this.layerVector_.set('parent', this);
    this.getSource().setAttributions(options.copyright || '');
    // Selectable
    this.layerVector_.selectable = () => {
      return this.selectable();
    }
    this.layerVector_.set('name', 'vector');
    this.getLayers().push(this.layerVector_);

    // Create a vector image
    this.layerImage_ = new ol_layer_VectorImage(options);
    this.layerImage_.set('parent', this);
    this.layerImage_.set('name', 'image');
    this.getLayers().push(this.layerImage_);
    // Selectable
    this.layerImage_.selectable = () => {
      return this.selectable();
    }
    // Handle filter on layerImage element on display
    this.layerImage_.on(['filter', 'change:visible'], () => {
      setTimeout(() => {
        if (this._mcFilter && this.layerImage_.getVisible()) {
          if (this.layerVector_.getMapInternal() && this.layerVector_.getMapInternal().getViewport()) {
            // Get layer viewport element
            const elt = this.layerVector_.getMapInternal().getViewport().querySelector('.ol-layers .' + this.layerImage_.getClassName());
            if (elt) {
              // Set style
              const style = [];
              const blend = [];
              if (this._mcFilter.get('filter')) style.push(this._mcFilter.get('filter'));
              if (this._mcFilter.get('blend')) blend.push(this._mcFilter.get('blend'));
              elt.style.filter = style.join(' ');
              elt.style.mixBlendMode = blend.join(' ');
            } else {
              // Not inserted in the DOM: try again later
              setTimeout(() => this.layerImage_.dispatchEvent('filter'), 200);
            }
          }
        }
      })
    })
    // Apply filter on change
    this.on('change:visible', () => this.layerImage_.dispatchEvent('filter'));

    // Features
    var features = this.getSource().getFeatures();
    features.forEach(f => f._layer = this );

    this.setMode('vector');

    // Handle membership
    this.getSource().on('addfeature', (function(e) {
      const f = e.feature;
      // Feature layer
      f._layer = this;
      // Layer attributes
      const layerAttr = Object.values(this.getAttributes())
      if (layerAttr.length) {
        const attr = f.getProperties();
        layerAttr.forEach(a => {
          if (!Object.prototype.hasOwnProperty.call(attr, a.name)) {
            f.set(a.name, a.default)
          }
        })
      }
      // Others?
      if (options.onaddfeature) {
        options.onaddfeature(e);
      }
    }).bind(this));
    this.getSource().on('removefeature', (function(e) {
      delete e.feature._layer;
    }).bind(this));

    // Clear the cache and force redraw when fonts are loaded
    loadFonts(() => {
      this.clearCache();
      this.layerVector_.changed();
    });

    // Handle cluster maxZoom
    this.layerVector_.on('prerender', (e) => {
      if (this.getMode() === 'cluster' && e.frameState.viewState.zoom <= this.get('maxZoomCluster')) {
        this.layerVector_.setVisible(false);
        this.layerCluster_.setVisible(true);
        this.activateCluster(true);
      }
    })
  }
}

/** Add a filter to a VectorLayer
 *	@param {ol/filter}
 */
VectorStyle.prototype.addFilter = function(filter) {
  ol_layer_Group.prototype.addFilter.call(this, filter)
  this.layerVector_.addFilter(filter);
  if (this.layerCluster_) this.layerCluster_.addFilter(filter);
  this.layerImage_.addFilter(filter);
  // Froce refresh
  this.layerImage_.dispatchEvent({ type: 'filter' });
};

/** Remove a filter to a VectorLayer
 *	@param {ol/filter}
 */
VectorStyle.prototype.removeFilter = function(filter) {
  ol_layer_Group.prototype.removeFilter.call(this, filter);
  this.layerVector_.removeFilter(filter);
  if (this.layerCluster_) this.layerCluster_.removeFilter(filter);
  this.layerImage_.removeFilter(filter);
  // Force refresh
  this.layerImage_.dispatchEvent({ type: 'filter' });
};

/** Get Layer source
 */
VectorStyle.prototype.getSource = function() {
  return this.layerVector_.getSource();
};

/** Get layer style
 */
VectorStyle.prototype.getStyle = function() {
  return this.layerVector_.getStyle();
};

/** Get geometry type of a layer or test if it has type as geometry
 * @param {ol.geom.GeometryType|undefined} type the type of geom to look for or default to get an array of types, default undefined
 * @return {boolean|Object} if type is specified checks if all features are of this type,  otherwise returns an array of type
 */
VectorStyle.prototype.getGeomTypes = function(type) {
  var types = {};
  var features = this.getSource().getFeatures();
  features.forEach(f => types[f.getGeometry().getType()] = true);
  if (type) {
    if (Object.getOwnPropertyNames(types).length>2)	return false;
    else return types[type];
  } else return types;
};

/** Get popupcontent for a feature
 *	@param {ol.Feature|undefined} f the feature to get information on, if undefined get the popupcontent of the layer
 *	@return {html} popupcontent
 */
VectorStyle.prototype.getPopupContent = function(f) {
  if (f) return f.getPopupContent( this._popupContent || {} );
  return this._popupContent || {};
};

/** Set popupcontent of the layer
 *	@param {string} content
 */
VectorStyle.prototype.setPopupContent = function(content) {
  if (!content || content instanceof Array) this._popupContent = {};
  else this._popupContent = content;
};

/** Set default ignStyle for a layer
 *	@param {string|ignStyle} property the property to set
 *	@param {string|number} val the value to set
 */
VectorStyle.prototype.setIgnStyle = function(property, val) {
  if (!this._ignStyle  || Array.isArray(this._ignStyle)) this._ignStyle = {};
  if (val === undefined) {
    this._ignStyle = property;
  } else if (val !== '' && /width|radius|size|offset/i.test(property)) {
    val = Number(val);
  }
  if (val !== '' && val != VectorStyle.prototype.defaultIgnStyle[property]) {
    this._ignStyle[property] = val;
  } else {
    delete this._ignStyle[property];
  }
};

/** Get ignStyle for the layer or a feature
 *	@param {ol.Feature | boolean } [f=false] the feature or true to get full ignStyle, undefined to get the layer's default style
 *	@param {number} res current resolution
 *	@param {Object} ignStyle
 */
VectorStyle.prototype.getIgnStyle = function(f /*, res */) {
  // returns default style
  if (!f) return this._ignStyle;
  // Full style
  if (f===true) return Object.assign({}, defaultIgnStyle, this._ignStyle);
  // Feature style
  return getIgnStyle(f);
};

/** Default IGN style
 */
VectorStyle.prototype.defaultIgnStyle = defaultIgnStyle;

/** Get conditions to style the layer
 * @return {Array<conditionStyle>}
 */
VectorStyle.prototype.getConditionStyle = function() {
  return this._conditionStyle || [];
};

/** Set conditions to style the layer
 * @param {Array<conditionStyle>} conditions
 */
VectorStyle.prototype.setConditionStyle = function(conditions) {
  this._conditionStyle = conditions;
};

/** Get layer attributes list
 * @return {Objet}
 */
VectorStyle.prototype.getAttributes = function() {
  if (!this._attributes) this._attributes = {};
  return this._attributes;
};

/** Set layer attributes
 * @param {Object|Array<attributes>} attr attribute list or Array of attributes
 */
VectorStyle.prototype.setAttributes = function(attr) {
  if (Array.isArray(attr)) {
    this._attributes = {}
    attr.forEach(a => this._attributes[a.name] = a)
  } else {
    this._attributes = attr;
  }
};

/** Clear cache
 */
VectorStyle.prototype.clearCache = function() {
  clearCache();
};

/** Set render as an image
 * @param {vector|image|cluster} [mode=vector] render mode
 * @param {*} options
 *  @param {number} options.clusterDistance cluster distance in px
 *	@param {string} options.clusterColor a color, default red / orange / green
 *	@param {boolean} options.clusterDash border is dash, default true
 *  @param {number} [options.animationDuration] cluster animation duration
 *  @param {number} [options.maxZoomCluster] limit zoom for cluster
 */
VectorStyle.prototype.setMode = function(mode, options) {
  options = options || {};
  this._renderMode = mode;
  this.layerVector_.setVisible(false);
  this.layerImage_.setVisible(false);
  if (this.layerCluster_) {
    this.layerCluster_.setVisible(false);
    this.activateCluster(false);
  }
  if (!isNaN(parseFloat(options.maxZoomCluster))) {
    this.set('maxZoomCluster', parseFloat(options.maxZoomCluster));
  }
  if (options.clusterDistance === undefined) options.clusterDistance = options.distance;
  this.set('clusterDistance', parseFloat(options.clusterDistance || options.distance) || 40);
  this.set('clusterDash', !!options.clusterDash);
  this.set('clusterColor', !!options.clusterColor);
  switch (mode) {
    case 'clusterStat':{
      // Create cluster layer when needed
      if (!this.layerCluster_ ) {
        var clusterSource = new ol_source_Cluster({
          // Get objets as point
          geometryFunction: function(f) {
            var g = f.getGeometry();
            if (g.getType()==='Point') {
              return g;
            } else {
              return new ol_geom_Point(ol_extent_getCenter(g.getExtent()));
            }
          },
          distance: options.clusterDistance || 40,
          source: this.getSource(),
        });
      }
      console.log("CLUSTER STAT")
    }
    case 'cluster':{
      // Create cluster layer when needed
      if (!this.layerCluster_ ) {
        var clusterSource = new ol_source_Cluster({
          // Get objets as point
          geometryFunction: function(f) {
            var g = f.getGeometry();
            if (g.getType()==='Point') {
              return g;
            } else {
              return new ol_geom_Point(ol_extent_getCenter(g.getExtent()));
            }
          },
          distance: options.clusterDistance || 40,
          source: this.getSource(),
        });
        // Animated layer
        this.layerCluster_ = new ol_layer_AnimatedCluster({
          name: 'cluster',
          className: this.getClassName(),
          displayInLayerSwitcher: false,
          source: clusterSource,
          animationDuration: options.animationDuration,
        });
        this.getLayers().push(this.layerCluster_);
        this.layerCluster_.set('parent', this);
        // Selectable
        this.layerCluster_.selectable = () => {
          return this.selectable();
        }
        // Handle cluster maxZoom
        this.layerCluster_.on('prerender', (e) => {
          if (e.frameState.viewState.zoom > this.get('maxZoomCluster')) {
            this.layerVector_.setVisible(true);
            this.layerCluster_.setVisible(false);
            this.activateCluster(false);
          }
        })
      }
      if (options.clusterDistance) this.layerCluster_.getSource().setDistance(options.clusterDistance);
      this.layerCluster_.setStyle(getStyleFn(options));
      this.layerCluster_.setVisible(true);
      this.activateCluster(true);
      break;
    }
    case 'image': {
      this.layerImage_.setVisible(true);
      break;
    }
    default: {
      this.layerVector_.setVisible(true);
      break;
    }
  }
};

/** Check if layer is selectable
 * @param {boolean} [selectable] if define set selectable, default only test selection is enabled
 * @returns {boolean}
 */
VectorStyle.prototype.selectable = function(b) {
  if (b===true) this.set('selectable', true);
  else if (b===false) this.set('selectable', false);
  return this.get('selectable') !== false;
};

/** Get render mode
 *	@return {vector|image|cluster} render mode
 */
VectorStyle.prototype.getMode = function() {
  return this._renderMode || 'vector';
};

/** Get the current layer displayed on the map
 *	@return {vector|image|cluster} render mode
 */
VectorStyle.prototype.getLayer = function() {
  switch (this.getMode()) {
    case 'cluster': return this.layerCluster_;
    case 'image': return this.layerImage_;
    default: return this.layerVector_;
  }
}

/** Get layer declutter 
 * @param {boolean} b
 */
VectorStyle.prototype.setDeclutter = function(b) {
  this.layerVector_.declutter_ = !!b;
  this.layerImage_.declutter_ = !!b;
}

/** Get layer declutter 
 * @returns {boolean}
 */
VectorStyle.prototype.getDeclutter = function() {
  return this.layerVector_.getDeclutter();
}

/** Activate cluster calculation. Deactivate calculation before doing large operation on source
 * @param {boolean} b
 * @param {boolean} silent
 */
VectorStyle.prototype.activateCluster = function(b, silent) {
  if (this.layerCluster_) {
    this.layerCluster_.getSource().set('inactive', !b);
    if (b && !silent) {
      this.layerCluster_.getSource().refresh();
    }
  }
};

export default VectorStyle
