import { unByKey } from 'ol/Observable';
import ol_ext_element from 'ol-ext/util/element';
import charte from "./charte";
import api from '../api/api'
import Dialog from 'ol-ext/control/Dialog'
import fakeMap from '../dialog/fakeMap'
import serviceURL, { getDocumentationURL, getTeamURL } from "../api/serviceURL";
import config from '../config/config'
import team from '../api/team';
import { teamSelector } from '../api/ListTeams'
import dialogMessage from '../dialog/dialogMessage'
import FlashMessage from '../dialog/FlashMessage';
import md2html from '../md/md2html';

import connectDlg from './page-connectDlg.html'
import lockDlg from './page-lockDlg.html'

import './macarte.css'

const dialog = new Dialog({ 
  closeOnSubmit: false,
  closeBox: true,
  target: document.body
});
dialog.setMap(fakeMap);

/** Special charte instance for Macarte. Set Macarte menus and handle login/logout.
 * @namespace charte.macarte
 */

charte.setUnivers('carto');
charte.setUser();

// Load megamenu
api.getEditorial('megamenu', (r) => {
  charte.setMegaMenu(r.html);
})
// Sub-footer
if (charte.getSubFooterElement()) {
  api.getEditorial('followers', (r) => {
    const social = charte.getSubFooterElement();
    if (r && social) {
      ["facebook", "twitter", "bluesky", "linkedin", "instagram"].forEach(s => {
        const elt = social.querySelector('.'+s+' span');
        if (elt) elt.innerText = (r[s] || '- k');
      })
    }
  })
}

/** Add default menu for MonMaMes
 * @memberof charte.macarte
 * @name setApp
 * @function
 * @param {string} id App id
 * @param {string} name App name (shown in the header)
 * @param {string|Array<string>} [roles] a list of roles to limit the page view
 * @example
 * import charte from 'mcutils/charte/macarte'
 * // Create an app with a title
 * charte.setApp('macarte', 'Ma carte');
 * @instance
 */
charte.setApp = function (id, name, roles) {
  charte.appID = id;
  charte.roles = typeof(roles) === 'string' ? [roles] : roles;
  // Check teams roles and remove the team if bad role
  if (roles && roles.indexOf) {
    team.on('change', () => {
      if (roles.indexOf(team.getUserRole()) < 0) {
        team.set();
      }
    })
  }
  // Add Macarte menu
  charte.addMenuList([
    /*
    {
      id: 'home',
      title: 'Accueil',
      href: serviceURL.home
    },
    */
    {
      id: 'macarte',
      title: 'Créer une carte', 
      href: serviceURL.macarte,
    }, {
      id: 'geocod',
      title: 'Localiser des adresses', 
      href: serviceURL.geocod
    }, {
      id: 'mestat',
      title: 'Importer des statistiques', 
      href: serviceURL.mestat
    }, {
      id: 'narration',
      title: 'Créer une narration', 
      href: serviceURL.narration
    }, {
      id: 'atlas',
      title: 'Consulter l\'atlas',
      href: serviceURL.search
    }, {
      id: 'minetest',
      title: "Minetest",
      href: 'https://minetest.ign.fr/',
    }
    /* {
      id: 'create-account',
      title: 'Créer un compte',
      href: serviceURL.createAccount
    },{
      id: 'reset-password',
      title: 'Récupérer mon mot de passe',
      href: serviceURL.initPassword
    }, {
      title: 'Mon compte',
      id: 'account',
      list: [{
        id: 'compte',
        title: 'Accueil compte',
        href: serviceURL.user
      },{
        id: 'mesinfo',
        title: 'Mes données personnelles',
        href: serviceURL.profil
      },{
        id: 'mescartes',
        title: 'Mes cartes',
        href: serviceURL.mescartes
      },{
        id: 'mesimages',
        title: 'Mes images',
        href: serviceURL.mesmedias
      }]
    }, 
    */
    /*
    {
      title: 'Aide',
      list: [{
        id: 'blogue',
        title: 'Blogue',
        href: serviceURL.blog
      },{
        id: 'tuto',
        title: 'Tutoriels',
        href: serviceURL.tuto
      },{
        id: 'faq',
        title: 'FAQ',
        href: serviceURL.faq
      },{
        id: 'version',
        title: 'Notes de versions',
        href: serviceURL.version
      }]
    }
    */
  ]);
  // Set menu / app
  this.setAppMenu(id, name);

  // Add footer
  charte.setCopyright((new Date()).getFullYear());
  charte.addFooterLink({ title: 'Mentions légales', small: 'Mentions', href: serviceURL.mention });
  charte.addFooterLink({ title: "Conditions Générales d'Utilisation", small: 'CGU', href: serviceURL.cgu });
  charte.addFooterLink({ title: "Cookies et Statistiques", small: 'Cookies', href: serviceURL.cookie });
  charte.addFooterLink({ title: "Accessibilité (Non conforme)", small: 'Accessibilité', href: serviceURL.accessibility });
  // charte.addFooterLink({ title: "Nous contacter", small: 'Contact', href: serviceURL.contact });
  charte.addFooterLink({ title: "Versions", small: 'Versions', href: getDocumentationURL('version') });
  charte.setContact({
    service: id,
    title: 'Nous contacter', 
    small: 'Contact', 
    href: serviceURL.contact,
  }, document.querySelector('[data-role="footer"] .footer-info .ign'));
  charte.setNewsletter('https://www.ign.fr/publications-de-l-ign/Widget/Footer_IGNActu.html', 'Découvrez la lettre d\'information IGNactu');

  // Short links
  charte.addShortLink('Edugéo', 'https://www.edugeo.fr/', true)
  charte.addShortLink('Espace collaboratif', 'https://espacecollaboratif.ign.fr/', true)
  charte.addShortLink('Géoportail', 'https://www.geoportail.gouv.fr/', true)
  charte.addShortLink('Géoservices', 'https://geoservices.ign.fr/', true);

  /*
  charte.addHelpLink('FAQ', serviceURL.faq);
  charte.addHelpLink('Tutoriel', serviceURL.tuto);
  charte.addHelpLink('Créer son compte', serviceURL.createAccount);
  charte.addHelpLink('Plan du site', serviceURL.sitemap)
  */

  // Is someone connected ?
  api.whoami(user => {
    if (user.error) {
      charte.setUser();
    } else {
      charte.setUser(user);
      showTeamInfo();
    }
    // Check notifications
    checkNotification(id);
  })

  // User team
  setTeam();
};

charte.addUserMenuItem(ol_ext_element.create('A', {
  text: 'Mon compte',
  href: serviceURL.user
}))
charte.addUserMenuItem(ol_ext_element.create('A', {
  text: 'Mes données personnelles',
  href: serviceURL.profil
}))
charte.addUserMenuItem(ol_ext_element.create('A', {
  text: 'Mes cartes',
  href: serviceURL.mescartes
}))
charte.addUserMenuItem(ol_ext_element.create('A', {
  text: 'Mes images',
  href: serviceURL.mesmedias
}))
charte.addUserMenuSeparator();
charte.addUserMenuItem(ol_ext_element.create('A', {
  text: 'Mes équipes',
  href: serviceURL.mesequipes
}))
charte.addUserMenuItem(ol_ext_element.create('A', {
  text: 'Changer d\'équipe...',
  click: () => {
    changeTeam()
  }
}))

/** Connexion au services
 * @param {function} callback a function called when connected
 * @param {string} error error message
 */
function connectDialog(callback, error) {
  dialog.show({
    className: 'connectDlg',
    content: connectDlg,
    buttons: { submit: 'Connexion', /* nok: 'Déconnexion',*/ cancel: 'annuler' },
    onButton: (button, inputs) => {
      switch (button) {
        case 'submit': {
          dialog.show({ content: 'Connexion en cours...', className: 'wait' })
          api.login(inputs.name.value, inputs.pwd.value, (user, xhttp) => {
            // Handle error
            if (!user) {
              let error;
              switch(xhttp.status) {
                // Unauthorized
                case 401: {
                  error = 'Nom d\'utilisateur ou mot de passe incorrect.<br/>Attention, les champs sont sensibles à la casse (différenciation majuscule/minuscule).';
                  break;
                }
                // Too meany request / locked
                case 429: {
                  dialog.hide();
                  dialogMessage.show({
                    title: 'Votre compte a été bloqué',
                    className: 'alert lockAccount',
                    content: lockDlg,
                    buttons: ['tenter une reconnexion...'],
                    onButton: () => connectDialog(callback, error)
                  });
                  dialogMessage.getContentElement().querySelector('a.unlock').href = serviceURL.unlockAccount;
                  dialogMessage.getContentElement().querySelector('a.pwd').href = serviceURL.initPassword;
                  return;
                }
                // NO connect
                default: {
                  error = 'Impossible de se connecter au service...'
                  break;
                }
              }
              connectDialog(callback, error);
            } else {
              // Connected
              api.rememberMe(inputs.remember.checked);
              dialog.hide();
              if (typeof(callback) === 'function') callback();
            }
          });
          break;
        }
        case 'nok': {
          // Logout
          dialog.shwo({ content:  'Dé-connexion en cours...', className: 'wait' });
          api.logout(() => {
            dialog.hide();
          });
          break;
        }
      }
    }
  });
  // Input selector
  charte.setInputPlaceholder(dialog.getContentElement().querySelector('.name'));
  charte.setInputPlaceholder(dialog.getContentElement().querySelector('.pwd'));

  // External connection
  dialog.getContentElement().querySelectorAll('[data-connect').forEach(elt => {
    elt.addEventListener('click', () => {
      const href = elt.dataset.href.replace(/SERVER/, serviceURL.home.replace(/\/$/,''))
      window.open(href);
      // Check connection + close
      function onfocus() {
        // Connected ?
        api.whoami(user => {
          if (user.status !== 401) {
            dialog.hide()
          }
        })
      }
      window.addEventListener('focus', onfocus);
      const listener = dialog.on('hide', () => {
        window.removeEventListener('focus', onfocus)
        unByKey(listener)
      })
    })
  })
  //
  dialog.element.querySelector('.registration a').href = serviceURL.createAccount;
  
  // Remember me
  if (api.getRememberMe()) {
    dialog.element.querySelector('input.remember').checked = true;
  }
  // Get user / inputs
  const user = api.getMe();
  const inputName = dialog.element.querySelector('input.name');
  if (user && !user.error) {
    charte.setInputValue(inputName, user.username);
    dialog.element.querySelector('input.pwd').focus();
  } else {
    inputName.focus();
  }
  // Prevent capslock
  dialog.element.querySelectorAll('label input').forEach(i => {
    i.addEventListener('keyup', function (e) {
      if (e.getModifierState('CapsLock')) {
        dialog.element.classList.add('capslock')
      } else {
        dialog.element.classList.remove('capslock')
      }
    });
  })
  // Handle error
  dialog.element.querySelector('.error').innerHTML = error || '';
  dialog.element.querySelector('.error').style.display = error ? '' : 'none';
  dialog.element.querySelector('a').href = serviceURL.initPassword;
}

// Set piwik
charte.setPiwik(config.sitePiwik);

/* Check notifications
 * @param {string} id application id
 */
function checkNotification(id) {
  const notType = {
    info: 'info', 
    success: 'success', 
    danger: 'error', 
    warning: 'warning'
  }
  let notif = {}
  try {
    notif = JSON.parse(localStorage.getItem('MC@notification')) || {}
  } catch(e) { /* ok */ }
  // Get current notifications
  api.getNotifications(not => {
    if (!not || not.error) {
      console.warn('[checkNotification] connexion error')
      return;
    }
    const current = {}
    let i = 0;
    not.forEach(n => {
      // Limit to current scope
      if (n.scope === id || /macarte|geoportail/.test(n.scope) || (n.scope === 'edugeo' && /EDUGEO/.test(document.body.dataset.userRole))) {
        const count = notif['not-'+n.id] || 0;
        if (n.repeatability < 0 || count < n.repeatability) {
          setTimeout(() => {
            new FlashMessage({
              type: notType[n.type] || 'info',
              message: md2html(n.description)
            })
          }, 100*(i++))
          current['not-'+n.id] = count +1
        } else {
          current['not-'+n.id] = count
        }
      }
    })
    try {
      notif = localStorage.setItem('MC@notification', JSON.stringify(current))
    } catch(e) { /* ok */ }
  })
}
  
// Connect to chart buttons
charte.on('user', () => {
  if (!document.body.dataset.connected) {
    connectDialog()
  }
});
charte.on('user:logout', () => {
  api.logout(() => {
    // Force unload on logout
    setTimeout(() => {
      window.onbeforeunload = null;
      location.reload()
    }, 100)
  });
});
charte.on('header:title', () => {
  if (team.getId()) {
    // const teamurl = getTeamURL(team)
    const teamurl = serviceURL.mesequipes + '/#equipe'
    if (document.location !== teamurl) document.location = teamurl;
  } else {
    document.location = serviceURL.home
  }
});


/* Update user on login */
api.on(['login', 'me'], e => {
  if (e.user) {
    charte.setUser(e.user);
  }
});
/* Update user on logout / disconnect */
api.on(['logout', 'disconnect'], () => {
  charte.setUser();
});

/* Handle team */
function changeTeam() {
  dialogMessage.hide();
  // Dialog
  dialog.show({
    title: 'Equipes',
    className: 'select-team',
    content: ' ',
    buttons: { ok: 'ok', cancel: 'annuler' },
    onButton: b => {
      if (b === 'ok') {
        team.set(sel.getTeam());
        charte.dispatchEvent('header:team', { team: sel.getTeam() })
      }
    }
  })
  const img = ol_ext_element.create('IMG', { 
    className: 'waiting',
    src: "",
    parent: ol_ext_element.create('LABEL', { text : 'Choisir une équipe :', parent: dialog.getContentElement() })
  })
  const sel = teamSelector(dialog.getContentElement(), charte.roles)
  sel.onready(() => img.classList.remove('waiting'))
  sel.onselect(o => img.src = o ? o.profile_picture||'' : '')
}

// Update team name and image
function setTeam() {
  charte.setName(team.getName());
  charte.setLogo(team.getImage());
}
team.on('change', setTeam)

// Remove current team on logout
api.on('logout', () => {
  team.set();
})
// On login check if the current team is still valid
api.on('login', e => {
  // Check if user is still in the current team
  if (e.user.organizations) {
    if (!team.checkIn(e.user.organizations)) {
      team.set()
    } else {
      showTeamInfo()
    }
  } else {
    team.set();
  }
})


/** Show team info at start up */
function showTeamInfo(force) {
  if (!force && !/macarte|geocod|mestat|narration/.test(charte.appID)) return;
  if (!team.getId()) return;
  // Delay before hide
  const delay = 5;

  const element = ol_ext_element.create('DIV')
  // Flash message
  const fm = new FlashMessage(({
    type: 'info',
    message: element
  }))
  element.innerHTML = '<img> Vous êtes dans l\'équipe : <b>' + team.getName() +'</b><br/>'
  element.classList.add('team-info')
  element.querySelector('img').src = team.getImage()
  ol_ext_element.create('A', {
    href: '#',
    text: 'Quitter',
    click: e => {
      e.preventDefault();
      fm.hide();
      team.set();
    },
    parent: element
  })
  ol_ext_element.create('SPAN', { text: ' - ', parent: element });
  ol_ext_element.create('A', {
    href: '#',
    text: 'Changer d\'équipe',
    click: e => {
      e.preventDefault();
      fm.hide();
      changeTeam();
    },
    parent: element
  })

  // Timer
  const timer = ol_ext_element.create('I', { parent: element })
  const showTimer = function(t) {
    if (t>0) {
      timer.innerHTML = 'Fermeture automatique dans ' + t + ' secondes'
      setTimeout(() => showTimer(t-1), 1000)
    } else {
      fm.hide();
    }
  }
  showTimer(delay)
}

export { connectDialog, changeTeam, showTeamInfo }

export default charte
