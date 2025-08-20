import proj4 from 'proj4'
import {register as ol_proj_proj4_register} from 'ol/proj/proj4.js';
import ol_source_Vector from 'ol/source/Vector'

import ol_Feature from 'ol/Feature'

import ol_format_WKT from 'ol/format/WKT'
import {bbox as ol_loadingstrategy_bbox} from 'ol/loadingstrategy'
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy'
import {transformExtent as ol_proj_transformExtent} from 'ol/proj'
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid'
import {ol_geom_createFromType} from 'ol-ext/geom/GeomUtils'

import ol_ext_Ajax from 'ol-ext/util/Ajax'
import { getAuth } from '../guichet/api';

/* Define projections
*/
if (!proj4.defs["EPSG:2154"]) proj4.defs("EPSG:2154","+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
if (!proj4.defs["IGNF:LAMB93"]) proj4.defs("IGNF:LAMB93","+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
if (!proj4.defs["EPSG:27572"]) proj4.defs("EPSG:27572","+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
if (!proj4.defs["EPSG:2975"]) proj4.defs("EPSG:2975","+proj=utm +zone=40 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// Saint-Pierre et Miquelon
if (!proj4.defs["EPSG:4467"]) proj4.defs("EPSG:4467","+proj=utm +zone=21 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// Antilles
if (!proj4.defs["EPSG:4559"]) proj4.defs("EPSG:4559","+proj=utm +zone=20 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
if (!proj4.defs["EPSG:5490"]) proj4.defs("EPSG:5490","+proj=utm +zone=20 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// Guyane
if (!proj4.defs["EPSG:2972"]) proj4.defs("EPSG:2972","+proj=utm +zone=22 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// Mayotte
if (!proj4.defs["EPSG:4471"]) proj4.defs("EPSG:4471","+proj=utm +zone=38 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// La Reunion
if (!proj4.defs["EPSG:2975"]) proj4.defs("EPSG:2975","+proj=utm +zone=40 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
// Guadeloupe 
if (!proj4.defs["EPSG:2970"]) proj4.defs("EPSG:2970","+proj=utm +zone=20 +ellps=intl +towgs84=-472.29,-5.63,-304.12,0.4362,-0.8374,0.2563,1.8984 +units=m +no_defs +type=crs");
// Martinique
if (!proj4.defs["EPSG:2973"]) proj4.defs("EPSG:2973","+proj=utm +zone=20 +ellps=intl +towgs84=126.93,547.94,130.41,-2.7867,5.1612,-0.8584,13.8227 +units=m +no_defs +type=crs");

ol_proj_proj4_register(proj4);

/**
 * Source for Espace Collaboratif services
 * @memberof ol.layer
 * @constructor
 * @extends {ol_source_Vector}
 * @param {Object} options Espace collaboratif table
 */
class EcoSource extends ol_source_Vector {
  constructor(options) {
    options = options || {};

    // Strategy for loading source (bbox or tile)
    let strategy = options.strategy || ol_loadingstrategy_bbox;
    if (options.tile_zoom_level) {
      const tileGrid = ol_tilegrid_createXYZ({ minZoom: options.tile_zoom_level, maxZoom: options.tile_zoom_level, tileSize:options.tileSize||256  });
      strategy = ol_loadingstrategy_tile (tileGrid);
    }
    
    super({
      // Loader function => added when ready
      // loader: this.loaderFn_,
      // bbox strategy
      strategy: strategy,
      // ol.source.Vector attributes
      attributions: options.attribution || 'Espace Collaboratif',
      logo: options.logo,
      useSpatialIndex: true, // force to true for loading strategy tile
      wrapX: options.wrapX
    });
    
    // Source is loading
    this.tileloading_	= 0;
    this.table_ = options;
  
    this.maxFeatures_	= options.maxFeatures || 5000;
    this._outputformat = options.outputFormat || 'JSON';
    
    let crs = this.table_.columns[this.table_.geometry_name];
    crs = crs ? crs.crs : 'IGNF:LAMB93';
    this.srsName_ = crs || 'IGNF:LAMB93'; // 'EPSG:4326';
  
    if (!proj4.defs[this.srsName_]) {
      console.error('PROJECTION INCONNUE', this.srsName_);
    }
    
    // Filter
    this.featureFilter_ = options.filter || {};
    // Filter / deleted objects
    if (this.table_.columns.detruit) {
      this.featureFilter_ = { detruit: false };
    } else if (this.table_.columns.gcms_detruit) {
      this.featureFilter_ = { gcms_detruit: false };
    }
    
    // Strategy for loading source (bbox or tile)
    if (options.tile_zoom_level) {
      this.tiled_ = true;
      this.maxReload_ = options.maxReload;
    }
  
    // Geom format
    this._formatWKT = new ol_format_WKT();

    // Start loading (if authiticated)
    this.setLoader(this.loaderFn_);
  }

  /** Set loader (if strategy) */
  setLoader(loader) {
    this._auth = getAuth();
    if (this._auth && this.table_.tile_zoom_level) {
      super.setLoader(loader || this.loaderFn_)
      this.refresh();
    }
  }
}

/**
* WFS parameters
* @param {ol.extent} extent
* @param {ol.projection} projection
*/
EcoSource.prototype.getWFSParam = function (extent, projection) {
  const bbox = ol_proj_transformExtent(extent, projection, this.srsName_);

  // WFS parameters
  return {
    service	: 'WFS',
    request: 'GetFeature',
    outputFormat: this._outputformat || 'JSON',
    typeName: this.table_.name,
    bbox: bbox.join(','),
    filter: JSON.stringify(this.featureFilter_),
    maxFeatures: this.maxFeatures_,
    version: '1.1.0'
  };
};

/** Read features from file
 * @param {*} data
 */
EcoSource.prototype._readFeatures = function (data, projection) {
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  projection = projection || 'EPSG:3857';
  let feature;
  const features = [];
  const geometryAttribute = this.table_.geometry_name;
  
  var format = new ol_format_WKT();
  var r3d = /([-+]?(\d*[.])?\d+) ([-+]?(\d*[.])?\d+) ([-+]?(\d*[.])?\d+)/g;
  //
  for (var f=0; f<data.length; f++) {
    // Get data
    var geom = data[f][geometryAttribute];
    // 
    if (geom.type) {
      var g = ol_geom_createFromType (geom.type, geom.coordinates);
      g.transform (this.srsName_, projection);
      feature = new ol_Feature (g);
    }
    // WKT
    else {
      geom = geom.replace (r3d, "$1 $3");
      try{
        feature = format.readFeature(geom, {
          dataProjection: this.srsName_,
          featureProjection : projection
        });
      } catch(e) {
        console.error('[BAD FORMAT] error line: ', f, data[f]);
        continue;
      }
    }
  
    // Feature properties
    const properties = data[f];
    delete properties[geometryAttribute];
    feature.setProperties(properties, true);
    // Add feature
    features.push(feature);
  }

  return features;
};

/** Find preserved feature (updated, deleted or preserved)
 * @param {ol.Feature}
 * @private
 */
EcoSource.prototype.findFeature_ = function(f) {
  const idName = this.table_.id_name;
  const fid = f.get(idName);

  // Find feature in table
  function find(features) {
    for (let i = 0; i < features.length; i++) {
      if (features[i].get(idName)===fid) {
        f = features[i];
        return true;
      }
    }
    return false;
  }
    
  // Allready loaded (features on tile edges)
  if (this.tiled_) {
    var p = f.getGeometry().getFirstCoordinate();
    if (find(this.getFeaturesInExtent([p[0]-0.1, p[1]-0.1, p[0]+0.1, p[1]+0.1]))) {
      return null;
    }
    //return f;
  }
  // Nothing found > return initial feature
  return f;
};

/** Force source reload + send an even
 */
EcoSource.prototype.reload = function() {
  // Send event clear
  this.refresh();
  this.dispatchEvent({ type: 'reload', maxreload: this.maxReload_ });
}

/**
 * The loader function used to load features
 * @private
 */
EcoSource.prototype.loaderFn_ = function (extent, resolution, projection) {
  // if (resolution > this.maxResolution_) return;
  const self = this;

  // Save projection for writing
  this.projection_ = projection;

  // TODO self.srsName_
  if (!proj4.defs[this.srsName_]) {
    return;
  }

  // Reload all if maxFeatures
  if (this.maxReload_ && this.tileloading_ === 1 && this.getFeatures().length > this.maxReload_) {
    // console.log('clear: '+this.getFeatures().length)
    this.reload();
  }

  function onSuccess(data) {
    const features = [];
    const f0 = self._readFeatures(data, projection)
    f0.forEach((f) => {
      // Find preserved features
      const feature = self.findFeature_(f);
      if (feature) {
        features.push(feature);
      }
    })
    
    // Start replacing features
    if (!self.tiled_) self.clear();
    if (features.length) self.addFeatures(features);
    self.dispatchEvent({ type: 'loadend', remains: --self.tileloading_ });
    if (data.length == self.maxFeatures_) self.dispatchEvent({ type: 'overload' });
  }

  function onError(status, error) {
    if (status !== 'abort') {
      self.dispatchEvent({ type: 'loadend', error: error.message, status: status, remains: --self.tileloading_ });
    } else {
      self.dispatchEvent({ type: 'loadend', remains: --self.tileloading_ });
    }
  }
  
  this.dispatchEvent({type: 'loadstart', remains: ++this.tileloading_ } );


  // Abort existing request @TODO https://axios-http.com/fr/docs/cancellation
  //if (this.request_ && !this.tiled_) this.request_.abort();

  ol_ext_Ajax.get({
    url: this.table_.wfs,
    auth: this._auth,
    // WFS parameters
    data: this.getWFSParam(extent, projection),
    options: {},
    success: onSuccess,
    error: e => { onError('error', e) }
  })
}

export default EcoSource