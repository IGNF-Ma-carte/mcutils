import options from '../../config/config'
import loader from '../../dialog/loader'

import md2html from "../../md/md2html";
import StoryMap  from "../../StoryMap";

import './narration.scss'
import '../index.css'

const story = new StoryMap({ 
/**/
  id: 'e331581bad8927c6a6584d175d240e12',
  id: '63f449a8a77e81f6584941bdd42d8dc9',
  id: 'e2089df5c500382500a047fd992fa48b', // Feu Massif des Maure
  // id: '7675e0fc5332260f4b565ef62201c1db', // Transport Toulouse
  id: '68d880fea6c1f763aa112988326ad1a7', // Tour du monde 80 jours
  id: 'aafdd46c984b6eb7f77e5027b8afba3e', // compare
  id: '4abe44d25ec0a28b7159b27cd25ce476',
  id: 'ee61127ac4b8572b95e3938b11392f13',
  id: 'd07f7afe263d4123f80a74d26da91de2', // OCS-BFD
  id: '74fe6e619dd117364e3585dfe07ab7b1', // Nantes
  id: '5aea2d2515d03442521ddc91347e8427', // Nautilus
/**/
  target: 'narration',
  key: options.gppKey
});

story.on('read:start', () => {
  loader.show();
})

story.on('read', () => {
  console.log('Lecture ok...');
  story.useUrlPosition();
  story.addToolBar();
  loader.hide();
})
story.on('error', () => {
  console.log('Impossible de lire la carte...')
  loader.hide();
})

// Load StoryMap
const input = document.querySelector('input');
input.addEventListener('change', () => story.load(input.value));
// Select
const select = document.querySelector('select');
select.value = '';
select.addEventListener('change', () => {
  input.value = select.value;
  story.load(select.value);
});

// Fullscreen
document.querySelector('[data-role="fullscreen"]').addEventListener('click', () => {
  story.fullscreen(true);
});
// Rendu image
document.querySelector('[data-role="render"]').addEventListener('click', () => {
  var c = story.cartes[0];
  c.map.getLayers().forEach(l => {
    if (l.setMode) l.setMode('image');
  })
});

/** /
import shareCarte from '../../dialog/shareCarte'
import element from 'ol-ext/util/element'

const target = element.create('DIV', {
  parent: document.body
})
shareCarte({ carte: story, target: target });
/**/

/* DEBUG */
window.loader = loader;
import Carte from '../../Carte'
window.Carte = Carte
window.story = story
window.md2html = md2html
/* */