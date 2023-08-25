/* @file Patch to activate/deactivate cluster calculation */

import ol_source_Cluster from 'ol/source/Cluster'

/* prevent cluster calculation */
var c = ol_source_Cluster.prototype.cluster
ol_source_Cluster.prototype.cluster = function() {
  if (this.get('inactive')) return;
  c.call(this);
}

/* prevent cluster refresh ??? */
var r = ol_source_Cluster.prototype.refresh;
ol_source_Cluster.prototype.refresh = function () {
  if (this.get('inactive')) return;
  r.call(this);
}

export default ol_source_Cluster
