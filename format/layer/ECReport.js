/**	@copy (c) IGN - 2018 
	@author Jean-Marc VIGLINO jean-marc.viglino@ign.fr
*/
import ECReportLayer from '../../layer/ECReport.js';
import VectorStyleFormat from './VectorStyle';

/** File layer format reader/writer
 * @memberof mcutils.format.layer
 * @extends mcutils.format.Layer
 */
class ECReport extends VectorStyleFormat {
  /** Constructor 
   */
  constructor() {
    super();
  }
}

/** Read layer from param
 * @param {*} options extend layer options
 * @return {ECReportLayer} 
 */
ECReport.prototype.read = function (options) {
  if (options.type !== 'report') return false;
  const layer = new ECReportLayer(options);
  this.readOptions(layer, options);
  return this.readFeatures(layer, options);
};

/* Write layer
 * @param {VectorStyle} 
 * @return {object} source
 */
ECReport.prototype.write = function (layer) {
  if (layer.get('type') !== 'report') return null;
  const options = this.writeOptions(layer, {
    communities: layer.get('communities'),
    status: layer.get('status'),
    date: layer.get('date'),
    maxFeatures: layer.get('maxFeatures')
  });
  return this.writeFeatures(layer, options);
};

export default ECReport
