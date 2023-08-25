const themes = {
  agriculture: {
    title: 'Agriculture',
    search: 'agriculture'
  },
  culture: {
    title: 'Culture et patrimoine',
    search: 'culture'
  },
  developpement: {
    title: 'Développement durable, énergie, climat',
    search: 'd.veloppement'
  },
  economie: {
    title: 'Économie et statistiques',
    search: 'conomie'
  },
  education: {
    title: 'Éducation(géographie,histoire..)',
    search: 'ducation'
  },
  international: {
    title: 'International et Europe',
    search: 'international'
  },
  sante: {
    title: 'Santé et Social',
    search: 'sant.'
  },
  societe: {
    title: 'Tourisme et loisirs',
    search: 'tourisme'
  },
  transports: {
    title: 'Territoires, aménagements et transports',
    search: 'transport'
  },
  innovation: {
    title: 'Innovation et numérique',
    search: 'innovation'
  },
}

function getThemeID(th) {
  for (let i in themes) {
    const rex = new RegExp(themes[i].search, 'i');
    if (rex.test(th)) return i;
  }
}

export { getThemeID }
export default themes
