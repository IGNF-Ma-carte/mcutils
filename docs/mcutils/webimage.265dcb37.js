function e(e,t,r,a){Object.defineProperty(e,t,{get:r,set:a,enumerable:!0,configurable:!0})}var t=globalThis.parcelRequire8969,r=t.register;r("bdsa4",function(r,a){e(r.exports,"default",()=>i);var n=t("dJzRF");class i extends n.default{constructor(){if(super(),"undefined"==typeof createImageBitmap)throw Error("Cannot decode WebImage as `createImageBitmap` is not available");if("undefined"==typeof document&&"undefined"==typeof OffscreenCanvas)throw Error("Cannot decode WebImage as neither `document` nor `OffscreenCanvas` is not available")}async decode(e,t){let r;let a=new Blob([t]),n=await createImageBitmap(a);"undefined"!=typeof document?((r=document.createElement("canvas")).width=n.width,r.height=n.height):r=new OffscreenCanvas(n.width,n.height);let i=r.getContext("2d");return i.drawImage(n,0,0),i.getImageData(0,0,n.width,n.height).data.buffer}}}),r("dJzRF",function(r,a){e(r.exports,"default",()=>i);var n=t("fPkiP");class i{async decode(e,t){let r=await this.decodeBlock(t),a=e.Predictor||1;if(1!==a){let t=!e.StripOffsets,i=t?e.TileWidth:e.ImageWidth,o=t?e.TileLength:e.RowsPerStrip||e.ImageLength;return(0,n.applyPredictor)(r,a,i,o,e.BitsPerSample,e.PlanarConfiguration)}return r}}}),r("fPkiP",function(t,r){e(t.exports,"applyPredictor",()=>a);function a(e,t,r,a,n,i){if(!t||1===t)return e;for(let e=0;e<n.length;++e){if(n[e]%8!=0)throw Error("When decoding with predictor, only multiple of 8 bits are supported.");if(n[e]!==n[0])throw Error("When decoding with predictor, all samples must have the same size.")}let o=n[0]/8,l=2===i?1:n.length;for(let i=0;i<a;++i){let a;if(i*l*r*o>=e.byteLength)break;if(2===t){switch(n[0]){case 8:a=new Uint8Array(e,i*l*r*o,l*r*o);break;case 16:a=new Uint16Array(e,i*l*r*o,l*r*o/2);break;case 32:a=new Uint32Array(e,i*l*r*o,l*r*o/4);break;default:throw Error(`Predictor 2 not allowed with ${n[0]} bits per sample.`)}!function(e,t){let r=e.length-t,a=0;do{for(let r=t;r>0;r--)e[a+t]+=e[a],a++;r-=t}while(r>0)}(a,l,o)}else 3===t&&function(e,t,r){let a=0,n=e.length,i=n/r;for(;n>t;){for(let r=t;r>0;--r)e[a+t]+=e[a],++a;n-=t}let o=e.slice();for(let t=0;t<i;++t)for(let a=0;a<r;++a)e[r*t+a]=o[(r-a-1)*i+t]}(a=new Uint8Array(e,i*l*r*o,l*r*o),l,o)}return e}});