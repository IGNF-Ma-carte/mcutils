import { getViewerURL, getMediaURL } from './api/serviceURL';

import ol_Object from 'ol/Object'
import Collection from 'ol/Collection';
import Ajax from 'ol-ext/util/Ajax'
import ImageLine from 'ol-ext/control/Imageline'
import Swipe from 'ol-ext/control/SwipeMap'
import Clip from 'ol-ext/interaction/ClipMap'

// import Carte from './Carte'
import ol_ext_element from 'ol-ext/util/element';
import setLayout from './layout/layout'
import jCSSRule from './layout/jCSSRule';
import md2html from './md/md2html';
import 'ol-ext/util/View'

import dialog from './dialog/dialog';
import { getUrlPosition, resetUrlPosition, getUrlParameter, hasUrlParameter } from './control/url';
import StoryMapFormat from './format/StoryMap';

import './StoryMap.css'
import _T from './i18n/i18n';
import { containsCoordinate } from 'ol/extent';
import fullscreen from './dialog/fullscreen';
import { fromLonLat } from 'ol/proj';
import Carte from './Carte';
import { unByKey } from 'ol/Observable';
import Feature from 'ol/Feature';
import printCardControl from './control/printCard'

import api from './api/api'
import Select from 'ol/interaction/Select';
import { click as clickCondition } from 'ol/events/condition'
import { getSelectStyleFn } from './style/ignStyleFn';
import { asString } from 'ol/color';
import { addDrawTools, addMeasureTools, addOptionImport } from './control/toolbar';
import mdFeatureSelect from './md/mdFeatureSelect';

// Last created carte
let globalStory;

// Storymap goto step  
window.addEventListener('stepTo', e => {
  if (globalStory) {
    try {
      const param = e.detail[0];
      switch (param) {
        case 'next': {
          globalStory.setStep(globalStory.currentStep + 1)
          break;
        }
        case 'prev': {
          globalStory.setStep(globalStory.currentStep - 1)
          break;
        }
        case 'first': {
          globalStory.setStep(0)
          break;
        }
        case 'last': {
          globalStory.setStep(globalStory.getSteps().getLength())
          break;
        }
        case 'toc': {
          globalStory.showTOC(globalStory.currentStep);
          break;
        }
        default: {
          if (/^[0-9]+$/.test(param)) {
            globalStory.setStep(parseInt(param))
          } else {
            globalStory.setStepByName(param);
          }
          break;
        }
      }
    } catch(e) { /* ok */ }
  }
})

// Storymap change tab
window.addEventListener('tabTo', e => {
  if (globalStory) {
    try {
      let tab = e.detail[0]
      // Get tab by id
      if (tab === parseInt(tab)) tab = parseInt(tab);
      // Change tab in the current story
      if (globalStory.get('model') === 'onglet') {
        globalStory.selectTab(tab)
      } else {
        // Change tab on parent
        window.parent.postMessage({ 
          type: 'tabTo', 
          tab: tab
        }, '*')
      }
    } catch(e) { /* ok */ }
  }
})

// Handle tabTo
window.addEventListener('message', e => {
  switch(e.data.type) {
    case 'tabTo': {
      globalStory.selectTab(e.data.tab)
      break;
    }
  }
})


/* Global var */
const defaultPopup = { 
  type: 'default', 
  closeBox: true, 
  maxWidth: 300, 
  maxHeight: 300, 
  anime: false, 
  shadow: false
};

/*
const defaultControls = { 
  layerSwitcher: true,
  legend: false,
  locate: false,
  mousePosition: false,
  printDlg: false,
  rotation: false,
  scaleLine: true,
  searchBar: false,
  profil: false,
  zoom: true
};
*/

/** Atlas definition
 * @typedef {Object} AtlasDef
 * @property {string} type Map type
 * @property {string} title Map title in the atlas
 * @property {string} description Map description in the atlas
 * @property {string} updated_at Map update date
 * @property {number} nb_view 
 * @property {string} img_url Map image url
 * @property {string} user
 * @property {string} theme Map theme
 * @property {number} theme_id Map theme ID
 * @property {string} share map share 'atlas'
 * @property {string} premium
 * @property {boolean} valid
 * @property {boolean} active
 * @property {string} title_url title as set in url
 * @property {string} view_id view ID
 * @property {string} view_url url to view the carte
 * @property {string} edit_id edition id (if can edit)
 * @property {string} edit_url url for edition (if can edit)
 */

const linki = document.querySelector("link[rel~='icon']");
const defaultLinkIcon = linki ? linki.href : '';

/** StoryMap object that contains the Carte
 * @memberof mcutils
 * @fires read
 * @fires read:start
 * @fires change:carte
 * @fires change:step
 * @fires change:tab
 * @api
 */
class StoryMap extends ol_Object {
  /** Constructor 
   * @param {*} options
   *  @param {string|Element} [target]
   *  @param {string} key GPP api key
   *  @param {string} url StoryMap file url
   *  @param {string} id StoryMap id
   *  @param {boolean} fullscreen
   */
  constructor(options) {
    options = options || {};
    super(options);
    globalStory = this;
    this.cartes = [];
    this.tabs = new Collection();
    if (!options.target) {
      this.target = document.querySelector('[data-role="map"]') || document.createElement('DIV');
    } else {
      this.target = options.target instanceof Element ? options.target : document.getElementById(options.target);
    }
    if (options.fullscreen) this.fullscreen(true);
    this.target.dataset.role = 'storymap';
    this.set('key', options.key);
    this.set('controls', {});
    this.set('tools', {});
    const titleDiv = ol_ext_element.create('DIV', {
      className: 'title',
      parent: this.target
    });
    this.steps = new Collection();
    this._indicators = new Collection();
    // Story DOM elements
    this.element = {
      logo: ol_ext_element.create('IMG', {
        parent: titleDiv
      }),
      titleDiv: titleDiv,
      title: ol_ext_element.create('H1', {
        parent: titleDiv
      }),
      subTitle: ol_ext_element.create('H2', {
        parent: titleDiv
      }),
      title1: ol_ext_element.create('DIV', {
        class: 'title1',
        parent: titleDiv
      }),
      title2: ol_ext_element.create('DIV', {
        class: 'title2',
        parent: titleDiv
      }),
      map: [
        ol_ext_element.create('DIV', {
          className: 'map map1',
          parent: this.target
        }),
        ol_ext_element.create('DIV', {
          className: 'map map2',
          parent: this.target
        })
      ],
      tools: ol_ext_element.create('DIV', {
        className: 'tools',
        parent: this.target
      }),
      tabs: ol_ext_element.create('DIV', {
        className: 'tabs',
        parent: this.target
      }),
      volet: ol_ext_element.create('DIV', {
        className: 'volet',
        parent: this.target
      })
    }
    // Header select
    this.element.tabSelector = ol_ext_element.create('SELECT', {
      className: 'selector',
      change: () => {
        const o = this.element.tabSelector.options[this.element.tabSelector.selectedIndex];
        this.tabs.forEach((t,i) => {
          if (t.option === o) {
            this.selectTab(i)
          }
        })
        // Reset tab selector
        this.element.tabSelector.value = '';
      },
      parent: this.element.tabs
    });
    // Header content
    this.element.tabHeader = ol_ext_element.create('DIV', {
      className: 'header',
      parent: this.element.tabs
    });
    // Volet content
    this.element.step = ol_ext_element.create('DIV', {
      className: 'steps',
      parent: this.element.volet
    });
    this.element.content = ol_ext_element.create('DIV', {
      className: 'content md',
      parent: this.element.volet
    });
    this.element.info = ol_ext_element.create('DIV', {
      parent: this.element.content
    });
    ol_ext_element.scrollDiv(this.element.content, {
      vertical: true,
      mousewheel: true,
      minibar: true
    });
    // Tools content
    ['dub', 'dub1', 'dub2', 'split-h', 'split-v', 'mag'].forEach((i) => {
      ol_ext_element.create('DIV', {
        className: 'compare ' + i,
        click: () => this.setCompare(i),
        parent: this.element.tools
      });
    });
    // Compare map tools
    this.compare = {
      clip: new Clip({ radius: 150 }),
      swipe: new Swipe({ right: true })
    }
    window.addEventListener('resize', () => setTimeout(() => this.compare.swipe._clip()))

    // Load narration
    if (options.id) {
      this.load(options.id);
    }
    setLayout('blue');
    this.on('read', this.start.bind(this));

    // Set step on arrow left/right
    document.addEventListener('keyup', (e) => {
      if (
        !this.get('noStep') 
        && !this.get('freezeStep') 
        && this.get('model') === 'etape' 
        && !/INPUT|TEXTAREA/.test(e.target.tagName)
      ) {
        switch (e.code) {
          case 'ArrowRight':
          case 'ArrowDown': {
            if (this.currentStep < this.steps.getLength()-1) this.setStep(this.currentStep + 1);
            break;
          }
          case 'ArrowLeft':
          case 'ArrowUp': {
            if (this.currentStep > 0) this.setStep(this.currentStep - 1);
            break;
          }
          default: {
            break;
          }
        }
      }
    })

    // Synchronize maps
    window.addEventListener('message', (e) => {
      if (this.get('synchronize') && e.data.type==='centermap') {
        const currentTab = this.getTab(this.getSelectTabIndex()).iframe;
        // Current tab?
        if (currentTab.contentWindow === e.source) {
          this.tabs.forEach(t => {
            // Sync others
            if (t.iframe !== currentTab) {
              t.iframe.contentWindow.postMessage(e.data, '*')
            }
          })
        }
      }
    })
  }
}

/** Set the story target
 * @param {string|Element} target target id or target element
 */
StoryMap.prototype.setTarget = function(target) {
  if (!(target instanceof Element)) target = document.getElementById(target);
  if (!target || target === this.target) return;
  target.dataset.role = 'storymap';
  const child = this.target.children;
  for (let i=child.length-1; i>=0; i--) target.appendChild(child[i]);
  this.target = target;
  this.updateMapSize();
};

/** Get position passed by the url
 * @returns {Object} lon, lat, z and r
 */
StoryMap.prototype.getUrlPosition = getUrlPosition;

/** Reset position passed by the url
 */
StoryMap.prototype.resetUrlPosition = resetUrlPosition;

/** Get url parameters
 * @param {string} [key] if none returns all url parmeters
 * @return {string}
 */
StoryMap.prototype.getUrlParameter = getUrlParameter;

/** Use the position passed by the url
 */
StoryMap.prototype.useUrlPosition = function() {
  const pos = this.getUrlPosition();
  if (pos && pos.lon && pos.lat && this.cartes[0]) {
    const view = this.cartes[0].map.getView();
    view.setCenter(fromLonLat([pos.lon, pos.lat], view.getProjection()));
    if (Object.prototype.hasOwnProperty.call(pos,'z')) view.setZoom(pos.z);
    if (Object.prototype.hasOwnProperty.call(pos,'r')) view.setRotation(pos.r);
  }
};

/** Show/hide title
 * @param {boolean} [b] if not defined returns true if shown
 * @return {boolean}
 */
StoryMap.prototype.showTitle = function(b) {
  if (b!==undefined) {
    this.target.dataset.title = b ? '' : 'hidden';
    this.updateMapSize();
    this.changed('title');
  }
  return this.target.dataset.title !== 'hidden';
};

/** Display StoryMap fullscreen
 * @param {boolean} [b] if not defined returns true if fullscreen
 * @return {boolean}
 */
StoryMap.prototype.fullscreen = function(b) {
  if (b !== undefined){
    if (b) this.target.classList.add('fullscreen');
    else this.target.classList.remove('fullscreen');
    this.updateMapSize();
  } 
  return this.target.classList.contains('fullscreen');
};

/** Clear volet info
 */
StoryMap.prototype.clearInfoVolet = function() {
  if (this.models[this.get('model')].volet) {
    this.element.info.innerHTML = '';
    this.setInfoVolet();
  }
}

/** Display markdown in the tab or a dialog
 * @param {string} md
 * @param {boolean} sel2 second selection (model differentiel)
 */
StoryMap.prototype.setInfoVolet = function(md, sel2) {
  if (this.models[this.get('model')] && this.models[this.get('model')].volet) {
    let where = this.element.info;
    // Differentiel model: 2 selects
    if (this.get('model')==='differentiel' && this.getCarte()) {
      if (!this.element.info.querySelector('.differentiel')) {
        where.innerHTML = '';
        this.element.diff = [];
        const select = [
          this.getCarte().getInteraction('select1'),
          this.getCarte().getInteraction('select2')
        ]
        // Indicator menu
        if (this.getIndicators().getLength()) {
          const indicators = ol_ext_element.create('SELECT', {
            className: 'ol-noscroll indicators',
            change: () => {
              this.set('indicator', indicators.value);
              select.forEach(sel => {
                if (sel.getFeatures().getLength()) {
                  sel.dispatchEvent({
                    type: 'select',
                    selected: [sel.getFeatures().item(sel.getFeatures().getLength() - 1)]
                  })
                }
              })
            },
            parent: this.element.info
          })
          this.getIndicators().forEach(i => {
            const ind = ol_ext_element.create('OPTION', {
              text: i.title,
              value: i.id,
              parent: indicators
            })
            if (i === this.get('indicator')) {
              ind.selected = true;
            }
          })
        } else {
          this.unset('indicator');
        }
        // Add 2 select target
        select.forEach((sel, i) => {
          const elt = ol_ext_element.create('DIV', {
            className: 'differentiel select'+ (i+1) + (i===0 ? ' selected' : ''),
            style: { borderColor: asString(sel.get('color')) },
            click: () => {
              sel.setActive(true);
              this.element.diff[i].classList.add('selected');
              select[1-i].setActive(false);
              this.element.diff[1-i].classList.remove('selected');
            },
            parent: this.element.info
          })
          if (this.get('layers')) {
            const h2 = ol_ext_element.create('DIV', {
              className: 'mcTitle',
              html: md2html(this.get('selectTitle')),
              parent: elt
            })
            const layers = ol_ext_element.create('SELECT', {
              className: 'ol-noscroll',
              parent: h2
            })
            this.get('layers').forEach( l => {
              ol_ext_element.create('OPTION', {
                text: l.get('title') || l.get('name'),
                value: l.get('id'),
                parent: layers
              })
            })
          }
          ol_ext_element.create('DIV', {
            className: 'mcContent',
            parent: elt
          })
          this.element.diff.push(elt);
        });
      }
      where = this.element.diff[sel2 ? 1 : 0].querySelector('.mcContent');
    }
    // Show info
    where.innerHTML = '';
    // Multi selection
    if (md && md.contents && md.renderedFeatures) {
      const contents = md.contents;

      // Multi select
      if (contents.length > 1) {
        // Multi features
        md2html.showSelection(where, this.getCarte().getSelect(), md.index || 1, md.contents, md.renderedFeatures);
      } else {
        // Only one feature
        if (contents.length) {
          md = contents[index - 1]
          where.appendChild(md);
        }
      }
    } else {
      // Show MD
      if (md instanceof Element) {
        where.appendChild(md);
      } else {
        ol_ext_element.create('DIV', {
          html: md2html(md),
          parent: where
        });
      }
    }

    // Render
    md2html.renderWidget(where);
    where.scrollTop = 0;

    // Update on image load
    Array.prototype.slice.call(this.element.content.querySelectorAll('img'))
      .forEach((image) => {
        image.addEventListener('load', () => {
          this.element.content.dispatchEvent(new Event('scroll'));
        });
      });

    // Add print
    if (where.querySelector('.md-card-printer')) {
      if (this.get('model')==='differentiel') {
        if (!sel2 && this.element.diff) {
          printCardControl([ where, this.element.diff[1].querySelector('.mcContent')], this);
        }
      } else {
        printCardControl([ where ], this);
      }
    }
  } else {
    this.showInfoDialog(md, 8000);
  }
};

/** Check if StoryMap has a volet
 */
StoryMap.prototype.hasVolet = function() {
  return this.models[this.get('model')] && this.models[this.get('model')].volet;
};

/** Check if StoryMap has a popup
 */
StoryMap.prototype.hasPopup = function() {
  return !this.hasVolet() || this.models[this.get('model')].popup;
};

/** Set popup options
 * @param {Object} [options] if not defined set current options
 *  @param {string} type
 *  @param {boolean} closeBox
 *  @param {number} maxWidth
 *  @param {number} maxHeight
 *  @param {boolean} anime
 *  @param {boolean} shadow
 */
StoryMap.prototype.setPopup = function(newOptions) {
  if (!this.get('popup')) this.set('popup', defaultPopup);
  // Current options
  const options = this.get('popup') || {};
  // New ones
  if (newOptions) {
    for (let o in newOptions) {
      options[o] = newOptions[o];
    }
  }

  // Set options to all cartes
  this.cartes.forEach(carte => {
    if (carte) {
      carte.popup.setPopupClass(options.type);
      carte.popup.setClosebox(options.closeBox);
      const popContent = carte.popup.element.querySelector('.ol-popup-content');
      popContent.style.maxWidth = options.maxWidth ? 'min(50vw, '+options.maxWidth+'px)' : '';
      popContent.style.maxHeight = options.maxHeight ? 'min(50vh, '+options.maxHeight+'px)' : '';
      if (options.shadow) carte.popup.element.classList.add('shadow');
      else carte.popup.element.classList.remove('shadow');
      if (options.anime) carte.popup.element.classList.add('anim');
      else carte.popup.element.classList.remove('anim');
    }
  })
  this.changed('popup');
};

/** Set popup tips
 * @param {Object} [options] if not defined set current options
 *  @param {boolean} hover
 *  @param {boolean} shadow
 */
StoryMap.prototype.setTips = function(newOptions) {
  if (!this.get('tips')) this.set('tips', { hover: false, shadow: false });
  // Current options
  const options = this.get('tips') || {};
  // New ones
  if (newOptions) {
    for (let o in newOptions) {
      options[o] = newOptions[o];
    }
  }
  this.cartes.forEach(carte => {
    if (options.shadow) carte.popover.element.classList.add('shadow');
    else carte.popover.element.classList.remove('shadow');
  });
  this.changed('tips');
};

/** Show info dialog
 * @param {string} md
 * @param {number} [delay] delay (ms) before auto close, default no auto close
 */
StoryMap.prototype.showInfoDialog = function(md, delay) {
  if (!md) return;
  dialog.show({
    className: 'mapInfo',
    hideOnBack: delay,
    md: md
  });
};

/** Prevent change step manually
 * @param {boolean} [b] if undefined return if the steps are frozen
 * @returns {boolean}
 */
StoryMap.prototype.freezeStep = function(b) {
  if (b!==undefined) {
    this.set('freezeStep', b);
  }
  return this.get('freezeStep');
};

/** Show step by name
 * @param {string} name step name
 * @param {boolean} [anim=true]
 */
StoryMap.prototype.setStepByName = function(name, anim) {
  let n = -1;
  this.getSteps().forEach((s,i) => {
    if (s.title === name) n = i;
  })
  if (n >= 0) this.setStep(n, anim)
}

/** Show step 
 * @param {number} n step number
 * @param {boolean} [anim=true]
 */
StoryMap.prototype.setStep = function(n, anim) {
  if (anim===undefined) anim = this.get('animStep');
  if (!this.steps.getLength() || !this.getCarte()) {
    this.element.step.innerHTML = '';
    this.setInfoVolet('');
    return;
  }
  if (this.get('model') !== 'etape') return;
  this.cartes[0].setSelection();
  // Valid step
  n = n || 0;
  n = Math.max(Math.min(n, this.steps.getLength()-1), 0);
  this.currentStep = n;
  // Create content
  const div = ol_ext_element.create('DIV', {
    className: 'pages'
  });
  // Previous
  ol_ext_element.create('SPAN', {
    className: 'prev' + (n===0 ? ' hidden' : ''),
    title: _T('prev'),
    click: () => {
      if (!this.get('freezeStep') && n>0) this.setStep(n-1);
    },
    parent: div
  });
  // Current
  ol_ext_element.create('DIV', {
    className: 'count',
    html: (n+1) + '/' + this.steps.getLength(),
    parent: div
  });
  // Next
  ol_ext_element.create('SPAN', {
    className: 'next' + (n >= this.steps.getLength() -1 ? ' hidden' : ''),
    title: _T('next'),
    click: () => {
      if (!this.get('freezeStep') && n < this.steps.getLength() -1) this.setStep(n+1);
    },
    parent: div
  });
  ol_ext_element.create('DIV', {
    className: 'toc',
    title: _T('toc'),
    click: () => {
      if (!this.get('freezeStep')) this.showTOC(n);
    },
    parent: div
  });

  this.element.step.innerHTML = '';
  this.element.step.appendChild(div);

  // Show step
  const s = this.steps.item(n);
  if (s) {
    // content
    let content = s.content;
    if (s.showTitle && s.title) {
      content = '## ' + s.title + '\n' + content;
    }
    this.setInfoVolet(content);
    // Delete previous animation
    setTimeout(() => this.cartes[0].map.getView().cancelAnimations());
    // Map position
    if (anim===false || s.animation === 'none') {
      this.cartes[0].map.getView().setCenter(s.center);
      this.cartes[0].map.getView().setZoom(s.zoom);
    } else {
      this.cartes[0].map.getView().takeTour([{
        type: s.animation || 'moveTo',
        center: s.center,
        zoom: s.zoom
      }]);
    }
    /*
    // Get layer ids?
    if (!s.layerIds) {
      s.layerIds = [];
      s.layers.forEach((name) => {
        this.cartes[0].map.getLayers().forEach((l) => {
          if (l.get('title') === name) {
            s.layerIds.push(l.get('id'));
          }
        })
      })
    }
    */
    // Map layers
    this.cartes[0].map.getLayers().forEach((l) => {
      if (s.layerIds.indexOf(l.get('id')) >= 0) {
        l.setVisible(true);
      } else {
        l.setVisible(false);
      }
    })
  }

  // Change step
  this.dispatchEvent({ type: 'change:step', step: s, position: n })
};


/** Show Table of content
 * @param {number} current step number
 */
StoryMap.prototype.showTOC = function(current) {
  // Create TOC
  const ul = ol_ext_element.create('UL', {
    className: 'toc',
  });
  this.steps.forEach((s, i) => {
    ol_ext_element.create('LI', {
      html: s.title,
      className: current===i ? 'active' : '',
      click: () => {
        this.setStep(i, false);
      },
      parent: ul
    })
  })
  // Show info volet
  this.setInfoVolet(ul);
};

/** Set story description
 * @param {string} description
 */
StoryMap.prototype.setDescription = function(description) {
  if (this.get('description') !== description) {
    this.set('description', description);
    this.changed('description');
  }
};

/** Get Title 
 * @returns {string}
 */
StoryMap.prototype.getTitle = function() {
  return this.get('title') || 'macarte';
}

/** Set Title 
 * @param {Object} options
 *  @param {string} [options.title]
 *  @param {string} [options.subTitle]
 *  @param {string} [options.title1]
 *  @param {string} [options.title2]
 */
StoryMap.prototype.setTitle = function(options) {
  if (options.title !== undefined) {
    this.set('title', options.title);
    if (options.title) this.element.title.innerText = options.title;
    else  this.element.title.innerHTML = '<i>sans titre</i>';
    document.title = (options.title ? options.title + ' - ' : '') + 'Ma carte IGN';
    if (this.hasChanged && this.hasChanged()) document.title = document.title + ' ●';
  }
  if (options.subTitle !== undefined) {
    this.set('subTitle', options.subTitle);
    this.element.subTitle.innerText = options.subTitle;
  }
  if (options.title1 !== undefined) {
    this.set('title1', options.title1);
    this.element.title1.innerText = options.title1;
  }
  if (options.title2 !== undefined) {
    this.set('title2', options.title2);
    this.element.title2.innerText = options.title2;
  }
  this.changed('title');
};

/** Set logo
 * @param {string} src
 */
StoryMap.prototype.setLogo = function(src) {
  if (/^img_|^thumb_/.test(src)) src = getMediaURL(src);
  if (this.get('logo') !== src) {
    this.set('logo', src || '');
    this.element.logo.src = src || '';
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = src || defaultLinkIcon;
    this.changed('logo');
  }
};

/** Read the carte
 * @param {string|*} options carte url or carte options object
 * @param {AtlasDef} [atlas={}]
 */
StoryMap.prototype.read = function(options, atlas) {
  this.dispatchEvent({
    type: 'read:start'
  });

  if (typeof(options) === 'string') {
    Ajax.get({
      url: options,
      success: this.read.bind(this),
      error: (e) => {
        this.dispatchEvent(e);
      }
    });
    return;
  }

  // set atlas definition
  this.set('atlas', atlas || {});
  
  // Read carte
  const format = new StoryMapFormat;
  format.read(this, options);
};

/** Reset story, remove existing maps and set a new standard story
 * 
 */
StoryMap.prototype.reset = function() {
  this.unset('id');
  this.read({
    "version":4.01,
    "type": "standard",
    "cartes": [],
    "controls":{
      "zoom": false,
      "scaleLine": true,
      "rotation": false,
      "searchBar": false,
      "profil": false,
      "layerSwitcher": false,
      "locate": false,
      "printDlg": false,
      "mousePosition": false,
      "legend": false
    },
    "param": {
      "title": "",
      "subTitle": "",
      "logo": null,
      "showTitle": true,
      "description": "",
      "lon": 0,
      "lat": 0,
      "rot": 0,
      "zoom": 0
    },
    "layout": {
      "theme": "default",
      "photo": false,
      "colors": [],
      "voletPosition": "right",
      "voletWidth": 250,
      "compare": ""
    },
    "tools":{
      "options": false,
      "print": false,
      "import": false,
      "measure": false,
      "draw": false
    },
    "popup": {
      "popup": {
        "type": "default"
      },
      "tips": {
        "hover": false,
        "shadow": false,
        "length": 200
      }
    }
  });
};

/** StoryMap model def
 */
StoryMap.prototype.models = {
  standard: { title: 'Standard', volet: false },
  volet: { title: 'Volet', volet: true },
  photo: { title: 'Photo', volet: true },
  diapo: { title: 'Diaporama', volet: false },
  etape: { title: 'Etapes', volet: true, popup: true },
  onglet: { title: 'Onglet', volet: false },
  compare: { title: 'Comparaison', volet: false },
//  compareVisio: { title: 'Visionneuse', volet: false },
//  compareRLT: { title: 'Remonter le temps', volet: false }
  differentiel: { title: 'Différentiel', volet: true },
};

/** Set controls
 * @param {Object} [controls] { controlName : boolean } object to set the control in the map, if none update the current controls
 */
StoryMap.prototype.setControls = function(controls) {
  const storyControls = this.get('controls') || {};
  if (!controls) controls = storyControls;
  for (let c in controls) {
    storyControls[c] = controls[c];
    if (this.cartes[0]) this.cartes[0].showControl(c, controls[c]);
    if (this.cartes[1]) this.cartes[1].showControl(c, controls[c]);
  }
  this.changed('control');
};

/** Set control a control on the map
 * @param {string} controlName
 * @param {boolean|Object} enable
 */
StoryMap.prototype.setControl = function(controlName, enable) {
  const opt = {};
  opt[controlName] = enable;
  if (this.get('controls')[controlName] !== opt[controlName]) {
    this.setControls(opt);
  }
};

/** Set compare mode
 * @param {string} mode
 */
StoryMap.prototype.setCompare = function(mode) {
  // Remove mode
  const c0 = this.getCarte(0);
  const c = this.getCarte(1);
  this.element.map[1].style.pointerEvents = 'all';
  if (c) {
    c.map.removeControl(this.compare.swipe);
    c.map.removeInteraction(this.compare.clip);
    c.getSelect().getFeatures().clear();
    c.popup.hide();
    if (this.comparListener) {
      this.comparListener.forEach(l => unByKey(l));
    } else {
      this.comparListener = [];
    }
  }
  if (c0) {
    c0.getSelect().getFeatures().clear();
    c0.popup.hide();
  }
  this.element.tools.querySelectorAll('div').forEach(t => t.classList.remove('select'));
  delete this.target.dataset.compare;
  if (!mode || !c || !c0) return;

  // Set current mode
  this.element.tools.querySelector('.'+mode).classList.add('select');
  if (mode !== 'dub') {
    this.target.dataset.compare = mode;
  }
  switch (mode) {
    case 'split-h': 
    case 'split-v': {
      c.map.addControl(this.compare.swipe);
      setTimeout(() => this.compare.swipe._clip());
      this.comparListener.push(c.map.on('pointermove', (e) => {
        if (!containsCoordinate(this.compare.swipe.getRectangle(), e.pixel)) {
          this.element.map[1].style['pointer-events'] = 'none';
        }
      }));
      this.comparListener.push(c0.map.on('pointermove', (e) => {
        if (containsCoordinate(this.compare.swipe.getRectangle(), e.pixel)) {
          this.element.map[1].style['pointer-events'] = 'all';
        }
      }));
      this.comparListener.push(c0.map.on('pointerdown', () => {
        c.getSelect().getFeatures().clear();
        c.popup.hide();
      }))
      this.comparListener.push(c.map.on('pointerdown', () => {
        c0.getSelect().getFeatures().clear();
        c0.popup.hide();
      }))
      this.compare.swipe.set('orientation', (mode==='split-h' ? 'vertical' : 'horizontal'));
      break;
    }
    case 'mag': {
      c.map.addInteraction(this.compare.clip);
      break;
    }
    default: {
      // console.log(mode)
      break;
    }
  }
  this.updateMapSize();
  [0,1].forEach(i => {
    const c = this.getCarte(i);
    if (c) c.getMap().renderSync();
  })
  this.changed('compare');
};

/** Render the switcher model
 * Use Storymap~Storymap.setControl('switcherModel', model) to set the model value
 */
StoryMap.prototype.switcherModel = function() {
  this.target.dataset.switcherModel = this.get('controls').switcherModel;
};

/** Set model
 * @param {string} [model] model name, if none update the current one
 */
StoryMap.prototype.setModel = function(model) {
  if (!model) model = this.get('model') || 'standard';
  if (!/compare/.test(model) 
    && /compare/.test(this.get('model'))
    && this.cartes[1]) {
    this.setCompare();
    const c = this.cartes.pop();
    c.map.setTarget(null);
  }
  // Clear
  if (model === 'onglet') {
    this.clearCarte();
  } else {
    this.clearTabs();    
  }
  // Set Model
  this.set('model', model);
  this.target.dataset.model = model;
  // Has volet?
  if (this.models[model] && this.models[model].volet) {
    this.target.dataset.volet = this.get('voletPosition') || 'right';
  } else {
    this.target.dataset.volet = 'none';
  }
  if (this.get('noStep')) {
    this.target.dataset.noStep = '';
  } else {
    delete this.target.dataset.noStep;
  }
  // Remove old controls / add new
  if (this.cartes[1]) {
    this.cartes[1]._interactions.synchro.setActive(false);
  }
  if (this.cartes[0]) {
    // Remove special control
    if (this.cartes[0].getControl('imageLine')) this.cartes[0].showControl('imageLine', false);
    // Remove special interactions
    this.cartes[0]._interactions.synchro.setActive(false);
    // Special options
    this.cartes[0].showControl('imageLine', false);
    // Handle selections (model differentiel)
    this.cartes[0].getInteraction('select1').setActive(false)
    this.cartes[0].getInteraction('select1').getFeatures().clear();
    this.cartes[0].getInteraction('select2').setActive(false)
    this.cartes[0].getInteraction('select2').getFeatures().clear();
    this.cartes[0].getInteraction('select').setActive(true);
    this.cartes[0].getInteraction('select').getFeatures().clear();
    // Handle models
    switch (model) {
      case 'compareRLT': {
        this.element.title1.innerHTML = this.element.title2.innerHTML = '';
        ol_ext_element.create('SPAN', { 
          html: _T('compareRLT'),
          parent: this.element.title1
        });
        // Layer 1
        const layers1 = this.cartes[0].map.getLayers();
        const sel1 = ol_ext_element.create('SELECT', {
          change: () => {
            layers1.forEach(l => l.setVisible(false));
            layers1.item(sel1.value).setVisible(true);
          },
          parent: this.element.title1
        });
        let lvisible = false;
        layers1.forEach((l, i) => {
          if (!lvisible && l.getVisible()) {
            lvisible = true;
          } else {
            l.setVisible(false);
          }
          const opt = ol_ext_element.create('OPTION', {
            value: i,
            html: l.get('title') || l.get('name'),
            parent: sel1
          });
          if (l.getVisible()) opt.setAttribute('selected', 'selected');
        });
        ol_ext_element.create('SPAN', { 
          html: _T('withRLT'),
          parent: this.element.title1
        });
        // Layer 2
        const layers2 = this.cartes[1].map.getLayers();
        const sel2 = ol_ext_element.create('SELECT', {
          change: () => {
            layers2.forEach(l => l.setVisible(false));
            layers2.item(sel2.value).setVisible(true);
          },
          parent: this.element.title1
        });
        lvisible = false;
        layers2.forEach((l, i) => {
          if (!lvisible && l.getVisible()) {
            lvisible = true;
          } else {
            l.setVisible(false);
          }
          const opt = ol_ext_element.create('OPTION', {
            value: i,
            html: l.get('title') || l.get('name'),
            parent: sel2
          })
          if (l.getVisible()) opt.setAttribute('selected', 'selected');
        });
      }
      //fallthrough
      case 'compare': {
        if (this.cartes[0] && this.cartes[1]) {
          this.cartes[0]._interactions.synchro.maps = [ this.cartes[1].map ];
          this.cartes[1]._interactions.synchro.maps = [ this.cartes[0].map ];
          this.cartes[0]._interactions.synchro.setActive(true);
          this.cartes[1]._interactions.synchro.setActive(true);
        }
        this.setCompare('dub');
        break;
      }
      case 'photo':
      case 'diapo': {
        // Add ImageLine control
        this.cartes[0]._controls.imageLine = new ImageLine({
          className: 'ol-arrow',
          hover: true,
          useExtent: true,
          linkColor: 'yellow', // 'rgba(255,255,255,.7)',
          getTitle: (f) => {
            const content = f.getPopupContent(true);
            const h = content.querySelector('h1') || content.querySelector('h2') || content.querySelector('h3');
            if (h) {
              return h.innerText;
            }
          },
          getImage: (f) => {
            const content = f.getPopupContent(true);
            const img = content.querySelector('img');
            if (img) {
              return img.getAttribute('src');
            }
          }
        });
        // Show info on image select
        this.cartes[0]._controls.imageLine.on('select', (e) => {
          this.cartes[0].setSelection(e.feature);
        })
        this.cartes[0].showControl('imageLine', true);
        break;
      }
      case 'differentiel': {
        this.setInfoVolet();
        this.cartes[0]._interactions.select1.setActive(true)
        this.cartes[0]._interactions.select.setActive(false);
        break;
      }
      default: {
        break;
      }
    }
  }
  this.setInfoVolet();
  this.updateMapSize();
  this.changed('model');
};

/** Get a tab
 * @param {number} index
 */
 StoryMap.prototype.getTab = function(index) {
  return this.tabs.item(index);
};

/** Get the tabs length
 */
StoryMap.prototype.getTabLength = function() {
  return this.tabs.getLength();
};

/** Get the selected tab index
 * @returns {number} index
 */
StoryMap.prototype.getSelectTabIndex = function() {
  let index = -1;
  this.tabs.forEach((t,i) => {
    if (t.button.className === 'selected') {
      index = i;
    }
  });
  return index;
};

/** Remove all tabs */
StoryMap.prototype.clearTabs = function() {
  this.tabs.forEach(t => {
    t.iframe.remove();
  });
  this.tabs.clear();
  this.element.tabHeader.innerHTML = '';
  this.element.tabSelector.innerHTML = '';
  this.changed('tabs');
};

/** Add a new tab to the story
 * @param {number} index
 */
StoryMap.prototype.removeTab = function(index) {
  const t = this.tabs.removeAt(index);
  if (t) {
    t.button.remove();
    t.option.remove();
    t.iframe.remove();
    if (t.button.className === 'selected') {
      this.selectTab(0);
    }
  }
  this.changed('tab');
};

/** Add a new tab to the story
 * @param {number|string} index tab index or carte ID
 */
StoryMap.prototype.selectTab = function(index) {
  if (typeof(index) !== 'number') {
    this.tabs.forEach((t,i) => {
      if (t.id===index) index = i;
    })
  }
  if (this.getSelectTabIndex() === index) return;
  const t = this.tabs.item(index);
  if (t) {
    t.button.click();
  }
  // Reset tab selector
  this.element.tabSelector.value = '';
};

/** Reorder tab */
StoryMap.prototype.reorderTabs = function() {
  this.element.tabHeader.innerHTML = '';
  this.element.tabSelector.innerHTML = '';
  this.tabs.forEach(t => {
    this.element.tabHeader.appendChild(t.button)
    this.element.tabSelector.appendChild(t.option)
  });
  this.changed('tab');
  // Reset tab selector
  this.element.tabSelector.value = '';
};

/** Change tab title
 * @param {number} index
 * @param {string} title
 * @param {string} description
 */
StoryMap.prototype.setTabTitle = function(index, title, description) {
  const t = this.tabs.item(index);
  if (t) {
    t.button.innerText = t.title = title || '';
    t.button.title = t.description = description || '';
    t.option.innerText = t.title = title || '';
  }
  this.changed('tab:title');
};

/** Show tab map title
 * @param {number} index
 * @param {boolean} show show the map title
 */
StoryMap.prototype.showTabTitle = function(index, show) {
  show = !!show;
  const t = this.tabs.item(index);
  if (t && t.showTitle !== show) {
    t.showTitle = show;
    t.iframe.src = getViewerURL(t);
    this.changed('tab:title');
  }
};

/** Add a new tab to the story
 * @param {TabOptions} options an objet with an id and a title
 *  @param {string} options.title button info title
 *  @param {string} options.id narrative id
 *  @param {string} options.description button hover title
 *  @param {boolean} options.showTitle
 */
StoryMap.prototype.addTab = function(options, select) {
  // Prevent tab inside tab
  // TODO
  // Add tab
  const o = Object.assign({}, options);
  select = select || (this.tabs.getLength() === 0);
  if (select) {
    this.tabs.forEach(t => {
      t.iframe.dataset.hidden = 1;
      t.button.className = '';
    })
  }
  // Tab button
  const pos = this.tabs.getLength();
  o.button = ol_ext_element.create('DIV', {
    title: o.description || '',
    className: select ? 'selected' : '',
    click: () => {
      this.tabs.forEach(t => {
        t.iframe.dataset.hidden = 1;
        t.button.className = '';
      })
      o.iframe.dataset.hidden = 0;
      o.button.className = 'selected';
      // Center tab
      const rsel = this.element.tabHeader.querySelector('.selected').getBoundingClientRect();
      const rhead = this.element.tabHeader.getBoundingClientRect();
      const rtab = this.element.tabs.getBoundingClientRect();
      this.element.tabHeader.scrollLeft += rsel.left - rhead.width / 2 - rtab.left;
      // Dispatch event
      this.dispatchEvent({ type: 'change:tab', position: pos, tab: o })
    },
    parent: this.element.tabHeader
  });
  o.button.innerText = o.title;
  // select option
  o.option = ol_ext_element.create('OPTION', {
    text: o.title + '\u00a0\u00a0',
    value: o.id,
    parent: this.element.tabSelector
  })
  // Reset tab selector
  this.element.tabSelector.value = '';
  // Iframe
  o.view_id = o.id;
  o.type = 'storymap';  // Compatibility MCV3
  o.iframe = ol_ext_element.create('IFRAME', {
    src: getViewerURL(o, true), 
    parent: this.element.tabs
  });
  o.iframe.dataset.hidden = (select ? 0 : 1);
  this.tabs.push(o);
  this.changed('tab:add');
};

/** Get the map viewer url
 * @param {Object} options
 * @return {string}
 */
StoryMap.prototype.getViewerUrl = function(options) {
  if (!this.get('id')) return false;
  options = Object.assign({}, options || {});
  options.id = this.get('id');
  options.title = this.get('title');
  options.type = 'storymap';
  return getViewerURL(options);
};

/** Get carte
 * @param {number} n carte number 0 or 1
 * @returns {mcutils.Carte}
 */
StoryMap.prototype.getCarte = function(n) {
  return this.cartes[n || 0];
};

/** Remove all existing cartes */
StoryMap.prototype.clearCarte = function() {
  this.cartes.forEach(c => c.map.setTarget(null));
  this.cartes = [];
  this.changed('carte:clear');
};

/** Set carte 
 * @param {mcutils.Carte} carte
 * @param {number} n carte number 0 or 1
 */
StoryMap.prototype.setCarte = function(carte, n) {
  n = n || 0;
  // Remove previous
  if (this.cartes[n]) {
    this.cartes[n].map.setTarget(null);
  }
  // Add new one
  if (carte) {
    this.cartes[n] = carte;
    carte.setParent(this);
    carte.map.setTarget(this.element.map[n]);
    carte.setSelectStyle({ points: false });
    // Handle feature select on the map
    const onselect = (e) => {
      // Get copy of selected features
      let features = [...carte.getSelect().getFeatures().getArray()];
      let firstFeature = features[0]

      // Cluster : zoom or display Popup
      if (firstFeature && firstFeature.get('features') instanceof Array) {
        const displayClusterPopup = firstFeature.get('features')[0].getLayer().get("displayClusterPopup")
        // If displayClusterPopup is true, we display the popup; else we zoom to the extent
        if (!displayClusterPopup && (firstFeature.get('features').length > 1 || features.length > 1)) {
          let clusterFeatures = [];
          // Check all elements in the selected features
          features.forEach(feat => {
            const cluster = feat.get('features');
            if (cluster)
              clusterFeatures.push(...cluster)
              else {
              clusterFeatures.push(feat)
            }
          })
          carte.zoomToClusterExtent(clusterFeatures);
          features = [];
          firstFeature = false;
        }
      }
      
      // Show info
      carte.popupFeatures(false);
      if (this.get('model') === 'diapo') {
        if (firstFeature instanceof Feature) {
          const features = [];
          // Get 100 feature for diaporama
          let nb = 100;
          const tabFeatures = carte.getControl('imageLine').getFeatures();
          for (let i=0; i<tabFeatures.length; i++) {
            for (let j=0; j<tabFeatures[i].length; j++) {
              const f = tabFeatures[i][j];
              const content = f.getPopupContent(true);
              if (content.querySelector('img')) {
                features.push(f);
                if (--nb < 0) break;
              }
            }
            if (nb < 0) break;
          }
          fullscreen.diaporama(firstFeature, features)
        }
      } else if (this.hasPopup()) {
        if (!mdFeatureSelect(firstFeature) && features.length) {
          carte.popupFeatures(features, e.mapBrowserEvent ? e.mapBrowserEvent.coordinate : carte.map.getView().getCenter());
        }
      } else {
        if (firstFeature) firstFeature._indicator = this.get('indicator');
        // Display feature info or description
        this.setInfoVolet(
          features.length ? carte.getFeaturesPopupContent(features, true) : this.get('description'),
          // Second select (differentiel model)
          e.target === carte._interactions.select2
        );
      }
    }
    carte.getSelect().on('select', onselect);

    carte.on('layer:featureInfo', e => {
      carte.popupFeature(e.feature, e.coordinate)
    });
    // Add 2 select interactions for differentiel model
    [1,2].forEach((i) => {
      const styleOptions = Object.assign(this.getCarte()._styleOptions);
      styleOptions.color = (i===1 ? 'red' : 'blue');
      const sel = carte._interactions['select'+i] = new Select({
        filter: (f) => {
          const layer = f.getLayer();
          const slayer = this.element.info.querySelector('.select'+i+' select');
          if (slayer) {
            return slayer.value == layer.get('id');
          }
          if (layer.selectable) return layer.selectable();
          return true;
        },
        hitTolerance: 3,
        condition: clickCondition,
        toggleCondition: clickCondition,
        style: getSelectStyleFn(styleOptions)
      })
      sel.set('color', styleOptions.color);
      sel.setActive(false);
      carte.getMap().addInteraction(sel);
      sel.on('select', onselect);
      // select only one at a time
      sel.on('select', () => {
        const features = sel.getFeatures();
        if (features.getLength() > 1) {
          const f = features.pop();
          features.clear();
          features.push(f);
        }
      });
    })
    // Hovering a feature
    if (carte.getInteraction('hover')) {
      carte.getInteraction('hover').on('hover', e => {
        if (this.get('tips') && 
          this.get('tips').hover && 
          e.feature.getLayer && 
          e.feature.getLayer() && 
          e.feature.getLayer().get('popupHoverSelect')) {
          if (e.feature !== carte.popover.feature) {
            carte.popover.feature = e.feature;
            const content = e.feature.getInfoContent()
            if (content) {
              carte.popover.show(e.coordinate, content);
            } else {
              carte.popover.hide();
              carte.popover.prevHTML = '';
            }
          } else {
            if (carte.popover.prevHTML) {
              carte.popover.show(e.coordinate);
            }
          }
        } else {
          carte.popover.hide();
        }
      })
      carte.getInteraction('hover').on('leave', () => {
        carte.popover.feature = null;
        carte.popover.hide();
      })
    }
    // Set controls when read
    carte.once('read', () => {
      this.setControls();
    })
  } else {
    this.cartes[n] = null;
    for (let i=this.cartes.length-1; i>=0; i--) {
      if (!this.cartes[i]) this.cartes.pop();
      else break;
    }
  }
  if (!this.cartes.length) {
    this.target.dataset.nomap = '';
  } else {
    delete this.target.dataset.nomap;
  }
  // Update models options
  this.setModel();
  // Update controls
  this.setControls();
  // Update popup
  this.setPopup();
  this.changed(carte);
  // New carte is loaded
  this.dispatchEvent({ type: 'change:carte', index: n, carte: carte });
};

/** Set the layout
 * @aram {Object} layout
 *  @param {string} [layout.theme]
 *  @param {Array<ol.color>|string} [layout.colors] [bgColor, txtColor, darkColor, lightColor] used if theme='custom'
 *  @param {string} layout.voletPosition
 *  @param {number} layout.voletWidth
 */
StoryMap.prototype.setLayout = function (layout) {
  // colors
  if (layout.theme === 'custom') {
    this.set('colors', layout.colors);
    setLayout(layout.colors);
  } else if (layout.theme) {
    this.set('colors', layout.theme);
    setLayout(layout.theme);
  }
  let voletWidth = layout.voletWidth;
  if (voletWidth) this.set('voletWidth', Math.max(voletWidth, 150));
  voletWidth = this.get('voletWidth') || 250;
  let voletPosition = layout.voletPosition;
  if (voletPosition) this.set('voletPosition', voletPosition);
  else voletPosition = this.get('voletPosition') || 'right';
  // volet
  jCSSRule('[data-role="storymap"] .volet', 'width', voletWidth+'px');
  jCSSRule('[data-role="storymap"][data-volet="right"] .map', 'width', 'calc(100% - '+voletWidth+'px'+')');
  jCSSRule('[data-role="storymap"][data-volet="left"] .map', 'width', 'calc(100% - '+voletWidth+'px'+')');
  // position
  if (this.models[this.get('model')].volet) {
    this.target.dataset.volet = voletPosition;
  } else {
    this.target.dataset.volet = 'none';
  }
  // update
  this.updateMapSize();
  this.changed('layout');
};

/** Set the CSS for a storymap
 * @param {string} css
 * @return {*} error
 */
StoryMap.prototype.setStyleSheet = function (css) {
  css = css || '';
  // Get rules
  const doc = document.implementation.createHTMLDocument('');
  const styleElement = document.createElement('style');
  styleElement.setAttribute('type', 'text/css');
  styleElement.textContent = css;
  // the style will only be parsed once it is added to a document
  doc.body.appendChild(styleElement);

  const rules = styleElement.sheet.cssRules;

  // Prefix classes
  let newCSS = ''
  for (let i=0; i<rules.length; i++) {
    const r = rules[i];
    if (r.selectorText) {
      const selector = [];
      r.selectorText.split(',').forEach(s => {
        s = s.trim();
        if (/^story\b/.test(s)) {
          selector.push('[data-role="storymap"] '+ s.replace(/story|dialog|body/g, ''))
        } else if (/^dialog\b/.test(s)) {
          selector.push('.ol-ext-dialog.mapInfo form '+ s.replace(/story|dialog|body/g, ''))
        } else {
          selector.push('[data-role="storymap"] '+ s.replace(/story|dialog|body/g, ''))
          selector.push('.ol-ext-dialog.mapInfo form '+ s.replace(/story|dialog|body/g, ''))
        }
      });
      r.selectorText = selector.join(',');
      newCSS += r.cssText + '\n';
    } else if (/^@font-face/.test(r.cssText) || /^@import url\([\'|\"]https:\/\/fonts.googleapis.com\/css2/.test(r.cssText)) {
      // Font face and google fonts
      newCSS += r.cssText + '\n';
    } else if (/^@keyframes/.test(r.cssText)) {
      // Keyframe
      newCSS += r.cssText + '\n';
    }
  }

  // Create the stylesheet (if not exist)
  if (!this._styleSheet) {
    this._styleSheet = document.createElement('style');
    this._styleSheet.setAttribute('type', 'text/css');
    document.body.appendChild(this._styleSheet);
  }
  // New sheet
  this._styleSheet.innerHTML = newCSS;
  this.set('css', css);
}

/** Get StoryMap steps whe type=etape
 * @returns {Collection}
 */
StoryMap.prototype.getSteps = function() {
  return this.steps;
};

/** Load StoryMap from server
 * @param {AtlasDef|string} c Story definition or the story id
 */
StoryMap.prototype.load = function(c) {
  this.dispatchEvent({
    type: 'read:start'
  });

  const id = (typeof(c) === 'string') ? c : c.view_id;

  api.getMapFile(id, (data) => {
    this.readData(data, id, c);
  })
};

/** Read a storymap from data
 * @param {Object} data,
 * @param {string} [id]
 * @param {Object} [c] carte desc
 */
StoryMap.prototype.readData = function(data, id, c) {
  c = c || {};
  
  if (data.error) {
    this.dispatchEvent({ type: 'error', status: 0, statusText: 'noData' });
  } else {
    // Storymap or Carte ?
    if (data.cartes) {
      // Check recursive tabs
      if ((data.type === 'onglet' || (data.modele && data.modele.type === 'onglet')) 
        && window.location.search.replace(/^\?/,'').split('&').indexOf('tab') > -1) {
        this.dispatchEvent({ type: 'error', recursive: true })
      } else {
        // A storymap 
        this.set('id', id);
        this.read(data, (typeof(c) === 'string') ? null : c);
      }
    } else {
      // Read a carte ?
      const carte = new Carte({ key: this.get('key') });
      carte.set('id', id);
      carte.on('read', (e) => {
        this.set('id', null);
        this.setModel('standard');
        this.setCarte(carte);
        this.setLayout({ theme: 'blue' });
        this.setDescription('');
        this.setPopup(defaultPopup);
        this.setTitle({ title: c.title || '', subTitle: '', title1: '', title2: '' });
        this.setLogo();
        carte.showControl('attribution', true)
        this.showTitle(false);
        this.dispatchEvent(e);
      });
      carte.on('error', (e) => {
        this.dispatchEvent(e);
      });
      carte.read(data);
      // Force tips
      this.setTips({ hover: true, shadow: false })
    }
  }
};

/** Save a storymap
 * @returns {Object}
 */
StoryMap.prototype.write = function() {
  return (new StoryMapFormat).write(this);
};

/** Start playing the StoryMap
 */
StoryMap.prototype.start = function() {
  switch(this.get('model')) {
    case 'etape': {
      this.setStep(0, false);
      if (!hasUrlParameter('noPop')) {
        this.showInfoDialog(this.get('description'), 8000);
      }
      break;
    }
    case 'differentiel': {
      this.showInfoDialog(this.get('description'), 8000);
      break;
    }
    case 'onglet': {
      break;
    }
    default: {
      if (!hasUrlParameter('noPop') || this.hasVolet) {
        this.setInfoVolet(this.get('description'));
      }
      break;
    }
  }
};

/** Story has a control
 * @param {string} name control id
 * @returns {boolean} 
 */
StoryMap.prototype.hasControl = function(name) {
  return this.getCarte() && this.getCarte().hasControl(name);
};

/** Print the map 
 * @param {number} n carte number
 * @param {function} [callback] if defined perform a fast print and returns the resulting canvas as callback argument
 */
StoryMap.prototype.print = function(n, callback) {
  const c = this.getCarte(n);
  if (c && c.getControl('printDlg')) {
    if (callback) {
      const printer = this.getCarte().getControl('printDlg').getrintControl();
      printer.fastPrint({}, callback)
    } else {
      c.getControl('printDlg').print();
    }
  }
};

/** Update map */
StoryMap.prototype.updateMapSize = function() {
  this.cartes.forEach( c=> {
    if (c) c.map.updateSize();
  });
}

/** Set select color
 * @param {string} select interaction name (select1 or select2)
 * @param {ol/colorLike} color
 */
StoryMap.prototype.setSelectColor = function(select, color) {
  if (!this.getCarte()) return;
  const styleOptions = Object.assign(this.getCarte()._styleOptions);
  styleOptions.color = color;
  const sel = this.getCarte().getInteraction(select);
  sel.set('color', color);
  if (!sel.style_) console.warn('[setSelectStyle] no style defined!')
  sel.style_ = getSelectStyleFn(styleOptions);
  if (sel.getFeatures().getLength()) {
    const f = sel.getFeatures().pop();
    sel.getFeatures().push(f);
  }
  this.element.info.querySelectorAll('.differentiel').forEach((d, i) => {
    d.style.borderColor = asString(this.getCarte().getInteraction('select'+(i+1)).get('color'));
  })
}

/** Get select color
 * @param {string} select interaction name (select1 or select2)
 * @returns {ol/colorLike} color
 */
StoryMap.prototype.getSelectColor = function(select) {
  if (!this.getCarte()) {
    return select==='select1' ? '#f00' : '#00f';
  }
  const sel = this.getCarte().getInteraction(select);
  return sel.get('color');
}

/** Set layers that can be selected in a differentiel model
 * @param {string} [title]
 * @param {Array<ol/Layer>} [layers] default: all selectable layers
 */
StoryMap.prototype.setLayerSelection = function(title, layers) {
  if (this.getCarte() && layers === true) {
    layers = [];
    this.getCarte().getMap().getLayers().forEach(l => {
      if (l.selectable && l.selectable()) layers.push(l);
    })
  }
  this.set('selectTitle', title || '');
  this.set('layers', layers);
  this.element.info.innerHTML = '';
  this.setInfoVolet();
}

/** Add indicators (user variables) to the story (differentiel model)
 * Use story.get('indicator') to get current value
 * @param {Array<Object>} [indicators] 
 */
StoryMap.prototype.setIndicators = function(indicators) {
  this._indicators.clear()
  if (indicators && indicators.length) {
    // old version (as string)
    if (typeof(indicators) === 'string') {
      const indic = indicators.split(',');
      indic.forEach(i => {
        const t = i.split('::')
        this._indicators.push({
          id: t[0],
          title: t[1] || t[0]
        })
      })
    } else {
      indicators.forEach(i => this._indicators.push(i))
    }
    this.set('indicator', this._indicators.item(0).id);
  } else {
    this.unset('indicator');
  }
  this.clearInfoVolet();
}

/** Get indicator list
 * @returns {Collection} [indicators] 
 */
StoryMap.prototype.getIndicators = function() {
  return this._indicators;
}

/** Add stoymap tool bar 
 * @param {Object} options
 *  @param {boolean} import
 *  @param {boolean} measure
 *  @param {boolean} draw
 *  @param {boolean} options
 */
StoryMap.prototype.addToolBar = function() {
  const options = this.get('tools');
  // Nothing to do
  if (!options.import && !options.options && !options.measure && !options.draw) return;
  // Allready done
  if (!this.getCarte() || this.getCarte().hasControl('toolbar')) return;
  // Show toolbar
  this.getCarte().showControl('toolbar');
  const tbar = this.getCarte().getControl('toolbar')

  // Drawing tools
  if (options.draw) addDrawTools(this.getCarte())
  // Measure interactions
  if (options.measure) addMeasureTools(this.getCarte())
  // Options
  // if (options.options) addOptionTools(this.getCarte());
  // Import
  if (options.import) addOptionImport(this.getCarte());

  // Remove controls on print
  this.getCarte().getControl('printDlg').on('show', () => {
    tbar.getControls().forEach(c => {
      if (c.setActive) c.setActive(false)
    });
  })
}

export default StoryMap
