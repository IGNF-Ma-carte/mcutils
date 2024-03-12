import config from '../config/config'

let apiLogin, apiPwd;

const apiPath = config.guichetURL + 'gcms/api/'

function get(root, cback) {
  cback = cback || console.log;

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
        break;
      }
    }
    e.error = true
    cback(e)
  })
}

class GuichetAPI {
  /** Constructor 
   */
  constructor() {
  }
  
  login(login, pwd, cback) {
    apiLogin = login;
    apiPwd = pwd;
    get('users/me', cback)
  }

  getMe(cback) {
    get('users/me', cback)
  }

  logout() {
    apiPwd = null;
  }

  isConnected() {
    return !!apiPwd
  }
  
  getCommunity(comId, cback) {
    get('communities/' + comId, cback)
  }

  getLayers(comId, cback) {
    get('communities/' + comId + '/layers', cback)
  }

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

  getLayer(comId, layerId, cback) {
    get('communities/' + comId + '/layers/' + layerId, cback)
  }

  getGeoservice(id, cback) {
    get('geoservices/' + id, g => {
      if (g.style) {
        cback(g)
      } else {
        // Try to get the style...
        const url = g.url.split('?')[0] + '?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities'
        fetch(url).then(resp => {
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
      }
    })
  }

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

const guichetAPI = new GuichetAPI()

export { getAuth }
export default guichetAPI;