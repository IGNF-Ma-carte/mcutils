var e=globalThis,t={},a={},l=e.parcelRequire8969;null==l&&((l=function(e){if(e in t)return t[e].exports;if(e in a){var l=a[e];delete a[e];var n={id:e,exports:{}};return t[e]=n,l.call(n.exports,n,n.exports),n.exports}var r=Error("Cannot find module '"+e+"'");throw r.code="MODULE_NOT_FOUND",r}).register=function(e,t){a[e]=t},e.parcelRequire8969=l),(0,l.register)("kMG75",function(e,t){let a;Object.defineProperty(e.exports,"default",{get:()=>u,set:void 0,enumerable:!0,configurable:!0});var n=l("fnScq"),r=l("iQyfo");class o extends n.default{constructor(e,t){super(),t=t||{},this.set("full",!!t.full),this.api=e;let a=this.element=(0,r.default).create("DIV",{className:"author-list",parent:t.target}),l=this.searchInput=(0,r.default).create("INPUT",{type:"text",className:"author",placeholder:"chercher un membre...",parent:a});(0,r.default).create("I",{className:"loading",parent:a});let n=(0,r.default).create("UL",{className:"autocomplete",parent:a});l.addEventListener("keyup",()=>{this.autocompleteAuthor(l.value,n)}),l.addEventListener("focus",()=>{n.style.display="block"}),l.addEventListener("focusout",()=>{setTimeout(()=>n.style.display="none",200)})}}o.prototype.setUser=function(e){this.searchInput.value=e},o.prototype.autocompleteAuthor=function(e,t){e!==this._currentSearch&&(this._currentSearch=e,a&&clearTimeout(a),this.element.dataset.loading="",a=setTimeout(()=>{if(!e){t.innerHTML="",delete this.element.dataset.loading;return}this.get("full")?this.api.getUsers(e,e=>{delete this.element.dataset.loading,t.innerHTML="",e&&e.forEach&&e.forEach(e=>{let a=(0,r.default).create("LI",{text:e.public_name,className:"full",click:()=>{this.dispatchEvent({type:"select",user:e})},parent:t});e.profile_picture&&(0,r.default).create("IMG",{src:e.profile_picture,parent:a})})}):this.api.searchMapUsers({public_name:e},e=>{delete this.element.dataset.loading,t.innerHTML="",e&&e.forEach&&e.forEach(e=>{(0,r.default).create("LI",{html:e,click:()=>{this.dispatchEvent({type:"select",public_name:e})},parent:t})})})},500))};var u=o});var n=l("iQyfo"),r=l("2Fada"),o=l("gXJm2"),u=l("kbFhP"),i=l("l956U"),s=l("kMG75"),c=l("4XpLa"),d=l("eyu5s");(0,o.default).setApp("api","Equipes");const p=(0,d.teamSelector)((0,o.default).getAppElement().querySelector(".selector")).onselect(e=>{(0,c.default).set(e)});(0,r.default).on("login",()=>{p.setOptions()});const f=(0,n.default).create("UL",{parent:(0,o.default).getAppElement().querySelector(".teams")});function m(){f.innerHTML="";let e=(0,r.default).getMe().organizations;e&&e.forEach(e=>{let t=(0,n.default).create("LI",{text:e.name+" ("+e.user_role+")",click:()=>{(0,u.default).showWait("Organisation "+e.name+"..."),function e(t){(0,r.default).getTeam(t.public_id,a=>{(0,u.default).show({title:a.name,content:(0,i.default)(a.presentation),buttons:{delete:"Supprimer",addUser:"Ajouter un membre",cancel:"annuler"},onButton:a=>{"delete"===a&&((0,u.default).showWait("Suppression"),(0,r.default).deleteTeam(t.public_id,()=>{(0,u.default).hide(),m()})),"addUser"===a&&((0,u.default).show({title:"Ajouter un membre",content:'<input type="text" class="userId" />',buttons:{ok:"ok",cancel:"annuler"},onButton:(a,l)=>{"ok"===a&&((0,u.default).showWait("ajout..."),(0,r.default).addTeamMember(t.id,l.userId.value,"member",()=>{e(t)}))}}),new s.default(r.default,{target:(0,u.default).getContentElement()}).on("select",console.log))}});let l=(0,n.default).create("INPUT",{value:a.profile_picture||"",on:{change:()=>{(0,u.default).showWait("modification..."),(0,r.default).setTeam(a.public_id,"image",l.value,()=>e(t))}},parent:(0,u.default).getContentElement()}),o=(0,n.default).create("UL",{parent:(0,u.default).getContentElement()});a.members.forEach(l=>{let i=(0,n.default).create("LI",{html:(0,n.default).create("SPAN",{text:l.public_name}),parent:o}),s=(0,n.default).create("SELECT",{on:{change:()=>{(0,u.default).showWait("modification..."),(0,r.default).setTeamMemberRole(a.public_id,l.public_id,s.value,()=>e(t))}},parent:i});["member","editor","owner"].forEach(e=>{let t=(0,n.default).create("OPTION",{text:e,parent:s});e===l.role&&(t.selected=!0)}),(0,n.default).create("I",{className:"fi-delete button-colored",click:()=>{(0,u.default).showWait("suppression..."),(0,r.default).removeTeamMember(a.public_id,l.public_id,()=>e(t))},parent:i})})})}(e)},parent:f});e.profile_picture&&(0,n.default).create("IMG",{src:e.profile_picture,parent:t})})}(0,r.default).on("me",m),(0,r.default).on(["login","logout","error","disconnect"],e=>{f.innerHTML=""}),(0,o.default).getAppElement().querySelector('[data-role="add"]').addEventListener("click",()=>{(0,u.default).show({title:"Ajouter une organisation",content:`<input type="text" placeholder="nom" class="name" />
    <textarea class="presentation" placeholder="presentation"></textarea>
    <input type="text" placeholder="image" class="image" />
    `,buttons:{ok:"ok",cancel:"annuler"},onButton:(e,t)=>{"ok"===e&&((0,u.default).showWait("ajout en cours..."),(0,r.default).newTeam({name:t.name.value,presentation:t.presentation.value,image:t.image.value},m))}})}),window.api=r.default,window.charte=o.default,window.dialog=u.default,window.team=c.default;