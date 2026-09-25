
(function(){
  "use strict";
  /* ============ 数据（占位示例，可替换为官方数据） ============ */
  var MODELS=[
    {id:"nova-c1",series:"city-flow",name:"NOVA C1",sub:"轻量入门通勤",price:null,demoPrice:3199,
     range:60,speed:25,battery:{type:"锂电池",voltage:"48V",capacity:"20Ah"},
     motor:{type:"直驱轮毂电机",rated:"400W",peak:"—"},
     brake:{front:"鼓刹",rear:"鼓刹",assist:["EABS 能量回收"]},
     feat:["RideyGo 感应解锁","离车自动落锁","App 远程控制","整车 OTA","定位防盗","能量回收"],
     scenes:["通勤","城市"],colors:[{n:"雾白",h:"#EDEDED"},{n:"荧光绿",h:"#C6FF00"},{n:"石墨黑",h:"#1A1A1A"}]},
    {id:"nova-c2",series:"city-flow",name:"NOVA C2",sub:"城市穿梭进阶",price:null,demoPrice:4299,
     range:95,speed:45,battery:{type:"锂电池",voltage:"60V",capacity:"26Ah"},
     motor:{type:"直驱轮毂电机",rated:"1200W",peak:"—"},
     brake:{front:"碟刹",rear:"碟刹",assist:["EABS 能量回收","TCS 牵引力控制"]},
     feat:["RideyGo 感应解锁","离车自动落锁","App 远程控制","整车 OTA","定速巡航","定位防盗","能量回收","胎压提示"],
     scenes:["通勤","城市","夜骑"],colors:[{n:"荧光绿",h:"#C6FF00"},{n:"电光蓝",h:"#00E5FF"},{n:"沙岩灰",h:"#8A8A82"}]},
    {id:"volt-p1",series:"voltage-pro",name:"VOLT P1",sub:"性能电摩入门",price:null,demoPrice:6999,
     range:110,speed:80,battery:{type:"锂电池",voltage:"72V",capacity:"32Ah"},
     motor:{type:"直驱轮毂电机",rated:"3000W",peak:"—"},
     brake:{front:"液压碟刹",rear:"液压碟刹",assist:["EABS 能量回收","TCS 牵引力控制"]},
     feat:["RideyGo 感应解锁","整车 OTA","FOC 矢量控制","App 远程控制","定速巡航","定位防盗","能量回收","骑行数据回传"],
     scenes:["城市","夜骑","长途"],colors:[{n:"电光蓝",h:"#00E5FF"},{n:"石墨黑",h:"#1A1A1A"},{n:"能量橙",h:"#FF6B00"}]},
    {id:"volt-p2",series:"voltage-pro",name:"VOLT P2",sub:"性能旗舰",price:null,demoPrice:12999,
     range:160,speed:120,battery:{type:"锂电池",voltage:"高压平台",capacity:"—"},
     motor:{type:"直驱轮毂电机",rated:"—",peak:"—"},
     brake:{front:"液压碟刹 + ABS",rear:"液压碟刹",assist:["EABS 能量回收","TCS 牵引力控制","ABS 防抱死"]},
     feat:["RideyGo 感应解锁","整车 OTA","FOC 矢量控制","TCS 牵引力控制","ABS 防抱死","App 远程控制","定位防盗","能量回收","骑行数据回传"],
     scenes:["夜骑","长途","城市"],colors:[{n:"能量橙",h:"#FF6B00"},{n:"石墨黑",h:"#1A1A1A"},{n:"荧光绿",h:"#C6FF00"}]},
    {id:"terra-x1",series:"terra-x",name:"TERRA X1",sub:"城郊探索",price:null,demoPrice:5299,
     range:70,speed:25,battery:{type:"锂电池",voltage:"48V",capacity:"24Ah"},
     motor:{type:"直驱轮毂电机",rated:"600W",peak:"—"},
     brake:{front:"碟刹",rear:"碟刹",assist:["EABS 能量回收"]},
     feat:["RideyGo 感应解锁","整车 OTA","App 远程控制","定位防盗","能量回收"],
     scenes:["越野","城市"],colors:[{n:"旷野橄榄",h:"#6B7A4A"},{n:"石墨黑",h:"#1A1A1A"},{n:"能量橙",h:"#FF6B00"}]},
    {id:"terra-x2",series:"terra-x",name:"TERRA X2",sub:"全地形进阶",price:null,demoPrice:7999,
     range:110,speed:60,battery:{type:"锂电池",voltage:"60V",capacity:"32Ah"},
     motor:{type:"直驱轮毂电机",rated:"2000W",peak:"—"},
     brake:{front:"液压碟刹",rear:"液压碟刹",assist:["EABS 能量回收","TCS 牵引力控制"]},
     feat:["RideyGo 感应解锁","整车 OTA","FOC 矢量控制","TCS 牵引力控制","App 远程控制","定位防盗","能量回收","胎压提示"],
     scenes:["越野","长途","夜骑"],colors:[{n:"能量橙",h:"#FF6B00"},{n:"旷野橄榄",h:"#6B7A4A"},{n:"深青",h:"#00555E"}]}
  ];
  var SERIESNAME={"city-flow":"CITY FLOW · 城市流动系列","voltage-pro":"VOLTAGE PRO · 高压性能系列","terra-x":"TERRA X · 全地形探索系列"};

  /* 拆解部件：dir=爆开位移(viewBox单位) center=初始中心(viewBox) win=滚动窗口 */
  var PARTS=[
    {id:"battery",en:"BATTERY",cn:"电池组",     dir:[0,96],    center:[537,530], win:[0.10,0.28]},
    {id:"motor",  en:"MOTOR",  cn:"轮毂电机",   dir:[-152,40], center:[272,500], win:[0.28,0.46]},
    {id:"brake",  en:"BRAKE",  cn:"制动系统",   dir:[92,-106], center:[896,500], win:[0.46,0.63]},
    {id:"tire",   en:"TIRE",   cn:"轮胎与轮毂", dir:[64,104],  center:[896,500], win:[0.63,0.80]},
    {id:"smart",  en:"SMART",  cn:"智能系统",   dir:[28,-142], center:[828,256], win:[0.80,0.98]}
  ];
  var SW=1400;   /* 换色擦除用的 clip 宽度 */
  /* 徽章相对"完全爆开位置"的额外偏移（viewBox 单位），保证五个徽章互不遮挡也不压住部件 */
  var BADGEOFF={battery:[0,110],motor:[0,80],brake:[86,0],tire:[150,0],smart:[0,-56]};

  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement, body=document.body;
  var TPL=$('#tplvs').innerHTML;

  /* ============ 舞台：从模板生成独立实例（id 加后缀避免重复） ============ */
  var stages={};
  function buildStage(kind){
    var html=TPL.replace(/id="([^"]+)"/g,'id="$1__'+kind+'"').replace(/url\(#([^)]+)\)/g,'url(#$1__'+kind+')');
    var wrap=document.createElement('div');
    wrap.innerHTML=html;
    var svg=wrap.firstElementChild;
    if(kind!=="A"){ var bn=svg.querySelector('[data-role="bodyNew"]'); if(bn)bn.remove();
                    var cp=svg.querySelector('clipPath'); if(cp)cp.remove(); }
    stages[kind]=svg;
    return svg;
  }
  ['A','B','C'].forEach(function(k){ var c=$('#stage'+k); c.appendChild(buildStage(k)); });
  /* chip 已改为 SVG 内徽章，无需再搬移节点 */

  /* ============ 状态 ============ */
  var S={id:null,color:0,wheel:false,light:true,eco:0};

  /* ============ 渲染一个车型 ============ */
  function modelById(id){ for(var i=0;i<MODELS.length;i++) if(MODELS[i].id===id) return MODELS[i]; return MODELS[0]; }

  function render(m,keepColor){
    S.id=m.id;
    $('#mSeries').textContent=SERIESNAME[m.series]||"";
    $('#mTitle').innerHTML=m.name+'<small id="mSub">'+m.sub+'</small>';
    document.title=m.name+" · 拆解｜九号电流宇宙（非官方）";
    $('#kRange').textContent=m.range; $('#kSpeed').textContent=m.speed;
    $('#kPrice').textContent=m.price==null?"—":"¥"+m.price;
    $('#pPrice').textContent=m.price==null?"—":"¥"+m.price;
    $('#hRange').textContent=m.range; $('#hSpeed').textContent=m.speed;
    $('#lnCompare').href="04a-compare.html?ids="+m.id;
    $('#lnConfig').href="04b-configurator.html?id="+m.id;
    // 规格表
    var rows=[["系列",(SERIESNAME[m.series]||"").split(" · ")[1]||""],
              ["续航（示意）",m.range+" km"],["最高速度（示意）",m.speed+" km/h"],
              ["电池",m.battery.type+" · "+m.battery.voltage+" · "+m.battery.capacity],
              ["电机",m.motor.type+" · 额定 "+m.motor.rated],
              ["制动",m.brake.front+" / "+m.brake.rear+" · "+m.brake.assist.join(" ")],
              ["价格",m.price==null?"—（待补官方价）":"¥"+m.price]];
    $('#specTable').innerHTML=rows.map(function(r){
      return '<tr><td class="k">'+r[0]+'</td><td>'+r[1]+
      ' <span class="badge">示例</span></td></tr>';}).join("");
    $('#feat').innerHTML=m.feat.map(function(f){return '<span class="chip">'+f+'</span>'}).join("");
    $('#sceneChips').innerHTML=m.scenes.map(function(s){return '<span class="chip">'+s+'</span>'}).join("");
    // 配色
    if(!keepColor) S.color=0;
    $('#swatches').innerHTML=m.colors.map(function(c,i){
      return '<button class="swbtn" data-i="'+i+'" aria-pressed="'+(i===S.color)+'" title="'+c.n+'" '+
      'aria-label="配色 '+c.n+'" style="background:'+c.h+'"></button>';}).join("");
    $$('#swatches .swbtn').forEach(function(b){
      b.addEventListener('click',function(){
        var i=+b.dataset.i; if(i===S.color) return;
        $$('#swatches .swbtn').forEach(function(x){x.setAttribute('aria-pressed',String(+x.dataset.i===i))});
        applyColor(m.colors[i].h,true);
        S.color=i;
      });
    });
    applyColor(m.colors[S.color].h,false);
    // 车型切换按钮
    $$('#mdlbar .pill').forEach(function(p){ p.setAttribute('aria-pressed',String(p.dataset.id===m.id)); });
    try{ history.replaceState(null,'','?id='+m.id); }catch(e){}
    resetExplode();
  }

  /* 液态换色：bodyNew（--body2）是新色，clip 从左侧扫到右侧盖住 bodyOld（--body）。
     关键顺序：旧色不能提前变，否则擦除看不到 —— --body 必须等扫完再同步。 */
  function setBody(hex){
    ['A','B','C'].forEach(function(k){
      if(stages[k]) stages[k].style.setProperty("--body",hex);
    });
  }
  function applyColor(hex,animate){
    ['A','B','C'].forEach(function(k){
      if(stages[k]) stages[k].style.setProperty("--body2",hex);
    });
    var svgA=stages["A"]; if(!svgA) return;
    var rect=svgA.querySelector('[data-role="swapRect"]');
    if(!rect){ return; }
    var reset=function(){ rect.style.transition='none'; rect.style.transform='translateX(-'+SW+'px)'; };
    if(!animate){ setBody(hex); reset(); return; }
    reset(); void rect.getBoundingClientRect();          /* 强制重排，让下一帧成为新起点 */
    rect.style.transition='transform .62s cubic-bezier(.22,.61,.36,1)';
    rect.style.transform='translateX(0px)';
    setTimeout(function(){ setBody(hex); reset(); },660);
  }

  /* ============ 拆解：滚动驱动 ============ */
  var rail=$('#rail'), specBox=$('#spec'), badges={}, badgeG={};
  var leadG=stages["B"].querySelector('[data-role="leaders"]');
  PARTS.forEach(function(p,i){
    var no=('0'+(i+1)).slice(-2);
    rail.insertAdjacentHTML('beforeend',
      '<div class="railrow" data-rail="'+p.id+'"><i></i><b>'+no+' '+p.en+'</b><span>'+p.cn+'</span></div>');
    leadG.insertAdjacentHTML('beforeend',
      '<g class="badge-g" data-badge="'+p.id+'" opacity="0">'+
        '<line class="tick" x1="0" y1="0" x2="0" y2="0"/>'+
        '<circle cx="0" cy="0" r="20"/>'+
        '<text x="0" y="0" text-anchor="middle" dy="6">'+no+'</text>'+
      '</g>');
    badgeG[p.id]=leadG.querySelector('[data-badge="'+p.id+'"]');
  });
  function easeIO(t){ return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  function specFor(id,m){
    if(id==="battery") return [["电芯类型",m.battery.type],["电压平台",m.battery.voltage],["容量",m.battery.capacity]];
    if(id==="motor")   return [["电机形式",m.motor.type],["额定功率",m.motor.rated],["峰值功率",m.motor.peak||"—"]];
    if(id==="brake")   return [["前制动",m.brake.front],["后制动",m.brake.rear],["电控辅助",m.brake.assist.join(" / ")]];
    if(id==="tire")    return [["规格","—（待补官方数据）"],["影响","滚阻 · 抓地 · 制动距离"]];
    if(id==="smart")   return [["功能项数",m.feat.length+" 项"],["包含",m.feat.slice(0,3).join(" / ")]];
    return [];
  }
  var lastActive=null;
  function showSpec(p,m){
    if(lastActive===p.id) return;
    lastActive=p.id;
    $('#hudStep').textContent=(PARTS.indexOf(p)+1)+" / "+PARTS.length;
    $$('#rail .railrow').forEach(function(r){
      var i=PARTS.map(function(x){return x.id}).indexOf(r.dataset.rail);
      r.classList.toggle("act",r.dataset.rail===p.id);
      r.classList.toggle("done",i<PARTS.indexOf(p));
    });
    specBox.innerHTML='<div class="fadein"><div class="sk">'+p.en+'</div><div class="sc">'+p.cn+'</div>'+
      specFor(p.id,m).map(function(r){
        return '<div class="specrow"><span class="k">'+r[0]+'</span><span class="v">'+r[1]+'</span></div>';
      }).join("")+'<div style="margin-top:8px"><span class="badge">示意值 · 非官方数据</span></div></div>';
  }

  var ecoFill=$('#ecoFill'), ecoTxt=$('#ecoTxt');
  var recovery={}   /* 能量回收粒子 */

  function setProgress(p,m){
    var actId=null;
    for(var i=0;i<PARTS.length;i++){ if(p>=PARTS[i].win[0]-0.03) actId=PARTS[i].id; }
    PARTS.forEach(function(pt){
      var e=0;
      if(RM){ e=1; }
      else { var t=(p-pt.win[0])/(pt.win[1]-pt.win[0]); e=easeIO(Math.max(0,Math.min(1,t))); }
      var g=stages["B"].querySelector('[data-part="'+pt.id+'"]');
      if(g) g.setAttribute("transform","translate("+(pt.dir[0]*e).toFixed(1)+","+(pt.dir[1]*e).toFixed(1)+")");
      var chip=badgeG[pt.id];
      var bo=BADGEOFF[pt.id]||[0,0];
      var bx=pt.center[0]+(pt.dir[0]+bo[0])*e, by=pt.center[1]+(pt.dir[1]+bo[1])*e;
      chip.setAttribute("transform","translate("+bx.toFixed(1)+","+by.toFixed(1)+")");
      chip.setAttribute("opacity", e>0.45?Math.min(1,(e-0.45)/0.25).toFixed(2):"0");
      chip.classList.toggle("bact", !RM && pt.id===actId);
      /* 短引线：从徽章边缘指向部件本体 */
      var pcx=pt.center[0]+pt.dir[0]*e, pcy=pt.center[1]+pt.dir[1]*e;
      var vx=pcx-bx, vy=pcy-by, vl=Math.max(1,Math.hypot(vx,vy));
      var tk=chip.querySelector('.tick');
      tk.setAttribute("x1",(bx+vx/vl*20).toFixed(1)); tk.setAttribute("y1",(by+vy/vl*20).toFixed(1));
      tk.setAttribute("x2",(bx+vx/vl*46).toFixed(1)); tk.setAttribute("y2",(by+vy/vl*46).toFixed(1));
    });
    if(actId){
      var ap=PARTS.filter(function(x){return x.id===actId})[0];
      if(ap && !RM) showSpec(ap,m);
      else if(RM) showSpec(ap,m);
    }
  }
  function resetExplode(){
    lastActive=null; lastP=-1; setProgress(0,modelById(S.id));
    $('#hudStep').textContent="0 / "+PARTS.length;
    PARTS.forEach(function(p){ badgeG[p.id].setAttribute('opacity','0'); badgeG[p.id].classList.remove('bact'); });
    $$('#rail .railrow').forEach(function(r){r.classList.remove('act','done')});
    specBox.innerHTML='<div class="sk">SCROLL</div><div class="sc">向下滚动开始拆解</div>'+
      '<div style="color:var(--mid);font-size:.84rem">电池 → 电机 → 制动 → 轮胎 → 智能系统，逐层浮出。</div>';
  }

  /* ============ 滚动绑定 ============ */
  var secE=$('#explode'), secR=$('#recover'), ticking=false;
  function onScroll(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var m=modelById(S.id);
      // 拆解
      var r=secE.getBoundingClientRect();
      var total=secE.offsetHeight-window.innerHeight;
      var p=total>0?Math.max(0,Math.min(1,-r.top/total)):0;
      if(Math.abs(p-lastP)>0.0008){ lastP=p; setProgress(p,m); }
      // 能量回收
      var r2=secR.getBoundingClientRect();
      var t2=secR.offsetHeight-window.innerHeight;
      var p2=t2>0?Math.max(0,Math.min(1,-r2.top/t2)):0;
      if(Math.abs(p2-lastP2)>0.002){ lastP2=p2; setEco(p2,m); }
    });
  }
  var lastP=-1,lastP2=-1;

  /* ============ 能量回收 ============ */
  var flowParts=[];
  (function initFlow(){
    var svg=stages["C"], g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('data-role','flow');
    var d="M896 500 C 800 452, 690 592, 560 546";
    g.innerHTML='<path data-role="flowpath" d="'+d+'" fill="none" stroke="rgba(255,107,0,.45)" '+
      'stroke-width="2" stroke-dasharray="7 8" opacity="0"/>';
    for(var i=0;i<11;i++){
      var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('r',(2.2+Math.random()*2.4).toFixed(1)); c.setAttribute('fill','#FF6B00');
      c.setAttribute('opacity','0'); g.appendChild(c);
    }
    svg.appendChild(g);
    var path=g.querySelector('[data-role="flowpath"]');
    flowParts={g:g, path:path, nodes:$$('circle',g), len:0, t:0};
    setTimeout(function(){ try{ flowParts.len=path.getTotalLength(); }catch(e){ flowParts.len=0; } },0);
  })();

  function setEco(p,m){
    var e=RM?1:easeIO(Math.max(0,Math.min(1,p*1.15)));
    root.style.setProperty('--v-eco',e.toFixed(3));
    ecoFill.style.width=(e*100).toFixed(1)+"%";
    ecoTxt.textContent=Math.round(e*100)+"%";
    flowParts.path.setAttribute('opacity',(e*0.9).toFixed(2));
    if(flowParts.len){
      flowParts.nodes.forEach(function(n,i){
        var t=((flowParts.t*(0.16+e*0.3))+(i/flowParts.nodes.length))%1;
        var pt=flowParts.path.getPointAtLength(t*flowParts.len);
        n.setAttribute('cx',pt.x.toFixed(1)); n.setAttribute('cy',pt.y.toFixed(1));
        n.setAttribute('opacity',(e*0.95).toFixed(2));
      });
    }
    var bar=stages["C"].querySelector('[data-role="cell"]');
    if(bar) bar.setAttribute('width',(40+260*e).toFixed(1));
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});

  /* ============ 开关 / 交互 ============ */
  $('#btnWheel').addEventListener('click',function(){
    S.wheel=!S.wheel; this.setAttribute('aria-pressed',String(S.wheel));
    body.classList.toggle('rolling',S.wheel);
  });
  $('#btnLight').addEventListener('click',function(){
    S.light=!S.light; this.setAttribute('aria-pressed',String(S.light));
    body.classList.toggle('lights',S.light);
  });
  $('#mdlbar').addEventListener('click',function(e){
    var b=e.target.closest('.pill'); if(!b) return;
    render(modelById(b.dataset.id));
    onScroll();
    window.scrollTo({top:0,behavior:RM?'auto':'smooth'});
  });

  /* ============ 启动 ============ */
  (function init(){
    // 车型切换条（同系列排在前面）
    var q=new URLSearchParams(location.search).get('id');
    var cur=modelById(q||"nova-c2");
    var ordered=MODELS.slice().sort(function(a,b){
      var A=a.series===cur.series?0:1, B=b.series===cur.series?0:1; return A-B;});
    $('#mdlbar').innerHTML=ordered.map(function(m){
      return '<button class="pill" data-id="'+m.id+'" aria-pressed="false">'+m.name+'</button>';}).join("");
    body.classList.add('lights');
    render(cur);
    // 数字滚动
    if(!RM){
      $$('.metric .v span, .hudfoot .big span').forEach(function(el){
        var to=+el.textContent||0; if(!to) return;
        var t0=performance.now(), D=1200;
        (function step(now){ var k=Math.min(1,(now-t0)/D), e2=1-Math.pow(1-k,3);
          el.textContent=Math.round(to*e2); if(k<1) requestAnimationFrame(step); })(t0);
      });
    }
    onScroll();
    // 能量回收粒子动画
    (function loop(){ if(!RM){ flowParts.t+=0.004; setEco(lastP2<0?0:lastP2,modelById(S.id)); } requestAnimationFrame(loop); })();
  })();
})();
