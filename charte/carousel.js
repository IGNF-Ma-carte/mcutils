import ol_ext_element from 'ol-ext/util/element'

import './carousel.css'

/** Set an element as carousel 
 * Should contains a list of diapo (as ul) 
 * @param {Element} [elt] if not defined will get all data-role="carousel" elements
 */
function setCarousel(elt) {
  // Find carousel
  if (!elt) {
    document.body.querySelectorAll('[data-role="carousel"]').forEach(setCarousel)
    return;
  }
  // Already done
  if (elt.querySelector('fieldset[aria-controls="carousel"]')) return;

  // Carousel list element
  const carou = elt.querySelector('ul');
  ol_ext_element.create('DIV', {
    className: 'carousel-list',
    html: carou,
    parent: elt
  })
  const li = elt.querySelectorAll('.carousel-list > ul > li')
  // Current position
  let pos = 0;
  const nb = li.length;
  // Set Diapo
  function setDiapo(dt) {
    pos = Math.abs(nb + pos + dt)%nb;
    carou.style.transform = 'translateX(-'+(Math.abs(pos%nb)*100)+'%)'
    // Set Aria
    elt.querySelectorAll('.carousel .diapo').forEach((c,i) => {
      c.setAttribute('aria-hidden', i !== pos);
    });
    // Check position
    prevBt.disabled = (pos === 0);
    nextBt.disabled = (pos === nb-1);
  }
  
  // New one
  const buttons = ol_ext_element.create('FIELDSET', {
    'aria-label': "carousel buttons",
    'aria-controls': "carousel"
  })
  elt.prepend(buttons);
  // previous button
  const prevBt = ol_ext_element.create('BUTTON', {
    'className': "previous",
    'aria-label': "previous",
    'title': "précédent",
    click: () => setDiapo(-1),
    parent: buttons
  })
  // next button
  const nextBt = ol_ext_element.create('BUTTON', {
    'className': "next",
    'aria-label': "next",
    'title': "suivant",
    click: () => setDiapo(+1),
    parent: buttons
  })
  // Init
  setDiapo(0)
}

export default setCarousel