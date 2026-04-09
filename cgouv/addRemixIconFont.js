import ol_style_FontSymbol from 'ol-ext/style/FontSymbol.js';
import font from './remix-icons-font.def.json?url&raw';

let f = font;
try {
  f = JSON.parse(font)
} catch (error) {
  console.warn(error);
}

/* Copyright (c) 2014 by Jean-Marc.Viglino [at]ign.fr
* Dual-licensed under the CeCILL-B Licence (http://www.cecill.info/)
* and the Beerware license (http://en.wikipedia.org/wiki/Beerware),
* feel free to use and abuse it in your projects (the code, not the beer ;-).
*
* Font definiton to use with fontsymbols
*/
ol_style_FontSymbol.addDefs ({
  'font': f.meta.font,
  'name': f.meta.name,
  'copyright': f.meta.copyright,
  'prefix': f.meta.prefix,
}, f.icons);