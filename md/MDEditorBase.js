import ol_ext_element from 'ol-ext/util/element';
import ol_Object from 'ol/Object'
import md2html from "./md2html";
import ColorInput from 'ol-ext/util/input/Color';
import {asArray} from 'ol/color'
import {toHexa} from 'ol-ext/util/color'
import {showHelp} from "../dialog/helpDialog";

import Dialog from 'ol-ext/control/Dialog'
import fakeMap from '../dialog/fakeMap';

import dlog from './mdeDialog'
import icons from './mdeIcon'
import blueskydlog from './mdeBluesky'

import './MDEditor.css'
import '../font/loadFonts'
import mdHelpFormat from './help/format.txt'
import mdHelpList from './help/list.txt'
import mdHelpMedia from './help/media.txt'
import mdHelpAttr from './help/attr.txt'
import mdHelpWidget from './help/widget.txt'
import mdHelpQCM from './help/qcm.txt'

// Full page dialog
const fullDialog = new Dialog({ 
  className: 'md fullMD',
  closeBox: true,
  target: document.body
});
fullDialog.setMap(fakeMap);

// Editor dialogs
const dialog = new Dialog({ 
  className: 'mdedit',
  closeBox: true,
  target: document.body
});
dialog.setMap(fakeMap);

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
class MDEditorBase extends ol_Object {
  constructor(options) {
    options = options || {};
    super(options);
    this.input = options.input;
    if (options.input.tagName !== 'TEXTAREA') {
      throw 'Bad element tag for MD '+options.input.tagName;
    }
    this.input.dataset.markdown = '';
    this.output = options.output || ol_ext_element.create('DIV');
    this.data = options.data || {};
    this.params = {
      shiftTitle: options.shiftTitle,
      edugeo: options.edugeo,
    }
    this.hit = 0;
    // Handle special char
    this.input.addEventListener('keydown', (e) => {
      switch (e.keyCode) {
        // Prevent tab default behavior
        case 9: {
          if (e.shiftKey) {
            const text = this.input.value;
            const start = this.input.selectionStart;
            const startnl = text.lastIndexOf('\n', start-1)+1;
            if (text.substr(startnl, 1) === '\t') {
              this.input.value = removeAt(text, startnl, 1);
              this.input.selectionStart = this.input.selectionEnd = start -1;
            } else {
              if (text.substr(startnl, 3) === '  *') {
                this.input.value = removeAt(text, startnl, 2);
                this.input.selectionStart = this.input.selectionEnd = start -2;
              }
            }
          } else {
            this.edit({ val: '\t', type: 'insert' })
          }
          e.preventDefault();
          break;
        }
        // Shift +  Suppr = remove line + copy
        case 46: {
          if (e.shiftKey) {
            const text = this.input.value;
            const start = this.input.selectionStart;
            const startnl = text.lastIndexOf('\n', start-1)+1;
            let endnl = text.indexOf('\n', start)+1;
            if (endnl===0) endnl = this.input.value.length;
            navigator.clipboard.writeText(text.substr(startnl, endnl-startnl));
            this.input.value = removeAt(text, startnl, endnl-startnl);
            this.input.selectionStart = this.input.selectionEnd = startnl;
          }
          break;
        }
        default: break; 
      }
    });

    // Sync scroll
    this.set('scrolling', options.scrolling);
    let inputTout, scrollingInput = false;
    let outputTout, scrollingOutput = false;
    this.input.addEventListener('scroll', () => {
      if (this.get('scrolling') && !this._tout && !scrollingOutput) {
        scrollingInput = true;
        this.output.scrollTop = this.input.scrollTop / (this.input.scrollHeight - this.input.clientHeight) * (this.output.scrollHeight - this.output.clientHeight);
        // console.log(this.input.scrollTop / (this.input.scrollHeight - this.input.clientHeight))
        clearTimeout(inputTout);
        inputTout = setTimeout(() => scrollingInput = false, 100 );
      }
    });
    this.output.addEventListener('scroll', () => {
      if (this.get('scrolling') && !scrollingInput) {
        scrollingOutput = true;
        this.input.scrollTop = this.output.scrollTop / (this.output.scrollHeight - this.output.clientHeight) * (this.input.scrollHeight - this.input.clientHeight);
        clearTimeout(outputTout);
        outputTout = setTimeout(() => scrollingOutput = false, 100 );
      }
    });

    // Handle lists
    this.input.addEventListener('keyup', (e) => {
      this._testul(e, '* ') || this._testul(e, '  * ') 
      || this._testul(e, '1. ') || this._testul(e, '    ')
      || this._testul(e, '>') || this._testul(e, '\t');
    });

    // Wrap "" , '' , [], {} and ()
    this.input.addEventListener('keydown', (e) => {
      switch (e.key) {
        case '[': this.wrap('[]', e); break;
        case '{': this.wrap('{}', e); break;
        case '(': this.wrap('()', e); break;
        case '\'':
        case '`':
        case '"': {
          if (this.input.selectionStart === this.input.selectionEnd 
            && this.charAt(this.input.selectionStart-1) === e.key) {
            break;
          } else if (this.charAt() === e.key) {
            e.preventDefault();
            this.input.selectionStart = this.input.selectionEnd = this.input.selectionStart+1;
          } else {
            this.wrap(e.key+e.key, e);
          } 
          break;
        }
        case ']': 
        case '}': 
        case ')': {
          if (this.charAt() === e.key) {
            e.preventDefault();
            this.input.selectionStart = this.input.selectionEnd = this.input.selectionStart+1;
          }
        }
      }
      if (e.keyCode === 8) {
        const elt = this.input;
        const start = elt.selectionStart;
        const end = elt.selectionEnd;
        if (start === end) {
          let text = elt.value;
          if ((text.charAt(start-1)==='(' && text.charAt(start)===')')
            || (text.charAt(start-1)==='{' && text.charAt(start)==='}') 
            || (text.charAt(start-1)==='[' && text.charAt(start)===']') 
            || (text.charAt(start-1)==='"' && text.charAt(start)==='"') 
            || (text.charAt(start-1)==='`' && text.charAt(start)==='`') 
            || (text.charAt(start-1)==='\'' && text.charAt(start)==='\'') 
          ) {
            text = removeAt(text, start-1, 2);
            elt.value = text;
            e.preventDefault();
            elt.selectionStart = elt.selectionEnd = start-1;
          }
        }
      }
    });

    // Refresh
    this.input.addEventListener('keyup', (e) => {
      if (e.keyCode===13 || e.keyCode===8 || e.keyCode===32 || (e.keyCode>40 && e.keyCode<250)) {
        this.refresh();
      } else {
        // console.log('prevent', e.keyCode)
      }
      //console.log(e.keyCode)
    });
    this.input.addEventListener('change', () => {
      this.refresh ();
    });

    this._handleUndo();

    // Add toolbar
    this.toolbar = ol_ext_element.create('DIV', {
      className: 'md-toolbar'
    });
    this.input.parentNode.insertBefore(this.toolbar, this.input);
    // Add tools
    this.setTools(options.minibar !== false);
    // Refresh
    if (this.output) this.refresh();
  }
}

/** Set dialog class name 
 * @param {string} className
 */
MDEditorBase.prototype.setDialogClassName = function(className) {
  fullDialog.set('className', ((className || '') + ' fullMD ol-ext-dialog').trim());
};

/** Get char at
 * @param {number} n index
 */
MDEditorBase.prototype.charAt = function(n) {
  if (n===undefined) n = this.input.selectionStart;
  return this.input.value.charAt(n);
};

/** Wrap char
 * @param {string} st a 2 char length string
 * @param {Event} e
 */
MDEditorBase.prototype.wrap = function(st, e) {
  const start = this.input.selectionStart;
  const end = this.input.selectionEnd;
  if (start === end && !/[ |\t|\n]/.test(this.input.value.charAt(this.input.selectionStart-1))) return;
  this.edit({ val: st[0], valend: st[1], type: 'selection' });
  if (e) e.preventDefault();
};

/** Refresh output (with delay)
 */
MDEditorBase.prototype.refresh = function(immediate) {
  if (this._tout) clearTimeout(this._tout);
  this._tout = setTimeout ( () => {
    md2html.element(this.input.value, this.output, this.data, this.params);
    if (this.get('scrolling') && this.input.scrollHeight < this.input.clientHeight) {
      this.output.scrollTop = this.input.scrollTop / (this.input.scrollHeight - this.input.clientHeight) * (this.output.scrollHeight - this.output.clientHeight);
    }
    this.dispatchEvent('change');
    this._tout = null;
  }, immediate ? 0 : 500);
};

/** Set the current value
 * @param {string} md
 */
MDEditorBase.prototype.setValue = function (md) {
  this.input.value = md;
  this.clearUndo();
  this.refresh();
};

/** Get the current value
 * @returns {string} md
 */
 MDEditorBase.prototype.getValue = function () {
  return this.input.value;
 }

/** Clear undo/redo
 */
MDEditorBase.prototype.clearUndo = function () {
  this._undo = [{ sel:this.input.selectionEnd, text: this.input.value }];
  this._redo = [];
  this._delay = 0;
};

/** Handle undo/redo on input
 * @private
 */
MDEditorBase.prototype._handleUndo = function() {
  this.clearUndo();
  ol_ext_element.addListener(this.input, ['change', 'keyup', 'click'], (e) => {
    const undo = this._undo;
    const redo = this._redo;
      if (e.key==='z' && e.ctrlKey) {
      if (undo.length > 1) {
        // console.log('undo', undo)
        redo.unshift(undo.shift());
        const s = undo[0];
        //$(this).val(s.text);
        this.input.value = s.text;
        this.input.selectionStart = redo[0].pos;
        this.input.selectionEnd = redo[0].pos;
        this._delay = 0;
      }
    } else if ((e.key==='Z' || e.key==='y') && e.ctrlKey) {
      if (redo.length) {
        // console.log('redo', redo)
        const s = redo.shift();
        undo.unshift(s);
        this.input.value = s.text;
        this.input.selectionStart = s.pos2;
        this.input.selectionEnd = s.pos2;
        this._delay = 0;
      }
    } else {
      this._onchange();
    }
  });
};

/** Something has change > save for undo
 */
MDEditorBase.prototype._onchange = function() {
  const undo = this._undo;
  const s = {
    pos: this._position || this.input.selectionEnd,
    pos2: this.input.selectionEnd,
    text: this.input.value
  }
  // Add undo
  if (!undo.length || undo[0].text != s.text) {
    // replace old one
    if (!undo.length || (new Date - this._delay) > 500) {
      undo.unshift(s);
    } else {
      undo[0] = s;
    }
    this._redo = [];
    // Max 200 undo
    if (undo.length > 200) undo.pop();
    this._delay = new Date;
  }
  this._position = this.input.selectionEnd;
};

/** insert val in t at pos 
 * @param {string} t string to insert to
 * @param {number} pos position
 * @param {string} val value to insert
 * @private
 */
const insertAt = MDEditorBase.prototype._insertAt = function (t, pos, val) {
  return t.substring(0, pos) + val + t.substring(pos, t.length)
}

/** Remove nb char in t at pos 
 * @param {string} t string to remove char
 * @param {number} pos position
 * @param {number} nb value to insert
 * @private
 */
 const removeAt = MDEditorBase.prototype._removeAt = function(t, pos, nb) {
  return t.substring(0, pos) + t.substring(pos+nb, t.length)
}

/** Return on list add a new line in the list
 * @param {*} e kay event
 * @param {string} v list type
 * @returns {boolean}
 * @private
 */
MDEditorBase.prototype._testul = function(e, v) {
  if (e.key !== 'Enter') return false;
  const start = this.input.selectionStart;
  let text = this.input.value;
  const startln = text.lastIndexOf('\n', start-2)+1;
  const st = text.substring(startln, startln+v.length);
  if (st===v) {
    // is a list?
    if (text.substring(startln, start-1)===v) {
      // Sublist? > down list
      if (v==='  * ') {
        text = removeAt(text, start-1, 1);
        text = removeAt(text, startln, 2);
        this.input.value = text;
        this.input.selectionStart = startln+2;
        this.input.selectionEnd = startln+2;
      } else {
        // Remove line list
        text = removeAt(text, startln, v.length+1);
        this.input.value = text;
        this.input.selectionStart = startln;
        this.input.selectionEnd = startln;
      }
    } else {
      // Insert a new line in the list
      text = insertAt(text, start, v);
      this.input.value = text;
      this.input.selectionStart = start+v.length;
      this.input.selectionEnd = start+v.length;
    }
    this._onchange();
    return true;
  }
  return false;
}

/* Insert Markdown alignement
 * @param {string} text
 * @param {*} p
 * @param {*} options
 */
function align (text, p, options) {
  var s = text.length;
  var st = text.substring(p.startln,p.startln+2);
  if (st==='|\t' || st==='|>' || st==='|<') {
    text = removeAt(text, p.startln, 2);
  }
  // Title
  if (text.substr(p.startln, 1)==='#') {
    var n = 1;
    while (text.substr(p.startln+n, 1)==='#') n++;
    if (options.val==='|\t' && text.substr(p.startln+n, 1)!=='\t') text = insertAt(text, p.startln+n, '\t');
    else if (text.substr(p.startln+n, 1)==='\t') text = removeAt(text, p.startln+n, 1);
  } else {
    text = insertAt(text, p.startln, options.val);
  }
  options.start = p.start+text.length-s;
  options.end = p.end+text.length-s;
  return text;
}

/** Insert an url with a dialog
 * @param {Element} elt 
 * @param {string} text 
 * @param {*} p 
 * @param {*} options 
 * @private
 */
function insertUrl(text, p, options) {
  const elt = this.input;
  const isTwitter = /twitter/.test(options.className);
  let t = isTwitter ? '' : text.substring(p.start,p.end);
  const rexurl = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
  // const nb = text.length;
  dialog.show({
    title: options.title[0].toUpperCase() + options.title.substring(1) ,
    className: options.className,
    content: dlog,
    buttons: { submit: 'ok', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b==='cancel') dialog.setContent(' ');
      if (b==='submit') {
        Object.keys(inputs).forEach(i => {
          i = inputs[i]
          i.classList.remove('mderror');
          inputs[i.className] = i;
        });
        if (!rexurl.test(inputs.durl.value)) {
          inputs.durl.classList.add('mderror');
          dialog.show();
          inputs.durl.focus();
          return;
        }
        // Set text
        if (t) {
          text = removeAt(text, p.start, t.length);
        }
        var sizex = inputs.width.value;
        var sizey = inputs.height.value;
        if (sizex || sizey) sizex = ' '+sizex+'x'+sizey;
        else if (inputs.mdpop.value) sizex = ' '+inputs.mdpop.value;
        var url = md2html.encodeURI(inputs.durl.value);
        // link
        let link = '(' + (url||'http://') + sizex + ')';
        if (inputs.mdalt.value) link = '[' + inputs.mdalt.value + ']' + link;
        if (/media|twitter/.test(options.className)) link = '!' + link;
        if (inputs.fullscreen.checked) link = '[' + link +'](app://fullscreen)'
        link += ' ';
        // insert
        text = insertAt(text, p.start, link);
        elt.value = text;
        // select
        elt.selectionStart = elt.selectionEnd = p.start + link.length; //text.length-nb+t.length;
        // Dispatch it.
        this.refresh();
        this._onchange();
        dialog.close();
        dialog.setContent(' ');
      }
      elt.focus();
    }
  });
  // Remove \n
  while (t.substr(-1)==='\n') {
    p.end--;
    t = text.substring(p.start,p.end);
  }
  // Input url
  const inputUrl = dialog.getContentElement().querySelector('input.durl');
  if (!isTwitter) document.getElementById('twitterURL').innerHTML = '';
  // Get 
  if (rexurl.test(t)) {
    inputUrl.value = t;
    setTimeout(function(){ dialog.getContentElement().querySelector('input.mdalt').focus(); });
  } else {
    dialog.getContentElement().querySelector('input.mdalt').value = t;
    setTimeout(function(){ inputUrl.focus(); });
  }
}

function insertBluesky(text, p, options) {
  const elt = this.input;
  let t = text.substring(p.start,p.end);
  const rexbsky = /data-bluesky-uri="(at:\/\/.*app.bsky.feed.post\/\w+)"/;
  // const nb = text.length;
  dialog.show({
    title: options.title[0].toUpperCase() + options.title.substring(1) ,
    className: options.className,
    content: blueskydlog,
    buttons: { submit: 'ok', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b==='cancel') dialog.setContent(' ');
      if (b==='submit') {
        Object.keys(inputs).forEach(i => {
          i = inputs[i]
          i.classList.remove('mderror');
          inputs[i.className] = i;
        });
        let bskyUri;
        if (!rexbsky.test(inputs.dtextarea.value)) {
          inputs.dtextarea.classList.add('mderror');
          dialog.show();
          inputs.dtextarea.focus();
          return;
        } else {
          bskyUri = inputs.dtextarea.value.match(rexbsky)[1]
        }
        // Set text
        if (t) {
          text = removeAt(text, p.start, t.length);
        }
        // Size
        let sizex = inputs.width.value;
        let sizey = inputs.height.value;
        if (sizex || sizey) sizex = ' '+sizex+'x'+sizey;
        // insert
        const link = `!(${bskyUri}${sizex})`;
        text = insertAt(text, p.start, link);
        elt.value = text;
        // Dispatch it.
        this.refresh();
        this._onchange();
        dialog.close();
        dialog.setContent(' ');
      }
      elt.focus();
    }
  });
}

/* Add icon dialog */
function addIcon(text, p){
  const dlg = ol_ext_element.create('DIV');
  // Icon size
  ol_ext_element.create('LABEL', { html: 'Taille', parent: dlg });
  let tsel = '<option value="">normal</option>';
  [2,3,4,5].forEach(i => tsel += '<option value="'+i+'">x'+i+'</option>' )
  const size = ol_ext_element.create('SELECT', {
    html: tsel,
    parent: dlg
  })
  // Align
  ol_ext_element.create('LABEL', { html: 'Alignement', parent: dlg });
  const align = ol_ext_element.create('SELECT', {
    html: '<option value="">texte</option>'
      +'<option value="left">gauche</option>'
      +'<option value="right">droite</option>',
    parent: dlg
  });
  // Color
  const label = ol_ext_element.create('LABEL', { html: 'Couleur', parent: dlg });
  const colorInput = new ColorInput({ parent: label, position: 'fixed', hastab: true, opacity: false })
  // icons
  ol_ext_element.create('BR', { parent: dlg });
  icons.forEach( i => {
    ol_ext_element.create('I', {
      className: 'fa '+i,
      title: i,
      click: () => {
        dialog.hide();
        let options = size.value ? size.value+'x' : '';
        options += (options && align.value ? ' ':'') + (align.value ? align.value : '');
        let color = asArray(colorInput.getValue());
        if (color[3]) color = toHexa(color);
        else color = '';
        const val = ' :' + i + (options || color ? ':'+(options||'') : '') + (color ? ':'+color : '') + ': ';
        text = insertAt(text, p.end, val);
        this.input.value = text;
        this.input.selectionStart = p.end + 1;
        this.input.selectionEnd = p.end + val.length-1;
        this.input.focus();
        this._onchange();
        this.refresh();
      },
      parent: dlg
    });
  })
  // Dialog
  dialog.show({ title: 'Insérer une icone', content: dlg, className: 'mdedit-icon', buttons: ['annuler'], onButton: () => { this.input.focus(); } })
}

/**
 * @private
 */
MDEditorBase.prototype._getEditor = function(options) {
  return new MDEditorBase(options)
}

/** Display a fulldialog
 */
MDEditorBase.prototype.mdFullDialog = function() {
  const value = this.getValue();
  const dlg = ol_ext_element.create('DIV');
  const container = ol_ext_element.create('DIV', { parent: dlg });
  const input = ol_ext_element.create('TEXTAREA', { parent: container });
  const output = ol_ext_element.create('DIV', { parent: dlg });
  const editor = this._getEditor({
    input: input,
    output: output,
    scrolling: true,
    minibar: false,
    data: this.data,
    edugeo: this.params.edugeo,
    shiftTitle: this.params.shiftTitle
  });
  editor.setValue(value)
  fullDialog.show({
    closeBox: true,
    content: dlg,
    buttons: { ok: 'modifier', cancel: 'annuler' },
    onButton: (b) => {
      if (b==='ok') {
        this.setValue(editor.getValue());
        this.input.selectionStart = this.input.selectionEnd = editor.input.selectionEnd;
      }
      this.input.focus();
    }
  });
  const tb = ol_ext_element.create('DIV', { className: 'tb' });
  input.parentNode.insertBefore(tb, input);
  tb.appendChild(fullDialog.getContentElement().querySelector('.md-toolbar'));
  editor.input.selectionStart = this.input.selectionStart;
  editor.input.selectionEnd = this.input.selectionEnd;
  editor.input.focus();
};

/** Markdown editor
 * @param {*} options
 *  @param {line|insert|selection|fn|dialog} options.type operation type
 *  @param {} options.val value to insert
 *  @param {Array<string>} options.wrap wrap word with
 *  @param {function} options.fn a function to use when type = 'fn' or 'dialog'
 */
MDEditorBase.prototype.edit = function(options) {
  const elt = this.input;
  var start = elt.selectionStart;
  var end = elt.selectionEnd;
  var text = elt.value;
  var startnl = text.lastIndexOf('\n', start-1)+1;
  switch (options.type) {
    case 'line': {
      text = insertAt(text, startnl, options.val)
      break;
    }
    case 'selection': {
      if (start !== end && text.charAt(end-1) === ' ') end--;
      text = insertAt(text, end, options.valend || options.val);
      text = insertAt(text, start, options.val)
      break;
    }
    case 'insert': {
      if (options.wrap) {
        text = insertAt(text, start, options.wrap[0]);
        start += options.wrap[0].length;
        options.start = start;
      }
      text = insertAt(text, start, options.val);
      if (options.wrap) {
        text = insertAt(text, start+options.val.length, options.wrap[1]);
        options.end = start+options.val.length;
      }
      break;
    }
    case 'fn': {
      text = options.fn(text, { start: start, end:end, startln: startnl }, options);
      break;
    }
    case 'dialog': {
      text = options.fn.call(this, text, { start: start, end:end, startln: startnl }, options);
      return;
    }
    default: break;
  }
  // Undo/redo
  this._delay = 0;
  this.input.value = text;
  elt.selectionStart = options.start || (start + options.val.length);
  elt.selectionEnd = options.end || (end + options.val.length);
  elt.focus();
  this._onchange();
  this.refresh(true);
}


/** Add a new tool to the toolbar
 */
MDEditorBase.prototype.addTool = function (options) {
  const itool = ol_ext_element.create('I', {
    className: options.icon,
    title: options.title,
    click: () => {
      this.edit(options)
    },
    parent: options.after ? null : this.toolbar
  })
  if (options.after) {
    this.toolbar.insertBefore(itool, options.after);
  }
  return itool;
}

/** Add a new tool to the toolbar
 */
MDEditorBase.prototype.addSeparatorTool = function () {
  this.addTool({ icon: 'separator', type: 'separator' });
};

/** Add a new tool to the toolbar
 * @param {boolean} minibar
 */
MDEditorBase.prototype.setTools = function (minibar) {
  this.toolbar.innerHTML = '';
  // Help
  this.addTool({ title: 'aide...', icon: 'fi-info', type: 'dialog', fn: () => showHelp(mdHelpFormat, options) })
  // header
  this.addTool({ title:'titres', icon: 'title', val: '#', type: 'line' });
  // separateur
  this.addSeparatorTool();
  // bold
  this.addTool({ title:'gras', icon: 'fa fa-bold', val: '**', type: 'selection' })
  // italic
  this.addTool({ title:'italique', icon: 'fa fa-italic', val: '*', type: 'selection' })
  if (!minibar) {
    // underline
    this.addTool({ title:'souligné', icon: 'fa fa-underline', val: '__', type: 'selection' });
    // strike
    this.addTool({ title:'barré', icon: 'fa fa-strikethrough', val: '~~', type: 'selection' });
    // separateur
    this.addSeparatorTool();
    // justify
    this.addTool({ title:'justifié', icon: 'fa fa-align-justify', val: '', type: 'fn', fn: function(text, p, options) {
      var t = text.substr(p.startln, 2);
      if (t==='|<' || t==='|>' || t==='|\t') {
        text = removeAt(text, p.startln, 2);
        p.start -= 2;
        p.end -= 2;
      } else if (text.charAt(p.startln)==='#') {
        return align(text, p, options);
      } 
      return text;
    }});
    // left
    this.addTool({ title:'aligné à gauche', icon: 'fa fa-align-left', val: '|<', type: 'fn', fn: function(text, p, options) {
      return align(text, p, options);
    }});
    // center
    this.addTool({ title:'centré', icon: 'fa fa-align-center', val: '|\t', type: 'fn', fn: function(text, p, options) {
      return align(text, p, options);
    }});
    // right
    this.addTool({ title:'aligné à droite', icon: 'fa fa-align-right', val: '|>', type: 'fn', fn: function(text, p, options) {
      return align(text, p, options);
    }});
    // separateur
    this.addSeparatorTool();
    // list-ul
    this.addTool({ title:'listes', icon: 'fa fa-list-ul', val: '* ', type: 'fn', fn: function(text, p, options) {
      if (text.substring(p.startln,p.startln+2)==='* ') {
        return insertAt(text, p.startln, '  ');
      } else {
        return insertAt(text, p.startln, options.val);
      }
    }});
    // list-ol
    this.addTool({ title:'liste', icon: 'fa fa-list-ol', val: '1. ', type: 'line' });
    // line
    this.addTool({ title:'insérer une ligne', icon: 'line', val: '\n------\n', type: 'insert'});
    // separateur
    this.addSeparatorTool();
    // code
    this.addTool({ title:'code', icon: 'fa fa-code', val: '', type: 'fn',
      fn: function(text, p, options) {
        if (p.start===p.end) {
          if (text.substr(p.startln, 4)==='    ') {
            text = removeAt(text, p.startln, 4);
            options.start = p.start - 4;
            options.end = p.end - 4;
          } else {
            text = insertAt(text, p.startln, '    ');
            options.start = p.start + 4;
            options.end = p.end + 4;
          }
        } else {
          text = insertAt(text, p.end, '`');
          text = insertAt(text, p.start, '`');
          options.start = p.start + 1;
          options.end = p.end + 1;
        }
        return text;
    }});
    // supperscript
    this.addTool({ title:'exposant', icon: 'fa fa-superscript', val: '^(', valend:')', type: 'selection' });
    // subscript
    this.addTool({ title:'indice', icon: 'fa fa-subscript', val: '^(_', valend:')', type: 'selection' });
    // quote
    this.addTool({ title:'citation', icon: 'fa fa-indent', val: '', type: 'fn',
      fn: function(text, p, options) {
        if (text.charAt(p.startln)==='>') {
          text = removeAt(text, p.startln, 1);
          options.start = p.start -1;
          options.end = p.end -1;
        } else {
          text = insertAt(text, p.startln, '>');
          options.start = p.start +1;
          options.end = p.end +1;
        }
        return text;
    }});
  }
  // separateur
  this.addSeparatorTool();
  // attribute
  if (Object.keys(this.data).length) {
    this.addTool({ title:'insérer un attribut', icon: 'fa fa-tag', val: '%att%', type: 'dialog', fn: (text, p, options) =>{
      const elt = this.input;
      const div = ol_ext_element.create('DIV');
      const ul = ol_ext_element.create('UL', { parent: div });
      Object.keys(this.data).forEach(d => {
        const li = ol_ext_element.create('LI', {
          html: d,
          title: this.data[d],
          click: () => {
            li.classList.toggle('select');
          },
          parent: ul
        })
      })
      const check = ol_ext_element.createCheck({
        after: 'ne pas afficher si vide',
        className: ' small',
        parent: div
      })
      ol_ext_element.create('LABEL', {
        text: 'Séparateur : ',
        className: 'sep',
        parent: div
      })
      const separator = ol_ext_element.create('INPUT', {
        type: 'text',
        className: 'sep',
        value: '; ',
        parent: div
      })
      dialog.show({
        title: 'Insérer un attribut',
        className: options.className,
        content: div,
        buttons: { ok: 'ok', cancel: 'annuler' },
        onButton: (b) => {
          if (b==='ok') {
            dialog.close();
            let val = [];
            ul.querySelectorAll('li').forEach(l => {
              if (l.classList.contains('select')) {
                const d = l.innerText;
                val.push(check.checked ? '((%'+d+'%))' : '%'+d+'%');
              }
            })
            // insert
            if (val.length) {
              val = val.join(separator.value)+' ';
              if (p.start !== p.end) text = removeAt(text, p.start, p.end - p.start);
              text = insertAt(text, p.start, val);
              elt.value = text;
              // select
              elt.selectionStart = elt.selectionEnd = p.start + val.length;
              this.refresh();
            }
            this._onchange();
          }
          elt.focus();
        }
      })
    }, className: 'mdedit-attr' });
  }
  // link
  this.addTool({ title:'insérer un lien', icon: 'fa fa-link', val: '[alt](url)', type: 'dialog', fn: insertUrl, className: 'mdedit-link' });
  // picture
  this.addTool({ title:'insérer un média', icon: 'fi-image', val: '!(url)', type: 'dialog', fn: insertUrl, className: 'mdedit-media' })
  // image
  if (minibar) {
    this.addSeparatorTool();
  }
  if (!minibar) {
    // table
    this.addTool({ title:'insérer un tableau', icon: 'fa fa-table', val: '\n\n|  T1  |  T2  |\n| ---- | ---- |\n|  1   |  2   |\n\n', type: 'insert' });
    // list-alt
    this.addTool({ title:'insérer un bloc', icon: 'fa fa-list-alt', val: '', 
      wrap: ['\n\n[-- Titre --]\n', '\n[----]\n\n'], type:'fn', 
      fn: function(text, p, options) {
        var content = 'contenu';
        if (p.start !== p.end) {
          content = text.substring(p.start,p.end);
          text = removeAt(text, p.start, content.length);
        }
        text = insertAt(text, p.start, options.wrap[0]+content+options.wrap[1]);
        options.start = p.start + options.wrap[0].length;
        options.end = p.start + options.wrap[0].length + content.length;
        return text;
      }
    });
    // separateur
    this.addSeparatorTool();
    // Twitter
    this.addTool({ 
      title:'Twitter', 
      icon: 'fa fa-twitter-square', 
      val: ' ![Vous avez vu ma carte ?](https://twitter.com/share) ', 
      type: 'insert' 
    });
    // Tweet
    this.addTool({ 
      title:'insérer un tweet', 
      icon: 'fa fa-twitter', 
      val: 'https://twitter.com/{user}/status/{id}', 
      type: 'dialog', 
      fn: insertUrl,
      className: 'mdedit-twitter'
    });
    // Bluesky
    this.addTool({
      title:'insérer un post Bluesky',
      icon: 'fi-bluesky',
      val: 'https://bsky.app/profile',
      type: 'dialog',
      fn: insertBluesky,
      className: 'mdedit-bluesky'
    });
    // FaceBook
    this.addTool({ title:'Facebook', icon: 'fa fa-facebook-square', val: ' !(https://www.facebook.com/like) ', type: 'insert' });
  }
  // Emoticons
  this.addTool({ title:'émoticône', icon: 'fa fa-smile-o', val: ':fa-smile-o:', type: 'dialog', fn: addIcon });
  // <br>
  this.addTool({ title:'nouvelle ligne', icon: 'fa fa-paragraph', val: '<br>', type: 'insert' });
  // Full screen dialog
  if (minibar) {
    this.addTool({ title:'éditeur complet', icon: 'add', type: 'dialog', fn: this.mdFullDialog });
  }
  // Online help
  const options = {
    title: 'Markdown',
    className: 'md-help' ,
    mdOptions: { 
      name: 'Géoroom', 
      address: '8 avenue Pasteur', 
      cp: 94160, 
      commune: 'St-Mandé',
      valeur_1: 2,
      valeur_2: 4,
      valeur_3: 3,
      valeur_4: 6,
      valeur_5: 1,
      html: '<a href="https://www.ign.fr/">Site IGN</a>',
      url: 'https://www.ign.fr/visitez-le-georoom',
      img: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Hurel-Dubois_HD-34,_IGN_-_Institut_Geographique_National_AN1286808.jpg'
    },
    buttons: { format: 'format', list: 'listes', media: 'médias', attr: 'attributs', widget: 'widget', /* qcm: 'QCM', */ ok: 'ok' },
    onButton: (b) => {
      switch(b) {
        case 'format': showHelp(mdHelpFormat, options); break;
        case 'list': showHelp(mdHelpList, options); break;
        case 'media': showHelp(mdHelpMedia, options); break;
        case 'attr': showHelp(mdHelpAttr, options); break;
        case 'widget': showHelp(mdHelpWidget, options); break;
        case 'qcm': showHelp(mdHelpQCM, options); break;
        default: break;
      }
    }
  }
}

export default MDEditorBase
