// Add crossOrigin to legendImages
import LegendImage from 'ol-ext/legend/Image'

class LegendImageCORS extends LegendImage {
  constructor(options) {
    options = options || {};
    const src = options.src;
    delete options.src
    super(options)
    // Set CORS headers
    this.getImage().onerror = () => {
      this.dispatchEvent({ type: 'error' })
      if (typeof(options.onerror) === 'function') options.onerror();
    }
    this.getImage().crossOrigin = 'anonymous';
    this.getImage().src = options.src = src;
    this.set('src', src)
  }
}

export default LegendImageCORS