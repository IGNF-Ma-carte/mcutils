import ol_ext_element from "ol-ext/util/element"; 
import MacarteAPI from './MacarteApi'; // eslint-disable-line no-unused-vars

import ListTable from './ListTable'
import './ListCarte.css'
import './ListCarte.gallery.css'
import './ListCarte.list.css'
import './ListCarte.mini.css'
import md2html from '../md/md2html';
import urls, { getMediaURL } from './serviceURL'
import _T from '../i18n/i18n'
import { getThemeID } from "../format/theme";
import UserInput from "./UserInput";
import organization from "./organization";

/** Control to display a list of Cartes
 */
class ListCarte extends ListTable {
  /** Constructor 
   * @fires select:user
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
   *  @param {string} options.className
   *  @param {number} [options.size=12] number of items in the list
   *  @param {Element} [options.target] 
   *  @param {boolean} [options.selection=false] enable list selection
   *  @param {boolean} [options.check=false] enable checkbox on lines
   *  @param {string} [options.context='atlas']
   *  @param {string} [options.sort='']
   *  @param {boolean} [options.search=false] add search gilter
   *  @param {string} [options.mode='list'] mode style list|gallery|mini
   *  @param {boolean} [options.mini=false] limit to mini mode content (for dialog)
   *  @param {boolean} [options.permalink=false] 
   */
  constructor(api, options) {
    options = options || {};
    options.sort = options.sort || '';
    options.context = options.context || 'atlas';
    options.className = 'mc-list-carte mc-' + options.context;
    super(options);
    this.api = api;
    if (options.mini) this.setMode('mini');
    else this.setMode('list');

    // No search
    if (!options.search) return;

    // Add search
    const head = ol_ext_element.create('DIV', { className: 'mc-search' });
    this.element.insertBefore(head, this.element.firstChild);
    const search = this.input = ol_ext_element.create('INPUT', {
      type: 'search',
      placeholder: 'Rechercher...',
      parent: head
    });
    ol_ext_element.addListener(search, ['change', 'search'], () => {
      this.search(search.value);
    });
    ol_ext_element.create('BUTTON', { className: 'search button-colored', html: 'OK', parent: head });

    // Count maps
    ol_ext_element.create('DIV', { className: 'mapCount colored', parent: head });
    
    // Filter options list
    ol_ext_element.create('DIV', { className: 'filterOptions', parent: head });
    
    // Options buttons
    const buttons = ol_ext_element.create('DIV', { className: 'buttons', parent: head });

    let div = ol_ext_element.create('DIV', { parent: buttons });
    ol_ext_element.create('BUTTON', { 
      className: 'fi-filter', 
      type: 'button',
      title: 'Filtres de recherche...',
      click: () => {
        this.element.classList.toggle('mc-filter');
        this.updatePermalink()
      },
      parent: div 
    });
    ol_ext_element.create('LABEL', { 
      html: 'Filtres', 
      click: () => {
        this.element.classList.toggle('mc-filter');
        this.updatePermalink()
      },
      parent: div 
    });

    // Mode
    div = ol_ext_element.create('DIV', { parent: buttons });
    ol_ext_element.create('LABEL', { html: 'Affichage', parent: div });
    const l = {mini: 'Mini', list: 'Liste', gallery: 'Galerie'}
    for (let i in l) {
      ol_ext_element.create('BUTTON', { 
        className: 'display ' + i + (options.mode===i ? 'select':''), 
        html: l[i],
        click: () => {
          this.setMode(i);
          this.updatePermalink()
        },
        parent: div 
      });
    }

    // sort
    div = ol_ext_element.create('DIV', { parent: buttons });
    ol_ext_element.create('LABEL', { html: 'Trier par', parent: div });
    const sort = ol_ext_element.create('SELECT', { 
      change: () => {
        this.set('sort', sort.value);
        this.showPage(0);
      },
      parent: div
    });
    ['date', 'rank', 'views'].forEach(i => {
      const o = ol_ext_element.create('OPTION', { value: i, html: _T('sort:'+i), parent: sort });
      if (options.sort === i) o.selected = true;
    });

    // Limit
    div = ol_ext_element.create('DIV', { parent: buttons });
    ol_ext_element.create('LABEL', { html: 'Cartes par pages', parent: div });
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

    // Filtres
    this._filters = {};
    const filter = ol_ext_element.create('DIV', { className: 'filters' });
    this.element.insertBefore(filter, head.nextSibling);
    this.element.classList.add('mc-filter');

    ol_ext_element.create('H2', { 
      className: 'theme selected', 
      html: 'Thèmes', 
      click: (e) => {
        e.target.classList.toggle('selected')
      },
      parent: filter
    });
    this._filters.theme = ol_ext_element.create('UL', { className: 'theme', parent: filter });

    // Auteurs
    ol_ext_element.create('H2', { 
      className: 'author selected', 
      html: 'Auteurs', 
      click: (e) => {
        e.target.classList.toggle('selected')
      },
      parent: filter
    });
    const user = new UserInput(api, { target: filter });
    user.on('select', u => {
      this.removeFilter('user')
      this.setFilter('user', u.public_name);
      this.showPage();
    })
    this._filters.user = ol_ext_element.create('UL', { className: 'author', parent: user.element });

    // Add filters
    const filters = {
      organization : 'Organisations',
      type : 'Type',
      share: 'Partage',
      valid: 'Valide',
      active: 'Active',
      premium: 'Premium',
    }
    Object.keys(filters).forEach((k, i) => {
      ol_ext_element.create('H2', { 
        className: k + (i ? '' : ' selected'), 
        html: filters[k], 
        click: (e) => {
          e.target.classList.toggle('selected')
        },
        parent: filter
      });
      this._filters[k] = ol_ext_element.create('UL', { className: k, parent: filter });
    })

    // permalink
    if (options.permalink) {
      this.set('permalink', true);
      this.getPermalink();
    }
  }
}

/** Show the map list
 * @param {element} li list element
 */
ListCarte.prototype.drawHead = function(li) {
  ol_ext_element.create('DIV', {
    className: 'mc-icon',
    html: 'Image',
    parent: li
  });
  ol_ext_element.create('DIV', {
    className: 'mc-content',
    html: 'Titre et description',
    parent: li
  });
  ol_ext_element.create('DIV', {
    className: 'mc-info',
    html: 'Atlas',
    parent: li
  });
  const s = ol_ext_element.create('DIV', {
    className: 'mc-secondary',
    parent: li
  });
  ol_ext_element.create('DIV', {
    className: 'mc-theme',
    html: 'Thème',
    parent: s
  });
  ol_ext_element.create('DIV', {
    className: 'mc-date',
    html: 'Date',
    parent: s
  });
  ol_ext_element.create('DIV', {
    className: 'mc-view',
    html: 'Vues',
    parent: s
  });
};

/** Show the map list
 * @param {Object} m carte info
 * @param {element} li list element
 */
ListCarte.prototype.drawItem = function(m, li) {
  if (!this.get('mini')) {
    // Icon
    const icon = ol_ext_element.create('DIV', {
      className: 'mc-icon' + (m.img_url ? '' : ' mc-image-boussole'),
      parent: li
    });
    if (m.img_url) {
      ol_ext_element.create('IMG', {
        title: m.title,
        src: getMediaURL(m.img_url) || urls.noDataImg,
        parent: icon
      });
    }
  }
  const info = ol_ext_element.create('DIV', {
    className: 'mc-info',
    parent: li
  })
  // Atlas
  ol_ext_element.create('I', {
    title: m.share,
    className: 'mc-share mc-'+m.share,
    parent: info
  });
  // Active
  ol_ext_element.create('I', {
    title:  m.active ? 'active' : 'inactive',
    className: m.active ? 'mc-active' : 'mc-inactive',
    parent: info
  });
  // Valid
  ol_ext_element.create('I', {
    className: m.valid ? 'mc-valid' : 'mc-invalid',
    parent: info
  });
  
  const title = ol_ext_element.create('DIV', {
    className: 'mc-content',
    parent: li
  });
  // Title
  ol_ext_element.create('DIV', {
    html: m.title,
    className: 'mc-title',
    parent: title
  });
  // User
  ol_ext_element.create('DIV', {
    html: m.user,
    className: 'mc-user' + (m.organization_id ? ' mc-user-orga' : ''),
    click: (e) => {
      this.dispatchEvent({ type: 'select:user', user: m.user, user_id: m.user_id, carte: m });
      e.stopPropagation();
    },
    parent: title
  });
  // Organization
  if (m.organization_id) {
    ol_ext_element.create('DIV', {
      html: m.organization_name,
      className: 'mc-organization',
      click: (e) => {
        this.dispatchEvent({ type: 'select:organization', organization_name: m.organization_name, organization_id: m.organization_id, carte: m });
        e.stopPropagation();
      },
      parent: title
    });
  }
  // Description
  if (!this.get('mini')) {
    ol_ext_element.create('DIV', {
      html: md2html.text(m.description, null, true),
      className: 'mc-desc',
      parent: title
    });
  }
  // Container
  const container = ol_ext_element.create('DIV', {
    className: 'mc-secondary',
    parent: li
  });
  // Theme
  ol_ext_element.create('DIV', {
    html: m.theme,
    className: 'mc-theme',
    parent: container
  });
  // Date
  ol_ext_element.create('DIV', {
    html: new Date(m.updated_at).toLocaleDateString(undefined,  { year: 'numeric', month: 'short', day: 'numeric' }),
    className: 'mc-date',
    parent: container
  });
  // View
  ol_ext_element.create('DIV', {
    html: m.nb_view,
    className: 'mc-view',
    parent: container
  });
  // Premium
  ol_ext_element.create('DIV', {
    className: 'mc-premium ' + m.premium,
    parent: li
  });
};

/** Remove filter in the list
 * @param {string} filter filter name
 */
ListCarte.prototype.removeFilter = function(filter) {
  const elt = this.element.querySelector('.filterOptions .filter-'+filter);
  if (elt) elt.remove();
  this.set(filter, '');
};

/** Set search filter
 * @param {string} filter the filter name user|theme|type|premium...
 * @param {string} value
 */
ListCarte.prototype.setFilter = function(filter, value) {
  if (this.get(filter)===value) {
    return false;
  }
  this.set(filter, value);
  return true;
};

/** Update permalink (for search)
 */
ListCarte.prototype.updatePermalink = function() {
  const perma = {};
  let search = window.location.search.replace(/^\?/,'');
  if (search) {
    search.split('&').map(s => s.split('=')).forEach(s => perma[s[0]] = s[1]);
  }
  // Filters
  ['theme', 'user', 'organization', 'type', 'premium', 'share', 'sort', 'query'].forEach(q => {
    if (this.get(q)) perma[q] = encodeURIComponent(this.get(q));
    else delete perma[q];
  })
  // Filter panel
  if (!this.element.classList.contains('mc-filter')) perma.filter = 'off';
  else delete perma.filter;
  /// mode
  perma.mode = this.element.dataset.mode;
  // Serach list
  search = '';
  for (let i in perma) search += (search ? '&':'') + i + '=' + perma[i];
  try {
    window.history.replaceState (null,null, 
      document.location.origin
      + document.location.pathname
      + (search ? '?' + search : '')
      + document.location.hash
    );
  } catch(e) { /* */ }
};

/** Set permalink (for search)
 */
ListCarte.prototype.getPermalink = function() {
  const perma = {};
  let search = window.location.search.replace(/^\?/,'');
  if (search) {
    search.split('&').map(s => s.split('=')).forEach(s => perma[s[0]] = decodeURIComponent(s[1]));
  }
  ['theme', 'user', 'organization', 'share', 'type', 'premium', 'sort'].forEach(q => {
    if (perma[q]) {
      this.setFilter(q, perma[q]);
    }
  });
  if (perma.filter==='off') this.element.classList.remove('mc-filter')
  else this.element.classList.add('mc-filter')
  this.element.dataset.mode = perma.mode || 'list';
  if (perma.query) {
    this.set('query', perma.query);
    this.input.value = perma.query;
    this.search(perma.query);
  }
};

const attributesStr = {
  true: 'oui',
  false: 'non',
  private: 'privée',
  public: 'public',
  macarte: 'carte',
  storymap: 'narration',
}
/** Get attribute value as string (translated)
 * @param string} filter
 * @param {*} value
 * @param {string} valdef
 * @return {string}
 */
ListCarte.prototype.getStrAttributeValue = function(filter, value, valdef) {
  switch (filter) {
    case 'active': {
      return value ? 'active' : 'inactive'
    }
    case 'valid': {
      return value ? 'valide' : 'invalide'
    }
    default: {
      return attributesStr[value] || value || valdef || 'inconnu'
    }
  }
}

/** Show the current page
 * @param {number} page
 */
ListCarte.prototype.showPage = function(page) {
  this.loading(true);
  if (!page || page < 0) page = 0;
  if (this.get('permalink')) this.updatePermalink();
  this.api.getMaps({
    context: this.get('context'),
    offset: (page * this.get('size')) || 0,
    theme: this.get('theme') || '',
    organization: this.get('organization') || '',
    limit: this.get('size'),
    user: this.get('user') || '',
    type: this.get('type') || '',
    share: this.get('share') || '',
    valid: this.get('valid') || '',
    active: this.get('active') || '',
    premium: this.get('premium') || '',
    sort: this.get('sort') || '',
    query: this.get('query') || ''
  }, (maps) => {
    if (!maps.error) {
      if (this._filters) {
        this.element.querySelector('.mapCount').innerHTML = maps.count + ' carte' + (maps.count > 1 ? 's':'');
        // For each filters
        ['theme', 'user', 'organization', 'type', 'share', 'active', 'valid', 'premium'].forEach(attr => {
          const as = (attr==='valid' ? 'valides' : attr + 's');
          // Reset filter html
          this._filters[attr].innerHTML = '';
          if (!maps[as]) return;
          // Show filters
          maps[as].forEach(filt => {
            // Add filter list item
            let val = filt[attr];
            if (as==='organizations') {
              val = filt.public_id;
              if (!val) val = 'out';
            }
            const li = ol_ext_element.create('LI', { 
              click: () => {
                if (this.setFilter(attr, val)) {
                  this.showPage();
                }
              },
              parent: this._filters[attr] 
            });
            // Counter
            ol_ext_element.create('SPAN', { className: 'count', html: filt.count, parent: li });
            // Theme icon
            if (attr === 'theme') {
              const icon = getThemeID(filt.theme)
              ol_ext_element.create('I', { className: 'fi-theme-'+icon, parent: li });
            }
            // Show in list
            ol_ext_element.create('SPAN', { 
              html: this.getStrAttributeValue(attr, filt[attr], as==='organizations' ? '<span class="undef">Hors organisation</span>' : ''), 
              parent: li 
            });
            // Filter
            if (this.get(attr) === val) {
              ol_ext_element.create('A', { 
                className: 'remove', 
                title: 'supprmer...',
                click: e => {
                  this.set(attr, '');
                  this.showPage()
                  e.stopPropagation()
                  e.preventDefault()
                },
                parent: li 
              });
            }
          })
        })
      }
      this.drawList(maps.maps, maps.offset, maps.count);
      if (!maps.count) {
        this.showError('Aucun résultat...')
      }
    } else {
      this.showError('[ERROR ' + maps.status + '] ' + maps.statusText);
      maps.type = 'error';
      this.dispatchEvent(maps);
    }
  })
};

export default ListCarte
