/** @module font/loadFonts
 * @description Function to check font load
 * @internal
 */
import WebFont from 'webfontloader';

/* Import fonts */
import 'font-gis/css/font-gis.css'
import '../fonts/font-awesome.min.css'
import '../fonts/evilz.css'
import '../fonts/fontign.css'
import '../fonts/fontmaki.css'
import '../fonts/fontpirate.css'
import '../fonts/fontsjjb.css'
import '../fonts/princesse.css'
import '../fonts/tools.css'

/* Load ol-ext font definitions */
import '../fonts/fontign.def'
import '../fonts/fontmaki.def'
import '../fonts/fontpirate.def'
import '../fonts/fontsjjb.def'
import '../fonts/princesse.def'
import '../fonts/fontevilz.def'
// import 'ol-ext/style/FontAwesomeDef'
import '../fonts/FontAwesome.def'

/** Chargement des fonts de Ma carte
 * @param {function|undefined} onLoadFn function called when a font is loaded
 */
function loadFonts(onLoadFn) {
  WebFont.load({
    custom: {
    families: ['FontAwesome', 'fontign', 'fontmaki', 'fontsjjb', 'pirate', 'evilz', 'princesse'],
    // urls: ['./fonts/font-awesome.min.css','./fonts/font-tools.css'],
    testStrings: {'FontAwesome': '\uf240', 'fontign': '\ue800', 'fontmaki': '\ue800',
      'fontsjjb': '\ue800', 'pirate': '\ue801', 'evilz': '\ue800'},
    },
    classes: false,
    // Fonts are loaded
    fontactive: (f) => {
      setTimeout(function() {
        if (onLoadFn) onLoadFn({ type: 'loadfont', font: f });
      });
    },
    // oops
    fontinactive: (f) => {	
      console.warn ("Can't load font: "+f);
    }
  });
}

export default loadFonts
