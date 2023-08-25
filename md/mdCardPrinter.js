/** Prepare card printer
 * @private
 */
function prepareCard(type, md) {
  // Decode params
  const param = {};
  const lines = md.split('\n');
  lines.forEach(d => {
    const i = d.indexOf(':');
    const att = d.substr(0,i);
    if (att) {
      const content = d.substr(i+1).trim();
      if (att==='description') {
        if (!param[att]) param[att] = []
        param[att].push(content)
      } else {
        param[att] = content;
      }
    }
  })
  return '<pre class="md-card-printer">' + JSON.stringify(param) + '</pre>';
}

export { prepareCard }