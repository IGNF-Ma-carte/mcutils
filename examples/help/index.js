import ol_ext_element from 'ol-ext/util/element';
import '../../Carte'
import helpDialog from "../../dialog/helpDialog";
import md from "./help.txt"

helpDialog(document.querySelector('i'), md, { title: 'Lorem Ipsum', className: 'large' });

helpDialog(document.querySelector('h1'), 'Une aide en ligne', { title: 'Aide', className: 'small' });

window.helpDialog = helpDialog;

/* Test WORKER - FORMULA * /
import ol_ext_worker from 'ol-ext/util/Worker'

const worker = new ol_ext_worker(function(e){
  let result = '';
  try {
    result = eval(e.data)
  } catch(e) {
    console.log(e.message)
    result = 'ERR'
  }
  return result;
},{
  onMessage: (result) => {
    ol_ext_element.create('DIV', { text : result, parent: document.body })
    //worker.terminate();
  }
})
worker.postMessage(`
var toto = 2 + Math.pow(2,2);
toto
`)
/**/