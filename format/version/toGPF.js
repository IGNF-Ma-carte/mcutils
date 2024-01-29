/** @module version
 * @description Convert to V4 format
 */

/** Update Geoplateforme services
 * @param {} options
 */
function carteGPF(options) {
  options.layers.forEach(l => {
    // Services
    switch (l.type) {
      case 'WMTS': {
        l.wmtsparam.source.url = l.wmtsparam.source.url.replace(/^https:\/\/wxs.ign.fr\/([^\/]*)\/geoportail\/wmts/, 'https://data.geopf.fr/wmts')
        // Legend
        if (l.wmtsparam.data.legend) {
          l.wmtsparam.data.legend[0] = l.wmtsparam.data.legend[0].replace(/^https:\/\/wxs.ign.fr\/static\/legends/,'https://data.geopf.fr/annexes/ressources/legendes')
        }
        break;
      }
      case 'WMS': {
        l.wmsparam.source.url = l.wmsparam.source.url.replace(/^https:\/\/wxs.ign.fr\/[^\/]*\/geoportail\/([r|v])\/wms/, 'https://data.geopf.fr/wms-$1/wms')
        if (l.wmsparam.legend) {
          l.wmsparam.legend[0] = l.wmsparam.legend[0].replace(/^https:\/\/wxs.ign.fr\/static\/legends/,'https://data.geopf.fr/annexes/ressources/legendes')
        }
        break;
      }
      case 'WFS': {
        l.url = l.url.replace(/^https:\/\/wxs.ign.fr\/([^\/]*)\/geoportail\/wfs/, 'https://data.geopf.fr/wfs/ows')
        break;
      }
      default: {
        break;
      }
    }
    // Update legend url
    if (l.legend) {
      l.legend.items.forEach(leg => {
        if (leg.src) {
          leg.src = leg.src.replace(/^https:\/\/wxs.ign.fr\/static\/legends/,'https://data.geopf.fr/annexes/ressources/legendes')
        }
      })
    }
  });
}

export { carteGPF }