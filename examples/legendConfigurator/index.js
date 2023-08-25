import charte from '../../charte/macarte'
import Carte from "../../Carte";
import legendConfigurator from '../../dialog/legendConfigurator'


const carte = new Carte({ 
  key: '0gd4sx9gxx6ves3hf3hfeyhw',
  url: '../data/symbolLib.carte',
  target: charte.getAppElement()
});

legendConfigurator(
  carte.getSymbolLib(),
  carte.getControl('legend').getLegend(), {
  title: 'Configurer la légende'
})

/* DEBUG */
window.carte = carte
/**/