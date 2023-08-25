/* Add getFeatureInfo on images layers */

import Geoportail from "ol-ext/source/Geoportail";
import WMTS from 'ol/source/WMTS'
import WMS from 'ol/source/TileWMS'
import ol_ext_Ajax from "ol-ext/util/Ajax";

WMTS.prototype.getFeatureInfoUrl = Geoportail.prototype.getFeatureInfoUrl
WMTS.prototype.getFeatureInfo = Geoportail.prototype.getFeatureInfo

WMS.prototype.getFeatureInfo = function(coord, resolution, options) {
  const url = this.getFeatureInfoUrl(
    coord,
    resolution,
    'EPSG:3857', // this.getProjection()
    {'INFO_FORMAT': options.INFO_FORMAT}
  );
  ol_ext_Ajax.get({
    url: url,
    dataType: options.format || 'text/plain',
    options: {
      encode: false
    },
    success: function (resp) {
      if (options.callback)
        options.callback(resp)
    },
    error: options.error || function () { }
  })
}
