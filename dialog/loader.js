import './loader.css'

import element from 'ol-ext/util/element'

// Loader div
const loader = element.create('DIV',{
  className: 'page-loader hidden',
  html: '<div><p></p></div>',
  parent: document.body
});
const infoDiv = element.create('DIV', {
  className: 'info',
  parent: loader
});

let tout;

export default {
  show: (delay, info) => {
    infoDiv.innerHTML = info || '';
    loader.style.display = 'block';
    if (tout) clearTimeout(tout);
    if (delay===0) {
      loader.classList.remove('hidden');
    } else {
      tout = setTimeout(() => {
        loader.classList.remove('hidden');
      }, delay || 200);
    }
  },
  hide: () => {
    loader.classList.add('hidden');
    if (tout) clearTimeout(tout);
    tout = setTimeout(() => {
      loader.style.display = 'none';
    }, 200)
  }
}