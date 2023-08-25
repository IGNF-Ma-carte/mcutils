import ol_ext_element from 'ol-ext/util/element';
import InputCollection from 'ol-ext/util/input/Collection'

import './SymbolLibInput.css'

/** A list input to get/handle symbol lib
 * @memberof mcutils.input
 * @extends {InputCollection}
 * @param {Object} options a list of options
 *  @param {Element} [option.target]
 *  @param {Collection<SymbolLib>} options.symbolLib
 *  @param {Array<string>} [option.filter] a list of geometry type to filter, default ['Point', 'LineString', 'Polygon']
 * @fires item:remove
 * @fires item:select
 * @fires item:dblclick
 * @fires item:order
 * @api
 */
class SymbolLibInput extends InputCollection {
  constructor(options) {
    options = options || {}
    const symbolLib = options.symbolLib;
    super({
      target: options.target,
      className: 'mcSymbolLib' + (options.className ? ' '+options.className : ''),
      collection: symbolLib,
      getTitle: (item) => {
        if (!options.filter || options.filter.indexOf(item.getType()) >= 0) {
          const content = ol_ext_element.create('DIV', { className: 'mcSymbol' })
          content.appendChild(item.getImage())
          const editor = ol_ext_element.create('INPUT', {
            type: 'text',
            placeholder: 'nom du symbole',
            value: item.get('name'),
            on: {
              // Remove edit mode on foucusout
              focusout: () => {
                delete content.dataset.edit;
              },
              // Prevent default event on keydown
              keydown: (e) => {
                switch (e.key) {
                  case 'Enter': {
                    item.set('name', editor.value);
                    span.innerText = editor.value;
                  }
                  //@fallthrough
                  case 'Escape': {
                    // remove edit mode
                    delete content.dataset.edit;
                    e.preventDefault();
                  }
                }
              }
            },
            parent: content
          })
          // Title
          const span = ol_ext_element.create('SPAN', { 
            text: item.get('name'),
            parent: content
          });
          // Edit mode
          ol_ext_element.create('I', {
            className: 'fi-pencil',
            click: () => {
              content.dataset.edit = '';
              editor.focus();
              const val = editor.value;
              editor.value = '';
              editor.value = val;
            },
            parent: content
          })
          // Remove element from llist
          ol_ext_element.create('i', {
            className: 'fi-delete',
            click: () => {
              symbolLib.remove(item);
              this.dispatchEvent({ type: 'item:remove' });
            },
            parent: content
          })
          return content
        } else {
          return ol_ext_element.create('DIV', { className: 'hidden' })
        }
      } 
    });
  }
}

export default SymbolLibInput