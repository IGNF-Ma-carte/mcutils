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
/* Test Function clear context */
'use strict'

const ctxFn = [ 'eval', 'Math', 'parseInt', 'parseFloat', 'isNaN', 'isFinite']
function getFormula() {
  // Remove context
  const keys = ['attr', 'code']
  Object.getOwnPropertyNames(window).forEach(k => {
    if (ctxFn.indexOf(k)<0 && /^[a-z,A-Z,$,_]/.test(k)) {
      keys.push(k)
    } else {
      console.log(k)
    }
  })
  // New function without context
  const fn = (new Function(...keys, `
    attr = arguments[0]; 
    code = arguments[1];
    // remove constructor and run
    arguments = constructor = undefined;
    return eval(code)
  `)).bind({})

  return function(attr, code) {
    let result;
    try {
      // Clear attributes
      attr = JSON.parse(JSON.stringify(attr || {}))
      // Run code
      result = fn(attr, code )
    } catch(e) {
      console.log(e.message)
      result = 'ERR';
    }
    return result
  }
}
window.getFormula = getFormula
/* run
getFormula()(
  {x:12, y:15}, `
var res = attr.x + attr.y; 
res
`)
*/
/*
https://github.com/NeilFraser/JS-Interpreter
https://github.com/hacksparrow/safe-eval
*/
getFormula()(
  {x:12, y:15}, `
Math.sqrt(attr.x) + attr.y;
`)