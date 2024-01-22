import '../../Carte'

import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import GeoTIFF from 'ol/source/GeoTIFF.js';

import './cog.css'

const source = new GeoTIFF({
  sources: [
    {
      /** /
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif',
      /*/
      // url: 'https://gpf-download-qua.priv.geopf.fr/download/pva/C2034-0041/F1934-2034_0209.tif',
      url: 'https://data-pprd.priv.geopf.fr/telechargement/download/perf_rlt/P15000222/IGNF_PVA_1-0__2015-09-10__CP15000222_15FD2725x00005_01874.tif'
      /**/
    },
  ],
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: source,
    }),
  ],
  view: source.getView(),
});
map.getViewport().classList.add('ol-ready');

window.map = map;
window.geotiff = source;