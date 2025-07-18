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
// import Select from './ol/Select'
import Select from './ol/SelectMultiple'
import Synchronize from 'ol-ext/interaction/Synchronize'
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom'
import { click as clickCondition, platformModifierKeyOnly } from 'ol/events/condition'
import { buffer, createEmpty as createEmptyExtent, extend as extendExtent, getCenter } from 'ol/extent';
import MVT from './layer/MVT'

import Ajax from 'ol-ext/util/Ajax'
import ControlBar from 'ol-ext/control/Bar'
import CanvasAttribution from 'ol-ext/control/CanvasAttribution'
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine'
import SearchControl from 'ol-ext/control/SearchGeoportail'
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
import MapZone from 'ol-ext/control/MapZone'
import Geoportail from 'ol-ext/layer/Geoportail'
import notification from './dialog/notification'
import getLayerSwitcher from './control/layerSwitcher'

import ol_Overlay_Popup from 'ol-ext/overlay/Popup.js'
import ol_Overlay_PopupMultiple from './ol/PopupMultiple'
import Tooltip from 'ol-ext/overlay/Tooltip'
import Hover from 'ol-ext/interaction/Hover'

import CarteFormat from './format/Carte'
import LegendCtrl from 'ol-ext/control/Legend'
import Legend from 'ol-ext/legend/Legend'
import Button from 'ol-ext/control/Button'

import { saveAs } from 'file-saver';
import { jsPDF } from "jspdf";

import { getSelectStyleFn, getStyleFn, getShownFeatureStyleFn } from './style/ignStyleFn'

import './layer/Geoportail'
import { toStringHDMS } from 'ol/coordinate'

import loadFont from './font/loadFonts'
import api from './api/api'
import serviceURL, { getUserURL, getTeamURL } from './api/serviceURL'
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
import { LineString } from 'ol/geom'
import RenderFeature from 'ol/render/Feature'

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
      const features = this.getMap().getFeaturesAtPixel(e.pixel, { hitTolerance: 3 })
      // Select MVT
      if (features[0] instanceof RenderFeature) {
        const f0 = features[0];
        if (f0.getLayer().selectable()) {
          const attr = f0.getProperties();
          attr.geometry = new LineString([e.coordinate, e.coordinate])
          const f = new Feature(attr)
          f.setLayer(f0.getLayer())

          this.dispatchEvent({
            type: 'layer:featureInfo',
            coordinate: e.coordinate,
            layer: f.getLayer(),
            feature: f
          })
          return;
        }
      }
      // Layers that have features
      features.forEach(f => {
        if (f.getLayer()) vectors.push(f.getLayer())
      })
      // Get layer at pixel
      const layers = this.getMap().getLayers().getArray()
      for (let i = layers.length - 1; i>=0; i--) {
        const l = layers[i];
        if (l instanceof VectorStyle || l instanceof MVT) {
          if (vectors.indexOf(l) >= 0) return;
        }
        // Image layer
        if (l.getData) {
          const pix = l.getData(e.pixel);
          // Get feature info ?
          if (l.getSource() && l.getSource().getFeatureInfo && pix && pix[3]) {
            const content = l.getPopupContent();
            // No content
            if (!content) return;
            // Empty content
            if (!content.titre && !content.desc && !content.img && !content.coord) return;
            // Info_format
            const param = l.get('wmsparam') || {};
            // Get feature info
            l.getSource().getFeatureInfo(
              e.coordinate, 
              this.getMap().getView().getResolution(), {
                INFO_FORMAT: (param.layer ? param.layer.info_format : null) || 'application/json',
                callback: resp => {
                  const features = JSON.parse(resp).features;
                  if (features.length) {
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
                  } else {
                    this.dispatchEvent({
                      type: 'layer:featureInfo',
                      coordinate: e.coordinate,
                    })
                  }
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
        multi:true,
        hitTolerance: 3,
        condition: clickCondition,
        style: getSelectStyleFn(this._styleOptions),
        shownStyle: getShownFeatureStyleFn(this._styleOptions),
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

    // Reset selection arrays on click
    this.getMap().on('click', () => {
      this._interactions.select.clearCurrentSelectionArrays();
    })

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
      legendBt: new Button({
        title: 'Légende',
        className: 'legendBt',
        handleClick: () => {
          this._controls.legend.toggle()
        }
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
      // DOM/TOM
      mapzone: new MapZone({
        layer: new Geoportail({ layer: 'ORTHOIMAGERY.ORTHOPHOTOS' }),
        zones: []
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
    // MapZone
    this.setMapZone();
    this._controls.mapzone.on('change:collapse', (e) => {
      if (!e.collapsed) this._controls.legend.collapse(true)
    })
    this._controls.legend.on('change:collapse', (e) => {
      if (!e.collapsed) this._controls.mapzone.setCollapsed(true)
    })
    // Popup
    this.popup = new ol_Overlay_PopupMultiple({ closeBox: true, minibar: true, select: this.getSelect()});
    // this.popup = new Popup({ closeBox: true, minibar: true });
    this.map.addOverlay(this.popup);
    this.popup.on('show', () => this.popup.content.scrollTop = 0);
    // Hover
    this.popover = new ol_Overlay_Popup({
      className: 'tooltips popuphover',
      positioning: 'center-left',
      stopEvent: false,
      select: this.getSelect(),
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

/** Set tje mapzone control
 * @param {string} [zone] DOM|TOM|DOMTOM default remove the control
 * @param {boolean} [collapsed]
 */
Carte.prototype.setMapZone = function(zone, collapsed) {
  // clear
  const nb = this.getControl('mapzone').getMaps().length;
  for (let i=0; i<nb; i++) this.getControl('mapzone').removeZone(0);
  const metro = MapZone.zones.DOMTOM[0];

  // disable
  if (!zone) this.getControl('mapzone').element.classList.add('hidden')
  else this.getControl('mapzone').element.classList.remove('hidden');

  // Add zone
  switch(zone) {
    case 'DOM': {
      this.getControl('mapzone').addZone(metro)
      MapZone.zones.DOM.forEach(z => {
        this.getControl('mapzone').addZone(z)
      })
      break;
    }
    case 'TOM': {
      this.getControl('mapzone').addZone(metro)
      MapZone.zones.TOM.forEach(z => {
        this.getControl('mapzone').addZone(z)
      })
      break;
    }
    case 'DOMTOM': {
      MapZone.zones.DOMTOM.forEach(z => {
        this.getControl('mapzone').addZone(z)
      })
      break;
    }
    default: {
      if (Array.isArray(zone)) {
        zone.forEach(z => this.getControl('mapzone').addZone(z))
      } else {
        this.getControl('mapzone').element.classList.add('hidden');
      }
      break;
    }
  }
  // Force collapsed
  if (collapsed !== undefined) {
    this.getControl('mapzone').setCollapsed(collapsed);
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
  let description = this.map.get('description') || '';
  let atlas = this.get('atlas') || {}
  if (this._story) {
    atlas = this._story.get('atlas') || {};
    description = this._story.get('description') || atlas.description || ''
  }

  ol_ext_element.create('DIV', {
    className: 'description',
    html: md2html.element(description),
    parent: content
  });
  ol_ext_element.create('UL', {
    className: 'attribution',
    html: this.getControl('attribution').element.querySelector('ul').innerHTML,
    parent: content
  })
  // Author
  const auth = ol_ext_element.create('DIV', {
    className: 'author',
    parent: content
  })
  if (atlas.organization_name || atlas.author) {
    auth.innerHTML = _T('created_by')
    if (atlas.organization_name) {
      ol_ext_element.create('A', {
        text: atlas.organization_name,
        href: getTeamURL({ 
          name: atlas.organization_name, 
          public_id: atlas.organization_id 
        }),
        target: '_blank',
        parent: auth
      })
    } else {
      ol_ext_element.create('A', {
        text: atlas.author,
        href: getUserURL({ 
          public_name: atlas.author, 
          public_id: atlas.author_id 
        }),
        target: '_blank',
        parent: auth
      })
    }
  } else {
    auth.innerHTML = _T('created_with')
  }
  // Ma carte
  ol_ext_element.create('SPAN', {
    html: _T('macarte_link').replace('{SERVER}', mcOptions.server).replace('{APPNAME}', mcOptions.server.replace(/http.?:|\//g, '')),
    parent: auth
  })
  // Permalink
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
    html: _T('cgu_link').replace('{URL}', serviceURL.cgu) + '<br/>',
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
  // Show dialog
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

/** Get carte title
 * @return {string}
 */
Carte.prototype.getTitle = function() {
  if (this.get('atlas')) {
    return this.get('atlas').title || 'macarte';
  } 
  return this.get('title') || 'macarte';
}

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
    // Legend Button
    if (name === 'legend') {
      this.getControl('legendBt').setVisible(show)
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

/** Show a popup for multiple feature
 * @param {Array<Feature>} feature
 * @param {ol.coordinate} coord
 */
Carte.prototype.popupFeatures = function(features, coord) {
  if (!features || features.length == 0) {
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
    this.showPopupFeatures(features, this.popup, coord);
  }
};

/** Get the contents of multiple features.
 * It also check different things such as the cluster type
 * or the multi select attribute of the layer.
 * @param {Array<Feature>} features Array of the features to get the content from
 * @param {boolean} getAllFeaturesContent
 * @return {{contents: Array<Element>, renderedFeatures: Array<Feature>}}
 *    An object containing:
 *    - contents: Array of HTML elements displayed in the popup
 *    - renderedFeature: Array of rendered features
 */
Carte.prototype.getFeaturesPopupContent = function(feat, getAllFeaturesContent = false) {
  if (!feat) {
    return;
  }
  let features = [];

  feat.forEach(feature => {
    const cluster = feature.get('features');
    if (cluster) {
      features.push(...cluster);
    } else {
      features.push(feature);
    }
  })

  if (features.length == 0) {
    return
  }

  let contents = []
  let renderedFeatures = []
  for (let i = 0; i < features.length; i++) {
    let f = features[i]
    // If it's a cluster, then we check if there is a style to display it
    if (f.getLayer().getMode && f.getLayer().getMode() == "cluster" && f.getLayer().get("clusterType") == 'stat') {
      const st = f.getLayer().getStyle()(f);
      // No popup is displayed for transparent items
      if (st.length == 0) {
        continue;
      }
    }
    
    const content = f.getPopupContent(true);
    if (getAllFeaturesContent || content.innerText.trim() || content.querySelector('canvas') || content.querySelector('img') || f.getLayer().get('multiSelect')) {
      contents.push(content);
      renderedFeatures.push(f);
    }
  }
  return {contents, renderedFeatures}
}

/** Show a multi popup for an array of features
 * @param {Array<Feature>} features array of features
 * @param {ol.Overlay.Popup} popup the popup to display on the map
 * @param {ol.Coordinate} coord popup position (the closest point will be used)
 * @param {ol.geom|undefined} [geom] use as geometry, default use object geom
 * @returns {Array<string>} Array of popup content
 * @private
 */
Carte.prototype.showPopupFeatures = function(features, popup, coord, geom) {
  // Get features popup content
  const result = this.getFeaturesPopupContent(features)
  const contents = result.contents;
  const renderedFeatures = result.renderedFeatures;

  // Show popup only if there is content
  if (contents.length) {

    // Set offset if at least one content is not empty
    for (let i = 0; i < contents.length; i++) {
      if (contents[i].innerText.trim() || contents[i].querySelector('canvas') || contents[i].querySelector('img')) {
        popup.setOffset([0, 0]);
        break
      }
    }

    // Update coord if needed
    if (!coord) {
      // Get position of first feature on the map
      const f = features[0]
      coord = popup.getPosition() || (geom||f.getGeometry()).getFirstCoordinate();
    }

    if (features[0].getGeometry().getType() === 'Point') {
      var offset = popup.offsetBox;
      // Statistic layer has no style
      if (features[0].getLayer && features[0].getLayer() && features[0].getLayer().getIgnStyle) {
        var style = features[0].getLayer().getIgnStyle(features[0]);
        var offsetX = /left|right/.test(popup.autoPositioning[0]) ? style.pointRadius : 0;
        popup.offsetBox = [-offsetX, (style.pointOffsetY ? -2:-1)*style.pointRadius, offsetX, style.pointOffsetY ? 0:style.pointRadius];
      }
      if (geom) popup.show(geom.getClosestPoint(coord), contents, renderedFeatures);
      else popup.show(features[0].getGeometry().getFirstCoordinate(), contents, renderedFeatures);
      popup.offsetBox = offset;
    } else {
      if (/polygon/i.test(features[0].getGeometry().getType())) {
        popup.show(coord, contents, renderedFeatures);
      } else {
        popup.show(features[0].getGeometry().getClosestPoint(coord), contents, renderedFeatures);
      }
    }
  } else {
    popup.hide()
  }
  // Load Twitter widget
  md2html.renderWidget(popup.getElement());
  
  return contents;
}

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
 * @param {boolean} [uncompressed=false]
 * @returns {Object}
 */
Carte.prototype.write = function(uncompressed) {
  const format = new CarteFormat;
  return format.write(this, uncompressed);
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
export { QRCode }
