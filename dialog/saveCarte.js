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
    Partage :
    <select class="share">
      <option value="private">Privée</option>
      <option value="public">Publique</option>
      <option value="atlas">Atlas</option>
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
  // Use default team
  if (!optionsCarte.organization_id) {
    optionsCarte.organization_id = team.getId();
  }
  // Save as (remove props)
  if (options.saveAs) {
    const tmp = optionsCarte;
    optionsCarte = {};
    ['active','description','img_url','theme','theme_id','title','type','premium'].forEach(i => {
      optionsCarte[i] = tmp[i];
    });
  }
  if (optionsCarte.active === undefined) optionsCarte.active = true;
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
  inputs.share.value = optionsCarte.share || 'private';
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

export default saveCarte;