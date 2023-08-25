import ol_ext_element from "ol-ext/util/element"; 
import MacarteAPI from './MacarteApi'; // eslint-disable-line no-unused-vars

import ListTable from './ListTable'
import ol_ext_input_Switch from "ol-ext/util/input/Switch";
import getMediaFolderDialog from "../dialog/getMediasFolderDialog";

import './ListCarte'

import './ListMedias.css'

// Current folder 
const MCMediaFolder = 'MC@media-folder';

// Convert to ko, Mo, etc.
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Octets';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Octets', 'ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/** Control to display a list of medias
 */
class ListMedias extends ListTable {
  /** Constructor 
   * @fires check
   * @fires select
   * @fires search
   * @fires click
   * @fires dblclick
   * @fires change:page
   * @fires draw:item
   * @fires draw:list
   * @param {MacarteAPI} api
   * @param {Object} options
   *  @param {Element} [options.target] 
   *  @param {boolean} [options.search=false] enable search input
   *  @param {boolean} [options.thumb] set thumb selection, if undefined options is hidden 
   *  @param {boolean} [options.limit=false] show limit list
   *  @param {boolean} [options.size=12] current size (12x)
   */
  constructor(api, options) {
    options = options || {};
    options.className = 'mc-list-media';
    super(options);
    this.api = api;

    // Search header
    let head = ol_ext_element.create('DIV');
    this.element.insertBefore(head, this.element.firstChild);

    // Add search
    if (options.search) {
      const search = ol_ext_element.create('DIV', { className: 'mc-search', parent: head });
      const searchInput = ol_ext_element.create('INPUT', {
        type: 'search',
        placeholder: 'Rechercher...',
        parent: search 
      });
      ol_ext_element.create('BUTTON', {
        className: 'search button-colored',
        html: 'OK',
        type: 'button',
        parent: search
      })
      ol_ext_element.addListener(searchInput, ['change', 'search'], () => {
        this.search(searchInput.value);
      });
    }
    this._countDiv = ol_ext_element.create('DIV', { className: 'media-count colored', parent: options.search ? head : undefined });
    this._filterDiv = ol_ext_element.create('DIV', { className: 'filterOptions', parent: options.search ? head : undefined });

    this._filters = {};
    if (options.search) {
      const filter = ol_ext_element.create('DIV', { className: 'filters' });
      this.element.insertBefore(filter, head.nextSibling);
      this.element.classList.add('mc-filter');
      ol_ext_element.create('H2', { 
        className: 'folders selected', 
        html: 'Catégories', 
        click: (e) => {
          e.target.classList.toggle('selected')
        },
        parent: filter
      });
      this._filters.folders = ol_ext_element.create('UL', { className: 'folders', parent: filter });
    }

    // Header
    head = ol_ext_element.create('DIV', { className: 'mc-media-header', parent: head });

    // Thumb
    this._thumbnail = new ol_ext_input_Switch({
      className: 'thumb',
      after: 'vignette',
      checked: !!options.thumb,
      type: 'checkbox',
      parent: head
    });
    this._thumbnail.on('check', e => {
      this.set('thumb', e.checked);
    })
    this.setThumb(options.thumb);

    this.set('folder', localStorage.getItem(MCMediaFolder) || '');

    if (options.search) {
      let div = ol_ext_element.create('DIV', { className: 'mc-filter', parent: head });
      ol_ext_element.create('BUTTON', { 
        className: 'fi-filter', 
        type: 'button',
        title: 'Filtres de recherche...',
        click: () => {
          this.element.classList.toggle('mc-filter');
        },
        parent: div 
      });
      ol_ext_element.create('LABEL', { 
        html: 'Filtres', 
        click: () => {
          this.element.classList.toggle('mc-filter');
        },
        parent: div 
      });
    } else {
      // Folders
      const fold = ol_ext_element.create('DIV', { 
        className: 'mc-select-folder',
        parent: head 
      });
      const select = ol_ext_element.create('SELECT', { 
        change: () => {
          this.setFolder(select.value)
        },
        parent: fold 
      });
    }

    // Special header
    this._headerDiv = ol_ext_element.create('DIV', { className: 'mc-list-head', parent: head });

    // Limit
    if (options.limit) {
      const div = ol_ext_element.create('DIV', {
        className: 'mc-limit' ,
        parent: head 
      });
      ol_ext_element.create('LABEL', { html: 'Médias par page', parent: div });
      const size = ol_ext_element.create('SELECT', { 
        change: () => {
          this.set('size', parseInt(size.value));
          this.showPage(0);
        },
        parent: div
      });
      [12,24,36,48,96].forEach(i => {
        const o = ol_ext_element.create('OPTION', { value: i, html: i, parent: size });
        if (options.size === i) o.selected = true;
      });
    }

    // Update folders
    this.updateFolders();
  }
}

/** Get header to add new buttons
 * @returns {Element}
 */
ListMedias.prototype.getHeaderElement = function() {
  return this._headerDiv;
};

/** Update folder list (when new added)
 * @param {function} cback call when folders are updated
 */
ListMedias.prototype.updateFolders = function(cback) {
  // Load folders
  this.api.getMediasFolders(folders => {
    const current = this.get('folder');
    // Update list
    const select = this.element.querySelector('.mc-select-folder select')
    if (select) select.innerHTML = '<option value="">Tous</option>';
    if (!folders.error) {
      folders.sort((a,b) => {
        if (a===b) return 0;
        if (a==='Non classé') return -1;
        if (b==='Non classé') return 1;
        return (a<b ? -1 : 1);
      });
      this.set('folders', folders)
      folders.forEach(f => {
        if (f) {
          const opt = ol_ext_element.create('OPTION', { 
            html: f,
            parent: select
          });
          if (current===f) opt.selected = true;
        }
      })
    }
    // Update filter
    if (this._filters.folders) this._filters.folders.innerHTML = '';
    if (!folders.error) {
      folders.forEach(f => {
        ol_ext_element.create('LI', { 
          html: ol_ext_element.create('SPAN', { html: f }),
          click: () => {
            this.setFolder(f);
          },
          parent: this._filters.folders
        });
      });
    }
    // Update filters / folders
    this.setFolder(current, true)
    // Callback
    if(typeof(cback) === 'function') cback(folders);
  })
};

/** Get folder dialog
 * @param {function} callback
 */
ListMedias.prototype.getFolderDialog = function(options, callback) {
  options.folders = this.get('folders');
  getMediaFolderDialog(options, callback);
};

/** Set current folder and update the list
 * @param {string} [folder]
 */
ListMedias.prototype.setFolder = function(folder, force) {
  folder = folder || '';
  if (folder === this.get('folder') && !force) return;
  const folders = this.get('folders');
  const options = this.element.querySelector('.filterOptions');
  if (options) options.innerHTML = '';
  if (folders && folders.indexOf(folder >= 0)) {
    localStorage.setItem(MCMediaFolder, folder);
    this.element.querySelectorAll('.mc-select-folder option').forEach(f => {
      f.selected = (f.innerText === folder);
    });
    if (folder) {
      ol_ext_element.create('DIV', {
        className: 'filter button-colored',
        html: '<i class="fi-galerie-image"></i>' + folder,
        title: 'supprimer...',
        click: () => {
          this.setFolder();
        },
        parent: options
      })
    }
    this.set('folder', folder);
    this.showPage()
  }
};

/** Set thumbnail button
 * @param {boolean} [b] if undefined the buuton is masked
 */
ListMedias.prototype.setThumb = function(b) {
  if (b===undefined) {
    this.element.classList.add('noThumb')
  } else {
    this.element.classList.remove('noThumb')
  }
  this._thumbnail.input.checked = !!b;
  this.set('thumb', !!b);
};

/** Show the media list
 * @param {Object} m media
 * @param {element} li list element
 */
ListMedias.prototype.drawItem = function(m, li) {
  li.title = m.name;
  // Icon
  const icon = ol_ext_element.create('DIV', {
    className: 'mc-icon',
    parent: li
  });
  icon.style['background-image'] = 'url(' + m.thumb_url + '?' + (new Date).getTime() + ')';
  // Name
  ol_ext_element.create('span', {
    html: m.name,
    className: 'mc-name',
    parent: li
  });
  // Size
  ol_ext_element.create('span', {
    html: formatBytes(m.size),
    className: 'mc-ko',
    parent: li
  });
  // Info
  ol_ext_element.create('span', {
    html: (new Date(m.uploaded_at)).toLocaleDateString(),
    className: 'mc-date',
    parent: li
  });
};

/** Show the current page
 * @param {number} page
 */
ListMedias.prototype.showPage = function(page) {
  this.loading(true);
  if (!page || page < 0) page = 0;
  const offset = (page * this.get('size')) || 0
  this.api.getMedias({
    offset: offset,
    name: this.get('query') || '',
    folder: this.get('folder') || '',
    sort: this.get('sort') || 'date',
    limit: this.get('size')
  }, (e) => {
    if (!e.error) {
      this.drawList(e.medias, e.offset || offset, e.count);
      if (!e.count) {
        this.showError('Aucun résultat...')
      }
      this._countDiv.innerText = e.count + ' image' + (e.count>1 ? 's' : '');
    } else {
      this.showError('[ERROR '+e.status+'] '+e.statusText);
      e.type = 'error';
      this.dispatchEvent(e);
    }
  })
};

export default ListMedias
