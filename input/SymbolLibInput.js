import ol_ext_element from 'ol-ext/util/element';
import InputCollection from 'ol-ext/util/input/Collection'

import './SymbolLibInput.css'

/* Clone canvas */
function cloneCanvas(oldCanvas) {
  var newCanvas = document.createElement('canvas');
  var context = newCanvas.getContext('2d');
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;

  // copy img
  context.drawImage(oldCanvas, 0, 0);
  return newCanvas;
}

/** A list input to get/handle symbol lib
 * @memberof mcutils.input
 * @extends {InputCollection}
 * @param {Object} options a list of options
 *  @param {Element} [option.target]
 *  @param {Collection<SymbolLib>} options.symbolLib
 *  @param {boolean} [options.edit=true] symbol is editable
 *  @param {Array<string>} [option.filter] a list of geometry type to filter, default ['Point', 'LineString', 'Polygon']
 * @fires item:remove
 * @fires item:select
 * @fires item:dblclick
 * @fires item:duplicate
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
          content.appendChild(cloneCanvas(item.getImage()))
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
          if (options.edit!==false) {
            // Edit mode
            ol_ext_element.create('I', {
              className: 'fi-pencil',
              title: 'modifier le nom',
              click: () => {
                content.dataset.edit = '';
                editor.focus();
                const val = editor.value;
                editor.value = '';
                editor.value = val;
              },
              parent: content
            })
            // Duplicate
            ol_ext_element.create('I', {
              className: 'fg-color',
              title: 'modifier / dupliquer le style',
              click: () => {
                this.dispatchEvent({ type: 'item:duplicate', item: item });
              },
              parent: content
            })
            // Remove element from llist
            ol_ext_element.create('i', {
              className: 'fi-delete',
              title: 'supprimer le style',
              click: () => {
                symbolLib.remove(item);
                this.dispatchEvent({ type: 'item:remove' });
              },
              parent: content
            })
          }
          return content
        } else {
          return ol_ext_element.create('DIV', { className: 'hidden' })
        }
      } 
    });
  }
}

export default SymbolLibInput