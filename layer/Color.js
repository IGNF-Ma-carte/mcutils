import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ'

/** A layer with a color
 * @param {Object} options
 *  @param {string} options.color
 *  @param {string} options.mode Blend mode
 *  @param {string} options.title
 *  @param {string} options.description
 */
class Color extends TileLayer {
  // Constructor
  constructor(options) {
    options = Object.assign({}, options || {});
    if (!options.maxZoom) delete options.maxZoom
    if (!options.minZoom) delete options.minZoom
    // A large tile of color
    options.source = new XYZ({
      tileSize: 5000,
      tileUrlFunction: () => {
        return this._data
      }
    })
    super(options)
    this.set('type', 'Color');
    this.setBlendMode(options.mode);
    // Set color
    this.setColor(options.color);
  }
  /** Change layer color
   * @param {string} color
   */
  setColor(color) {
    this.set('color', color);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 10;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this._data = canvas.toDataURL('image/png');
    this.getSource().refresh()
  }
}

/*
import ImageLayer from 'ol/layer/Image';
import ImageCanvas from 'ol/source/ImageCanvas'

class Color0 extends ImageLayer {
  // Constructor 
  constructor(options) {
    const canvas = document.createElement('canvas');
    options = Object.assign({}, options || {});
    if (!options.maxZoom) delete options.maxZoom
    if (!options.minZoom) delete options.minZoom
    options.source = new ImageCanvas({
      canvasFunction: (extent, reso, ration, size) => {
        canvas.width = size[0];
        canvas.height = size[1];
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = this.get('color');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return canvas
      }
    })
    super(options)
    this.set('type', 'Color');
    this.set('color', options.color);
    this.setBlendMode(options.mode);
  }
  /** Change layer color
   * @param {string} color
   * /
  setColor(color) {
    this.set('color', color);
    this.getSource().changed()
  }
}
*/

export default Color