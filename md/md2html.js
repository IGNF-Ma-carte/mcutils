/*
 *	Copyright (c) 2016 Jean-Marc VIGLINO (https://github.com/Viglino),
 *	released under the CeCILL-B license (French BSD license)
 *	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
 *
 */
/* eslint no-useless-escape: "off" */
/* eslint no-constant-condition: ["error", { "checkLoops": false }]*/

import './md2html.css'
import options from '../config/config'

import serviceURL from '../api/serviceURL';
import '../dialog/fullscreen'
import ol_ext_element from 'ol-ext/util/element';

import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

import mdCharts, { prepareCharts } from './mdCharts';
import mdImageSlider, { prepareImageSlider } from './mdImageSlider';
import mdCalendar, { prepareCalendar } from './mdCalendar.js';
import { prepareCard } from './mdCardPrinter';

/* Insert twitter script */
if (document.body.dataset.twitter !== 'no' && !options.noTwitter) {
  const head = document.getElementsByTagName("head")[0] || document.documentElement;
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://platform.twitter.com/widgets.js"
  head.appendChild(script);
}

let nbBlock = 0;

/* Global functions to dispatch an event / do something on the map */
window.appDo = function(type) { 
  const details = [];
  for (let i=1; i<arguments.length; i++) {
    details.push(arguments[i])
  }
  window.dispatchEvent(
    new CustomEvent(type, {
      detail: details
    })
  );
}

/** Simple markdown to html convertor
 * @namespace md2html
 * @example
 * import md2html from 'mcutils/md/md2html'
 * const element = document.getElementById('myId');
 * // Display md in the element
 * element.innerHTML = md2html('# Hello %name%', { name: 'world' })
 * // or
 * md2html.element('# Hello %name%', element, { name: 'world' })
 */

/** Transform a markdown string to an HTML code
 * @function
 * @memberof md2html
 * @param {String} md the markdown text
 * @param {Object} [data] a list of key value to replace in the markdown %key%
 * @param { Object } [options]
 *  @param { Number } [options.shiftTitle] shift title 
 *  @param { boolean } [options.edugeo] replace urls 'https://macarte' to 'https://edugeo' 
 * @return {HTML} HTML code
 */
var md2html = function (md, data, options) {
  options = options || {}
  md = md || '';
  // nbBlock = 0;
  let result = '';
  // Extract code using ```
  md = '\n' + md.replace(/\r\n/g,'\n');
  md.split(/\n`{3,}/).forEach((m,i) => {
    if (i%2) {
      result += md2html.doWidget(m, data);
    } else {
      let part = md2html.mdPart(m, data);
      // Shift titles
      if (options.shiftTitle && options.shiftTitle > 0) {
        for (let i=5; i>0; i--) {
          let rex = new RegExp('<h'+i, 'g')
          part = part.replace(rex, '<h'+(i+options.shiftTitle))
          rex = new RegExp('</h'+i+'>', 'g')
          part = part.replace(rex, '</h'+(i+options.shiftTitle)+'>')
        }
      }
      // Replace edugeo
      if (options.edugeo) {
        part = part.replace(/https:\/\/macarte/g, 'https://edugeo')
      }
      // result
      result += part
    }
  });
  return result;
};

/** Handle widgets (Code, charts,...)
 * @param {String} md the markdown text
 * @param {} data a list of key value to replace in the markdown %key%
 * @return {HTMl} HTML code
 * @private
 */
md2html.doWidget = function (md, data) {
  let c = md.indexOf('\n');
  if (c<0) c = md.length;
  let type = md.substr(0,c);
  md = md.substr(c+1);
  // Handle charts
  switch (type.split(' ').shift()) {
    // Piwik
    case 'piwik': {
      return '<iframe style="border: 0; height: 200px; width: 600px; margin: auto; display: block;" src="https://piwik.ign.fr/piwik/public.php?module=CoreAdminHome&amp;action=optOut&amp;language=fr"></iframe>'
    }
    // Charts
    case 'chart': {
      return prepareCharts(type, md2html.doData(md, data));
    }
    // Image slide
    case 'imageSlider': {
      return prepareImageSlider(type, md2html.doData(md, data));
    }
    // Cards
    case 'card': {
      return prepareCard(type, md2html.doData(md, data));
    }
    // Calendar
    case 'calendar': {
      return prepareCalendar(type, md2html.doData(md, data));
    }
    // Code
    default: {
      return '<pre class="code"><code class="'+type+'">' + md.replace(/</g,'&lt;') + '</code></pre>';
    }
  }
}

/** Handle md part
 * @param {String} md the markdown text
 * @param {} data a list of key value to replace in the markdown %key%
 * @return {HTMl} HTML code
 */
md2html.mdPart = function (md, data) {
  if (!md) return '';
  var i;
  data = data || {};

  // Secure md string
  md = md2html.doSecure(md) +"\n";

  // Images Base64 (save)
  var data64 = [];
  md = md2html.saveImage64(md, data64);

  // Handle icons
  md = md2html.doIcons(md);

  // Handle blocks
  md = md2html.doBlocks(md);

  // Handle charts
  // md = md2html.doChart(md);

  // Table management
  md = md2html.doTable(md);
  // Data management
  md = md2html.doData(md, data);
  md = md2html.saveImage64(md, data64);
  // RegEpx rules
  for (i=0; i<md2html.rules.length; i++) {
    md = md.replace(md2html.rules[i][0], md2html.rules[i][1]);
  }
  // Clean up
  md = md2html.cleanUp(md);
//	console.log(md)

  // Images Base64 (injection)
  md = md2html.restoreImage64(md, data64);
  // Floating images
  md = md2html.floatingImages(md);
  // clean
  md = md.replace(/^<br \/>/, '');
  md = md.replace(/<br \/>$/, '');
  return md;
};

/** floating images
 * @private
 */
md2html.floatingImages = function (md) {
  md = md.replace (/<div class='right'><img([^\<]*)<\/div>/g,"<img class='floatRight' $1");
  md = md.replace (/<div class='left'><img([^\<]*)<\/div>/g,"<img class='floatLeft' $1");
  md = md.replace (/<a ([^\<]*)<br \/><img/g,"<a $1<img");
  return md;
};

/** Create collapsible blocks
 * @private
 */
md2html.doBlocks = function (md) {
  md = md.replace(/\n\[----\]/g, '\n</div></div>');
  var md2;
  var rex = /\n\[--(.*)--\]/;
  while (true) {
    md2 = md.replace(rex, 
      '\n<input class="mdBlock" id="_mdBlock_'+nbBlock+'" type="checkbox"/>'
      +'<div class="mdBlock">'
      +'<label for="_mdBlock_'+nbBlock+'" class="mdBlockTitle">\n'
      +'$1'
      +'\n</label>'
      +'<div class="mdBlockContent">'
    );
    if (md2===md) break;
    else md = md2;
    nbBlock++;
  }
  rex = /\n\[\+\+(.*)\+\+\]/;
  while (true) {
    md2 = md.replace(rex, 
      '\n<input class="mdBlock" id="_mdBlock_'+nbBlock+'" checked="checked" type="checkbox"/>'
      +'<div class="mdBlock">'
      +'<label for="_mdBlock_'+nbBlock+'" class="mdBlockTitle">\n'
      +'$1'
      +'\n</label>'
      +'<div class="mdBlockContent">'
    );
    if (md2===md) break;
    else md = md2;
    nbBlock++;
  }

  return md;
};

/** Save base64 image to avoid large file processing
 * @param {string} md the markdown
 * @param {Array<string>} d64 an array of base64
 * @private
 */
md2html.saveImage64 = function(md, d64) {
  var rex = /\!\(data:image\/[^;]*;base64,([^\)]*)\)/g;
  d64.push (md.match(rex));
  return md.replace(rex, '<base64-'+d64.length+'/>');
};

/** Restore base64 image after processing
 * @param {string} md the markdown
 * @param {Array<string>} d64 an array of base64
 * @private
 */
md2html.restoreImage64 = function(md, d64) {
  for (var k=0; k<d64.length; k++) {
    var rex = new RegExp ('<base64-'+(k+1)+'/>');
    var img64 = d64[k];
    if (img64 && img64.length) {
      for (var i=0; i<img64.length; i++) {
        md = md.replace(rex, '<img src="'+img64[i].replace(/^\!\(/, "").replace(/\)$/, "")+'" />')
      }
    }
  }
  return md;
};

/** Add new rule
 * @param {RegExp} rex RegExp to use in replacement
 * @param {string} rep replacement string
 * @return {string} result md
 * @private
 */
md2html.addRule = function(rex, rep) {
  md2html.rules.push(rex, rep);
}

/** Secure md string: remove code
 * @function doSecure
 * @memberof md2html
 * @param {string} md the markdown
 * @return {string} result md
 * @instance
 */
md2html.doSecure = function(md) {
  return md.replace(/</g, "&lt;")
//    .replace(/>/g, "&gt;")
    .replace(/\'/g,"&apos;")
    .replace(/\"/g,"&quot;");
}

/** handle icons
 * @private
 */
md2html.doIcons = function(md) {
  md = md.replace(/:([a-z]*)-([_,a-z,0-9,-]*):(([a-z,0-9,-]*)?( ([a-z,0-9,-]+))?)?:((rgba?\([^\)]*\)):)/g, '<i class="fa $1-$2 fa-$4 fa-$6" style="color:$8"></i>');
  md = md.replace(/:([a-z]*)-([_,a-z,0-9,-]*):(([a-z,0-9,-]*)?( ([a-z,0-9,-]+))?:)?(([#,0-9,a-z,A-Z]*):)?/g, '<i class="fa $1-$2 fa-$4 fa-$6" style="color:$8"></i>');
  return md;
}

/** A list of key value to replace as %key% > value in md
 * @param {string} md the markdown
 * @param {Objevt} data list of key/value
 * @return {string} result md
 * @private
 */
md2html.doData = function(md, data) {
  // Save ends of exp
  md = md.replace(/\)\)/g,"‡");
  md = md.replace(/\|\|/g,"‾");
  
  // Encode URI?
  const hasURL = /URL\[%(.*)%\]/.test(md);
  
  for (let i in data) if (data[i]) {
    // Conditional display
    md = md.replace(new RegExp("\\(\\(\\?\%"+i+"%([^‡]*)‡",'g'), "$1");
//		md = md.replace(new RegExp("\\(\\(?\%"+i+"%",'g'), "((?%%");
    // Result 
    let param = data[i];
    // Encode URI
    if (hasURL && typeof(param) === 'string') {
      const d = md2html.encodeURI(param);
      md = md.replace(new RegExp('URL\\[%'+i+'%\\]','g'), d);
    } else if (typeof(param) === 'object') {
      // Objects
      try {
        param = JSON.stringify(param)
      } catch(e) {
        param = '{}'
      }
    }
    md = md.replace(new RegExp('%' + this.doSecure(i) + '%','g'), param);
  }

  // Display attributs
  const hasAttr = /%ATTRIBUTES%/.test(md);
  if (hasAttr) {
    let attributes = '<table>';
    for (let i in data) {
      attributes += '<tr><td>' + i + '</td><td>' +data[i] +'</td></tr>'
    }
    attributes += '</table>'
    md = md.replace(/%ATTRIBUTES%/g, attributes);
    md = md.replace(/<\/table><table>/g, '');
  }

  // Conditional display: ((!%att% exp )) => exp / si att est vide
  md = md.replace (/\(\(!\%([^\%](.*))\%([^‡]*)(‡)/g, "$3");
  md = md.replace (/\(\(!([^‡]*)(‡)/g, "");
  // Conditional display: ((?%att% exp )) => exp / si att est rempli
//	md = md.replace (/\(\(\?\%\%([^\)\)]*)(\)\))/g, "$1");
  md = md.replace (/\(\(\?([^‡]*)(‡)/g, "");
  // Conditional display: (( exp %att% exp )) => exp att exp
  md = md.replace (/(\(\()([^\%|‡]*)\%([^\%](.*))\%([^‡|‾]*)(‾)?([^‡|‾]*)(‡)/g, "$7");
  md = md.replace (/\(\(([^‡|‾]*)(‾)?(.*)‡/g, "$1");
  md = md.replace (/%%/g, "%");
  // restore
  md = md.replace(/‡/g,"))");
  md = md.replace(/‾/g,"||");
  return md;
}

/** Encode URI and remove special char
 * @memberof md2html
 * @function encodeUri
 * @param {string} uri
 * @instance
 */
md2html.encodeURI = function(uri) {
  if (!/%25/.test(uri)) {
    uri = encodeURI(uri).replace(/%25/g, '%');
  }
  uri = uri.replace(/,/g,'%2C');
  uri = uri.replace(/\(/g,'%28');
  uri = uri.replace(/\)/g,'%29');
  // console.log('"'+uri+'"')
  return uri;
}

/** Table handler
 * @param {string} md the markdown
 * @return {string} result md
 * @private
 */
md2html.doTable = function(md) {
  // Detect | ---- | ---- |
  md = md.replace(/\n\| ?-{3,}\ ?\|/g, '<table></table>|');
  while (/<\/table>\|\ ?-{3,}/.test(md)) {
    md = md.replace(/<\/table>\|\ ?-{3,}\ ?/g, '</table>');
  }
  md = md.replace(/<\/table>\|?/g, '</table>');
  // Header
  md = md.replace(/\|(.*)\|<table>/g, '<table><tr class="md-header"><td>$1</td></tr>');
  while (/<td>(.*)\|/.test(md)) {
    md = md.replace(/<td>(.*)\|/g, '<td>$1</td><td>');
  }
  // Lines
  while (/<\/table>\n\|([^\n]*)\|\n/.test(md)) {
    md = md.replace(/<\/table>\n\|([^\n]*)\|\n/g, '<tr><td>$1</td></tr></table>\n');
    while (/<td>(.*)\|/.test(md)) {
      md = md.replace(/<td>(.*)\|/g, '<td>$1</td><td>');
    }
  }
  md = md.replace(/<\/table>\n/g,"</table>");
  md = md.replace(/<td>\t/g,"<td class='center'>");
  md = md.replace(/<td>>/g,"<td class='right'>");
  md = md.replace(/<td></g,"<td class='left'>");
  return md;
}

/** Clean endl
 * @param {string} md the markdown 
 * @return {string} result md
 * @private
 */
md2html.cleanUp = function(md) {	
  md = md.replace(/(\<\/h[1-5]\>)\n/g, "$1");
  md = md.replace(/^\n/, '');
  if (md==='\n') md = '';

  // Remove timeline tweet
  md = md.replace(/data-tweet-limit\=\"\"/g,'data-tweet-limit="1"');
  md = md.replace (/<div class='right'><a class="twitter-/g,"<div class='floatRight'><a class=\"twitter-")
  md = md.replace (/<div class='left'><a class="twitter-/g,"<div class='floatLeft'><a class=\"twitter-")
  md = md.replace (/<div class='right'><blockquote /g,"<div class='floatRight' style=\"min-width:200px\"><blockquote ")
  md = md.replace (/<div class='left'><blockquote /g,"<div class='floatLeft' style=\"min-width:200px\"><blockquote ")
  // Facebook
  md = md.replace (/URL_PAGE_CARTE/g, encodeURIComponent(window.location.href));
  
  // Clollapsible blocks
  md = md.replace(/mdBlockTitle\">\n/g,'mdBlockTitle">');
  md = md.replace(/mdBlockContent\">\n/g,'mdBlockContent">');
  md = md.replace(/\n<\/label>/g,'</label>');
  md = md.replace(/\n<\/div><\/div>/g,'</div><\/div>');
  md = md.replace(/<\/div>\n/g,'</div>');

//	md = md.replace(/<\/ul>\n{1,2}/g, '</ul>');
//	md = md.replace(/\<\/ol\>\n{1,2}/g, '</ol>');

  md = md.replace(/<\/p>\n/g, '</p>');

  md = md.replace(/(\<\/h[0-9]>)\n/g, '$1');
  md = md.replace(/(\<hr \/>)\n/g, '$1');
  md = md.replace(/\n/g, '<br />');
  md = md.replace(/\t/g, ' ');

  // Image server
  md = md.replace(/src="image\/voir/g, 'src="' + serviceURL.media);
  return md;
}

/** Array of RegExp rules for conversion
 * @private
 */
md2html.rules = [
  // Headers
  [/#?(.*)\n={5}(.*)/g, "<h1>$1</h1>"],				// h1
// [/#?(.*)\n\-{5}(.*)/g, "<h2>$1</h2>"],				// h2

  [/\n#{6}(.*)/g, "\<h6>$1</h6>"],					// h5
  [/\n#{5}(.*)/g, "\n<h5>$1</h5>"],					// h5
  [/\n#{4}(.*)/g, "\n<h4>$1</h4>"],					// h4
  [/\n#{3}(.*)/g, "\n<h3>$1</h3>"],					// h3
  [/\n#{2}(.*)/g, "\n<h2>$1</h2>"],					// h2
  [/\n#{1}(.*)/g, "\n<h1>$1</h1>"],					// h1

  [/<h([1-6])>\t/g, "<h$1 class='center'>"],			// Center header with tab

  // Blocks
  [/\n\>(.*)/g, '<blockquote>$1</blockquote>'],	  // blockquotes
  [/\<\/blockquote\>\<blockquote\>/g, '\n'],			// fix
  [/\n-{3,}/g, "\n<hr />"],							// hr

  // Keyboard
  [/&lt;kbd ([^>]*)>/g, '<kbd>$1</kbd>'],              // keyboard

  // Lists
  [/\n- ?\[([ |x])\] (.*)/g, '\n<ul><li class="check-$1">$2</li></ul>'],   // check lists

  [/\n\* (.*)/g, '\n<ul><li>$1</li></ul>'],			            // ul lists
  [/\n {1,}\*\ ([^\n]*)/g, '<ul2><li>$1</li></ul2>'],	      // ul ul lists
  [/\n\t\*\ ([^\n]*)/g, '<ul2><li>$1</li></ul2>'],	        // ul ul lists
  [/<\/ul2><ul2>/g, ''],								                    // concat
  [/<\/ul><ul2>([^\n]*)<\/ul2>\n/g, '<ul>$1</ul></ul>\n'],  // indent
  [/\n\<ul\>/g, '<ul>'],							                  	  // fix
  [/<\/ul><ul>/g, ''],							                    	  // concat
  [/<ul2>/g, '<ul>'],
  [/<\/ul2>/g, '</ul>'],

  // Ordered list
  [/\n[0-9]+\. (.*)/g, '<ol><li>$1</li></ol>'],		// ol lists
  [/\<\/ol\>\<ol\>/g, ''],							          // fix

  [/<\/ul>\n([^<ul])/g, '</ul>$1'],						// fix
  [/<\/ol>\n([^<ol])/g, '</ol>$1'],						// fix

  // Automatic links
  [/([^\(])(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=()\u00E0-\u00FC$]*))/g, '$1<a href=\'$2\' target="_blank">$2</a>'],
  // Mailto
  [/([^\(])\bmailto\b\:(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)/gi, '$1<a href=\'mailto:$2\'>$2</a>'],

  /* Twitter */

  // Twitter Share
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/twitter.com\/share ?(\d+)?x?(\d+)?\)/g,
    '<a href="https://twitter.com/share" data-text="$2" data-hashtags="macarte" data-related="IGNFrance" class="twitter-share-button" data-show-count="true" target="_blank">Tweet</a>'],

  // User timeline
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/twitter.com\/([^\/)]*)\/timeline ?(\d+)?x?(\d+)?\)/g,
    '<a class="twitter-timeline" href="https://twitter.com/$3" data-tweet-limit="$4" data-width="$5"><a href="https://twitter.com/$3?cards=false"></a></blockquote>'],
  // Twitter timeline
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/twitter.com\/([^\/)]*)\/timelines\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<a class="twitter-timeline" href="https://twitter.com/$3/timelines/$4" data-tweet-limit="$5" data-width="$6"><a href="https://twitter.com/$3?cards=false"></a></blockquote>'],
  // Twitter grid
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/twitter.com\/([^\/)]*)\/timegrid\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<a class="twitter-grid" href="https://twitter.com/$3/timelines/$4" data-limit="$5"  data-width="$6"><a href="https://twitter.com/$3?cards=false"></a></blockquote>'],
  // Tweet
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/twitter.com\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<blockquote class="twitter-tweet" data-cards="$4hidden" data-dnt="true" data-width="$5" width="$5"><a href="https://twitter.com/$3?cards=false"></a></blockquote>'],

  // FaceBook like
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/www.facebook.com\/like ?(\d+)?x?(\d+)?\)/g,
    '<iframe src="https://www.facebook.com/plugins/like.php?href=URL_PAGE_CARTE&width=165&layout=button_count&action=like&size=small&show_faces=false&share=true&height=20&appId" width="165" height="20" class="facebook-share-button" scrolling="no" frameborder="0" allowTransparency="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>'],
//      '<a class="facebook-share" href="https://www.facebook.com/sharer/sharer.php?u=URL_PAGE_CARTE" target="_new">Partager</a>'],

  // Page FaceBook
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/www.facebook.com\/([^\/)]*)\/posts\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2F$3%2Fposts%2F$4&width=$5&height=$6" width="$5" height="$6" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>'],
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/www.facebook.com\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F$3&tabs=timeline&width=$4" width="$4" height="$5" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>'],

  // Mastodon
  [ /\!(\[([^\[\]]+)?\])?\(mastodon:\/\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g, 
    '<iframe src="https://$3/embed" class="md-stodon" width="$4" height="$5"></iframe>'],

  /* Media */

  // INA.fr
  [ /\!(\[([^\[\]]+)?\])?\(https:\/\/player.ina.fr\/player\/embed\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<iframe class="video" width="300" height="180" frameborder="0" marginheight="0" marginwidth="0" scrolling="no" style="overflow:hidden;width:$4px; height:$5px;" src="https://player.ina.fr/player/embed/$3/wide/0" allowfullscreen></iframe>'],
  // INA/Jalon
  [ /\!(\[([^\[\]]+)?\])?\(InaEdu([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<iframe class="video" width="300" height="180" style="width:$4px; height:$5px;" src="https://fresques.ina.fr/jalons/export/player/InaEdu$3/360x270" allowfullscreen></iframe>'],
  // Youtube
  [ /\!(\[([^\[\]]+)?\])?\(https?:\/\/youtu.be\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<iframe class="video" width="300" height="180" style="width:$4px; height:$5px;" src="https://www.youtube.com/embed/$3" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>'],
  // Dailymotion
  [ /\!(\[([^\[\]]+)?\])?\(https?:\/\/dai.ly\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<iframe class="video" frameborder="0" width="300" height="180" style="width:$4px; height:$5px;" src="https://www.dailymotion.com/embed/video/$3" allowfullscreen></iframe>'],
  // Vimeo
  [ /\!(\[([^\[\]]+)?\])?\(https?:\/\/vimeo.com\/([^ |\)]*) ?(\d+)?x?(\d+)?\)/g,
    '<iframe class="video" frameborder="0" width="300" height="180" style="width:$4px; height:$5px;" src="https://player.vimeo.com/video/$3" allowfullscreen></iframe>'],

  // Audio
  [/\!(\[([^\[\]]+)?\])?\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=\(\)]*)\.[mM][pP]3) ?(\d+)?x?(\d+)?( autoplay)?\)/g,
    '<audio controls style="width:$6px; height:$7px;" $8 title="$2"><source src="$3" type="audio/mpeg">Your browser does not support the audio element.</audio>'],
  // Video
  [/\!(\[([^\[\]]+)?\])?\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=\(\)]*)\.[mM][pP]4) ?(\d+)?x?(\d+)?( autoplay)?\)/g,
    '<video controls style="width:$6px; height:$7px;" $8 title="$2"><source src="$3" type="video/mp4">Your browser does not support the video tag.</video>'],

  // Images
  [/!(\[([^[\]]+)?\])?\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=\u00E0-\u00FC$]*)) ?(\d+)?x?(\d+)?\)/g,
    '<img style="width:$6px; height:$7px;" src="$3" title="$2" />'],
  // Local images
  [/!(\[([^[\]]+)?\])?\((file:\/\/\/([-a-zA-Z0-9@:%_+.~#?&/=]*)) ?(\d+)?x?(\d+)?\)/g,
    '<img style="width:$5px; height:$6px;" src="$3" title="$2" />'],
  // assets images
  [/!(\[([^[\]]+)?\])?\((assets:\/\/([-a-zA-Z0-9@:%_+.~#?&/=]*)) ?(\d+)?x?(\d+)?\)/g,
    '<img style="width:$5px; height:$6px;" src="./$4" title="$2" />'],

  // Internal images
  [/\!(\[([^\[\]]+)?\])?\((img_|thumb_)?([a-z]{3}[0-9]+(\.(jpe?g|png|gif|svg))?) ?(\d+)?x?(\d+)?\)/g,
  '<img style="width:$7px; height:$8px;" src="image/voir/$3$4" title="$2" />'],

  // links
  [/\[([^[\]]+)?\]\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=\u00E0-\u00FC$]*)) ?([^)]*)?\)/g,
    '<a href="$2" title="$5" target="_blank">$1</a>'],
  [/\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=\u00E0-\u00FC$]*)) ?([^)]*)?\)/g,
    '<a href="$1" title="$4" target="_blank">$1</a>'],
  [/\[([^[\]]+)?\]\(# ([^)]*)?\)/g,
    '<a href="#" class="" title="$2">$1</a>'],

  // Mailto
  [/\[([^[]+)?\]\(\bmailto\b:(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)\)/gi, '<a href=\'mailto:$2\'>$1</a>'],
  [/\(\bmailto\b:(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)\)/gi, '<a href=\'mailto:$1\'>$1</a>'],
  // tel
  [/\[([^[]+)?\]\(tel:([0-9+-]+)\)/g, '<a href=\'tel:$2\'>$1</a>'],
  [/\(tel:([0-9+-]+)\)/g, '<a href=\'tel:$1\'>$1</a>'],

  // Zoom image
  [/\[([^[]+)?\]\(app:\/\/fullscreen\)/g,
    '<a class="fullscreen" onclick="fullscreen(this)" target="_blank">$1</a>'],

  // moveTo
  [/\[([^[]+)?\]\(app:\/\/moveTo\?([-\d.]*),([-\d.]*)(,([\d.]*))? ?([^)]*)?\)/g,
    '<a class="moveTo" onclick="appDo(\'moveTo\',$2,$3$4)" title="$6" target="_blank">$1</a>'],
  // flyTo
  [/\[([^[]+)?\]\(app:\/\/flyTo\?([-\d.]*),([-\d.]*)(,([\d.]*))? ?([^)]*)?\)/g,
    '<a class="moveTo" onclick="appDo(\'flyTo\',$2,$3$4)" title="$6" target="_blank">$1</a>'],
  // stepTo
  [/\[([^[]+)?\]\(app:\/\/stepTo\?([\d.]*) ?([^)]*)?\)/g,
    '<a class="stepTo" onclick="appDo(\'stepTo\',$2)" title="$3" target="_blank">$1</a>'],

  // Code
  [/`(.*?)`/g, '<code>$1</code>'],					    // inline code
  [/\n {4,}(.*)/g, '<pre>$1</pre>'],					  // Code
  [/\n\t(.*)/g, '<pre>$1</pre>'],						    // Code
  [/<\/pre><pre>/g, '<br/>'],							      // fix
  [/<\/pre>\n/g, '</pre>'],							        // fix

  // format
  [/(\\\*)/g, '&#42;'],								          // escape *
  [/(\*\*)([^]*?)\1/g, '<strong>$2</strong>'],  // bold
  [/(\*)([^]*?)\1/g, '<em>$2</em>'],					  // emphasis
  [/<strong><\/strong>/g, '****'],				      // fix bold
  [/<em><\/em>/g, '**'],							          // fix em
  [/(__)(.*?)\1/g, '<u>$2</u>'],						    // underline
  [/(~~)(.*?)\1/g, '<del>$2</del>'],				    // del

  // alignement https://github.com/jgm/pandoc/issues/719
  [/\n\|&lt;>([^\n]*)/g, "\n<pc>$1</pc>"],			// center |<>
  [/\n\|\t([^\n]*)/g, "\n<pc>$1</pc>"],				  // center |[tab]
  [/\n\|&lt;([^\n]*)/g, "\n<pl>$1</pl>"],				// left |<
  [/\n\|>([^\n]*)/g, "\n<pr>$1</pr>"],				  // rigth |>
  [/<\/pc>\n<pc>/g, "<br/>"],
  [/<\/pl>\n<pl>/g, "<br/>"],
  [/<\/pr>\n<pr>/g, "<br/>"],
  [/<pc>/g, "<div class='center'>"],					  //	fix
  [/<pl>/g, "<div class='left'>"],					    //	fix
  [/<pr>/g, "<div class='right'>"],					    //	fix
  [/<\/pc>|<\/pl>|<\/pr>/g, "</div>"],					//	fix

  // French typo
  [/ ([\?|\!|;|:])/g, '&nbsp;$1'],

  //
  [/\(c\)/g, "&copy;"],									// (c)
  [/\(r\)/g, "&reg;"],									// (R)
  [/\(TM\)/g, "&trade;"],								// (TM)

  // subscript / supperscript
  [/\^\(\_([^)]*)\)/g, "<sub>$1</sub>"],// sub
  [/\^\(([^)]*)\)/g, "<sup>$1</sup>"],  // sup

  // <br>
  [/&lt;br\>/g, "<br />"]								// br

];

/** Create an element with the given markdown
 * @function element
 * @memberof md2html
 * @param { string } md
 * @param { Element} [element] create one if none
 * @param { Object } [data]
 * @param { Object } [options]
 *  @param { Number } [options.shiftTitle] shift title 
 *  @param { boolean } [options.edugeo] replace urls 'https://macarte' to 'https://edugeo' 
 * @returns {Element}
 * @instance
 */
md2html.element = function(md, element, data, options) {
  options = options || {}
  if (!(element instanceof Element)) element = ol_ext_element.create('DIV', { className: 'md' });
  element.innerHTML = md2html(md, data, options);
  md2html.renderWidget(element);
  return element;
}

/** Get a makdown as text
 * @function text
 * @memberof md2html
 * @param {string} md
 * @param {Object} [data]
 * @param {booelan} escapeHTML
 * @returns {string}
 * @instance
 */
md2html.text = function(md, data, escapeHTML) {
  const element = ol_ext_element.create('DIV');
  // Add space and set content
  element.innerHTML = md2html(md, data).replace(/<\//g,' </').replace(/<br ?\/>/ig,' <br/>');
  // Remove widgets (charts)
  element.querySelectorAll('.md-chart').forEach(d => d.remove());
  // Remove widgets (calendar)
  element.querySelectorAll('.mdCalendar').forEach(d => d.remove());
  // Return text
  if (escapeHTML) {
    return element.innerText.replace(/</g, '&lt');
  } else {
    return element.innerText;
  }
}


/** Load widget inside the element (twitter, charts, etc.)
 * @function renderWidget
 * @memberof md2html
 * @param {Element} element
 * @instance
 */
md2html.renderWidget = function(element) {
  if (window.twttr) {
    window.twttr.widgets.load(element);
  } else {
    console.error('Twitter is not loaded...')
  }
  // Hightlight code
  element.querySelectorAll('pre.code code').forEach(block => {
    hljs.highlightBlock(block);
  });

  // Create charts
  mdCharts(element);
  // Create Slider
  mdImageSlider(element);
  // Create Calendar
  mdCalendar(element);

}

/** Render icons in a markdown text
 * @memberof md2html
 * @param {Element} element
 * @instance
 */
md2html.iconize = function(md) {
  return md2html.doIcons(md2html.doSecure(md))
}

export default md2html
