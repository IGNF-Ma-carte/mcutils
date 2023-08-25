function setPiwik(siteId) {
  window._paq = window._paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  _paq.push([function () {
    var self = this;
    function getOriginalVisitorCookieTimeout() {
      var now = new Date(),
          nowTs = Math.round(now.getTime() / 1000),
          visitorInfo = self.getVisitorInfo();
      var createTs = parseInt(visitorInfo[2]);
      var cookieTimeout = 33696000; // 13 mois en secondes
      return createTs + cookieTimeout - nowTs;
    }
    this.setVisitorCookieTimeout(getOriginalVisitorCookieTimeout());
  }]);
  (function () {
    var u = (("https:" == document.location.protocol) ? "https" : "http") + "://piwik.ign.fr/piwik/";
    _paq.push(['setTrackerUrl', u + 'piwik.php']);
    _paq.push(['setSiteId', siteId]);
    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.defer = true;
    g.async = true;
    g.src = u + 'piwik.js';
    s.parentNode.insertBefore(g, s);
  })();
}

export default setPiwik