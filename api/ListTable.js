import './ListTable.css'
import ol_Object from 'ol/Object'
import ol_ext_element from "ol-ext/util/element";
import input from 'ol-ext/util/input/Checkbox'

/** Control to display a list of items
 * @fires select
 * @fires check
 * @fires search
 * @fires click
 * @fires dblclick
 * @fires change:page
 * @fires draw:item
 * @fires draw:list
 */
class ListTable extends ol_Object {
  /** Constructor 
   * @param {Object} options
   *  @param {string} options.className 
   *  @param {number} [options.size=12] number of items in the list
   *  @param {Element} [options.target] 
   *  @param {boolean} [options.selection=false] enable list selection
   *  @param {boolean} [options.check=false] enable checkbox on lines
   */
  constructor(options) {
    options = options || {};
    options.size = options.size || 12;
    super(options);
    this.element = ol_ext_element.create('DIV', {
      className: 'mc-list ' + options.className + (options.selection ? ' mc-select' : '')
    });
    /* next/prev page on mousewheel
    this.element.addEventListener('wheel', (e) => {
      e.preventDefault();
      console.log(e.deltaY, e)
      if (e.deltaY > 0) try { this.element.querySelector('.next').click(); } catch(e) {}
      if (e.deltaY < 0) try { this.element.querySelector('.prev').click(); } catch(e) {}
    });
    */
    this._actions = [];
    this._errorElement = ol_ext_element.create('DIV', {
      className: 'mc-list-error',
      style: {
        display: 'none'
      },
      parent: this.element
    });
    this._listHeader = ol_ext_element.create('DIV', {
      className: 'mc-list-header',
      parent: this.element
    });
    this._listElement = ol_ext_element.create('UL', { 
      className: 'mc-ul',
      parent: this.element
    });
    this._listFooter = ol_ext_element.create('DIV', { 
      className: 'mc-list-footer',
      parent: this.element
    });
    this.setTarget(options.target);
    this.hasCheck(options.check);
  }
}

/** Set taget element
 * @param {Element} [target] if none remove from current target
 */
ListTable.prototype.setTarget = function(target) {
  if (target instanceof Element) {
    target.appendChild(this.element);
  } else {
    this.element.remove();
  }
};

/** Filter a set of map */
ListTable.prototype.filterList = function(data) {
  return data;
};

/** Get the current selected item
 * @returns {*}
 */
ListTable.prototype.getSelection = function() {
  return this._selection;
};

/** Clear selection
 */
ListTable.prototype.clearSelection = function() {
  const sel = this._listElement.querySelector('.mc-select')
  if (sel) sel.classList.remove('mc-select');
  this._selection = null;
  this.dispatchEvent({ type: 'select' })
}

/** Clear list
 */
ListTable.prototype.clear = function(info) {
  this._listElement.innerHTML = info || '';
  this._listFooter.innerHTML = 
  this._listHeader.innerHTML = '';
  this.showError();
}

/** Show the map list
 * @param {Array<Object>} maps
 * @param {number} offset
 * @param {number} max
 */
ListTable.prototype.drawList = function(maps, offset, max) {
  this.loading(false);
  maps = this._currentList = this.filterList(maps);
  offset = offset || 0;
  if (max === undefined) max = Infinity;
  this.clear();
  const ul = this._listElement;
  // List head
  const title = ol_ext_element.create('LI', {
    class: 'mc-list-head',
    parent: ul
  });
  this.drawHead(title);
  // Draw list
  maps.forEach(m => {
    const li = ol_ext_element.create('LI', {
      className: m.type,
      on: {
        click: (e) => {
          this.dispatchEvent({ type: 'click', item: m, checked: check.isChecked(), originalEvent: e });
          if (this._selection !== m) {
            if (e.target !== check.element) {
              this.dispatchEvent({ type: 'select', item: m, checked: check.isChecked() });
            }
            const sel = ul.querySelector('.mc-select')
            if (sel) sel.classList.remove('mc-select');
            li.classList.add('mc-select');
            this._selection = m;
          }
        },
        dblclick: (e) => {
          this.dispatchEvent({ type: 'dblclick', item: m, checked: check.isChecked(), originalEvent: e });
          /* Prevent selection?
          const sel = window.getSelection();
          if (sel) sel.removeAllRanges();
          */
        }
      },
      parent: ul
    });
    const check = new input({ className: ' small', parent: li, type:'checkbox' });
    check.input.addEventListener('click', e => e.stopPropagation() );
    check.on('check', e => {
      e.item = m;
      this.dispatchEvent(e);
    });
    this.drawItem(m, li);
    if (this._actions.length) {
      const opt = ol_ext_element.create('DIV', {
        parent: li,
        className: 'li-actions',
      });
      this._actions.forEach(a => {
        ol_ext_element.create('SPAN', {
            html: a.html,
            title : a.title || a.html,
            className: a.className || '',
            click: () => {
                a.action(m)
            },
            parent: opt,
        });
    
      })
    }
    this.dispatchEvent({ type: 'draw:item', item: m, element: li });
  });
  this.dispatchEvent({ type: 'draw:list', list: maps, offset: offset, max: max });
  // Display pages header / footer
  if (!max || max === Infinity || this.get('size') === 'all') return;
  // Calculate bounds
  const currentPage = Math.floor((offset || 0) / this.get('size'));
  this.set('currentPage', currentPage);
  const maxPage = Math.floor((max-1) / this.get('size'));
  const nbPage = 2;
  let bmin = Math.max(currentPage - nbPage/2, 0);
  const bmax = Math.min(bmin + nbPage, maxPage);
  bmin = Math.max(bmax - nbPage, 0);
  const bounds = [this._listHeader, this._listFooter];
  if (bmin === bmax) return;
  // Previous
  bounds.forEach(elt => {
    ol_ext_element.create('I', {
      className: (bmin !== 0 ? 'colored pprev' : 'none'),
      //click: () => this.showPage(currentPage - 5),
      click: () => {
        const p = 0;
        this.showPage(p);
        this.dispatchEvent({ type: 'change:page', page: p, size: this.get('size'), offset: p*this.get('size'), max: max });
      },
      parent: elt
    });
    ol_ext_element.create('I', {
      className: (currentPage > 0 ? 'colored prev' : 'none'),
      click: () => {
        const p = currentPage - 1;
        this.showPage(p);
        this.dispatchEvent({ type: 'change:page', page: p, size: this.get('size'), offset: p*this.get('size'), max: max });
      },
      parent: elt
    });
  });
  // Pages
  for (let i=bmin; i<=bmax; i++) {
    bounds.forEach(elt => {
      ol_ext_element.create('I', {
        html: (i+1),
        className: i===currentPage ? 'button-colored none' : 'colored',
        click: () => {
          this.showPage(i);
          this.dispatchEvent({ type: 'change:page', page: i, size: this.get('size'), offset: i*this.get('size'), max: max });
        },
        parent: elt
      })
    })
  }
  // Previous
  bounds.forEach(elt => {
    ol_ext_element.create('I', {
      className: 'colored ' + (currentPage < maxPage ? 'next' : 'none'),
      click: () => {
        const p = currentPage + 1;
        this.showPage(p);
        this.dispatchEvent({ type: 'change:page', page: p, size: this.get('size'), offset: p*this.get('size'), max: max });
      },
      parent: elt
    });
    ol_ext_element.create('I', {
      className: 'colored ' + (bmax < maxPage ? 'nnext' : 'none'),
      //click: () => this.showPage(currentPage + 5),
      click: () => {
        const p = maxPage;
        this.showPage(p);
        this.dispatchEvent({ type: 'change:page', page: p, size: this.get('size'), offset: p*this.get('size'), max: max });
      },
      parent: elt
    });
  });
};

/** Add a loading
 * @param {boolean} [b=true]
 */
ListTable.prototype.loading = function(b) { 
  if (b===false) {
    this.element.classList.remove('mc-loading');
  } else {
    this.element.classList.add('mc-loading');
  }
};

/** Display an error
 * @param {string} error
 * @param {boolean} clearList 
 */
ListTable.prototype.showError = function(error, clearList) { 
  if (error && clearList !== false) {
    this._listElement.innerHTML = '';
    this._listFooter.innerHTML = this._listHeader.innerHTML = '';
  }
  this._errorElement.style.display = (error ? '' : 'none');
  this._errorElement.innerHTML = '';
  ol_ext_element.create('DIV', {
    html: error,
    parent: this._errorElement
  });
  this.loading(false);
};

/** Draw the current list item
 * @param {*} item
 * @param {Element} li the list element where to draw the item
 * @api
 */
ListTable.prototype.drawItem = function(item, li) { console.warn('[ListTable::drawItem]',item, li) };

/** Draw the current list head
 * @param {Element} li the list element where to draw 
 * @api
 */
ListTable.prototype.drawHead = function(/* li */) {};

/** Function called to request a new page
 * @param {number} page
 */
ListTable.prototype.showPage = function(page) { console.warn('[ListTable::showPage] '+page) };

/** Search in the list
 * @param {string} [value='']
 */
ListTable.prototype.search = function(value) {
  this.set('query', value);
  this.dispatchEvent({ type: 'search', value: value })
  this.showPage(0);
};

/** Set the list mode
 * @param {string} [mode=list] the mode: list, gallery, mini
 */
ListTable.prototype.setMode = function(mode) {
  this.set('mode', mode);
  this.element.dataset.mode = mode;
};

/** Use checkbox
 * @param {boolean} [b] if undefined return the current value
 * @return {boolean}
 */
 ListTable.prototype.hasCheck = function(b) {
  if (b===true) {
    this.element.classList.add('mc-check');
  } else if (b===false) {
    this.element.classList.remove('mc-check');
  }
  return this.element.classList.contains('mc-check');
}

/** Check all lines
 * @param {boolean} b
 * @fires check:all
 */
ListTable.prototype.checkAll = function(b) {
  this.element.querySelectorAll('li > .ol-ext-check input[type="checkbox"]').forEach(c => {
    c.checked = b;
  })
  this.dispatchEvent({ type: 'check:all', checked: b })
}

/** Get list of checked items
 * @returns {Array<*>}
 */
ListTable.prototype.getChecked = function() {
  const checked = [];
  if (this._currentList && this.hasCheck()) {
    this.element.querySelectorAll('li > .ol-ext-check input[type="checkbox"]').forEach((c, i) => {
      if (c.checked) checked.push(this._currentList[i]);
    })
  }
  return checked;
}

/** Get the list items
 * @returns {Array<Object>}
 */
ListTable.prototype.getItems = function() {
  return this._currentList
}

/** Add action button on selected item
 * @param {object} options
 *  @param {string|Element} options.html
 *  @param {function} options.action
 *  @param {string} [options.title]
 *  @param {string} [options.className]
 */
ListTable.prototype.addAction = function(options) {
  this._actions.push({
    html: options.html,
    title: options.title || options.html,
    action: typeof(options.action) === 'function' ? options.action : function(){},
    className: options.className || ''
  })
}

export default ListTable
