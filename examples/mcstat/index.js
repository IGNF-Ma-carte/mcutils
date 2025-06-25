var api = "https://macarte.ign.fr/admin/api/maps?";
var limit = 100;

function getUrl(offset) {
  args = [
    'context=atlas',
    'type=storymap', // macarte
    'limit=' + limit,
    'offset=' + (offset||0)
  ]
  return api + args.join('&')
}

var gmaps=[], maps = []
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

var result = []
function compute() {
  var m = maps.pop();
  if (m) {
    if (m.organization_id && m.share !== 'atlas') {
      compute()
      return;
    }
    var url = 'https://macarte.ign.fr/api/maps/' + m.view_id + '/file'
    fetch(url)
      .then(resp => resp.json())
      .then(json => {
        gmaps.push({
          map: m,
          data: json
        })
        var r = {
          type: json.modele.type,
          theme: json.modele.theme,
        }
        if (r.type === 'onglet') {
          r.onglet = Object.keys(json.onglets).length - 1
        }
        if (r.type === 'etape') {
          r.etape = Object.keys(json.etapes).length - 1
        }
        r.css = !!json.modele.css;
        var tools = []
        Object.keys(json.ifrTools).forEach(k => {
          if (json.ifrTools[k]) tools.push(k)
        })
        r.user_id = m.user_id
        r.tools = tools.join('-')
        r.equipe = m.organization_name;
        r.user = m.user;
        result.push(r)
        console.log(maps.length)
        compute()
      })
  } else {
    var cols = ['type','theme','onglet','etape','user','equipe','css','tools']
    var csv = cols.join(';');
    result.forEach(r => {
      csv += '\n';
      cols.forEach(c => {
        var st = (r[c]||'')
        if (st.replace) {
          csv += st.replace(/;/g,'_') + ';'
        } else {
          csv += st + ';'
        }
      })
    })
    console.log(csv)
  }
}

function getInfo(what) {
  var count = {}
  result.forEach(r => {
    count[r[what]] = (count[r[what]] || 0) + 1
  })
  var csv = '';
  Object.keys(count).forEach(k => csv += k + ';')
  csv += '\n'
  Object.keys(count).forEach(k => csv += count[k] + ';')
  console.log(csv)
}

function getTools() {
  var tools = {}
  result.forEach(r => {
    r.tools.split('-').forEach(t => {
      tools[t] = (tools[t] || 0) +1
    })
  })
  var csv = '';
  Object.keys(tools).forEach(k => csv += k + ';')
  csv += '\n'
  Object.keys(tools).forEach(k => csv += tools[k] + ';')
  console.log(csv)
}

function calcInfo(what) {
  var nb=0, total=0, tab=[], min=10000, max=-1
  result.forEach(r => {
    if (r[what]) {
      var val = r[what] || 0
      tab.push(val)
      total += val
      max = Math.max(max, val)
      min = Math.min(min, val)
      nb++;
    }
  })
  tab.sort()
  console.log(
    what
    + '\nTotal;'+total+';'+nb
    + '\nMin-max;'+min+';'+max
    + '\nMoyenne;'+(total/nb)
    + '\nMediane;'+(tab[Math.round(tab.length/2)])
  )
}

// Start
getData()