/** @namespace JSONFile
 * @description JSON file definition
 */
/** @namespace JSONOptions
 * @description JSON file definition
 */

/** Legend control definition
 * @typedef {Object} JSONOptions.LegendControl
 * @property {string} title Legend title
 * @property {boolean} visible Is legend visible
 * @property {number} width Legend width
 * @property {number} lineHeight Legend line height
 * @property {Array<Object>} items An array of legend items
 */

/** Mouse position control definition
 * @typedef {Object} JSONOptions.MousePositionControl
 * @property {string} proj projection EPSG code
 * @property {string} unit display unit dms (degre min sec) or dec (decimal)
 */

/** List of controls in the map
 * @typedef {Object} JSONOptions.ControlParam
 * @property {boolean} zoom display zoom buttons
 * @property {boolean} scaleLine scale line
 * @property {boolean} rotation enable map rotation
 * @property {boolean} searchBar search tools
 * @property {boolean} layerSwitcher add a layer switcher
 * @property {boolean} locate add a locate button 
 * @property {boolean} printDlg add a print dialog button
 * @property {JSONOptions.MousePositionControl|boolean} mousePosition 
 * @property {JSONOptions.LegendControl|boolean} [legend=false]
 */

/** Carte file definition (.carte)
 * @typedef {Object} JSONOptions.CarteParam
 * @property {number} lon map position
 * @property {number} lat map position
 * @property {number} rot map rotation
 * @property {number} zoom map zoom
 * @property {string} title map title
 * @property {string} description map description
 */

/** 
 * @typedef {Object} JSONOptions.SymbolItem
 * @property {string} name
 * @property {string} type
 * @property {Object} style
 */

/** 
 * @typedef {Object} JSONOptions.ClusterOptions
 * @property {boolean} enabled
 * @property {number} maxZoom
 */

/** 
 * @typedef {Object} JSONOptions.PopupContentOptions
 * @property {boolean} active
 * @property {string} title
 * @property {string} desc
 * @property {string} img image url
 * @property {boolean} coord display coordinates
 */

/** 
 * @typedef {Object} JSONOptions.PopupOptions
 * @property {boolean} hover
 * @property {JSONOptions.PopupContentOptions} popupContent
 */

/** 
 * @typedef {Object} JSONOptions.LayerOption
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {string} name
 * @property {string} description
 * @property {boolean} visibility
 * @property {number} opacity
 * @property {string} copyright
 * @property {JSONOptions.ClusterOptions|boolean} [cluster=false] cluster options for type=Vector
 * @property {JSONOptions.PopupOptions} [popup|false] cluster options for type=Vector
 */

/** Ma carte JSON file format
 * @typedef {Object} JSONFile.MaCarteOptions
 * @property {number} [version=0] version.subVersion
 * @property {JSONOptions.CarteParam} param
 * @property {JSONOptions.ControlParam} controls
 * @property {Array<JSONOptions.LayerOption>} layers
 * @property {Array<JSONOptions.SymbolItem>} symbolLib
 */

/** StoryMap parameters
 * @typedef {Object} JSONOptions.StoryMapParam
 * @property {string} title
 * @property {string} subTitle
 * @property {string} logo logo url
 * @property {boolean} showTitle
 * @property {string} description
 * @property {number} lon
 * @property {number} lat
 * @property {number} rot
 * @property {number} zoom
 */

/** StoryMap JSON file format
 * @typedef {Object} JSONOptions.StoryMapCarte
 * @property {string} title
 * @property {string} id
 */

/** Layout
 * @typedef {Object} JSONOptions.LayoutParam
 * @property {string} theme
 * @property {Array<string>} colors
 * @property {string} voletPosition volet position left|right
 * @property {number} voletWidth volet width
 */

/** Step
 * @typedef {Object} JSONOptions.Step
 * @property {string} title
 * @property {boolean} showTitle
 * @property {string} content
 * @property {Array<number>} center
 * @property {number} zoom
 * @property {Array<string>} layers list of displayed layers
 * @property {Array<string>} layerIds list of displayed layers id
 */

/** Popup
 * @typedef {Object} JSONOptions.Popup
 * @property {Object} popup
 * @property {Object} tips
 */

/** TabOptions
 * @typedef {Object} JSONOptions.TabOptions
 * @property {string} id id of the storymap
 * @property {string} title
 * @property {boolean} showTitle
 * @property {string} description
 */

/** StoryMap JSON file format
 * @typedef {Object} JSONFile.StoryMapOptions
 * @property {number} [version=0] version.subVersion
 * @property {string} type StoryMap type compare|etape
 * @property {JSONOptions.StoryMapParam} param
 * @property {JSONOptions.LayoutParam} layout
 * @property {JSONOptions.ControlParam} controls
 * @property {Array<JSONOptions.StoryMapCarte>} cartes
 * @property {Array<JSONOptions.TabOptions>} tabs
 * @property {Array<JSONOptions.Step>} steps
 * @property {} tools
 * @property {JSONOptions.Popup} popup
 */