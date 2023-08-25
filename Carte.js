// Import fonts
import 'font-gis/css/font-gis.css'
import 'font-ign/font-ign.css'
// Import ol styles
import 'ol/ol.css'
import 'ol-ext/dist/ol-ext.css'
// default style
import './style.css'
import './control/control.css'
import './Carte.css'

import './config/polyfill'
import './dialog/dialog';

import mcOptions from './config/config'
import { getViewerURL } from './api/serviceURL'
import md2html from './md/md2html'

import ol_Object from 'ol/Object'
import Map from 'ol/Map'
import View from 'ol/View'
import './ol/BaseLayer'
import { defaults as defaultControls } from 'ol/control'
import { defaults as defaultInteractions, DragRotate, PinchRotate } from 'ol/interaction'
import Select from './ol/Select'
import Synchronize from 'ol-ext/interaction/Synchronize'
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom'
import { click as clickCondition, platformModifierKeyOnly } from 'ol/events/condition'
import { buffer, createEmpty as createEmptyExtent, extend as extendExtent, getCenter } from 'ol/extent';
import MVT from './layer/MVT'

import Ajax from 'ol-ext/util/Ajax'
import ControlBar from 'ol-ext/control/Bar'
import CanvasAttribution from 'ol-ext/control/CanvasAttribution'
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine'
// import SearchControl from 'ol-ext/control/SearchGeoportail'
import SearchControl from './ol/SearchGeoportail'
import Permalink from 'ol-ext/control/Permalink'
import Dialog from 'ol-ext/control/Dialog'
import PrintDialog from 'ol-ext/control/PrintDialog'
import MousePosition from 'ol/control/MousePosition'
import { format as coordFormat } from 'ol/coordinate';
import Zoom from 'ol/control/Zoom'
import _T from './i18n/i18n'
import ol_ext_element from 'ol-ext/util/element'
import CanvasTitle from 'ol-ext/control/CanvasTitle'
import LocateCtrl from 'ol-ext/control/GeolocationButton'
import notification from './dialog/notification'
import getLayerSwitcher from './control/layerSwitcher'

import Popup from 'ol-ext/overlay/Popup'
import Tooltip from 'ol-ext/overlay/Tooltip'
import Hover from 'ol-ext/interaction/Hover'

import CarteFormat from './format/Carte'
import LegendCtrl from 'ol-ext/control/Legend'
import Legend from 'ol-ext/legend/Legend'

import { saveAs } from 'file-saver';
import { jsPDF } from "jspdf";

import { getSelectStyleFn, getStyleFn } from './style/ignStyleFn'

import './layer/Geoportail'
import { toStringHDMS } from 'ol/coordinate'

import loadFont from './font/loadFonts'
import api from './api/api'
import serviceURL from './api/serviceURL'
import Collection from 'ol/Collection'
import SymbolLib from './style/SymbolLib'
import { fromLonLat } from 'ol/proj'
import 'ol-ext/util/View'
import setContact from './charte/setContact'
import Profil from './control/Profil'

import QRCode from 'qrjs'
import guichetAPI, { getAuth } from './guichet/api'
import fakeMap from './dialog/fakeMap'
import VectorStyle from './layer/VectorStyle'
import './ol/source/getFeatureInfo'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'

loadFont();

// Last created carte
let globalCarte;

// Move last map to destination
window.addEventListener('moveTo', e => {
  if (globalCarte) {
    try {
      const pos = fromLonLat([e.detail[0], e.detail[1]])
      globalCarte.map.getView().setCenter(pos);
      if (e.detail[2]) globalCarte.map.getView().setZoom(e.detail[2]);
    } catch(e) { /* ok */ }
  }
})
window.addEventListener('flyTo', e => {
  if (globalCarte) {
    try {
      const pos = fromLonLat([e.detail[0], e.detail[1]])
      globalCarte.map.getView().flyTo({
        center: pos,
        zoom: e.detail[2]
      });
    } catch(e) { /* ok */ }
  }
})

/* Login dialog */
const loginPage = `<label>Login de l'espace collaboratif</label>
<input type="text" class="login" />
<label>Mot de passe</label>
<input type="password" class="pwd" />
<i class="error">Impossible de se connecter...</i>`

const loginDlg = new Dialog({ 
  closeOnSubmit: false,
  closeBox: true,
  target: document.body
});
loginDlg.setMap(fakeMap);

/** Carte object
 * @memberof mcutils
 * @fires loading
 * @fires read:start
 * @fires read
 * @fires error
 * @fires authenticate
 * @api
 */
class Carte extends ol_Object {
  /** Constructor 
   * @param {*} options
   *  @param {string|Element} [options.target]
   *  @param {string} options.key GPP api key
   *  @param {string} options.url carte file url
   *  @param {string} options.id carte id
   */
  constructor(options) {
    options = options || {};
    super(options);
    globalCarte = this;
    this.map = new Map({
      target: options.target,
      view: new View({
        center: [0,0],
        zoom: 0
      }),
      controls: defaultControls ({ attribution: false, zoom: false }),
      interactions: defaultInteractions({ mouseWheelZoom: false })
    });
    this.set('key', options.key);
    // Handle layer ids
    this.layerId_ = 0;
    this.map.getLayers().on('add', (e) => {
      const layer = e.element;
      if (layer.get('id')) {
        this.layerId_ = Math.max(this.layerId_, layer.get('id'))
      } else {
        e.element.set('id', ++this.layerId_);
      }
    })
    // Check for authentication
    let checkAuth
    this.map.getLayers().on('add', (e) => {
      if (e.element.get('type') === 'ECo' && !getAuth()) {
        if (checkAuth) clearTimeout(checkAuth);
        checkAuth = setTimeout(() => {
          this.authenticate()
        })
      }
    })
    // Add mouseWheelZoom (noMouseWheel option)
    this.map.addInteraction(new MouseWheelZoom({ 
      condition: (e) => {
        if (this.map.get('noMouseWheel') && e.type === 'wheel' && !platformModifierKeyOnly(e)) {
          this.notification(_T('ctrlZoom'));
          return false;
        }
        return true;
      }
    }));
    // Map selection
    this._styleOptions = {
      type: 'zoom',
      points: true
    };
    // Image layer selection
    this.getMap().on('singleclick', e => {
      if (!this.getSelect().getActive()) return;
      // Is a feature at pixel ?
      const vectors = []
      this.getMap().getFeaturesAtPixel(e.pixel, { hitTolerance: 3 }).forEach(f => {
        if (f.getLayer()) vectors.push(f.getLayer())
      })
      // Get layer at pixel
      const layers = this.getMap().getLayers().getArray()
      for (let i = layers.length - 1; i>=0; i--) {
        const l = layers[i];
        if (l instanceof VectorStyle || l instanceof MVT) {
          if (vectors.indexOf(l) >= 0) return
        }
        // Image layer
        if (l.getData) {
          const pix = l.getData(e.pixel);
          // Get feature info ?
          if (l.getSource().getFeatureInfo && pix && pix[3]) {
            const content = l.getPopupContent();
            // No content
            if (!content) return;
            // Empty content
            if (!content.titre && !content.desc && !content.img && !content.coord) return;
            // Get feature info
            l.getSource().getFeatureInfo(
              e.coordinate, 
              this.getMap().getView().getResolution(), {
                INFO_FORMAT: 'application/json',
                callback: resp => {
                  const attr = JSON.parse(resp).features[0].properties
                  attr.geometry = new LineString([e.coordinate, e.coordinate])
                  const f = new Feature(attr)
                  f.setLayer(l)
                  this.dispatchEvent({
                    type: 'layer:featureInfo',
                    coordinate: e.coordinate,
                    layer: l,
                    feature: f
                  })
                }
              }
            );
            break;
          }
        }
      }
    })
    // Add interactions
    this._interactions = {
      select: new Select({
        layers: (l) => {
          if (l.selectable) return l.selectable();
          return false;
        },
        hitTolerance: 3,
        condition: clickCondition,
        style: getSelectStyleFn(this._styleOptions)
      }),
      // remove issue on large datasets
      hover: new Hover({
        layerFilter: (l) => {
          // return l.get('popupHoverSelect') || (l.get('parent') && l.get('parent').get('popupHoverSelect'));
          return l.selectable && l.selectable();
        },
        hitTolerance: 3,
        cursor: 'pointer'
      }),
      synchro: new Synchronize({ active: false })
    }
    for (let i in this._interactions) {
      this.map.addInteraction(this._interactions[i]);
    }
    this._styleOptions.features = this.getSelect().getFeatures();
    // Define map controls
    this._controls = {
      // a toobar for drawing controls
      toolbar: new ControlBar({ className: 'edit' }),
      // stores controls in the control bar
      ctrlbar: new ControlBar({ className: 'ol-ctrlbar ol-left ol-top' }),
      // Default controls
      zoom: new Zoom,
      scaleLine: new CanvasScaleLine({ canvas: true }),
      attribution: new CanvasAttribution({ canvas: true }),
      mousePosition: new MousePosition({ className: 'ol-control ol-mouse-position', undefinedHTML: ' ' }),
      title: new CanvasTitle({ visible: false }),
      // Layer switcher
      layerSwitcher: getLayerSwitcher(),
      // Profil control
      profil: new Profil({ map: this.getMap(), select: this.getSelect() }),
      // Print dialog
      printDlg: new PrintDialog({ 
        lang: 'fr',
        title: _T('printLabel'),
        saveAs: saveAs,
        jsPDF: jsPDF
      }),
      // Legend
      legend: new LegendCtrl({
        title: _T('legend'),
        legend: new Legend({ 
          title: _T('legend'),
          size: [28,20],
          margin: 6,
          style: getStyleFn()
        })
      }),
      // Search
      searchBar: new SearchControl({
        apiKey: options.key,
        title: _T('searchLabel'),
        zoomOnSelect: 14
      }),
      // Permalink
      permalink: new Permalink({ 
        urlReplace: false,
        visible: true,
        geohash: true,
        onclick: this.dialogInfo.bind(this)
      }),
      // Locate / GPS
      locate: new LocateCtrl({ minZoom: 16 }),
      // Default map dialog
      dialog: new Dialog({ 
        className: 'mapInfo',
        closeBox: true,
        target: document.body
      }),
      // Notification 
      notification: notification
    };
    // Add controls to the map
    this.map.removeControl(this._controls.zoom);
    for (let c in this._controls) {
      this.map.addControl(this._controls[c]);
    }
    const selectInteraction = this._interactions.select;
    // Hover and select
    selectInteraction.on('change:active', () => {
      this._interactions.hover.setActive(this._interactions.select.getActive());
    })
    // Set control inside controlbar
    this._controls.ctrlbar.addControl(this._controls.zoom);
    this._controls.zoom.set('bar', true);
    this._controls.ctrlbar.addControl(this._controls.profil);
    this._controls.profil.set('bar', true);
    this._controls.ctrlbar.addControl(this._controls.printDlg);
    this._controls.printDlg.set('bar', true);
    // Prevent selection on print
    this._controls.printDlg.on(['show','hide'], function(e) {
      this.getSelect().getFeatures().clear();
      this.popup.hide();
      this.getSelect().setActive(e.type==='hide');
    }.bind(this))
    this._controls.ctrlbar.addControl(this._controls.locate);
    this._controls.locate.set('bar', true);
    this.showControl('toolbar', false);
    // Popup
    this.popup = new Popup({ closeBox: true, minibar: true });
    this.map.addOverlay(this.popup);
    this.popup.on('show', () => this.popup.content.scrollTop = 0);
    // Hover
    this.popover = new Popup({
      className: 'tooltips popuphover',
      positioning: 'center-left',
      stopEvent: false
    });
    this.map.addOverlay(this.popover);
    // Tooltip
    this.tooltip = new Tooltip()
    this.map.addOverlay(this.tooltip);
    // Symbol lib
    this._symbolLib = new Collection();
    // Load carte
    if (options.url) this.read(options.url);
    else if (options.id) this.load(options.id);
  }
}

/** Get the ol map
 * @returns {Map}
 */
Carte.prototype.getMap = function() {
  return this.map;
};

/** Get select interaction
 * @returns {Select}
 */
Carte.prototype.getSelect = function() {
 return this._interactions.select;
};

/** Get interaction
 * @param {string} name
 * @returns {ol.interaction.Interaction}
 */
Carte.prototype.getInteraction = function(name) {
 return this._interactions[name];
};

/** Get select interaction
 * @param {Object} options
 *  @param {string} options.type selection type default|zoom|overlay
 *  @param {boolean} options.points show points on lines
 */
Carte.prototype.setSelectStyle = function(options) {
  for (let i in options) this._styleOptions[i] = options[i];
};
 
/** Show map on ready */
Carte.prototype.setReady = function() {
  this.getMap().getViewport().classList.add('ol-ready');
};

/** Get a dialog
 */
Carte.prototype.getDialog = function() {
  return this.getControl('dialog');
};

/** Show carte info dialog 
 */
Carte.prototype.dialogInfo = function() {
  const content = ol_ext_element.create('DIV', { className: 'carte-info-dialog' });
  if (!this._story) {
    ol_ext_element.create('H1', {
      html: this.map.get('title'),
      parent: content
    });
  }
  ol_ext_element.create('DIV', {
    className: 'description',
    html: this._story ? md2html.element(this._story.get('description')) : this.map.get('description'),
    parent: content
  });
  ol_ext_element.create('UL', {
    html: this.getControl('attribution').element.querySelector('ul').innerHTML,
    parent: content
  })
  const plink = ol_ext_element.create('DIV', {
    className: 'permalink',
    parent: content
  });
  // QRCode
  ol_ext_element.create('IMG', {
    className: 'qrcode',
    src: QRCode.generatePNG(this.getControl('permalink').getLink(), {ecclevel : 'L', margin: 0 }),
    parent: plink
  })
  // plink
  ol_ext_element.create('P', {
    html: _T('permalink_open'),
    parent: plink
  });
  const copyInfo = ol_ext_element.create('SPAN', {
    html: _T('copy_info'),
    className: 'copy-info',
    parent: plink
  })
  const link = ol_ext_element.create('DIV', {
    click: () => {
      try {
        navigator.clipboard.writeText(this.getControl('permalink').getLink());
        copyInfo.className = 'copy-info visible';
        setTimeout(() => { copyInfo.className = 'copy-info'; }, 800);
      } catch(e) {/* ok */}
    },
    target: '_blank',
    parent: plink
  });
  link.innerText = this.getControl('permalink').getLink();
  // CGU
  const cgu = ol_ext_element.create('DIV', {
    className: 'cgu',
    html: _T('macarte_link').replace('{SERVER}', mcOptions.server).replace('{APPNAME}', mcOptions.server.replace(/http.?:|\//g, '')) + '<br/>'
      + _T('cgu_link').replace('{URL}', serviceURL.cgu) + '<br/>',
    parent: content
  });
  const user = api.getMe() || {};
  setContact({
    href: serviceURL.signal,
    service: 'viewer',
    title: _T('report_link'),
    mapID: this.get('id'),
    user: user.username,
    userID: user.id,
    email: user.email
  }, cgu)
  this.getDialog().show({
    content: content,
    buttons: { ok: 'ok' }
  });
};

/** Get map control
 * @param {string} name
 * @return {Control}
 */
Carte.prototype.getControl = function(name) {
  return this._controls[name];
};

/** Get Tool bar
 * @return {Control}
 */
Carte.prototype.getToolbar = function() {
  return this.getControl('toolbar');
};

/** Map has control
 * @param {string} name control id
 * @returns {boolean} 
 */
Carte.prototype.hasControl = function(name) {
  const c = (typeof(name) === 'string') ? this.getControl(name) : name;
  if (c) {
    if (c.get('bar')) return c.element.style.display === '';
    else return !!c.getMap();
  }
  return false;
};

/** Show/hide a control
 * @param {string} name control id
 * @param {boolean} [show=true]
 */
Carte.prototype.showControl = function(name, show) {
  const c = (typeof(name) === 'string') ? this.getControl(name) : name;
  if (c) {
    if (c.setActive) c.setActive(false);
    if (show !== false) {
      if (c.get('bar')) c.element.style.display = '';
      else {
        try { this.map.addControl(c); } catch(e) { /* ok */ }
      }
    } else {
      if (c.get('bar')) {
        c.element.style.display = 'none';
      } else {
        try { this.map.removeControl(c); } catch(e) { /* ok */ }
      }
    }
    // Handle mousePosition parameters
    if (name === 'mousePosition' && show) {
      if (show === true) show = { proj:'EPSG:4326', unit: 'dms' };
      if (show.proj) c.setProjection(show.proj);
      if (show.unit) {
        c.setCoordinateFormat((coord) => {
          if (/4326/.test(c.getProjection().getCode())) {
            if (/dms|ds/.test(c.get('unit'))) return '&nbsp;' + toStringHDMS(coord).replace(/ /g,'').replace('W','O').replace('N','N - ').replace('S','S - ') + '&nbsp;';
            return coordFormat(coord, '&nbsp;lon: {x}, lat: {y}&nbsp;', 6);
          }
          return coordFormat(coord, '&nbsp;{x}, {y}&nbsp;', 2);
        })
      }
    }
  } else if (name === 'rotation') {
    // Enable / disable rotation
    this.getMap().getInteractions().forEach(i => {
      if (i instanceof DragRotate ||i instanceof PinchRotate) {
        i.setActive(show);
      }
    })
  }
  // Send event
  this.changed();
};

/** Read the carte
 * @param {string|*} options carte url or carte options object
 * @param {AtlasDef} [atlas={}]
 */
Carte.prototype.read = function(options, atlas) {
  if (typeof(options) === 'string') {
    Ajax.get({
      url: options,
      success: (resp) => this.read(resp, atlas),
      error: (e) => {
        this.dispatchEvent(e);
      }
    });
    return;
  }

  // Start reading
  this.dispatchEvent({ type: 'read:start' });

  // set atlas definition
  this.set('atlas', atlas || {});

  // Read carte
  const format = new CarteFormat;
  format.read(this, options);
  // The title
  this._controls.title.setTitle(this.map.get('title'));

  // Ready
  this.setReady();
  this.dispatchEvent({
    type: 'read'
  });
};

/** Load carte from server
 * @param {AtlasDef|string} c Carte definition or the carte id
 */
Carte.prototype.load = function(c) {
  this.dispatchEvent({ type: 'loading' });

  const id = (typeof(c) === 'string') ? c : c.view_id;

  api.getMapFile(id, (data) => {
    if (!data.error) {
      this.set('id', id);
      this.read(data, (typeof(c) === 'string') ? null : c);
    } else {
      data.type = 'error';
      this.dispatchEvent(data);
    }
  })
};

/** Set parent Storymap
 * @param {Story} parent
 */
Carte.prototype.setParent = function(parent) {
  this._story = parent;
};

/** Display a notification on the map
 * @param {string|node|undefined} what the notification to show, default get the last one
 * @param {number} [duration=3000] duration in ms, if -1 never hide
 */
Carte.prototype.notification = function(what, duration) {
  this.getControl('notification').show(what, duration);
};

/** Show a popup
 * @param {Feature} feature
 * @param {ol.coordinate} coord
 */
Carte.prototype.popupFeature = function(feature, coord) {
  if (!feature) {
    this.popup.hide();
  } else {
    // Set current world (when outside)
    if (coord) {
      const projExtent = this.map.getView().getProjection().getExtent();
      if (coord[0] > projExtent[2]) {
        const c = this.map.getView().getCenter();
        c[0] = c[0] - (projExtent[2] - projExtent[0]);
        this.map.getView().setCenter(c);
        this.map.renderSync();
      } else if (coord[0] < projExtent[1]) {
        const c = this.map.getView().getCenter();
        c[0] = c[0] + (projExtent[2] - projExtent[0]);
        this.map.getView().setCenter(c);
        this.map.renderSync();
      }
    }
    // Show Popup
    feature.showPopup(this.popup, coord);
  }
};

/** Set current selection
 * @param {Feature} feature
 * @param {string} [select] name: select, select1 or select2
 */
Carte.prototype.setSelection = function (feature, select) {
  const sel = this.getInteraction(select || 'select');
  sel.getFeatures().clear();
  if (feature) sel.getFeatures().push(feature);
  sel.dispatchEvent({
    type: 'select',
    selected: feature ? [feature] : [],
    unselected: []
  })
};

/** Zoom map to features extend
 * @param {Array<ol.Feature>} features features you want to zoom to
 */
Carte.prototype.zoomToClusterExtent = function (features) {
  const view = this.map.getView();
  // Current value
  const zoom = view.getZoom();
  const center = view.getCenter();
  // Zoom to extent
  let extent = createEmptyExtent();
  features.forEach(f => {
    extendExtent (extent, f.getGeometry().getExtent());
  });
  // Buffer 15px
  extent = buffer(extent, 15*view.getResolution());
  // Fit
  view.fit(extent, { size: this.map.getSize() });
  // Prevent infinity zoom 
  const maxZoom = Math.min(18, features[0].getLayer().get('maxZoomCluster'));
  if (view.getZoom() > maxZoom) {
    if (maxZoom > 18) {
      view.setZoom(18);
    } else {
      view.setZoom(zoom);
      view.setCenter(center);
      view.animate({ 
        center: getCenter(extent),
        zoom: maxZoom + .1,
        duration: 400
      });
    }
  }
};

/** Get the map viewer url
 * @param {Object} carte
 *  @param {boolean} [carte.showTitle=true]
 *  @param {boolean} [carte.noZoom=false]
 *  @param {Array<number>} [carte.position]
 * @return {string} viewer url
 */
Carte.prototype.getViewerUrl = function(options) {
  if (!this.get('id')) return false;
  options = Object.assign({}, options || {});
  options.view_id = this.get('id');
  if (this.get('atlas')) {
    options.title = this.get('atlas').title || 'carte';
  } else {
    options.title = this.get('title') || 'carte';
  }
  options.type = 'macarte';
  return getViewerURL(options);
};

/** Get the list of symbol lib
 * @param {number|string} [what] the index or the name of the style, if non return the whole list
 * @return {Collection<symbolLib>|symbolLib} return null if not found
 */
Carte.prototype.getSymbolLib = function(what) {
  if (!what) return this._symbolLib;
  if (typeof(what)==='number') return this._symbolLib.item(what);
  for (let i=0; i<this._symbolLib.getLength(); i++) {
    if (this._symbolLib.item(i).name === what) return this._symbolLib.item(i);
  }
  return null;
}

/** Add a feature style to the symbol lib
 * @param {options}
 *  @param {string} name symbol name
 *  @param {Feature} [feature] feature the feature to get symbol, if none give a style / type
 *  @param {ignStyle} [style] style to apply (if no feature)
 *  @param {string} [type] geometry type Point|LineString|Polygon
 * @returns {SymbolLib} the symbol or false
 */
Carte.prototype.addSymbolLib = function(options) {
  const symbol = new SymbolLib(options);
  this._symbolLib.push(symbol);
  return symbol;
}

/** Save a storymap
 * @returns {Object}
 */
Carte.prototype.write = function() {
  const format = new CarteFormat;
  return format.write(this);
};

/** Authenticate carte when layers are private / Espace co
 * @param {function} [cback] a callback function when authenticated
 * @param {boolean} [errro] true if an error occured (internal)
 * @fires authenticate
 */
Carte.prototype.authenticate = function(cback, error) {
  if (getAuth()) {
    this.getMap().getLayers().forEach(l => {
      if (l.get('type') === 'ECo') l.getSource().setLoader();
    })
    loginDlg.close()
    this.dispatchEvent('authenticate')
    if (cback) cback();
  } else {
    loginDlg.show({
      title: 'Authentification nécessaire',
      className: 'eco-login' + (error ? ' error-login' : ''),
      content: loginPage,
      buttons: { submit: 'ok', cancel: 'annuler'},
      onButton: (b, inputs) => {
        if (b === 'submit') {
          loginDlg.show({
            className: 'wait',
            closeBox: false,
            content: 'chargement...'
          });
          guichetAPI.login(inputs.login.value, inputs.pwd.value, resp => {
            this.authenticate(cback, resp.error)
          })
        }
      }
    })
    // Fill user name
    const user = localStorage['MC@user']
    if (user) {
      loginDlg.getContentElement().querySelector('.login').value = user;
      setTimeout(() => {
        loginDlg.getContentElement().querySelector('.pwd').focus()
      })
    }
  }
}

export default Carte
