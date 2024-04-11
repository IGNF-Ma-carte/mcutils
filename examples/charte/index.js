import options from '../../config/config'
import charte from '../../charte/macarte'
import '../../Carte'
import '../../dialog/notification'

import './charte.scss'

import saveCarte from '../../dialog/saveCarte'
import shareCarte from '../../dialog/shareCarte'

import StoryMap from '../../StoryMap'
import Carte from '../../Carte'
import openCarte from '../../dialog/openCarte'
import dialogMessage from '../../dialog/dialogMessage'
import loader from '../../dialog/loader'
import api from '../../api/api'
import dialog from '../../dialog/dialog'
import FlashMessage from '../../dialog/FlashMessage'
import MacarteAPI from '../../api/MacarteApi'
import MVT from '../../layer/MVT'
import ol_ext_element from 'ol-ext/util/element'
import organization from '../../api/organization'

const story = new StoryMap({ 
  // id: 'e331581bad8927c6a6584d175d240e12',
  // id: '63f449a8a77e81f6584941bdd42d8dc9',
  // id: 'd07f7afe263d4123f80a74d26da91de2',
  //id: 'e2089df5c500382500a047fd992fa48b', // Feu Massif des Maure
  // id: '7675e0fc5332260f4b565ef62201c1db', // Transport Toulouse
  // id: '68d880fea6c1f763aa112988326ad1a7', // Tour du monde 80 jours
  // target: document.querySelector('[data-role="map"]'),
  key: options.gppKey
});
story.setCarte(new Carte)

// Start loading
story.on('read:start', () => loader.show(0, 'Chargement de la carte...') );
story.on('read', () => loader.hide())

const lorem = '<h1>Lorem ipsum</h1>'
+"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam at lacinia nibh. Mauris vitae diam finibus, ultrices tellus quis, mollis nibh. Morbi lacus tortor, varius maximus dui in, finibus venenatis nunc. Phasellus semper, enim vel sagittis vulputate, sem lectus venenatis purus, a porta neque mi eget diam. Sed vehicula purus urna, vel malesuada justo laoreet mollis. Nullam sed est quis ipsum volutpat malesuada. Vivamus ut felis mollis, sagittis erat quis, egestas sapien. Vestibulum volutpat varius euismod. Ut pulvinar justo quis faucibus vulputate. Donec ut maximus lorem. Nunc facilisis feugiat massa, a convallis sem varius pretium. Vivamus purus nunc, iaculis pulvinar viverra id, dignissim a mi. Phasellus imperdiet rutrum nulla, a imperdiet nisi tincidunt eu. Sed ac ligula viverra, varius ligula facilisis, maximus est."
+'</br>'+"Proin enim elit, semper ut porttitor id, cursus eu turpis. Vivamus at purus odio. Integer ut pharetra est. Curabitur quis arcu rhoncus, sollicitudin risus ut, vehicula velit. Vestibulum facilisis lorem tempor diam sodales, ac placerat elit porta. Cras non commodo leo, eget porta massa. Pellentesque aliquet sem nec risus dictum dignissim. Nunc dignissim ultrices lectus, ac facilisis mi consequat non. Cras cursus, lacus sit amet congue rhoncus, ipsum massa vehicula ex, ut aliquam sem nisi vitae erat. Mauris lobortis auctor erat, id pretium urna faucibus in. Duis eu dui interdum, mattis enim ac, mollis lorem."
+'</br>'+"Cras turpis augue, accumsan ac tortor at, tristique finibus metus. Aenean et varius purus, a tristique tellus. Praesent tincidunt ut nisl a euismod. Sed ex ante, accumsan vitae pretium semper, mollis in justo. Aenean sit amet nisi id lectus dignissim interdum. In in viverra elit. Donec maximus pharetra turpis, nec lobortis purus fermentum non. Aliquam accumsan sed tortor vitae congue. Quisque vehicula libero purus, et lacinia erat malesuada ut. Maecenas id tempus nulla. Aliquam erat volutpat. Maecenas dignissim ligula tellus, sit amet finibus eros bibendum vitae. In hac habitasse platea dictumst. Suspendisse potenti. Maecenas diam odio, auctor nec enim fermentum, rhoncus ultricies turpis."
+'</br>'+"Morbi tempus sapien vel nulla laoreet viverra. Curabitur lacus erat, ultricies at tortor in, convallis porta felis. Donec ac tristique dui, ut vestibulum sapien. Pellentesque pretium odio eu urna gravida, a porta ipsum euismod. Vestibulum viverra elit dictum turpis lobortis, eget interdum dolor ornare. Etiam blandit dignissim tortor sed semper. Praesent ultricies lorem nec lacus sagittis, ac efficitur odio facilisis. Cras non commodo tortor. Duis venenatis, quam ut rhoncus elementum, augue metus malesuada nisl, in aliquam magna metus eget metus. Cras sit amet tempor nisi. Aenean ipsum dolor, accumsan nec consequat et, fringilla non nibh. Nunc sit amet faucibus ante."
+'</br>'+"Integer fermentum cursus dolor eget eleifend. Cras vitae lacinia nulla. Integer rhoncus ligula et nulla pellentesque, vitae mollis libero euismod. Nulla non justo non tellus mollis cursus. Cras eget justo libero. Morbi sit amet purus malesuada, rhoncus neque eu, convallis tortor. Proin fermentum urna sem, non laoreet lectus feugiat id. Mauris elementum, justo a ornare aliquet, odio nunc tristique lacus, eget pellentesque orci ante eget nibh. Morbi et lacus nec lorem aliquet hendrerit non ac risus. Mauris nec molestie nibh, quis volutpat dui. Phasellus interdum pharetra aliquam. Aenean finibus leo nec lectus facilisis pellentesque. Sed hendrerit ut felis at facilisis."

// App = Ma carte
charte.setApp('macarte', 'Ma carte');
// charte.setApp('atlas', 'Ma carte');

/*
new FlashMessage({
  message: 'Test de la charte sur l\'application MacarteAPI.'
})
*/

// Add menu tab
const bt = charte.addMenuButton('locate', 'fi-info', 'information');
bt.addEventListener('click', () => dialog.showMessage('A simple button in the menu barre...'))
charte.addMenuTab('locate', 'fi-location', 'Localisation', 'Onglet Carte');
charte.addMenuTab('edit', 'fi-pencil', 'Edition', lorem);
charte.addMenuTab('legend', 'fi-legend', 'Légende', 'Légende');

// Add tool button
charte.addTool('fullscreen', 'fi-visible', 'Plein écran', () => charte.fullscreen())
charte.addTool('help', 'fi-info', 'Aide', console.log)

charte.addTool();

// Save dialog 
function doSave(story) {
  saveCarte(story, (carte, options) => {
    // Do something with the story / options
    const data = story.write();
    console.log('SAVE*****',carte,options, data)
    // api.postMap(carte, )
  })
}

// Share carte
charte.addTool('share', 'fi-share-alt', 'Partager', () => {
  if (!shareCarte({ carte: story })) {
    dialogMessage.showAlert(
      'Vous devez enregistrer la carte avant de pouvoir la partager...',
      { submit: 'enregistrer', cancel: 'annuler '},
      (b) => {
        if (b==='submit') doSave(story);
      }
    );
  }
})

charte.addTool('print', 'fi-print', 'Imprimer', () => { story.print(); } );
charte.addTool();
charte.addTool('import', 'fi-share', 'Importer', console.log)

// Save the map
charte.addTool('save', 'fi-save', 'Enregistrer', () => {
  doSave(story);
});

// Open a new map
charte.addTool('open', 'fi-open', 'Ouvrir', () => {
  openCarte({
    callback: (c) => {
      story.load(c)
    }
  })
});

// New map
charte.addTool('new', 'fi-map', 'Ajouter un vecteur tuilé', () => {
  dialog.show({
    title: 'Vecteur tuilé',
    buttons: { ok: 'ok', cancel: 'annuler'},
    onButton: (b) => {
      if (b==='ok') {
        const mvtLayer = window.mvtLayer = new MVT({
          // url: 'https://wxs.ign.fr/static/vectorTiles/styles/BDTOPO/classique.json',
          url: sel.value
        });
        story.getCarte().getMap().addLayer(mvtLayer);
      }
    }
  })
  dialog.getContentElement().innerHTML = '';
  const sel = ol_ext_element.create('SELECT', {
    parent: dialog.getContentElement()
  })
  ol_ext_element.create('OPTION', {
    text: 'PLAN IGN : standard',
    value: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/essentiels/standard.json',
    parent: sel
  })
  ol_ext_element.create('OPTION', {
    text: 'PLAN IGN : gris',
    value: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/essentiels/gris.json',
    parent: sel
  })
  ol_ext_element.create('OPTION', {
    text: 'PLAN IGN : classique',
    value: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/essentiels/classique.json',
    parent: sel
  })
  ol_ext_element.create('OPTION', {
    text: 'BDTOPO : classique',
    value: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/BDTOPO/classique.json',
    parent: sel
  })
  ol_ext_element.create('OPTION', {
    text: 'BDTOPO : bati étages',
    value: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/BDTOPO/bati_etages.json',
    parent: sel
  })
  ol_ext_element.create('OPTION', {
    text: 'PCI : classique',
    value: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PCI/pci.json',
    parent: sel
  })
  ol_ext_element.create('OPTION', {
    text: 'PCI : gris',
    value: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PCI/noir_et_blanc.json',
    parent: sel
  })
})

// Do something when tab show (resize map)
charte.on(['tab:show', 'fullscreen'], () => { console.log('resizemap') });

// Listen to menu / title click
charte.on(['header:menu', 'header:mega', 'header:title'], console.log);
charte.on(['header:list'], console.log);
charte.on(['menu:list'], console.log);

/* DEBUG */
window.openCarte = openCarte;
window.charte = charte;
window.story = story;
window.organization = organization
/**/
