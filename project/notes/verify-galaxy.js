
(function(){
  "use strict";
  /* ================= 数据（占位，可替换为官方数据） ================= */
  var SERIES=[
    {id:"city-flow",name:"城市流动系列",code:"CITY FLOW",slogan:"把通勤变成一段顺滑的电流",
     description:"面向城市日常通勤的轻量车型族。强调轻、快、好停、好解锁，主打智能解锁与能量回收带来的“无感通勤”。",
     positioning:"通勤 / 城市穿梭",color:"#C6FF00",size:1.0,models:["nova-c1","nova-c2"]},
    {id:"voltage-pro",name:"高压性能系列",code:"VOLTAGE PRO",slogan:"电压越界的地方，才有速度",
     description:"面向性能用户的中大功率车型族。以自研三电（电机 / 锂电池 + BMS / FOC 电控）与主动安全（TCS / ABS / EABS）为核心叙事。",
     positioning:"性能 / 长距离电摩",color:"#00E5FF",size:1.18,models:["volt-p1","volt-p2"]},
    {id:"terra-x",name:"全地形探索系列",code:"TERRA X",slogan:"路断了，电流不会断",
     description:"面向非铺装路面与城郊探索的车型族。强调悬挂行程、轮胎抓地、低扭输出与轻量化车架。",
     positioning:"越野 / 城郊探索",color:"#FF6B00",size:0.92,models:["terra-x1","terra-x2"]}
  ];
  var MODELS={
    "nova-c1":{name:"NOVA C1",subtitle:"轻量入门通勤",range:60,speed:25,price:null,
      colors:["#EDEDED","#C6FF00","#1A1A1A"],features:["RideyGo 感应解锁","整车 OTA","能量回收"]},
    "nova-c2":{name:"NOVA C2",subtitle:"城市穿梭进阶",range:95,speed:45,price:null,
      colors:["#C6FF00","#00E5FF","#8A8A82"],features:["RideyGo 感应解锁","整车 OTA","TCS 牵引力控制","能量回收"]},
    "volt-p1":{name:"VOLT P1",subtitle:"性能电摩入门",range:110,speed:80,price:null,
      colors:["#00E5FF","#1A1A1A","#FF6B00"],features:["FOC 矢量控制","整车 OTA","TCS 牵引力控制","能量回收"]},
    "volt-p2":{name:"VOLT P2",subtitle:"性能旗舰",range:160,speed:120,price:null,
      colors:["#FF6B00","#1A1A1A","#C6FF00"],features:["ABS 防抱死","TCS 牵引力控制","EABS 能量回收","整车 OTA"]},
    "terra-x1":{name:"TERRA X1",subtitle:"城郊探索",range:70,speed:25,price:null,
      colors:["#6B7A4A","#1A1A1A","#FF6B00"],features:["RideyGo 感应解锁","整车 OTA","能量回收"]},
    "terra-x2":{name:"TERRA X2",subtitle:"全地形进阶",range:110,speed:60,price:null,
      colors:["#FF6B00","#6B7A4A","#00555E"],features:["FOC 矢量控制","TCS 牵引力控制","整车 OTA","能量回收"]}
  };
  var DATA_NOTE="占位示例数据 · 可替换为官方数据";

  var $=function(s){return document.querySelector(s)};
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE=window.matchMedia('(max-width:900px),(pointer:coarse)').matches;
  var root=document.documentElement;
  var live=$('#live');

  /* ---------- 日 / 夜 ---------- */
  function applyScene(night){
    root.classList.toggle('is-night',night);
    $('#btnScene').textContent=night?'☾ 夜间':'☀ 日间';
    $('#btnScene').setAttribute('aria-pressed',String(!night));
    try{localStorage.setItem('emg.night',night?'1':'0')}catch(e){}
  }
  var sn=null; try{sn=localStorage.getItem('emg.night')}catch(e){}
  var h=new Date().getHours();
  applyScene(sn===null?(h<6||h>=18):(sn==='1'));
  $('#btnScene').addEventListener('click',function(){applyScene(!root.classList.contains('is-night'))});

  /* ---------- 颜色工具 ---------- */
  function hex2rgb(c){c=c.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    return [parseInt(c.substr(0,2),16),parseInt(c.substr(2,2),16),parseInt(c.substr(4,2),16)]}
  function mix(c,t,a){var r=hex2rgb(c),b=hex2rgb(t);
    return 'rgb('+Math.round(r[0]+(b[0]-r[0])*a)+','+Math.round(r[1]+(b[1]-r[1])*a)+','+Math.round(r[2]+(b[2]-r[2])*a)+')'}
  function rgba(c,a){var r=hex2rgb(c);return 'rgba('+r[0]+','+r[1]+','+r[2]+','+a+')'}

  /* ---------- Canvas / 相机 ---------- */
  var cvs=$('#stars'), ctx=cvs.getContext('2d');
  var W=0,H=0,dpr=1,FOCAL=1,CAMD=3.5;
  var yaw=0.35, pitch=-0.30, camD=3.9;
  var yawT=0.35, pitchT=-0.30, camDT=3.9;
  var spin=0, paused=0, hover=-1, openIdx=-1;

  var PLANET_K=0.30;   /* 世界半径 → 屏幕半径系数（含透视衰减） */
  function resize(){
    var r=cvs.getBoundingClientRect();
    dpr=Math.min(2,window.devicePixelRatio||1);
    W=r.width; H=r.height;
    cvs.width=Math.round(W*dpr); cvs.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    FOCAL=Math.min(W,H)*1.35;
  }
  window.addEventListener('resize',resize); resize();

  var STARS=[];
  (function(){ var n=MOBILE?150:260;
    for(var i=0;i<n;i++){
      var th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), rr=2.4+Math.random()*7;
      STARS.push({x:Math.sin(ph)*Math.cos(th)*rr,y:Math.cos(ph)*rr*0.6,z:Math.sin(ph)*Math.sin(th)*rr,
        s:0.4+Math.random()*1.3,o:0.25+Math.random()*0.6,tw:Math.random()*6.28});
    }
  })();

  function project(p){
    var cy=Math.cos(yaw),sy=Math.sin(yaw);
    var x=p.x*cy-p.z*sy, z=p.x*sy+p.z*cy;
    var cp=Math.cos(pitch),sp=Math.sin(pitch);
    var y=p.y*cp-z*sp, z2=p.y*sp+z*cp;
    var d=Math.max(0.35,camD+z2);
    var s=FOCAL/d;
    return {x:W/2+x*s, y:H/2+y*s, s:s, d:z2};
  }
  function ang(i){ return (i/SERIES.length)*Math.PI*2 + spin; }
  function pos(i){ var a=ang(i); return {x:Math.cos(a), y:0, z:Math.sin(a)}; }

  function drawPlanet(cx,cy,r,col,glow){
    // 光晕
    var hg=ctx.createRadialGradient(cx,cy,r*0.85,cx,cy,r*(glow?3.1:2.4));
    hg.addColorStop(0,rgba(col,0.26)); hg.addColorStop(1,rgba(col,0));
    ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(cx,cy,r*(glow?3.1:2.4),0,6.283); ctx.fill();
    // 球体
    var g=ctx.createRadialGradient(cx-r*0.34,cy-r*0.4,r*0.06,cx,cy,r);
    g.addColorStop(0,mix(col,'#ffffff',0.72));
    g.addColorStop(0.28,col);
    g.addColorStop(0.74,mix(col,'#04060a',0.72));
    g.addColorStop(1,'#04060a');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,r,0,6.283); ctx.fill();
    // 经纬线（HUD 星球）
    ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,r,0,6.283); ctx.clip();
    ctx.strokeStyle=rgba(col,0.22); ctx.lineWidth=1;
    for(var k=-2;k<=2;k++){
      var yy=cy+k*r*0.36, rx=Math.sqrt(Math.max(0,r*r-Math.pow(k*r*0.36,2)));
      ctx.beginPath(); ctx.ellipse(cx,yy,rx,rx*0.22,0,0,6.283); ctx.stroke();
    }
    for(var k2=-2;k2<=2;k2++){
      ctx.beginPath(); ctx.ellipse(cx,cy,r*Math.abs(Math.cos(k2*0.5))+0.001,r,0,0,6.283); ctx.stroke();
    }
    ctx.restore();
    // 边缘光
    ctx.strokeStyle=rgba(col,glow?0.95:0.55); ctx.lineWidth=glow?2:1.2;
    ctx.beginPath(); ctx.arc(cx,cy,r*0.995,0.6,2.4); ctx.stroke();
    // 扫描线
    ctx.globalAlpha=0.12; ctx.strokeStyle='#ffffff'; ctx.lineWidth=1;
    for(var yy2=cy-r;yy2<cy+r;yy2+=4){
      var dx=Math.sqrt(Math.max(0,r*r-(yy2-cy)*(yy2-cy)));
      ctx.beginPath(); ctx.moveTo(cx-dx,yy2); ctx.lineTo(cx+dx,yy2); ctx.stroke();
    }
    ctx.globalAlpha=1;
  }

  function drawOrbit(){
    ctx.lineWidth=1;
    var seg=120;
    for(var i=0;i<SERIES.length;i++){
      var col=SERIES[i].color, base=(i/SERIES.length)*Math.PI*2+spin;
      ctx.beginPath();
      for(var k=0;k<=seg;k++){
        var a=base+k/seg*Math.PI*2;
        var p=project({x:Math.cos(a),y:0,z:Math.sin(a)});
        if(k===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
      }
      ctx.strokeStyle=rgba(col,hover===i||openIdx===i?0.55:0.2);
      ctx.stroke();
      // 轨道上的能量点
      var a2=base+performance.now()/2600;
      var pp=project({x:Math.cos(a2),y:0,z:Math.sin(a2)});
      ctx.fillStyle=rgba(col,0.9); ctx.beginPath(); ctx.arc(pp.x,pp.y,2.2,0,6.283); ctx.fill();
    }
  }

  /* DOM 行星按钮 */
  var layer=$('#planetLayer'), HITS=[], LBS=[];
  SERIES.forEach(function(s,i){
    var b=document.createElement('button');
    b.className='hit'; b.type='button'; b.dataset.i=i;
    b.style.setProperty('--pc',s.color);
    b.setAttribute('aria-label',s.name+'（'+s.code+'）：'+s.positioning+'。点击进入系列详情。');
    layer.appendChild(b); HITS.push(b);
    var lb=document.createElement('span');
    lb.className='chip-lb'; lb.style.setProperty('--pc',s.color);
    lb.innerHTML='<b>'+s.code.split(' ')[0]+'</b>'+s.name;
    layer.appendChild(lb); LBS.push(lb);
    b.addEventListener('mouseenter',function(){hover=i;paused=performance.now()});
    b.addEventListener('focus',function(){
      /* 只有键盘触发的 focus 才弹卡片（程序化 focus 不弹，避免关闭面板后卡片乱跳） */
      if(b.matches(':focus-visible')){hover=i;paused=performance.now();}
    });
    b.addEventListener('mouseleave',function(){if(hover===i)hover=-1});
    b.addEventListener('blur',function(){if(hover===i)hover=-1});
    b.addEventListener('click',function(){openSeries(i,true)});
  });

  /* tooltip */
  var tip=$('#tip');
  function tipHTML(s){
    var ms=s.models.map(function(id){return MODELS[id].name}).join(' / ');
    return '<div class="code">'+s.code+'</div><h3>'+s.name+'</h3><p class="slogan">'+s.slogan+'</p>'+
      '<div class="meta"><div><span class="k">定位</span><span class="v">'+s.positioning+'</span></div>'+
      '<div><span class="k">代表车型</span><span class="v">'+ms+'</span></div>'+
      '<div><span class="k">车系规模</span><span class="v">'+s.models.length+' 款</span></div></div>'+
      '<div class="go">点击进入 ↗</div>';
  }

  /* 布局（每帧） */
  function layout(){
    var now=performance.now();
    var arr=[];
    for(var i=0;i<SERIES.length;i++){
      var p=project(pos(i));
      var r=SERIES[i].size*p.s*PLANET_K*(hover===i?1.32:(openIdx===i?1.5:1));
      arr.push({i:i,p:p,r:r});
    }
    arr.sort(function(a,b){return a.p.d-b.p.d});
    for(var k=0;k<arr.length;k++){
      var it=arr[k], i=it.i, p=it.p, r=it.r;
      var k1=(r*2*1.5)/132;
      HITS[i].style.transform='translate3d('+p.x.toFixed(1)+'px,'+p.y.toFixed(1)+'px,0) translate(-50%,-50%) scale('+k1.toFixed(3)+')';
      HITS[i].style.opacity = p.d>1.8?0.55:1;
      var inFront = (openIdx<0) ? true : (openIdx===i);
      HITS[i].style.pointerEvents = inFront?'auto':'none';
      LBS[i].style.transform='translate3d('+p.x.toFixed(1)+'px,'+(p.y+r+20).toFixed(1)+'px,0) translate(-50%,-50%)';
      LBS[i].style.opacity=(p.d>2.2?0.3:1)*(inFront?1:0.25);
    }
    // tooltip 跟随
    if(hover>=0 && openIdx<0){
      var it2=null; arr.forEach(function(o){if(o.i===hover)it2=o});
      if(it2){
        var tw=tip.offsetWidth||280, th=tip.offsetHeight||160;
        var tx=it2.p.x+it2.r+26, ty=it2.p.y-th/2;
        tx=Math.min(Math.max(12,tx),W-tw-12); ty=Math.min(Math.max(70,ty),H-th-16);
        tip.style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0)';
        tip.style.setProperty('--pc',SERIES[hover].color);
        tip.innerHTML=tipHTML(SERIES[hover]);
        tip.classList.add('on'); tip.setAttribute('aria-hidden','false');
      }
    }else{ tip.classList.remove('on'); tip.setAttribute('aria-hidden','true'); }
  }

  /* 渲染循环 */
  var last=performance.now(), frames=0;
  function frame(now){
    var dt=Math.min(60,now-last)/1000; last=now;
    var e=RM?1:Math.min(1,dt*7);
    yaw+=(yawT-yaw)*e; pitch+=(pitchT-pitch)*e; camD+=(camDT-camD)*(RM?1:Math.min(1,dt*5));
    if(!RM && now-paused>2600 && openIdx<0) spin+=dt*0.055;
    ctx.clearRect(0,0,W,H);
    // 星场
    var t=now/1000;
    for(var i=0;i<STARS.length;i++){
      var s=STARS[i], p=project(s);
      if(p.x<-40||p.x>W+40||p.y<-40||p.y>H+40) continue;
      var tw=0.6+0.4*Math.sin(t*1.6+s.tw);
      ctx.fillStyle='rgba(255,255,255,'+(s.o*tw*(1-Math.min(0.75,Math.abs(p.d)/9))).toFixed(2)+')';
      ctx.beginPath(); ctx.arc(p.x,p.y,s.s,0,6.283); ctx.fill();
    }
    drawOrbit();
    // 星球（远→近）
    var arr=[];
    for(var j=0;j<SERIES.length;j++){ var pp=project(pos(j)); arr.push({j:j,pp:pp}); }
    arr.sort(function(a,b){return a.pp.d-b.pp.d});
    arr.forEach(function(o){
      var j=o.j, p=o.pp;
      var r=SERIES[j].size*p.s*PLANET_K*(hover===j?1.32:(openIdx===j?1.5:1));
      if(o.pp.d>2.6) return;
      ctx.globalAlpha = o.pp.d>1.8?0.6:1;
      drawPlanet(p.x,p.y,r,SERIES[j].color,hover===j||openIdx===j);
      ctx.globalAlpha=1;
    });
    layout();
    if(frames===0) layer.classList.add('ready');
    if(++frames%3===0) $('#zoomv').textContent=Math.round(3.9/camD*100)+'%';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- 交互：拖拽 / 缩放 ---------- */
  var dragging=false, lx=0, ly=0, moved=0;
  cvs.addEventListener('pointerdown',function(e){
    dragging=true; moved=0; lx=e.clientX; ly=e.clientY; paused=performance.now();
    cvs.classList.add('grabbing'); cvs.setPointerCapture&&cvs.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove',function(e){
    if(!dragging) return;
    var dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
    moved+=Math.abs(dx)+Math.abs(dy);
    yawT-=dx*0.006; pitchT=Math.max(-0.62,Math.min(0.16,pitchT+dy*0.003));
    if(!RM){yaw=yawT;pitch=pitchT;}
  });
  window.addEventListener('pointerup',function(){
    if(dragging){dragging=false;cvs.classList.remove('grabbing');paused=performance.now();}
  });
  cvs.addEventListener('wheel',function(e){
    if(openIdx>=0) return;
    e.preventDefault();
    camDT=Math.max(2.1,Math.min(7.2,camDT+ (e.deltaY>0?0.26:-0.26)));
    paused=performance.now();
  },{passive:false});
  // 双指缩放
  var pinch=null;
  cvs.addEventListener('touchstart',function(e){
    if(e.touches.length===2){ pinch=dist(e); }
  },{passive:true});
  cvs.addEventListener('touchmove',function(e){
    if(e.touches.length===2&&pinch){
      e.preventDefault();
      var d=dist(e), k=pinch/d; pinch=d;
      camDT=Math.max(2.1,Math.min(7.2,camDT*k));
    }
  },{passive:false});
  function dist(e){var a=e.touches[0],b=e.touches[1];return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}

  $('#btnIn').addEventListener('click',function(){camDT=Math.max(2.1,camDT-0.5);paused=performance.now()});
  $('#btnOut').addEventListener('click',function(){camDT=Math.min(7.2,camDT+0.5);paused=performance.now()});
  $('#btnReset').addEventListener('click',function(){yawT=0.35;pitchT=-0.30;camDT=3.9;spin=0;paused=0});
  $('#btnDown').addEventListener('click',function(){document.querySelector('footer.site').scrollIntoView({behavior:RM?'auto':'smooth'})});

  /* ---------- 键盘：行星间切换 ---------- */
  layer.addEventListener('keydown',function(e){
    var i=+document.activeElement.dataset.i;
    if(isNaN(i)) return;
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){HITS[(i+1)%SERIES.length].focus();e.preventDefault()}
    if(e.key==='ArrowLeft'||e.key==='ArrowUp'){HITS[(i-1+SERIES.length)%SERIES.length].focus();e.preventDefault()}
  });

  /* ---------- 成就 / 进度 ---------- */
  var explored={};
  try{ explored=JSON.parse(localStorage.getItem('emg.explored')||'{}')||{}; }catch(e){}
  function paintProgress(){
    var n=Object.keys(explored).length, C2=157.1;
    $('#pr').setAttribute('stroke-dashoffset',(C2*(1-n/SERIES.length)).toFixed(1));
    var el=$('#prTxt'); el.textContent=n+' / '+SERIES.length;
    el.classList.toggle('done',n>=SERIES.length);
  }
  paintProgress();
  var toastT=null;
  function toast(icon,t1,t2,ms){
    var el=$('#toast');
    el.innerHTML='<span class="bdg">'+icon+'</span><div><div class="t1">'+t1+'</div><div class="t2 caps">'+t2+'</div></div>';
    el.classList.add('on'); el.setAttribute('aria-hidden','false');
    clearTimeout(toastT); toastT=setTimeout(function(){el.classList.remove('on');el.setAttribute('aria-hidden','true')},ms||3200);
  }

  /* ---------- 打开 / 关闭系列 ---------- */
  var detail=$('#detail'), panel=$('#panel'), wipe=$('#wipe');
  function nearestYaw(i){
    var target = Math.PI*1.5 - ang(i);
    var d = target - yawT;
    while(d>Math.PI) d-=Math.PI*2;
    while(d<-Math.PI) d+=Math.PI*2;
    return yawT + d;
  }
  function openSeries(i,animate){
    openIdx=i; hover=-1; paused=performance.now();
    var s=SERIES[i];
    panel.style.setProperty('--pc',s.color);
    var html=''+
      '<button class="btn-mini" id="pClose" aria-label="返回星系">← 返回星系</button>'+
      '<div class="pcode" style="margin-top:20px">'+s.code+'</div>'+
      '<h2 id="pTitle">'+s.name+'</h2>'+
      '<p class="pslogan">'+s.slogan+'</p>'+
      '<p class="pdesc">'+s.description+'</p>'+
      '<div class="prow"><span class="tag">定位 · '+s.positioning+'</span><span class="tag">'+s.models.length+' 款车型</span>'+
      '<span class="badge">'+DATA_NOTE+'</span></div>'+
      '<div class="mcards">'+s.models.map(function(id){
        var m=MODELS[id];
        return '<article class="mcard">'+
          '<div class="mh"><h4>'+m.name+'</h4><span class="sub">'+m.subtitle+'</span></div>'+
          '<div class="sil">车型剪影占位 · 可替换为官方产品图</div>'+
          '<div class="mgrid">'+
            '<div class="mg"><div class="k">续航</div><div class="v">'+m.range+'<small>km</small></div></div>'+
            '<div class="mg"><div class="k">最高速度</div><div class="v">'+m.speed+'<small>km/h</small></div></div>'+
            '<div class="mg"><div class="k">价格</div><div class="v">'+(m.price==null?'—':'¥'+m.price)+'</div></div>'+
            '<div class="mg"><div class="k">智能</div><div class="v" style="font-size:.8rem;font-family:var(--font-ui)">'+m.features.length+' 项</div></div>'+
          '</div>'+
          '<div class="sw">'+m.colors.map(function(c){return '<i style="background:'+c+'"></i>'}).join('')+'</div>'+
          '<div class="mfoot"><span class="badge">示意值 · 非官方数据</span>'+
          '<a class="btn-mini go" href="03-model.html?id='+id+'">查看拆解 <span aria-hidden="true">→</span></a></div>'+
        '</article>';
      }).join('')+'</div>'+
      '<p style="color:var(--txt-lo);font-size:.8rem;margin-top:24px">以上为占位示例数据，仅用于演示交互结构，非官方参数。</p>'+
      '<button class="btn-mini back" id="pClose2">← 返回星系</button>';
    panel.innerHTML=html;
    panel.scrollTop=0;
    function close(){
      detail.classList.remove('on'); detail.setAttribute('aria-hidden','true');
      openIdx=-1; paused=performance.now();
      camDT=Math.min(camDT,4.2);
      setTimeout(function(){HITS[0].focus({preventScroll:true})},60);
    }
    $('#pClose').addEventListener('click',close);
    $('#pClose2').addEventListener('click',close);
    $('#scrim').onclick=close;

    if(!explored[s.id]){
      explored[s.id]=1;
      try{localStorage.setItem('emg.explored',JSON.stringify(explored))}catch(e){}
      paintProgress();
      var n=Object.keys(explored).length;
      if(n>=SERIES.length){
        setTimeout(function(){toast('★','电流大师 · 已解锁','EXPLORED ALL '+SERIES.length+' SERIES',5000)},1200);
      }else{
        setTimeout(function(){toast('✦','已点亮：'+s.name,'SERIES '+n+' / '+SERIES.length,2600)},900);
      }
    }

    // 相机推进 + 电流环转场
    yawT=nearestYaw(i); camDT=2.4;
    if(animate && !RM){
      wipe.classList.add('on');
      setTimeout(function(){wipe.classList.remove('on')},900);
    }
    setTimeout(function(){
      detail.classList.add('on'); detail.setAttribute('aria-hidden','false');
      panel.focus({preventScroll:true}); live.textContent='已进入 '+s.name;
    }, RM?0:(animate?380:0));
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&openIdx>=0){ $('#pClose') && $('#pClose').click(); }
  });
})();
