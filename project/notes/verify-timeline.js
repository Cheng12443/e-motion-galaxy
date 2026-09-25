
(function(){
  "use strict";
  /* ================= 里程碑（公开技术名词整理，非官方时间线） ================= */
  var MS=[
    {id:"voltage-core",era:"电流 1.0",year:null,layer:"三电系统",title:"三电自成一体",
     branch:"all",summary:"自研直驱轮毂电机 + 锂电池与 BMS 充放电管理 + FOC 矢量控制电控，把效率、平顺与能量回收交给同一套算法。",
     kw:["直驱轮毂电机","BMS","FOC 矢量控制"]},
    {id:"software-defined",era:"电流 2.0",year:null,layer:"智能系统",title:"软件定义硬件",
     branch:"city",summary:"RideyGo 把「钥匙」这个概念移除：感应解锁、离车自动落锁、App 远程控制；整车 OTA 让电控、电池、仪表的底层固件可以在线更新。",
     kw:["RideyGo","整车 OTA","数据闭环"]},
    {id:"active-safety",era:"电流 3.0",year:null,layer:"主动安全",title:"主动安全下放",
     branch:"night",summary:"TCS 牵引力控制在湿滑起步与过弯时抑制后轮打滑，ABS 防止紧急制动抱死，EABS 在刹车同时把动能回收进电池。",
     kw:["TCS","ABS","EABS 能量回收"]},
    {id:"range-engineering",era:"电流 3.5",year:null,layer:"电池与能量",title:"把续航当成工程问题",
     branch:"long",summary:"低温管理、循环寿命控制与能量回收策略共同决定「每一度电能跑多远」，而不是单看容量数字。",
     kw:["低温管理","循环寿命","能量回收策略"]},
    {id:"chassis-craft",era:"电流 4.0",year:null,layer:"底盘与制造",title:"车规级耐久",
     branch:"trail",summary:"碳素钢车架、前后碟刹、液压减震是基本盘；淋雨、振动、盐雾按车规级做耐久验证，才是较劲的地方。",
     kw:["碳素钢车架","液压减震","车规级验证"]},
    {id:"system-evolution",era:"电流 ∞",year:null,layer:"体系",title:"还在持续进化的系统",
     branch:"all",summary:"护城河不在某一项配置，而在三电自研、软件定义硬件、主动安全三层能力叠加之后的持续迭代。",
     kw:["三层能力","持续迭代"]}
  ];
  /* 分支：path = 控制点（桌面横向坐标），会把 (x,y) 交换得到移动端纵向轨迹 */
  var BRANCHES={
    city:{id:"city",name:"城市线",sub:"城市通勤的智能化",accent:"#C6FF00",
      title:"城市线 · 城市通勤的智能化",
      match:["all","city"],
      pts:[[70,430],[340,300],[660,392],[980,246],[1330,320]]},
    trail:{id:"trail",name:"越野线",sub:"底盘与车规级耐久",accent:"#FF6B00",
      title:"越野线 · 底盘与非铺装耐久",
      match:["all","trail"],
      pts:[[70,300],[300,500],[620,214],[940,486],[1330,250]]},
    long:{id:"long",name:"长途线",sub:"把续航当工程问题",accent:"#00E5FF",
      title:"长途线 · 电池与能量工程",
      match:["all","long"],
      pts:[[70,520],[380,452],[720,352],[1040,236],[1330,168]]}
  };
  var EGG_BRANCH={id:"infinity",name:"电流 ∞",sub:"隐藏路线 · 全节点",accent:"#FF6B00",
    title:"隐藏线 · 电流 ∞（全节点）",match:["all","city","night","long","trail"],
    pts:[[70,400],[260,180],[520,560],[780,140],[1060,540],[1330,260]]};

  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MQ=window.matchMedia('(max-width:900px)');
  var root=document.documentElement;

  /* ---------- 平滑路径：控制点 → 三次贝塞尔（Catmull-Rom 近似） ---------- */
  function smooth(pts,vertical){
    var p=pts.map(function(q){return vertical?[q[1],q[0]]:[q[0],q[1]]});
    var d="M"+p[0][0]+" "+p[0][1];
    for(var i=0;i<p.length-1;i++){
      var p0=p[i-1]||p[i], p1=p[i], p2=p[i+1], p3=p[i+2]||p2;
      var c1=[p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6];
      var c2=[p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6];
      d+=" C"+c1[0].toFixed(1)+" "+c1[1].toFixed(1)+" "+c2[0].toFixed(1)+" "+c2[1].toFixed(1)+" "+
         p2[0].toFixed(1)+" "+p2[1].toFixed(1);
    }
    return d;
  }

  /* ---------- 状态 ---------- */
  var S={branch:"city",egg:false,ev:false};
  var el={
    svg:$('#railsvg'), dim:$('#pDim'), wide:$('#pWide'), glow:$('#pGlow'), veh:$('#vehG'), vehIn:$('#vehInner'),
    grid:$('#grid'), flow:$('#flowG'), nodes:$('#nodesG'), layer:$('#nodeLayer'),
    pfill:$('#pfill'), pct:$('#pct'), nodeN:$('#nodeN'), title:$('#railTitle'), tip:$('#railtip'),
    mlist:$('#mlist'), branch:$('#branch'), egg:$('#egg'), sec:$('#rail-stage')
  };
  var pathDim=null, len=0, vertical=false, NF=0.76, F0=0.12;   /* 节点落在光轨 12%~88% 区间 */
  function fracOf(i,n){ return F0 + (n>1? i/(n-1):0.5)*NF; }

  function milestones(){
    var b=cur(), list=MS.filter(function(m){ return b.match.indexOf(m.branch)>=0; });
    return list;
  }
  function cur(){ return S.egg?EGG_BRANCH:BRANCHES[S.branch]; }

  /* ---------- 渲染 ---------- */
  function renderBranchBtns(){
    var html=Object.keys(BRANCHES).map(function(k){
      var b=BRANCHES[k];
      return '<button data-b="'+k+'" aria-pressed="'+(k===S.branch&&!S.egg)+'">'+
        '<span class="n">'+b.name+'</span>'+b.sub+'</button>';
    }).join("");
    if(S.egg) html+='<button data-b="infinity" aria-pressed="true" style="border-color:#FF6B00;color:#FF6B00">'+
      '<span class="n">电流 ∞</span>隐藏路线 · 已解锁</button>';
    el.branch.innerHTML=html;
  }
  function renderRail(){
    var b=cur();
    root.style.setProperty('--accent',b.accent);
    el.title.textContent=b.title;
    el.svg.setAttribute('viewBox', vertical? "0 0 760 1400" : "0 0 1400 760");
    var d=smooth(b.pts,vertical);
    el.dim.setAttribute('d',d); el.glow.setAttribute('d',d); el.wide.setAttribute('d',d);
    pathDim=el.dim;
    try{ len=pathDim.getTotalLength(); }catch(e){ len=0; }
    el.glow.setAttribute('stroke-dasharray',len);
    /* 网格 */
    var g="",W=vertical?760:1400,H=vertical?1400:760;
    for(var x=60;x<W;x+=90) g+='<line x1="'+x+'" y1="0" x2="'+x+'" y2="'+H+'" stroke="rgba(255,255,255,.045)"/>';
    for(var y=60;y<H;y+=90) g+='<line x1="0" y1="'+y+'" x2="'+W+'" y2="'+y+'" stroke="rgba(255,255,255,.045)"/>';
    el.grid.innerHTML=g;
    /* 里程碑节点（位置用 getPointAtLength 取，保证落在光轨上） */
    var ms=milestones(), dots="";
    el.layer.innerHTML="";
    ms.forEach(function(m,i){
      var f=fracOf(i,ms.length);
      var pt=pathDim.getPointAtLength(len*f);
      dots+='<g data-dot="'+m.id+'" opacity="0">'+
        '<circle cx="'+pt.x.toFixed(1)+'" cy="'+pt.y.toFixed(1)+'" r="9" fill="#0A0D11" stroke="rgba(255,255,255,.4)" stroke-width="2.5"/>'+
        '<circle cx="'+pt.x.toFixed(1)+'" cy="'+pt.y.toFixed(1)+'" r="3.4" fill="'+b.accent+'"/>'+
        '<text x="'+pt.x.toFixed(1)+'" y="'+(pt.y-20).toFixed(1)+'" text-anchor="middle" font-size="13" '+
        'font-family="ui-monospace,monospace" fill="rgba(255,255,255,.5)">0'+(i+1)+'</text></g>';
      var nd=document.createElement('div');
      nd.className="node"; nd.dataset.node=m.id;
      if(!MQ.matches){
        var W2=1400,H2=760;
        nd.style.left=(pt.x/W2*100).toFixed(2)+"%";
        nd.style.top=(pt.y/H2*100).toFixed(2)+"%";
        nd.style.transform = (i%2===0) ? "translate(-50%,-116%)" : "translate(-50%,18%)";
      }
      nd.innerHTML='<div class="box"><div class="yr">'+m.era+' · '+(m.year||"20XX · 待核")+
        '</div><div class="nm">'+m.title+'</div><div class="tp">'+m.layer+'</div></div>';
      el.layer.appendChild(nd);
    });
    el.nodes.innerHTML=dots;
    /* 全表 */
    el.mlist.innerHTML=ms.map(function(m){
      return '<article class="mcard"><div class="er">'+m.era+' · '+(m.year||"20XX · 待核")+'</div>'+
        '<h3>'+m.title+'</h3><p>'+m.summary+'</p><div class="kw">'+
        m.kw.map(function(k){return '<span>'+k+'</span>'}).join("")+'</div>'+
        '<p style="margin-top:10px"><span class="badge">'+m.layer+'</span></p></article>';
    }).join("");
    renderBranchBtns();
  }

  /* ---------- 电流流动（光轨上跑的光点） ---------- */
  var flowDots=[];
  (function initFlow(){
    for(var i=0;i<7;i++){
      var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('r','3.6'); c.setAttribute('fill','rgba(255,255,255,.75)');
      el.flow.appendChild(c); flowDots.push(c);
    }
  })();

  /* ---------- 滚动 ---------- */
  var lastP=-1, ticking=false;
  function onScroll(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var r=el.sec.getBoundingClientRect();
      var total=el.sec.offsetHeight-window.innerHeight;
      var p=total>0?Math.max(0,Math.min(1,-r.top/total)):0;
      if(Math.abs(p-lastP)<0.0006) return;
      lastP=p; paint(p);
    });
  }
  function paint(p){
    var b=cur(), ms=milestones();
    /* 光轨进度 */
    el.glow.setAttribute('stroke-dashoffset', (len*(1-p)).toFixed(1));
    el.pfill.style.width=(p*100).toFixed(1)+"%";
    el.pct.textContent=Math.round(p*100)+"%";
    /* 车辆：位置贴光轨，朝向取切线 */
    var pt=pathDim.getPointAtLength(len*p);
    var pt2=pathDim.getPointAtLength(Math.min(len,len*p+6));
    var ang=Math.atan2(pt2.y-pt.y, pt2.x-pt.x)*180/Math.PI;
    if(!isFinite(ang)) ang=0;
    el.veh.setAttribute('transform','translate('+pt.x.toFixed(1)+','+pt.y.toFixed(1)+')');
    el.vehIn.setAttribute('transform','rotate('+ang.toFixed(1)+')');
    /* 电流 */
    flowDots.forEach(function(c,i){
      var t=((performance.now()/4200*(0.4+p*0.9))+i/flowDots.length)%1;
      var q=pathDim.getPointAtLength(len*t);
      c.setAttribute('cx',q.x.toFixed(1)); c.setAttribute('cy',q.y.toFixed(1));
      c.setAttribute('opacity',(0.18+p*0.5).toFixed(2));
    });
    /* 节点：走过即点亮，且保留；当前所在的那个高亮 */
    var actIdx=-1;
    ms.forEach(function(m,i){
      var reached = p >= fracOf(i,ms.length)-0.02;
      if(reached) actIdx=i;
      var g=el.nodes.querySelector('[data-dot="'+m.id+'"]');
      if(g) g.setAttribute('opacity',reached?'1':'0');
      var nd=el.layer.querySelector('[data-node="'+m.id+'"]');
      if(nd){ nd.classList.toggle("on",reached); }
    });
    ms.forEach(function(m,i){
      var nd=el.layer.querySelector('[data-node="'+m.id+'"]');
      if(nd) nd.classList.toggle("act", i===actIdx);
    });
    el.nodeN.textContent=(actIdx<0?0:actIdx+1)+" / "+ms.length;
    el.tip.textContent = actIdx<0 ? "↓ 向下滚动，让电流走完这条线"
      : ("正在经过 · "+ms[actIdx].title);
  }

  /* ---------- 分支切换 ---------- */
  el.branch.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    S.branch=b.dataset.b;
    if(S.branch==="infinity"){ S.egg=true; } else { S.egg=false; }
    try{ localStorage.setItem('emg.branch',S.branch); }catch(e2){}
    renderRail(); lastP=-1; onScroll();
    root.style.setProperty('--accent',cur().accent);
  });

  /* ---------- Konami 彩蛋 ---------- */
  var seq=[],KONAMI=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  function eggToast(){
    el.egg.innerHTML='<div class="e1">电流 ∞ · 隐藏路线已解锁</div>'+
      '<div class="e2">KONAMI CODE ACCEPTED · 全 6 个技术节点已展开</div>';
    el.egg.classList.add('on'); el.egg.setAttribute('aria-hidden','false');
    setTimeout(function(){el.egg.classList.remove('on');el.egg.setAttribute('aria-hidden','true')},5200);
  }
  document.addEventListener('keydown',function(e){
    var k=e.key.length===1?e.key.toLowerCase():e.key;
    seq.push(k); if(seq.length>KONAMI.length) seq.shift();
    if(seq.join(",")===KONAMI.join(",")){
      seq=[];
      if(!S.egg){ S.egg=true; S.branch="infinity"; renderRail(); lastP=-1; onScroll(); eggToast();
        try{ localStorage.setItem('emg.branch',"infinity"); }catch(e2){} }
      else eggToast();
    }
  });
  $('#btnHint').addEventListener('click',function(){
    el.egg.innerHTML='<div class="e1">↑↑↓↓←→←→BA</div><div class="e2">在键盘上敲出来，看看会发生什么</div>';
    el.egg.classList.add('on'); el.egg.setAttribute('aria-hidden','false');
    setTimeout(function(){el.egg.classList.remove('on');el.egg.setAttribute('aria-hidden','true')},4200);
  });

  /* ---------- 启动 ---------- */
  function relayout(){ vertical=MQ.matches; renderRail(); lastP=-1; onScroll(); }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){ if(MQ.matches!==vertical) relayout(); else { lastP=-1; onScroll(); } });
  (function init(){
    try{ var sb=localStorage.getItem('emg.branch'); if(sb && (BRANCHES[sb]||sb==="infinity")){ S.branch=sb; if(sb==="infinity")S.egg=true; } }catch(e){}
    vertical=MQ.matches;
    renderRail(); onScroll();
    if(!RM){(function loop(){ paint(lastP<0?0:lastP); requestAnimationFrame(loop); })();}
    else paint(1);
  })();
})();
