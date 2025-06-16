/** @module layout */

import { asString } from 'ol/color'
import jCSSRule from './jCSSRule'
import { darkenColor } from './jCSSRule'
import chroma from 'chroma-js'
import { color } from 'chart.js/helpers'

/* Layout color rules */
const rules = {
  '[data-role="storymap"] select': {
    'color': 'COLOR',
    'background-color': 'BGCOLOR',
  },
  '[data-role="storymap"]': { 
    'color': 'COLOR',
    'background-color': 'BGCOLOR',
  },
  '[data-role="storymap"] .tabs:before': {
    'color': 'BGCOLOR',
  },
  '[data-role="storymap"] .tabs .header > div': {
    'color': 'COLOR',
    'background-color': 'BGCOLOR',
  },
  '[data-role="storymap"] .tabs .header > div.selected': {
    'color': 'BGCOLOR',
    'background-color': 'COLOR',
  },
  '[data-role="storymap"] .volet': {
    'color': 'VOLETCOLOR',
    'background-color': 'BGVOLETCOLOR',
  },
  /* Next / prev arrows for volet (multi selection) */
  '[data-role="storymap"] .volet button.popup-prev:focus-visible, [data-role="storymap"] .volet button.popup-next:focus-visible' : {
    'color': 'BGVOLETCOLOR',
    'background-color': 'VOLETCOLOR',
  },
  '[data-role="storymap"] .ol-popup button.popup-prev, [data-role="storymap"] .ol-popup button.popup-next' : {
    'color': 'currentColor'
  },
  '[data-role="storymap"] .ol-popup button.popup-prev:focus-visible, [data-role="storymap"] .ol-popup button.popup-next:focus-visible' : {
    'color': 'BGCOLOR',
    'background-color': 'COLOR',
  },
  /*
  '[data-role="storymap"] .volet a': {
    'color': 'DARKCOLOR',
  },
  */
  '[data-role="storymap"] .volet .pages button:hover, [data-role="storymap"] .volet .pages button:focus, [data-role="storymap"] .volet .pages button.active': {
    'color': 'BGVOLETCOLOR',
    'background-color': 'VOLETCOLOR',
    'border-color': 'VOLETCOLOR'
  },
  '[data-role="storymap"] .volet .content .toc li:hover, [data-role="storymap"] .tools > div:hover': {
    'color': 'BGVOLETCOLOR',
    'background-color': 'VOLETCOLOR'  
  },
  '[data-role="storymap"] .tools > .select': {
    'color': 'BGVOLETCOLOR',
    'background-color': 'VOLETCOLOR'  
  },
  '[data-role="storymap"] .title > img': {
    'color': 'BGCOLOR' 
  },
  '[data-role="storymap"] .map button, [data-role="storymap"] .map .ol-legend button' : {
    'color': 'COLOR',
    'background-color': 'BGCOLOR_08' 
  },
  '[data-role="storymap"] .map button:focus, [data-role="storymap"] .map button:hover' : {
    'background-color': 'BGCOLOR' 
  },
  /*
  '[data-role="storymap"] .map .ol-cgu, [data-role="storymap"] .map .ol-cgu a': {
    'color': 'DARKCOLOR',
  },
  */
  '[data-role="storymap"] .ol-layerswitcher': {
    'color': 'DARKCOLOR'
  },
  '[data-role="storymap"] .ol-search li.copy': {
    'background-color': 'DARKCOLOR',
    'opacity': '.65'
  },
  '.ol-ext-print-dialog button[type="submit"], .ol-ext-print-dialog .ol-saveas select, .ol-ext-print-dialog .ol-savelegend select': {
    'background-color': 'DARKCOLOR',
    'opacity': '.65'
  },
  '.carte-info-dialog .permalink, .ol-ext-dialog.mapInfo > form .ol-buttons input:hover': {
    'background-color': 'LIGHTCOLOR',
  },
  '.ol-control.ol-bar .ol-toggle.ol-active > button, .ol-control.ol-bar .ol-toggle.ol-active button:hover': {
    'color': 'DARKCOLOR',
    'background-color': 'LIGHTCOLOR',
  },
  '.ol-control.ol-bar .ol-option-bar:before': {
    'border-color': 'transparent transparent DARKCOLOR'
  },
  '.ol-control.ol-bar .ol-control.ol-text-button div:hover, .ol-control.ol-bar .ol-control.ol-text-button > div': {
    'color': 'DARKCOLOR',
    'background-color': 'LIGHTCOLOR',
  },
  '[data-role="storymap"] .map, .ol-ext-dialog.mapInfo': {
    'color': 'DARKCOLOR'
  },
  '.ol-ext-dialog.mapInfo a': {
    'color': 'DARKCOLOR'
  }
}

/** Default layout
 */
const layout = {
  'default': [
    [255,255,255], 
    [33,33,33],
  ],
  'gray': [
    [255,255,255],
    [102, 102, 102], 
    [32, 32, 32],
    [210, 210, 210]
  ],
  'green': [
    [153, 207, 192],
    [255,255,255],
    null,
    null,
    [57,121,103],
    [206,232,227]
  ],
  'braun': [
    [54, 44, 42],
    [226, 192, 179],
    null,
    null,
    [54, 44, 42],
    [249, 242, 240]
  ],
  'blue': [
    [255,255,255],
    [51, 102, 153],
    darkenColor([51, 102, 153]),
    [185, 198, 210]
  ],
  'purple': [
    [144, 104, 190],
    [110, 211, 207],
    null,
    null,
    [144, 104, 190]
  ]
}

export { layout }
import {toHSL} from 'ol-ext/util/color'

/** Set the document layout
 * @param {Array<ol.color>|string} colors [bgColor, txtColor, darkColor, lightColor, voletColor, voletBgColor] or the name of a standard layout
 */
function setLayout(colors) {
  // Standard layout
  if (typeof(colors) === 'string') {
    colors = layout[colors];
  }
  // Reset
  if (!colors) {
    jCSSRule('*', null);
    return [[33,33,33],[255,255,255]];
  }
  // Get colors
  const bgColor = colors[0];
  let txtColor = colors[1];
  // Light correction
  if (!txtColor) {
    txtColor = chroma(bgColor).brighten(2).rgb();
    var delta = toHSL(txtColor)[2] - toHSL(bgColor)[2];
    if (toHSL(bgColor)[2] > 40 && delta < 40) {
      txtColor = chroma(bgColor).darken(2).rgb();
    } 
    if (toHSL(bgColor)[2] < 40 && delta < 40) {
      txtColor = chroma(bgColor).brighten(3).rgb();
    }
  }
  const darkColor = colors[2] || chroma(bgColor).darken(2).rgb();
  const lightColor = colors[3] || chroma(bgColor).set('hsl.l',.8).set('hsl.s',.05).rgb();
  const voletColor = colors[4] || txtColor;
  let offset = Math.min(60, (255 - Math.max(bgColor[0], bgColor[1], bgColor[2])));
  const voletBgColor = colors[5] || [Math.min(255,bgColor[0]+offset), Math.min(255,bgColor[1]+offset), Math.min(255,bgColor[2]+offset)];
  for (let i in rules) {
    const rule = Object.assign({}, rules[i]);
    const step = [5,8,10];
    for (let c in rule) {
      step.forEach( s => {
        bgColor[3] = s/10;
        let rex = new RegExp('BGCOLOR'+(s===10 ? '' : '_0'+s), 'g');
        rule[c] = rule[c].replace(rex, asString(bgColor))
        
        darkColor[3] = s/10;
        rex = new RegExp('DARKCOLOR'+(s===10 ? '' : '_0'+s), 'g');
        rule[c] = rule[c].replace(rex, asString(darkColor))

        lightColor[3] = s/10;
        rex = new RegExp('LIGHTCOLOR'+(s===10 ? '' : '_0'+s), 'g');
        rule[c] = rule[c].replace(rex, asString(lightColor))
        
        voletBgColor[3] = s/10;
        rex = new RegExp('BGVOLETCOLOR'+(s===10 ? '' : '_0'+s), 'g');
        rule[c] = rule[c].replace(rex, asString(voletBgColor))
        
        voletColor[3] = s/10;
        rex = new RegExp('VOLETCOLOR'+(s===10 ? '' : '_0'+s), 'g');
        rule[c] = rule[c].replace(rex, asString(voletColor))
        
        txtColor[3] = s/10;
        rex = new RegExp('COLOR'+(s===10 ? '' : '_0'+s), 'g');
        rule[c] = rule[c].replace(rex, asString(txtColor))
      });
    }
    jCSSRule(i, rule);
  }
  return colors;
}

export default setLayout