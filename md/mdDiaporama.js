import ol_ext_element from "ol-ext/util/element";

import './mdDiaporam.css'

const fscreen = ol_ext_element.create('DIV', {
  className: 'md-fullscreen-diaporama mdDiaporama',
  parent: document.body
})

/** Prepare image Slider
 * @private
 */
function prepareDiaporama(type, data) {
  // Get params
  const lines = data.split('\n');
  const atts = {
    img: [],
    title: []
  }
  //
  lines.forEach(d => {
    const i = d.indexOf(':');
    const att = d.substr(0,i);
    switch (att) {
      case 'img':
      case 'title': {
        atts[att].push(d.substr(i+1).trim());
        break;
      }
      default: {
        atts[att] = d.substr(i+1).trim();
        break;
      }
    }
  })
  // Element
  const content = ol_ext_element.create('DIV');
  const diapo = ol_ext_element.create('DIV', {
    className: 'mdDiaporama',
    'data-rotate': (atts.rotate && atts.rotate !== 'no') ? 'rotate' : '',
    style: {
      backgroundColor: atts.backgroundColor || 'unset'
    },
    parent: content
  });
  atts.img.forEach((img, i) => {
    if (img) {
      ol_ext_element.create('IMG', {
        src: img,
        className: 'diapo',
        parent: diapo
      });
      ol_ext_element.create('DIV', {
        text: atts.title[i] || '',
        title: atts.title[i] || '',
        class: 'diapo-title',
        parent: diapo
      })
    }
  })
  ol_ext_element.create('BUTTON', {
    className: 'leftButton',
    parent: diapo
  })
  ol_ext_element.create('BUTTON', {
    className: 'rightButton',
    parent: diapo
  })
  ol_ext_element.create('BUTTON', {
    className: 'closeBox',
    'data-fullscreen': atts.fullscreen || 'no',
    parent: diapo
  })
  ol_ext_element.create('BUTTON', {
    className: 'fullscreen',
    'data-fullscreen': atts.fullscreen || 'no',
    parent: diapo
  })
  return content.innerHTML;
}

/** Create image Slider from element
 * @namespace md2html
 * @param {Element} element
 */
function mdDiaporama(element) {
  element.querySelectorAll('.mdDiaporama').forEach(elt => {
    diaporama(elt)
  })
}

function diaporama(elt) {
  const rotate = elt.dataset.rotate
  const leftBt = elt.querySelector('button.leftButton')
  const rightBt = elt.querySelector('button.rightButton')
  const images = elt.querySelectorAll('img.diapo')
  const titles = elt.querySelectorAll('.diapo-title')
  function updateButton() {
    if (!rotate) {
      leftBt.dataset.visible = (currentImg === 0 ? 0 : 1)
      rightBt.dataset.visible = (currentImg === images.length-1 ? 0 : 1)
    }
  }
  let currentImg = 0;
  // next
  leftBt.addEventListener('click', () => {
    images[currentImg].dataset.visible = titles[currentImg].dataset.visible = 0;
    if (rotate) {
      currentImg = (images.length + currentImg - 1) % images.length;
      console.log(currentImg)
    } else {
      currentImg = Math.max(currentImg - 1, 0);
    }
    images[currentImg].dataset.visible = titles[currentImg].dataset.visible = 1;
    updateButton()
  })
  // prev
  rightBt.addEventListener('click', () => {
    images[currentImg].dataset.visible = titles[currentImg].dataset.visible = 0;
    if (rotate) {
      currentImg = (currentImg + 1) % images.length;
    } else {
      currentImg = Math.min(currentImg + 1, images.length-1);
    }
    images[currentImg].dataset.visible = titles[currentImg].dataset.visible = 1;
    updateButton()
  })
  // Fullscreen
  elt.querySelector('button.fullscreen').addEventListener('click', () => {
    fscreen.innerHTML = elt.innerHTML
    fscreen.style.display = 'block'
    // Show image slider
    setTimeout(() => {
      fscreen.dataset.visible = '';
      diaporama(fscreen);
    }, 200)
  })
  elt.querySelector('button.closeBox').addEventListener('click', () => {
    fscreen.innerHTML = elt.innerHTML
    fscreen.style.display = 'none'
    delete fscreen.dataset.visible;
    elt.innerHTML = ''
  })
  // Update
  images.forEach((img, i) => {
    if (img.dataset.visible === '1') currentImg = i;
  })
  updateButton()
}

export { prepareDiaporama }
export default mdDiaporama