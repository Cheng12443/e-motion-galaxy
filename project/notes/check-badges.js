// 校验 03-model 的爆炸图徽章几何：互不遮挡、不压在部件上、不出画布
const VB={x:-80,y:-40,w:1360,h:900};
const R=20;                       // 徽章半径（viewBox 单位）
const PARTS=[
 {id:'battery',dir:[0,96],   center:[537,530],box:[165,30]},
 {id:'motor',  dir:[-152,40],center:[272,500],box:[36,36]},
 {id:'brake',  dir:[92,-106],center:[896,500],box:[58,58]},
 {id:'tire',   dir:[64,104], center:[896,500],box:[104,104]},
 {id:'smart',  dir:[28,-142],center:[828,256],box:[35,22]}
];
const OFF={battery:[0,110],motor:[0,80],brake:[86,0],tire:[150,0],smart:[0,-56]};
const ex=p=>[p.center[0]+p.dir[0], p.center[1]+p.dir[1]];
const bd=p=>{const c=ex(p),o=OFF[p.id];return [c[0]+o[0], c[1]+o[1]];};
let ok=true;
console.log('viewBox:', `x∈[${VB.x},${VB.x+VB.w}]  y∈[${VB.y},${VB.y+VB.h}]`);
for(const p of PARTS){
  const b=bd(p), e=ex(p);
  const inVB = b[0]-R>=VB.x && b[0]+R<=VB.x+VB.w && b[1]-R>=VB.y && b[1]+R<=VB.y+VB.h;
  // 与本体盒（外扩 R）是否相交：不相交才算通过
  const hit = Math.abs(b[0]-e[0]) < p.box[0]+R && Math.abs(b[1]-e[1]) < p.box[1]+R;
  // 引线长度（徽章边缘 → 本体中心）
  const tick=Math.hypot(b[0]-e[0],b[1]-e[1]);
  if(!inVB||hit) ok=false;
  console.log(`${p.id.padEnd(8)} 爆开中心(${e[0]},${e[1]})  徽章(${b[0]},${b[1]})  在画布内:${inVB?'✔':'✘'}  压本体:${hit?'✘':'✔ 无'}  引线长${tick.toFixed(0)}`);
}
for(let i=0;i<PARTS.length;i++)for(let j=i+1;j<PARTS.length;j++){
  const a=bd(PARTS[i]),b=bd(PARTS[j]),d=Math.hypot(a[0]-b[0],a[1]-b[1]);
  if(d<2*R+12){ok=false;console.log(`✘ 徽章重叠: ${PARTS[i].id} ↔ ${PARTS[j].id} 距离 ${d.toFixed(0)}`);}
}
console.log(ok?'\n全部通过 ✔  徽章两两间距 ≥ 52 ✔  均在画布内 ✔  无一压住部件 ✔':'\n存在冲突 ✘');
