/**  Round coordinates
 * @param {Coordinates} coords
 * @param {number} [n=1000]
 * @returns {Coordinates}
 */
function roundCoords(coords, n) {
  n = n || 1000;
  if (typeof(coords[0]) === 'number') {
    coords[0] = Math.round(coords[0]*n) / n;
    coords[1] = Math.round(coords[1]*n) / n;
  } else {
    coords.forEach(c => roundCoords(c, n));
  }
  return coords
}

export default roundCoords