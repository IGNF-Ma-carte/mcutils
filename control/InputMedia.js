import ol_ext_element from 'ol-ext/util/element';
import ol_Object from 'ol/Object'
import { getMediaURL } from '../api/serviceURL';
import openMedia from '../dialog/openMedia'

import './InputMedia.css'


/** Input to select media in a dialog
 * @memberof mcutils.control
 * @fires load
 * @extends {ol/Object}
 * @param {Object} options a list of options
 *  @param {Element} [options.input] if none create one in the parent option
 *  @param {Element} [options.parent] parent to place the input if no input option
 *  @param {string} [options.placeholder=Url de l'image]
 *  @param {string} [options.btnTitle=Rechercher dans la galerie] button title
 *  @param {boolean} [options.fullpath=false] return fullpath url
 *  @param {boolean} [options.useCors=false] check if image support crossOrigin
 *  @param {boolean} [options.thumb=false] thumbnail default checkbox value
 *  @param {boolean} [options.add=false] add button to add a new image to the lib
 */
class InputMedia extends ol_Object {
  constructor(options) {
    options = options || {};
    super(options);
    this.input = options.input || ol_ext_element.create('INPUT', {
      type: 'url',
      parent: options.parent
    })
    this.input.placeholder = options.placeholder || 'Url de l\'image';
    this.input.type = 'text';
    this.value = this.input.value;
    this.set('fullpath', options.fullpath);
    // Encapsulate
    const content = this.element = ol_ext_element.create('DIV', {
      className: 'mc-input-media'
    })
    this.input.parentNode.insertBefore(content, this.input);
    this._imgDiv = ol_ext_element.create('DIV', {
      className: 'mc-img',
      parent: content
    })
    const img = this._img = new Image;
    img.onerror = () => {
      content.classList.remove('loading');
      this._imgDiv.style['background-image'] = ''
      if (this.input.value) this.input.classList.add('invalid');
      else this.input.classList.remove('invalid');
      this.value = '';
      this.dispatchEvent({ type: 'load', value: this.value, error: true });
    }
    img.onload = () => {
      content.classList.remove('loading');
      this._imgDiv.style['background-image'] = 'url(' + img.src + ')';
      this.value = img.src;
      this.input.classList.remove('invalid');
      // Check CORS
      this.set('crossOrigin', false)
      if (options.useCors) {
        const corimg = new Image;
        corimg.crossOrigin = 'anonymous';
        // Loaded
        corimg.onload = () => {
          this.set('crossOrigin', 'anonymous')
          this.dispatchEvent({ type: 'load', value: this.value });
        }
        corimg.onerror = () => {
          this.dispatchEvent({ type: 'load', value: this.value });
        }
        corimg.src = img.src;
      } else {
        this.dispatchEvent({ type: 'load', value: this.value });
      }
    }
    if (this.value) {
      img.src = getMediaURL(this.value);
    }
    // Add input after
    content.appendChild(this.input);
    this.input.addEventListener('change', () => {
      this.setValue(this.input.value);
      this.value = '';
      delButton.style.display = (this.input.value ?  '' : 'none');
    })
    this.input.addEventListener('keyup', () => {
      delButton.style.display = (this.input.value ?  '' : 'none');
    })
    // Add delete button
    const delButton = ol_ext_element.create('BUTTON', {
      className: 'delete',
      type: 'button',
      style: { display: (this.input.value ?  '' : 'none') },
      title: options.btnTitle || 'Chercher dans la galerie...',
      html: '<i class="fa fa-times"></i>',
      click: () => {
        this.value = 'del';
        this.setValue('');
        this.input.focus();
      },
      parent: content
    });
    // Add user media button
    let thumb = options.thumb;
    ol_ext_element.create('BUTTON', {
      className: 'button-colored user-media',
      type: 'button',
      title: options.btnTitle || 'Chercher dans la galerie...',
      html: '<i class="fi-galerie-image"></i>',
      click: () => {
        openMedia({
          thumb: thumb,
          add: options.add,
          callback: (e) => {
            thumb = e.thumb;
            const url =  (e.thumb ? e.item.thumb_url : e.item.view_url);
            if (this.get('fullpath')) {
              this.setValue(url);
            } else {
              this.setValue(url.split('/').pop());
            }
          }
        })
      },
      parent: content
    })
  }
}

/** Get media url
 * @return {string}
 */
InputMedia.prototype.getValue = function () {
  return this.input.value;
}

/** Get media url
 * @return {string}
 */
InputMedia.prototype.setValue = function (value) {
  if (this.value !== value) {
    this.value = value;
    this.element.classList.add('loading');
    this.input.value = value;
    this._img.src = getMediaURL(value);
    this.input.dispatchEvent(new Event('change'));
  }
}

export default InputMedia
