import { i18n } from "../../i18n/i18n"

i18n.set('fr', { 'accessDialogHTML': `
<div class="">
  <h1>Paramètres d'accessibilité</h1>
  <button type="button" class="btn-close" title="Fermer : Paramètres d'accessibilité">
  </button>
  <p class="contrast">
    <legend>Contrastes</legend>
    <label class="ol-ext-check ol-ext-radio"><input type="radio" name="contrast" value="normal"><span></span>Défaut</label>
    <label class="ol-ext-check ol-ext-radio"><input type="radio" name="contrast" value="enforce"><span></span>Renforcé</label>
  </p>
  <p class="interli">
    <legend>Interlignages</legend>
    <label class="ol-ext-check ol-ext-radio"><input type="radio" name="interli" value="simple"><span></span>Défaut</label>
    <label class="ol-ext-check ol-ext-radio"><input type="radio" name="interli" value="augmented"><span></span>Augmenté</label>
  </p>
</div>
`
})