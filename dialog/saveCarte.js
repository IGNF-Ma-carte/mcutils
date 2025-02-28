import charte from '../charte/charte';
import dialog from './dialog';
import InputMedia from '../control/InputMedia';
import api from '../api/api';
import './saveCarte.css';
import ol_ext_element from 'ol-ext/util/element';
import StoryMap from '../StoryMap';
import Carte from '../Carte'
import md2html from '../md/md2html';
import team from '../api/team';
import { storyV4 }  from '../format/version/toV4'

const html = `
<ul>
  <li class="info">
    Pour enregistrer une carte dans votre espace personnel, remplissez le formulaire.
  </li>
  <li class="accent">
    Vous devez renseigner les champs obligatoires...
  </li>
  <li data-attr="title">
    <input class="title input-placeholder required" type="text" placeholder="Titre de la carte">
  </li>
  <li data-attr="description">
    <textarea class="description input-placeholder" type="text" placeholder="Description"></textarea>
  </li>
  <li data-attr="theme">
    <span class="required">Thème</span> :
    <select class="theme"></select>
  </li>
  <li data-attr="img_url">
    Image d'illustration :
    <br/>
    <input type="text" class="image" />
  </li>
  <li data-attr="share">
    Publication :
    <select class="share">
    </select>
  </li>
`;

let themesList;

/** Save dialog
 * @param {Carte|StoryMap|AtlasDef} carte the StoryMap or Carte or an atals object. The object is modified in place.
 * @param {function} callback a callback function that takes the current carte and save optionsCarte 
 * @param {Object} options
 *  @param {string} [options.prompt='Enregistrer une carte']
 *  @param {string} [options.className]
 *  @param {boolean} [options.saveAs=false]
 */
function saveCarte(carte, callback, options) {
  options = options || {};
  callback = (typeof(callback) === 'function' ? callback : ()=>{});
  let optionsCarte = {};
  if (carte instanceof StoryMap || carte instanceof Carte) {
    optionsCarte = carte.get('atlas') || {};
    if (!optionsCarte.title) optionsCarte.title = carte.get('title') || '';
    if (!optionsCarte.description) optionsCarte.description = md2html.text(carte.get('description')) || '';
    if (!optionsCarte.img_url) optionsCarte.img_url = carte.get('logo') || '';
  } else {
    optionsCarte = carte;
  }
  // Save as (remove props)
  if (options.saveAs) {
    const tmp = optionsCarte;
    optionsCarte = {};
    ['active','description','img_url','theme','theme_id','title','type','premium'].forEach(i => {
      optionsCarte[i] = tmp[i];
    });
  }
  // Use default team
  if (!optionsCarte.organization_id) {
    optionsCarte.organization_id = team.getId();
  }
  if (optionsCarte.active === undefined) {
    optionsCarte.active = true;
  }
  // Save dialog
  dialog.show({
    title: options.prompt || 'Enregistrer une carte',
    className: ('mc-save-map ' + (options.className || '')).trim(),
    content: html,
    buttons: { submit: 'Enregistrer', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b !== 'submit') return;
      // Is valid ?
      inputs.title.classList.remove('invalid');
      inputs.theme.classList.remove('invalid');
      if (!inputs.title.value || !inputs.theme.value) {
        errorElt.style.display = 'block';
        if (!inputs.title.value) inputs.title.classList.add('invalid');
        if (!inputs.theme.value) inputs.theme.classList.add('invalid');
        return;
      }
      // OK
      optionsCarte.title = inputs.title.value;
      optionsCarte.description = inputs.description.value;

      optionsCarte.theme_id = inputs.theme.value;
      optionsCarte.theme = themesList[inputs.theme.value];
      optionsCarte.img_url = inputs.image.value;
      optionsCarte.share = inputs.share.value;
      if (carte instanceof StoryMap || carte instanceof Carte) {
        carte.set('atlas', optionsCarte)
      }
      dialog.hide();
      callback(carte, optionsCarte);
    }
  });
  const errorElt = dialog.getContentElement().querySelector('.accent');

  // Set default values
  const inputs = dialog.getInputs();
  inputs.title.value = optionsCarte.title || '';
  inputs.description.value = optionsCarte.description || '';
  inputs.image.value = optionsCarte.img_url || '';
  if (team.getId()) {
    inputs.share.innerHTML = `
      <option value="private">Privée</option>
      <option value="public">Equipe</option>
      <option value="atlas">Atlas</option>
    `
  } else {
    inputs.share.innerHTML = `
      <option value="public">Publique</option>
      <option value="atlas">Atlas</option>
    `
  }
  inputs.share.value = optionsCarte.share || (team.getId() ? 'private' : 'public');
  if (team.getId() && !team.isOwner()) {
    inputs.share.disabled = true;
  }

  // Handle invlid
  inputs.title.addEventListener('change', () => {
    inputs.title.classList.remove('invalid');
  })
  inputs.theme.addEventListener('change', () => {
    inputs.theme.classList.remove('invalid');
  })
  // Style placeolder
  charte.setInputPlaceholder(dialog.getContentElement());

  // Load themes
  const setThemes = (themes) => {
    if (themes) {
      if (themes.error) return;
      themesList = {};
      themes.forEach(t => { themesList[t.id] = t.name; });
    }
    const sel = dialog.getContentElement().querySelector('select');
    ol_ext_element.create('OPTION', {
      html: 'Choisir un theme...',
      value: '',
      disabled: true,
      selected: true,
      parent: sel
    });
    Object.keys(themesList).forEach(id => {
      const opt = ol_ext_element.create('OPTION', {
        html: themesList[id],
        value: id,
        parent: sel
      })
      if (themesList[id] === optionsCarte.theme) opt.selected = true;
    });
  };
  if (!themesList) {
    api.getThemes(setThemes);
  } else {
    setThemes();
  }
  window.api = api

  // Image input media
  new InputMedia({ 
    add: true,
    input: dialog.getContentElement().querySelector('input.image')
  });

  return dialog
}

/** Check share between story and included cartes
 * @param { Object } story
 * @param { function } callback
 */
function checkStoryShare(story, callback) {
  if (typeof(callback) !== 'function') callback = function() {};
  if (story instanceof StoryMap) {
    story = story.get('atlas')
  }
  // Not a storymap in a team
  if (!story.organization_id || story.type !== 'storymap') {
    callback();
    return;
  }
  // Get story and cartes
  api.getMapFile(story.view_id, s => {
    storyV4(s);
    const cartes = [];
    const origin = s.cartes.length ? s.cartes : s.tabs
    // Check cartes
    origin.forEach(c => {
      api.getMap(c.view_id || c.id, map => {
        cartes.push(map)
        if (cartes.length == origin.length) {
          checkShare(story.share, cartes)
          callback();
        }
      }, false)
    })
  })
}

// Check share
const shareList = {
  private: 0,
  public: 1,
  atlas: 2
}
/** Check share between story and cartes
 * @param {string} share
 * @param {Array<Object>} cartes
 */
function checkShare(share, cartes) {
  const shareRg = shareList[share];
  const badMap = []
  cartes.forEach(c => {
    if (c.get && c.get('atlas')) c = c.get('atlas');
    if (shareList[c.share] < shareRg) {
      badMap.push(c)
    }
  })
  if (badMap.length) {
    dialog.showAlert(
      'Cette carte contient des cartes qui n\'ont pas le même niveau de partage.<br/>'
      + 'Elles risquent de ne pas s\'afficher correctement.<br/>'
      + 'Voulez-vous propager le partage ?',
      { ok: 'Propager aux cartes...', cancel: 'Annuler'},
      b => {
        if (b==='ok') {
          badMap.forEach(c => {
            api.updateMap(c.edit_id, { share: share }, e => {
              if (e.error) {
                dialog.showAlert('Une erreur est survenue.<br/>Opération impossible...');
              } else {
                c.share = share;
              }
            })
          })
        }
      }
    )
  }
}

export { checkStoryShare, checkShare }
export default saveCarte;