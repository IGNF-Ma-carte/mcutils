import ol_ext_element from 'ol-ext/util/element'
import mcutil from '../../package.json'
import {VERSION as olversion} from 'ol/util'
import mbstyle from 'ol-mapbox-style/package.json'
import maplibre from 'maplibre-gl/package.json'
import chartjs from 'chart.js/package.json'
import maplibre_layer from '@geoblocks/ol-maplibre-layer/package.json'
import proj4 from 'proj4/package.json'

import './versions.scss'

const body = document.body
ol_ext_element.create('H2', {
  html: mcutil.name + ' v.' + mcutil.version,
  parent: body
})

const ul = ol_ext_element.create('DL', {
  parent: body
})

function showInfo(data, info) {
  ol_ext_element.create('DT', {
    html: (info || data.name),
    parent: ul
  })
  ol_ext_element.create('DD', {
    html: 'v.' + (data.version || data),
    parent: ul
  })
}

// Infos
showInfo(olversion, 'Openlayers')
showInfo(mbstyle)
showInfo(maplibre)
showInfo(maplibre_layer)
showInfo(proj4)
showInfo(chartjs)

// Display project info
console.log(
  '%cMa carte %cby IGN\n%c' + mcutil.name + '%c v.' + mcutil.version ,
  "font-size: 34px;",
  "font-size: 24px; color: #333;",
  "font-size: 24px; color: brown;",
  "color: #333; font-weight: bold;"
)