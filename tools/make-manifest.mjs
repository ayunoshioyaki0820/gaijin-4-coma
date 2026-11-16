// public/assets/reactions/calm と hype の画像を走査して reactions.json を作る
import {readdirSync,writeFileSync,mkdirSync} from "node:fs";
import {join,extname,basename} from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../public/assets/reactions/",import.meta.url));
const ok=new Set([".jpg",".jpeg",".png",".webp",".gif",".avif"]);
const out={};
for(const k of ["calm","hype"]){
  const d=join(root,k);mkdirSync(d,{recursive:true});
  out[k]=readdirSync(d).filter(f=>ok.has(extname(f).toLowerCase())).sort((a,b)=>a.localeCompare(b,"ja",{numeric:true})).map(f=>({name:basename(f,extname(f)),file:`${k}/${f}`}));
}
writeFileSync(join(root,"reactions.json"),JSON.stringify(out,null,2)+"\n");
console.log(`calm: ${out.calm.length}枚 / hype: ${out.hype.length}枚`);
