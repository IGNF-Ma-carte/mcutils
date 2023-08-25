import ol_ext_element from 'ol-ext/util/element'

// Helper
function createElement(tagName, options) {
  const elt = document.createElement(tagName);

  for (var attr in options) {
    switch (attr) {
      case 'className': {
        if (options.className && options.className.trim) elt.setAttribute('class', options.className.trim());
        break;
      }
      case 'html': {
        if (options.html instanceof Element) elt.appendChild(options.html)
        else if (options.html!==undefined) elt.innerHTML = options.html;
        break;
      }
      case 'parent': {
        if (options.parent) options.parent.appendChild(elt);
        break;
      }
      case 'click': {
        ol_ext_element.addListener(elt, attr, options[attr]);
        break;
      }
      case 'on': {
        for (var e in options.on) {
          ol_ext_element.addListener(elt, e, options.on[e]);
        }
        break;
      }
      default: {
        if (attr==='href' && !options[attr]) break;
        elt.setAttribute(attr, options[attr]);
        break;
      }
    }
  }

  return elt;
}

/** Set the input placeholder action
 * @label {Element} [label] if none set all label unset
 * @memberof charte
 * @instance
 * @private
 */
 function setInputPlaceholderAction(input) {
  if (!input) return;
  const label = input.parentNode;
  if (!label.classList.contains('isok')) {
    label.classList.add('isok');
    if (input.classList.contains('required')) label.classList.add('required');
    if (input.value) label.classList.add('valid');
    input.placeholder = '';
    input.addEventListener('focusout', () => {
      label.classList.remove('focus');
    })
    input.addEventListener('focus', () => {
      label.classList.add('focus');
    })
    input.addEventListener('change', () => {
      if (input.value) label.classList.add('valid');
      else label.classList.remove('valid');
    })
  }
}

/** Set the collapsible inputs placeholders. 
 * The placeholder will be extrated from the input and placed in a label to add a collapsible effect.
 * @function
 * @param {Element} [item] if none set all input with a input-placeholder class unset
 * @memberof charte
 * @example 
<!-- add a collapsible placeholder -->
<input typt="text" class="input-placeholder" placeholder="saisissez quelque chose" />
<!-- idem for a textarea -->
<textarea class="input-placeholder" placeholder="saisissez quelque chose"></textarea>
<!-- Process placeholders -->
<script>
  import charte from 'mcutils/charte/macarte'
  // Gerer les placeholders
  charte.setInputPlaceholder();
</script>
 * @instance
 */
function setInputPlaceholder(item) {
  if (item) {
    if (/INPUT|TEXTAREA/.test(item.tagName)) {
      if (item.parentNode.tagName!=='LABEL' || !item.parentNode.classList.contains('input-placeholder')) {
        const l = createElement('LABEL', {
          className: 'input-placeholder'+(item.tagName==='TEXTAREA' ? ' textarea-placeholder':'')
        })
        item.parentNode.insertBefore(l, item);
        l.appendChild(item);
        createElement('SPAN', {
          html: item.placeholder,
          parent: l
        });
      }
      setInputPlaceholderAction(item);
    } else if (/LABEL/.test(item.tagName)) {
      ['input', 'textarea'].forEach(type => {
        item.querySelectorAll(type).forEach(input => {
          setInputPlaceholderAction(input)
        })
      })
    } else {
      ['input', 'textarea'].forEach(type => {
        item.querySelectorAll(type + '.input-placeholder').forEach(input => {
          setInputPlaceholder(input);
        })
      })
    } 
  } else {
    ['input', 'textarea'].forEach(type => {
      document.body.querySelectorAll(type + '.input-placeholder ').forEach(input => {
        setInputPlaceholder(input)
      })
    })
  }
}

export { createElement }
export default setInputPlaceholder
