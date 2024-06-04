import config from '../config/config'

let apiLogin, apiPwd;

const apiPath = (config.guichetURL+'/').replace(/\/\/$/, '/') + 'gcms/api/'

/* Fetch response as get */
function get(root, cback) {
  cback = cback || console.log;
  options = options || {};
  // limit
  if (options.limit) root += '?limit=' + options.limit;
  // fetch
  fetch(apiPath + root, {
    method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa(apiLogin + ':' + apiPwd) }
  })
  .then(response => {
    if (response.ok) {
      return response.json()
    } else {
      return Promise.reject(response)
    }
  })
  .then(json => {
    // console.log(root, json)
    cback(json)
  })
  .catch(e => {
    switch (e.status) {
      case 401: {
        apiPwd = null;
        break;
      }
      default: {
        apiPwd = null;
        break;
      }
    }
    e.error = true
    cback(e)
  })
}

/** Guichet API to login and get 
 */
class GuichetAPI {
  /** Constructor 
   */
  constructor() {}
  
  /** Login 
   * @param {string} login
   * @param {string} pwd
   * @param {function} callback
   */
  login(login, pwd, cback) {
    apiLogin = login;
    apiPwd = pwd;
    get('users/me', cback)
  }

  /** Get user informations
   * @param {function} callback
   */
  getMe(cback) {
    get('users/me', cback)
  }

  /** Remove credentials
   */
  logout() {
    apiPwd = null;
  }

  /** Has credentials
   */
  isConnected() {
    return !!apiPwd
  }
  
  /** Get user comuunity info
   * @param {string} comId community ID
   * @param {function} callback
   */
  getCommunity(comId, cback) {
    get('communities/' + comId, cback)
  }

  /** Get comuunity layers list
   * @param {string} comId community ID
   * @param {function} callback
   */
  getLayers(comId, cback) {
    get('communities/' + comId + '/layers', cback, { limit: 100 })
  }

  /** Get comuunity layers (full info)
   * @param {string} comId community ID
   * @param {function} callback
   */
  getFullLayers(comId, cback) {
    this.getLayers(comId, layers => {
      // No layers
      if (!layers.length) {
        cback(layers)
        return;
      }
      // Load options
      let loading = 0;
      layers.forEach(l => {
        switch (l.type) {
          case 'feature-type': {
            loading++;
            this.getTable(l.database, l.table, t => {
              l.table = t;
              loading--;
              if (!loading) cback(layers)
            })
            break;
          }
          case 'geoservice': {
            loading++;
            this.getGeoservice(l.geoservice.id, g => {
              l.geoservice = g
              loading--;
              if (!loading) cback(layers)
            })
            break;
          }
        }
      })
    })
  }

  /** Get comuunity layer info
   * @param {string} comId community ID
   * @param {string} layerId layer ID
   * @param {function} callback
   */
  getLayer(comId, layerId, cback) {
    get('communities/' + comId + '/layers/' + layerId, cback)
  }

  /** Get geoservice info
   * @param {string} id geoservice ID
   * @param {function} callback
   */
  getGeoservice(id, cback) {
    get('geoservices/' + id, g => {
      if (g.style) {
        cback(g)
      } else {
        // Try to get the style...
        const url = g.url.split('?')[0] + '?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities'
        try {
          fetch(url).catch(e => {
            console.log('ERROR', e)
          }).then(resp => {
            if (!resp) return '';
            return resp.text()
          }).then(str => {
            return new window.DOMParser().parseFromString(str, "text/xml")
          })
          .then(data => {
            const layers = data.querySelectorAll('Contents Layer');
            const layer = Array.prototype.find.call(layers, l => l.querySelector('Identifier').textContent === g.layers);
            if (layer) {
              let style = layer.querySelector('Style')
              if (style) {
                style = style.querySelector('Identifier')
                g.style = style ? style.textContent : null;
              }
            }
            cback(g)
          });
        } catch(error) {
          console.log('ERROR', g, error)
          cback(null)
        }
      }
    })
  }

  /** Get table info
   * @param {string} base
   * @param {string} table
   * @param {function} callback
   */
  getTable(base, table, cback) {
    get('databases/' + base + '/tables/' + table, cback)
  }
  
}

/** Get current authentification
 * @returns {string}
 */
function getAuth() {
  if (!apiPwd) return false;
  return btoa(apiLogin + ':' + apiPwd)
}

/** Singleton */
const guichetAPI = new GuichetAPI()

export { getAuth }
export default guichetAPI;