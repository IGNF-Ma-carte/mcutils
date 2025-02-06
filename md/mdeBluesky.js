export default `
<i>Il suffit de coller le code HTML fournis par Bluesky dans la zone ci-dessous.</i>
<label>Code HTML du post :</label>
<textarea class="dtextarea" placeholder="</> <blockcode>" rows="5" cols="50"></textarea>
<p class="error">Le code ne correspond pas à un post BlueSky<br/>(de la forme &lt;blockquote class="bluesky-embed"...&gt;)</p>
<label class="mdimgsize">Taille du média :</label>
<input class="width" type="number" min="0" placeholder="auto" />
<span class="mdimgsize"> x </span>
<input class="height" type="number" min="0" placeholder="auto" />
`