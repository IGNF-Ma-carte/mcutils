function e(e,t,a,l){Object.defineProperty(e,t,{get:a,set:l,enumerable:!0,configurable:!0})}var t=globalThis,a={},l={},s=t.parcelRequire8969;null==s&&((s=function(e){if(e in a)return a[e].exports;if(e in l){var t=l[e];delete l[e];var s={id:e,exports:{}};return a[e]=s,t.call(s.exports,s,s.exports),s.exports}var i=Error("Cannot find module '"+e+"'");throw i.code="MODULE_NOT_FOUND",i}).register=function(e,t){l[e]=t},t.parcelRequire8969=s);var i=s.register;i("c86V7",function(t,a){e(t.exports,"default",()=>o);var l=s("iQyfo"),i=s("fnScq"),r=s("2iBkg"),n=s("jmRXz");class u extends i.default{constructor(e){super(e=e||{}),this.input=e.input||(0,l.default).create("INPUT",{type:"url",parent:e.parent}),this.input.placeholder=e.placeholder||"Url de l'image",this.input.type="text",this.value=this.input.value,this.set("fullpath",e.fullpath);let t=this.element=(0,l.default).create("DIV",{className:"mc-input-media"});this.input.parentNode.insertBefore(t,this.input),this._imgDiv=(0,l.default).create("DIV",{className:"mc-img",parent:t});let a=this._img=new Image;a.onerror=()=>{t.classList.remove("loading"),this._imgDiv.style["background-image"]="",this.input.value?this.input.classList.add("invalid"):this.input.classList.remove("invalid"),this.value="",this.dispatchEvent({type:"load",value:this.value,error:!0})},a.onload=()=>{if(t.classList.remove("loading"),this._imgDiv.style["background-image"]="url("+a.src+")",this.value=a.src,this.input.classList.remove("invalid"),this.set("crossOrigin",!1),e.useCors){let e=new Image;e.crossOrigin="anonymous",e.onload=()=>{this.set("crossOrigin","anonymous"),this.dispatchEvent({type:"load",value:this.value})},e.onerror=()=>{this.dispatchEvent({type:"load",value:this.value})},e.src=a.src}else this.dispatchEvent({type:"load",value:this.value})},this.value&&(a.src=(0,r.getMediaURL)(this.value)),t.appendChild(this.input),this.input.addEventListener("change",()=>{this.setValue(this.input.value),this.value="",s.style.display=this.input.value?"":"none"}),this.input.addEventListener("keyup",()=>{s.style.display=this.input.value?"":"none"});let s=(0,l.default).create("BUTTON",{className:"delete",type:"button",style:{display:this.input.value?"":"none"},title:e.btnTitle||"Chercher dans la galerie...",html:'<i class="fa fa-times"></i>',click:()=>{this.value="del",this.setValue(""),this.input.focus()},parent:t}),i=e.thumb;(0,l.default).create("BUTTON",{className:"button-colored user-media",type:"button",title:e.btnTitle||"Chercher dans la galerie...",html:'<i class="fi-galerie-image"></i>',click:()=>{(0,n.default)({thumb:i,add:e.add,callback:e=>{i=e.thumb;let t=e.thumb?e.item.thumb_url:e.item.view_url;this.get("fullpath")?this.setValue(t):this.setValue(t.split("/").pop())}})},parent:t})}}u.prototype.getValue=function(){return this.input.value},u.prototype.setValue=function(e){this.value!==e&&(this.value=e,this.element.classList.add("loading"),this.input.value=e,this._img.src=(0,r.getMediaURL)(e),this.input.dispatchEvent(new Event("change")))};var o=u}),i("kMG75",function(t,a){let l;e(t.exports,"default",()=>u);var i=s("fnScq"),r=s("iQyfo");class n extends i.default{constructor(e,t){super(),t=t||{},this.set("full",!!t.full),this.api=e;let a=this.element=(0,r.default).create("DIV",{className:"author-list",parent:t.target}),l=this.searchInput=(0,r.default).create("INPUT",{type:"text",className:"author",placeholder:"chercher un membre...",parent:a});(0,r.default).create("I",{className:"loading",parent:a});let s=(0,r.default).create("UL",{className:"autocomplete",parent:a});l.addEventListener("keyup",()=>{this.autocompleteAuthor(l.value,s)}),l.addEventListener("focus",()=>{s.style.display="block"}),l.addEventListener("focusout",()=>{setTimeout(()=>s.style.display="none",200)})}}n.prototype.setUser=function(e){this.searchInput.value=e},n.prototype.autocompleteAuthor=function(e,t){e!==this._currentSearch&&(this._currentSearch=e,l&&clearTimeout(l),this.element.dataset.loading="",l=setTimeout(()=>{if(!e){t.innerHTML="",delete this.element.dataset.loading;return}this.get("full")?this.api.getUsers(e,e=>{delete this.element.dataset.loading,t.innerHTML="",e&&e.forEach&&e.forEach(e=>{let a=(0,r.default).create("LI",{text:e.public_name,className:"full",click:()=>{this.dispatchEvent({type:"select",user:e})},parent:t});e.profile_picture&&(0,r.default).create("IMG",{src:e.profile_picture,parent:a})})}):this.api.searchMapUsers({public_name:e},e=>{delete this.element.dataset.loading,t.innerHTML="",e&&e.forEach&&e.forEach(e=>{(0,r.default).create("LI",{html:e,click:()=>{this.dispatchEvent({type:"select",public_name:e})},parent:t})})})},500))};var u=n});var r=s("2Fada"),n=s("gXJm2");s("gIJof");var u=s("jmRXz"),o=s("j0fq3"),d=s("c86V7"),c=s("iQyfo");s("kbFhP");var h=s("kkNxo");document.querySelector("button").addEventListener("click",()=>{(0,u.default)({thumb:!1,add:!0,callback:console.log})}),(0,n.default).setApp("media","Médias");const p=new d.default({thumb:!1,add:!0,fullpath:!0,input:document.querySelector("input")}),f=new o.default(r.default,{selection:!0,search:!0,check:!0,limit:!0,target:(0,n.default).getAppElement()}),m=f.getHeaderElement();f.on(["check","draw:list"],()=>{let e=m.querySelectorAll("button.select");f.getChecked().length?e.forEach(e=>e.classList.remove("button-disabled")):e.forEach(e=>e.classList.add("button-disabled"))}),(0,c.default).create("BUTTON",{className:"button button-ghost",html:'<i class="fa fa-plus-circle fa-fw"></i> Ajouter un média...',click:()=>{(0,u.addMediaDialog)({callback:e=>{e.error||(f.updateFolders(),f.setFolder(e.item.folder))}},f.get("folders"))},parent:m}),(0,c.default).create("BUTTON",{className:"button button-ghost select",html:'<i class="fi-galerie-image fa-fw"></i> Modifier un média...',click:()=>{(0,u.updateMediaDialog)({media:f.getChecked()[0],folders:f.get("folders"),callback:e=>{e.error||(f.updateFolders(),f.setFolder(e.item.folder))}})},parent:m}),(0,c.default).create("BUTTON",{className:"button button-ghost select",html:'<i class="fa fa-folder fa-fw"></i> Changer de dossier...',click:()=>{let e=f.getChecked();if(!e||!e.length){(0,h.default).showMessage("Sélectionnez des images à changer de dossier...");return}f.getFolderDialog({prompt:"Nom du dossier où déplacer les images :"},t=>{let a=l=>{if(l&&l.error){(0,h.default).showAlert("Une erreur est survenue !<br/>Impossible de changer de dossier..."),f.updateFolders(),f.showPage();return}let s=e.pop();s?s.folder!==t?(0,r.default).updateMediaFolder(s.id,t,a):a():(f.updateFolders(),f.showPage())};a()})},parent:m}),(0,c.default).create("BUTTON",{className:"button button-accent select",html:'<i class="fa fa-trash fa-fw"></i> Supprimer...',click:()=>{let e=f.getChecked();if(!e||!e.length){(0,h.default).showMessage("Sélectionnez des images à supprimer...");return}let t=a=>{if(a&&a.error){(0,h.default).showAlert("Une erreur est survenue !<br/>Impossible de supprimer une image..."),f.showPage(f.get("currentPage"));return}let l=e.pop();l?(0,r.default).deleteMedia(l.id,t):f.updateFolders(e=>{0>e.indexOf(f.get("folder"))?f.setFolder():f.showPage(f.get("currentPage"))})};(0,h.default).showAlert("Êtes-vous sûr de vouloir supprimer <b>"+e.length+"</b> image"+(e.length>1?"s ?":" ?")+'<br/>Une fois supprimées, les images ne s\'afficheront plus sur les cartes.<br/><b class="accent">Cette action est irréversible.</b>',{ok:"supprimer",cancel:"annuler"},e=>{"ok"===e&&t(),(0,h.default).close()}),(0,h.default).element.querySelector(".ol-buttons input").className="button button-accent"},parent:m}),f.showPage(),(0,r.default).on(["login","logout"],()=>{let e=document.querySelectorAll("button");(0,r.default).isConnected()?e.forEach(e=>e.classList.remove("button-disabled")):e.forEach(e=>e.classList.add("button-disabled")),f.updateFolders(),f.search()}),console.log((0,r.default).getMe()),(0,r.default).on("me",console.log),(0,n.default).on("user",console.log),(0,r.default).on("login",console.log),window.list=f,window.input=p,window.charte=n.default,window.api=r.default;