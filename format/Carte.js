import BaseFormat from './Base';
import { fromLonLat, toLonLat } from 'ol/proj';
import GeoportailFormat from './layer/Geoportail'
import EdugeoFormat from './layer/Edugeo'
import VectorStyleFormat from './layer/VectorStyle';
import GeoImageFormat from './layer/GeoImage';
import StatisticFormat from './layer/Statistic';
import WMS from './layer/WMS';
import WMTS from './layer/WMTS';
import MousePositionFormat from './control/MousePosition';
import LegendFormat from './control/Legend';

import { upgradeCarte } from './version/version.js'
import File from '../format/layer/File';
import ECReport from '../format/layer/ECReport';
import XYZ from '../format/layer/XYZ';
import WFS from '../format/layer/WFS';
import MVT from '../format/layer/MVT';
import PBF from '../format/layer/PBF';
import Eco from '../format/layer/ECo';
import Color from '../format/layer/Color';
import Pattern from '../format/layer/Pattern';

/** Base class for reading / writing .macarte
 * @memberof mcutils.format
 * @api
 */
class Carte extends BaseFormat {
  /** Constructor 
   */
  constructor() {
    super();
  }
}

/** layer formats 
 * @private
 */
Carte.layerFormats = [
  GeoportailFormat,
  EdugeoFormat,
  GeoImageFormat,
  StatisticFormat,
  VectorStyleFormat,
  WMTS,
  WMS,
  XYZ,
  File,
  ECReport,
  WFS,
  MVT,
  PBF,
  Eco,
  Color,
  Pattern
];

/** Read method
 * @param {mcutils.Carte} carte
 * @param {Object} options json object
 * @return {mcutils.Carte}
 */
Carte.prototype.read = function(carte, options) {
  upgradeCarte(options);
  const map = carte.map;
  // Reset layer ID
  carte.layerId_ = 0;
  // map
  map.set('title', options.param.title || options.param.titre || '');
  map.set('description', options.param.description || '');
  // Read view
  this.readView(carte, options);
  // Read layers
  map.getLayers().clear();
  this.readLayers(options, carte.get('key')).forEach( l => map.addLayer(l) );
  // Read controls
  this.readControls(carte, options);
  // Read symbol lib
  carte.getSymbolLib().clear();
  options.symbolLib.forEach(s => {
    if (/Point|Polygon|LineString/.test(s.type)) carte.addSymbolLib(s)
  })
  return carte;
};

/** Read view param
 * @param {View} view
 * @param {Object} options json object
 */
Carte.prototype.readView = function(carte, options) {
  const view = carte.map.getView();
  view.setCenter(fromLonLat([options.param.lon, options.param.lat], view.getProjection()));
  view.setZoom(options.param.zoom);
  view.setRotation(options.param.rot);
  // Read permalink
  const replace = carte.getControl('permalink').getUrlReplace();
  const plink = carte.getControl('permalink');
  plink.setPosition(true);
  carte.map.set('noMouseWheel', plink.hasUrlParam('noZoom'));
  // Disable permalink
  if (!replace) carte.getControl('permalink').setUrlReplace(false);
};

/** Read controls for the current carte
 * @param {mcutils.Carte} carte
 * @param {Object} options json object
 */
Carte.prototype.readControls = function(carte, options) {
  // Controls
  const cparam = options.controls;
  for (let i in cparam) {
    carte.showControl(i, cparam[i]);
  }
  // Coordinates
  new MousePositionFormat(carte.getControl('mousePosition'), cparam.mousePosition);
  // Legende
  new LegendFormat(carte.getControl('legend'), cparam.legend, false, carte.getMap().getLayers().getArray());
  carte.showControl('legend', cparam.legend.visible);
};

/** Read layers
 * @param {Object} options json object
 * @param {string} key GPP API key
 * @return {Array<ol/layer/Layer>}
 */
Carte.prototype.readLayers = function(options, key) {
  const layers = [];
  options.layers.forEach((l) => {
    const layer = this.readLayer(l, key);
    if (layer) {
      layers.push(layer);
    }
  });
  return layers;
};

/** Read a single layer
 * @param {Object} options layer options (json object)
 * @param {string} key GPP API key
 * @return {ol/layer/Layer}
 */
Carte.prototype.readLayer = function(options, key) {
  for (let i=0; i < Carte.layerFormats.length; i++) {
    const format = new Carte.layerFormats[i];
    const layer = format.read(options, key);
    if (layer) return layer
  }
  return null;
};

/** Write layers
 * @param {Array<ol/layer/Layer>}
 * @param {boolean} [uncompressed=false]
 * @returns {Object} options json object
 */
Carte.prototype.writeLayers = function(layers, uncompressed) {
  const data = [];
  layers.forEach(l => {
    const layer = this.writeLayer(l, uncompressed);
    if (layer) {
      data.push(layer);
    } else {
      console.warn('Layer [' + l.get('type') + ':' + l.get('title') + ']  has no writer...')
    }
  })
  return data;
};

/** Write a single layer
 * @param {ol/layer/Layer}
 * @returns {Object} options layer options (json object)
 */
Carte.prototype.writeLayer = function(layer, uncompressed) {
  for (let i=0; i < Carte.layerFormats.length; i++) {
    const format = new Carte.layerFormats[i];
    const options = format.write(layer, uncompressed);
    if (options) return options;
  }
  return null;
};

/** Write method
 * @param {mcutils.Carte} carte
 * @param {boolean} [uncompressed=false]
 * @return {Object|boolean}
 */
Carte.prototype.write = function(carte, uncompressed) {
  const c = {
    param: {
      titre: carte.get('title'),
      description: carte.get('description')
    }
  };
  // Write view
  const view = carte.getMap().getView();
  const lonlat = toLonLat(view.getCenter());
  c.param.lon = lonlat[0];
  c.param.lat = lonlat[1];
  c.param.zoom = view.getZoom();
  c.param.rot = view.getRotation();
  // Write controls
  c.param.controlParams = {
    zoomBtn: carte.hasControl('zoom'),
    scaleLine: carte.hasControl('scaleLine'),
    pSearchBar: carte.hasControl('searchBar'),
    legend: carte.hasControl('legend'),
    coords: carte.hasControl('mousePosition'),
    selectLayer: carte.hasControl('layerSwitcher'),
    geoloc: carte.hasControl('locate'),
    profil: carte.hasControl('profil'),
    printDlg: carte.hasControl('printDlg'),
  }
  c.param.proj = new MousePositionFormat().write(carte.getControl('mousePosition'));
  // Write legend
  c.legende = (new LegendFormat).write(carte.getControl('legend'));
  // Write layers
  c.layers = this.writeLayers(carte.getMap().getLayers(), uncompressed);
  // Write symbol lib
  c.symbolLib = [];
  carte.getSymbolLib().forEach(s => {
    c.symbolLib.push(s.stringify())
    /*{
      name: s.get('name'),
      type: s.getType(),
      style: s.getIgnStyle()
    }*/
  })
  // the carte
  return c;
};

window.format = new Carte()

export default Carte
