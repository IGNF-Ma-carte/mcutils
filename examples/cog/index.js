import '../../Carte'

import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import View from 'ol/View';
import { buffer } from 'ol/extent'
import { fromUrl } from 'geotiff';

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
let layer = new TileLayer({});

const map = new Map({
  target: 'map',
  layers: [ layer ],
  view: source.getView(),
});
map.getViewport().classList.add('ol-ready');


/** Get vignette */
const canvas = document.querySelector('#vignette canvas');

function getVignette(url) {
  fromUrl(url).then(geoTiffFile => {
    console.log(geoTiffFile)
    geoTiffFile.getImageCount().then(nb => {
      console.log(nb)
      geoTiffFile.getImage(nb-1).then(image => {
        console.log(image.getWidth() + 'x' + image.getHeight())
        /* Convert image to RGB / canvas */
        image.readRGB().then(geoTiffDataRGB => {
          const width = geoTiffDataRGB.width;
          const height = geoTiffDataRGB.height;

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', {willReadFrequently: true});
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;  // array of RGBA values
        
          // convert GeoTiff's RGB values to ImageData's RGBA values
          for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
              const srcIdx = 3 * i * width + 3 * j;
              const idx = 4 * i * width + 4 * j;
              data[idx] = geoTiffDataRGB[srcIdx];
              data[idx + 1] = geoTiffDataRGB[srcIdx + 1];
              data[idx + 2] = geoTiffDataRGB[srcIdx + 2];
              data[idx + 3] = 255;  // fully opaque
            }
          }
          ctx.putImageData(imageData, 0, 0);
          console.log('ok')
        })
        /**/
      });
    });
  });
}

// Load new COG
const cogInput = document.querySelector('input')
cogInput.addEventListener('change', e => {
  // Get a vignette
  getVignette(e.target.value)

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
    v.resolutions.push(v.resolutions[v.resolutions.length-1] / 2)
    // Extent buffer
    v.extent = buffer(v.extent, (v.extent[2] - v.extent[0])/4)
    // Set view
    map.setView(new View(v))
    delete document.body.dataset.loading;
  })
  window.source = source
})

// Select
document.querySelector('select').addEventListener('change', e => {
  cogInput.value = e.target.value;
  cogInput.dispatchEvent(new Event('change'));
})
document.querySelector('select').value = '';

window.map = map;
window.geotiff = source;