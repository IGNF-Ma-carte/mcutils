import dialog from './dialog';
import './shareCarte.css';
import ol_ext_element from 'ol-ext/util/element';
import serviceURL, { getViewerURL } from '../api/serviceURL';
import embedCarte from './embedCarte'

import { QRCode } from '../Carte'

const html = `
<div class="list"></div>
<h3>Lien</h3>
<div class="link">
  Lien pour visualiser la carte :<br/>
</div>
<p class="cgu">
  En utilisant ce service, nous vous informons que votre responsabilité est engagée lorsque vous partagez vos données sur Internet. 
  En conséquence, vous devez vous conformer aux lois règlements en vigueur notamment la loi Informatique et libertés 
  si les données partagées contiennent des données à caractère personnel.
  <br/>
  Pour plus de détails, veuillez consulter les <a class="colored" target="_new">Conditions générales d'utilisation</a>.
</p>
`;

/** Share dialog
 * @param {Object} options
 *  @param {string} [options.prompt='Partager votre carte'] Dialog title
 *  @param {StoryMap|Carte|Object} [options.carte] the story or carte to share
 *  @param {Element} [options.target] element to place in (default: a dialog)
 */
function shareCarte(options) {
  // geturl
  options = options || {};
  const carte = options.carte;
  if (!carte) return;
  const url = (carte.getViewerUrl ? carte.getViewerUrl() : getViewerURL(carte));
  const title = (carte.get ? carte.get('title') : carte.title);
  if (!url) return false;
  // 
  let target;
  if (options.target instanceof Element) {
    options.target.innerHTML = html
    target = options.target;
    target.classList.add('mc-share-map')
  } else {
    dialog.show({
      title: options.prompt || 'Partager votre carte',
      className: 'mc-share-map',
      content: html,
    });
    target = dialog.getContentElement()
  }
  const ul = target.querySelector('.list');
  ol_ext_element.create('A', {
    html: '<i class="fa fa-code"></i> Intégrer',
    className: 'colored',
    click: () => embedCarte(options),
    parent: ul
  })
  // Social network
  const socials = [{
    title: '<i class="fa fa-twitter"></i> Twitter',
    href: 'https://twitter.com/intent/tweet?'
      + 'url=' + encodeURIComponent(url)
      + (title ? '&text=' + encodeURI(title) : '')
      + '&via=IGNFrance'
      + '&hashtags=Macarte'
  },{
    title: '<i class="fa fa-facebook"></i> Facebook',
    href: 'https://www.facebook.com/sharer/sharer.php?'
      + 'u=' + encodeURIComponent(url)
  }, {
    title: '<i class="fa fa-linkedin"></i> LinkedIn',
    href: 'https://www.linkedin.com/shareArticle?mini=true'
      + '&url=' + encodeURIComponent(url)
  },{
    title: '<i class="fa fa-envelope-o"></i> Courrier',
    href: 'mailto:?'
      + 'subject=' + encodeURIComponent(title || 'Macarte')
      + '&body=Je vous invite à consulter la carte ' + encodeURIComponent(title || '') + ' : \n' 
      + encodeURIComponent(url)
  }]
  // Add buttons
  socials.forEach(s => {
    ol_ext_element.create('A', {
      html: s.title,
      className: 'colored external',
      href: s.href,
      click: () => {
        dialog.hide()
      },
      target: '_new',
      parent: ul
    })
  });

  // Link
  const plink = ol_ext_element.create('A', {
    html: ol_ext_element.create('SPAN', { html: url }),
    className: 'colored',
    click: () => {
      try {
        navigator.clipboard.writeText(url);
        copyInfo.className = 'copy-info visible';
        setTimeout(() => { copyInfo.className = 'copy-info'; }, 800);
      } catch(e) {/* ok */}
    },
    parent: target.querySelector('.link')
  })
  const copyInfo = ol_ext_element.create('SPAN', {
    html: 'copié dans le presse-papier',
    className: 'copy-info',
    parent: plink
  })
  // QRCode
  ol_ext_element.create('IMG', {
    className: 'qrcode',
    src: QRCode.generatePNG(url, {ecclevel : 'L', margin: 0 }),
    parent: target.querySelector('.link')
  })

  // CGU
  target.querySelector('.cgu a').href = serviceURL.cgu;

  return true;
}

export default shareCarte;