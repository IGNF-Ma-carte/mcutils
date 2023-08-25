import openMedia from '../dialog/openMedia'

import MDEditorBase from './MDEditorBase';

/** Markdown editor
 * @fires change
 * @extends {ol_Object}
 * @param {Object} options a list of options
 *  @param {Element} options.input the textarea to use as input
 *  @param {Element} [options.output] element to use as output
 *  @param {Element} [options.data] a list of key value to replace in the markdown %key%
 *  @param {boolean} [options.minibar=true]
 *  @param {boolean} [options.scrolling=false]
 */
class MDEditor extends MDEditorBase {
  constructor(options) {
    super(options)
  }
}

/* Insert an url with a dialog
 * @param {string} text 
 * @param {*} p 
 * @private
 */
function insertMedia(text, p /*, options */) {
  openMedia({ 
    thumb: false,
    add: true,
    callback: e => {
      const elt = this.input;
      const url = e.thumb ? e.item.thumb_url : e.item.view_url;
      text = this._insertAt(text, p.start, '!(' + url.split('/').pop() + ')');
      elt.value = text;
      elt.selectionStart = elt.selectionEnd = p.start + url.length +3;
      elt.focus();
      this.refresh();
      this._onchange();
    }
  });
}

/**
 * @private
 */
MDEditor.prototype._getEditor = function(options) {
  return new MDEditor(options)
}

/** Add a new tool to the toolbar
 * @param {boolean} minibar
 */
MDEditor.prototype.setTools = function (minibar) {
  MDEditorBase.prototype.setTools.call(this, minibar);
  //
  const imgTool = this.toolbar.querySelector('.fi-image')
  // image
  this.addTool({ title:'insérer une image', icon: 'fi-galerie-image', val: '!(url)', type: 'dialog', fn: insertMedia, after: imgTool })
}

export default MDEditor
