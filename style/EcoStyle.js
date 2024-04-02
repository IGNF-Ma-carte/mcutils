/** @module ol/style/Collaboratif 
 */
import {asArray as ol_color_asArray} from 'ol/color'
import ol_style_Circle from 'ol/style/Circle'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_FillPattern from 'ol-ext/style/FillPattern'
import ol_style_Icon from 'ol/style/Icon'
import ol_style_RegularShape from 'ol/style/RegularShape'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Style from 'ol/style/Style'
import ol_style_Text from 'ol/style/Text'
import ol_style_FontSymbol from 'ol-ext/style/FontSymbol'
import geoportailStyle from 'ol-ext/style/geoportailStyle'

import mongo from 'mongo-parse'
import { getAuth } from '../guichet/api'

/** 
 * @namespace ol_style_Collaboratif
 */
const ol_style_Collaboratif = {};

/** Format string with pattern ${attr}
 * @param {String} pattern
 * @param {ol.Feature} feature width properties
 */
ol_style_Collaboratif.formatProperties = function (format, feature) {
  if (!format || !format.replace || !feature) return format;
  var i = format.replace(/.*\$\{([^}]*)\}.*/, "$1");
  if (i === format) {
    return format;
  } else {
    return ol_style_Collaboratif.formatProperties(format.replace("${"+i+"}", feature.get(i)||''), feature);
  }
};

/** Format Style with pattern ${attr}
 * @param {style} 
 * @param {ol.Feature} feature width properties
 */
ol_style_Collaboratif.formatFeatureStyle = function (fstyle, feature) {
  if (!fstyle) return {};
  var fs = {};
  for (var i in fstyle) {
    fs[i] = ol_style_Collaboratif.formatProperties (fstyle[i], feature);
  }
  return fs;
};

/** Get stroke LineDash style from featureType.style
 * @param {style}
 * @return Array
 */
ol_style_Collaboratif.StrokeLineDash = function (style) {
  var width = Number(style.strokeWidth) || 2;
  switch (style.strokeDashstyle) {
      case 'dot': return [1,2*width];
      case 'dash': return [2*width,2*width];
      case 'dashdot': return [2*width, 4*width, 1, 4*width];
      case 'longdash': return [4*width,2*width];
      case 'longdashdot': return [4*width, 4*width, 1, 4*width];
      default: return undefined;
  }
};

/** Get stroke style from featureType.style
 * @param {featureType.style | {color,width} | undefined}
 * @return ol.style.Stroke
 */
ol_style_Collaboratif.Stroke = function (fstyle) {
  if (fstyle.strokeOpacity===0) return;
  let lineDash = this.StrokeLineDash(fstyle);
  var stroke = new ol_style_Stroke({
    color: fstyle.strokeColor || "#00f",
    width: Number(fstyle.strokeWidth) || 1,
    lineDash: lineDash,
    lineCap: fstyle.strokeLinecap || "round"
  });
  if (fstyle.strokeOpacity<1) {
    var a = ol_color_asArray(stroke.getColor());
    if (a.length) {
      a[4] = fstyle.strokeOpacity;
      stroke.setColor(a);
    }
  }
  return stroke;
};

/** Get fill style from featureType.style
 * @param {featureType.style | undefined}
 * @return ol.style.Fill
 */
ol_style_Collaboratif.Fill = function (fstyle) {
  if (fstyle.fillOpacity===0) return;
  let fill = new ol_style_Fill({
    color: fstyle.fillColor || "rgba(255,255,255,0.5)",
  });
  if (fstyle.fillOpacity < 1) {
    const a = ol_color_asArray(fill.getColor());
    if (a.length) {
      a[3] = Number(fstyle.fillOpacity);
      fill.setColor(a);
    }
  }
  if (fstyle.fillPattern) {
    fill = new ol_style_FillPattern({
        fill: fill,
        pattern: fstyle.fillPattern,
        color: fstyle.patternColor,
        angle: 45
    });
  }
  return fill;
};

/** Image cache */
const imageCache = {};

/** Default image (circle) */
var circle = new ol_style_Circle({
  radius: 8,
  stroke: new ol_style_Stroke({ color: '#fff', width: 1.5 }),
  fill: new ol_style_Fill({ color: 'rgba(255,0,0,.5)' })
});

/** Get Image style from featureType.style
 * @param {featureType.style |  undefined}
 * @return ol.style.Image
 */
ol_style_Collaboratif.setImage = function (olStyle, fstyle, feature) {
  var image, img;
  if (fstyle.img) {
    img = fstyle.img
  }
  if (img) {
    if (imageCache[img]) {
      image = imageCache[img];
    } else {
      // Load image
      const headers = new Headers();
      headers.set('Authorization', 'Basic '+getAuth());
      fetch(img, { headers }).then(resp => {
        // Convert the data to Base64 and build a data URL.
        resp.arrayBuffer().then(binaryData => {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(binaryData)));
          const dataUrl = 'data:image/png;base64,' + base64;
          
          // Update the source of the image.
          imageCache[img] = new ol_style_Icon ({ src: dataUrl });
          olStyle.setImage(imageCache[img])
          // Refresh
          feature.changed()
        });
      });
      // Draw a circle while loading
      image = circle;
      imageCache[img] = image;
    }
  } else {
    var radius = Number(fstyle.pointRadius) || 5;
    var graphic = {
      cross: [ 4, radius, 0, 0 ],
      square: [ 4, radius, undefined, Math.PI/4 ],
      triangle: [ 3, radius, undefined, 0 ],
      star: [ 5, radius, radius/2, 0 ],
      x: [ 4, radius, 0, Math.PI/4 ]
    }
    switch (fstyle.graphicName) {
      case "cross": 
      case "star":
      case "rectangle":
      case "square":
      case "triangle":
      case "x":
        graphic = {
          cross: [ 4, radius, 0, 0 ],
          rectangle: [ 4, radius, undefined, Math.PI/4 ],
          square: [ 4, radius, undefined, Math.PI/4 ],
          triangle: [ 3, radius, undefined, 0 ],
          star: [ 5, radius, radius/2, 0 ],
          x: [ 4, radius, 0, Math.PI/4 ]
        }
        var g = graphic[fstyle.graphicName] || graphic.square;
        image = new ol_style_RegularShape({
          points: g[0],
          radius: g[1],
          radius2: g[2],
          rotation: g[3],
          stroke: ol_style_Collaboratif.Stroke(fstyle),
          fill: ol_style_Collaboratif.Fill(fstyle)
        });
        if (fstyle.graphicName==='rectangle') {
          var canvas = image.getImage();
          var newCanvas = document.createElement('canvas');
          newCanvas.width = canvas.width;
          newCanvas.height = canvas.height;
          newCanvas.getContext("2d").drawImage(canvas, 0,0,canvas.width,canvas.height, canvas.width/4,0,canvas.width/2,canvas.height)
          canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
          canvas.getContext("2d").drawImage(newCanvas, 0,0);
        }
        break;
      case 'lightning':
        image = new ol_style_FontSymbol({
          glyph: 'fa-bolt',
          radius: radius,
          stroke: ol_style_Collaboratif.Stroke(fstyle),
          fill: ol_style_Collaboratif.Fill(fstyle)
        });
        break;
      case 'church': {
        image = new ol_style_FontSymbol({
          glyph: 'fa-venus',
          rotation: Math.PI,
          radius: radius,
          stroke: ol_style_Collaboratif.Stroke(fstyle),
          fill: ol_style_Collaboratif.Fill(fstyle)
        });
        break;
      }
      default:
        image = new ol_style_Circle({
          radius: radius,
          stroke: ol_style_Collaboratif.Stroke(fstyle),
          fill: ol_style_Collaboratif.Fill(fstyle)
        });
        break;
    }
  }
  olStyle.setImage(image);
};

/** Get Text style from featureType.style
 * @param {featureType.style | undefined}
 * @return ol.style.Text
 */
ol_style_Collaboratif.Text = function (fstyle) {
  if (!fstyle.label) return undefined;
  var s = {
    font: (fstyle.fontWeight || '')
      + " "
      + (fstyle.fontSize || '12') +'px'
      + " "
      + (fstyle.fontFamily || 'Sans-serif'),
    text: fstyle.label || '',
    rotation: (fstyle.labelRotation || 0),
    textAlign: 'left',
    textBaseline: 'middle',
    offsetX: fstyle.labelXOffset||0,
    offsetY: -fstyle.labelYOffset||0,
    stroke: new ol_style_Stroke({
      color: fstyle.labelOutlineColor || '#fff',
      width: Number(fstyle.labelOutlineWidth) || 2
    }),
    fill: new ol_style_Fill({
      color: fstyle.fontColor
    })
  };
  return new ol_style_Text(s);
};


/** Get ol.style.function as defined in featureType
 * @param {featureType}
 * @return { ol.style.function | undefined }
 */
ol_style_Collaboratif.getFeatureStyleFn = function(featureType) {
  // Fonction de style
  if (!featureType) featureType = {};

  // Sens de circulation
  var directionStyle = new ol_style_Style ({
    text: ol_style_Collaboratif.Text ({
        label: '\u203A',
        fontWeight: "bold",
        fontSize: '25'
    })
  });

  return function(feature, res) {
    // Conditionnal style
    if(!featureType.style && featureType.name && ol_style_Collaboratif[featureType.name]) {
      return ol_style_Collaboratif[featureType.name](featureType)(feature);
    }
    let style = featureType.style;
    if (featureType.style && featureType.style.children) {
      const p = feature.getProperties();
      delete p.geometry;
      for (let i=0; i < featureType.style.children.length; i++) {
        const fi = featureType.style.children[i]
        // Mongo rule
        if (!fi.mongo || !fi.mongo.matches) {
          if (typeof(fi.condition) === 'string') {
            try {
              fi.condition = JSON.parse(fi.condition)
            } catch(e) { /* oops */ }
          }
          fi.mongo = mongo.parse(fi.condition)
        }
        if (fi.mongo.matches(p)) {
          style = fi;
          break;
        }
      }
    }
    const fstyle = ol_style_Collaboratif.formatFeatureStyle (style, feature);
    // Gestion d'une bibliotheque de symboles
    if (style && style.name) {
      if (featureType.symbo_attribute) {
        fstyle.radius = 5;
        fstyle.img = ol_style_Collaboratif.getSymbolURI(
          featureType.style,
          featureType.style.name+'/'+feature.get(featureType.symbo_attribute.name),
          featureType.style.graphicWidth,
          featureType.style.graphicHeight,
          feature
        )
      } else if (style.externalGraphic) {
        fstyle.radius = 5;
        fstyle.img = ol_style_Collaboratif.getSymbolURI(
          featureType.style,
          style.externalGraphic,
          style.graphicWidth,
          style.graphicHeight,
          feature
        )
      }
    }
    let olStyle = new ol_style_Style ({});
    olStyle.setText(ol_style_Collaboratif.Text (fstyle));
    //olStyle.setImage(ol_style_Collaboratif.Image (fstyle));
    ol_style_Collaboratif.setImage(olStyle, fstyle, feature);
    olStyle.setFill(ol_style_Collaboratif.Fill (fstyle));
    olStyle.setStroke(ol_style_Collaboratif.Stroke (fstyle));// Ajouter le sens de circulation
    let directionField;
    if (featureType.style && featureType.style.directionField) {
      try {
        directionField = JSON.parse(featureType.style.directionField);
      } catch (e) {
        directionField = null;
        console.log("bad json direction field for style " + featureType.style.name);
      }
    }
    
    if (res < 2 
      && directionField instanceof Object 
      && 'attribute' in directionField 
      && 'sensDirect' in directionField 
      && 'sensInverse' in directionField
    ) {
      let direct  = directionField.sensDirect;
      let inverse = directionField.sensInverse;
      
      const lrot = function(sens, geom)	{	
        if (sens != direct && sens != inverse) return 0;
        if (geom.getType()==='MultiLineString') geom = geom.getLineString(0);
        var geo = geom.getCoordinates();
        var x, y, dl=0, l = geom.getLength();
        for (var i=0; i<geo.length-1; i++){
          x = geo[i+1][0]-geo[i][0];
          y = geo[i+1][1]-geo[i][1];
          dl += Math.sqrt(x*x+y*y);
          if (dl>=l/2) break;
        }
        if (sens == direct) return -Math.atan2(y,x);
        else return Math.PI-Math.atan2(y,x);
      }
    
      let sens = feature.get(directionField.attribute);
      if (sens===direct || sens===inverse) {
        directionStyle.getText().setRotation(lrot(sens, feature.getGeometry()));
        olStyle = [olStyle, directionStyle];
      }
    }

    return olStyle;
  }
};

/** Get image uri and save to cache if not allready done
 * @param {Object} featureType
 * @param {string} name image name
 * @param {number} width
 * @param {number} height
 */
ol_style_Collaboratif.getSymbolURI = function (featureType, name, width, height) {
  return featureType.uri.replace(/gcms\/.*/,"")
      + 'gcms/style/image/'
      + name
      + '?width='+width
      + '&height='+height;
};


/** Default style
 *	@return {ol.style.Style}
 */
ol_style_Collaboratif.Default = ol_style_Collaboratif.getFeatureStyleFn()()[0];

/** Objets mort-vivant
*/
ol_style_Collaboratif.zombie = function() {
  function getColor(feature, opacity) {
    return ( feature.get('detruit') ? [255,0,0,opacity] : [0,0,255,opacity] );
  }

  return function (feature) {
    var fstyle = {						
      strokeColor: getColor(feature, 1),
      strokeWidth: 2,
      fillColor: getColor(feature, 0.5)
    }	
    return [	
      new ol_style_Style ({
        text: ol_style_Collaboratif.Text (fstyle),
        image: ol_style_Collaboratif.Image (fstyle),
        fill: ol_style_Collaboratif.Fill (fstyle),
        stroke: ol_style_Collaboratif.Stroke(fstyle)
      })
    ];
  };
};

/** Objets detruits
*/
ol_style_Collaboratif.detruit = function() {
  return function (feature) {
    if (!feature.get('detruit')) return [];
    var fstyle = {						
      strokeWidth: 2,
      strokeColor: [255,0,0,0.5]
    }	
    return [	
      new ol_style_Style ({
        text: ol_style_Collaboratif.Text (fstyle),
        image: ol_style_Collaboratif.Image (fstyle),
        fill: ol_style_Collaboratif.Fill (fstyle),
        stroke: ol_style_Collaboratif.Stroke(fstyle)
      })
    ];
  };
};

/** Objets vivants
 */
ol_style_Collaboratif.vivant = function() {
  return function (feature) {
    if (feature.get('detruit')) return [];
    var fstyle = {						
      strokeWidth: 2,
      strokeColor: [0,0,255,0.5]
    }	
    return [	
      new ol_style_Style ({
        text: ol_style_Collaboratif.Text (fstyle),
        image: ol_style_Collaboratif.Image (fstyle),
        fill: ol_style_Collaboratif.Fill (fstyle),
        stroke: ol_style_Collaboratif.Stroke(fstyle)
      })
    ];
  };
};

/** Combinaison de style
 * @param {ol.style.StyleFunction | Array<ol.style.StyleFunction>}
 */
ol_style_Collaboratif.combine = function(style) {
  if (!(style instanceof Array)) style = [style];
  return function(feature, res) {
    var s0 = [];
    for (var i=0; i<style.length; i++){ 
      var s = style[i](feature, res);
      for (var k=0; k<s.length; k++) s0.push(s[k]);
    }
    return s0;
  }
}


/** Style des troncon de route DBUni
 */
ol_style_Collaboratif.troncon_de_route = function(options) {
  options = options || {};
  return geoportailStyle('BDTOPO_V3:troncon_de_route', { sens: options.sens || 2.5 });
  /*
  if (!options) options={};

  function getColor(feature) {
    if (options.vert && feature.get('itineraire_vert')=="Appartient") {
      if (feature.get('position_par_rapport_au_sol') != "0") return "#006400";
      else return "green";
    }
    if (!feature.get('importance')) return "magenta";
    if (feature.get('position_par_rapport_au_sol') != "0") {
      switch(feature.get('importance')) {
        case "1": return "#B11BB1"; 
        case "2": return "#B11B1B"; 
        case "3": return "#D97700"; 
        case "4": return "#FFE100"; 
        case "5": return "#CCCCCC"; 
        default: return "#D3D3D3";
      }
    } else {
      switch(feature.get('importance')) {
        case "1": return "#FF00FF"; 
        case "2": return "red"; 
        case "3": return "#FFA500"; 
        case "4": return "yellow"; 
        case "5": return "white"; 
        default: return "#D3D3D3";
      }
    }
    // return "#808080";
  }

  function getWidth(feature) {
    return Math.max ( Number(feature.get('largeur_de_chaussee'))||2 , 2 );
    // if (feature.get('largeur_de_chaussee')) return Math.max (Number(feature.get('largeur_de_chaussee')),2);
    // return 2;
  }

  function getZindex(feature) {
    if (!feature.get('position_par_rapport_au_sol')) return 100;
    var pos = Number(feature.get('position_par_rapport_au_sol'));
    if (pos>0) return 10 + pos*10 - (Number(feature.get('importance')) || 10);
    else if (pos<0) return Math.max(4 + pos, 0);
    else return 10 - (Number(feature.get('importance')) || 10);
    // return 0;
  }

  return function (feature) {
    var fstyle = {						
      strokeColor: getColor(feature),
      strokeWidth: getWidth(feature)
    }	
    return [	
      new ol_style_Style ({
        stroke: ol_style_Collaboratif.Stroke(fstyle),
        zIndex: getZindex(feature)-100
      })
    ];
  };
  */
}

/** Affichage du sens de parcours
*	@param {Object} attribute (attribut a tester), glyph (lettre), size, direct (valeur), inverse (valeur)
*/
ol_style_Collaboratif.sens = function(options) {
  if (!options) options = {
    attribute:'sens_de_circulation', 
    glyph: '\u203A', // '>',
    size: "20px",
    direct:'Sens direct', 
    inverse:'Sens inverse' 
  };

  function fleche(sens) {
    if (sens == options.direct || sens == options.inverse) return options.glyph;
    return '';
  }
  function lrot(sens, geom) {
    if (sens != options.direct && sens != options.inverse) return 0;
    var geo = geom.getCoordinates();
    var x, y, dl=0, l = geom.getLength();
    for (var i=0; i<geo.length-1; i++) {
      x = geo[i+1][0]-geo[i][0];
      y = geo[i+1][1]-geo[i][1];
      dl += Math.sqrt(x*x+y*y);
      if (dl>=l/2) break;
    }
    if (sens == options.direct) return -Math.atan2(y,x);
    else return Math.PI-Math.atan2(y,x);
  }

  return function (feature) {
    var sens = feature.get(options.attribute)
    var fstyle = {
      label: fleche (sens), 
      fontWeight: "bold", 
      fontSize: options.size, 
      labelRotation: lrot(sens, feature.getGeometry())
    }
    return [ 
      new ol_style_Style ({
        text: ol_style_Collaboratif.Text (fstyle)
      })
    ];
  };
};

/** Affichage D'un toponyme
 * @param {Object} attribute (attribut a afficher), weight, size, minResolution, maxResolution
 */
ol_style_Collaboratif.toponyme = function(options) {
  if (!options) options = {
    attribute:'nom', 
    size: "12px"
  };
  if (!options.minResolution) options.minResolution = 0;
  if (!options.maxResolution) options.maxResolution = 2;

  return function (feature, res) {
    if (res > options.maxResolution || res < options.minResolution) return [];
    var fstyle = {
      label: feature.get(options.attribute), 
      fontWeight: options.weight, 
      fontSize: options.size
    }
    return [	
      new ol_style_Style ({
        text: ol_style_Collaboratif.Text (fstyle)
      })
    ];
  };
};

/** Affichage de la couche batiment
 * @param {Object} symbol (affiche un symbole Fontawesome), color (couleur du symbol) 
 */
ol_style_Collaboratif.batiment = function(options) {
  if (!options) options = {};

  function getColor(feature, opacity) {
    switch (feature.get('nature')) {
      case "Industriel, agricole ou commercial": {
        return [51, 102, 153,opacity];
      }
      case "Remarquable": {
        return [0,192,0,opacity];
      }
      default: 
        switch ( feature.get('fonction') ) {
          case "Indifférenciée": {
            return [128,128,128,opacity];
          }
          case "Sportive": {
            return [51,153,102,opacity];
          }
          case "Religieuse": {
            return [153,102,51,opacity];
          }
          default: {
            return [153,51,51,opacity];
          }
        }
    }
  }

  function getSymbol(feature) {
    switch ( feature.get('fonction') ) {
      case "Commerciale": return "\uf217";
      case "Sportive": return "\uf1e3";
      case "Mairie": return "\uf19c";
      case "Gare": return "\uf239";
      case "Industrielle": return "\uf275";
      default: return null;
    }
  }
  
  return function (feature) {
    if (feature.get('detruit')) return [];
    var fstyle = {
      strokeColor: getColor(feature, 1),
      fillColor: getColor(feature, 0.5)
    }
    if (!/en service/i.test(feature.get('etat_de_l_objet'))) {
      fstyle.dash = true;
      fstyle.fillColor = [0,0,0,0];
    }
    if (options.symbol) {
      fstyle.label = getSymbol (feature);
      fstyle.fontFamily = "Fontawesome";
      fstyle.fontColor = options.color || "magenta";
    }
    if (fstyle.label) {
      return [
        new ol_style_Style ({
          text: ol_style_Collaboratif.Text (fstyle),
          stroke: ol_style_Collaboratif.Stroke (fstyle),
          fill: ol_style_Collaboratif.Fill (fstyle)
        })
      ];
    } else {
      return [
        new ol_style_Style ({
          stroke: ol_style_Collaboratif.Stroke (fstyle),
          fill: ol_style_Collaboratif.Fill (fstyle)
        })
      ];
    }
  };
};

export default ol_style_Collaboratif
