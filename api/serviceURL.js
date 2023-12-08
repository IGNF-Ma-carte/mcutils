/** @namespace serviceURL
 * @description List of service URL and usefull functions to get URLs.
 */

import options from "../config/config"
import removeDiacritics from "../config/removeDiacritics";

// Check server path
if (!/\/$/.test(options.server)) {
  options.server += '/';
}

/** List of services url 
 * @memberof serviceURL
 */
const serviceURL = {
  home: options.server,
  signal: options.server + 'signaler',
  contact: options.server + 'nous-contacter',
  accessibility: options.server + 'declaration-daccessibilite-rgaa.pdf',
  logout: options.server + 'deconnexion',

  /// API url
  api: options.server + 'api',
  media: options.server + 'api/image',

  /// Url Macarte edition
  macarte: options.server + 'edition/carte',
  mestat: options.server + 'edition/statistique',
  narration: options.server + 'edition/narration',
  geocod: options.server + 'edition/adresses',
  search: options.server + 'atlas',

  // Mon compte
  createAccount: options.server + 'creer-un-compte',
  initPassword: options.server + 'recuperer-mon-mot-de-passe',
  unlockAccount: options.server + 'debloquer-mon-compte',
  user: options.server + 'mon-compte',
  profil: options.server + 'mon-compte/#profil',
  mescartes: options.server + 'mon-compte/#cartes',
  mesmedias: options.server + 'mon-compte/#medias',

  // editorial
  mention: options.server + 'mentions-legales',
  cgu: options.server + 'cgu',
  cookie: options.server + 'cookies-et-statistiques',
  doc: options.server + 'aide',
  blog: options.server + 'aide/blog',
  tuto: options.server + 'aide/tutoriels',
  faq: options.server + 'aide/faq',
  version: options.server + 'aide/notes-de-version',
}

// Get Options
for (let k in serviceURL) {
  if (options[k]) serviceURL[k] = options[k];
}

/** Get media url
 * @memberof serviceURL
 * @param {string} id media id
 * @return {string} media url
 */
function getMediaURL(id) {
  // No media
  if (!id) return '';
  // Url is media
  if (/^https?:\/\//.test(id) || /^data:image\//.test(id)) return id;
  // API media url
  return serviceURL.media + '/' +id;
}

/** Get viewer for a carte
 * @memberof serviceURL
 * @param {Object} carte
 *  @param {string} carte.view_id
 *  @param {string} [carte.title='carte']
 *  @param {string} [carte.type='carte'] map type 'storymap' or 'macarte'
 *  @param {boolean} [carte.showTitle=true]
 *  @param {boolean} [carte.noZoom=false]
 *  @param {Array<number>} [carte.position]
 * @param {boolean} [tab] the map is inside a tab (onglet)
 * @return {string} viewer url
 */
function getViewerURL(carte, tab) {
  const id = carte.view_id || carte.id;
  if (!id) return '';
  // Title
  let title = encodeTitleURL(carte.title || 'macarte')
  // Get Viewer
  let url = options.viewer
    .replace('$ID', id)
    .replace('$TITLE', encodeURIComponent(title))
    .replace('$NOTITLE', (carte.showTitle===false) ? 'notitle' : '');
  url = url.replace(/[?|&]$/,'');
  if (carte.position && carte.position.length) {
    const pos = 'lon='+carte.position[0]+'&lat='+carte.position[1]+'&z='+carte.position[2];
    url += (/\?/.test(url) ? '&'+pos : '?'+pos);
  }
  if (tab) {
    url += (/\?/.test(url) ? '&' : '?') + 'tab';
  }

  if (carte.noZoom) url += (/\?/.test(url) ? '&' : '?') + 'noZoom';
  return url;
}

/** Get viewer for a carte
 * @memberof serviceURL
 * @param {Object} carte
 *  @param {string} carte.edit_id
 *  @param {string} [carte.title='carte']
 *  @param {string} [carte.type='carte'] map type 'storymap' or 'macarte'
 *  @param {boolean} [carte.showTitle=true]
 * @return {string} viewer url
 */
function getEditorURL(carte) {
  const id = carte.edit_id;
  if (!id) return '';
  // type URL
  let typeUrl = (carte.type==='storymap' ? 'narration' : 'carte');
  // Get Viewer
  return options.editor
    .replace('$TYPE', typeUrl)
    .replace('$ID', id);
}

/** Get user url
 * @memberof serviceURL
 * @param {string} user user name
 * @return {string} user url
 */
function getUserURL(user) {
  if (!user) return '';
  // Get Viewer
  return options.userProfile
    .replace('$NAME', user);
}

/** Encode a string as title to add in a url (only keep letters and digit)
 * @memberof serviceURL
 * @param {string} title
 * @return {string} encoded title
 */
function encodeTitleURL(title) {
  title = removeDiacritics(title)
  title = title.replace(/[^a-zA-Z0-9]/g,'-').replace(/-{2,}/g,'-');
  return title
}

/** Get documentation (editorial) url
 * @memberof serviceURL
 * @param {string} category
 * @param {string} article
 * @return {string} url
 */
function getDocumentationURL(page, category, article) {
  // Get Viewer
  return options[page]
    .replace('$CATEGORIE', category || '')
    .replace('$ARTICLE', article || '')
    .replace(/\/{0,3}$/, '');
}

export { encodeTitleURL }
export { getUserURL }
export { getMediaURL }
export { getViewerURL }
export { getEditorURL }
export { getDocumentationURL }
export default serviceURL