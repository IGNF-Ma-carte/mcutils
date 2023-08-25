import charte from '../../charte/macarte'
import '../../Carte'
import dialog from '../../dialog/dialog'
import dialogMessage from '../../dialog/dialogMessage'
import notification from '../../dialog/notification'

import './index.css'

charte.setApp('macarte', 'Ma carte');
// charte.setApp('atlas', 'Ma carte');

charte.setInputPlaceholder();

// Listen to menu / title click
charte.on(['header:menu', 'header:mega', 'header:title'], console.log);
charte.on(['header:list'], console.log);
charte.on(['menu:list'], console.log);

// FlashMessage
new FlashMessage({
    type: 'info',
    message: 'Les flash messages permettent d\'informer les utilisateurs sur ce qui se passe...'
})
document.querySelector('.flashMessage').addEventListener('click', () => {
  const mess = [{
    type: 'info',
    message: 'Les flash messages permettent d\'informer les utilisateurs sur ce qui se passe...'
  },{
    type: 'success',
    message: 'Tout c\'est passé correctement, vous pouvez continuer à travailler...'
  },{
    type: 'error',
    message: 'Oops ! Une erreur est survenue, faites attention à ce que vous faites !'
  },{
    type: 'warning',
    message: 'C\'est pas encore parfait mais on y travaille...'
  }]
  const n = Math.trunc(Math.random() * mess.length);
  console.log(n)
  new FlashMessage(mess[n])
})  

// Dialogues
document.querySelector('.message').addEventListener('click', () => {
  dialogMessage.showMessage('Affichage d\'un message...');
});
document.querySelector('.alert').addEventListener('click', () => {
  dialogMessage.showAlert('Une erreur s\'est produite...');
});
document.querySelector('.E404').addEventListener('click', () => {
  dialogMessage.show404('Une erreur est survenue', 'message d\'erreur');
});
document.querySelector('.notification').addEventListener('click', () => {
  notification.show('Quelque chose s\'est produit...');
});
// Show progress dialog
document.querySelector('.progress').addEventListener('click', () => {
  dialogMessage.show({ 
    title: 'Patientez...', 
    buttons:{ ok: 'ok' }
  })
  dialogMessage.setContentMessage('80%');
  dialogMessage.setProgress (8,10,
    '<i class="fi-location"> 8 sur 10 adresses traitées</i> - '+
    '<i class="fi-clock"> Temps restant : 1 mn 30 s</i>'
  )
});


import PopupSymbol from '../../input/PopupSymbol'
new PopupSymbol({ input: document.querySelector('.symbol'), position: 'fixed' })

import ColorInput from 'ol-ext/util/input/Color'
new ColorInput({ input: document.querySelector('.color'), position: 'fixed' })

import SizeInput from 'ol-ext/util/input/Size'
new SizeInput({ input: document.querySelector('.size') })

import WidthInput from 'ol-ext/util/input/Width'
new WidthInput({ input: document.querySelector('.width') })

import DashInput from '../../input/PopupDash'
new DashInput({ input: document.querySelector('.dash') })

import PatternInput from '../../input/PopupPattern'
import FlashMessage from '../../dialog/FlashMessage'
new PatternInput({ input: document.querySelector('.pattern') })

// Add accordion dynamically
const accordionList = document.querySelector('ul.accordion');
charte.createAccordionElement(accordionList, {
  title: 'Titre',
  isTitle: true
});
charte.createAccordionElement(accordionList, {
  title: 'Accordéon dynamique', 
  expended: false,
  name: 'accordion-1',
  content: 'Inséré avec <code>charte.createAccordionElement</code>'
})
charte.createAccordionElement(accordionList, {
  title: 'Accordion button',
  name: 'accordion-1',
  content: null,
  click: () => dialog.showMessage('Vous avez cliqué sur l\'accordéon..')
});

charte.initAccordion(document.querySelector('ul.accordion'));

// Onglets
charte.initTabList(document.querySelector('[data-role="tabs"]'));

// Set Carousel
charte.setCarousel();

/* DEBUG */
window.charte = charte;
window.dialog = dialog;
window.dialogMessage = dialogMessage;
window.notification = notification;
/**/
