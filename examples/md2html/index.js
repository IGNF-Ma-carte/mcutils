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
/** /
const md = `## titre ^([:fi-info:](# une info))
!(https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png 200)

\`\`\`calendar
dates: { "years": { "2023": { "9": { "29": true } } } }
\`\`\`

##	Un graphique
\`\`\`chart bar x300 center
title: Titre
data:   %valeur_1%; %valeur_2%; %valeur_3%; %valeur_4%; %valeur_5%
data-error: 1;.5;1.5,1;.5;.5,2
labels: att1; att2; att3; att4; att5
colors: red; green; blue; orange; cyan
legend: right
\`\`\`
`
/*/
const md = `## Test de QCM
Réponses: %md:QCMok% / %md:QCM%
#### Quelle est la couleur du cheval d'Henri IV ?
\`\`\`QCM henri4
Q: Quelle est la couleur du cheval d'Henri IV ?
[ ] ![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Zebra_%28PSF%29.png/1200px-Zebra_%28PSF%29.png 80) rayé noir et blanc
[x] ![](https://collections.louvre.fr/media/cache/medium/0000000021/0000057596/0000331030_OG.JPG 60) blanc
[ ] vous pouvez répéter la question ?
action: app://moveTo?2.351828,48.856578,9
---REP info
*Choisissez la bonne réponse !*
---REP
« ***Quelle est la couleur du cheval blanc d'Henri IV ?*** » est une [célèbre blague française](https://fr.wikipedia.org/wiki/Cheval_blanc_dans_la_culture#P.C3.A9troglyphes_et_g.C3.A9oglyphes)
---REP ok
Bien joué
![](https://i.ytimg.com/vi/PTLr74H2deA/maxresdefault.jpg 250)
---REP nok
OOps encore raté
![](https://media.baamboozle.com/uploads/images/169049/1604435175_123203 250)
\`\`\`

Ideal:
![Bluesky](https://bsky.app/profile/ignfrance.bsky.social/post/3lfdabftbqc2m)

Lien : https://bsky.app/profile/ignfrance.bsky.social/post/3lfdabftbqc2m

Blockcode :

\`\`\`html
<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:6j7dfu4urjderngdgf2nh7gw/app.bsky.feed.post/3leoghenwmc2d" data-bluesky-cid="bafyreiax76gjmq47e5df6nvvbnpi2b6juzaudqmk7xorwifjwoujuwzcxy"><p lang="fr">✨Nouvelle année, nouvelle résolution : l&#x27;IGN arrive sur Bluesky ! Et vous souhaite une excellente année 2025 <br><br><a href="https://bsky.app/profile/did:plc:6j7dfu4urjderngdgf2nh7gw/post/3leoghenwmc2d?ref_src=embed">[image or embed]</a></p>&mdash; IGN (<a href="https://bsky.app/profile/did:plc:6j7dfu4urjderngdgf2nh7gw?ref_src=embed">@ignfrance.bsky.social</a>) <a href="https://bsky.app/profile/did:plc:6j7dfu4urjderngdgf2nh7gw/post/3leoghenwmc2d?ref_src=embed">1 January 2025 at 12:11</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>
\`\`\`

Lien

\`\`\`
!(at://did:plc:6j7dfu4urjderngdgf2nh7gw/app.bsky.feed.post/3leoghenwmc2d 400x500)
\`\`\`

Liens réels :
!(at://did:plc:6j7dfu4urjderngdgf2nh7gw/app.bsky.feed.post/3leoghenwmc2d)

!(at://did:plc:6j7dfu4urjderngdgf2nh7gw/app.bsky.feed.post/3lfdabftbqc2m)
`
/**/

const data = { 
  name: 'Géoroom', 
  address: '8 avenue Pasteur', 
  cp: 94160, 
  commune: 'St-Mandé',
  url: 'https://www.ign.fr/visitez-le-georoom',
  labels: 'toto; titi; tutu',
  tab_1: '10; 15; 8',
  tab_2: '12; 9; 13',
  valeur_0: 0,
  valeur_1: 2,
  valeur_2: 4,
  valeur_3: 3,
  valeur_4: 6,
  valeur_5: 1,
  html: '<a href="https://www.ign.fr/">Site IGN</a>',
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