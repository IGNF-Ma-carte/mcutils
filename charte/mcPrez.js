/* Add a set of function to show slides in the brower over the map */

import ol_ext_element from 'ol-ext/util/element'

import './mcPrez.css'

let div, h1, subTitle;

// Get the current slide
function getSlide() {
  if (div) return div;
  div = ol_ext_element.create('DIV', {
    className: 'slideFrame',
    click: () => {
      div.style.opacity = 0;
      setTimeout(() => div.style.display = 'none', 500);
    },
    parent: document.body
  })
  ol_ext_element.create('IMG', {
    src: 'https://macarte.ign.fr/image/voir/eqb6228.jpeg',
    parent: div
  })
  h1 = ol_ext_element.create('H1', {
    parent: div
  })
  return div;
}

// Create subtitle
function getSubtitle() {
  if (subTitle) return subTitle;
  subTitle = ol_ext_element.create('P', {
    className: 'slideFrame',
    parent: document.body
  })
  return subTitle;
}

/* Slide controler */
window.slider = {
  // Show
  show: function(title) {
    getSlide();
    h1.innerHTML = title || '';
    div.style.display = 'block';
    setTimeout(() => div.style.opacity = 1, 200);
  },
  // Hide prez
  hide: function() {
    getSlide();
    div.style.opacity = 0;
    setTimeout(() => div.style.display = 'none', 500);
  },
  // Finish prez
  finish: function() {
    window.slider.show('macarte.ign.fr')
  },
  // Show subtitle
  sub: function(info) {
    getSubtitle();
    if (info) {
        subTitle.innerHTML = info;
        subTitle.style.display = 'block';
        setTimeout(() => subTitle.style.opacity = 1, 200);
    } else {
        subTitle.innerHTML = '';
        subTitle.style.opacity = 0;
        setTimeout(() => subTitle.style.display = 'none', 200);
    }
  }
}
