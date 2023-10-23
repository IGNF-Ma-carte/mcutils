import setInputPlaceholder from '../charte/setInputPlaceholder';
import dialog from './dialog';

import helpDialog from './helpDialog';
import help from './embedHelp.txt'

import './embedCarte.css';
import { toLonLat } from 'ol/proj';
import serviceURL, { getViewerURL } from '../api/serviceURL';
import Carte from '../Carte';
import StoryMap from '../StoryMap';

let html = `
<div class="iframe-container">
  <iframe></iframe>
</div>
<div>
  <h2>Intégrer votre carte</h2>
  <input class="url input-placeholder" disabled="disabled" placeholder="Code à intégrer dans votre site :" type="text" />
  <div class="container"><span class="copy-info">Copié dans le presse-papier</span></div>
  Taille :<br/>
  <input class="width" type="number" value="100" >
  <select class="wunit"><option value="%">%</option><option value="px">px</option></select>
  x 
  <input class="height" type="number" value="480" >
  <select class="hunit"><option value="%">%</option><option value="px">px</option></select>
  <br/>
  <label class="nozoom ol-ext-check ol-ext-checkbox small">
    <input class="nozoom" type="checkbox"><span></span> zoom avec Ctrl + molette
  </label>
  <br/>
  <label class="ol-ext-check ol-ext-checkbox small">
    <input class="notitle" type="checkbox"><span></span> masquer le titre
  </label>
  <div class="position">
    <label class="ol-ext-check ol-ext-checkbox small">
      <input class="position" type="checkbox"><span></span> intégrer la position
    </label>
    <div>
      <label>Longitude :</label><input class="lon" type="number" step=.0000001 />
      <label>Latitude :</label><input class="lat" type="number" step=.0000001 />
      <label>Zoom :</label><input class="zoom" type="number" step=.01 />
      <a class="locate article button"><i class="fi-location"></i> position courante</a>
    </div>
  </div>
  <div class="CGU">
    En intégrant une carte Macarte sur votre site, vous acceptez les <a href="{URL}" target="_new">Conditions d'utilisation de Macarte</a>.
  </div>
</div>
`;

html = html.replace('{URL}', serviceURL.cgu);

/** Share dialog
 * @param {Object} options
 *  @param {string} [options.prompt='Partager votre carte'] Dialog title
 *  @param {StoryMap|Carte|Object} [carte] the story or carte to share
 */
function embedCarte(options) {
  // geturl
  options = options || {};
  const carte = options.carte;
  let url = (carte && carte.getViewerUrl) ? carte.getViewerUrl() : getViewerURL(carte);
  if (!url) return;
  if (!/\?map=/.test(url)) url += '?';

  // Show dialog
  dialog.show({
    className: 'mc-embed-map',
    content: html,
    buttons: { /* copy: 'copier', */ cancel: 'annuler' },
    onButton: (b) => {
      if (b==='copy') {
        try {
          navigator.clipboard.writeText(inputs.url.value);
        } catch(e) {/* ok */}
      }
    }
  });
  const iframe = dialog.getContentElement().querySelector('iframe');
  iframe.src = url + '&noPop';

  const inputs = dialog.getInputs();
  inputs.hunit.value = 'px';

  // Update url
  let pos = [];
  function setUrl() {
    if (inputs.position.checked) {
      if (inputs.zoom.value > 18) inputs.zoom.value = 18;
      pos = [inputs.lon.value, inputs.lat.value, inputs.zoom.value];
      // empty
      if (pos.join(',') === ',,') pos = [];
    } else {
      pos = [];
    }
    const carteURL = getViewerURL({
      view_id: carte.get ? carte.get('id') : carte.view_id || carte.id,
      title: carte.getTitle ? carte.getTitle() : carte.title || 'macarte',
      type: carte.type || carte instanceof Carte ? 'macarte' : 'storymap',
      showTitle: !inputs.notitle.checked,
      noZoom: inputs.nozoom.checked,
      position: pos
    })
    inputs.url.value = '<iframe src="' + carteURL + '"'
      + ' width="' + inputs.width.value + inputs.wunit.value +'"'
      + ' height="' + inputs.height.value + inputs.hunit.value +'"'
      + ' allow="geolocation clipboard-read; clipboard-write"'
      + '></iframe>';
    // Update iframe
    if (iframe.src !== carteURL) {
      iframe.src = carteURL; 
    }
    iframe.style.width = inputs.width.value + inputs.wunit.value;
    iframe.style.height = inputs.height.value + inputs.hunit.value;
  }
  // Update url on input change
  for (let i in inputs) {
    inputs[i].addEventListener('change', setUrl);
  }
  setUrl();

  const dialogContent = dialog.getContentElement();
  // Style placeholder
  setInputPlaceholder(dialogContent);
  
  // Copy url on click
  dialogContent.querySelector('.input-placeholder').addEventListener('click', () => {
    try {
      navigator.clipboard.writeText(inputs.url.value);
      const copyInfo = dialogContent.querySelector('.copy-info')
      copyInfo.className = 'copy-info visible';
      setTimeout(() => { copyInfo.className = 'copy-info'; }, 800);
    } catch(e) {/* ok */}
  });

  // Handle posiiton
  inputs.position.addEventListener('change', () => {
    if (inputs.position.checked) {
      dialogContent.querySelector('div.position').classList.add('checked')
    } else {
      dialogContent.querySelector('div.position').classList.remove('checked')
    }
  })
  if (carte && (carte instanceof Carte || carte instanceof StoryMap)) {
    if (carte.get('model') === 'onglet') {
      dialogContent.querySelector('div.position').classList.add('hidden');
    }
    dialogContent.querySelector('a.locate').addEventListener('click', () => {
      let view = carte.getCarte ? carte.getCarte().getMap().getView() : carte.getMap().getView();
      const pos = toLonLat(view.getCenter(), view.getProjection());
      const digit = 10000000;
      inputs.lon.value = Math.round(pos[0]*digit)/digit;
      inputs.lat.value = Math.round(pos[1]*digit)/digit;
      inputs.zoom.value = Math.round(view.getZoom()*10) / 10;
      setUrl();
    });
  } else {
    dialogContent.querySelector('a.locate').style.display = 'none';
  }

  // Show help
  helpDialog(dialogContent.querySelector('h2'), help, { 
    title: 'Intégrer votre carte',
    className: 'medium'
  });
}

export default embedCarte;