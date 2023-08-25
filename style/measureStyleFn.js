import Style from 'ol/style/Style';
import TextStyle from 'ol/style/Text';
import FillStyle from 'ol/style/Fill';
import StrokeStyle from 'ol/style/Stroke';

const mstyle = new Style({
  text: new TextStyle({
    font: '12px sans-serif',
    text: '',
    padding: [5,5,0,5],
    backgroundFill: new FillStyle({
      color: [255,204,51,.8]
    }),
    backgroundStroke: new StrokeStyle({
      color: '#fff',
      width: 1.5
    })
  }),
  fill: new FillStyle({
    color: [255,255,255,.2]
  }),
  stroke: new StrokeStyle({
    color: [255,204,51,1],
    width: 1.25
  })
});

function measureStyleFn(f) {
  mstyle.getText().setText(f.get('measure'));
  return mstyle
}

export default measureStyleFn
