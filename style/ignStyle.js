/** List of symbol form
 * @memberof ignStyle
 */
 const textFontList = {
  'sans-serif': {
    title: 'Arial',
    font: 'Arial, Helvetica, sans-serif'
  }, 
  serif: {
    title: 'Times',
    font: 'Times, Times New Roman, serif',
  },
  courier: {
    title: 'Courier',
    font: 'Courier, Courier New, monospace', 
  },
  monospace: {
    title: 'Monospace',
    font: 'Monaco, Lucida Console, monospace'
  },
  cursive: {
    title: 'Cursive',
    font: 'Brush Script MT, cursive',
  },
  comic: {
    title: 'Comic',
    font: 'Comic Sans MS, cursive',
  }
};

/** Ign style def
 * @memberof ignStyle
 * 
 */
const ignStyleDef = {
  pointRadius: {
    geom: /Point/,
    short: 'prd',
    defaultValue: 15
  },
  pointIcon: {
    geom: /Point/,
    short: 'pi',
    defaultValue: ''
  },
  pointGlyph: {
    geom: /Point/,
    short: 'pgy',
    defaultValue: 'ign-form-poi'
  },
  pointForm: {
    geom: /Point/,
    short: 'pf',
    defaultValue: 'none'
  },
  pointOffsetY: {
    geom: /Point/,
    short: 'poy',
    defaultValue: 0
  },
  pointShadow: {
    geom: /Point/,
    short: 'ps',
    defaultValue: false
  },
  symbolColor: {
    geom: /Point/,
    short: 'pic',
    defaultValue: '#0000FF'
  },
  pointColor: {
    geom: /Point/,
    short: 'pc',
    defaultValue: '#FFFFFF'
  },
  pointStrokeColor: {
    geom: /Point/,
    short: 'psc',
    defaultValue: '#FFFFFF'
  },
  pointStrokeWidth: {
    geom: /Point/,
    short: 'psw',
    defaultValue: 2
  },
  pointFrame: {
    geom: /Point/,
    short: 'pfr',
    defaultValue: ''
  },
  pointCrop: {
    geom: /Point/,
    short: 'pcp',
    defaultValue: false
  },
  pointRotation: {
    geom: /Point/,
    short: 'pr',
    defaultValue: 0
  },
  pointGradient: {
    geom: /Point/,
    short: 'pg',
    defaultValue: 0
  },

  strokeWidth: {
    geom: /LineString|Polygon/,
    short: 'sw',
    defaultValue: 2
  },
  strokeDash: {
    geom: /LineString|Polygon/,
    short: 'sd',
    defaultValue: ''
  },
  strokeArrow: {
    geom: /LineString/,
    short: 'sa',
    defaultValue: ''
  },
  strokeColor: {
    geom: /LineString|Polygon/,
    short: 'sc',
    defaultValue: '#f80'
  },

  fillColor: {
    geom: /Polygon/,
    short: 'fc',
    defaultValue: 'rgba(255,136,0,0.6)'
  },

  // Motif
  fillPattern: {
    geom: /Polygon/,
    short: 'fp',
    defaultValue: ''
  },
  sizePattern: {
    geom: /Polygon/,
    short: 'fpz',
    defaultValue: 5
  },
  spacingPattern: {
    geom: /Polygon/,
    short: 'fps',
    defaultValue: 10
  },
  anglePattern: {
    geom: /Polygon/,
    short: 'fpa',
    defaultValue: 0
  },
  offsetPattern: {
    geom: /Polygon/,
    short: 'fpo',
    defaultValue: 0
  },
  scalePattern: {
    geom: /Polygon/,
    short: 'fpx',
    defaultValue: 1
  },
  fillColorPattern: {
    geom: /Polygon/,
    short: 'fpc',
    defaultValue: 'rgba(0,0,0,0)'
  },

  zIndex: {
    geom: /Point|LineString|Polygon/,
    short: 'zi',
    defaultValue: 0
  },

  // Text
  labelAttribute: {
    geom: /Point|LineString|Polygon/,
    short: 'tla',
    defaultValue: ''
  },
  textColor: {
    geom: /Point|LineString|Polygon/,
    short: 'tc',
    defaultValue: '#000'
  },
  textStyle: {
    geom: /Point|LineString|Polygon/,
    short: 'ts',
    defaultValue: 'normal'
  },
  textSize: {
    geom: /Point|LineString|Polygon/,
    short: 'tz',
    defaultValue: 12
  },
  textFont: {
    geom: /Point|LineString|Polygon/,
    short: 'tft',
    defaultValue: textFontList['sans-serif'].font
  },
  textOutlineColor: {
    geom: /Point|LineString|Polygon/,
    short: 'toc',
    defaultValue: ''
  },
  textOutlineWidth: {
    geom: /Point|LineString|Polygon/,
    short: 'tlw',
    defaultValue: 3
  },
  textAlign: {
    geom: /Point|LineString|Polygon/,
    short: 'tal',
    defaultValue: 'left'
  },
  textBaseline: {
    geom: /Point|LineString|Polygon/,
    short: 'tbl',
    defaultValue: 'middle'
  },
  textOverflow: {
    geom: /LineString|Polygon/,
    short: 'to',
    defaultValue: false
  },
  textPlacement: {
    geom: /LineString/,
    short: 'tp',
    defaultValue: 'point'
  },

}

/** default ignStyle
 * @memberof ignStyle
 */
const defaultIgnStyle = {};
for (let k in ignStyleDef) {
  defaultIgnStyle[k] = ignStyleDef[k].defaultValue;
}

/** List of frame form
 * @memberof ignStyle
 */
const pointFrameList = {
  '': {
    title: 'sans'
  },
  default: {
    title: 'carré'
  },
  circle: {
    title: 'cercle'
  },
  anchored: {
    title: 'blason'
  },
  folio: {
    title: 'folio'
  },
}

/** List of symbol form
 * @memberof ignStyle
 */
const symbolFormList = {
  none: {
    title: 'sans'
  }, 
  circle: {
    title: 'cercle'
  },
  square: {
    title: 'carré'
  },
  lozenge: {
    title: 'losange'
  },
  hexagon: {
    title: 'hexagone',
  },
  marker: {
    title: 'marqueur', 
  },
  poi: {
    title: 'point d\'interêt',
  },
  bubble: {
    title: 'bulle',
  },
  blazon: {
    title: 'blason', 
  },
  shield: {
    title: 'bouclier', 
  },
  triangle: {
    title: 'triangle',
  },
  coma: {
    title: 'virgule',
  },
  bookmark: {
    title: 'signet',
  },
  sign: {
    title: 'panneau triangle',
  },
  ban: {
    title: 'panneau interdit'
  }
};

export { ignStyleDef, defaultIgnStyle, symbolFormList, textFontList, pointFrameList }