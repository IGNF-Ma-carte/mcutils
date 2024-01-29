/** @module version
 * @description Convert to V4 format
 */
import { layout } from "../../layout/layout";
import {asArray as ol_color_asArray} from 'ol/color'
import Geoportail from "../../layer/Geoportail";

/* Convert dummy value to bool */
function toBool(t) {
  return !!(typeof(t) === 'string' ? parseInt(t) : t);
}

/** Convert Carte options to V4 format
 * @param {} options
 */
function carteV4(options) {
  console.log(JSON.parse(JSON.stringify(options)));

  // Check version
  if (options.version > 4) return;
  // Convert
  options.version = 4.01;
  options.param.title = options.param.titre;
  // Controls
  const ctrl = options.param.controlParams
  options.controls = {
    zoom: toBool(ctrl.zoomBtn),
    scaleLine: toBool(ctrl.scaleLine),
    searchBar: toBool(ctrl.pSearchBar),
    layerSwitcher: toBool(ctrl.selectLayer),
    locate: toBool(ctrl.geoloc),
    profil: toBool(ctrl.profil),
    printDlg: toBool(ctrl.printDlg)
  }
  if (toBool(ctrl.coords)) {
    options.controls.mousePosition = {
      proj: options.param.proj.valeur,
      unit: options.param.proj.unite === 'ds' ? 'dms' : 'dec'
    }
  } else {
    options.controls.mousePosition = false;
  }
  // Legend
  //if (ctrl.legend == 1 || ctrl.legend === true) {
  if (!options.legende) options.legende = {}
  options.controls.legend = {
    title: options.legende.title || options.legende.legendtitle || 'Légende',
    visible: ctrl.legend || false,
    collapsed: options.legende.legendVisible || false,
    width: options.legende.legendWidth || 300,
    lineHeight: options.legende.lineHeight || 55,
    items: options.legende.items || options.legende.legend || []
  };
  // Clean options
  ['titre', 'status', 'controlParams', 'proj'].forEach( o => delete options.param[o] );
  delete options.legende;

  // SymbolLib
  const symbolLib = [];
  if (options.symbolLib) {
    Object.keys(options.symbolLib).forEach(s => symbolLib.push(options.symbolLib[s]));
  }
  options.symbolLib = symbolLib;

  // Layers
  options.layers.forEach((l, i) => {
    // !? BUG Rodolphe ?!
    if (l.wms && l.name==='Plan IGN niveaux de gris') {
      options.layers[i] = {
        description: Geoportail.capabilities['GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2'].desc,
        layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.NIVEAUXGRIS',
        name: l.name,
        opacity: l.opacity,
        titre: l.titre,
        type: 'Geoportail',
        visibility: l.visibility
      }
    }
  });

  console.log('CARTE:', options)
}

export { carteV4 }

/* Convert theme names
 */
function getTheme(name) {
  if (layout[name]) return name;
  else {
    const oldTheme = {
      custom: 'custom',
      gris: 'gray',
      vert: 'green',
      brun: 'braun',
      bleu: 'blue',
      violet: 'purple'
    }
    return oldTheme[name] || 'blue'
  }
}

/** Convert Carte options to V4 format
 * @param {} options
 */
function storyV4(options) {
  // Check version
  if (options.version > 4) return;
  console.log(JSON.parse(JSON.stringify(options)));

  // Convert
  options.version = 4.01;
  options.type = options.modele.type;

  options.param = {
    title: options.infos.title,
    subTitle: options.infos.subTitle,
    logo: options.infos.logo,
    showTitle: options.infos.visibility,
    description: options.infos.description,
    lon: options.cartes.lon,
    lat: options.cartes.lat,
    rot: options.cartes.rot,
    zoom: options.cartes.zoom,
    synchronize: options.cartes.synchronize
  }
  options.layout = {
    theme: getTheme(options.modele.theme),
    photo: options.photo,
    colors: [],
    voletPosition: options.volet ? options.volet.position.replace('gauche', 'left').replace('droite', 'right') : 'right',
    voletWidth: parseInt(options.volet ? options.volet.width : 0) || 250,
    compare: options.compare ? options.compare.pos : ''
  }
  if (options.modele.bColor) options.layout.colors.push(ol_color_asArray(options.modele.bColor));
  if (options.modele.fColor) options.layout.colors.push(ol_color_asArray(options.modele.fColor));
  if (options.compare) {
    options.cartes = [{
      title: options.compare.map1_titre,
      id: options.compare.map1
    }, {
      title: options.compare.map2_titre,
      id: options.compare.map2
    }];
    options.param.lon = options.compare.lon;
    options.param.lat = options.compare.lat;
    options.param.zoom = options.compare.zoom;
  } else {
    options.cartes = [{
      title: options.cartes.name,
      id: options.cartes.idUniqueIFrame
    }];
  }
  if (options.etapes) {
    options.steps = [];
    options.etapes.sort.forEach(s => {
      options.steps.push(options.etapes[s]);
    });
    options.animStep = options.etapes.anim;
  }
  options.tools = options.ifrTools;
  options.controls = {
    zoom: toBool(options.controls.zoom),
    scaleLine: toBool(options.controls.scale),
    rotation: toBool(options.controls.rotation),
    searchBar: toBool(options.controls.search),
    layerSwitcher: toBool(options.controls.lswitcher), 
    switcherModel: options.controls.switcherModel, 
    locate: toBool(options.controls.geoloc),
    profil: toBool(options.controls.profil),
    printDlg: toBool(options.ifrTools.print),
    mousePosition: toBool(options.controls.coordinates), 
    legend: options.controls.legende ?  options.controls.legende[0] : toBool(options.controls.legende)
  };
  if (options.bulle) options.bulle.type = (options.bulle.type || 'default').replace('mainPopup', '').trim();
  options.popup = {
    popup: options.bulle || { type: 'default' },
    tips: options.tooltips
  };

  if (options.type === 'onglet') {
    options.cartes = [];
    const onglets = options.onglets;
    options.tabs = [];
    onglets.sort.forEach(o => {
      options.tabs.push({
        id: onglets[o].map,
        title: onglets[o].title,
        showTitle: onglets[o].showTitle,
        description: onglets[o].content
      });
    })
  }

  ['modele', 'infos', 'volet', 'etapes', 'ifrTools', 'photo', 'bulle', 'tooltips', 'onglets'].forEach((i) => {
    delete options[i]
  });
}

export { storyV4 }
