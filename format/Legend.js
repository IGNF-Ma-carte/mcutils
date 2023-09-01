import BaseFormat from "./Base";
import ol_Feature from "../ol/Feature";
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import loadFonts from '../font/loadFonts'
import { getStyleFn, style2IgnStyle } from '../style/ignStyleFn'
import olLegend from "ol-ext/legend/Legend";
import LegendImage from "../ol/LegendImage";

/** MousePosition contorl reader/writer
 * @memberof mcutils.format.control
 * @extends mcutils.format.Base
 */
class Legend extends BaseFormat {
  /** Constructor 
   * @param {Legend} legend if defined, read the options
   * @param {Object} options
   * @param {boolean} [append=false]
   * @param {Array<olLayer>} [layers]
   */
  constructor(legend, options, append, layers) {
    super();
    if (legend) this.read(legend, options, append, layers)
  }
}

/** Read Legend
 * @param {ol_legend_Legend} Legend
 * @param {Object} options
 * @param {boolean} [append=false]
 * @param {Array<olLayer>} [layers]
 */
Legend.prototype.read = function(legend, options, append, layers) {
  if (!options) return;
  if (!append) {
    legend.getItems().clear();
    legend.setTitle(options.title || options.legendtitle || '');
    // Size / lineheight
    legend.set('lineHeight', options.lineHeight)
    if (options.type) legend.set('type', options.type)
  }

  if (options.items) {
    options.items.forEach(l => {
      if (l.type === 'Layer') {
        if (layers) {
          const layer = layers.find(li => li.get('id') === l.id);
          if (layer && layer._legend) {
            legend.addItem(layer._legend)
          }
        }
      } else if (l.type === 'Image') {
        legend.addItem(new LegendImage({ src: l.src }))
      } else {
        let feature;
        if (/Titre/.test(l.type)) {
          feature = undefined;
        } else if (/Point/.test(l.type)) {
          feature = new ol_Feature(new ol_geom_Point([0,0]));
        } else if (/LineString/.test(l.type)) {
          feature = new ol_Feature(new ol_geom_LineString([0,0]));
        } else {
          feature = new ol_Feature(new ol_geom_Polygon([[0,0]]));
        }
        if (feature) {
          feature.setIgnStyle(l.style)
          feature.setStyle(getStyleFn())
        }
        legend.addItem({
          title: l.name,
          feature: feature
        })
      }
    })
  }
  loadFonts(() => {
    legend.refresh();
  });
};

/** Write Legend
 * @param {ol_legend_Legend} legend
 * @return {Object}
 */
Legend.prototype.write = function(legend) {
  const options = {};
  
  options.legendtitle = legend.getTitle();
  options.lineHeight = legend.get('lineHeight');
  options.legendWidth = 300;
  options.legendParam = { width: 300, lineHeight: options.lineHeight }
  // options.legendPos = "bottom-left"
  if (legend.get('type')) options.type = legend.get('type');

  // Get legend items
  options.items = [];
  legend.getItems().forEach(item => {
    if (item instanceof olLegend) {
      if (item._layer) {
        options.items.push({
          type: 'Layer',
          id: item._layer.get('id')
        })
      }
    } else if (item instanceof LegendImage) {
      options.items.push({
        type: 'Image',
        src: item.get('src')
      });
    } else {
      const opt = {
        name: item.get('title'),
        type: 'Titre'
      }
      const feature = item.get('feature')
      if (feature) {
        opt.type = feature.getGeometry().getType();
        if (typeof(feature.getStyle()) !== 'function') {
          opt.style = style2IgnStyle(feature);
        } else {
          opt.style = feature.getIgnStyle();
        }
      }
      options.items.push(opt);
    }
  })

  return options;
}

export default Legend
  