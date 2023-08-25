import VectorStyle from "./VectorStyle";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";

/** Espace collaboratif report layer
 */
class ECReport extends VectorStyle {
  constructor(options) {
    super({
      title: options.title || 'Signalements',
      communities: options.communities,
      status: options.status,
      date: options.date,
      maxFeatures: options.maxFeatures || 1000,
      source: new VectorSource()
    });
    // this.selectable(false);
    this.set('type', 'report');
  }

  /** */
  getUrl(page, since) {
    const options = this.getProperties();
    let url = 'https://espacecollaboratif.ign.fr/gcms/api/reports?limit=100&sort=updating_date:DESC'
    // Read data
    if (options.communities) url += '&communities=' + options.communities;
    options.status.forEach(s => {
      url += '&status[]=' + s
    })
    if (page) {
      url += '&page=' + page
    }
    if (since) {
      url += '&updating_date=' + since
    }
    return url;
  }

  /** Reload the reports
   * @param {function} callback a function that takes a 'reading' event with nb feature loaded and a boolean 'finish'
   */
  reload(callback) {
    this.getSource().clear();
    this.set('date', (new Date()).toISOString().split('T').shift())
    read(this, callback);
  }

  /** Update the reports
   * @param {function} callback a function that takes a 'reading' event with nb feature loaded and a boolean 'finish'
   */
  update(callback) {
    update(this, callback)
  }
}

/* Get feature from report element */
function getFeature(r) {
  const pt = r.geometry.replace(/POINT\(|\)/g, '').split(' ').map(e => Number(e));
  const f = new Feature(new Point(pt).transform('EPSG:4326', 'EPSG:3857'));
  // Info
  ['id', 'comment', 'author', 'community', 'status', 'validator', 'opening_date', 'updating_date', 'closing_date', 'input_device'].forEach(a => {
    f.set(a, r[a])
  })
  // Image attachement
  r.attachments.forEach(a => {
    if (/jpg|gif|png/i.test(a.filename)) f.set('img', a.uri)
  })
  // Admin
  if (r.commune) {
    f.set('commune', r.commune.title)
    f.set('insee', r.commune.name)
  }
  if (r.departement) {
    f.set('departement', r.departement.title)
    f.set('id_dep', r.departement.name)
  }
  // Themes / attributes
  r.attributes.forEach(th => {
    f.set('theme', th.theme);
    const attr = Array.isArray(th.attributes) ? th.attributes : [th.attributes];
    attr.forEach(a => {
      for (let i in a) f.set(i, a[i])
    })
  })
  return f;
}

/** Read a page */
function read(layer, callback, page) {
  const source = layer.getSource();
  const options = layer.getProperties();
  page = page || 1;
  const url = layer.getUrl(page);
  // Fetch data
  fetch(url)
  .then(x => x.json())
  .then(resp => {
    const nb = source.getFeatures().length;
    // Add current      
    const features = []
    resp.forEach(r => {
      if (options.maxFeatures <= features.length + nb) return;
      const f = getFeature(r);
      features.push(f);
    })
    // Next
    const e = {
      type: 'reading',
      nb: source.getFeatures().length + features.length,
      max: options.maxFeatures,
      finish: !(resp.length && options.maxFeatures > page*100)
    }
    if (callback) {
      const continu = callback(e);
      if (continu === false) e.finish = true;
    }
    // Read next page
    if (!e.finish) {
      read(layer, callback, page+1)
      source.dispatchEvent(e);
    }
    source.addFeatures(features);
  })
}

/** Update reports layer */
function update(layer, callback, page, features) {
  // Features loaded
  features = features || [];
  page = page || 1;
  const url = layer.getUrl(page, layer.get('date'));
  // Fetch data
  fetch(url)
    .then(x => x.json())
    .then(resp => {
      // More to read ?
      if (resp.length) {
        resp.forEach(r => {
          const f = getFeature(r);
          features.unshift(f);
        })
        // Read next
        update(layer, callback, ++page, features)
        //
        if (callback) {
          const e = {
            type: 'updating', 
            nb: features.length,
            finish: false 
          };
          callback(e);
        }
      } else {
        const options = layer.getProperties();
        const source = layer.getSource();
        const current = {};
        source.getFeatures().forEach(f => {
          current[f.get('id')] = f;
        })
        // Update features
        features.forEach(f => {
          const f0 = current[f.get('id')];
          if (f0) {
            source.removeFeature(f0);
          }
          // Add it?
          if (!options.status.length || options.status.indexOf(f.get('status')) > -1) {
            source.addFeature(f);
            current[f.get('id')] = f;
          }
          layer.set('date', (new Date()).toISOString().split('T').shift())
        })
        if (callback) {
          const e = { type: 'updating', finish: true };
          source.dispatchEvent(e);
          callback(e);
        }
      }
    })
}

export default ECReport