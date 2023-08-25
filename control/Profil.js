import ol_control_Toggle from 'ol-ext/control/Toggle'
import ProfilControl from 'ol-ext/control/Profile'
import ol_ext_element from 'ol-ext/util/element'
import { ol_geom_GPAltiCode } from 'ol-ext/geom/GPAltiCode'

import Style from 'ol/style/Style'
import RegularShape from 'ol/style/RegularShape'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'

import './Profil.css'

ProfilControl.prototype.info = {
  "zmin": "Zmin ",
  "zmax": "Zmax ",
  "ytitle": "Altitude (m) ",
  "xtitle": "Distance (km) ",
  "time": "Temps ",
  "altitude": "Altitude ",
  "distance": "Distance ",
  "altitudeUnits": "m",
  "distanceUnitsM": "m",
  "distanceUnitsKM": "km",
};

/** Profil control associated with a map and a selection
 * @memberof mcutils.control
 * @constructor
 * @extends {ol_control_Toggle}
 * @param {Object} options
 *  @param {ol/Map} options.map
 *  @param {ol/interaction/Select} options.select
 */
class Profil extends ol_control_Toggle {
  constructor(options) {
    // Toggle button
    super({
      html: '<i class="fg-profile"></i>',
      className: 'profilBt',
      onToggle: (b) => {
        if (b) this.showSelect();
      }
    })
    // Handle selection
    this.select = options.select
    this.select.on('select', () => {
      this.showSelect()
    })
    // Update
    this.content = ol_ext_element.create('DIV', {
      className: 'profil',
      parent: this.element
    })
    // Info
    ol_ext_element.create('DIV', {
      className: 'profil-info',
      html: 'Sélectionnez une ligne sur la carte...',
      parent: this.content
    })
    ol_ext_element.create('DIV', {
      className: 'profil-error',
      html: 'Impossible de calculer l\'altitude...',
      parent: this.content
    })
    // Add profil
    this.profil = new ProfilControl({
      target: this.content,
      // zoomable: true,
      style: new Style({
        fill: new Fill({ color: '#ccc' })
      }),
      width:400, 
      height:200
    });
    options.map.addControl(this.profil)
    // Add overlay point
    const overlay = new VectorLayer({
      source: new VectorSource,
      visible: false,
      map: options.map,
      style: new Style({
        image: new RegularShape({
          radius: 10,
          radius2: 5,
          points: 5,
          stroke: new Stroke({ color: [255,255,255,.8], width: 1.5 }),
          fill: new Fill({ color: [255,0,0,.5] })
        })
      })
    })
    const pt = new Feature(new Point([0,0]));
    overlay.getSource().addFeature(pt);
    this.profil.on('over', (e) => {
      pt.getGeometry().setCoordinates(e.coord);
      overlay.setVisible(true)
    })
    this.profil.on(['out', 'change:active'], () => {
      overlay.setVisible(false)
    })
    
  }
}

/** Show selection / calculate altitude if none
 */
Profil.prototype.showSelect = function() {
  const maxPt = 600;
  if (!this.getActive()) return;
  const feature = this.select.getFeatures().item(0)
  if (feature && this.feature === feature) {
    this.content.className = 'profil';
    return;
  }
  let geom;
  if (feature) {
    geom = feature.getGeometry()
    if (geom.getLineString) geom = geom.getLineString();
  }
  if (geom && geom.getType() === 'LineString') {
    if (/Z/.test(geom.getLayout())) {
      this.content.className = 'profil'
      this.profil.setGeometry(geom, {
        amplitude: 500,
        zmin: 0
      });
    } else {
      let coords = geom.getCoordinates()
      if (coords.length > maxPt) {
        const step = maxPt / coords.length;
        let pos = 0;
        let c0 = coords;
        coords = [];
        c0.forEach((c,i) => {
          if (pos+1 < i*step) {
            coords.push(c);
            pos++;
          }
        });
      }
      const geoms = []
      if (coords.length <= 200) {
        geoms.push(geom);
      } else {
        for (let i=0; i < coords.length/200; i++) {
          const pts = coords.slice(i*200, (i+1)*200 + 1);
          if (pts.length > 1) {
            geoms.push(new LineString(pts))
          }
        }
      }
      this.content.className = 'profil loading'
      this._alticode(geoms, [])
    }
    this.feature = feature
  } else {
    this.content.className = 'profil hidden'
  }
}

/** Splitted Linestring
 * @private
 */
Profil.prototype._alticode = function(geoms, result) {
  const geom = geoms.shift();
  ol_geom_GPAltiCode(geom, {
    sampling: 100,       // at least 30
    samplingDist: 500,   // or one point per 500 unit length
    success: g => {
      result.push(g.getCoordinates());
      if (geoms.length) {
        this._alticode(geoms, result);
      } else {
        if (result.length > 1) {
          // g = Array.prototype.concat.apply([], result)
          g = new LineString(Array.prototype.concat.apply([], result))
        }
        this.content.className = 'profil';
        this.profil.setGeometry(g, {
          amplitude: 500,
          zmin: 0
        });
      }
    },
    error: () => {
      this.content.className = 'profil error';
    }
  });
}
/**/

export default Profil