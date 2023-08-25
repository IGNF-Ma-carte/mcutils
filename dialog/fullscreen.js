import './fullscreen.css'
import fakemap from './fakeMap'
import OvelayControl from 'ol-ext/control/Overlay'
import ol_ext_element from 'ol-ext/util/element';

/** A fullscreen Overlayer to display an image
 * @example fullscreen.showImage(src, { title: 'my image' });
 */ 
const fullscreen = new OvelayControl ({ 
  target: document.body,
  hideOnClick: true, 
  className: 'fullscreen-image' 
});
fullscreen.setMap(fakemap);

/** Show an image / diaporama
 * @param {Feature} f
 * @param {Array<Feature>} features
 */
fullscreen.diaporama = function(f, features) {
  const index = features.indexOf(f);
  const content = f.getPopupContent(true);
  const imgElt = content.querySelector('img');
  const img = imgElt ? imgElt.src : '-';
  const title = content.querySelector('h1') || content.querySelector('h2') || content.querySelector('h3') || content.querySelector('h4');
  // Show fullscreen
  fullscreen.showImage(img, { title: title ? title.innerText : '' });
  if (index > 0) {
    ol_ext_element.create('I', {
      className: 'previous',
      click: (e) => {
        fullscreen.diaporama(features[index-1], features);
        e.stopPropagation();
        e.preventDefault();
      },
      parent: fullscreen.element
    })
  }
  if (index < features.length-1) {
    ol_ext_element.create('I', {
      className: 'next',
      click: (e) => {
        fullscreen.diaporama(features[index+1], features);
        e.stopPropagation();
        e.preventDefault();
      },
      parent: fullscreen.element
    })
  }
}

// Show image fullscreen (to use with md2html)
window.fullscreen = (elt) => {
  if (elt && elt.firstElementChild) {
    const img = elt.firstElementChild;
    const src = img.src;
    if (src) fullscreen.showImage(src, { title: img.title });
  }
}

export default fullscreen
