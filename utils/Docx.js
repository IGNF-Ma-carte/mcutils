import 'regenerator-runtime/runtime'
import {
  Document,
  Paragraph,
  HeadingLevel,
  AlignmentType,
  TextRun,
  ImageRun,
  ShadingType,
  HorizontalPositionAlign,
  ExternalHyperlink,
  Packer,
  VerticalPositionAlign,
  HorizontalPositionRelativeFrom,
  TextWrappingType,
  TextWrappingSide
} from 'docx'

/** Class to create docx file from HTML Element
 * @constructor
 */
class Docx {
  constructor() {
    this.section = {
      properties: {
        page: {
          margin: {
            top: 1 * 1000/1.76,  // 1cm
            right: 1 * 1000/1.76,
            bottom: 1 * 1000/1.76,
            left: 1 * 1000/1.76,
          },
        },
      },
      children: []
    }
  }
}

/** Convert to blob
 * @returns {Promise}
 */
Docx.prototype.toBlob = function() {
  const doc = new Document({
    sections: [ this.section ] 
  })
  return Packer.toBlob(doc)
}

/** Add a new paragraph
 * @param {string} content
 * @return {Paragraph}
 */
Docx.prototype.addParagraph = function(content) {
  const p = new Paragraph({
    children: []
  })
  this.section.children.push(p)
  if (content) {
    p.addChildElement(new TextRun({ 
      text: content
    }))
  }
  return p
}

/** Get current paragraph
 * @return {Paragraph}
 */
Docx.prototype.getParagraph = function() {
  let p = this.section.children[this.section.children.length - 1]
  if (!(p instanceof Paragraph)) {
    p = new Paragraph({
      children: []
    })
    this.section.children.push(p)
  }
  return p
}

/** Get image as docx elt
 * @param {HTMLImageElement|Canvas} img
 * @return {*}
 * @private
 */
function getImage(img) {
  // White background image
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  if (img.naturalWidth) {
    ctx.drawImage(img, 0, 0, img.naturalWidth,img.naturalHeight, 0,0, img.width, img.height);
  } else {
    ctx.drawImage(img, 0, 0);
  }

  // Convert to doc image
  const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
  const data64 = dataUrl.replace(/data:(.*);base64,/,'');
  let width, height;
  const cm = 1000 / 26.46
  const dpi = 2.54 / 96;
  if (canvas.width > canvas.height) {
    width = Math.min(19 * cm, canvas.width * dpi * cm);  // 19cm
    height = Math.round(canvas.height * width / canvas.width);
  } else {
    height = Math.min(19 * cm, canvas.height * dpi * cm);  // 19cm
    width = Math.round(canvas.width * height / canvas.height);
  }
  return {
    data: Uint8Array.from(atob(data64), c => c.charCodeAt(0)),
    transformation: {
      width: width,
      height: height
    }
  }
}

/** Add an element
 * @param {Element} elt
 */
Docx.prototype.addElement = function(elt, options) {
  if (!elt) return;
  options = options || {};
  const tag = elt.tagName
  // Add a text element
  if (!tag) {
    const p = this.getParagraph()
    p.addChildElement(new TextRun({ text: elt.textContent }))
    return;
  }
  // Add element
  switch (tag) {
    case 'EM':
    case 'STRONG':
    case 'DIV': {
      const children = elt.childNodes
      for (let i=0; i< children.length; i++) {
        this.addElement(children[i], options)
      }
      break;
    }
    case 'IMG': 
    case 'CANVAS': {
      try {
        // Try to display an image (fail if not loaded)
        let img;
        if (options.images && elt.src) {
          const image = options.images.find(i => i.img === elt);
          img = getImage(image.cors || elt)
        } else {
          img = getImage(elt)
        }
        if (options.width) {
          img.transformation = {
            width: options.width,
            height: options.height
          }
        }
        if (options.align === 'right') {
          img.floating = {
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.MARGIN,
              align: HorizontalPositionAlign.RIGHT
            },
            verticalPosition: {
              relative: HorizontalPositionRelativeFrom.MARGIN,
              align: VerticalPositionAlign.TOP
            },
            wrap: {
              type: TextWrappingType.SQUARE,
              side: TextWrappingSide.BOTH_SIDES,
            },
          }
        }
        this.section.children.push(
          new Paragraph({
            children: [
              new ImageRun(img),
            ],
            alignment: (options.align === 'right' ? undefined : AlignmentType.CENTER)
          })
        )
      } catch(e) {
        // Something went wrong => display a text
        this.section.children.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: 'IMAGE',
                bold: true,
                break: true
              }),
              new TextRun({ 
                text: (elt.src || ''),
                break: true
              }),
              new TextRun({ 
                break: true
              })
            ],
            /*
            spacing: {
              before: 2000,
              after: 2000
            },
            */
            shading: {
              type: ShadingType.DIAGONAL_STRIPE,
              color: "33FFFF",
              fill: "FF3333",
            },
            alignment: AlignmentType.CENTER
          })
        )
      }
      break;
    }
    case 'A': {
      // Add an hyperlink
      const p = this.getParagraph(this.section)
      p.addChildElement(new ExternalHyperlink({
        children: [
            new TextRun({
                text: elt.textContent,
                style: 'Hyperlink',
            }),
        ],
        link: elt.href,
      }))
      break;
    }
    case 'HR': 
    case 'BR': {
      // New paragraph
      this.addParagraph()
      break;
    }
    default: {
      // Header
      if (/H/.test(tag)) {
        const t = parseInt(tag.replace('H', ''))
        this.section.children.push(
          new Paragraph({
            children: [
              new TextRun(elt.textContent)
            ],
            heading: HeadingLevel['HEADING_' + t] || HeadingLevel.TITLE
          })
        )
        this.section.children.push(
          new Paragraph({
            children: []
          })
        )
      }
      break;
    }
  }
}

export default Docx