(function(){
"use strict";
const $=s=>document.querySelector(s),KEY="g4k-v2",clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const FONT='"Zen Kaku Gothic New","Hiragino Kaku Gothic ProN",sans-serif';
const D={tpl:"normal",order:["u0","calm","u1","hype"],imgs:[null,null],react:{calm:0,hype:0},custom:{calm:[],hype:[]},out:{w:1080,asp:"16/9",pad:36,gap:0,bw:6,bg:"#ffffff",bc:"#000000",fmt:"png",rf:"cover"},style:"frame",sel:0};
const TPL={normal:["u0","calm","u1","hype"],reverse:["u0","hype","u1","calm"]};
let S=JSON.parse(JSON.stringify(D));
try{const j=JSON.parse(localStorage.getItem(KEY)||"null");
 if(j&&Array.isArray(j.order)&&j.order.length===4&&[...j.order].sort().join()==="calm,hype,u0,u1"){
  S={...D,...j,out:{...D.out,...j.out},react:{...D.react,...j.react},custom:{calm:[],hype:[],...j.custom}};
  if(!Array.isArray(S.imgs)||S.imgs.length!==2)S.imgs=[null,null];
 }}catch(e){}

/* ---- built-in original reaction art (SVG, no external assets) ---- */
const SK=["#f2c9a0","#c98f62","#f7d9bd","#8a5a3b"];
function svgSet(mood,v){
 const hy=mood==="hype",sh=v?["#e4572e","#2a9d8f","#264653","#f4a261"]:["#3d5a80","#6d597a","#355070","#588157"],
 hr=v?["#222","#8a4b08","#e9c46a","#111"]:["#4a2c12","#111","#b5651d","#2b2b2b"],
 bg=hy?(v?"#ff8fab":"#ffd23f"):(v?"#c9d1da":"#dfe3e8");
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="${bg}"/>`;
 if(hy)for(let a=0;a<24;a++){const r=a*Math.PI/12,r2=r+.13;s+=`<path d="M400 225L${400+900*Math.cos(r)} ${225+900*Math.sin(r)}L${400+900*Math.cos(r2)} ${225+900*Math.sin(r2)}Z" fill="#fff" opacity=".35"/>`}
 else for(let a=0;a<14;a++)s+=`<path d="M${30+a*57} 0v${70+(a%3)*30}" stroke="#7c8696" stroke-width="5" opacity=".5"/>`;
 [110,290,510,690].forEach((x,i)=>{
  const y=hy?205:225,k=SK[i];
  if(hy)s+=`<path d="M${x-70} 360L${x-100} 250M${x+70} 360L${x+100} 250" stroke="${k}" stroke-width="28" stroke-linecap="round"/>`;
  s+=`<path d="M${x-80} 450C${x-80} 345 ${x-45} 315 ${x} 315S${x+80} 345 ${x+80} 450Z" fill="${sh[i]}"/><circle cx="${x}" cy="${y}" r="64" fill="${k}"/><path d="M${x-66} ${y-8}A66 66 0 0 1 ${x+66} ${y-8}Q${x} ${y-42} ${x-66} ${y-8}Z" fill="${hr[i]}"/>`;
  s+=hy?`<path d="M${x-36} ${y+8}q13 -18 26 0M${x+10} ${y+8}q13 -18 26 0" stroke="#222" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M${x-28} ${y+28}Q${x} ${y+78} ${x+28} ${y+28}Z" fill="#7a1f1f"/>`
   :`<path d="M${x-36} ${y+6}h26M${x+10} ${y+6}h26M${x-18} ${y+38}h36" stroke="#222" stroke-width="6" stroke-linecap="round"/><circle cx="${x-22}" cy="${y+14}" r="4" fill="#222"/><circle cx="${x+23}" cy="${y+14}" r="4" fill="#222"/>`;
 });
 return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s+"</svg>");
}
const SAMPLES={calm:[{n:"冷静A",src:svgSet("calm",0)},{n:"冷静B",src:svgSet("calm",1)}],hype:[{n:"興奮A",src:svgSet("hype",0)},{n:"興奮B",src:svgSet("hype",1)}]};
/* 本物の素材: public/assets/reactions/reactions.json から読み込む(あれば優先) */
const FILES={calm:[],hype:[]};
const STYLES={
 classic:{n:"定番",d:"余白なし・細枠",o:{pad:0,gap:0,bw:4,bg:"#ffffff",bc:"#000000"}},
 frame:{n:"白フチ",d:"白い余白と枠",o:{pad:36,gap:0,bw:6,bg:"#ffffff",bc:"#000000"}},
 seamless:{n:"枠なし",d:"完全につなぐ",o:{pad:0,gap:0,bw:0,bg:"#ffffff",bc:"#000000"}},
 manga:{n:"漫画風",d:"太枠と広い余白",o:{pad:48,gap:0,bw:10,bg:"#ffffff",bc:"#000000"}},
 dark:{n:"ダーク",d:"黒背景・白枠",o:{pad:28,gap:0,bw:6,bg:"#111317",bc:"#ffffff"}},
 split:{n:"コマ分け",d:"すき間ありの4枚",o:{pad:32,gap:16,bw:6,bg:"#ffffff",bc:"#000000"}}};
const reacts=k=>(FILES[k].length?FILES[k]:SAMPLES[k]).concat(S.custom[k].map((src,c)=>({n:"追加素材",src,c})));
const lab=k=>k==="calm"?"冷めた4人":k==="hype"?"盛り上がる4人":`画像${+k[1]+1}${S.imgs[+k[1]]?"":"(未設定)"}`;

/* ---- drawing ---- */
const IC=new Map();
function getImg(src){let e=IC.get(src);if(!e){e=new Image();e.onload=()=>redraw();e.onerror=()=>{e.bad=1;toast("画像を表示できませんでした")};e.src=src;IC.set(src,e)}return e}
const ok=e=>e.complete&&e.naturalWidth>0;
function geo(W){const k=W/1080,o=S.out,pad=Math.round(o.pad*k),gap=Math.round(o.gap*k),bw=o.bw*k,[a,b]=o.asp.split("/").map(Number),pw=W-2*pad,ph=Math.round(pw*b/a);
 return{k,pad,gap,bw,pw,ph,H:Math.round(2*pad+4*ph+3*gap),rects:[0,1,2,3].map(i=>({x:pad,y:pad+i*(ph+gap),w:pw,h:ph}))}}
const fit=(iw,ih,pw,ph,z)=>{const s=(S.out.rf==="contain"?Math.min:Math.max)(pw/iw,ph/ih)*z,dw=iw*s,dh=ih*s;return{dw,dh,ex:Math.max(0,dw-pw),ey:Math.max(0,dh-ph)}};
function cover(c,im,r,st){const f=fit(im.naturalWidth,im.naturalHeight,r.w,r.h,st.zoom||1);
 c.drawImage(im,r.x+(r.w-f.dw)/2+(st.ox||0)*f.ex/2,r.y+(r.h-f.dh)/2+(st.oy||0)*f.ey/2,f.dw,f.dh)}
function place(c,im,r){const iw=im.naturalWidth,ih=im.naturalHeight;
 if(S.out.rf==="contain"){const s=Math.min(r.w/iw,r.h/ih),w=iw*s,h=ih*s;c.fillStyle=S.out.bg;c.fillRect(r.x,r.y,r.w,r.h);c.drawImage(im,r.x+(r.w-w)/2,r.y+(r.h-h)/2,w,h)}
 else cover(c,im,r,{zoom:1})}
function frame(c,g){c.lineWidth=g.bw;c.strokeStyle=S.out.bc;
 if(g.gap>0){g.rects.forEach(r=>c.strokeRect(r.x+g.bw/2,r.y+g.bw/2,r.w-g.bw,r.h-g.bw));return}
 c.strokeRect(g.pad+g.bw/2,g.pad+g.bw/2,g.pw-g.bw,4*g.ph-g.bw);
 for(let i=1;i<4;i++){const y=g.pad+i*g.ph;c.beginPath();c.moveTo(g.pad,y);c.lineTo(g.pad+g.pw,y);c.stroke()}}
function draw(cv,W,ui){
 const g=geo(W),c=cv.getContext("2d");cv.width=W;cv.height=g.H;
 c.fillStyle=S.out.bg;c.fillRect(0,0,W,g.H);
 S.order.forEach((k,i)=>{const r=g.rects[i];c.save();c.beginPath();c.rect(r.x,r.y,r.w,r.h);c.clip();c.fillStyle="#e9ecf1";c.fillRect(r.x,r.y,r.w,r.h);
  if(k[0]==="u"){const m=S.imgs[+k[1]],im=m&&getImg(m.data);
   if(im&&ok(im)){if(S.out.rf==="contain"){c.fillStyle=S.out.bg;c.fillRect(r.x,r.y,r.w,r.h)}cover(c,im,r,m)}
   else if(ui){c.fillStyle="#7a8294";c.textAlign="center";c.textBaseline="middle";c.font=`700 ${r.h*.1}px ${FONT}`;c.fillText(`画像${+k[1]+1}を設定`,r.x+r.w/2,r.y+r.h/2-r.h*.05);
    c.font=`500 ${r.h*.055}px ${FONT}`;c.fillText("タップ・ドロップ・貼り付け",r.x+r.w/2,r.y+r.h/2+r.h*.09)}
  }else{const l=reacts(k),it=l[Math.min(S.react[k],l.length-1)],im=getImg(it.src);if(ok(im))place(c,im,r)}
  c.restore()});
 if(g.bw>0)frame(c,g);
 if(ui&&S.sel>=0){const r=g.rects[S.sel];c.save();c.lineWidth=4;c.setLineDash([14,8]);c.strokeStyle="#2147ff";c.strokeRect(r.x+2,r.y+2,r.w-4,r.h-4);c.restore()}
}
const pcv=$("#cv"),redraw=()=>{draw(pcv,720,true);pcv.style.aspectRatio=pcv.width+"/"+pcv.height};

/* ---- persistence / toast ---- */
let st,tt;
function save(){clearTimeout(st);st=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){
 try{localStorage.setItem(KEY,JSON.stringify({...S,imgs:[null,null],custom:{calm:[],hype:[]}}));toast("画像が大きいため、設定のみ保存しました")}catch(e2){}}},300)}
function toast(m){const t=$("#toast");t.textContent=m;t.style.display="block";clearTimeout(tt);tt=setTimeout(()=>t.style.display="none",3200)}

/* ---- images in ---- */
function loadFile(f,max){return new Promise((res,rej)=>{
 if(!f||!/^image\//.test(f.type))return rej();
 const u=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{try{const s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement("canvas");
  c.width=Math.max(1,Math.round(im.naturalWidth*s));c.height=Math.max(1,Math.round(im.naturalHeight*s));
  const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.9))}catch(e){rej(e)}URL.revokeObjectURL(u)};
 im.onerror=()=>{URL.revokeObjectURL(u);rej()};im.src=u})}
const bad=()=>toast("画像を読み込めませんでした。JPEG・PNGなどの画像を選んでください");
function setUser(id,f){loadFile(f,1800).then(d=>{S.imgs[id]={data:d,zoom:1,ox:0,oy:0};S.sel=S.order.indexOf("u"+id);ui();redraw();save()}).catch(bad)}
function addReact(m,f){loadFile(f,1280).then(d=>{S.custom[m].push(d);S.react[m]=reacts(m).length-1;ui();redraw();save()}).catch(bad)}
function targetUser(){const k=S.order[S.sel];if(k&&k[0]==="u")return+k[1];return S.imgs[0]?(S.imgs[1]?0:1):0}
$("#fi").addEventListener("change",e=>{const f=e.target.files[0],m=e.target.dataset.mode;e.target.value="";if(!f)return;m[0]==="u"?setUser(+m[1],f):addReact(m,f)});
addEventListener("dragover",e=>e.preventDefault());
addEventListener("drop",e=>{e.preventDefault();const f=[...(e.dataTransfer?.files||[])].find(f=>/^image\//.test(f.type));if(!f)return toast("画像ファイルをドロップしてください");
 let id=targetUser();if(e.target===pcv){const i=hit(e),k=S.order[i];if(k&&k[0]==="u")id=+k[1]}setUser(id,f)});
addEventListener("paste",e=>{const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith("image/"));if(!it)return;e.preventDefault();setUser(targetUser(),it.getAsFile())});

/* ---- canvas pointer: select + drag to pan ---- */
const hit=e=>{const b=pcv.getBoundingClientRect(),x=(e.clientX-b.left)*pcv.width/b.width,y=(e.clientY-b.top)*pcv.height/b.height;
 return geo(pcv.width).rects.findIndex(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)};
let drag=null;
pcv.addEventListener("pointerdown",e=>{const i=hit(e);if(i<0)return;const was=S.sel;S.sel=i;if(was!==i)ui();redraw();
 const k=S.order[i];if(k[0]==="u"&&S.imgs[+k[1]]){drag={i,x:e.clientX,y:e.clientY};pcv.setPointerCapture(e.pointerId)}});
pcv.addEventListener("pointermove",e=>{if(!drag)return;const m=S.imgs[+S.order[drag.i][1]],r=geo(pcv.width).rects[drag.i],im=getImg(m.data);if(!ok(im))return;
 const f=fit(im.naturalWidth,im.naturalHeight,r.w,r.h,m.zoom),sc=pcv.width/pcv.getBoundingClientRect().width;
 if(f.ex>1)m.ox=clamp(m.ox+(e.clientX-drag.x)*sc/(f.ex/2),-1,1);if(f.ey>1)m.oy=clamp(m.oy+(e.clientY-drag.y)*sc/(f.ey/2),-1,1);
 drag.x=e.clientX;drag.y=e.clientY;document.querySelectorAll("[data-s]").forEach(r=>r.value=m[r.dataset.s]);redraw()});
["pointerup","pointercancel"].forEach(t=>pcv.addEventListener(t,()=>{if(drag){drag=null;save()}}));

/* ---- side panel UI ---- */
function ui(){
 $("#styles").innerHTML=Object.entries(STYLES).map(([id,s])=>`<button class="sty${S.style===id?" on":""}" data-y="${id}"><b>${s.n}</b><br>${s.d}</button>`).join("");
 $("#tpl").querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.t===S.tpl));
 $("#rows").innerHTML=S.order.map((k,i)=>`<div class="row${i===S.sel?" on":""}" data-i="${i}"><span>${lab(k)}</span><span><button class="sm" data-a="up" data-i="${i}" ${i?"":"disabled"} aria-label="上へ">↑</button> <button class="sm" data-a="dn" data-i="${i}" ${i<3?"":"disabled"} aria-label="下へ">↓</button></span></div>`).join("");
 const k=S.order[S.sel];let h="";
 if(k[0]==="u"){const id=+k[1],m=S.imgs[id];
  h=`<h2>${lab(k)}の設定</h2><div class="btns"><button class="sm b" data-a="pick" data-id="${id}">${m?"画像を差し替え":"画像を選ぶ"}</button>${m?`<button class="sm" data-a="del" data-id="${id}">削除</button><button class="sm" data-a="rpos" data-id="${id}">位置を戻す</button>`:""}</div><p class="hint">ドラッグ&amp;ドロップ、Ctrl+V の貼り付けでも設定できます。プレビュー上でドラッグすると位置を動かせます。</p>`;
  if(m)h+=`<label class="lab">拡大<input type="range" data-s="zoom" min="1" max="4" step="0.01" value="${m.zoom}"></label><label class="lab">左右<input type="range" data-s="ox" min="-1" max="1" step="0.01" value="${m.ox}"></label><label class="lab">上下<input type="range" data-s="oy" min="-1" max="1" step="0.01" value="${m.oy}"></label>`;
 }else{h=`<h2>${lab(k)}の素材</h2><div class="grid">${reacts(k).map((it,j)=>`<button class="th${j===Math.min(S.react[k],reacts(k).length-1)?" on":""}" data-a="react" data-j="${j}"><img src="${it.src}" alt="${it.n}">${it.c!=null?`<span class="x" data-a="rmc" data-j="${it.c}" role="button" aria-label="削除">×</span>`:""}</button>`).join("")}</div><button class="sm b" data-a="addr">自分の素材を追加</button><p class="hint">追加した素材はこのブラウザに保存されます。利用許諾のある画像か、自作の画像を使ってください。</p>`}
 $("#ed").innerHTML=h;
}
document.querySelector("aside").addEventListener("click",e=>{
 const y=e.target.closest("[data-y]");if(y){S.style=y.dataset.y;Object.assign(S.out,STYLES[S.style].o);fillOut();ui();redraw();save();return}
 const t=e.target.closest("[data-t]");if(t){S.tpl=t.dataset.t;S.order=[...TPL[S.tpl]];ui();redraw();save();return}
 const a=e.target.closest("[data-a]");
 if(!a){const r=e.target.closest(".row");if(r){S.sel=+r.dataset.i;ui();redraw();save()}return}
 const A=a.dataset.a,id=+a.dataset.id,fi=$("#fi");
 if(A==="up"||A==="dn"){e.stopPropagation();const i=+a.dataset.i,j=A==="up"?i-1:i+1;[S.order[i],S.order[j]]=[S.order[j],S.order[i]];S.sel=j}
 else if(A==="pick"){fi.dataset.mode="u"+id;fi.click();return}
 else if(A==="del"){S.imgs[id]=null}
 else if(A==="rpos"){Object.assign(S.imgs[id],{zoom:1,ox:0,oy:0})}
 else if(A==="react"){S.react[S.order[S.sel]]=+a.dataset.j}
 else if(A==="addr"){fi.dataset.mode=S.order[S.sel];fi.click();return}
 else if(A==="rmc"){e.stopPropagation();const m=S.order[S.sel];S.custom[m].splice(+a.dataset.j,1);S.react[m]=0}
 ui();redraw();save();
});
document.querySelector("aside").addEventListener("input",e=>{const r=e.target.closest("[data-s]");if(!r)return;const m=S.imgs[+S.order[S.sel][1]];if(m){m[r.dataset.s]=+r.value;redraw();save()}});
document.querySelectorAll("[data-o]").forEach(el=>el.addEventListener("input",()=>{const k=el.dataset.o;S.out[k]=(el.type==="range"||k==="w")?+el.value:el.value;if(!["w","fmt","asp","rf"].includes(k)){S.style="custom";document.querySelectorAll(".sty.on").forEach(b=>b.classList.remove("on"))}redraw();save()}));
const fillOut=()=>document.querySelectorAll("[data-o]").forEach(el=>el.value=S.out[el.dataset.o]);

/* ---- export ---- */
const srcs=()=>S.order.map(k=>k[0]==="u"?S.imgs[+k[1]]?.data:(l=>l[Math.min(S.react[k],l.length-1)].src)(reacts(k))).filter(Boolean);
async function blobOut(){
 await Promise.all(srcs().map(s=>{const e=getImg(s);return ok(e)||e.bad?0:new Promise(r=>{e.addEventListener("load",r);e.addEventListener("error",r)})}));
 const c=document.createElement("canvas");draw(c,S.out.w,false);
 return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("toBlob")),S.out.fmt==="jpg"?"image/jpeg":"image/png",.95))}
$("#dl").addEventListener("click",async()=>{
 const b=$("#dl");b.disabled=true;
 try{const blob=await blobOut(),name=`gaijin-4koma-${Date.now()}.${S.out.fmt}`;
  let d=null;try{d=window.claude?await window.claude.use("downloads"):null}catch(e){}
  if(d){try{await d.save({filename:name,data:blob});toast("保存しました");return}catch(e){if(e&&e.code==="declined")return}}
  const u=URL.createObjectURL(blob);
  if(!d&&!/iP(hone|ad|od)/.test(navigator.userAgent)){const a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();toast("ダウンロードを開始しました");return}
  $("#dlg").innerHTML=`<img src="${u}" alt="完成した4コマ"><p class="hint">自動で保存できない場合は、画像を長押し(右クリック)して保存してください。</p><div class="btns"><a class="sm b" href="${u}" download="${name}">ファイルとして保存</a><button class="sm" id="cl">閉じる</button></div>`;
  $("#dlg").showModal();$("#cl").onclick=()=>$("#dlg").close();
 }catch(e){toast("画像の書き出しに失敗しました。画像サイズを小さくして試してください")}
 finally{b.disabled=false}});
$("#share").addEventListener("click",async()=>{
 try{const blob=await blobOut(),f=new File([blob],`4koma.${S.out.fmt}`,{type:blob.type});
  if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:"外人4コマメーカーで作りました #外人4コマ"});return}
 }catch(e){if(e&&e.name==="AbortError")return}
 const t="外人4コマを作りました #外人4コマ";
 if(window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(t),"_blank","noopener"))toast("画像はダウンロードして添付してください");
 else{try{navigator.clipboard.writeText(t);toast("投稿文をコピーしました。画像はダウンロードして添付してください")}catch(e){toast("共有を開けませんでした。画像をダウンロードして投稿してください")}}});
$("#help").addEventListener("click",()=>{$("#dlg").innerHTML=`<h2>使い方</h2><ol><li>画像を2枚設定します(選ぶ・ドロップ・Ctrl+V)。</li><li>プレビューをドラッグして、見せたい位置に合わせます。</li><li>「画像をダウンロード」を押すと完成です。</li></ol><p class="hint">冷めた4人・盛り上がる4人の素材は切り替えや追加ができます。</p><button class="sm b" id="cl">閉じる</button>`;$("#dlg").showModal();$("#cl").onclick=()=>$("#dlg").close()});
let rs=0;
$("#reset").addEventListener("click",e=>{const b=e.currentTarget;if(!rs){rs=setTimeout(()=>{rs=0;b.textContent="編集内容をリセット"},3000);b.textContent="もう一度押すとリセットします";return}
 clearTimeout(rs);rs=0;b.textContent="編集内容をリセット";S=JSON.parse(JSON.stringify(D));fillOut();ui();redraw();save();toast("リセットしました")});

fetch("assets/reactions/reactions.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;
 ["calm","hype"].forEach(k=>FILES[k]=(j[k]||[]).map(x=>({n:x.name||x.file,src:"assets/reactions/"+encodeURI(x.file)})));ui();redraw()}).catch(()=>{});
fillOut();ui();redraw();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(redraw);
})();
