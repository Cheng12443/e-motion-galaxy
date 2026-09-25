// 复刻 02-galaxy.html 的投影数学，验证不同屏幕下星系是否落在视口内、行星尺寸是否合理
function check(W,H,label){
  const FOCAL=Math.min(W,H)*1.35, K=0.30, PLANET=[1.0,1.18,0.92];
  const pit=-0.30, yaw=0.35, camD=3.9;
  const proj=(x,z)=>{ // y=0 平面
    const cy=Math.cos(yaw),sy=Math.sin(yaw);
    let X=x*cy-z*sy, Z=x*sy+z*cy;
    const cp=Math.cos(pit),sp=Math.sin(pit);
    let Y=0*cp-Z*sp, Z2=0*sp+Z*cp;
    const d=Math.max(.35,camD+Z2), s=FOCAL/d;
    return {x:W/2+X*s, y:H/2+Y*s, s, d:Z2};
  };
  let out=[], maxR=0, maxOff=0;
  for(let i=0;i<3;i++){
    const a=i/3*Math.PI*2, p=proj(Math.cos(a),Math.sin(a));
    const r=PLANET[i]*p.s*K;
    maxR=Math.max(maxR,r);
    maxOff=Math.max(maxOff, Math.abs(p.x-W/2), Math.abs(p.y-H/2));
    out.push(`P${i} (${p.x.toFixed(0)},${p.y.toFixed(0)}) r=${r.toFixed(0)}px`);
  }
  const fitX = maxOff < W/2-20;
  console.log(`${label} ${W}x${H} FOCAL=${FOCAL.toFixed(0)} | ${out.join('  ')} | 最大偏移=${maxOff.toFixed(0)} < 半宽${(W/2).toFixed(0)}? ${fitX?'✔':'✘'} | 行星直径 ${(maxR*2).toFixed(0)}px`);
}
check(393,800,'iPhone类竖屏 ');
check(360,640,'小屏安卓    ');
check(1440,800,'桌面        ');
check(768,1024,'平板        ');
// 放大到最近(camD=2.4)时的行星半径
const F=Math.min(393,800)*1.35,s=F/2.4, r=1.18*s*0.30;
console.log('推进特写时行星半径 =', r.toFixed(0)+'px （屏幕宽 393）');
