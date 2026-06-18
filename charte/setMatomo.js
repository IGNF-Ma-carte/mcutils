/** Gestion Matomo (anciennement Piwik) 
 */
export default function(siteId) {
  // Nothing to do if no siteId provided (github)
  if (!siteId) return;

  // Install Matomo
  const _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="https://matomo.ign.fr/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', siteId]);
    var d=document, 
      g=d.createElement('script'), 
      s=d.getElementsByTagName('script')[0];
    g.async=true; 
    g.src=u+'matomo.js'; 
    s.parentNode.insertBefore(g,s);
  })();

  var _mtm = window._mtm = window._mtm || [];
  _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
  /** /
  (function() {
    var d=document, 
      g=d.createElement('script'), 
      s=d.getElementsByTagName('script')[0];
    g.async=true; 
    g.src='https://matomo.ign.fr/js/container_FImKsPkT.js'; 
    s.parentNode.insertBefore(g,s);
  })();
  /*/
  (function() {
    var d = document
      , g = d.createElement('script')
      , s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = false;
    g.defer = false;
    g.src = 'https://matomo.ign.fr/js/container_FImKsPkT.js';
    s.parentNode.insertBefore(g, s);
  })();
  /**/
}