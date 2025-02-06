import '../ol/Feature'
import {asString as colorAsString} from 'ol/color'
import CircleStyle from 'ol/style/Circle';
import ol_style_FontSymbol from 'ol-ext/style/FontSymbol'

/** Transform ol/style to ignStyle
 * Get the style associated with a feature, remove it and set it an ignStyle
 * @memberof ignStyle
 * @param {Feature} f
 * @param {boolean} [reset=false] reset the feature style
 * @return {object}
 */
function style2IgnStyle(f, reset) {
  let style = f.getStyle();
  if (!style) return;
  if (typeof(style) === 'function') style = style(f);
  if (!(style instanceof Array)) style = [style];
  // reset style
  if (reset) f.setStyle(false);
  for (let i=0; i<style.length; i++) {
    if (getImageStyle(f, style[i])) break;
  }
  for (let i=0; i<style.length; i++) {
    if (getStrokeStyle(f, style[i])) break;
  }
  for (let i=0; i<style.length; i++) {
    if (getFillStyle(f, style[i])) break;
  }
  // Return ignStyle
  return f.getIgnStyle();
}

// Decode style
function getImageStyle(f, style) {
  const image = style.getImage();
  if (image) {
    if (image instanceof CircleStyle) {
      f.setIgnStyle ('pointForm', 'circle');
      f.setIgnStyle ('pointGlyph', 'ign-form-rond');
      f.setIgnStyle ('pointRadius', image.getRadius());
      f.setIgnStyle ('pointStrokeWidth', image.getStroke() ? image.getStroke().getWidth() : 0);
      f.setIgnStyle ('pointColor', colorAsString(image.getFill() ? image.getFill().getColor(): 'rgba(255,255,255,0)'));
      f.setIgnStyle ('symbolColor', f.getIgnStyle ('pointColor'));
      f.setIgnStyle ('pointStrokeColor', colorAsString(image.getStroke() ? image.getStroke().getColor() : 'rgba(255,255,255,0)'));
    } else if (image instanceof ol_style_FontSymbol) {
      f.setIgnStyle ('pointForm', 'circle');
      f.setIgnStyle ('pointGlyph', 'ign-form-rond');
      f.setIgnStyle ('pointRadius', image.getRadius());
      f.setIgnStyle ('pointStrokeWidth', image.getStroke() ? image.getStroke().getWidth() : 0);
      f.setIgnStyle ('pointColor', colorAsString(image.getFill() ? image.getFill().getColor(): 'rgba(255,255,255,0)'));
      f.setIgnStyle ('symbolColor', f.getIgnStyle ('pointColor'));
      f.setIgnStyle ('pointStrokeColor', colorAsString(image.getStroke() ? image.getStroke().getColor() : 'rgba(255,255,255,0)'));
      return true;
    } else {
      return false;
    }
    return true;
  }
  return false;
}
function getStrokeStyle(f, style) {
  const stroke = style.getStroke();
  if (stroke) {
    f.setIgnStyle('strokeWidth', stroke.getWidth());
    f.setIgnStyle('strokeColor', colorAsString(stroke.getColor()));
    return true;
  } else {
    f.setIgnStyle('strokeWidth', 0);
    f.setIgnStyle('strokeColor', 'rgba(255,255,255,0)');
    return false;
  }
}
function getFillStyle(f, style) {
  const fill = style.getFill();
  if (fill) {
    f.setIgnStyle('fillColor', colorAsString(fill.getColor()));
    return true;
  }
  return false;
}

export default style2IgnStyle
