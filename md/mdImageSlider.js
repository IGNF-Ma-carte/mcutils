import ol_ext_element from "ol-ext/util/element";

import './mdImageSlider.css'


const fscreen = ol_ext_element.create('DIV', {
  className: 'md md-fullscreen-image-slider',
  parent: document.body
})

/* Show images fullscreen */
function fullscreen(elt) {
  // Clear
  fscreen.innerHTML = '';
  fscreen.style.display = 'block';

  // Add images
  const div = ol_ext_element.create('DIV', { parent: fscreen })
  createElement(div, {
    img1: elt.querySelector('.md-img-1').src,
    img2: elt.querySelector('.md-img-2').src,
  })
  // Close button
  const bt = ol_ext_element.create('BUTTON', {
    className: 'closeBox',
    parent: fscreen
  })
  bt.addEventListener('click', () => {
    delete fscreen.dataset.visible;
    fscreen.style.display = 'none';
    setTimeout(() => fscreen.innerHTML = '', 500);
  })
  
  // Show image slider
  setTimeout(() => {
    fscreen.dataset.visible = '';
    mdImageSlider(fscreen);
  }, 200)
}

/* Create images and slider */
function createElement(content, atts, width, height) {
  const element = ol_ext_element.create('DIV', {
    className: 'md-image-slider',
    style: {
      backgroundImage: atts.img1
    },
    parent: content
  })
  // First image
  ol_ext_element.create('IMG', {
    src: atts.img1,
    className: 'md-img-1',
    style: {
      width: width ? width + 'px' : 'auto',
      maxHeight: height ? height + 'px' : 'auto'
    },
    parent: element
  })
  // Slider
  ol_ext_element.create('DIV', {
    className: 'md-image-slider',
    style: { 
      pointerEvents: 'auto',
      touchAction: 'none'
    },
    parent: element
  })
  // Second image
  ol_ext_element.create('IMG', {
    className: 'md-img-2',
    src: atts.img2,
    parent: element
  })
  return element
}

/** Prepare image Slider
 * @private
 */
function prepareImageSlider(type, data) {
  type = type.split(' ');
  // Handle image width / height
  const wh = (type[1] || '').split('x')
  let width = wh[0];
  const height = wh[1];
  if (!width && !height) width = 500;
  // Get params
  const lines = data.split('\n');
  const atts = {}
  lines.forEach(d => {
    const i = d.indexOf(':');
    atts[d.substr(0,i)] = d.substr(i+1).trim();
  })
  const content = ol_ext_element.create('DIV');
  // Container
  const element = createElement(content, atts, width, height)
  if (atts.fullscreen) {
    ol_ext_element.create('BUTTON', {
      className: 'md-image-fullscreen',
      parent: element
    })
  }
  return content.innerHTML;
}

/**
 * @param {Element} elt 
 * @param {number} position 
 * @private
 */
function clipElement (elt, position) {
  const max = elt.previousElementSibling.getBoundingClientRect().width;
  if (position === -1) {
    position = max/2;
  }
  elt.style.left = Math.min(max-2, Math.max(2, position)) + 'px';
  elt.nextElementSibling.style.clip = 'rect(0, 10000px, 10000px, ' + elt.style.left + ')';
}

/** Create image Slider from element
 * @namespace md2html
 * @param {Element} element
 */
function mdImageSlider(element) {
  // Current element / position
  let position, pageX, elt;
  function onPointerMove(e) {
    const dx = e.pageX - pageX;
    clipElement(elt, position + dx)
  }
  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove)
    ol_ext_element.removeListener(window, ['pointerup','pointercancel'], onPointerUp);
  }
  // Handle all image sliders
  element.querySelectorAll('.md-image-slider .md-image-slider').forEach(s => {
    // Allready done?
    if (s.parentNode.classList.contains('md-done')) return;
    s.parentNode.classList.add('md-done')
    // Down
    s.addEventListener('pointerdown', (e) => {
      // Prevent elt dragging
      e.preventDefault();
      // handle move
      window.addEventListener('pointermove', onPointerMove);
      ol_ext_element.addListener(window, ['pointerup','pointercancel'], onPointerUp);
      elt = s;
      pageX = e.pageX;
      position = s.offsetLeft;
    })
    // Initial position
    setTimeout(() => clipElement(s, -1));
    // Reset position if outside
    s.parentNode.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        fullscreen(s.parentNode)
      }
      const max = s.previousElementSibling.getBoundingClientRect().width;
      if (parseInt(s.style.left) > max) {
        clipElement(s, max/2)
      }
    })
  })
}

export { prepareImageSlider }
export default mdImageSlider