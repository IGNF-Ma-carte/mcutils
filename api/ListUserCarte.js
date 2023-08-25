
import MacarteAPI from './MacarteApi'; // eslint-disable-line no-unused-vars

import ListCarte from './ListCarte'

/** Control to display a list of Cartes
 */
class ListUserCarte extends ListCarte {
  /** Constructor 
   * @param {MacarteAPI} api
   * @param {Object} options
   */
  constructor(api, options) {
    options = options || {};
    // Show carte list
    options.context = 'profile';
    options.size = 'all';
    super(api, options);
  }
}

/** Filter the list
 * @param {Array<*>} data
 * @returns {Array<*>}
 */
ListUserCarte.prototype.filterList = function(data) {
  const res = [];
  data.forEach(d => {
    switch (this.get('filter')) {
      case 'storymap': {
        if (d.type === 'storymap') res.push(d);
        break;
      }
      case 'macarte': {
        if (d.type !== 'storymap') res.push(d);
        break;
      }
      default: {
        res.push(d);
        break;
      }
    }
  })
  return res;
};

export default ListUserCarte
