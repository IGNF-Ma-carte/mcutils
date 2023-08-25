export default `
<label>Url du <span class="media">média</span><span class="link">lien</span> :</label>
<input class="durl" type="url" placeholder="https://" list="twitterURL" />
<label class="mdalt">Texte alternatif :</label>
<input type="text" class="mdalt" />
<label class="mdpop">Texte au survol :</label>
<input type="text" class="mdpop" />
<datalist id="twitterURL">
  <option value="https://twitter.com/_USER_/status/_ID_">Afficher un tweet</option>
  <option value="https://twitter.com/_USER_/timeline">Timeline d'un utilisateur</option>
  <option value="https://twitter.com/_USER_/timeline/_ID_">Afficher une timeline</option>
  <option value="https://twitter.com/_USER_/timegrid/_ID_">Afficher une grille</option>
</datalist>
<i class="twitter">
  Rechercher <a href="https://tweetdeck.twitter.com/" target="_blank">vos timelines</a>.
</i>
<label class="mdimgsize">Taille du média :</label>
<label class="twitter">Nombre de tweets / afficher l'image du tweet :</label>
<input class="width" type="number" min="0" placeholder="auto" />
<span class="mdimgsize"> x </span>
<br class="twitter"/>
<span class="twitter">Largeur du média:</span>
<input class="height" type="number" min="0" placeholder="auto" />
<label class="fullscreen ol-ext-check ol-ext-checkbox small"><input class="fullscreen" type="checkbox"><span></span>lien plein écran au clic</label>
`