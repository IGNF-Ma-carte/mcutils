import importConfig from '../config/import'

// Default options
let options = {
  server: 'https://server.ign.fr/',
  viewer: 'https://server/$TYPE/$ID/$TITLE',
  userProfile: 'https://server/user/$NAME',
  editor: 'https://server/edition/$TYPE/$ID',
  faq: 'https://server/aide/faq/$ARTICLE',
  tuto: 'https://server/aide/tuto/$ARTICLE',
  version: 'https://server/aide/notes-de-version/$ARTICLE',
  sitePiwik: 239,
  gppKey: '0gd4sx9gxx6ves3hf3hfeyhw',
  edugeoKey: '1mgehldv90vifl6s5ksf900i'
};

// Get server options using global options
if (!window.maCarteOptions) {
  importConfig('./config.json')
}
if (window.maCarteOptions) {
  for (let i in window.maCarteOptions) {
    options[i] = window.maCarteOptions[i];
  }
  delete window.maCarteOptions;
} else {
  console.error('NO CONFIG FILE!\n Ajouter un fichier confg.json dans le répertoire des assets...');
}

export default options
