// Load script async
function loadAsync(url) {
  const request = new XMLHttpRequest();
  request.open('GET', url, false);  // `false` makes the request synchronous
  request.send(null);

  if (request.status === 200) {
    try {
      if (/.json$/.test(url)) {
        window.maCarteOptions = JSON.parse(request.responseText);
      } else {
        (new Function(request.responseText))()
      }
    } catch(e){ /* ok */}
  }
}

/** Function to import config in the html header
 * @example
// Import default config
import importConfig from 'mcutils/config/import'
importConfig('./config.json);
*/
export default function(url) {
  loadAsync(url);
  if (!/gitlab.io/.test(window.location.origin)) {
    loadAsync(window.location.origin+'/config-server.json');
  }
}
