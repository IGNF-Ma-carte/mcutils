import { unByKey } from 'ol/observable';
import { fromLonLat } from 'ol/proj';
import Carte from '../Carte';
import BaseFormat from './Base';
import { storyV4 } from './version/toV4';
import { asString as colorAsString } from 'ol/color'
import { toLonLat } from 'ol/proj';

/** Base class for reading / writing .story
 * @memberof mcutils.format
 * @api
 */
class StoryMap extends BaseFormat {
  /** Constructor 
   */
  constructor() {
    super();
  }
}

/** Read method
 * @param {mcutils.StoryMap} story
 * @param {Object} options json object
 * @return {mcutils.StoryMap}
 */
StoryMap.prototype.read = function(story, options) {
  try {
    storyV4(options);
  } catch(e) {
    console.log('%c' + e.message, 'background: #800; color: #eee; padding: 0 10px;');
    story.dispatchEvent({ type: 'error' })
    return
  }
  console.log('V4', options)

  story.set('noStep', options.noStep);
  story.setModel(options.type);
  story.setTitle(options.param);
  story.showTitle(options.param.showTitle);
  story.set('description', options.param.description);
  story.setLogo(options.param.logo);
  story.setLayout(options.layout);
  story.setStyleSheet(options.layout.css);
  if (options.param.synchronize) story.set('synchronize', true);

  if (options.type === 'onglet') {
    story.clearTabs();
    options.tabs.forEach(o => {
      story.addTab(o);
    });
    story.dispatchEvent({
      type: 'read'
    });
  } else if (!options.cartes.length) {
    this.read2(story, options);
  } else if (!options.cartes.carte) {
    // Load carte
    const nb = options.cartes.length;
    let loaded = 0;
    options.cartes.forEach((c) => {
      c.carte = new Carte({
        key: story.get('key'),
        //id: c.id
      });
      const readListener = c.carte.once('read', () => {
        unByKey(errorListener);
        loaded++;
        // All cartes are loaded
        if (loaded === nb) {
          this.read2(story, options);
        }
      });
      const errorListener = c.carte.once('error', (e) => {
        unByKey(readListener);
        setTimeout(() => story.dispatchEvent(e));
      });
      c.carte.load(c.id || '');
    });
    return;
  }
}

/** Read StoryMap when maps are ready
 * @private
 */
StoryMap.prototype.read2 = function(story, options) {
  // Read StoryMap
  story.setCarte(options.cartes[0] ? options.cartes[0].carte : null);
  story.setCarte(options.cartes[1] ? options.cartes[1].carte : null, 1);
  story.setControls(options.controls);

  story.setPopup(options.popup.popup);
  story.setTips(options.popup.tips);

  const carte = story.cartes[0];

  // Map position
  if (carte) {
    carte.map.getView().setCenter(fromLonLat([options.param.lon, options.param.lat]));
    carte.map.getView().setZoom(options.param.zoom);
    carte.map.getView().setRotation(options.param.rot);
  }

  // Map title
  if (options.type === 'compare') {
    story.setTitle({ title1: options.cartes[0] ? options.cartes[0].title : '' })
    story.setTitle({ title2: options.cartes[1] ? options.cartes[1].title : '' })
    const layers = [
      options.cartes[0] ? options.cartes[0].layers : false,
      options.cartes[1] ? options.cartes[1].layers : false
    ]
    story.set('compareLayer', layers);
    [0,1].forEach(i => {
      const c = story.cartes[i];
      if (c && layers[i]) {
        c.getMap().getLayers().forEach(l => {
          l.setVisible(layers[i].indexOf(l.get('id')) > -1)
        })
      }
    })
  }

  // iFrame tools
  story.set('tools', options.tools);

  // Map position
  /*
  carte.map.getView().setCenter(fromLonLat([options.param.lon, options.param.lat]));
  carte.map.getView().setZoom(options.param.zoom);
  carte.map.getView().setRotation(options.param.rot);
  */

  // Etape
  story.set('animStep', options.animStep)
  const steps = story.getSteps();
  steps.clear();
  if (options.type === 'etape' && story.getCarte()) {
    const layers = story.getCarte().getMap().getLayers();
    options.steps.forEach(s => {
      steps.push(s);
      // Convert layer name to layerIds
      if (!s.layerIds) {
        s.layerIds = [];
        s.layers.forEach((name) => {
          layers.forEach((l) => {
            if (l.get('title') === name) {
              s.layerIds.push(l.get('id'));
            }
          })
        })
      }
    });
  }

  // Model differentiel: get selection info
  if (options.select) {
    story.setSelectColor('select1', options.select.colors[0]);
    story.setSelectColor('select2', options.select.colors[1]);
    story.setLayerSelection(options.select.selectTitle, options.select.layers)
    story.setIndicators(options.select.indicators);
  }

  // Story read
  story.dispatchEvent({
    type: 'read'
  });

  return story;
}

/** Write method
 * @param {mcutils/StoryMap} story
 * @return {Object} json object
 */
StoryMap.prototype.write = function(story) {
  const options = {
    etapes: {}
  };

  // Steps
  if (story.getSteps().getLength()) {
    const layers = story.getCarte().getMap().getLayers().getArray();
    story.getSteps().forEach((s,i) => {
      s.layers = [];
      s.layerIds.forEach(lid => {
        const l = layers.find((layer) => layer.get('id') === lid);
        if (l) {
          s.layers.push(l.get('title') || l.get('name'))
        }
      })
      options.etapes['step_'+i] = s;
    })
  }
  options.etapes.sort = Object.keys(options.etapes);
  options.etapes.anim = !!story.get('animStep');
  if (story.get('model')==='etape') {
    options.noStep = !!story.get('noStep');
  }

  // Bulles
  options.bulle = story.get('popup');
  // Bulles
  options.tooltips = story.get('tips');
  // Controls
  options.controls = {
    coordinates: story.hasControl('mousePosition'),
    search: story.hasControl('searchBar'),
    geoloc: story.hasControl('locate'),
    global: false,
    legende: [story.hasControl('legend'), false],
    profil: story.hasControl('profil'),
    lswitcher: story.hasControl('layerSwitcher'),
    switcherModel: story.get('controls').switcherModel,
    rotation: story.get('controls').rotation,
    scale: story.hasControl('scaleLine'),
    zoom: story.hasControl('zoom'),
  }
  // Tools
  const tools = story.get('tools') || {};
  options.ifrTools = {
    options: !!tools.options, 
    print: story.hasControl('printDlg'), 
    import: !!tools.import, 
    measure: !!tools.measure, 
    draw: !!tools.draw
  }
  // Info
  options.infos = {
    description: story.get('description'),
    logo: story.get('logo'),
    nomCarte: story.get('title'),
    subTitle: story.get('subTitle'),
    title: story.get('title'),
    visibility: (story.target.dataset.title !== 'hidden')
  }

  // Volet
  if (story.models[story.get('model') || 'standard'].volet) {
    options.volet = {
      position: story.get('voletPosition').replace('left', 'gauche').replace('right', 'droite'),
      width: story.get('voletWidth')
    }
  }
  // Theme
  const theme = typeof(story.get('colors') || 'default') === 'string' ? story.get('colors') : 'custom';
  // Model
  options.modele =  {
    type: story.get('model'), 
    theme: theme, 
    css: story.get('css') || '',
    optimobile: false
  }
  if (theme === 'custom') {
    options.modele.bColor = colorAsString(story.get('colors')[0]);
    options.modele.fColor = colorAsString(story.get('colors')[1]);
  }
  // Model differentiel: get selection info
  if (story.get('model') === 'differentiel') {
    options.select = {
      colors: [
        colorAsString(story.getSelectColor('select1')), 
        colorAsString(story.getSelectColor('select2'))
      ],
      selectTitle: story.get('selectTitle') || '',
      layers: !!story.get('layers'),
      indicators: story.getIndicators().getArray()
    }
  }
  // Cartes / onglets
  switch (story.get('model')) {
    case 'onglet': {
      options.onglets = {};
      story.tabs.forEach((tab, i) => {
        options.onglets['tab_'+i] = {
          content: tab.description,
          map: tab.view_id,
          showTitle: tab.showTitle,
          tabName: 'tab_'+i,
          title: tab.title,
          type: tab.type === 'storymap' ? 1 : 0
        }
      })
      options.onglets.sort = Object.keys(options.onglets);
      options.cartes = {
        lon: 2, 
        lat: 47, 
        rot: 0, 
        zoom: 5,
        synchronize: story.get('synchronize')
      }
      break;
    }
    case 'compare':
    case 'compareVisio':
    case 'compareRLT': {
      delete options.etapes;
      const lonlat = toLonLat(story.getCarte().getMap().getView().getCenter());
      options.cartes = {
        lon: lonlat[0],
        lat: lonlat[1],
        rot: 0,
        zoom: story.getCarte().getMap().getView().getZoom(),
      };
      options.compare = {
        lon: lonlat[0],
        lat: lonlat[1],
        rot: story.getCarte().getMap().getView().getRotation(),
        zoom: story.getCarte().getMap().getView().getZoom(),
        map1: story.getCarte(0).get('id'),
        map1_titre: story.get('title1'),
        layer1: story.get('compareLayer') ? story.get('compareLayer')[0] : false,
        map2: story.getCarte(1).get('id'),
        map2_titre: story.get('title2'),
        layer2: story.get('compareLayer') ? story.get('compareLayer')[1] : false,
        pos: "ver",
      }
      break;
    }
    default: {
      const lonlat = toLonLat(story.getCarte().getMap().getView().getCenter());
      options.cartes = {
        idUniqueIFrame: story.getCarte().get('id'),
        lon: lonlat[0],
        lat: lonlat[1],
        name: story.getCarte().getMap().get('title'),
        rot: story.getCarte().getMap().getView().getRotation(),
        zoom: story.getCarte().getMap().getView().getZoom()
      };
    }
  }
  // console.log('SAVE', options)
  return options;
}

export default StoryMap
