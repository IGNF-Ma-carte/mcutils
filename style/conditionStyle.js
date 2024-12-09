/** Condition style
 * @typedef {Object} conditionStyle
 * @property {string} title 
 * @property {} condition
 * @property {} symbol
 */

class SLDDoc {
  constructor(/* options */) {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:se="http://www.opengis.net/se"></StyledLayerDescriptor>`;
    this.doc = (new DOMParser).parseFromString(xml, 'text/xml');
    this.root = this.doc.getElementsByTagName('StyledLayerDescriptor')[0];
  }
  addChild(tag, root, options) {
    if (Object.prototype.toString.call(options) !== '[object Object]') {
      options  = { value: options || '' }
    }
    const c = this.doc.createElement(tag);
    Object.keys(options).forEach(k => {
      if (k==='value') {
        c.innerHTML = options.value
      } else {
        c.setAttribute(k, options[k])
      }
    })
    root = root || this.root
    root.appendChild(c)
    return c;
  }
  serializeToString() {
    const serializer = new XMLSerializer();
    const xmlStr = serializer.serializeToString(this.doc)
    return xmlStr.replace(/ xmlns=""/g, '')
  }
}

function getOperator(op) {
  switch (op) {
    case '=': return 'PropertyIsEqualTo'
    case '!=': return 'PropertyIsNotEqualTo'
    case '<': return 'PropertyIsLessThan'
    case '<=': return 'PropertyIsLessThanOrEqualTo'
    case '>': return 'PropertyIsGreaterThan'
    case '>=': return 'PropertyIsGreaterThanOrEqualTo'
  }
}
function getNotOperator(op) {
  switch (op) {
    case '=': return 'PropertyIsNotEqualTo'
    case '!=': return 'PropertyIsEqualTo'
    case '<': return 'PropertyIsGreaterThanOrEqualTo'
    case '<=': return 'PropertyIsGreaterThan'
    case '>': return 'PropertyIsLessThanOrEqualTo'
    case '>=': return 'PropertyIsLessThan'
  }
  return 'none'
}

/** Convert condition style to SLD (for statistic layers)
 * @param {Array<conditionStyle>} con
 */
function toSLD(condStyle) {
  const doc = new SLDDoc()
  const layer = doc.addChild('NamedLayer');
  doc.addChild('Name', layer, 'Ma carte - statistique');
  const ustyle = doc.addChild('UserStyle', layer);
  doc.addChild('Name', ustyle, 'statistic');
  doc.addChild('Title', ustyle, 'statistic');
  const fstyle = doc.addChild('FeatureTypeStyle', ustyle)
  // Loop for styles
  let previousCond;
  condStyle.forEach(c => {
    const rule = doc.addChild('Rule', fstyle)
    doc.addChild('Name', rule, c.title)
    const condition = c.condition.conditions[0];
    // filter
    if (previousCond || condition.attr) {
      let filter = doc.addChild('Filter', rule, { xmlns: 'http://www.opengis.net/ogc' })
      if (previousCond) {
        if (condition.attr) filter = doc.addChild('And', filter)
        const prop = doc.addChild(getNotOperator(previousCond.op), filter)
        doc.addChild('PropertyName', prop, previousCond.attr)
        doc.addChild('Literal', prop, previousCond.val)
      }
      if (condition.attr) {
        let prop = doc.addChild(getOperator(condition.op), filter)
        doc.addChild('PropertyName', prop, condition.attr)
        doc.addChild('Literal', prop, condition.val)
      }
      previousCond = condition
    }
    // Style
    const style = c.symbol.getIgnStyle()
    switch (c.symbol.getType()) {
      case 'Point': {
        const point = doc.addChild('PointSymbolizer', rule)
        const graphic = doc.addChild('Graphic', point)
        const mark = doc.addChild('Mark', graphic)
        doc.addChild('WellKnownName', mark, 'circle')
        const fill = doc.addChild('Fill', mark);
        doc.addChild('CssParameter', fill, {
          name: 'fill',
          value: style.symbolColor
        })
        const stroke = doc.addChild('Stroke', mark);
        doc.addChild('CssParameter', stroke, {
          name: 'stroke',
          value: style.pointStrokeColor
        })
        doc.addChild('CssParameter', stroke, {
          name: 'stroke-width',
          value: style.pointStrokeWidth
        })
        doc.addChild('Size', graphic, 2 * style.pointRadius)
        doc.addChild('Rotation', graphic, style.pointRotation)
        break;
      } 
      case 'Polygon': {
        const poly = doc.addChild('PolygonSymbolizer', rule)
        if (style.fillColor) {
          const fill = doc.addChild('Fill', poly)
          doc.addChild('CssParameter', fill, {
            value: style.fillColor,
            name: 'fill'
          })
        }
        if (style.strokeWidth) {
          const stroke = doc.addChild('Stroke', poly)
          doc.addChild('CssParameter', stroke, {
            value: style.strokeColor,
            name: 'stroke'
          })
          doc.addChild('CssParameter', stroke, {
            value: style.strokeWidth,
            name: 'stroke-width'
          })
        }
      }
      break;
      default: {
        console.log('[SLD] Type is not implemented: ',c.symbol.getType())
        break;
      }
    }
  })
  
  return doc.serializeToString();
}

export { toSLD }