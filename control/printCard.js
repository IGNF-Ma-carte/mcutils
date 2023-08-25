import ol_ext_element from "ol-ext/util/element"

import saveAs from "../dialog/saveAs";

import Docx from '../utils/Docx'

import './printCard.css'

/* Load cors images
 * @param {Element} cards
 * @param {Object} param
 * @param {function} callback
 */
function getCors(cards, param, callback) {
  const images = [];
  // Count images
  let nb = 0;
  // When all images are loaded
  const onload = (e) => {
    nb--;
    if (nb === 0) {
      callback(images)
    }
    e.preventDefault();
    e.stopPropagation()
  }
  // Images in param
  ['logo'].forEach(i => {
    if (param[i]) {
      const image = new Image;
      image.crossOrigin = 'anonymous';
      nb++;
      ol_ext_element.addListener(image, ['load', 'error'], onload);
      image.src = param.logo
      param.logo = image;
    }
  })
  // Images in elements
  cards.forEach(c => {
    c.querySelectorAll('IMG').forEach(img => {
      const image = new Image;
      image.crossOrigin = 'anonymous';
      images.push({
        img: img,
        cors: image
      })
      nb++;
      ol_ext_element.addListener(image, ['load', 'error'], onload)
      // Load
      try {
        image.src = img.src
      } catch(e) { /* ok */ }
    })
  })
  if (nb === 0) {
    callback(images)
  }
}

/** Print the card and the map and save as docx file
 * @param {Array<Element>} cards
 * @param {StoryMap} story
 * @private
 */
function doPrint(cards, story) {
  const doc = new Docx();
  // Get parametres
  let param 
  try {
    param = JSON.parse(cards[0].querySelector('.md-card-printer').innerText)
    if (param.title === '%DOCUMENT%') param.title = story.get('title')
  } catch(e) {
    param = { 
      type: 'md',
      title: story.get('title'),
      map: 1
    }
  }
  // Get CORS images
  getCors(cards, param, images => {
    // Get map image
    story.print(0, canvas => {
      if (param.title) {
        doc.addElement(ol_ext_element.create('H1', { text: param.title }))
      }
      // Getlogo
      if (param.logo && param.logo.naturalHeight) {
        const ratio = param.logo.naturalWidth / param.logo.naturalHeight
        let width, height
        if (param.logo.naturalWidth > param.logo.naturalHeight) {
          width = 100 
          height = 100 / ratio
        } else {
          width = ratio * 100
          height = 100
        }
        doc.addElement(param.logo, { width: width, height: height, align: 'right' })
        doc.addParagraph()
        doc.addParagraph()
      }
      if (param.description) {
        param.description.forEach(i => {
          doc.addParagraph(i)
        })
      }
      if (param.map) {
        doc.addElement(canvas)
      }
      // Get card content
      cards.forEach(card => {
        doc.addElement(card.children[0], { images: images })
      })
      // SaveAs
      doc.toBlob().then((blob) => {
        // Title
        let fileName = story.get('title') 
        if (story.get('model') === 'etape') fileName += ' - ' + (story.currentStep+1)
        saveAs(blob, {
          title: 'Enregistrer la fiche',
          fileName: fileName,
          types: [ 'docx' ]
        })
      });
    });
  })
}

/** Add a print card control
 * @memberof mcutils.control
 * @param {Element} card
 * @param {StoryMap} story
 */
function printCard(cards, story) {
  ol_ext_element.create('DIV', {
    className: 'printCard',
    title: 'exporter la fiche...',
    html: ol_ext_element.create('A', {
      click: () => doPrint(cards, story),
    }),
    parent: cards[0]
  })
}

export default printCard