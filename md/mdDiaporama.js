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
  console.log(type, data)
  // Get params
  const lines = data.split('\n');
  const atts = {
    img: []
  }
  //
  lines.forEach(d => {
    const i = d.indexOf(':');
    const att = d.substr(0,i);
    if (att==='img') {
      atts.img.push(d.substr(i+1).trim());
    } else {
      atts[d.substr(0,i)] = d.substr(i+1).trim();
    }
  })
  console.log(atts)
  // Element
  const content = ol_ext_element.create('DIV');
  const diapo = ol_ext_element.create('DIV', {
    className: 'mdDiaporama',
    parent: content
  });
  atts.img.forEach(img => {
    ol_ext_element.create('IMG', {
      src: img,
      className: 'diapo',
      parent: diapo
    });
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
    parent: diapo
  })
  ol_ext_element.create('BUTTON', {
    className: 'fullscreen',
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
  const leftBt = elt.querySelector('button.leftButton')
  const rightBt = elt.querySelector('button.rightButton')
  const images = elt.querySelectorAll('img.diapo')
  function updateButton() {
    leftBt.dataset.visible = (currentImg === 0 ? 0 : 1)
    rightBt.dataset.visible = (currentImg === images.length-1 ? 0 : 1)
  }
  let currentImg = 0;
  // next
  leftBt.addEventListener('click', () => {
    images[currentImg].dataset.visible = 0;
    currentImg = Math.max(currentImg-1, 0);
    images[currentImg].dataset.visible = 1;
    updateButton()
  })
  // prev
  rightBt.addEventListener('click', () => {
    images[currentImg].dataset.visible = 0;
    currentImg = Math.min(currentImg+1, images.length-1);
    images[currentImg].dataset.visible = 1;
    updateButton()
  })
  // Fullscreen
  elt.querySelector('button.fullscreen').addEventListener('click', () => {
    fscreen.innerHTML = elt.innerHTML
    // Show image slider
    setTimeout(() => {
      fscreen.dataset.visible = '';
      diaporama(fscreen);
    }, 200)
  })
  elt.querySelector('button.closeBox').addEventListener('click', () => {
    fscreen.innerHTML = elt.innerHTML
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