import team from "../api/team";
import config from "../config/config";

let _apiURL = '';
let _logoutURL = '';

const MAX_FILE_SIZE = parseFloat(config.maxFileSize) || 23; // 23 Mo

const MCToken = 'MC@token';
const MCRefreshToken = 'MC@refreshToken';

/** Class to access Macarte data through the API
 * @fires login
 * @fires logout
 * @fires disconnect
 * @fires me
 */
class MacarteAPI {
  /** Constructor 
   * @param {string} apiURL
   */
  constructor(apiURL, logoutURL) {
    _apiURL = apiURL;
    _logoutURL = logoutURL;
    if (!/\/$/.test(apiURL)) _apiURL += '/';
    // Read current token
    this._token = localStorage.getItem(MCToken);
    this._refreshToken = localStorage.getItem(MCRefreshToken);
    this._remember = !!this._token;
    this._listeners = {};
    if (this._token === 'none') this.token = null;
  }
}

/** Add an event listener
 * @param {string|Array<string>} type an event type or an array of event type to listen to
 * @param {function} listener a function that takes an event
 */
MacarteAPI.prototype.on = function(type, listener) {
  if (typeof(listener) === 'function') {
    if (!Array.isArray(type)) type = [type];
    type.forEach(t => {
      if (!this._listeners[t]) this._listeners[t] = [];
      this._listeners[t].push(listener);
    });
  }
};

/** Remove an event listener
 * @param {string|Array<string>} type an event type or an array of event type to listen to
 * @param {function} listener a function that takes an event
 */
MacarteAPI.prototype.un = function(type, listener) {
  if (!Array.isArray(type)) type = [type];
  type.forEach(t => {
    if (this._listeners[t]) {
      const i = this._listeners[t].indexOf(listener);
      if (i>=0) this._listeners[t].splice(i, 1);
    }
  });
};

/** Dipatch an event 
 * @param {Object|string} event an object with a type property or an event type
 */
MacarteAPI.prototype.dispatchEvent = function (event) {
  event = event || {};
  if (typeof(event)==='string') event = { type: event };
  const listener = this._listeners[event.type];
  if (listener) {
    listener.forEach(fn => {
      fn(event);
    });
  }
};

/** Store current token
 * @param {boolean} b 
 */
MacarteAPI.prototype.rememberMe =  function(b) {
  this._remember = !!b;
  if (this._remember) {
    this.setToken(this._token, this._refreshToken);
  } else {
    localStorage.removeItem(MCToken);
    localStorage.removeItem(MCRefreshToken);
  }
};

/** Are the credentials stored?
 * @return {boolean}
 */
MacarteAPI.prototype.getRememberMe =  function() {
  return this._remember;
};

/** Set the current token
 * @param {string} token if none remove the current one
 * @param {string} [refreshToken]
 */
MacarteAPI.prototype.setToken =  function(token, refreshToken) {
  if (token) {
    this._token = token;
    if (this.getRememberMe()) {
      localStorage.setItem(MCToken, token);
    }
    if (refreshToken) {
      this._refreshToken = refreshToken;
      if (this.getRememberMe()) {
        localStorage.setItem(MCRefreshToken, refreshToken);
      }
    }
  } else {
    this._token = this._refreshToken = null;
    if (this.getRememberMe()) {
      localStorage.setItem(MCToken, 'none');
    } else {
      localStorage.removeItem(MCToken);
    }
    localStorage.removeItem(MCRefreshToken);
  }
};

/** Refresh current token
 * @param {function} callback
 */
MacarteAPI.prototype.refreshToken =  function(callback) {
  // Connected on another app
  if (!this._refreshToken) {
    this._refreshToken = localStorage.getItem(MCRefreshToken);
  }
  // not connected
  if (!this._refreshToken) {
    this.dispatchEvent({ type: 'disconnect' })
    if (callback) callback(false, {
      status: 401,
      statusText: "Unauthorized"
    });
    return;
  }
  const request = new XMLHttpRequest();
  request.open('POST', _apiURL+'token/refresh');
  request.setRequestHeader ('Content-Type', 'application/json; charset=utf-8');
  // Test load / error
  request.ontimeout = 
  request.onerror = 
  request.onload = () => {
    if (request.status === 200) {
      try {
        const resp = JSON.parse(request.responseText);
        this.setToken(resp.token);
      } catch(e) { /* ok */ }
      if (callback) callback(true);
    } else {
      if (request.status === 0) {
        this.dispatchEvent({ type: 'error' });
      } else if (request.status === 401) {
        this.dispatchEvent({ type: 'disconnect' });
        this.setToken();
      }
      if (callback) callback(false, request);
    }
  }
  request.send(JSON.stringify({
    refresh_token: this._refreshToken
  }));
};

/** Send a request (refresh token before send)
 * @param {*} method GET or POST
 * @param {*} url request url
 * @param {*} params request param
 * @param {boolean} [refresh=true] refresh token before send
 * @private
 */
MacarteAPI.prototype._send = function(method, url, params, callback, refresh) {
  // Refresh token
  if (refresh !== false) {
    this.refreshToken((b, request) => {
      if (b) {
        this._send(method, url, params, callback, false);
      } else {
        callback({ error: true, status: request.status, statusText: request.statusText, xhttp: request });
      }
    })
    return;
  }

  // Send request
  params = params || {};
  method = method.toUpperCase();
  callback = callback || function(){};

  url = new URL(url);
  let data;
  if (method === 'GET') {
    for (let o in params) {
      url.searchParams.set(o, params[o]);
    }
  } else {
    if (!(params instanceof FormData)) {
      data = JSON.stringify(params);
    } else {
      data = params;
    }
  }

  // Current request
  const request = this._request = new XMLHttpRequest();
  request.open(method, url.toString());
  // request.timeout = 
  if (!(params instanceof FormData)) request.setRequestHeader ('Content-Type', 'application/json; charset=utf-8');
  request.setRequestHeader('Authorization', 'Bearer ' + this._token);
  request.onerror = 
  request.onload = () => {
    switch (request.status) {
      case 0: {
        callback({ error: true, status: request.status, statusText: request.statusText, xhttp: request });
        break;
      }
      case 200:
      case 201:
      case 204:
      case 206: {
        let resp;
        try {
          if (request.responseText) resp = JSON.parse(request.responseText);
          else resp = '';
        } catch(e) {
          callback({ error: true, status: 418, statusText: 'Invalid json message received', xhttp: request });
          return;
        }
        callback(resp);
        break;
      }
      case 401: {
        callback({ error: true, status: request.status, statusText: request.statusText, xhttp: request });
        this.dispatchEvent({ type: 'disconnect' });
        break;
      }
      default: {
        callback({ error: true, status: request.status, statusText: request.statusText, xhttp: request });
        break;
      }
    }
  };
  request.send(data);
};

/** Login: log the user and get user info
 * Dispatch a login event
 * @param {string} user
 * @param {string} pwd
 * @param {function} callback a function that returns the user info or an error
 */
MacarteAPI.prototype.login =  function(user, pwd, callback) {
  const credentials = {
    username: user,
    password: pwd
  }
  // Save user name
  if (this.getRememberMe()) localStorage.setItem('MC@user', user);
  else localStorage.removeItem('MC@user');
  // Login
  this._send('POST', _apiURL+'login', credentials, resp => {
    if (resp.error) {
      this.setToken();
      this.dispatchEvent({ type: 'logout' });
      if (callback) callback(false, resp);
    } else {
      this.setToken(resp.token, resp.refresh_token);
      this.whoami((me) => {
        this.dispatchEvent({ type: 'login', user: me });
        if (callback) callback(me);
    }, false)
    }
  }, false);
};

/** Logout
 * @param {function} callback callback function
 */
MacarteAPI.prototype.logout =  function(callback) {
  // Session deconnection
  this._send('POST', _apiURL+'logout', {}, resp => {
  //this._send('GET', _logoutURL, {}, resp => {
    // Clear user
    this._user = {
      username: this._user.username
    };
    // Disconnected
    this.setToken();
    if (resp.logout_url) {
      window.location = resp.logoutURL;
    } else {
      this.dispatchEvent({ type: 'logout' });
      if (callback) callback(resp);
    }
  }, false);
};

/** Who is connected
 * @param {function} callback
 * @param {boolean} [refresh=true] refresh token before send
 */
MacarteAPI.prototype.whoami =  function(callback, refresh) {
  this._send('GET', _apiURL + 'me', {}, (resp) => {
    if (!resp.error) this._user = resp;
    else this._user = null;
    callback(resp);
    this.dispatchEvent({ type: 'me', user: this._user });
  }, refresh);
};

/** Update current user info
 * @param {Object} value key value info
 * @param {function} callback
 */
MacarteAPI.prototype.updateMe =  function(value, callback) {
  this._send('PATCH', _apiURL + 'me', value, resp => {
    if (!resp.error) this._user = resp;
    callback(resp);
    if (!resp.error) this.dispatchEvent({ type: 'me', user: this._user });
  });
};

/** Check connection
 */
MacarteAPI.prototype.isConnected =  function() {
  return !!this._refreshToken;
};

/** Get current user 
 */
MacarteAPI.prototype.getMe =  function() {
  if (!this._user && localStorage['MC@user']) {
    return {
      username: localStorage['MC@user']
    };
  }
  return this._user;
};

/** Delete user
 * @param {function} callback
 */
MacarteAPI.prototype.deleteMe = function (callback) {
  this._send('DELETE', _apiURL + 'me', {}, (r) => {
    callback(r)
  }, true);
};

/** Get user premium 
 * @param {string} edugeo or default
 */
MacarteAPI.prototype.getPremium =  function() {
  const me = this.getMe() || {};
  const isEdugeo = !!(me.roles || []).filter(r => /EDUGEO/.test(r)).length;
  return isEdugeo ? 'edugeo' : 'default';
}

/** Get the list of maps 
 * @param {*} options
 *  @param {string} [options.context=profile] search context atlas|profile|admin, default profile
 *  @param {string} [options.query] Query string
 *  @param {string} [options.theme]
 *  @param {string} [options.organization]
 *  @param {string} [options.premium='default'] Premium 'default' or 'edugeo')
 *  @param {string} [options.user] User public name
 *  @param {string} [options.sort='date'] 'date', 'rank' or 'views'
 *  @param {number|string} [options.limit] maximum responses returned, an integer or 'all' to get all maps, default 'all' in context profile, 25 otherwise
 *  @param {number} [options.offset]
 * @param {function} [options.callback] callback function
 */
MacarteAPI.prototype.getMaps =  function(options, callback) {
  options = options || {};
  if (!options.context) options.context = 'profile';
  if (options.context==='profile' && !options.limit) options.limit = 'all';
  if (!options.query) options.query = '';
  if (!options.organization) {
    if (options.context !== 'atlas') {
      options.organization = team.getId();
    } else {
      options.organization = '';
    }
  } 
  this._send('GET', _apiURL+'maps', options, callback, options.context !== 'atlas');
};

/** Get map information for a given id
 * @param {string} id map id
 * @param {function} success callback
 */
MacarteAPI.prototype.getMap = function(id, success) {
  this._send('GET', _apiURL + 'maps/' + id, {}, success, false);
};

/** Get map information for a given id
 * @param {string} id map id
 * @param {function} success callback
 */
MacarteAPI.prototype.getEditMap = function(id, success) {
  this._send('GET', _apiURL + 'maps/' + id + '/edit', {}, success, false);
};

/** Update map information for a given id
 * @param {string} id map id
 * @param {Object} info list of info to update
 * @param {function} success callback
 */
MacarteAPI.prototype.updateMap = function(id, info, success) {
  this._send('PATCH', _apiURL + 'maps/' + id, info, success);
};

/** Delete map and file
 * @param {string} id map id
 * @param {function} success callback
 */
MacarteAPI.prototype.deleteMap = function(id, success) {
  this._send('DELETE', _apiURL + 'maps/' + id, {}, success);
};

/** Get map file
 * @param {sting} id map id
 * @param {function} success callback
 */
MacarteAPI.prototype.getMapFile =  function(id, success) {
  this._send('GET', _apiURL + 'maps/' + id + '/file', {}, success, false);
};

/** Save a new map
 * @param {Object} carte
 *  @param {string} carte.type
 *  @param {string} carte.title
 *  @param {string} carte.description
 *  @param {string} carte.organization_id
 *  @param {number} carte.theme_id
 *  @param {string} carte.premium 'default' or 'edugeo'
 *  @param {boolean} carte.active=true
 *  @param {string} carte.share=private
 *  @param {Array<number>} carte.bbox
 *  @param {string} [carte.img_url]
 * @param {Object} data carte data
 * @param {function} success callback
 */
MacarteAPI.prototype.postMap = function(carte, data, callback) {
  const formData = new FormData();
  const json = JSON.stringify(data);
  const blob = new Blob([json], {
    type: 'application/json'
  });
  // Too large file
  if (blob.size / 1024 / 1024 > MAX_FILE_SIZE) {
    callback({
      error: true,
      status: 413,
      msg: 'Content Too Large'
    })
    return;
  }
  formData.append('file', blob);
  formData.append('carte', JSON.stringify(carte));
  this._send('POST', _apiURL + 'maps', formData, resp => {
    // Update carte info with server response
    if (!resp.error) {
      Object.keys(resp).forEach(p => {
        carte[p] = resp[p];
      })
    }
    callback(resp)
  });
};

/** Post a file media
 * @param {string} id map edit id
 * @param {Object} data carte data
 * @param {function} callback when done
 */
MacarteAPI.prototype.updateMapFile =  function(id, data, callback) {
  const formData = new FormData();
  const json = JSON.stringify(data);
  const blob = new Blob([json], {
    type: 'application/json'
  });
  // Too large file
  if (blob.size / 1024 / 1024 > MAX_FILE_SIZE) {
    callback({
      error: true,
      status: 413,
      msg: 'Content Too Large'
    })
    return;
  }
  // Send file
  formData.append('file', blob);
  this._send('POST', _apiURL + 'maps/' + id +'/file', formData, callback);
};

/** Get user info
 * @param {string} public_id user id
 * @param {function} success callback
 */
MacarteAPI.prototype.getUser =  function(public_id, success) {
  this._send('GET', _apiURL + 'users/public/' + public_id, {}, success, false);
};

/** Search for users that publish a map
 * @param {Object} options
 *  @param {string} [options.public_name] string contains in the public user name
 *  @param {number} [options.theme]
 *  @param {number} [options.limit=15]
 * @param {function} callback
 */
MacarteAPI.prototype.searchMapUsers =  function(options, callback) {
  options = options || {};
  this._send('GET', _apiURL+'maps/users', options, callback, false);
};

/** Autocomplete users
 * @param {string} name public user name
 * @param {function} callback
 */
MacarteAPI.prototype.getUsers =  function(name, callback) {
  this._send('GET', _apiURL+'users', { query: name }, callback, false);
};

/** Get user media
 * @param {Object} options search options
 *  @param {boolean} [options.team=true] use false to get user media (out of current team)
 * @param {function} callback
 */
MacarteAPI.prototype.getMedias =  function(options, callback) {
  options = options || {};
  if (options.team === false) {
    delete options.organization_id
   } else {
    options.organization_id = team.getId();
   }
   delete options.team;
  this._send('GET', _apiURL+'medias', options, callback);
};

/** Get user media folders
 * @param {function} callback
 * @param {boolean} [useTeam=true] use false to get user media folder (out of teams)
 */
MacarteAPI.prototype.getMediasFolders =  function(callback, useTeam) {
  const options = {
    organization_id: (useTeam !== false) ? team.getId() : ''
  }
  this._send('GET', _apiURL+'medias/folders', options, callback);
};

/** Post a new user media
 * @param {File} img image file
 * @param {string} folder
 * @param {string} name
 * @param {function} callback
 * @param {boolean} [useTeam=true]
 */
MacarteAPI.prototype.postMedia =  function(img, folder, name, callback, useTeam) {
  const formData = new FormData();
  formData.append('file', img);
  formData.append('folder', folder);
  formData.append('name', name);
  //if (useTeam !== false) formData.append('organization_id', team.getId());
  formData.append('organization_id', (useTeam !== false) ? team.getId() : '');
  this._send('POST', _apiURL+'medias', formData, callback);
};

/** Post a file media
 * @param {string} id media to update
 * @param {File} img image file
 * @param {function} callback when done
 */
MacarteAPI.prototype.updateMediaFile =  function(id, img, callback) {
  const formData = new FormData();
  formData.append('file', img);
  this._send('POST', _apiURL+'medias/'+id+'/file', formData, callback);
};

/** Update media folder
 * @param {string} id media to update
 * @param {string} folder
 * @param {function} callback when done
 */
 MacarteAPI.prototype.updateMediaFolder =  function(id, folder, callback) {
  this._send('PUT', _apiURL+'medias/'+id+'/folder', { value: folder }, callback);
};

/** Update media name
 * @param {string} id media to update
 * @param {string} name
 * @param {function} callback when done
 */
MacarteAPI.prototype.updateMediaName =  function(id, name, callback) {
  this._send('PUT', _apiURL+'medias/'+id+'/name', { value: name }, callback);
};

/** Delete Media
 * @param {string} id media to delete
 * @param {function} callback when done
 */
MacarteAPI.prototype.deleteMedia =  function(id, callback) {
  this._send('DELETE', _apiURL+'medias/'+id, {}, callback);
};

/** Get editorial
 * @param {string} type 
 * @param {function} callback
 */
MacarteAPI.prototype.getEditorial =  function(type, callback) {
  if (type) {
    this._send('GET', _apiURL+'editorial/'+type, {}, (r) => {
      if (r.status === 418) {
        callback({ html: r.xhttp.responseText });
      } else {
        callback(r);
      }
    }, false);
  }
};

/** Get articles of an editorial category
 * @param {string} category followers|megamenu
 * @param {function} callback
 */
MacarteAPI.prototype.getArticles =  function(category, callback) {
  if (category) {
    this.getEditorial('articles/' + category, callback);
  }
};

/** Get editorial categories
 * @param {string} type 
 * @param {function} callback
 */
MacarteAPI.prototype.getArticleCategories =  function(callback) {
  this.getEditorial('categories', callback)
};

/** Get Themes
 * @param {function} callback
 */
MacarteAPI.prototype.getThemes =  function(callback) {
  this._send('GET', _apiURL+'themes', {}, (r) => {
    callback(r);
  }, false);
}

/** Get Notifications
 * @param {function} callback404
 */
MacarteAPI.prototype.getNotifications =  function(callback) {
  this._send('GET', _apiURL+'notifications', {}, (r) => {
    callback(r);
  }, false);
}

/** Get my team list
 * @param {function} [options.callback] callback function
 */
MacarteAPI.prototype.getTeams =  function(callback) {
  this._send('GET', _apiURL+'organizations/me', {}, (r) => {
    callback(r);
  });
}

/** Ativate team user
 * NB: user must be an inactive member
 * @param {string} id team id
 */
MacarteAPI.prototype.activateTeamMember =  function(id, callback) {
  if (!id) {
    callback({ error: true, status: 404, statusText: 'no team' });
    return;
  }
  this._send('GET', _apiURL+'organizations/' + id +'/activate', {}, resp => {
    if (typeof(callback) === 'function') callback(resp);
  });
}

/** Join a team using a link id
 * @param {string} id link id
 */
MacarteAPI.prototype.joinTeam =  function(id, callback) {
  this._send('GET', _apiURL+'organizations/join/' + id, {}, resp => {
    if (typeof(callback) === 'function') callback(resp);
  });
}

/** Modify the member link
 * @param {string} id team id
 * @param {string} type 'member' or 'editor'
 * @param {function} [options.callback] callback function
 */
MacarteAPI.prototype.setTeamLink =  function(id, type, callback) {
  if (!id) {
    callback({ error: true, status: 404, statusText: 'no team' });
    return;
  }
  if (['member','editor'].indexOf(type) < 0) {
    callback({ error: true, status: 404, statusText: 'bad type' });
    return;
  }
  this._send('PUT', _apiURL+'organizations/' + id + '/join-link/' + type, { value: true }, resp => {
    if (typeof(callback) === 'function') callback(resp);
  });
}

/** Remove the member link
 * @param {string} id team id
 * @param {string} type 'member' or 'editor'
 * @param {function} [options.callback] callback function
 */
MacarteAPI.prototype.removeTeamLink =  function(id, type, callback) {
  if (!id) {
    callback({ error: true, status: 404, statusText: 'no team' });
    return;
  }
  if (['member','editor'].indexOf(type) < 0) {
    callback({ error: true, status: 404, statusText: 'bad type' });
    return;
  }
  this._send('PUT', _apiURL+'organizations/' + id + '/join-link/' + type, { value: false }, resp => {
    if (typeof(callback) === 'function') callback(resp);
  });
}

/** Get member links
 * @param {string} id team id
 */
MacarteAPI.prototype.getTeamLinks =  function(id, callback) {
  if (!id) {
    callback({ error: true, status: 404, statusText: 'no team' });
    return;
  }
  this._send('GET', _apiURL+'organizations/links/' + id, {}, resp => {
    if (typeof(callback) === 'function') callback(resp);
  });
}

/** Get team list 
 * NB: if not member, team members are not listed, only a count is returned
 * @param {string} id team id
 * @param {function} [options.callback] callback function
 * @param {boolean} [options.publi] public information (no connection required)
 */
MacarteAPI.prototype.getTeam =  function(id, callback, publi) {
  if (!id) {
    callback({});
    return;
  }
  this._send('GET', _apiURL+'organizations/' + id, {}, resp => {
    if (typeof(callback) === 'function') callback(resp);
  }, !publi);
}

/** Set team attribute
 * @param {string} id team id
 * @param {string} attr attribute to change (name, presentation, image)
 * @param {string} value attribute values
 * @param {function} [options.callback] callback function
 */
MacarteAPI.prototype.setTeam =  function(id, attr, value, callback) {
  this._send('PUT', _apiURL+'organizations/' + id +'/' + attr, { value: value }, resp => {
    if (typeof(callback) === 'function') callback(resp);
  });
}

/** Create a new team
 * @param {Object} options
 *  @param {string} options.name team name
 *  @param {string} [options.presentation] team description
 *  @param {string} [options.image] image url for the team
 * @param {function} [options.callback] callback function
 */
MacarteAPI.prototype.newTeam =  function(options, callback) {
  const opt = {
    name: options.name,
    presentation: options.presentation,
    image: options.image
  }
  this._send('POST', _apiURL + 'organizations', opt, resp => {
    if (typeof(callback) === 'function') callback(resp);
  })
}

/** Create a new team
 * @param {string} id team id
 * @param {function} [options.callback] callback function
 */
MacarteAPI.prototype.deleteTeam =  function(id, callback) {
  this._send('DELETE', _apiURL + 'organizations/' + id, {}, resp => {
    if (typeof(callback) === 'function') callback(resp);
  })
}

/** Add members to the team
 * @param {string} id team id
 * @param {string} userId user id
 * @param {string} role user role (editor, owner, member)
 * @param {function} [options.callback] callback function
 * @param {boolean} [options.refresh] get a refresh token
 */
MacarteAPI.prototype.addTeamMember =  function(id, userId, role, callback, refresh) {
  this._send('POST', _apiURL + 'organizations/' + id + '/members/' + userId, {
    role: role || 'member'
  }, resp => {
    if (typeof(callback) === 'function') callback(resp);
  }, refresh)
}

/** Modify member role in the team
 * @param {string} id team id
 * @param {string} userId user id
 * @param {string} role user role (editor, owner, member)
 * @param {function} [options.callback] callback function
 */
MacarteAPI.prototype.setTeamMemberRole =  function(id, userId, role, callback) {
  this._send('PUT', _apiURL + 'organizations/' + id + '/members/' + userId + '/role', {
    value: role
  }, resp => {
    if (typeof(callback) === 'function') callback(resp);
  })
}

/** Remove member from team
 * @param {string} id team id
 * @param {string} userId user id
 * @param {function} [callback] callback function
 */
MacarteAPI.prototype.removeTeamMember =  function(id, userId, callback) {
  this._send('DELETE', _apiURL + 'organizations/' + id + '/members/' + userId, {}, resp => {
    if (typeof(callback) === 'function') callback(resp);
  })
}

/** Check if current team is still valid (the user belong to it)
 * @param {function} [callback] callback function that takes a boolean
 */
MacarteAPI.prototype.checkTeam = function(callback) {
  if (team.getId()) {
    this.getTeams(list => {
      const isok = team.checkIn(list)
      if (typeof(callback) === 'function') callback(isok)
    })
  } else {
    return true
  }
}

export default MacarteAPI
