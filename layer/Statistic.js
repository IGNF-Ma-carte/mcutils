/** Copyright (c) IGN-2016 Jean-Marc VIGLINO,
 *	Statistic : the layer is composed of a vector layer and a heatmap layer
 */

import '../ol/BaseLayer'
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_Feature from 'ol/Feature'
import ol_source_Vector from 'ol/source/Vector'
import ol_layer_Vector from 'ol/layer/VectorImage'
import ol_layer_Heatmap from 'ol/layer/Heatmap'
import ol_layer_Group from 'ol/layer/Group'
import ol_style_Style from 'ol/style/Style'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Circle from 'ol/style/Circle'
import {asString as ol_color_asString} from 'ol/color'
import ol_style_Chart from 'ol-ext/style/Chart'
import ol_style_FontSymbol from 'ol-ext/style/FontSymbol'
import { toSLD } from '../style/conditionStyle.js'

import chroma from 'chroma-js'

import ol_layer_VectorStyle from './VectorStyle'

import getInteriorPoint from '../geom/getInteriorPoint'
import SymbolLib from '../style/SymbolLib'
import { style2IgnStyle } from '../style/ignStyleFn'

/** Layer with statitic symbolization
 * The layer is a layer group with a vector layer or a heatmap
 * @memberof ol.layer
 * @constructor
 * @extends {ol_layer_Group}
 * @param {Onject} options
 *	@param {ol.source.Vector|undefined} [options.source] layer vector source
 *	@param {bool} [options.sort=true] sort values (categorie)
 *	@param {} [options.typeGeom] Geometry type to use
 * @fires stat:start
 * @fires stat:end
 */
class Statistic extends ol_layer_Group {

  constructor(options) {
    options = options || {};
    super(options);

    var self = this;

    this.set('type', 'Statistique');
    this.set('sort',options.sort !== false)
    this.vectorSource = options.source || new ol_source_Vector();

    // Type de geometrie du layer
    this.typeGeom = options.typeGeom || {};
    var clearsource = this.vectorSource.clear;
    this.vectorSource.clear = function() {
      self.typeGeom = {};
      clearsource.call(this);
    };
    this.vectorSource.on('addfeature', e => {
      this.typeGeom[e.feature.getGeometry().getType()] = true;
    });
    
    // Handle membership
    this.vectorSource.on('addfeature', e => {
      e.feature._layer = this;
    });
    
    /* CHeck geometry type */
    var features = this.vectorSource.getFeatures();
    // for (var i = 0, f; f = features[i]; i++) {
    features.forEach(f => {
      f._layer = this;
      this.typeGeom[f.getGeometry().getType()] = true;
    });

    this.vectorSource.on('removefeature', (function(e) {
      delete e.feature._layer;
    }).bind(this));

    // Layer vector
    this.layerStat = new ol_layer_Vector({
      source: this.vectorSource,
      displayInLayerSwitcher: false,
    });
    this.layerStat.selectable = () => this.selectable()

    // Heatmap
    this.layerHeat = new ol_layer_Heatmap({
      source: this.vectorSource,
      visible: false,
      displayInLayerSwitcher: false,
      radius: 5,
      blur: 15,
    });

    // Create layer
    this.getLayers().push(this.layerStat);
    this.getLayers().push(this.layerHeat);

    // Handle filter on layerImage element when show
    ['layerStat', 'layerHeat'].forEach(l => {
      const layer = this[l];
      layer.on(['filter', 'change:visible'], () => {
        setTimeout(() => {
          if (this._mcFilter && layer.getVisible()) {
            const elt = document.body.querySelector('.ol-viewport .ol-layers .' + layer.getClassName());
            if (elt) {
              const style = [];
              const blend = [];
              if (this._mcFilter.get('filter')) style.push(this._mcFilter.get('filter'));
              if (this._mcFilter.get('blend')) blend.push(this._mcFilter.get('blend'));
              elt.style.filter = style.join(' ');
              elt.style.mixBlendMode = blend.join(' ');
            }
          }
        })
      })
      this.on('change:visible', () => layer.dispatchEvent('filter'));
    })

    // Style par defaut pour le layer
    this.defaultStyle = {
      fill: new ol_style_Fill({color: 'rgba(255,255,255,0.4)'}),
      stroke: new ol_style_Stroke({color: '#3399CC', width: 1.25}),
      whiteStroke: new ol_style_Stroke({color: '#fff', width: 1.25}),
    };
    // Default style
    this.defaultStyle.style = new ol_style_Style({
      image: new ol_style_Circle({
        fill: this.defaultStyle.fill,
        stroke: this.defaultStyle.stroke,
        radius: 5,
      }),
      fill: this.defaultStyle.fill,
      stroke: this.defaultStyle.stroke,
    });
    // default area style
    this.defaultStyle.area = new ol_style_Style({
      fill: this.defaultStyle.fill,
      stroke: this.defaultStyle.stroke,
    });
  }
}

/** Get popupcontent for a feature
 * @param {ol.Feature|undefined} f the feature to get information on, if undefined get the popupcontent of the layer
 * @return {html} popupcontent
 */
Statistic.prototype.getPopupContent = function(f) {
  if (f) return f.getPopupContent( this._popupContent || {} );
  return this._popupContent || {};
};

/** Set popupcontent for a feature
 * @param  default set the poupcontent of the layer
 * @param {string} content
 */
Statistic.prototype.setPopupContent = function(content) {
  if (!content || content instanceof Array) this._popupContent = {};
  else this._popupContent = content;
};


/** Get vector source
 *	@return ol.source.Vector
 */
Statistic.prototype.getSource = function() {
  return this.vectorSource;
};

/** Set vector source
 *	@return ol.source.Vector
 */
Statistic.prototype.setSource = function(source, typeGeom) {
  this.vectorSource = source || new ol_source_Vector();

  // Type de geometrie du layer
  this.typeGeom = typeGeom || {};
  var clearsource = this.vectorSource.clear;
  this.vectorSource.clear = function() {
    this.typeGeom = {};
    clearsource.call(this);
  }.bind(this);
  this.vectorSource.on('addfeature', e => {
    this.typeGeom[e.feature.getGeometry().getType()] = true;
  });
  
  // Handle membership
  this.vectorSource.on('addfeature', e => {
    e.feature._layer = this;
  });
  
  /* Check geometry type */
  var features = this.vectorSource.getFeatures();
  // for (var i = 0, f; f = features[i]; i++) {
  features.forEach(f => {
    f._layer = this;
    this.typeGeom[f.getGeometry().getType()] = true;
  });

  this.vectorSource.on('removefeature', (function(e) {
    delete e.feature._layer;
  }).bind(this));
  
  this.layerStat.setSource(this.vectorSource)
  this.layerHeat.setSource(this.vectorSource)
};

/** Set composite operation
 * @param {boolean} set or not
 */
Statistic.prototype.setComposite = function(b) {
  this.setBlendMode(b ? 'multiply': undefined);
};

/** Get layer type geom
 *	@param {Point|Polygon|Line} type of geom
 *	@return {bool}
 */
Statistic.prototype.isGeom = function(type) {
  switch (type) {
    case 'Point':
      return this.typeGeom.Point || this.typeGeom.MultiPoint;
    case 'Polygon':
      return this.typeGeom.Polygon || this.typeGeom.MultiPolygon;
    case 'Line':
      return this.typeGeom.LineString || this.typeGeom.MultiLineString;
    default:
      return false;
  }
};

/** Fonction de style pour les objets suivant une statistique donnee
 *	@param {statOptions} stat
 *	@return {function} ol.style.function
 *	@private
 */
Statistic.prototype._getStyle = function(stat) {
  if (!stat) stat = this.stat;
  var self = this;

  if (!stat) {
    stat = {};
  }

  // Point interieur a une geometrie (en cache sur la feature)
  function getPointInFeature(feature) {
    var g = feature._interiorPoint;
    if (!g) {
      g = getInteriorPoint(feature.getGeometry());
      feature._interiorPoint = g;
    }
    return g;
  }

  var styleCache = {};

  var isPolygon = this.isGeom('Polygon');
  var isPoint = this.isGeom('Point');
  var isLine = this.isGeom('Line');

  // Fonction de style
  return function(feature /*, res */) {
    var r, style, data, color, fill, stroke;
    if (stat.color || stat.colors) {
      var col = stat.cols[0];
      switch (stat.typeMap) {
        case 'sectoriel': {
          r = feature._stat ? stat.radius(feature._stat.sum) : undefined;
          if (!r) {
            return [self.defaultStyle.style];
          }
          var index = r + '-' + feature._stat.data.join('-');
          style = styleCache[index];
          if (!style) {
            style = []
            if (stat.stroke) {
              stroke = new ol_style_Stroke({ 
                color: stat.stroke === true ? '#3399CC' : stat.stroke, 
                width: 1.25
              })
              style.push(new ol_style_Style({
                stroke: stroke
              }))
            }
            style.push(new ol_style_Style({
              image: new ol_style_Chart({
                type: stat.chartType,
                radius: r,
                // offsetY: -20,
                data: feature._stat.data || [],
                colors: stat.colors,
                stroke: new ol_style_Stroke({
                  color: stat.colors == 'neon' ? '#000' : '#fff',
                  width: 2,
                }),
              }),
              geometry: getPointInFeature(feature),
            }));
          }
          return style;
        }
        case 'symbol': {
          data = parseFloat(feature.get(col));
          color = stat.color(data).rgb();
          color.push(stat.alpha);
          // Radius use another data
          if (stat.rmin < 0 && stat.col2) {
            data = parseFloat(feature.get(stat.col2));
          } 
          r = stat.radius(data).toFixed(2);
          const id = (isLine ? 'symboline-' : 'symbol-') +color + '-' + r + (stat.stroke ? '-1' : '-0');
          style = styleCache[id];
          if (!style) {	// Graphe Polygones
            r = stat.radius(data);
            if (isPolygon || isPoint) {
              fill = new ol_style_Fill({color: color});
              stroke = null;
              style = styleCache[id] = [];
              if (stat.stroke) {
                stroke = new ol_style_Stroke({ 
                  color: stat.stroke === true ? '#3399CC' : stat.stroke, 
                  width: 1.25
                })
                style.push(new ol_style_Style({
                  stroke: stroke
                }))
              }
              var image;
              if (!stat.symbol || stat.symbol == 'ign-form-rond') {
                image = new ol_style_Circle({
                  fill: fill,
                  stroke: stroke,
                  radius: r,
                });
              } else {
                stroke = self.defaultStyle.whiteStroke;
                image = new ol_style_FontSymbol({
                  glyph: stat.symbol,
                  fill: fill,
                  stroke: stroke,
                  radius: r,
                });
                feature.setIgnStyle({
                  pointRadius: r,
                  pointGlyph: stat.symbol,
                  pointColor: stroke ? ol_color_asString(stroke.getColor()) : null,
                  symbolColor: fill ? ol_color_asString(fill.getColor()) : 'rgba(0,0,0,0)',
                });
              }
              style.push(new ol_style_Style({
                image: image,
                // Set smaller up
                zIndex: stat.rmax - r,
                geometry: getPointInFeature,
              }));
            }
            // Graphe de lignes
            else if (isLine) {
              style = styleCache[id] = [
                new ol_style_Style({
                  stroke: new ol_style_Stroke({
                    width: r,
                    color: color,
                    zIndex: stat.rmax - r
                  }),
                }),
              ];
            } else {
              style = styleCache[id] = [self.defaultStyle.style];
            }
          }
          return style;
        }
        default: {
          if (stat.typeMap === 'categorie') {
            data = feature.get(col);
          } else {
            data = parseFloat(feature.get(col));
          }
          color = stat.color(data).rgb();
          const id = (isLine ? 'line-' : '') + color.join('-') + (stat.stroke ? '-1' : '-0');
          style = styleCache[id];
          if (!style) {	// Graphe Polygones
            if (isPolygon || isPoint) {
              fill = new ol_style_Fill({ color: color });
              stroke = stat.stroke ? new ol_style_Stroke({ 
                color: stat.stroke === true ? '#3399CC' : stat.stroke, 
                width: 1.25
              }) : undefined;
              style = styleCache[id] = [
                new ol_style_Style({
                  image: new ol_style_Circle({
                    fill: fill,
                    stroke: stroke,
                    radius: 5,
                  }),
                  fill: fill,
                  stroke: stroke,
                }),
              ];
            }
            // Graphe de lignes
            else if (isLine) {
              style = styleCache[id] = [
                new ol_style_Style({
                  stroke: new ol_style_Stroke({
                    color: color,
                    width: 3,
                  }),
                }),
              ];
            } else {
              style = [self.defaultStyle.style];
            }
          }
          return style;
        }
      }
    } else {
      return [self.defaultStyle.style];
    }
  };
};

/** Get current statistic params
 * @returns {statisticParam} statistic params
 * @API
 */
Statistic.prototype.getStatistic = function() {
  return this._cloneStatistic(this.stat);
}

/** Get current statistic params
 * @returns {statisticParam} statistic params
 * @private
 */
Statistic.prototype._cloneStatistic = function(stat) {
  stat = stat || {};
  const stat0 = this.stat || {};
  return {
    typeMap: stat.typeMap || stat0.typeMap || 'choroplethe',
    cols: (stat.cols || stat0.cols || []).slice(),
    mode: stat.mode || stat0.mode || 'q',
    nbClass: stat.nbClass || stat0.nbClass || 5,
    col2: stat.col2==='' ? '' : stat.col2  || stat0.col2 || '',
    symbol: stat.symbol || stat0.symbol || '',
    rmin: stat.rmin || stat0.rmin || 3,
    rmax: stat.rmax || stat0.rmax || 20,
    rProp: stat.rProp || stat0.rProp || 'length',
    stroke: stat.stroke===undefined ? (stat0.stroke === undefined ? true : stat0.stroke) : stat.stroke,
    limits: (stat.limits || stat0.limits || []).slice(),
    alpha: stat.alpha || stat0.alpha || 1,
    chartType: stat.chartType || stat0.chartType || "pie",
    hradius: stat.hradius || stat0.hradius || 5,
    hblur: stat.hblur || stat0.hblur || 15,
    brewerColors: (stat.brewerColors || stat0.brewerColors || []).slice()
  }
};

/** Calcul des statistiques pour le layer
 * @param {statisticParam} stat statistic to apply
 * @return {number} delay to delay calculation (to show a popup) and trigger a stat:start
 * @API
 */
Statistic.prototype.setStatistic = function(stat, delay) {
  if (delay) {
    this.dispatchEvent({ type: 'stat:start' });
    setTimeout(() => this.setStatistic(stat), delay);
    return;
  }

  this.stat = stat = this._cloneStatistic(stat);

  // Show layer
  this.layerHeat.setVisible(stat.typeMap === 'heatmap');
  this.layerStat.setVisible(stat.typeMap !== 'heatmap');

  // Heatmap need points
  if (stat.typeMap === 'heatmap' && !this.typeGeom.Point) {
    this.dispatchEvent({ 
      type: 'stat:end', 
      error: true, 
      status: 'HEATPTS',
      statusText: 'Une heatmap nécessite une couche contenant des points...'
    });
    return false;
  }

  // Valeurs min et max
  let min = stat.min = Infinity;
  let max = stat.max = -Infinity;

  // Initialization
  stat.values = { att: stat.cols[0], length: 0, val: {} };
  const features = this.vectorSource.getFeatures();

  // Classes partition
  var i, k, tab, val;
  switch (stat.typeMap) {	
    // Categorie: get all values for the map
    case 'categorie': {
      if (stat.cols.length) {
        var col = stat.cols[0];
        if (col != -1) {
          tab = {};
          features.forEach(f => {
            tab[f.get(col)] = true;
          });
          var keys = Object.keys(tab);
          var nb = keys.length;
          // Sort values
          if (this.get('sort')) {
            keys.sort((a,b) => {
              if (/^-?\d+$/.test(a)) a = parseInt(a);
              if (/^-?\d+$/.test(b)) b = parseInt(b);
              return (a<b ? -1 : (a>b ? 1 : 0));
            });
            tab = {};
            for (k=0; k<nb; k++) {
              tab[keys[k]] = k;
            }
          }
          // Sorted values list
          stat.values = { att: col, length: nb, val: tab };
        }
      }
      stat.limits = [];
      break;
    }
    // Sectoriel: get min / max
    case 'sectoriel': {
      var cols = stat.cols;
      for (i = 0; i < features.length; i++) {
        var d = [];
        var s = 0;
        for (k = 0; k < cols.length; k++) {
          var dk = Number(features[i].get(cols[k]));
          s += dk;
          d.push(dk);
        }
        max = Math.max(max, s);
        min = Math.min(min, s);
        features[i]._stat = {
          data: d,
          sum: s
        };
      }
      stat.limits = [];
      break;
    }
    // Calcul min et max + classification
    case 'heatmap':
    default: {
      // Calculate stats values / min / max
      tab = [];
      stat.max2 = 0;
      for (i = 0; i < features.length; i++) {
        var data = features[i].get(stat.cols[0]);
        if (!data) {
          continue;
        }

        val = parseFloat(data);
        if (!isNaN(val)) {
          tab.push(val);
          features[i]._stat = {};
          stat.max = max = Math.max(max, val);
          stat.min = min = Math.min(min, val);
        }
        // Radius attr
        if (stat.col2) {
          const val2 = parseFloat(features[i].get(stat.col2));
          if (!isNaN(val2)) {
            stat.max2 = Math.max(stat.max2, val2);
          }
        }
      }

      // q = quantile, k = k-means, e = equidistance, c = custom
      switch (stat.mode) {	
        // Custom classification, stat.classe gère le fait que l'on modifie ou non le nombre de classe
        case 'c': {
          if (!stat.limits) {
            stat.limits = this.limits(stat, tab);
          }
          break;           
        }
        // Calculate classification
        default: {
          if (!/^(q|l|k|e)/.test(stat.mode)) {
            stat.mode = 'q';
          }
          stat.limits = this.limits(stat, tab);
          break;
        }
      }
      break;
    }
  }
  stat.min = min;
  stat.max = max;
  this._values = tab;

  if (this.stat.values.length > 110) {
    this.dispatchEvent({ 
      type: 'stat:end', 
      error: true,
      status: 'MAXVAL',
      statusText: 'Trop de valeur différentes pour calculer une statistique.'
    });
    return false;
  }

  // Calculate color / classes
  switch (stat.typeMap) {
    case 'sectoriel': {
      stat.colors = stat.brewerColors;
      break;
    }
    case 'categorie': {
      const colors = stat.brewerColors;
      if (stat.values.length) {
        stat.color = function(v) {
          return chroma(colors[stat.values.val[v]] || '#aaa');
        };
      } else {
        stat.color = function() {
          return chroma('#ccc');
        };
      }
      break;
    }
    default: {
      if (stat.limits && stat.limits.length) {
        const colors = stat.brewerColors;
        stat.color = chroma.scale(colors).classes(stat.limits);
      } else {
        stat.color = function() {
          return chroma('#ccc');
        };
      }
      break;
    }
  }

  // Force redraw
  this.vectorSource.changed();

  // Calculate radius / value
  switch (stat.typeMap) {
    case 'heatmap': {
      this.layerHeat.setBlur(stat.hblur);
      this.layerHeat.setRadius(stat.hradius);
      for (i = 0; i < features.length; i++) {
        val = Number(features[i].get(stat.cols[0]));
        if (min < 0) {
          features[i].set('weight', (val - min) / (max - min));
        } else {
          features[i].set('weight', val / max);
        }
      }
      break;
    }
    case 'sectoriel': {
      var smin = Math.sqrt(min);
      var smax = Math.sqrt(max);
      if (stat.rmin < 0) {
        stat.radius = function(v) {
          let r;
          if (stat.rProp === 'area') {
            r = Math.sqrt(v * stat.rmax*stat.rmax / max)
          } else {
            r = stat.rmax * v / max;
          }
          return r > 0 ? r : 0;
        };
      } else {
        stat.radius = function(v) {
          return stat.rmin + (Math.sqrt(v) - smin) / (smax - smin) * (stat.rmax - stat.rmin);
        };
      }
      break;
    }
    case 'categorie': {
      stat.radius = function() {
        return 5;
      };
      break;
    }
    default: {
      // Proportional radius?
      if (stat.rmin < 0) {
        stat.radius = function(v) {
          let r;
          // Use attribut or not
          const rmax = stat.col2 ? stat.max2 : max;
          if (stat.rProp === 'area') {
            r = Math.sqrt(v * stat.rmax*stat.rmax / rmax)
          } else {
            r = stat.rmax * v / rmax;
          }
          return r > 0 ? r : 0;
        };
      } else {
        // Radius by classes
        stat.radius = function(v) {
          var l = stat.limits.length;
          for (var i = 1; i < l; i++) {
            if (v < stat.limits[i]) {
              break;
            }
          }
          return stat.rmin + i * (stat.rmax - stat.rmin) / l;
        };
      }
      break;
    }
  }

  // Calculate style function
  if (stat.typeMap !== 'heatmap') {
    var styleFn = this._getStyle(stat);
    if (this.layerStat.getSource().setStyle) {
      this.layerStat.getSource().setStyle(styleFn);
    } else {
      this.layerStat.setStyle(styleFn);
    }
  }

  this.dispatchEvent({ 
    type: 'stat:end', 
    error: false,
    stat: this.getStatistic()
  });

  return true;
};

/** Get legend based on layer statistics
 * @returns {Array<LegendItem>}
 */
Statistic.prototype.getStatLegend = function() {
  const legend = [];
  const stat = this.stat;
  const styleFn = this._getStyle();

  let f;
  switch (stat.typeMap) {
    case 'choroplethe':
    case 'symbol': {
      if (stat.cols[0] < 0) {
        break;
      }
      for (let i = stat.limits.length - 1; i > 0; i--) {
        if (this.isGeom('Polygon') || this.isGeom('Point') || !this.isGeom('Line')) {
          if (stat.typeMap == 'symbol') {
            f = new ol_Feature(new ol_geom_Point([0,0]));
          } else {
            f = new ol_Feature(new ol_geom_Polygon([[[0, 0], [0, 0], [0, 0],
              [0, 0], [0, 0]]]));
          }
        } else {
          f = new ol_Feature(new ol_geom_LineString([[0,0],[0,0]]));
        }
        f.set(stat.cols[0], (stat.limits[i - 1] + stat.limits[i]) / 2);
        if (stat.col2) f.set(stat.col2, 10 * stat.max2 / stat.rmax);
        f.setStyle(styleFn(f));
        legend.push({
          title: parseFloat(stat.limits[i - 1].toFixed(2)) + ' - ' + parseFloat(stat.limits[i].toFixed(2)),
          feature: f
        })
      }
      if (stat.typeMap == 'symbol' && stat.col2 && stat.rmin < 0) {
        legend.push({ title: stat.col2 });
        for (let i=0; i<4; i++) {
          const val = Math.round(stat.max2 / Math.pow(2,i));
          f = new ol_Feature(new ol_geom_Point([0,0]));
          f.set(stat.cols[0], stat.limits[0]);
          f.set(stat.col2, val);
          f.setStyle(styleFn(f));
          legend.push({
            title: String(val),
            feature: f
          })
        }
      }

      break;
    }
    case 'categorie': {
      this.getValues().forEach(v => {
        if (this.isGeom('Polygon') || this.isGeom('Point') || !this.isGeom('Line')) {
            if (stat.typeMap == 'symbol') {
              f = new ol_Feature(new ol_geom_Point([0,0]));
            } else {
              f = new ol_Feature(new ol_geom_Polygon([[[0, 0], [0, 0], [0, 0],[0, 0], [0, 0]]]));
            }
        } else {
            f = new ol_Feature(new ol_geom_LineString([[0,0],[0,0]]));
        }
        f.set(stat.cols[0], v);
        f.setStyle(styleFn(f));
        legend.push({
          title: v,
          feature: f
        })
      })
      break;
    }
    case 'sectoriel': {
      var colors = stat.colors;
      stat.cols.forEach((c, i) => {
        f = new ol_Feature(new ol_geom_Polygon([[[0, 0], [0, 0], [0, 0],[0, 0], [0, 0]]]));
        f.setStyle(new ol_style_Style({
          stroke: this.defaultStyle.stroke,
          fill: new ol_style_Fill({color: colors[i]}),
        }));
        legend.unshift({
          title: c,
          feature: f
        })
      })
      break;
    }
    default:
      break;
  }

  return legend;
};

/** Get parametric style
 * @param {object} [stat]
 * @param {string} [format] 'SLD' to return SLD format, default return ignStyle
 * @returns {Array}
 */
Statistic.prototype.getParametricStyle = function(stat, format) {
  if (!stat) stat = this.getStatistic();
  if (stat.typeMap === 'heatmap') return []
  if (stat.typeMap === 'sectoriel') return []

  const condStyle = [];

  const att = stat.cols[0]
  const legend = this.getStatLegend().reverse();
  legend.forEach(l => {
    l.feature.setIgnStyle(style2IgnStyle(l.feature))
  })
  switch (stat.typeMap) {
    case 'categorie':
    case 'choroplethe':
    case 'symbol': {
      legend.forEach((l,i) => {
        // Conditions
        let conditions;
        if (stat.typeMap === 'categorie') {
          conditions = [{ attr: att,op: '=', val: l.title }]
        } else {
          if (i<legend.length-1) {
            conditions = [{ attr: att, op: '<', val: stat.limits[i+1] }]
          } else {
            conditions = [{ attr: '', op: '=', val: '' }];
          }
        }
        // New param condition
        condStyle.push({
          title: l.title,
          condition: { all: true, conditions: conditions },
          symbol: new SymbolLib(l)
        })
      })
      break;
    }
  }

  // Get as XML 
  if (format === 'SLD') {
    return toSLD(condStyle);
/*    
    function addChild(root, tag, value) {
      const c = xmlDoc.createElement(tag);
      if (value) c.innerHTML = value
      root.appendChild(c)
      return c;
    }
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:se="http://www.opengis.net/se"></StyledLayerDescriptor>`;
    const xmlDoc = (new DOMParser).parseFromString(xml, 'text/xml');
    const root = xmlDoc.getElementsByTagName("StyledLayerDescriptor")[0];
    const layer = addChild(root, 'NamedLayer');
    addChild(layer, 'Name', 'Ma carte - statistique');
    const ustyle = addChild(layer, 'UserStyle');
    addChild(ustyle, 'Name', 'statistic');
    addChild(ustyle, 'Title', 'statistic');
    const fstyle = addChild(ustyle, 'FeatureTypeStyle')
    condStyle.reverse().forEach(c => {
      const rule = addChild(fstyle, 'Rule')
      addChild(rule, 'Name', c.title)
      // filter
      if (c.condition.conditions[0].attr) {
        const filter = addChild(rule, 'Filter')
        filter.setAttribute('xmlns', 'http://www.opengis.net/ogc')
        const prop = addChild(filter, 'PropertyIsLessThan')
        addChild(prop, 'PropertyName', c.condition.conditions[0].attr)
        addChild(prop, 'Literal', c.condition.conditions[0].val)
      }
      // Style
      const style = c.symbol.getIgnStyle()
      const poly = addChild(rule, 'PolygonSymbolizer')
      const fill = addChild(poly, 'Fill')
      let param = addChild(fill, 'CssParameter', style.fillColor)
      param.setAttribute('name', 'fill')
      if (style.strokeWidth) {
        const stroke = addChild(poly, 'Stroke')
        param = addChild(stroke, 'CssParameter', style.strokeColor)
        param.setAttribute('name', 'stroke')
        param = addChild(stroke, 'CssParameter', style.strokeWidth)
        param.setAttribute('name', 'stroke-width')
      }
    })

    const serializer = new XMLSerializer();
    const xmlStr = serializer.serializeToString(xmlDoc);
    
    return xmlStr.replace(/ xmlns=""/g, '')
*/
  } else {
    return condStyle
  }
}

/** Convert to an ol_layer_VectorStyle layer 
 * returns false if none (heatmap, sectoriel)
 * @param {boolean} param create parametric conditional styles (if possible)
 * @return {ol_layer_VectorStyle|false} 
 */
Statistic.prototype.getVectorStyle = function(param) {
  const stat = this.getStatistic();
  if (stat.typeMap === 'heatmap') return false
  if (stat.typeMap === 'sectoriel') return false

  const source = new ol_source_Vector();
  const features = this.getSource().getFeatures();
  const styleFn = this.getLayers().item(0).getStyleFunction();

  // Get parametric styles
  const condStyle = this.getParametricStyle(stat);

  // Check condition
  param = (condStyle.length > 0);

  // Copy features
  features.forEach(f => {
    const style = styleFn(f);
    const ignStyle = {};
    if (stat.typeMap === 'symbol') {
      // Convert points
      if (!/LineString/.test(f.getGeometry().getType())) {
        const geom = getInteriorPoint(f.getGeometry())
        if (geom !== f.getGeometry()) {
          f = f.clone();
          f.setGeometry(geom);
        }
      }
      const img = style[style.length-1]
      if (img.getImage()) {
        ignStyle.symbolColor = ol_color_asString(img.getImage().getFill().getColor());
        ignStyle.pointRadius = Math.round((img.getImage().getRadius() || 0) * 10) / 10;
      } else {
        ignStyle.strokeColor = ol_color_asString(style[0].getStroke().getColor());
        ignStyle.strokeWidth = style[0].getStroke().getWidth();
      }
    } else {
      if (style[0].getFill()) {
        ignStyle.fillColor = ol_color_asString(style[0].getFill().getColor());
      }
      if (style[0].getStroke()) {
        ignStyle.strokeColor = ol_color_asString(style[0].getStroke().getColor());
        ignStyle.strokeWidth = style[0].getStroke().getWidth();
      } else {
        ignStyle.strokeColor = 'rgba(255,255,255,0)';
      }
    }
    // Parametric style?
    if (!param) {
      f.setIgnStyle(ignStyle);
    }
    source.addFeature(f);
  });

  // New layer based on the current one
  const layer = new ol_layer_VectorStyle({ 
    id: this.get('id'),
    title: this.get('title'),
    description: this.get('description'),
    minZoom: this.getMinZoom(),
    maxZoom: this.getMaxZoom(),
    source: source
  });
  layer.set('type', 'Vector');
  layer.setPopupContent(this.getPopupContent())
  layer._legend = this._legend;
  layer.setMode('image');
  if (this.getSource().getAttributions()) {
    layer.getSource().setAttributions(this.getSource().getAttributions()());
  }
  if (this.get('grayscale')) layer.grayscale(true);
  if (this.get('blendMode')) layer.setBlendMode(this.get('blendMode'));
  layer.setIgnStyle('strokeColor', stat.stroke === true ? '#fff' : stat.stroke);
  layer.setIgnStyle('pointStrokeColor', stat.stroke === true ? '#fff' : stat.stroke);
  layer.setIgnStyle('pointGlyph',stat.symbol || 'ign-form-rond');
  layer.setIgnStyle('strokeWidth', stat.stroke ? 1.25 : 0);
  layer.setIgnStyle('pointStrokeWidth', stat.stroke ? 1.25 : 0);
  
  // Conditional styles
  layer.setConditionStyle(condStyle)
  return layer;
};

/** Get values used for statistics
 * @returns {Array<number>}
 */
Statistic.prototype.getValues = function() {
  switch (this.stat.typeMap) {
    case 'categorie': {
      return Object.keys(this._values || {});
    }
    case 'heatmap': {
      return;
    }
    default: {
      return this._values
    }
  }
}

/** Get class limits
 * @returns {Array<number>}
 */
Statistic.prototype.getLimits = function() {
  return this.stat.limits;
}

/** Get statistic mode mode
 * @returns {string}
 */
Statistic.prototype.getMode = function() {
  return this.stat.mode;
}

/** Add a filter to a VectorLayer
 *	@param {ol/filter}
 */
Statistic.prototype.addFilter = function(filter) {
  ol_layer_Group.prototype.addFilter.call(this, filter);
  ['layerStat', 'layerHeat'].forEach(l => {
    this[l].addFilter(filter);
    // Force refresh
    this[l].dispatchEvent({ type: 'filter' });
  })
};

/** Remove a filter to a VectorLayer
 *	@param {ol/filter}
 */
Statistic.prototype.removeFilter = function(filter) {
  ol_layer_Group.prototype.removeFilter.call(this, filter);
  ['layerStat', 'layerHeat'].forEach(l => {
    this[l].removeFilter(filter);
    // Force refresh
    this[l].dispatchEvent({ type: 'filter' });
  })
};

/** List of statistic types
 */
Statistic.type = [ 'choroplethe', 'categorie', 'symbol', 'sectoriel', 'heatmap' ];
Statistic.typeString = {
  'choroplethe': 'choroplèthe', 
  'categorie': 'catégorie',
  'symbol': 'symbole', 
  'sectoriel': 'sectoriel',
  'heatmap': 'carte de chaleur'
};

/** List of statistic param
 */
Statistic.paramList = {
  "typeMap": [ 'choroplethe', 'categorie', 'symbol', 'sectoriel', 'heatmap' ],
  "cols": [ 'choroplethe', 'categorie', 'symbol', 'sectoriel', 'heatmap' ],
  "mode": [ 'choroplethe', 'categorie', 'symbol', 'sectoriel' ],
  "nbClass": [ 'choroplethe', 'symbol' ],
  "symbol": [ 'symbol' ],
  "col2": [ 'symbol' ],
  "rmin": [ 'symbol', 'sectoriel' ],
  "rmax": [ 'symbol', 'sectoriel' ],
  "stroke": [ 'choroplethe', 'categorie', 'symbol', 'sectoriel' ],
  "limits": [ 'choroplethe', 'symbol' ],
  "alpha": [ 'symbol' ],
  "chartType": [ 'sectoriel' ],
  "hradius": [ 'heatmap' ],
  "hblur": [ 'heatmap' ],
  "brewerColors": [ 'choroplethe', 'categorie', 'symbol', 'sectoriel' ]
}

/** Statistic modes
 */
Statistic.mode = {
  q: 'Quantiles',
  e: 'Equidistance',
  l: 'Logarithmique',
  k: 'Clusters',
  c: 'Manuelle'
}

/** Check if layer is selectable
 * @param {boolean} [selectable] if define set selectable, default only test selection is enabled
 * @returns {boolean}
 */
Statistic.prototype.selectable = function(b) {
  if (this.stat && this.stat.typeMap === 'heatmap') return false;
  if (b===true) this.set('selectable', true);
  else if (b===false) this.set('selectable', false);
  return this.get('selectable') !== false;
};

/** Calculate classification limits
 * @see http://gka.github.io/chroma.js/#chroma-limits
 * @param {Object} stat
 * @param {Array<number>} data
 */ 
Statistic.prototype.limits = function(stat, data) {
  // custom = equidistance
  var mode = stat.mode || 'q';
  var num = stat.nbClass || 5;
  var min = stat.min;
  var max = stat.max;

  var aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, assignments, 
  best, centroids, cluster, clusterSizes, dist, i, j, kClusters, 
  limits, max_log, min_log, mindist, n, nb_iters, newCentroids, o, p, pb, pr, ref, 
  ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, 
  repeat, tmpKMeansBreaks, v, value, values, w;

  values = data.sort(function(a, b) {
    return a - b;
  });
  if (num === 1) {
    return [min, max];
  }
  limits = [];
  if (mode.substr(0, 1) === 'c') {
    limits.push(min);
    limits.push(max);
  }
  if (mode.substr(0, 1) === 'e') {
    limits.push(min);
    for (i = o = 1, ref = num - 1; 1 <= ref ? o <= ref : o >= ref; i = 1 <= ref ? ++o : --o) {
      limits.push(min + (i / num) * (max - min));
    }
    limits.push(max);
  } else if (mode.substr(0, 1) === 'l') {
    if (min <= 0) {
      throw 'Logarithmic scales are only possible for values > 0';
    }
    min_log = Math.LOG10E * Math.log(min);
    max_log = Math.LOG10E * Math.log(max);
    limits.push(min);
    for (i = w = 1, ref1 = num - 1; 1 <= ref1 ? w <= ref1 : w >= ref1; i = 1 <= ref1 ? ++w : --w) {
      limits.push(Math.pow(10, min_log + (i / num) * (max_log - min_log)));
    }
    limits.push(max);
  } else if (mode.substr(0, 1) === 'q') {
    limits.push(min);
    for (i = aa = 1, ref2 = num - 1; 1 <= ref2 ? aa <= ref2 : aa >= ref2; i = 1 <= ref2 ? ++aa : --aa) {
      p = (values.length - 1) * i / num;
      pb = Math.floor(p);
      if (pb === p) {
        limits.push(values[pb]);
      } else {
        pr = p - pb;
        limits.push(values[pb] * (1 - pr) + values[pb + 1] * pr);
      }
    }
    limits.push(max);
  } else if (mode.substr(0, 1) === 'k') {

    /*
    implementation based on
    http://code.google.com/p/figue/source/browse/trunk/figue.js#336
    simplified for 1-d input values
     */
    n = values.length;
    assignments = new Array(n);
    clusterSizes = new Array(num);
    repeat = true;
    nb_iters = 0;
    centroids = null;
    centroids = [];
    centroids.push(min);
    for (i = ab = 1, ref3 = num - 1; 1 <= ref3 ? ab <= ref3 : ab >= ref3; i = 1 <= ref3 ? ++ab : --ab) {
      centroids.push(min + (i / num) * (max - min));
    }
    centroids.push(max);
    while (repeat) {
      for (j = ac = 0, ref4 = num - 1; 0 <= ref4 ? ac <= ref4 : ac >= ref4; j = 0 <= ref4 ? ++ac : --ac) {
        clusterSizes[j] = 0;
      }
      for (i = ad = 0, ref5 = n - 1; 0 <= ref5 ? ad <= ref5 : ad >= ref5; i = 0 <= ref5 ? ++ad : --ad) {
        value = values[i];
        mindist = Number.MAX_VALUE;
        for (j = ae = 0, ref6 = num - 1; 0 <= ref6 ? ae <= ref6 : ae >= ref6; j = 0 <= ref6 ? ++ae : --ae) {
          dist = Math.abs(centroids[j] - value);
          if (dist < mindist) {
            mindist = dist;
            best = j;
          }
        }
        clusterSizes[best]++;
        assignments[i] = best;
      }
      newCentroids = new Array(num);
      for (j = af = 0, ref7 = num - 1; 0 <= ref7 ? af <= ref7 : af >= ref7; j = 0 <= ref7 ? ++af : --af) {
        newCentroids[j] = null;
      }
      for (i = ag = 0, ref8 = n - 1; 0 <= ref8 ? ag <= ref8 : ag >= ref8; i = 0 <= ref8 ? ++ag : --ag) {
        cluster = assignments[i];
        if (newCentroids[cluster] === null) {
          newCentroids[cluster] = values[i];
        } else {
          newCentroids[cluster] += values[i];
        }
      }
      for (j = ah = 0, ref9 = num - 1; 0 <= ref9 ? ah <= ref9 : ah >= ref9; j = 0 <= ref9 ? ++ah : --ah) {
        newCentroids[j] *= 1 / clusterSizes[j];
      }
      repeat = false;
      for (j = ai = 0, ref10 = num - 1; 0 <= ref10 ? ai <= ref10 : ai >= ref10; j = 0 <= ref10 ? ++ai : --ai) {
        if (newCentroids[j] !== centroids[i]) {
          repeat = true;
          break;
        }
      }
      centroids = newCentroids;
      nb_iters++;
      if (nb_iters > 200) {
        repeat = false;
      }
    }
    kClusters = {};
    for (j = aj = 0, ref11 = num - 1; 0 <= ref11 ? aj <= ref11 : aj >= ref11; j = 0 <= ref11 ? ++aj : --aj) {
      kClusters[j] = [];
    }
    for (i = ak = 0, ref12 = n - 1; 0 <= ref12 ? ak <= ref12 : ak >= ref12; i = 0 <= ref12 ? ++ak : --ak) {
      cluster = assignments[i];
      kClusters[cluster].push(values[i]);
    }
    tmpKMeansBreaks = [];
    for (j = al = 0, ref13 = num - 1; 0 <= ref13 ? al <= ref13 : al >= ref13; j = 0 <= ref13 ? ++al : --al) {
      tmpKMeansBreaks.push(kClusters[j][0]);
      tmpKMeansBreaks.push(kClusters[j][kClusters[j].length - 1]);
    }
    tmpKMeansBreaks = tmpKMeansBreaks.sort(function(a, b) {
      return a - b;
    });
    limits.push(tmpKMeansBreaks[0]);
    for (i = am = 1, ref14 = tmpKMeansBreaks.length - 1; am <= ref14; i = am += 2) {
      v = tmpKMeansBreaks[i];
      if (!isNaN(v) && limits.indexOf(v) === -1) {
        limits.push(v);
      }
    }
  }
  return limits;
};

export default Statistic
