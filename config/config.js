import importConfig from '../config/import'

// Default options
let options = {
  server: 'https://server.ign.fr/',
  viewer: 'SERVER/carte/$ID/$TITLE?$NOTITLE',
  userProfile: 'SERVER/utilisateur/$NAME',
  teamProfile: 'SERVER/equipe/$NAME',
  editor: 'SERVER/edition/$TYPE/$ID',
  faq: 'SERVER/aide/faq/$ARTICLE',
  tuto: 'SERVER/aide/tuto/$ARTICLE',
  version: 'SERVER/aide/notes-de-version/$ARTICLE',
  guichetURL: 'https://qlf-collaboratif.cegedim-hds.fr/collaboratif-4.0/',
  // sitePiwik: 39,
  gppKey: 'k1RSRVIYRxteMEcPK9A5c7g0C6KRw4KX',
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
  // Update server url
  const server = options.server.replace(/\/$/,'');
  for (let i in options) {
    if (options[i].replace) options[i] = options[i].replace(/^SERVER/, server)
  }
} else {
  console.error('NO CONFIG FILE!\n Ajouter un fichier confg.json dans le répertoire des assets...');
}

export default options
