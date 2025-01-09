/* @File extent openlayers select interaction to handle MVT selection */
import Select from './Select'

/** Select interaction to select multiple features.
 * It is specific to Ma Carte
 */
class SelectMultiple extends Select {
  constructor(options) {
    options = options || {};

    super(options);

    this.filter_ = options.filter ? options.filter : this.defaultFilter;

    /** Keep the current selection for the filter
     * @private
     * @type {Array<import('ol/Feature').default>}
     */
    this.currentSelection_ = [];

    /** Feature ids of the the current selection
     * @private
     * @type {Array<Number>}
     */
    this.currentSelectionIds_ = [];

    /** Currently shown feature
     * @private
     * @type {import('ol/Feature').default}
     */
    this.shownFeature;

    /** Feature currently shown
     * @private
     * @type {import('ol/style/Style').StyleLike}
     */
    this.shownStyle_ = options.shownStyle ? options.shownStyle : this.getStyle();

    /** Index of the currently feature shown
     * @private
     * @type {number}
     */
    this.indexShownFeature = 1;

    // Initialise shownFeature value on select (first item, undefined if there is no selection)
    this.on('select', () => {
      // Reset shown feature
      this.setShownFeature(this.getFeatures().item(0))
    })
  }

  /** Get the index of the currently shown feature.
   * 
   * @public
   * @returns {number} Current index.
   */
  getIndex() {
    return this.indexShownFeature
  } 

  /** Set the index of the currently shown feature.
   * Compare its value to the number of features
   * and change it if needed
   * 
   * @public
   * @param {number} indexShownFeature Feature shown
   */
  setIndex(indexShownFeature) {
    if (indexShownFeature && parseInt(indexShownFeature)) {
      this.indexShownFeature = indexShownFeature
    }
  }

  /** Get the shown feature
   * 
   * @public
   * @returns {import('ol/Feature').default} Current shown feature.
   */
  getShownFeature() {
    return this.shownFeature;
  }


  /** Set the shown feature
   * 
   * @public
   * @param {import('ol/Feature').default} feature Feature shown
   */
  setShownFeature(feature) {
    // Stop if nothing new is to set
    if (this.shownFeature === feature) {
      return
    }
    // Send event
    this.dispatchEvent({
      type: 'select:show',
      shown_feature: feature,
      unshown_feature: this.shownFeature,
      index: this.getIndex(),
    });
    // Remove style on previous shown feature
    if (this.shownFeature) {
      this.removeShownStyle(this.shownFeature)
    }
    this.shownFeature = feature;
    // Apply style on shown feature if exists
    if (this.shownFeature) {
      this.applyShownStyle(this.shownFeature);
    }
  }

  /** Apply the shown style to the feature
   * 
   * @param {import('ol/Feature').default} feature 
   */
  applyShownStyle(feature) {
    feature.setStyle(this.shownStyle_);
  }

  /** Remove the shown style to the feature
   * 
   * @param {import('ol/Feature').default} feature feature to remove the style from
   */
  removeShownStyle(feature) {
    let style = feature.getStyle();
    if (typeof style === 'function') {
      style = style(feature);
    }
    if (style && style.length) {
      for (let i = 0; i < style.length; i++) {
        const st = style[i]
        // If the style was added or fill was changed, we remove it
        if (st.newStyle || st.selectFill) {
          style.splice(i, 1);
        }
      }

      // Get and set back original zIndex
      if (feature.getLayer && feature.getLayer()) {
        const zIndex = feature.getLayer().getStyle()(feature)[0].getZIndex();
        style[0].setZIndex(zIndex)
      }
      feature.setStyle(style)
    }
  }

  /** Default filter to select multi features of the same layer.
   * This function can be used without inside a custom filter.
   * 
   * @public
   * @param {import('ol/Feature').default} feature 
   * @param {import('ol/layer/Layer').default} layer 
   * @returns {boolean} true if the feature is selected.
   */
  defaultFilter(feature, layer) {
    if (layer.selectable && layer.selectable()) {
      // Check if multi select is able when there is multiple selected features
      if (this.currentSelection_.length != 0) {
        const firstFeature = this.currentSelection_[0];
        // Get layer ol_uid
        let firstLayer;
        // Check if it's a cluster
        if (firstFeature && firstFeature.get('features') instanceof Array) {
          firstLayer = firstFeature.get('features')[0].getLayer();
        } else {
          firstLayer = firstFeature.getLayer();
        }
        
        // Get multiSelect attribute
        if (firstLayer.get('multiSelect')) {
          // Multi select layer : add every selected feature of this layer
          let layerOlUid;
          if (feature && feature.get('features') instanceof Array) {
            layerOlUid = feature.get('features')[0].getLayer().ol_uid;
          } else {
            layerOlUid = feature.getLayer().ol_uid;
          }
          const firstLayerOlUid = firstLayer.ol_uid;
          // Ids are different : do not keep the feature
          if (layerOlUid != firstLayerOlUid) {
            return false;
          }
        } else if (this.currentSelection_.length == 1) {
          // One selected feature : check if it's not the same
          return firstFeature.ol_uid === feature.ol_uid;
        } else {
          return false;
        }
      }
      // Add feature to global variables if not already selected
      if (!this.currentSelectionIds_.includes(feature.ol_uid)) {
        this.currentSelection_.push(feature);
        this.currentSelectionIds_.push(feature.ol_uid);
      }
      return true;
    }
    return false;
  }


  /** Clear the current selection arrays.
   * It DOES NOT clear the current selection.
   * @public
   */
  clearCurrentSelectionArrays() {
    this.currentSelection_ = []
    this.currentSelectionIds_ = []
  }
}

export default SelectMultiple