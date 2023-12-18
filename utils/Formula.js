
const ctxFn = [ 'Math', 'eval', 'parseInt', 'parseFloat', 'isNaN', 'isFinite' ]

/** Formula class safe eval. Will try to clear context to prevent injection.
 * Keep Math formula and ES6 syntax
 */
class Formula {
  constructor() {
    // Remove unecessary functions
    var keys = []
    Object.getOwnPropertyNames(window).forEach(k => {
      if (ctxFn.indexOf(k) < 0 && k !== 'Math' && /^[a-z,A-Z,$,_]/.test(k)) {
        keys.push(k)
      }
    })
    // Code to evaluate formula
    var lines = [`
    var mainFn = function(e) {
      var `+ keys.join(',') +`;
      var attr = e.data.attr;
      var result;
      try { result = eval(e.data.formula); }
      catch(e) { result = { error: e.message } }
      return result
    }
    self.addEventListener("message", function(event) {
      self.postMessage(mainFn(event));
    });`];
    this.code_ = URL.createObjectURL(new Blob(lines, { type: 'text/javascript' }));
    
  }

  /** Eval formula
   * @param {string} formula
   * @param {Object} attr list of key/value attribut 
   * @param {function} cback 
   */
  eval(formula, attr, cback) {
    // Clear attributes
    attr = JSON.parse(JSON.stringify(attr || {}))
    // Create a worker
    const worker = new Worker(this.code_);
    worker.addEventListener('message', function (e) {
      cback(e.data);
      worker.terminate();
    }.bind(this));
    // Execute
    worker.postMessage({ formula, attr })
  }
}

export default Formula