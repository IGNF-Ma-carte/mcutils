import SearchControl from 'ol-ext/control/SearchGeoportail'

/** Seach Geoportail V2
 */
class Search extends SearchControl {
  constructor(options) {
    super(options)
    this.set('url', 'https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/completion')
  }
}

export default Search