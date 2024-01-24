import '../../Carte'

import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import View from 'ol/View';
import { buffer } from 'ol/extent'

import './cog.scss'

const source = new GeoTIFF({
  sources: [
    {
      /** /
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif'
      /*/
      // url: 'https://gpf-download-qua.priv.geopf.fr/download/pva/C2034-0041/F1934-2034_0209.tif',
      url: 'https://data-pprd.priv.geopf.fr/telechargement/download/perf_rlt/P15000222/IGNF_PVA_1-0__2015-09-10__CP15000222_15FD2725x00005_01874.tif'
      /**/
    },
  ],
  convertToRGB: true,
});
let layer = new TileLayer({
  source: source,
});

const map = new Map({
  target: 'map',
  layers: [ layer ],
  view: source.getView(),
});
map.getViewport().classList.add('ol-ready');


// Load new COG
const cogInput = document.querySelector('input')
cogInput.addEventListener('change', e => {
  map.removeLayer(layer)
  // New COG
  const source = new GeoTIFF({
    sources: [{ url: e.target.value }],
    convertToRGB: true,
  });
  layer = new TileLayer({
    source: source,
  })
  map.addLayer(layer)
  document.body.dataset.loading = '';
  source.getView().then(v => {
    // Add zoom levels
    v.resolutions.unshift(v.resolutions[0] * 2)
    v.resolutions.push(v.resolutions[v.resolutions.length-1] / 2)
    // Extent buffer
    v.extent = buffer(v.extent, (v.extent[2]-v.extent[0])/4)
    // Set view
    map.setView(new View(v))
    delete document.body.dataset.loading;
  })
})

// Select
document.querySelector('select').addEventListener('change', e => {
  cogInput.value = e.target.value;
  cogInput.dispatchEvent(new Event('change'));
})

window.map = map;
window.geotiff = source;