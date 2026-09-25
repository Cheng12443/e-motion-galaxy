/* R5 离线校验：① 时间轴光轨两种朝向是否都在画布内 ② 雷达六轴评分是否都落在 0~1 */
function smooth(pts,vertical){
  var p=pts.map(function(q){return vertical?[q[1],q[0]]:[q[0],q[1]]});
  var d="M"+p[0][0]+" "+p[0][1];
  for(var i=0;i<p.length-1;i++){
    var p0=p[i-1]||p[i],p1=p[i],p2=p[i+1],p3=p[i+2]||p2;
    d+=" C"+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+" "+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+" "+
        (p2[0]-(p3[0]-p1[0])/6).toFixed(1)+" "+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+" "+
        p2[0].toFixed(1)+" "+p2[1].toFixed(1);
  }
  return d;
}
function bbox(d){
  var nums=d.match(/-?\d+(\.\d+)?/g).map(Number), xs=[],ys=[];
  for(var i=0;i<nums.length;i+=2){xs.push(nums[i]);ys.push(nums[i+1]);}
  return {x0:Math.min.apply(null,xs),x1:Math.max.apply(null,xs),y0:Math.min.apply(null,ys),y1:Math.max.apply(null,ys)};
}
var BR={
 city :[[70,430],[340,300],[660,392],[980,246],[1330,320]],
 trail:[[70,300],[300,500],[620,214],[940,486],[1330,250]],
 long :[[70,520],[380,452],[720,352],[1040,236],[1330,168]],
 infinity:[[70,400],[260,180],[520,560],[780,140],[1060,540],[1330,260]]
};
var VB={h:[0,0,1400,760], v:[0,0,760,1400]};
var ok=true;
console.log('== 时间轴光轨（控制点包围盒 + 贝塞尔控制点包围盒）==');
Object.keys(BR).forEach(function(k){
  [['桌面横向',false],['移动纵向',true]].forEach(function(o){
    var vertical=o[1], d=smooth(BR[k],vertical), b=bbox(d), vb=vertical?VB.v:VB.h;
    var inside=b.x0>=vb[0]-1&&b.y0>=vb[1]-1&&b.x1<=vb[0]+vb[2]+1&&b.y1<=vb[1]+vb[3]+1;
    if(!inside) ok=false;
    console.log(`  ${k.padEnd(9)} ${o[0]}  x[${b.x0.toFixed(0)},${b.x1.toFixed(0)}] y[${b.y0.toFixed(0)},${b.y1.toFixed(0)}]  viewBox ${vb[2]}x${vb[3]}  ${inside?'✔ 在画布内':'✘ 溢出'}`);
  });
});
/* 节点分数递增 */
console.log('== 节点落在光轨上的比例 ==');
[3,6].forEach(function(n){
  var a=[]; for(var i=0;i<n;i++) a.push(+(0.12+(n>1?i/(n-1):0.5)*0.76).toFixed(3));
  var inc=a.every(function(v,i){return i===0||v>a[i-1]});
  console.log(`  ${n} 个节点: ${a.join(' → ')}  ${inc?'✔ 递增':'✘'}`);
  if(!inc) ok=false;
});
/* 雷达评分 */
var MODELS=[
 {id:"nova-c1",range:60,speed:25,feat:6,br:"鼓刹鼓刹",as:["EABS"],sc:2},
 {id:"nova-c2",range:95,speed:45,feat:8,br:"碟刹碟刹",as:["EABS","TCS"],sc:3},
 {id:"volt-p1",range:110,speed:80,feat:8,br:"液压碟刹液压碟刹",as:["EABS","TCS"],sc:3},
 {id:"volt-p2",range:160,speed:120,feat:9,br:"液压碟刹 + ABS液压碟刹",as:["EABS","TCS","ABS"],sc:3},
 {id:"terra-x1",range:70,speed:25,feat:5,br:"碟刹碟刹",as:["EABS"],sc:2},
 {id:"terra-x2",range:110,speed:60,feat:8,br:"液压碟刹液压碟刹",as:["EABS","TCS"],sc:3}
];
function bl(m){var s=m.br,lv=/液压/.test(s)?3:(/碟刹/.test(s)?2:1); if(/ABS/.test(s)||m.as.indexOf("ABS")>=0)lv+=0.5; return lv;}
var AX=[["续航",function(m){return m.range},160],["速度",function(m){return m.speed},120],
        ["智能",function(m){return m.feat},9],["制动",bl,3.5],
        ["电控",function(m){return m.as.length},3],["场景",function(m){return m.sc},3]];
console.log('== 雷达六轴评分（必须全部落在 0~1）==');
var allIn=true;
MODELS.forEach(function(m){
  var row=AX.map(function(a){var v=a[1](m)/a[2]; if(v<0||v>1)allIn=false; return a[0]+':'+v.toFixed(2);});
  console.log('  '+m.id.padEnd(9)+row.join('  '));
});
if(!allIn){ok=false;console.log('  ✘ 有评分越界');} else console.log('  ✔ 全部在 0~1');
/* 每根轴是否存在“不同值”（否则雷达退化成一个点）*/
console.log('== 每根轴是否存在分散度 ==');
AX.forEach(function(a){
  var vs=MODELS.map(function(m){return a[1](m)/a[2]});
  var d=Math.max.apply(null,vs)-Math.min.apply(null,vs);
  console.log('  '+a[0]+' 极差 '+d.toFixed(2)+(d>0.05?' ✔':' ⚠ 区分度低'));
});
console.log(ok?'\nR5 几何/数值校验全部通过 ✔':'\n存在问题 ✘');
