import dialog from "./dialog";
import LegendControl from '../control/Legend.js'
import ol_ext_element from "ol-ext/util/element";

/** Legend configuration dialog 
 * See {@link http://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Dialog.html|ol/control/Dialog}
 * @memberof dialog
 * @instance
 * @param {Collection<SymbolLib>} symbolLib
 * @param {Legend} legend
 * @param {Object} options
 *  @param {string} [title='Légende']
 *  @param {string} [className]
 *  @param {Collection<layer>} [layers]
 */
function legendConfigurator(symbolLib, legend, options) {
  options = options || {}

  const lcontrol = new LegendControl({
    symbolLib: symbolLib, 
    legend: legend
  });

  dialog.show({
    title: options.title || 'Légende',
    className: options.className,
    content: lcontrol.element,
    buttons: ['ok']
  })

  // Layers with legends
  const layers = [];
  (options.layers || []).forEach(l => {
    if (l._legend) {
      layers.push(l)
    }
  });
  // New layers
  if (layers.length) {
    const div = ol_ext_element.create('DIV', { className: 'layerLegend', parent: dialog.getContentElement() });
    ol_ext_element.create('LABEL', {
      text: 'Utliser la légende du calque : ',
      parent: div
    })
    // Select layers
    const select = ol_ext_element.create('SELECT', { 
      change: () => {
        const n = parseInt(select.value);
        if (n > -1) {
          if (legend.getItems().getArray().indexOf(layers[n]._legend) < 0) {
            legend.addItem(layers[n]._legend)
          } 
          lcontrol.legendInput.select(layers[n]._legend)
        }
        select.value = -1;
      },
      parent: div
    });
    ol_ext_element.create('OPTION', {
      text: '...',
      value: -1,
      parent: select
    })
    // Layers as options
    layers.reverse().forEach((l, i) => {
      ol_ext_element.create('OPTION', {
        text: l.get('title') || l.get('name'),
        value: i,
        parent: select
      })
    });
  }

  // remove on close
  const remove = ()  => {
    lcontrol.remove();
    dialog.un('hide', remove);
  }
  dialog.on('hide', remove);
  return dialog;
}

export default legendConfigurator
