function e(e){return e&&e.__esModule?e.default:e}var r=globalThis,n={},t={},a=r.parcelRequire8969;null==a&&((a=function(e){if(e in n)return n[e].exports;if(e in t){var r=t[e];delete t[e];var a={id:e,exports:{}};return n[e]=a,r.call(a.exports,a,a.exports),a.exports}var i=Error("Cannot find module '"+e+"'");throw i.code="MODULE_NOT_FOUND",i}).register=function(e,r){t[e]=r},r.parcelRequire8969=a),a.register;var i=a("iQyfo"),s=a("gXJm2"),l=a("fnScq"),u=a("3by3c"),i=a("iQyfo");class o extends l.default{constructor(e){super(),this.element=(0,i.default).create("TABLE",{className:"mc-csv-preview",parent:e.target}),this.csv=e.csv||"nodata",this.set("nbLines",e.nbLines||5),this.set("line",e.line||!1)}}o.prototype.showData=function(r,n){let t={};Array.isArray(n)?n.forEach(e=>t[e]=e):n&&(t=n),void 0===(r=r||{}).dynamicTyping&&(r.dynamicTyping=!0);let a=0;if(r.skipLines)for(let e=0;e<r.skipLines;e++)a=this.csv.indexOf("\n",a)+1;let s=this.result=e(u).parse(this.csv.substr(a),r),l=s.meta.fields,o=s.data;this.element.innerHTML="";let d=1,c=(e,r,n)=>{this.get("line")&&(0,i.default).create("TD",{className:"lnum",text:e===p?"#":d++,parent:e}),r.forEach(r=>{let a=n?n[r]:r,s=e===p&&t[a];s&&(a=t[a]),(0,i.default).create("TD",{className:(s?"selected":"")+" "+typeof a,title:a,text:a,parent:e})})},p=(0,i.default).create("TR",{parent:(0,i.default).create("THEAD",{parent:this.element})});if(l)c(p,l);else{let e=[];o[0].forEach((r,n)=>e.push(n)),c(p,e)}let h=(0,i.default).create("TBODY",{parent:this.element}),f=Math.min(this.get("nbLines"),o.length);for(let e=0;e<f;e++)c((0,i.default).create("TR",{parent:h}),Object.keys(o[e]),o[e]);return s},o.prototype.getResult=function(){return this.result},o.prototype.setCSV=function(e){this.csv=e||""};var d={};function c(){let e={};e[p.value]="ID",e[h.value]=h.value,m=f.showData({header:!0},e)}d="Code;Départements;Taux de fécondité pr 1 000 femmes de 15-49 ans;Taux de natalité - 1968-1975 pr 1 000 hab;Taux de natalité - 1975-1982 pr 1 000 hab;Taux de natalité - 1982-1990 pr 1 000 hab;Taux de natalité - 1990-1999 pr 1 000 hab;Taux de natalité - 1999-2008 pr 1 000 hab;Taux de natalité - 2008-2013 pr 1 000 hab\r\n01;Ain;197;16;13.9;13.6;12.5;12.4;12.1\r\n02;Aisne;213;17.8;15.4;14.9;13.2;13;12.9\r\n03;Allier;192;13.6;11.2;10.2;9.6;9.9;9.6\r\n04;Alpes-de-Haute-Provence;193;13.1;10.5;11.9;11;10.3;9.7\r\n05;Hautes-Alpes;192;14.4;12.5;13;11.6;11.2;10.6\r\n06;Alpes-Maritimes;192;11;10.6;11.5;11.2;10.9;11.2\r\n07;Ardèche;203;14.6;11.8;11.7;10.9;11.1;10.7\r\n08;Ardennes;193;18.5;15.4;14.8;12.8;12.4;11.7\r\n09;Ariège;189;11.6;9.6;9.9;9.5;9.6;9.6\r\n10;Aube;194;16.8;14;13.4;12.3;12;12.1\r\n11;Aude;191;11.9;10.3;10.7;10.3;10.4;10.5\r\n12;Aveyron;198;13;11.3;10.1;9.3;9.9;9.7\r\n13;Bouches-du-Rhône;210;14.7;13;13.3;12.6;12.7;13.1\r\n14;Calvados;185;18.7;16;14.7;12.8;12.5;11.8\r\n15;Cantal;180;14.7;12;10.6;8.8;9.2;8.7\r\n16;Charente;192;15;12.7;12;10.5;10.3;10\r\n17;Charente-Maritime;185;15.5;12.7;11.6;10.2;10.2;9.8\r\n18;Cher;200;15.1;12;11.8;10.7;10.7;10.3\r\n19;Corrèze;187;12.3;10.6;9.9;8.8;9.5;9.2\r\n21;Côte-d'Or;178;17.6;14.7;13.9;12.2;11.7;11.3\r\n22;Côtes-d'Armor;203;15.8;13.2;12;10.5;11.3;10.8\r\n23;Creuse;180;11.2;9.1;8.8;8.4;8.3;8.1\r\n24;Dordogne;187;12.5;10.5;10.1;9.1;9.2;8.9\r\n25;Doubs;197;19.5;16.8;14.8;13;13;13.2\r\n26;Drôme;215;16.1;13.6;13.7;12.6;12.3;12.2\r\n27;Eure;210;17.9;15.1;14.9;13.5;13.1;13.2\r\n28;Eure-et-Loir;214;17.3;15.1;14.5;13;13;13.1\r\n29;Finistère;187;16.1;13.6;12.8;11.5;11.5;10.9\r\n2A;Corse-du-Sud;146;13.4;11.6;12.5;11.4;10.1;9.7\r\n2B;Haute-Corse;156;12.4;10.8;11.4;10.7;9.7;9.6\r\n30;Gard;203;13.8;11.9;12.5;11.7;11.7;11.8\r\n31;Haute-Garonne;178;15.1;12.3;12.1;12.4;12.4;12.5\r\n32;Gers;192;12.2;9.6;9.5;9;9.1;8.9\r\n33;Gironde;175;15.4;13.4;12.4;11.6;11.7;11.6\r\n34;Hérault;186;13.8;12.1;12.3;12;12;12.1\r\n35;Ille-et-Vilaine;190;18.4;15.7;13.9;12.8;13.2;13\r\n36;Indre;198;14.2;11.4;10.3;9.8;10.2;9.6\r\n37;Indre-et-Loire;189;17.3;13.7;13;11.8;11.7;11.5\r\n38;Isère;206;17.1;14.6;14.3;13.1;13.3;13.2\r\n39;Jura;200;16;13.5;12.8;11.9;11.8;11\r\n40;Landes;182;13.9;11.2;10.8;10;10.2;10.1\r\n41;Loir-et-Cher;212;15.7;13;12;11.3;11.4;11.4\r\n42;Loire;214;16.6;14.3;13.2;11.8;12.2;12.5\r\n43;Haute-Loire;197;13.7;11.8;11.3;10.5;11.1;10.4\r\n44;Loire-Atlantique;200;18.5;16.1;14.2;12.8;13.3;13\r\n45;Loiret;209;16.8;14.6;14.1;12.8;13;13.1\r\n46;Lot;192;12.3;10.4;10;9.1;9.1;8.5\r\n47;Lot-et-Garonne;199;13.9;11.6;11.4;10;10.3;10.3\r\n48;Lozère;170;13.2;12.2;10.9;9.8;10.1;9.7\r\n49;Maine-et-Loire;205;19.6;17.3;15;12.8;13.4;13\r\n50;Manche;197;16.6;14.5;14.2;12.3;11.4;10.6\r\n51;Marne;192;19;16.1;15;13;12.6;12.4\r\n52;Haute-Marne;208;18;15.1;14.2;12;11.3;10.5\r\n53;Mayenne;214;18;15.9;13.9;12.5;13.4;12.6\r\n54;Meurthe-et-Moselle;176;17.8;15.2;14.4;12.4;11.9;11.6\r\n55;Meuse;190;17.1;14.5;14.2;12.1;11.9;11.2\r\n56;Morbihan;200;17.2;14.6;13.5;11.6;11.7;11.1\r\n57;Moselle;178;17.9;14.9;14.7;12.3;11.6;11.2\r\n58;Nièvre;185;13.5;11.6;11;9.9;9.8;9.1\r\n59;Nord;207;19.3;17.3;16.7;14.5;14.3;14.2\r\n60;Oise;212;18.6;15.7;15.3;14.2;13.9;13.6\r\n61;Orne;199;17.1;14.6;13.2;11.8;11.4;10.8\r\n62;Pas-de-Calais;214;18.6;16.1;16;13.5;13.5;13.4\r\n63;Puy-de-Dôme;182;15.9;13.1;11.9;10.3;10.8;10.9\r\n64;Pyrénées-Atlantiques;177;14.6;11.9;11.3;10.4;10.3;10\r\n65;Hautes-Pyrénées;197;13.5;10.5;10.4;9.8;9.8;9.4\r\n66;Pyrénées-Orientales;194;12.8;10.9;11.2;10.6;10.6;10.7\r\n67;Bas-Rhin;184;16.8;14.1;13.9;13.3;12.5;11.9\r\n68;Haut-Rhin;192;16.4;14.4;14.4;13.2;12.5;11.9\r\n69;Rhône;207;17.6;15.5;15;14.4;14.4;14.8\r\n70;Haute-Saône;201;16.9;14.3;13.4;11.5;12;11.4\r\n71;Saône-et-Loire;203;15.7;13.2;12.2;10.8;10.6;10.5\r\n72;Sarthe;213;18.1;14.6;13.3;12.4;12.5;12.2\r\n73;Savoie;191;16;13.7;13.2;12.4;12.2;11.8\r\n74;Haute-Savoie;190;17.2;14.7;14.2;13.8;13;12.8\r\n75;Paris;156;15.3;14.1;14.7;14.3;14.6;13.7\r\n76;Seine-Maritime;197;18.5;15.8;15.7;13.6;12.9;12.9\r\n77;Seine-et-Marne;211;17.2;15;15;14.5;14.4;14.7\r\n78;Yvelines;215;18.4;16.4;15.7;14.9;14.4;14.1\r\n79;Deux-Sèvres;194;16.8;13.9;12.2;10.9;11.4;11.2\r\n80;Somme;188;18.5;15.4;14.4;12.8;12.7;12.2\r\n81;Tarn;199;13.3;11.7;11;10;10.3;10.6\r\n82;Tarn-et-Garonne;209;13.8;11.4;11.1;11;11.4;12.1\r\n83;Var;203;14;12;12.6;11.8;11.1;11\r\n84;Vaucluse;226;15.6;13;13.5;12.8;12.5;12.9\r\n85;Vendée;206;17.3;15.6;13.2;11.2;12.1;11.9\r\n86;Vienne;182;15.7;13.2;11.9;10.7;11.3;11.5\r\n87;Haute-Vienne;180;12.7;10.9;10;9.2;10;10.4\r\n88;Vosges;193;17.2;14.8;13.7;12.2;11.5;10.7\r\n89;Yonne;205;15.3;13.3;12.8;11.6;11.5;11.3\r\n90;Territoire de Belfort;194;17.6;15.5;14.5;13.2;13.2;12.6\r\n91;Essonne;221;18.6;15.5;15;15;14.9;14.9\r\n92;Hauts-de-Seine;200;16;14.9;15.5;15.9;16.5;16\r\n93;Seine-Saint-Denis;250;17.7;16.6;17.4;16.9;18;18.6\r\n94;Val-de-Marne;213;17.1;15.2;15.1;15.4;15.6;15.8\r\n95;Val-d'Oise;232;17.5;15.8;16.4;15.4;15.6;16.3\r\n971;Guadeloupe;221;34.8;18.9;18.9;17.4;16.1;13.5\r\n972;Martinique;211;27;19.5;17.3;16;14;12.4\r\n973;Guyane;353;31.1;26;27.6;30.9;29.5;27.1\r\n974;Réunion;245;31.9;26.3;23.3;20.8;19.1;17.5\r\n976;Mayotte;422;;;;;;\r\n",(0,s.default).setApp("macarte","CSV");const p=(0,i.default).create("SELECT",{change:c,parent:(0,s.default).getAppElement()}),h=(0,i.default).create("SELECT",{change:c,parent:(0,s.default).getAppElement()}),f=new o({csv:e(d),line:!0,target:(0,i.default).create("DIV",{className:"csv",parent:(0,s.default).getAppElement()})});let m=f.showData({header:!0});(0,i.default).create("OPTION",{text:"Sélectionner un identifiant",parent:p}),(0,i.default).create("OPTION",{text:"Sélectionner une colonne",parent:h}),m.meta.fields.forEach(e=>{(0,i.default).create("OPTION",{value:e,text:e,parent:p}),(0,i.default).create("OPTION",{value:e,text:e,parent:h})}),window.preview=f;