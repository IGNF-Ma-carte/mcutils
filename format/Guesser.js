import ol_ext_inherits from 'ol-ext/util/ext'

import ol_format_GPX from 'ol/format/GPX'
import ol_format_GeoJSON from 'ol/format/GeoJSON'
import ol_format_IGC from 'ol/format/IGC'
import ol_format_KML from 'ol/format/KML'
import ol_format_TopoJSON from 'ol/format/TopoJSON'
import ol_format_GeoJSONX from 'ol-ext/format/GeoJSONX'
import ol_format_GeoJSONP from 'ol-ext/format/GeoJSONP'
import ol_format_GeoRSS from 'ol-ext/format/GeoRSS'

import ol_format_Feature from 'ol/format/Feature'

/** A simple features loader from different ol/format
 * @constructor
 * @extends {ol_format_Feature}
 * @param {Object} options
 */
var ol_format_Guesser = function(options) {
  ol_format_Feature.call(this, options)
}
ol_ext_inherits(ol_format_Guesser, ol_format_Feature);

/** List of accepted format constructors
 */
ol_format_Guesser.formatConstructors = [ 
  ol_format_GPX, 
  ol_format_GeoJSONX, 
  ol_format_GeoJSONP, 
  ol_format_GeoJSON, 
  ol_format_IGC, 
  ol_format_KML, 
  ol_format_TopoJSON,
  ol_format_GeoRSS
];


function checkCoords(coords, depth) {
  if (!coords) return false;
  if (!coords.length) return false;
  if (depth > 0) {
    for (let i=0; i<coords.length; i++) {
      if (!checkCoords(coords[i], depth-1)) return false
    }
  } else {
    if (coords.length<2) return false;
  }
  return true;
}
/**
 * Read all features from a source.
 * @param {Document|Element|ArrayBuffer|Object|string} source Source.
 * @param {ReadOptions} [options] Read options.
 * @return {FeatureLike} Features.
 */
ol_format_Guesser.prototype.readFeatures = function(source, options) {
  // Try all formats
  for (var i = 0; i < ol_format_Guesser.formatConstructors.length; ++i) {
    var formatConstructor = ol_format_Guesser.formatConstructors[i];
    try {
      var format = new formatConstructor(options);
      var features = format.readFeatures(source, options);
      // Check feature geometry
      const bad = [];
      features.forEach((f, i) => {
        try {
          const coords = f.getGeometry().getCoordinates();
          switch(f.getGeometry().getType()) {
            case 'Point': {
              if (!checkCoords(coords, 0)) bad.push(i)
              break;
            }
            case 'MultiPoint': 
            case 'LineString': {
              if (!checkCoords(coords, 1)) bad.push(i)
              break;
            }
            case 'MultiLineString': 
            case 'Polygon': {
              if (!checkCoords(coords, 2)) bad.push(i)
              break;
            }
            case 'MultiPolygon': {
              if (!checkCoords(coords, 3)) bad.push(i)
              break;
            }
            default: {
              //bad.push(i);
              console.log(i)
            }
          }
        } catch(e) { 
          bad.push(i)
        }
      });
      // Remove bad geometry
      bad.reverse().forEach(b => features.splice(b, 1));
      // Has features
      if (features && features.length > 0) {
        return features;
      }
    } catch(e) { /* ok */ }
  }
  // No match
  return [];
};

export default ol_format_Guesser
