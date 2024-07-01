import ol_style_Style from 'ol/style/Style'
import ol_style_Text from 'ol/style/Text'
import ol_style_Image from 'ol/style/Image'
import ol_style_Circle from 'ol/style/Circle'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Fill from 'ol/style/Fill'

import {asArray, asArray as ol_color_asArray} from 'ol/color'
import {DEVICE_PIXEL_RATIO as ol_has_DEVICE_PIXEL_RATIO} from 'ol/has'
import ol_geom_Point from 'ol/geom/Point'
import { fromExtent } from 'ol/geom/Polygon'
import ol_geom_MultiPoint from 'ol/geom/MultiPoint'

import ol_style_Photo from 'ol-ext/style/Photo'
import ol_style_FontSymbol from 'ol-ext/style/FontSymbol'
import ol_style_FillPattern from 'ol-ext/style/FillPattern'
import ol_style_Shadow from 'ol-ext/style/Shadow'
import Statistic from '../layer/Statistic'

import style2IgnStyle from './style2IgnStyle'
import { getMediaURL } from '../api/serviceURL'

import SelectBase from 'ol-ext/control/SelectBase'
import md2html from '../md/md2html' 

import { ignStyleDef, defaultIgnStyle } from './ignStyle'

/** @namespace ignStyle
 * @description Style function using ign styles
 */

/* TODO ??? * /
const PATH_MACARTE = 'tobedefined/'
/* Path to images * /
const IMAGE_SERVER = mcOptions.server;
/**/

// Cache for style common to all layers, override if you want to
let _cacheStyle = {};
// Reset cache on PixelRatio change
let _cachePixelRatio = window.devicePixelRatio;

/** Clear style cache
 * @memberof ignStyle
 */
function clearCache() {
  _cacheStyle = {};
  _cachePixelRatio = window.devicePixelRatio;
}

/** Get all points in coordinates
 * @param {Array<ol_coordinate>} coords
 * @returns {Array<ol_coordinate>}
 * @private
 */
function getFlatCoordinates(coords) {
  if (coords && coords[0].length && coords[0][0].length) {
    var c = [];
    for (var i=0; i<coords.length; i++) {
      c = c.concat(getFlatCoordinates(coords[i]));
    }
    return c;
  } else return coords;
}

/** Get all points in coordinates
 * @param {ol_Feature} f
 * @returns {ol_geom_MultiPoint}
 * @private
 */
function getGeomPoints(f) {
  return new ol_geom_MultiPoint( getFlatCoordinates(f.getGeometry().getCoordinates()) );
}

/* Luminance cache */
const luminanceCache = {};
const luminanceMax = 0.3; // Math.sqrt(1.05 * 0.05) - 0.05;

/** Check color luminence / returns true if dark color
 * @param {Array<Number>} color [r,g,b]
 * @param {Number|undefined} max, default 0.3
 * @return {boolean}
 * @private
 */
function isDarkColor(color, max) {
  var id = color.join(',');
  if (!Object.prototype.hasOwnProperty.call(luminanceCache, id)) {
    try {
      var col=[];
      for (var i=0; i<3; i++) {
        var c = color[i] / 255.0;
        if (c <= 0.03928) col[i] = c / 12.92;
        else col[i] = Math.pow((c + 0.055) / 1.055, 2.4);
      }
      luminanceCache[id] = 0.2126 * col[0] + 0.7152 * col[1] + 0.0722 * col[2];
    } catch (e) {
      luminanceCache[id] = 1;
    }
  }
  return (luminanceCache[id] < (max || luminanceMax));
}

/** Style ID used for cache key
 * @param {*} s ignStyle
 * @param {bool} clustered
 * @return {string}
 * @private
 */
function getStyleId(s, clustered, sel) {
  sel = sel ? 'sel' : ''
  return {
    main: sel + (clustered?'mainc':'main:')+s.pointRadius+'-'+s.pointIcon+'-'+s.pointFrame+'-'+s.pointCrop+'-'+s.pointGlyph+'-'+s.pointForm+'-'+s.symbolColor+'-'+s.pointColor+'-'+s.pointStrokeColor+'-'
			+s.pointStrokeWidth+'-'+s.pointRotation+'-'+s.pointGradient+'-'+s.strokeWidth+'-'+s.strokeDash+'-'+s.strokeColor+'-'
			+s.fillColor+'-'+s.fillPattern+'-'+s.sizePattern+'-'+s.spacingPattern+'-'+s.anglePattern+'-'+s.offsetPattern+'-'+s.scalePattern+'-'+s.fillColorPattern+'-',
    shadow: sel + 'shad:'+s.poointRadius,
    arrow: sel + 'arrow:'+s.strokeWidth+'-'+s.strokeArrow+'-'+s.strokeColor+'-',
    text: sel + 'text:'+s.pointRadius+'-'+s.textColor+'-'+s.textStyle+'-'+s.textSize+'-'+s.textFont
			+'-'+s.textOutlineColor+'-'+s.textOutlineWidth
			+'-'+s.textAlign+'-'+s.textBaseline
      +'-'+s.textBgFill+'-'+s.textBgStroke+'-'+s.textBgStrokeWidth
      +'-'+s.textPlacement+'-'+s.textOverflow,
  };
}

/** Get ignStyle for a feature 
 * @param {ol_Feature}
 * @param {Object} [iStyle] prevalent style
 * @memberof ignStyle
 */
function getIgnStyle(f, iStyle) {
  var result = {};
  for (var i in defaultIgnStyle) {
    result[i] = f.getIgnStyle(i, iStyle);
  }
  // Icon
  if (!iStyle && f.getIgnStyle().pointGlyph && !f.getIgnStyle().pointIcon) result.pointIcon = '';
  var icon = result.pointIcon;
  var isoffset = !icon && /poi|bubble|marker|coma|shield|triangle|blazon/.test(f.getIgnStyle('pointForm', iStyle));
  // Points 
  result.pointShadow = isoffset;
  result.pointOffsetY = (isoffset ? 1:0);
  // Text align
  if (/Point/.test(f.getGeometry().getType())) {
    result.textPlacement = 'point';
  } else if (/Line/.test(f.getGeometry().getType())) {
    if (result.textPlacement === 'point') {
      result.textAlign = 'center';
      result.textBaseline = 'middle';
    }
  } else  {
    result.textAlign = 'center';
    result.textPlacement = 'point';
    result.textBaseline = 'middle';
  }
  // old versions
  switch (result.strokeDash) {
    case 'flecheRond': {
      result.strokeDash = '';
      result.strokeArrow = 'circle';
      break;
    }
    case 'flecheCarre': {
      result.strokeDash = '';
      result.strokeArrow = 'square';
      break;
    }
    case 'flecheTriangle': {
      result.strokeDash = '';
      result.strokeArrow = 'triangle';
      break;
    }
    default: break;
  }
  return result;
}

/** Ordering function that use the ignStyle zindex
 * @param {Feature} f1
 * @param {Feature} f2
 * @return {number}
 * @memberof ignStyle
 */
function ordering(f1, f2) {
  const z1 = Number((f1.getIgnStyle()||{}).zIndex||0)
  const z2 = Number((f2.getIgnStyle()||{}).zIndex||0);
  if (z1===z2) {
    return f2.getGeometry().getFirstCoordinate()[1] - f1.getGeometry().getFirstCoordinate()[1];
  } else {
    return z1-z2;
  }
}

function getClusterRadius(size) {
  return Math.max(8, Math.min(size*0.75, 20));
}
/**
 * Create a ol.style.Image for a cluster
 * @param {number} options.size the cluster size
 * @param {Array<number>} options.color the cluster color as [r,v,b]
 * @param {boolean} options.dash default true
 * @return {ol.style.Image} the cluster image
 * @private
 */
function clusterImage(options) {
  options = options || {};
  var color = options.color || (options.size>25 ? [192, 0, 0] : options.size>8 ? [255, 128, 0] : [0, 128, 0]);
  var radius = getClusterRadius(options.size);
  var dash;
  if (options.dash!==false) {
    dash = 2*Math.PI*radius/6;
    dash = [0, dash, dash, dash, dash, dash, dash];
  }
  return new ol_style_Circle({
    radius: radius,
    stroke: new ol_style_Stroke({
      color: 'rgba('+color.join(',')+',0.5)',
      width: 15,
      lineDash: dash,
      lineCap: 'butt',
    }),
    fill: new ol_style_Fill({
      color: 'rgba('+color.join(',')+',1)',
    }),
    declutterMode: 'none'
  });
}

/** Get Style for cluster
 * @param {Array<Feature>} cluster
 * @param {string} optId cluster Id
 * @param {*} clusterColor 
 * @param {*} clusterDash 
 * @param {*} clusterTextColor 
 * @private
 */
function getClusterStyle(cluster, optId, clusterColor, clusterDash, clusterTextColor) {
  var size = cluster.length;
  var styleid = 'cluster:'+size+'-'+optId;
  var style = _cacheStyle[styleid];
  if (!style) {
    style = _cacheStyle[styleid] = new ol_style_Style({
      image: clusterImage({ size: size, color: clusterColor, dash: clusterDash }),
      text: new ol_style_Text({
        text: size.toString(),
          fill: new ol_style_Fill({
            color: clusterTextColor,
          }),
      }),
    });
  }
  return [style];
}

/** Get ol stroke dash from string
 * @param {*} style
 * @private
 */
function getStrokeDash(s) {
  var strokeDash = s.strokeDash;
  if (strokeDash && typeof(strokeDash) == 'string') {
    strokeDash = s.strokeDash.split(',');
    if (s.strokeWidth > 0) {
      for (var i in strokeDash) {
        strokeDash[i] = Math.max(0, (Number(strokeDash[i])+2*(i%2)-1) * s.strokeWidth) * (ol_has_DEVICE_PIXEL_RATIO||1);
      }
    }
  }
  return strokeDash;
}

/** Get image style
 * @param {ignStyle} style
 * @param {Feature} f
 * @param {boolean} ghost show ghost style
 * @param {string} label point label
 * @return {ol.style.Image}
 * @private
 */
function getImage(id, s, f, ghost, label) {
  var img;
  if (s.pointIcon && s.pointRadius) {
    const icon = getMediaURL(s.pointIcon);
    const opacity = ol_color_asArray(s.pointColor || 'transparent')[3];
    const shadow = s.pointFrame && opacity && s.pointStrokeWidth !== 0;
    const offset = shadow ? 2 : 0;
    const width = Math.min(s.pointRadius, s.pointFrame ? s.pointStrokeWidth : 0);
    img = new ol_style_Photo({
      src: icon,
      crossOrigin: 'anonymous',
      kind: s.pointFrame,
      crop: s.pointCrop,
      radius: s.pointRadius - width,
      offsetX: offset,
      offsetY: (s.pointFrame === 'anchored' ? 8 - offset - s.pointRadius : offset),
      shadow: 2*offset,
      onload: function() {
        if (_cacheStyle[id]) {
          _cacheStyle[id].setImage(img)
          f.changed()
        }
      },
      stroke: new ol_style_Stroke({
        width: width,
        color: s.pointFrame ? s.pointColor : 'transparent',
      }),
      declutterMode: 'none'
    });
    img.declutterMode_ = 'none';
    // Check cors
    const internalImg = img.getPhoto();
    internalImg.addEventListener('error', () => {
      // remove CORS
      img._gethit = null
      img.img_ = null
      img._crossOrigin = false
      img.getImage();
    })
  } else if (ghost && !label && !s.pointRadius) {
      img = new ol_style_Circle({
        radius: 5,
        fill: new ol_style_Fill({
          color: 'rgba(0,0,0,0.5)',
        }),
        stroke: new ol_style_Stroke({
          color: 'rgba(255,255,255,1)',
          width: 1.5,
        }),
        declutterMode: 'none',
      });
  } else {
    const fillColor = ol_color_asArray(s.pointGlyph ? s.pointColor : s.symbolColor);
    if (!fillColor[3]) fillColor[3] = 0.0001;
    img = new ol_style_FontSymbol({
      radius: s.pointRadius,
      glyph: s.pointGlyph,
      color: s.symbolColor,
      form: s.pointForm || (s.pointGlyph ? undefined : 'circle'),
      rotation: s.pointRotation *Math.PI/180,
      gradient: Number(s.pointGradient),
      offsetX: 0,
      offsetY: -s.pointOffsetY * s.pointRadius,
      fill: new ol_style_Fill({
        color: fillColor
      }),
      stroke: new ol_style_Stroke({
        color: s.pointStrokeWidth ? s.pointStrokeColor : 'transparent',
        width: Math.min(s.pointStrokeWidth, s.pointRadius/2),
      }),
      declutterMode: 'none',
    });
    // BUG missing declutter mode
    img.declutterMode_ = 'none'
  }
  return img
}

/** Get ol style fill
 * @param {*} style
 * @return {ol.style.Fill}
 * @private
 */
function getFill(s) {
  if (s.fillPattern && s.fillPattern != 'vide') {
    return new ol_style_FillPattern({
      pattern: s.fillPattern,
      image: undefined,
      ratio: 1,
      color: s.fillColor,
      size: s.sizePattern,
      spacing: s.spacingPattern,
      angle: s.anglePattern,
      offset: s.offsetPattern,
      scale: s.scalePattern,
      fill: new ol_style_Fill({color: s.fillColorPattern}),
    });
  } else {
    return new ol_style_Fill({
      color: s.fillColor,
    });
  }
}

/** Get cluster Geom
 * @private
 */
function getClusterGeom(f) {
  var features = f.get('features');
  return (features && features.length===1) ? f.get('features')[0].getGeometry() : f.getGeometry();
}

/** Get Shadow style
 * @param {*} style
 * @return {ol.style.Style}
 * @private
 */
function getStyleShadow(s) {
  const shadow = new ol_style_Style({
    image: new ol_style_Shadow({
      radius: s.pointRadius * 0.5,
      declutterMode: 'none',
    }),
    zIndex: -1,
    geometry: getClusterGeom
  });
  // BUG: 
  shadow.getImage().declutterMode_ = 'none';
  return shadow;
}

/** Get Shadow style
 * @param {*} style
 * @return {ol.style.Style}
 * @private
 */
function getStyleArrow(s) {
  var width = s.strokeWidth + 6;
  const img = new ol_style_FontSymbol({
    form: s.strokeArrow,
    radius: width,
    offsetY: s.strokeArrow==='triangle' ? -5 : 0,
    rotation: 0,
    rotateWithView: true,
    fill: new ol_style_Fill({
      color: s.strokeColor,
    }),
    declutterMode: 'none',
  });
  // BUG: 
  img.declutterMode_ = 'none';
  // arrow style
  return new ol_style_Style({
    image: img,
    geometry: function(f) {
      // Cluster ?
      return (f.get('features')) ? new ol_geom_Point(f.get('features')[0].getGeometry().getLastCoordinate()) : new ol_geom_Point(f.getGeometry().getLastCoordinate());
    }
  });
}

/** Get style for a label
 * @param {*} s
 * @returns {ol_style_Style}
 * @private
 */
function getStyleLabel(s) {
  if (!s.textOutlineColor) {
    try {
      s.textOutlineColor = isDarkColor(ol_color_asArray(s.textColor)) ? [255, 255, 255, 0.6] : [0, 0, 0, 0.6];
    } catch (e) {
      s.textOutlineColor = [255, 255, 255, 0.6];
    }
  }
  // options
  const hasBackground = s.textBgFill !=='rgba(0, 0, 0, 0)'; 
  const hasBackBorder = s.textBgStroke !=='rgba(0, 0, 0, 0)'; 
  const padding = hasBackground || hasBackBorder ? [4,2,2,4] : [0,0,0,0]
  const options = {
    font: s.textStyle + ' ' + s.textSize + 'px ' + s.textFont,
    fill: new ol_style_Fill({color: s.textColor}),
    stroke: !hasBackground ? new ol_style_Stroke({color: s.textOutlineColor, width: s.textOutlineWidth}) : undefined,
    textAlign: s.textAlign,
    maxAngle: 3,
    textBaseline: s.textBaseline,
    placement: s.textPlacement,
    overflow: s.textOverflow,
    backgroundFill: hasBackground ? new ol_style_Fill({color: s.textBgFill}) : undefined,
    backgroundStroke: hasBackBorder ? new ol_style_Stroke({color: s.textBgStroke, width: s.textBgStrokeWidth}) : undefined,
    padding: padding,
  }
  if (s.textPlacement==='point') {
    options.offsetX = (s.textAlign=='left') ? s.pointRadius + padding[3] : (s.textAlign=='right') ? - s.pointRadius - padding[1] : 0;
    options.offsetY = /^top|^hanging/.test(s.textBaseline) ? s.pointRadius + padding[0] : /^bottom|^alphabetic/.test(s.textBaseline) ? - s.pointRadius - padding[2] : 0;
  }
  // Style
  return new ol_style_Style({
    text: new ol_style_Text(options),
    geometry: getClusterGeom
  });
}

/** Set arrow rotation according a feature
 * @param {ol_style_Style} st
 * @param {ol_Feature} f
 * @private
 */
function setArrowRotation(st, f) {
  var g = f.getGeometry().getCoordinates();
  var p1 = g.pop();
  var p2 = g.pop();
  var rot = 0;
    if (p1 && p2) {
    rot = Math.atan2(p2[0] - p1[0], p2[1] - p1[1]);
  }
  st.getImage().setRotation(rot);
}

const selectBase = new SelectBase;

const matchGeom = {
  Point: /point/i,
  LineString: /linestring/i,
  Polygon: /polygon/i
}

/** Get style for layer condition
 * 
 */
function getConditionStyle(f, clustered, options, clusterColor) {
  const styles = f.getLayer().getConditionStyle()
  for (let k=0; k < styles.length; k++) {
    const st = styles[k];
    // Good geom type
    if (!st.symbol || matchGeom[st.symbol.getType()].test(f.getGeometry().getType())) {
      const cond = st.condition.conditions;
      var isok = st.condition.all;
      // Check condition
      for (let i = 0; i < cond.length; i++) {
        const c = cond[i];
        if (c.attr) {
          if (st.condition.all) {
            isok = isok && selectBase._checkCondition(f, c, st.condition.useCase);
          } else {
            isok = isok || selectBase._checkCondition(f, c, st.condition.useCase);
          }
        }
      }
    }
    if (isok) {
      if (!st.symbol) return [];
      return getFeatureStyle(f, clustered, options, st.symbol.getIgnStyle(), clusterColor)
    }
  }
  return getFeatureStyle(f, clustered, options, f.getLayer().getIgnStyle(true), clusterColor)
}

/** Create style function to draw features
 *	ie. transform ignStyle in openlayers style
 * @memberof ignStyle
 * @param {*} options
 *	@param {boolean} options.ghost true to show a ghost feature when size=0
 *	@param {string} options.clusterColor a color, default red / orange / green
 *	@param {boolean} options.clusterDash border is dash, default true
 *  @param {number} [options.zIndex=0]
 */
function getStyleFn(options) {
  if (!options) options = {};

  let clusterColor; 
  let clusterTextColor = '#fff';
  if (options.clusterColor) {
    clusterColor = ol_color_asArray(options.clusterColor).slice(0, 3);
    clusterTextColor = isDarkColor(clusterColor) ? '#fff' : '#000';
  }
  const clusterDash = options.clusterDash;
  const optId = (options.clusterColor||'')+'-'+(options.clusterDash === false ? 0 : 1);

  // Clusters style
  return function(f, res, clustered) {
    // Reset cache on PixelRatio change ???
    if (_cachePixelRatio !== window.devicePixelRatio) {
      // ??? clearCache();
    }
    
    // Handle clusters
    var cluster = f.get('features');
    if (cluster) {
      if (cluster.length == 1) {
        f = cluster[0];
      } else {
        return getClusterStyle(cluster, optId, clusterColor, clusterDash, clusterTextColor);
      }
    }

    // Style from layer condition
    if (f.getLayer()) {
      if (f.getLayer().getConditionStyle && f.getLayer().getConditionStyle().length) {
        return getConditionStyle(f, clustered, options, clusterColor)
      } 
    }
    
    // Feature style
    return getFeatureStyle(f, clustered, options, null, clusterColor)
  }
}

/** Get style for feature
 */
function getFeatureStyle(f, clustered, options, ignStyle, clusterColor) {
  // Statistic layers (get first style)
  if (!ignStyle && f.getLayer() instanceof Statistic) {
    if (f.getLayer().layerStat && f.getLayer().layerStat.getStyle) {
      var style = f.getLayer().layerStat.getStyle()(f)
      return [style[0]]
    }
  }
  var style;
  // Convert ignStyle to openlayers style
  var s = getIgnStyle(f, ignStyle);
  // Transform image
  s.pointIcon = md2html.doData(s.pointIcon, f.getProperties())
  var typeGeom = f.getGeometry().getType();
  // Etiquette
  var label = f.get(s.labelAttribute) || s.labelAttribute;

  // Cache id for the style
  var id = getStyleId(s, clustered, options.select);
  // Main style
  var st;
  if (!(st = _cacheStyle[id.main])) {
    var strokeDash = getStrokeDash(s);
    var img;
    if (clustered && typeGeom !== 'Point') {
      img = clusterImage({ size:1, color: clusterColor });
    } else {
      img = getImage(id.main, s, f, options.ghost, label);
    }
    var fill = getFill(s);

    var stroke = new ol_style_Stroke({
      color: s.strokeWidth ? s.strokeColor : ((options.ghost && /line/i.test(typeGeom)) ? 'rgba(0,0,0,0.25)' : 'transparent'),
      width: s.strokeWidth || ((options.ghost && /line/i.test(typeGeom)) ? 0.5 : 0),
      lineDash: strokeDash,
    });
    if (options.select && /highlight|zoom/.test(options.select)) {
      stroke.setWidth(stroke.getWidth() + Math.max(3, stroke.getWidth()*1.2));
    }
    st = _cacheStyle[id.main] = new ol_style_Style({
      image: img,
      fill: fill,
      stroke: stroke,
      geometry: getClusterGeom
    });
    // console.log("style main")
  }
  st.setZIndex(options.zIndex||0);
  style = [st];
  // Shadow
  if (s.pointShadow && typeGeom == 'Point') {
    if (!(st = _cacheStyle[id.shadow+'-'+s.pointRadius])) {
      st = _cacheStyle[id.shadow+'-'+s.pointRadius] = getStyleShadow(s);
    }
    st.setZIndex(options.zIndex || 0);
    style.unshift( st );
  } else if (!clustered && s.strokeArrow && typeGeom == 'LineString') {
    // Stroke Arrow
    if (!(st = _cacheStyle[id.arrow])) {
      st = _cacheStyle[id.arrow] = getStyleArrow(s);
      // console.log("style arrow")
    }
    setArrowRotation(st, f)
    st.setZIndex(options.zIndex||0);
    style.push(st);
  }
  // Label
  if (label) {
    if (!(st = _cacheStyle[id.text])) {
      st = _cacheStyle[id.text] = getStyleLabel(s /*, typeGeom*/);
      // console.log("style text",s)
    }
    // Label avec affichage conditionnel si le champ est vide
    st.getText().setText(label.replace ? f.getLabelContent("(("+label.replace(/\\n/g, '\n')+"))") : f.getLabelContent("(("+label+"))"));
    st.setZIndex(options.zIndex||0);
    style.push( st );
  } else {
    label = '';
  }
  // Annotation show a disk if no label
  if (!label.trim().length && !s.pointRadius) {
    return [new ol_style_Style({
      fill: new ol_style_Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new ol_style_Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new ol_style_Circle({
        radius: 4,
        fill: new ol_style_Fill({
          color: '#ffcc33',
        }),
        declutterMode: 'none'
      }),
      geometry: getClusterGeom
    })];
  }

  return style;
}

/** Get select Style
 * @memberof ignStyle
 * @param {*} options
 *  @param {zoom | overlay | highlight | box } options.type select style type, default box
 *  @param {boolean} options.showObject show the object, default true
 *  @param {ol.style.Image | function | false | undefined} options.points style for lines points or false to hide points, default red points
 *  @param { ol_style_Stroke | undefined } options.stroke default red, 2px
 *  @param {number | undefined} options.radius radius for the points, default 5
 *  @param {function | undefined} options.styleFn a style function
 *  @param {ol/colorLike} options.color
 * @return {function} style function
 */
function getSelectStyleFn(options) {
  options = options || {};
  var style = options.styleFn || getStyleFn({ zIndex: Infinity, select: options.type });
  const selColor = options.color ? asArray(options.color) : [255,0,0];
  const selColorFill = selColor.slice();
  selColorFill[3] = .5;

  var stroke = options.stroke || new ol_style_Stroke({
    color: selColor,
    width: 2,
  });
  var fill = options.fill || new ol_style_Fill({
    color: selColorFill,
  });
  var radius = options.radius || 5;
  var color = stroke.getColor();
  var showObject = options.showObject !== false;

  var pts = options.points instanceof ol_style_Image ? options.points : new ol_style_Circle({
    stroke: new ol_style_Stroke({
      color: color,
      width: 1,
    }),
    radius: 5,
    declutterMode: 'none',
  });
  var ptsStyle = new ol_style_Style({
    image: pts,
    geometry: getGeomPoints,
    zIndex: Infinity
  });
  var strokePoint = new ol_style_Stroke({
    color: color,
    width: 5,
  });

  var fillStyle = new ol_style_Style({
    // stroke: new ol_style_Stroke({ color:'transparent'}),
    fill: fill,
    zIndex: Infinity
  });

  var overlay = new ol_style_Style({
    image: new ol_style_Circle({
      stroke: stroke,
      fill: fill,
      radius: radius,
      declutterMode: 'none',
    }),
    stroke: stroke,
    fill: fill,
    zIndex: Infinity
  });

  return function(f, res) {
    var s, s0;
    const points = options.features.getLength() > 10 ? false : options.points;
    switch (options.type) {
      case 'highlight':
      case 'zoom': {
        // Feature style
        s0 = style(f, res);
        s = [];
        s0.forEach((si0) => {
          var si = si0;
          if (si.getImage()) {
            si.getImage().setScale(1.25);
            si.getImage().setRotation(si0.getImage().getRotation());
          } 
          if (!si.getStroke() && !si.getFill() && si.getText()) {
            si.getText().setScale(1.2);
          }
          s.push(si);
        });
        s.push(fillStyle);
        if (points) s.push(ptsStyle);
        return s;
      }
      case 'overlay': {	
        // Feature style
        s = showObject ? style(f, res) : [];
        s.push(overlay);
        if (points) s.push(ptsStyle);
        return s;
      }
      default: {	
        // Feature style
        s = showObject ? style(f, res) : [];
        // Add
        var g = f.getGeometry();
        if (/Point/.test(g.getType())) {
          var cluster = f.get('features');
          if (cluster && cluster.length==1) {
            f = cluster[0];
            cluster = false;
          }
          const r = (cluster ? getClusterRadius(cluster.length) : (f.getIgnStyle('pointRadius') || 5)) + radius;
          s.unshift(new ol_style_Style({
            image: new ol_style_Circle({
              stroke: strokePoint,
              radius: r,
              declutterMode: 'none',
            }),
            zIndex: Infinity
          }));
        } else {
          if (points) {
            s.push(ptsStyle);
          }
          s.unshift(new ol_style_Style({
            stroke: stroke,
            geometry: fromExtent( g.getExtent() ),
            zIndex: Infinity
          }));
        }

        return s;
      }
    }
  }
}

export { ignStyleDef }

export { getStyleFn }
export { style2IgnStyle }
export { getSelectStyleFn }
export { defaultIgnStyle }
export { clearCache }
export { getIgnStyle }
export { ordering }