var api = "https://macarte.ign.fr/admin/api/maps?";
var limit = 100;

function getUrl(offset) {
  args = [
    'context=atlas',
    'type=', //storymap', // macarte
    'limit=' + limit,
    'offset=' + (offset||0)
  ]
  return api + args.join('&')
}

var maps = []
function getData(offset) {
  fetch(getUrl(offset))
    .then(resp => resp.json())
    .then(json => {
      // Debug
      //json.offset = 100000;
      //
      maps = maps.concat(json.maps)
      console.log(json.offset +'/' + json.count)
      if (json.offset + limit < json.count) {
        getData(json.offset + limit);
      } else {
        compute()
      }
    })
}

var geojs, geopt;
function compute() {
  geojs = {
    type: "FeatureCollection",
    features: []
  }
  geopt = {
    type: "FeatureCollection",
    features: []
  }
  maps.forEach(m => {
    geojs.features.push({
      "type": "Feature",
      "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [m.bbox[0], m.bbox[1]],
            [m.bbox[2], m.bbox[1]],
            [m.bbox[2], m.bbox[3]],
            [m.bbox[0], m.bbox[3]],
            [m.bbox[0], m.bbox[1]]
          ]]
      },
      "properties": m
    })
    geopt.features.push({
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": [(m.bbox[0] + m.bbox[2]) / 2, (m.bbox[1] + m.bbox[3]) / 2]
      },
      "properties": m
    })
  })
  console.log(JSON.stringify(geojs))
  console.log(JSON.stringify(geopt))
}