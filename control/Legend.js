import ol_ext_element from 'ol-ext/util/element';
import SymbolLibInput from '../input/SymbolLibInput'
import ol_Object from 'ol/Object'
import InputCollection from 'ol-ext/util/input/Collection'

import './Legend.css'

import Legend from 'ol-ext/legend/Legend'
import ol_legend_Item from 'ol-ext/legend/Item';
import dialogMessage from '../dialog/dialogMessage';
import SymbolLib from '../style/SymbolLib';

/** Color brewer control
 * @memberof mcutils.control
 * @constructor
 * @extends {ol_Object}
 * @param {Object} options
 *  @param {SymbolLib} options.symbolLib
 *  @param {Legend} options.legend
 */
class LegendControl extends ol_Object {
  constructor(options) {
    options = options || {};
    super(options);
    const elt = this.element = ol_ext_element.create('DIV', {
      className: 'mc-legend-control',
    })
    // Title line
    const title = ol_ext_element.create('DIV', {
      className: 'title',
      parent: elt
    })
    ol_ext_element.create('H3', {
      text: 'Bibliothèque de symboles',
      parent: title
    })
    ol_ext_element.create('H3', {
      text: 'Légende',
      parent: title
    })
    // Menu
    ol_ext_element.create('A', {
      html: 'Ajouter un sous-titre...',
      parent: title,
      click: () => {
        const i = Math.max(this.legendInput.getSelectPosition(), 0);
        legendItems.insertAt(i, new ol_legend_Item({
          title: ''
        }))
        this.legendInput.selectAt(i);
        // Simulate a click on the element
        this.legendInput.element.querySelectorAll('.fi-pencil')[i].click();
      }
    })
    ol_ext_element.create('A', {
      html: 'Vider la légende...',
      parent: title,
      click: () => {
        if (!legendItems.getLength()) return;
        dialogMessage.showAlert(
          'Etes-vous sur de vouloir supprimer toutes les lignes de la légende ?',
          { ok: 'ok', cancel: 'cancel'},
          (b) => {
            if (b==='ok') legendItems.clear()
          }
        )
      }
    })

    // List of symbol
    this.symbolInput = new SymbolLibInput({
      className: 'symbol',
      symbolLib: options.symbolLib,
      target: elt
    })
    this.symbolInput.on('item:select', (e) => {
      if (e.item) elt.dataset.symbol = '';
      else delete elt.dataset.symbol;
    })
    this.symbolInput.addEventListener('item:dblclick', () => {
      transfertBt.click();
    })

    // Control div
    const ctrl = ol_ext_element.create('DIV', {
      className: 'mc-control',
      parent: elt
    })
    // Add to legend button
    const transfertBt = ol_ext_element.create('BUTTON', {
      className: 'button button-colored play',
      html: '<i class="fi-play"></i>',
      title: 'ajouter à la légende',
      click: () => {
        const s = this.symbolInput.getSelect();
        if (!s) return;
        const i = this.legendInput.getSelectPosition() +1;
        // Insert new element
        legendItems.insertAt(i, new ol_legend_Item({
          title: s.get('name') || '',
          feature: s._feature.clone()
        }))
        this.legendInput.selectAt(i);
      },
      parent: ctrl
    })
    // Add to symbollib button
    ol_ext_element.create('BUTTON', {
      className: 'button button-colored playback',
      html: '<i class="fi-play"></i>',
      title: 'ajouter à la bibliothèque',
      click: () => {
        const s = this.legendInput.getSelect();
        if (!s || !s.get('feature')) return;
        const i = this.symbolInput.getSelectPosition() +1;
        // Insert new element
        options.symbolLib.insertAt(i, new SymbolLib({
          name: s.get('title').replace(/\n/g, ' ') || '',
          feature: s.get('feature').clone()
        }))
        this.symbolInput.selectAt(i);
      },
      parent: ctrl
    })

    // Legend input
    const legendItems = options.legend.getItems();
    this.legendInput = new InputCollection({
      collection: legendItems,
      className: 'mcSymbolLib',
      getTitle: item => {
        // Legend Layer
        const isLayer = item instanceof Legend;
        const title = isLayer ? 'Calque - ' + item._layer.get('title') || '' : item.get('title');
        const prop = item.getProperties();
        const content = ol_ext_element.create('DIV', { className: 'mcSymbol' + (prop.feature ? ' item' : ' title') + (isLayer ? ' layer' : '')})
        content.appendChild(Legend.getLegendImage(prop))
        const span = ol_ext_element.create('SPAN', {
          html: title.replace(/\n/, '<br/>')  + '&nbsp;',
          parent: content
        });
        const txt = ol_ext_element.create('TEXTAREA', {
          placeHolder: prop.feature ? '' : 'sous-titre...',
          parent: content
        })
        // Edit mode
        if (!isLayer) {
          ol_ext_element.create('I', {
            className: 'fi-pencil',
            click: () => {
              txt.style.display = 'block';
              txt.value = title;
              txt.focus();
              txt.addEventListener('focusout', () => {
                txt.style.display = '';
                item.set('title', txt.value);
                span.innerHTML = item.get('title').replace(/\n/, '<br/>') + '&nbsp;';
                options.legend.refresh();
              })
            },
            parent: content
          })
        }
        // Remove element from llist
        ol_ext_element.create('i', {
          className: 'fi-delete',
          click: () => {
            options.legend.getItems().remove(item);
            this.symbolInput.dispatchEvent({ type: 'item:remove' });
          },
          parent: content
        })
        return content;
      },
      target: elt
    })
    this.legendInput.addEventListener('item:dblclick', (e) => {
      this.legendInput.element.querySelectorAll('.fi-pencil')[e.position].click();
    })
    this.legendInput.on('item:select', (e) => {
      if (e.item && e.item.get('feature')) elt.dataset.legend = '';
      else delete elt.dataset.legend;
    })
  }
}

/** Remove from DOM listeners
 */
LegendControl.prototype.remove = function() {
  this.symbolInput.removeCollection();
  this.legendInput.removeCollection();
}

export default LegendControl
