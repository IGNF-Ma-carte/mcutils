export default {
  "param": {
   "lon": 2.9039299200561297,
   "lat": 47.071827259052185,
   "rot": 0,
   "zoom": 5,
   "titre": "Vide",
   "description": "Pas de description",
   "status": "brouillon",
   "controlParams": {
    "limitGeo": "1",
    "zoomBtn": "1",
    "selectLayer": "1",
    "contextMap": "1",
    "legend": 1,
    "scaleLine": "1",
    "pSearchBar": "1",
    "coords": "0",
    "attribution": 1
   },
   "proj": {
    "valeur": "EPSG:4326",
    "unite": "ds"
   }
  },
  "legende": {
   "legendVisible": true,
   "legendPos": "bottom-left",
   "legendWidth": 300,
   "lineHeight": 55,
   "legendParam": {
    "width": 300,
    "lineHeight": 55
   },
   "legendtitle": "Ma légende",
   "legend": []
  },
  "layers": [
   {
    "type": "Geoportail",
    "name": "Plan IGN",
    "titre": "sans-titre",
    "visibility": true,
    "opacity": 1,
    "description": "Cartographie multi-échelles sur le territoire national, issue des bases de données vecteur de l’IGN, mis à jour régulièrement et réalisée selon un processus entièrement automatisé. Version actuellement en beta test",
    "layer": "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2"
   },{
    "type": "WMTS",
    "name": "Visualisation OCSGE Gers",
    "titre": "Visualisation OCSGE Gers",
    "visibility": true,
    "opacity": 1,
    "description": "Résultat IA aggloméré à l'ortho",
    "wmtsparam": {
      "layer": {
        "title": "Visualisation OCSGE Gers",
        "extent": [
          -35807.47268652755,
          5354917.644568233,
          136449.86583985508,
          5482201.678868297
        ],
        "abstract": "Résultat IA aggloméré à l'ortho",
        "maxResolution": 2445.98490512564
      },
      "source": {
        "url": "https://wxs-v.geo.rie.gouv.fr/geoportail/wmts?",
        "layer": "OCSGE_VISU_PYR-PNG_WM_20220602",
        "matrixSet": "PM",
        "format": "image/png",
        "projection": "EPSG:3857",
        "minZoom": 6,
        "maxZoom": 18,
        "style": "nolegend",
        "attributions": [
          "IGN"
        ],
        "crossOrigin": "anonymous",
        "wrapX": true
      },
      "data": {
        "title": "Visualisation OCSGE Gers",
        "abstract": "Résultat IA aggloméré à l'ortho",
        "legend": [
          "https://wxs-v.geo.rie.gouv.fr/static/legends/LEGEND.jpg"
        ]
      }
    }
   },
   {
    "dessin": true,
    "type": "Vector",
    "name": "Dessin",
    "titre": "sans-titre",
    "visibility": true,
    "opacity": 1,
    "popupContent": {},
    "style": {},
    "features": []
   }
  ],
  "symbolLib": {}
}
 