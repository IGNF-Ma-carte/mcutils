import './charte.css'
import './charte-premium.css'
import './charteSite.css'
// Univers
import './univ-institut.css'
import './univ-carto.css'
import './univ-particulier.css'
import './univ-professionnel.css'
import './access.css'

// Font Open sans
import "@fontsource/open-sans/800.css";
import "@fontsource/open-sans/800-italic.css"; 
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css"; 
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/600-italic.css"; 
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/500-italic.css"; 
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/400-italic.css"; 
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/300-italic.css"; 
// Fonts Fira sans
import '@fontsource/fira-sans/800.css'
import '@fontsource/fira-sans/800-italic.css'
import '@fontsource/fira-sans/700.css'
import '@fontsource/fira-sans/700-italic.css'
import '@fontsource/fira-sans/600.css'
import '@fontsource/fira-sans/600-italic.css'
import '@fontsource/fira-sans/500.css'
import '@fontsource/fira-sans/500-italic.css'
import '@fontsource/fira-sans/400.css'
import '@fontsource/fira-sans/400-italic.css'
import '@fontsource/fira-sans/300.css'
import '@fontsource/fira-sans/300-italic.css'
// CSS
import 'font-ign/font-ign.css'
import './megamenu.css'
import './teaser.css'
import './breadcrumb.css'
import './accordion.css'
import './tabs.css'

import setInputPlaceholder, { createElement } from './setInputPlaceholder'
import setContact from './setContact'
import setPiwik from './setPiwik.js'
import setCarousel from './carousel'

import './i18n/access.fr.js'
import './i18n/footer.fr.js'
import './i18n/subfooter.fr.js'
import _T from '../i18n/i18n'

import ol_ext_element from 'ol-ext/util/element'
import serviceURL from '../api/serviceURL'

const ismap = (document.body.dataset.page !== 'site');

// Local variables
let menuTabId = 0;
let menuId = 0;
let accordionId = 0;
let initName = '';

/** Check accordion 
 * @param {Element} elt label element of the accordion
 * @param {boolean} [check]
 */
window.accordionCheck = function(elt, check) {
  const input = elt.previousElementSibling
  if (check !== undefined) input.checked = !!check;
  else input.checked = !input.checked;
  elt.parentNode.dataset.expanded = input.checked ? 1 : 0;
  elt.setAttribute('aria-expanded', input.checked);
  elt.nextElementSibling.setAttribute('aria-hidden', !input.checked);
  // Set aria info
  if (!elt.getAttribute('aria-controls')) {
    elt.setAttribute('aria-controls', 'mc-accordion-' + (++accordionId));
    elt.nextElementSibling.id = elt.getAttribute('aria-controls');
  }
  // Update others
  if (input.checked && input.name) {
    const ul = elt.parentNode.parentNode;
    if (ul) {
      ul.querySelectorAll('input[name="'+input.name+'"]').forEach(i => {
        if (i !== input) {
          window.accordionCheck(i.parentNode.querySelector('label'), false);
        }
      })
    }
  }
}

// Page content
let pageContent = document.body.querySelector('[data-role="content"]');
if (!ismap && !pageContent) {
  pageContent = createElement('DIV', {
    'data-role': 'content',
    parent: document.body
  })
}

// MAP
const mapTarget = createElement('DIV', {
  'data-role': 'map',
  parent: ismap ? document.body : null
});
createElement('DIV', {
  'data-role': 'fullscreen',
  html: ol_ext_element.create('DIV', { html: _T('closeFullscreen') }),
  title: _T('close'),
  click: () => { charte.fullscreen(false) },
  parent: ismap ? document.body : null
});

// HEADER
const header = createElement('DIV', {
  'data-role': 'header',
  parent: document.body
});

function toggleMenu() {
  menu.classList.toggle('visible');
  if (menu.classList.contains('visible')) {
    document.body.dataset.menu = '';
  } else {
    delete document.body.dataset.menu;
  }
  const expanded = menuBurger.getAttribute('aria-expanded') !== 'true'
  menuBurger.setAttribute('aria-expanded', expanded);
  menu.setAttribute('aria-hidden', !expanded)
}

const menu =  createElement('DIV', { 
  id: 'menu-panel',
  className: 'menu',
  'aria-hidden': 'true',
  click: (e) => {
    if (e.target === menu) {
      toggleMenu();
    }
  },
  parent: header
})
const menuList =  createElement('UL', { 
  parent: menu
});

const menuBurger = createElement('DIV', { 
  html: '<span>Menu</span>',
  className: 'menuBar backColored',
  'aria-expanded': false,
  'aria-controls': 'menu-panel',
  click: () => {
    toggleMenu();
    dispatchEvent('header:menu');
  },
  parent: header
});

const logoElt = createElement('DIV', {
  className: 'logoIGN',
  click: () => {
    dispatchEvent('header:title', { logo: true })
  },
  parent: header
});

const titleElt = createElement('H1', {
  className: 'colored',
  title: 'Accueil',
  click: () => {
    dispatchEvent('header:title')
  },
  parent: header
});

const megaDiv = createElement('DIV', { 
  'data-role': 'mega', 
  html:'<ul></ul>', 
  parent: document.body 
});
createElement('I', {
  title: 'Fermer le Menu Portails',
  className: 'hoverColored',
  click: () => {
    delete document.body.dataset.mega;
    // dispatch a resize event
    window.dispatchEvent(new Event('resize'));
  },
  parent: megaDiv
})

createElement('DIV', {
  className: 'mega hoverColored',
  click: () => {
    dispatchEvent('header:mega');
    document.body.dataset.mega = '';
  },
  parent: header
})

// Handle access
createElement('DIV', {
  className: 'access hoverColored',
  click: () => {
    if (document.body.dataset.page === 'site') {
      document.body.dataset.accessDialog = ''
    } else {
      if (document.body.dataset.access) {
        delete document.body.dataset.access;
      } else {
        document.body.dataset.access = 'enforce';
      }
    }
    localStorage.setItem('IGN@access', document.body.dataset.access || '');
    localStorage.setItem('IGN@accessLi', document.body.dataset.accessLi || '');
  },
  parent: header
})
// Previous value
if (localStorage.getItem('IGN@access')) document.body.dataset.access = 'enforce';
if (localStorage.getItem('IGN@accessLi')) document.body.dataset.accessLi = 'augmented';

// USER
const userElement = createElement('DIV', {
  className: 'user',
  'aria-label': 'Déplier le menu utilisateur',
  'aria-expanded': false,
  id: 'dropdownUserMenu',
  click: e => {
    // dispatchEvent('user', { head: true });
    if (!document.body.dataset.userMenu) {
      document.body.dataset.userMenu = 'menu';
      e.stopPropagation();
      userElement.dataset.ariaExpanded = true
    } else {
      userElement.dataset.ariaExpanded = false
    }
  },
  parent: header
})
const userContent = createElement('DIV', {
  className: 'hoverColored',
  parent: userElement
})
createElement('I', {
  className: 'fi-check-user colored',
  parent: userContent
})
createElement('I', {
  className: 'fi-simple-user hoverColored',
  parent: userContent
})
createElement('I', {
  className: 'user-menu hoverColored',
  parent: userContent
})
// User name
createElement('SPAN', {
  parent: userElement
})
// User menu
const userMenu = ol_ext_element.create('UL', {
  className: 'userMenu',
  'aria-labelledby': 'dropdownUserMenu',
  parent: header
})
const userName = ol_ext_element.create('LI', {
  className: 'userName',
  click: () => {
    dispatchEvent('user', { head: true });
  },
  parent: userMenu
})
ol_ext_element.create('DIV', {
  parent: userName
})
ol_ext_element.create('A', {
  html: 'Me connecter',
  parent: userName
})
ol_ext_element.create('LI', {
  className: 'separator',
  parent: userMenu
})
ol_ext_element.create('LI', {
  className: 'submenu',
  html: ol_ext_element.create('UL'),
  parent: userMenu
})
ol_ext_element.create('LI', {
  className: 'separator',
  parent: userMenu
})
ol_ext_element.create('LI', {
  html: ol_ext_element.create('A', { text: 'Me déconnecter' }),
  click: () => {
    if (charte.canLogout()) {
      dispatchEvent('user:logout', { head: true });
    }
  },
  parent: userMenu
})
// Hide user menu
document.addEventListener('click', () => {
  delete document.body.dataset.userMenu
  userElement.dataset.ariaExpanded = false
})

/* Removed from charte
const disconnect = createElement('DIV', {
  html: '<i class="fi-disconnect hoverColored"></i>',
  title: _T('disconnect'),
  click: (e) => {
    dispatchEvent('user:logout', { head: true });
    e.stopPropagation();
  },
  parent: userElement
})
createElement('SPAN', {
  html: _T('disconnect'),
  parent: disconnect
})
*/

// Handle access
createElement('DIV', {
  className: 'help hoverColored',
  html: createElement('A', { 
    title: 'Aide en ligne',
    href: serviceURL.doc,
    target: '_help'
  }),
  parent: header
})

// TOOLBAR
const toolBar = createElement('DIV', {
  'data-role': 'toolBar',
  parent: ismap ? document.body : null
});

// FOOTER
const subfooter = createElement('DIV', {
  'data-role': 'subfooter',
  className: 'backColored',
  parent: document.body
})
const footer = createElement('DIV');
createElement('DIV', {
  'data-role': 'footer',
  html: footer,
  parent: document.body
});

createElement('DIV', {
  className: 'copy',
  html: '<div class="date">&copy; IGN-2021</div>',
  parent: footer
});

if (document.body.dataset.page === 'site') {
  /* Get followers * /
  const request = new XMLHttpRequest();
  request.open('GET', 'https://www.ign.fr/publications-de-l-ign/followers.json');
  request.setRequestHeader ('Content-Type', 'application/json; charset=utf-8');
  request.onerror = 
  request.onload = () => {
    const resp = JSON.parse(request.responseText);
    console.log(resp)
  }
  request.send();
  /**/
  createElement('DIV', {
    className: 'backColored',
    html: _T('subfooterHTML', true),
    parent: subfooter
  })
  footer.insertBefore(createElement('DIV', {
    className: 'footer-info',
    html: _T('footerHTML', true),
  }), footer.children[0])

  // Footer logo
  createElement('DIV', {
    'data-role': 'footer-logo',
    html: createElement('DIV', { 
      html: createElement('DIV', { className: 'logo'})
    }),
    parent: document.body
  });
  // Access page
  const accessd = createElement('DIV', {
    'data-role': 'access-dialog',
    html: _T('accessDialogHTML'),
    parent: document.body
  })
  accessd.querySelector('button.btn-close').addEventListener('click', () => {
    delete document.body.dataset.accessDialog
  })
  accessd.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      switch (input.value) {
        case 'normal': {
          delete document.body.dataset.access;
          break;    
        }
        case 'enforce': {
          document.body.dataset.access = 'enforce';
          break;
        }
        case 'simple': {
          delete document.body.dataset.accessLi;
          break;
        }
        case 'augmented': {
          document.body.dataset.accessLi = 'augmented';
          break;
        }
      }
      localStorage.setItem('IGN@access', document.body.dataset.access || '');
      localStorage.setItem('IGN@accessLi', document.body.dataset.accessLi || '');
    })
  })
  if (localStorage.getItem('IGN@access')) {
    accessd.querySelectorAll('.contrast input')[1].checked = true
  } else {
    accessd.querySelectorAll('.contrast input')[0].checked = true
  }
  if (localStorage.getItem('IGN@accessLi')) {
    accessd.querySelectorAll('.interli input')[1].checked = true
  } else {
    accessd.querySelectorAll('.interli input')[0].checked = true
  }
} 


// Menu Tab
const menuTab = createElement('DIV', {
  'data-role': 'menu-tab',
  parent: ismap ? document.body : null
});
const menuTabMenu = createElement('DIV', {
  className: 'menu',
  parent: menuTab
});

// Event listener
const _listeners = {};

/* Dispatch an event
 * @param {string} eventType
 * @param {Object} options
 */
const dispatchEvent = function (eventType, options) {
  options = options || {};
  const listener = _listeners[eventType];
  if (listener) {
    options.type = eventType;
    listener.forEach(fn => {
      fn(options);
    });
  }
};

// Menu tab
const _menuTab = {};
let _tout;

/** The charte instance implements a set of feature to handle the charte.
 * You can get the app element and header, menu and footer elements.
 * You can set the app name, menu and tabs. Listen to events to get informed of the interaction with the app elements.
 * @namespace
 * @example
 * import chart from 'mcutils/charte.charte'
 * charte.setUnivers('carto');
 * // Add a fullscreen tool to the app fullscreen
 * charte.addTool('fullscreen', 'fi-visible', 'Plein écran', () => charte.fullscreen())
 * // Add a new tab
 * charte.addMenuTab('locate', 'fi-location  ', 'Localisation', 'Onglet Carte');
 * charte.on('tab:show', (e) => {
 *   console.log(e.id+ ' tab is open...');
 * })
 */
const charte = {
  /** Check if the app can logout
   * @return {boolean} 
   */
  canLogout: () => {
    return true
  },
  /** Get the app header element
   * @method
   * @returns {Element}
   * @instance
   */
  getHeaderElement: () => { return header; },
  /** Get the app footer element
   * @returns {Element}
   * @instance
   */
  getFooterElement: () => { return footer; },
  /** Get the app sub-footer element
   * @returns {Element}
   * @instance
   */
  getSubFooterElement: () => { return (document.body.dataset.page === 'site') ? subfooter : undefined; },
  /** Set the MegaMenu content (as returned by the {@link MacarteAPI#getEditorial})
   * @param {string} html MegaMenu content html string
   * @instance
   */
  setMegaMenu: (html) => {
    if (!html) return;
    const ul = megaDiv.querySelector('ul');
    html = html.replace(/class="icon-(.*)"/g, 'class="fi-$1"');
    ul.innerHTML = html;
    // Bad html > remove
    if (!ul.querySelector('.megamenu__link')) {
      ul.innerHTML = '';
      return;
    }
    // Show list
    ul.querySelector('.megamenu__collapse').classList.add('show');
    ul.querySelector('.megamenu__link').setAttribute('aria-expanded', true);
    ul.querySelectorAll('.megamenu__link').forEach(link => {
      const content = link.parentNode.querySelector('.megamenu__collapse');
      if (content) {
        link.addEventListener('click', () => {
          ul.querySelectorAll('.megamenu__link').forEach(b => {
            b.setAttribute('aria-expanded', '');
          })
          ul.querySelectorAll('.megamenu__collapse').forEach(i => {
            i.scrollTop = 0;
            i.classList.remove('show');
          })
          content.classList.add('show');
          link.setAttribute('aria-expanded', true);
        })
      }
    })
  },
  /** Get app element (the map target or the page content element)
   * @returns {Element}
   * @instance
   */
  getAppElement: () => { return ismap ? mapTarget : pageContent; },
  /** Get menu tool bar element
   * @returns {Element}
   * @instance
   */
  getToolbarElement: () => { return toolBar; },
  /* Set the input placeholder (document in the fn)
   */
  setInputPlaceholder: setInputPlaceholder,
  /* Set the input value and fire a change event (usefull to update InputPlaceholder)
   * @param {Element} input
   * @param {any} value
   */
  setInputValue: function(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('change'));
  },
  /** Set the app univers
   * @param {string} name
   * @instance
   */
  setUnivers: (name) => { document.body.dataset.univers = name },
  /** Set the app name
   * @param {string} name application name
   * @param {string} [title] link title, default 'Acceuil - ' + name
   * @instance
   */
  setName: (name, title) => {
    if (!initName && name) initName = name;
    if (!name) name = initName;
    title = title || ('Acceuil - ' + name);
    logoElt.title = titleElt.title = title;
    titleElt.innerText = name;
  },
  /** Set the app logo
   * @param {string} name application name
   * @param {string} [title] link title, default 'Acceuil - ' + name
   * @instance
   */
  setLogo: (url) => { 
    logoElt.className = url ? 'organization' : 'logoIGN';
    logoElt.innerHTML = '';
    if (url) {
      // Show Image
      const img = ol_ext_element.create('IMG', {
        src: url,
        parent: logoElt
      })
      // No image
      img.addEventListener('error', () => {
        img.remove()
      })
    }
  },
  /** Set the user name in the bar and add a connected dataset to the body
   * @param {object} user
   * @instance
   */
  setUser: (user) => { 
    userElement.querySelector('span').innerText = user ? user.public_name : '';
    if (user) {
      const udiv = userName.querySelector('div')
      udiv.innerHTML = '';
      udiv.appendChild(ol_ext_element.create('SPAN', { text: user.public_name }));
      udiv.appendChild(ol_ext_element.create('SPAN', { text: user.email }));
    }
    // Set contact info
    const contact = footer.querySelector('form[data-role="contact"]');
    if (contact) {
      contact.querySelector('[name="user"').value = user ? user.public_name : '';
      contact.querySelector('[name="email"').value = user ? user.email : '';
      contact.querySelector('[name="userID"').value = user ? user.id : '';
    }
    // Show connected
    if (!user || !user.public_name) {
      delete document.body.dataset.connected;
    } else {
      document.body.dataset.connected = 'connected';
    }
  },
  /** Add user menu item
   * @param {string|Element} content
   * @param {Object} [options]
   *  @param {string} [options.className]
   * @return {Element}
   */
  addUserMenuItem(content, options) {
    options = options || {};
    return ol_ext_element.create('LI', {
      html: content,
      className: options.className,
      parent: userMenu.querySelector('ul')
    })
  },
  /** Add user menu separator
   * @param {Object} [options]
   *  @param {string} [options.className]
   * @return {Element}
   */
  addUserMenuSeparator(options) {
    options = options || {};
    return ol_ext_element.create('LI', {
      className: options.className || 'separator',
      parent: userMenu.querySelector('ul')
    })
  },
  /** Dispatch a connect event
   * @instance
   */
  connect: () => {
    dispatchEvent('user', { head: true });
  },
  /** Dispatch a connect event
   * @param {string} type,
   * @param {Object} options
   * @instance
   */
  dispatchEvent: dispatchEvent,
  /** Add an event listener
   * @param {string|Array<string>} type the event name or an array of event name
   * @param {function} callback
   * @listens charte.header:menu
   * @listens charte.header:list
   * @listens charte.tab:show
   * @listens charte.fullscreen
   * @listens charte.menu:list
   * @listens charte.user
   * @listens charte.user:logout
   * 
   * @instance
   */
  on: (type, callback) => {
    if (typeof(callback) === 'function') {
      if (!Array.isArray(type)) type = [type];
      type.forEach(t => {
        if (!_listeners[t]) _listeners[t] = [];
        _listeners[t].push(callback);
      })
    }
  },
  /** Remove an event listener
   * @param {string|Array<string>} type
   * @param {function} callback
   * @instance
   */
  un: (type, callback) => {
    if (!Array.isArray(type)) type = [type];
    type.forEach(t => {
      if (_listeners[t]) {
        const i = _listeners[t].indexOf(callback);
        if (i>=0) _listeners[t].splice(i, 1);
      }
    })
  },
  /** Add a menu button
   * @param {Object} options
   *  @param {string} options.id
   *  @param {string} options.title
   *  @param {string} options.small text to display on small screen
   *  @param {string} options.href
   *  @param {function} options.onclick
   * @instance
   */
  addFooterLink: (options) => {
    const a = createElement('A', {
      href: options.href,
      click: typeof(options.onclick) === 'function' ? () => { options.onclick(options.id); } : null,
      parent: footer.querySelector('.copy'),
      target: '_blank',
    })
    createElement('SPAN', {
      html: options.title,
      parent: a
    })
    if (options.small) {
      createElement('SMALL', {
        html: options.small,
        parent: a
      })
    }
  },
  /** Add Short links
   * @param {string} title
   * @param {string} url
   * @param {boolean} [external=false]
   */
  addShortLink: (title, url, external) => {
    charte.addExtraFooter('shortlinks', 'Accès rapides', title, url, external)
  },
  /** Add Help links
   * @param {string} title
   * @param {string} url
   * @param {boolean} [external=false]
   */
  addHelpLink: (title, url, external) => {
    charte.addExtraFooter('helplinks', 'Aide en ligne', title, url, external)
  },
  /** Add extra footer div
   * @param {string} className
   * @param {string} title
   * @param {string} text
   * @param {string} url
   * @param {boolean} [external=false]
   */
  addExtraFooter: (className, title, text, url, external) => {
    const info = footer.querySelector('.footer-info')
    if (info) {
      info.dataset.cols = 4;
      let shortlinks = info.querySelector('.' + className + ' ul')
      if (!shortlinks) {
        const container = ol_ext_element.create('DIV', { className: className, parent: info })
        ol_ext_element.create('H2', { text: title, parent: container })
        shortlinks = ol_ext_element.create('UL', { parent: container })
      }
      const li = ol_ext_element.create('LI', {
        html: ol_ext_element.create('A', {
          text: text,
          href: url || '#',
          parent: shortlinks
        }),
        parent: shortlinks
      })
      if (external) li.querySelector('a').target = '_blank'
    }
  },
  /** Add newsletter
   * @param {string} src
   * @param {string} title
   * @instance
   */
  setNewsletter: (src, title) => {
    const iframe = subfooter.querySelector('.newsletter iframe');
    if (iframe) {
      subfooter.querySelector('.newsletter h2').innerText = title || 'Découvrez la lettre d\'information IGNactu';
      iframe.src = src || 'https://www.ign.fr/publications-de-l-ign/Widget/Footer_IGNActu.html';
    }
  },
  /** Add contact
   * @param {Object} options
   *  @param {string} options.id
   *  @param {string} options.title
   *  @param {string} options.small text to display on small screen
   *  @param {string} options.href
   *  @param {string} options.service
   *  @param {string} [options.mapID]
   *  @param {string} [options.user]
   *  @param {string} [options.userID]
   *  @param {string} [options.email]
   *  @param {Element} [parent] Element to add the contact form (default footer)
   * @instance
   */
  setContact: (options, parent) => {
    setContact(options, parent || footer.querySelector('.copy'));
  },
  /** Set the current app (check in menu + name)
   * @param {string} id
   * @param {string} name
   * @instance
   */
  setAppMenu: function(id, name) {
    if (name) this.setName(name);
    Array.prototype.forEach.call(menuList.children, (ul) => {
      const menu = ul.querySelectorAll('li');
      if (ul.dataset.id === id) {
        ul.className = 'current lightColored';
        const a = ul.querySelector('a');
        if (a) a.className = 'current colored';
      }
      Array.prototype.forEach.call(menu, (li) => {
        const a = li.querySelector('a');
        if (li.dataset.id === id) {
          li.className = 'current lightColored';
          if (a) a.className = 'current colored';
          ul.classList.add('checked');
          ul.querySelector('a').setAttribute('aria-expanded', true)
          ul.querySelector('ul').setAttribute('aria-hidden', false)
        } else {
          li.className = '';
          if (a) a.className = '';
        }
      })
    })
  },
  /** Add a menu list
   * @param {Object} options
   *  @param {string} options.id
   *  @param {string} options.title
   *  @param {Array<string>} options.list a list of submenu
   *  @param {function} options.onclick
   * @fires charte.header:list
   * @fires charte.menu:list
   * @instance
   */
  addMenuList: function(options) {
    if (Array.isArray(options)) {
      options.forEach(o => this.addMenuList(o));
      return;
    }
    const li = createElement('LI', {
      className: (options.current ? 'current' : '') + (options.list && options.list.length ? ' list' : '' ),
      'data-id': options.id || '',
      click: () => {
        if (typeof(options.onclick) === 'function') options.onclick(options.id);
        li.classList.toggle('checked');
        const expended = li.classList.contains('checked');
        li.querySelector('a').setAttribute('aria-expanded', expended);
        li.querySelector('ul').setAttribute('aria-hidden', !expended);
        dispatchEvent('header:list', { id : options.id })
      },
      parent: menuList
    })
    const mid = 'mc-menu-' + (++menuId);
    const button = createElement('A', {
      html: options.title,
      href: options.href,
      parent: li
    })
    const ul = createElement('UL', {
      id: mid,
      parent: li
    })
    if (options.list) {
      button.setAttribute('aria-controls', mid);
      button.setAttribute('aria-expanded', false);
      ul.setAttribute('aria-hidden', true);
      options.list.forEach((l) => {
        const subli = createElement('LI', {
          className: (l.current ? 'current lightColored' : ''),
          'data-id': l.id,
          click: (e) => { 
            if (typeof(l.onclick) === 'function') l.onclick(l.id);
            dispatchEvent('menu:list', { id : l.id, title: l.title });
            e.stopPropagation();
          },
          parent: ul
        });
        if (l.current) {
          li.classList.add('checked');
          button.setAttribute('aria-expanded', true);
          ul.setAttribute('aria-hidden', false);
        }
        createElement('A', {
          html: l.title,
          className: (l.current ? 'current colored' : ''),
          click: (e) => {
            if (subli.classList.contains('current')) e.preventDefault();
          },
          href: l.href,
          parent: subli
        });
      })
    }
  },
  /** Add a new tool
   * @param {string} id
   * @param {string} icon an icon to display (set as classname)
   * @param {string} title button title
   * @returns {function} [onclick] callback function on click 
   * @instance
   */
  addTool: (id, icon, title, onclick) => {
    createElement('I', {
      className: (icon || 'separator') + ' hoverColored',
      title: title,
      click: typeof(onclick) === 'function' ? (e) => { onclick(id, e); } : null,
      parent: toolBar
    })
  },
  /** Add a menu button
   * @param {string} id
   * @param {string} icon an icon to display (set as classname)
   * @param {string} title button title
   * @returns {Element} the button element
   * @instance
   */
  addMenuButton: (id, icon, title) => {
    const elt = createElement('DIV', {
      className: id,
      parent: menuTabMenu
    })
    createElement('I', {
      className: icon+' colored',
      parent: elt
    })
    createElement('SPAN', {
      html: title,
      parent: elt
    });
    return elt
  },
  /** Add a menu tab
   * @param {string} id
   * @param {string} icon an icon to display (set as classname)
   * @param {string} title button title
   * @param {Element|string} content an element or html to add in the tab
   * @returns {Element} the tab element
   * @instance
   */
  addMenuTab: (id, icon, title, content) => {
    const tabId = 'mc-menutab-'+(++menuTabId)
    const tabElement = createElement('DIV', {
      html: content,
      className: 'tab '+id,
      id: tabId,
      'aria-hidden': true,
      parent: menuTab
    })
    createElement('I', {
      className: 'fi-close close-box',
      click: () => elt.click(),
      parent: tabElement
    })
    const elt = createElement('DIV', {
      className: id,
      'aria-controls': tabId,
      'aria-expanded': false,
      click: () => {
        if (_tout) clearTimeout(_tout);
        const vis = tabElement.classList.contains('visible');
        for (let t in _menuTab) {
          _menuTab[t].tab.classList.remove('visible');
          _menuTab[t].tab.setAttribute('aria-hidden', true);
          _menuTab[t].icon.classList.remove('select');
          _menuTab[t].icon.setAttribute('aria-expanded', false);
        }
        tabElement.classList.add('visible');
        tabElement.setAttribute('aria-hidden', false);
        if (!vis) {
          document.body.dataset.menuTab = id;
          elt.classList.add('select');
          elt.setAttribute('aria-expanded', true);
          setTimeout(() => {
            dispatchEvent('tab:show', { id: id })
            window.dispatchEvent(new Event('resize'));
          }, 300);
        } else {
          delete document.body.dataset.menuTab;
          _tout = setTimeout(() => {
            dispatchEvent('tab:show');
            window.dispatchEvent(new Event('resize'));
            tabElement.classList.remove('visible');
            tabElement.setAttribute('aria-hidden', false);
          }, 300);
        }
      },
      parent: menuTabMenu
    })
    createElement('I', {
      className: icon+' colored',
      parent: elt
    })
    createElement('SPAN', {
      html: title,
      parent: elt
    });
    _menuTab[id] = {
      icon: elt, 
      tab: tabElement
    }
    return tabElement;
  },
  /** Show/hide a tab
   * @param {string} [id] id of the tab to show / hide
   * @param {boolean} [b] if none toggle the tab
   * @instance
   */
  showTab: (id, b) => {
    if (id) {
      const t = _menuTab[id];
      if (t) {
        if (b === undefined) {
          t.icon.click();
        } else {
          const isShown = (id === document.body.dataset.menuTab);
          if (b !== isShown) t.icon.click();
        } 
      }
    } else {
      id = document.body.dataset.menuTab;
      if (id) charte.showTab(id);
    }
  },
  /** Get the current menu tab (opened)
   * @returns {string}
   * @instance
   */
  getCurrentMenuTab: () => {
    return document.body.dataset.menuTab;
  },
  /** Add a menu tab
   * @param {string} id
   * @param {string} icon
   * @param {Element} content
   * @instance
   */
  getMenuTabElement: (id) => {
    return _menuTab[id] ? _menuTab[id].tab : menuTab;
  },
  /** Set copyright date
   * @param {number} date
   * @param {string} [copy=IGN]
   * @instance
   */
  setCopyright: (date, copy) => {
    footer.querySelector('.copy .date').innerHTML = '&copy; '+ (copy || 'IGN') + '<span> - ' + date + '</span>';
  },
  /** Create an accordion element
   * @param {Element} ul parent element with an accordion className
   * @param {object} options
   *  @param {string} options.title label title
   *  @param {boolean} [options.expended=false]
   *  @param {boolean} [options.isTitle=false]
   *  @param {string} [options.name] if defined use it to check/unchek all accordion with the same nameId
   *  @param {string} [options.className] 
   *  @param {string|Element} [options.content] 
   *  @param {function} [options.click] 
   * @function
   * @instance
   */
  createAccordionElement: (ul, options) => {
    ul.setAttribute('aria-label', 'Accordion Control Group Buttons');
    const classes = ['accordion-li']
    if (options.className) classes.push(options.className);
    if (options.isTitle) classes.push('accordion-title');
    if (options.content === null) classes.push('accordion-button');
    const li =  ol_ext_element.create('LI', {
      className: classes.join(' '),
      parent: ul
    })
    const input = ol_ext_element.create('INPUT', {
      type: options.name ? 'radio' : 'checkbox',
      name: options.name || '',
      parent: li
    })
    const label = ol_ext_element.create('LABEL', {
      html: options.title || '',
      click: () => {
        window.accordionCheck(label);
        if (typeof(options.click) === 'function') options.click(input.checked)
      },
      parent: li
    })
    const elt = ol_ext_element.create('DIV', {
      html: options.content,
      style: {
        display: (options.content === null || options.isTitle) ? 'none' : ''
      },
      parent: li
    })
    window.accordionCheck(label, !!options.expended);
    return {
      label: label,
      li: li,
      content: elt
    };
  },
  /** Initialize accordion
   * @param {Element} ul
   */
  initAccordion: (ul) => {
    ul.querySelectorAll('li > input').forEach(i => {
      if (i.parentNode.parentNode === ul) {
        window.accordionCheck(i.nextElementSibling, i.checked);
      }
    });
  },
  /** Check an accordion element
   * @param {Element} elt list or label element
   * @param {boolean} b
   */
  accordionCheck: (elt, b) => {
    if (!elt) return;
    if (elt.tagName === 'LI') elt = elt.querySelector('label');
    if (elt.tagName === 'INPUT') elt = elt.parentNode.querySelector('label');
    if (elt.tagName === 'LABEL') window.accordionCheck(elt, b);
  },
  /** Initialize tabs list
   * @param {Element} ul tab element
   * @param {function} [onchange] a function that takes the tab ID
   */
  initTabList: (tabs, onchange) => {
    tabs.querySelectorAll('[data-title] [data-tab]').forEach(d => {
      d.addEventListener('click', () => {
        const current = tabs.dataset.tab = d.dataset.tab;
        tabs.querySelectorAll('[data-tab]').forEach(d => d.classList.remove('selected'));
        tabs.querySelectorAll('[data-tab="'+current+'"]').forEach(d => d.classList.add('selected'));
        if (typeof(onchange) === 'function') onchange(current)
      })
      const sel = tabs.querySelector('[data-title] [data-tab].selected');
      if (sel) {
        const current = sel.dataset.tab;
        tabs.querySelectorAll('[data-tab="'+current+'"]').forEach(d => d.classList.add('selected'));
      }
    })
  },
  /** Set tab list at name
   * @param {Element} ul
   * @param {string} name
   */
  setTabList: (tabs, name) => {
    tabs.querySelectorAll('[data-tab]').forEach(d => {
      tabs.dataset.tab = name;
      if (d.dataset.tab===name) d.classList.add('selected')
      else d.classList.remove('selected')
    });
  },
  /** Set the app fullscreen
   * @fires charte.fullscreen
   * @function
   * @instance
   */
  fullscreen: (b) => {
    if (b!==false) {
      document.body.dataset.fullscreen = '';
      document.querySelector('[data-role="fullscreen"]').className = '';
      setTimeout(() => document.querySelector('[data-role="fullscreen"]').className = 'hidden', 1000);
    } else {
      delete document.body.dataset.fullscreen;
    }
    dispatchEvent('fullscreen');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  },
  /** Set piwik tracker
   * @param {number} siteId
   */
  setPiwik: setPiwik,
  /** Set a carrousel for an element
   * @param {Element} elt
   */
  setCarousel: setCarousel
};

export default charte
