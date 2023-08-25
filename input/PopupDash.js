import ol_ext_element from 'ol-ext/util/element';
import PopupBase from 'ol-ext/util/input/PopupBase'

import './PopupDash.css'

/** Input to select dash lines in a popup
 * @memberof mcutils.input
 * @extends {PopupBase}
 * @param {Object} options a list of options
 *  @param {Element} options.input the input
 *  @param {boolean} [options.position='fixed'] popup position on the page
 */
class PopupDash extends PopupBase {
  constructor(options) {
    options = options || {};
    options.hidden = false;
    super(options);
  
    this.element.classList.add('ol-dash');
    this.input.pattern = '[0-9,.]*';
    this.input.type = 'text';

    // Popup
    const popelt = [];
    const dash = ['','5,5','0,5','5,5,0,5','10,5','10,5,0,5'];
    dash.forEach(d => {
      popelt.push(ol_ext_element.create('DIV', {
        html: ol_ext_element.create('DIV', {
          className: 'ol-option-'+(d.replace(/,/g,'-') || '0'),
        }),
        click: () => {
          this.setValue(d);
          this.collapse(true);
        },
        parent: this._elt.popup
      }));
    });

    // Show hash on change
    const canvas = ol_ext_element.create('CANVAS');
    this.element.append(canvas);
    canvas.width = 50;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = "butt";
    this.element.append(canvas);
    this.input.addEventListener('change', () => {
      setTimeout(() => {
        // Show elt
        popelt.forEach((e,i) => {
          e.className = (this.input.value === dash[i] ? 'selected' : '') 
        })
        // Draw canvas
        let i = 0;
        let x = 0;
        const t = this.input.value.split(',');
        if (t.length%2) t.push(0)
        ctx.clearRect(0,0,100,100);
        ctx.beginPath();
        ctx.moveTo(0,0);
        while(x<50) {
          if (i%2) {
            x += parseFloat(t[i%t.length]);
            ctx.moveTo(x,0);
          } else {
            x += (parseFloat(t[i%t.length]) || 1) + 1;
            ctx.lineTo(x,0);
          }
          i++;
        }
        ctx.stroke();
      });
    })
    this.setValue(this.input.value)
  }
}

export default PopupDash
