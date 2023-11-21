import XYZ from 'ol/source/XYZ'
import TileLayer from 'ol/layer/Tile';
import 'ol-ext/filter/Crop'

class Color extends TileLayer {
  /** Constructor 
   */
  constructor(options) {
    super({
      title: options.title,
      source: new XYZ
    })
    this.set('type', 'Color');
    this.set('color', options.color);
    this.setBlendMode(options.mode);
    this.on(['precompose','prerender'], e => {
      const ctx = e.context;
      const canvas = e.context.canvas;
      ctx.fillStyle = this.get('color');
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    })
  }
}

export default Color