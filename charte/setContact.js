import element from 'ol-ext/util/element'

function setContact(options, parent) {
  const a = element.create('FORM', {
    'data-role': 'contact',
    href: options.href,
    action: options.href,
    method: 'GET',
    parent: parent,
    target: '_blank',
  })
  // Submit
  const b = element.create('BUTTON', {
    type: 'submit',
    parent: a
  })
  // Text
  element.create('SPAN', {
    html: options.title,
    parent: b
  })
  if (options.small) {
    element.create('SMALL', {
      html: options.small,
      parent: b
    })
  }
  // Form data
  element.create('INPUT', {
    type: 'hidden',
    name: 'service',
    value: options.service || '',
    parent: a
  })
  element.create('INPUT', {
    type: 'hidden',
    name: 'user',
    value: options.user || '',
    parent: a
  })
  element.create('INPUT', {
    type: 'hidden',
    name: 'mapID',
    value: options.mapID || '',
    parent: a
  })
  element.create('INPUT', {
    type: 'hidden',
    name: 'userID',
    value: options.userID || '',
    parent: a
  })
  element.create('INPUT', {
    type: 'hidden',
    name: 'email',
    value: options.email || '',
    parent: a
  })
}

export default setContact