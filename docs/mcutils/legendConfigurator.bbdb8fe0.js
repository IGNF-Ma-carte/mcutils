function e(e,t,l,n){Object.defineProperty(e,t,{get:l,set:n,enumerable:!0,configurable:!0})}var t=globalThis,l={},n={},i=t.parcelRequire8969;null==i&&((i=function(e){if(e in l)return l[e].exports;if(e in n){var t=n[e];delete n[e];var i={id:e,exports:{}};return l[e]=i,t.call(i.exports,i,i.exports),i.exports}var r=Error("Cannot find module '"+e+"'");throw r.code="MODULE_NOT_FOUND",r}).register=function(e,t){n[e]=t},t.parcelRequire8969=i);var r=i.register;r("11Wcd",function(t,l){e(t.exports,"default",()=>s);var n=i("iQyfo"),r=i("h5s17");class o extends r.default{constructor(e){let t=(e=e||{}).symbolLib;super({target:e.target,className:"mcSymbolLib"+(e.className?" "+e.className:""),collection:t,getTitle:l=>{if(!(!e.filter||e.filter.indexOf(l.getType())>=0))return(0,n.default).create("DIV",{className:"hidden"});{let e=(0,n.default).create("DIV",{className:"mcSymbol"});e.appendChild(l.getImage());let i=(0,n.default).create("INPUT",{type:"text",placeholder:"nom du symbole",value:l.get("name"),on:{focusout:()=>{delete e.dataset.edit},keydown:t=>{switch(t.key){case"Enter":l.set("name",i.value),r.innerText=i.value;case"Escape":delete e.dataset.edit,t.preventDefault()}}},parent:e}),r=(0,n.default).create("SPAN",{text:l.get("name"),parent:e});return(0,n.default).create("I",{className:"fi-pencil",title:"modifier le nom",click:()=>{e.dataset.edit="",i.focus();let t=i.value;i.value="",i.value=t},parent:e}),(0,n.default).create("I",{className:"fg-color",title:"modifier / dupliquer le style",click:()=>{this.dispatchEvent({type:"item:duplicate",item:l})},parent:e}),(0,n.default).create("i",{className:"fi-delete",title:"supprimer le style",click:()=>{t.remove(l),this.dispatchEvent({type:"item:remove"})},parent:e}),e}}})}}var s=o}),r("h5s17",function(t,l){e(t.exports,"default",()=>o);var n=i("fnScq"),r=i("iQyfo"),o=class extends n.default{constructor(e){super(),this.element=(0,r.default).create("UL",{className:("ol-collection-list "+(e.className||"")).trim(),parent:e.target}),this._title="function"==typeof e.getTitle?e.getTitle:function(e){return e.title},this.setCollection(e.collection)}removeCollection(){this.collection&&(this.collection.un("change:length",this._update),this.collection=null)}setCollection(e){this.removeCollection(),this.collection=e,this.refresh(),this.collection&&(this._update=(function(){if(!this._reorder){this.refresh();var e=this.getSelectPosition();e<0?this.dispatchEvent({type:"item:select",position:-1,item:null}):this.dispatchEvent({type:"item:order",position:e,item:this._currentItem})}}).bind(this),this.collection.on("change:length",this._update))}select(e){if(e!==this._currentItem){var t=-1;this._listElt.forEach(function(l,n){l.item!==e?l.li.classList.remove("ol-select"):(l.li.classList.add("ol-select"),t=n)}),this._currentItem=t>=0?e:null,this.dispatchEvent({type:"item:select",position:t,item:this._currentItem})}}selectAt(e){this.select(this.collection.item(e))}getSelect(){return this._currentItem}getSelectPosition(){return this.collection?this.collection.getArray().indexOf(this._currentItem):-1}refresh(){this.element.innerHTML="",this._listElt=[],this.collection&&this.collection.forEach((e,t)=>{var l=(0,r.default).create("LI",{html:this._title(e),className:this._currentItem===e?"ol-select":"","data-position":t,on:{click:(function(){this.select(e)}).bind(this),dblclick:(function(){this.dispatchEvent({type:"item:dblclick",position:t,item:e})}).bind(this)},parent:this.element});this._listElt.push({li:l,item:e});var n=(0,r.default).create("DIV",{className:"ol-noscroll ol-order",parent:l}),i=t,o=(function(e){for(var t="touch"===e.pointerType?document.elementFromPoint(e.clientX,e.clientY):e.target;t&&t.parentNode!==this.element;)t=t.parentNode;if(t&&t!==l){var n=parseInt(t.getAttribute("data-position"));t.getAttribute("data-position")<i?(t.insertAdjacentElement("beforebegin",l),i=n):(t.insertAdjacentElement("afterend",l),i=n+1)}}).bind(this),s=(function(){document.removeEventListener("pointermove",o),document.removeEventListener("pointerup",s),document.removeEventListener("pointercancel",s),i!==t&&(this._reorder=!0,this.collection.removeAt(t),this.collection.insertAt(i>t?i-1:i,e),this._reorder=!1,this.dispatchEvent({type:"item:order",position:i>t?i-1:i,oldPosition:t,item:e}),this.refresh())}).bind(this);n.addEventListener("pointerdown",(function(){this.select(e),document.addEventListener("pointermove",o),document.addEventListener("pointerup",s),document.addEventListener("pointercancel",s)}).bind(this))})}}}),r("9Mq5w",function(e,t){var l,n,i,r=e.exports={};function o(){throw Error("setTimeout has not been defined")}function s(){throw Error("clearTimeout has not been defined")}function a(e){if(l===setTimeout)return setTimeout(e,0);if((l===o||!l)&&setTimeout)return l=setTimeout,setTimeout(e,0);try{return l(e,0)}catch(t){try{return l.call(null,e,0)}catch(t){return l.call(this,e,0)}}}!function(){try{l="function"==typeof setTimeout?setTimeout:o}catch(e){l=o}try{n="function"==typeof clearTimeout?clearTimeout:s}catch(e){n=s}}();var c=[],u=!1,d=-1;function m(){u&&i&&(u=!1,i.length?c=i.concat(c):d=-1,c.length&&f())}function f(){if(!u){var e=a(m);u=!0;for(var t=c.length;t;){for(i=c,c=[];++d<t;)i&&i[d].run();d=-1,t=c.length}i=null,u=!1,function(e){if(n===clearTimeout)return clearTimeout(e);if((n===s||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(e);try{n(e)}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}(e)}}function p(e,t){this.fun=e,this.array=t}function h(){}r.nextTick=function(e){var t=Array(arguments.length-1);if(arguments.length>1)for(var l=1;l<arguments.length;l++)t[l-1]=arguments[l];c.push(new p(e,t)),1!==c.length||u||a(f)},p.prototype.run=function(){this.fun.apply(null,this.array)},r.title="browser",r.browser=!0,r.env={},r.argv=[],r.version="",r.versions={},r.on=h,r.addListener=h,r.once=h,r.off=h,r.removeListener=h,r.removeAllListeners=h,r.emit=h,r.prependListener=h,r.prependOnceListener=h,r.listeners=function(e){return[]},r.binding=function(e){throw Error("process.binding is not supported")},r.cwd=function(){return"/"},r.chdir=function(e){throw Error("process.chdir is not supported")},r.umask=function(){return 0}}),r("agEcb",function(e,t){function l(t){return e.exports=l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e.exports.__esModule=!0,e.exports.default=e.exports,l(t)}e.exports=l,e.exports.__esModule=!0,e.exports.default=e.exports});var o=i("gXJm2"),s=i("cvawf"),a=i("kbFhP"),c=i("iQyfo"),u=i("11Wcd"),d=i("fnScq"),m=i("h5s17"),f=i("3HxCM"),p=i("bJF7J"),h=i("kkNxo"),g=i("cHblF");class y extends d.default{constructor(e){super(e=e||{});let t=this.element=(0,c.default).create("DIV",{className:"mc-legend-control"}),l=(0,c.default).create("DIV",{className:"title",parent:t});(0,c.default).create("H3",{text:"Bibliothèque de symboles",parent:l}),(0,c.default).create("H3",{text:"Légende",parent:l}),(0,c.default).create("A",{html:"Ajouter un sous-titre...",parent:l,click:()=>{let e=Math.max(this.legendInput.getSelectPosition(),0);r.insertAt(e,new p.default({title:""})),this.legendInput.selectAt(e),this.legendInput.element.querySelectorAll(".fi-pencil")[e].click()}}),(0,c.default).create("A",{html:"Vider la légende...",parent:l,click:()=>{r.getLength()&&(0,h.default).showAlert("Etes-vous sur de vouloir supprimer toutes les lignes de la légende ?",{ok:"ok",cancel:"cancel"},e=>{"ok"===e&&r.clear()})}}),this.symbolInput=new u.default({className:"symbol",symbolLib:e.symbolLib,target:t}),this.symbolInput.on("item:select",e=>{e.item?t.dataset.symbol="":delete t.dataset.symbol}),this.symbolInput.addEventListener("item:dblclick",()=>{i.click()});let n=(0,c.default).create("DIV",{className:"mc-control",parent:t}),i=(0,c.default).create("BUTTON",{className:"button button-colored play",html:'<i class="fi-play"></i>',title:"ajouter à la légende",click:()=>{let e=this.symbolInput.getSelect();if(!e)return;let t=this.legendInput.getSelectPosition()+1;r.insertAt(t,new p.default({title:e.get("name")||"",feature:e._feature.clone()})),this.legendInput.selectAt(t)},parent:n});(0,c.default).create("BUTTON",{className:"button button-colored playback",html:'<i class="fi-play"></i>',title:"ajouter à la bibliothèque",click:()=>{let t=this.legendInput.getSelect();if(!t||!t.get("feature"))return;let l=this.symbolInput.getSelectPosition()+1;e.symbolLib.insertAt(l,new g.default({name:t.get("title").replace(/\n/g," ")||"",feature:t.get("feature").clone()})),this.symbolInput.selectAt(l)},parent:n});let r=e.legend.getItems();this.legendInput=new m.default({collection:r,className:"mcSymbolLib",getTitle:t=>{let l=t instanceof f.default,n=l?"Calque - "+t._layer.get("title"):t.get("title"),i=t.getProperties(),r=(0,c.default).create("DIV",{className:"mcSymbol"+(i.feature?" item":" title")+(l?" layer":"")});r.appendChild((0,f.default).getLegendImage(i));let o=(0,c.default).create("SPAN",{html:n.replace(/\n/,"<br/>")+"&nbsp;",parent:r}),s=(0,c.default).create("TEXTAREA",{placeHolder:i.feature?"":"sous-titre...",parent:r});return l||(0,c.default).create("I",{className:"fi-pencil",click:()=>{s.style.display="block",s.value=n,s.focus(),s.addEventListener("focusout",()=>{s.style.display="",t.set("title",s.value),o.innerHTML=t.get("title").replace(/\n/,"<br/>")+"&nbsp;",e.legend.refresh()})},parent:r}),(0,c.default).create("i",{className:"fi-delete",click:()=>{e.legend.getItems().remove(t),this.symbolInput.dispatchEvent({type:"item:remove"})},parent:r}),r},target:t}),this.legendInput.addEventListener("item:dblclick",e=>{this.legendInput.element.querySelectorAll(".fi-pencil")[e.position].click()}),this.legendInput.on("item:select",e=>{e.item&&e.item.get("feature")?t.dataset.legend="":delete t.dataset.legend})}}y.prototype.remove=function(){this.symbolInput.removeCollection(),this.legendInput.removeCollection()};var c=i("iQyfo");const b=new s.default({key:"0gd4sx9gxx6ves3hf3hfeyhw",url:"../data/symbolLib.carte",target:(0,o.default).getAppElement()});!function(e,t,l){l=l||{};let n=new y({symbolLib:e,legend:t});(0,a.default).show({title:l.title||"Légende",className:l.className,content:n.element,buttons:["ok"]});let i=[];if((l.layers||[]).forEach(e=>{e._legend&&i.push(e)}),i.length){let e=(0,c.default).create("DIV",{className:"layerLegend",parent:(0,a.default).getContentElement()});(0,c.default).create("LABEL",{text:"Utliser la légende du calque : ",parent:e});let l=(0,c.default).create("SELECT",{change:()=>{let e=parseInt(l.value);e>-1&&(0>t.getItems().getArray().indexOf(i[e]._legend)&&t.addItem(i[e]._legend),n.legendInput.select(i[e]._legend)),l.value=-1},parent:e});(0,c.default).create("OPTION",{text:"...",value:-1,parent:l}),i.reverse().forEach((e,t)=>{(0,c.default).create("OPTION",{text:e.get("title")||e.get("name"),value:t,parent:l})})}let r=()=>{n.remove(),(0,a.default).un("hide",r)};(0,a.default).on("hide",r),a.default}(b.getSymbolLib(),b.getControl("legend").getLegend(),{title:"Configurer la légende"}),window.carte=b;