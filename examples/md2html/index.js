import charte from '../../charte/macarte'
import ol_ext_element from 'ol-ext/util/element';
import md2html from '../../md/md2html';
import MDEditor from '../../md/MDEditor';
import '../../Carte'

import './md2html.scss'

charte.setApp('md', 'Markdown');

// Current page
const page = charte.getAppElement();

// Markdown content
const md = `## titre ^([:fi-info:](# une info))
!(https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png 200)

\`\`\`calendar
dates: { "years": { "2023": { "9": { "29": true } } } }
\`\`\`

##	Un graphique
\`\`\`chart pie x300 center
title: Titre
data:   %valeur_1%; %valeur_2%; %valeur_3%; %valeur_4%; %valeur_5%
labels: att1; att2; att3; att4; att5
colors: red; green; blue; orange; cyan
legend: right
\`\`\`
`
const data = { 
  name: 'Géoroom', 
  address: '8 avenue Pasteur', 
  cp: 94160, 
  commune: 'St-Mandé',
  url: 'https://www.ign.fr/visitez-le-georoom',
  labels: 'toto; titi; tutu',
  tab_1: '10; 15; 8',
  tab_2: '12; 9; 13',
  valeur_1: 2,
  valeur_2: 4,
  valeur_3: 3,
  valeur_4: 6,
  valeur_5: 1,
  img: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Hurel-Dubois_HD-34,_IGN_-_Institut_Geographique_National_AN1286808.jpg',
  img2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Rue_des_Marchands_depuis_le_Ko%C3%AFfhus_%28Colmar%29_%284%29.jpg/640px-Rue_des_Marchands_depuis_le_Koïfhus_(Colmar)_(4).jpg'
};

// Dialog
import dialog from '../../dialog/dialog';

ol_ext_element.create('BUTTON', {
  html: 'Dialog',
  className: 'button button-colored',
  click: () => {
    const mdElement = ol_ext_element.create('TEXTAREA', {
      html: md, 
      change: (e) => {
        const md = e.target.value;
        resultTxt.innerText = md2html.text(md, data);
      },
      parent: page 
    });

    dialog.show({
      title: 'Markdown editor',
      className: 'MDEditor',
      content: mdElement,
      buttons: ['ok','cancel'],
    })
    new MDEditor({
      input: mdElement,
      data: data,
    })
  },
  parent: page
})


// Create MD Editor
const mdElement = ol_ext_element.create('TEXTAREA', { 
  html: md, 
  change: (e) => {
    const md = e.target.value;
    resultTxt.innerText = md2html.text(md, data);
  },
  parent: page 
});
ol_ext_element.create('BUTTON', {html: 'ok', class:'button button-ghost', parent: page });
const result = ol_ext_element.create('DIV', { 
  className: 'md',
  parent: page 
});
const editor = window.editor = new MDEditor({
  input: mdElement,
  data: data,
  output: result,
  edugeo: true,
  // shiftTitle: 1
})

// Show result as text
ol_ext_element.create('P', { html: 'Rendu texte :', parent: page });
const resultTxt = ol_ext_element.create('DIV', { 
  html: md2html.text(md, data, true), 
  className: 'md',
  parent: page 
});

/**/
window.editor = editor;
/**/