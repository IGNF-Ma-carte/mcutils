import ol_ext_element from "ol-ext/util/element";

import './mdCalendar.css'

// French bank hollidays
function joursFeries(an, alsace){
  const bank = {}
  const setDay = function(month, day, info) {
    if (!bank[month]) bank[month] = {}
    bank[month][day] = info
  }
  // Jour de l'an
  setDay(1, 1,'Jour de l\'an');
  setDay(5, 1, 'Fête du travail');
  setDay(5, 8, 'Victoire 1945')
  setDay(7, 14, 'Fête nationale')
  setDay(8, 15, 'Assomption')
  setDay(11, 1, 'Toussaint')
  setDay(11, 11, 'Armistice')
  setDay(12, 25, 'Noël')
	
	const G = an%19
	const C = Math.floor(an/100)
	const H = (C - Math.floor(C/4) - Math.floor((8*C+13)/25) + 19*G + 15)%30
	const I = H - Math.floor(H/28)*(1 - Math.floor(H/28)*Math.floor(29/(H + 1))*Math.floor((21 - G)/11))
	const J = (an*1 + Math.floor(an/4) + I + 2 - C + Math.floor(C/4))%7
	const L = I - J
	const MoisPaques = 3 + Math.floor((L + 40)/44)
	const JourPaques = L + 28 - 31*Math.floor(MoisPaques/4)
  setDay(MoisPaques, JourPaques, 'Pâques');
	const LundiPaques = new Date(an, MoisPaques-1, JourPaques+1)
  setDay(LundiPaques.getMonth() + 1, LundiPaques.getDate(), 'Lundi de Pâques')
	const Ascension = new Date(an, MoisPaques-1, JourPaques+39)
  setDay(Ascension.getMonth() + 1, Ascension.getDate(), 'Ascension')
	const Pentecote = new Date(an, MoisPaques-1, JourPaques+49)
  setDay(Pentecote.getMonth() + 1, Pentecote.getDate(), 'Pentecote')
	const LundiPentecote = new Date(an, MoisPaques-1, JourPaques+50)
  setDay(LundiPentecote.getMonth() + 1, LundiPentecote.getDate(), 'Lundi de Pentecôte')
	
  if (alsace) {
    const VendrediSaint = new Date(an, MoisPaques-1, JourPaques-2)
    setDay(VendrediSaint.getMonth() + 1, VendrediSaint.getDate(), 'VendrediSaint')
    setDay(12, 26, 'Saint Étienne')
  }

	return bank;
}

// Decode params
function getParams(data) {
  const lines = data.split('\n');
  const atts = { open: {}, close: {} }
  lines.forEach(d => {
    const i = d.indexOf(':');
    const k = d.substr(0,i);
    let val = d.substr(i+1).trim();
    switch(k) {
      case 'open':
      case 'close': {
        val = val.split(' ');
        const date = val.shift().split(/\/|-/);
        date[1] = (date[1] || '0').replace(/^0/, '');
        date[2] = (date[2] || '0').replace(/^0/, '');
        val = val.join(' ');
        if (!atts[k][date[0]]) atts[k][date[0]] = {}
        if (!atts[k][date[0]][date[1]]) atts[k][date[0]][date[1]] = {}
        atts[k][date[0]][date[1]][date[2]] = val.trim() || true;
        break;
      }
      default: {
        atts[k] = val;
        break;
      }
    }
  })
  return atts;
}

/** Prepare image Slider
 * @private
 */
function prepareCalendar(type, data) {
  type = type.split(' ');
  
  const atts = getParams(data);
  const content = ol_ext_element.create('DIV');

  // Decode dates
  try {
    // Date attribute
    atts.dates = JSON.parse(atts.dates)
    ol_ext_element.create('TEXTAREA', { text: JSON.stringify(atts.dates), parent: content })
  } catch(e) {
    const dates = { week: {}, years: atts.open };
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d => {
      if (atts.hasOwnProperty(d)) {
        dates.week[d] = atts[d]
      }
    })
    ol_ext_element.create('TEXTAREA', { text: JSON.stringify(dates), parent: content })
  }

  return '<div class="mdCalendar">' + content.innerHTML + '</div>';
}

// Check if the date match
function isCheck(date, dates) {
  // Week or year
  if (dates.week && Object.keys(dates.week).length) {
    const day = date.toLocaleString('en-US', { weekday: 'short' })
    return dates.week[day]
  } else if (dates.years){
    const year = date.getFullYear()
    const month = date.getMonth() +1;
    if (dates.years[year] && dates.years[year][month]) {
      return dates.years[year][month][date.getDate()]
    }
    return false;
  }
  // nothing
  return false
}

// Format date
const optDate = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}

/** Create calendar from element
 * @namespace md2html
 * @param {Element} element
 */
function mdCalendar(element) {
  // Format calendars
  element.querySelectorAll('.mdCalendar').forEach(calendar => {
    const txt = calendar.querySelector('textarea')
    // Not done
    if (txt) {
      const atts = JSON.parse(txt.value);
      // Mark as done
      txt.remove();

      const dates = atts || {};
      const today = new Date()
      const lang = navigator.userLanguage;

      // Show calendar
      const content = ol_ext_element.create('DIV', { parent: calendar })

      showCalendar(content, dates, today, lang);
    }
  })
}

/** Create calendar */
function showCalendar(content, dates, yet, lang) {
  const today = new Date()
  // Clear
  content.innerHTML = '';
  // Title
  ol_ext_element.create('H3', { text: yet.toLocaleDateString(lang, { month: 'long' }), parent: content });
  ol_ext_element.create('BUTTON', { 
    className: 'prev', 
    click: () => {
      const next = new Date(yet.getTime() - 31*oneDay)
      showCalendar(content, dates, next, lang)
    },
    parent: content
  });
  ol_ext_element.create('BUTTON', { 
    className: 'next', 
    click: () => {
      const next = new Date(yet.getTime() + 31*oneDay)
      showCalendar(content, dates, next, lang)
    },
    parent: content
  });

  const header = ol_ext_element.create('DIV', { className: 'mdHeader', parent: content });
  ['L','M','M','J','V','S','D'].forEach(d => {
    ol_ext_element.create('DIV', { 
      className: 'mdTitle', 
      text: d,
      parent: header
    })
  })
  // Calendar
  const oneDay = 1000*60*60*24;
  // First day of the current month
  const firstDay = new Date(yet.getTime())
  firstDay.setDate(0)
  // Start calendar at
  const startDate = new Date(firstDay.getTime() - oneDay * firstDay.getDay())
  // Show current month
  for (let d = 1; d <= 7*7; d++) {
    const date = new Date(startDate.getTime() + d * oneDay)
    // Last day of the week
    if (d !== 1 && date.getDay()===1) {
      if (date.getMonth() > yet.getMonth()) break;
      if (date.getYear() > yet.getYear()) break;
      ol_ext_element.create('BR', { parent: content })
    }
    const day = ol_ext_element.create('DIV', { 
      className: 'mdDay mdDay'+ date.getDay(), 
      text: date.getDate(),
      parent: content 
    })
    // Today
    if (date.getTime() === today.getTime()) day.classList.add('today')
    // Tomonth
    if (date.getMonth() === yet.getMonth()) day.classList.add('tomonth')
    // is check ?
    const checked = isCheck(date, dates);
    if (checked) {
      day.classList.add('check')
      day.title = checked.length > 3 ? checked : date.toLocaleDateString(lang, optDate);
    }
  }
}

export { prepareCalendar, joursFeries }
export default mdCalendar
