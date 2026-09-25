
(function(){
  "use strict";
  /* ================= 数据（占位示例，可替换为官方数据） ================= */
  var MODELS=[
    {id:"nova-c1",name:"NOVA C1",sub:"轻量入门通勤",base:3199,
     colors:[["雾白","#EDEDED"],["荧光绿","#C6FF00"],["石墨黑","#1A1A1A"]]},
    {id:"nova-c2",name:"NOVA C2",sub:"城市穿梭进阶",base:4299,
     colors:[["荧光绿","#C6FF00"],["电光蓝","#00E5FF"],["沙岩灰","#8A8A82"]]},
    {id:"volt-p1",name:"VOLT P1",sub:"性能电摩入门",base:6999,
     colors:[["电光蓝","#00E5FF"],["石墨黑","#1A1A1A"],["能量橙","#FF6B00"]]},
    {id:"volt-p2",name:"VOLT P2",sub:"性能旗舰",base:12999,
     colors:[["能量橙","#FF6B00"],["石墨黑","#1A1A1A"],["荧光绿","#C6FF00"]]},
    {id:"terra-x1",name:"TERRA X1",sub:"城郊探索",base:5299,
     colors:[["旷野橄榄","#6B7A4A"],["石墨黑","#1A1A1A"],["能量橙","#FF6B00"]]},
    {id:"terra-x2",name:"TERRA X2",sub:"全地形进阶",base:7999,
     colors:[["能量橙","#FF6B00"],["旷野橄榄","#6B7A4A"],["深青","#00555E"]]}
  ];
  var WHEELS=[{id:"spoke",n:"辐条轮",p:0},{id:"star",n:"星芒轮",p:199},{id:"hub",n:"一体轮",p:359}];
  var ACCS=[{id:"box",n:"后尾箱",p:399},{id:"basket",n:"前篮",p:199},{id:"mount",n:"手机支架",p:129},
            {id:"seat",n:"加长坐垫",p:299},{id:"mirror",n:"后视镜",p:159}];
  var DECALS=[{id:"none",n:"无贴花",p:0},{id:"volt",n:"电流条纹",p:199},{id:"num",n:"编号涂装",p:259}];

  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId=function(id){for(var i=0;i<MODELS.length;i++) if(MODELS[i].id===id) return MODELS[i]; return MODELS[0]};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};

  /* ================= 车体几何（SVG 与 Canvas 共用同一套路径字符串） ================= */
  var GEO={
    deck:"M318 498 L706 498 L744 536 L342 540 Z",
    cowl:"M242 394 L436 370 L504 442 L446 494 L302 502 L234 454 Z",
    shield:"M700 498 L776 484 L842 264 L768 282 Z",
    seat:"M256 382 L302 320 L464 304 L510 346 L494 382 Z",
    seatLong:"M232 384 L292 318 L500 302 L544 348 L528 384 Z",
    light:"M836 296 L904 284 L914 344 L848 350 Z",
    tail:"M232 398 h20 v48 h-20 z",
    fenderF:"M796 424 A104 104 0 0 1 996 424"
  };

  /* ================= 状态 ================= */
  var S={model:"nova-c2",ci:0,wheel:"spoke",decal:"none",acc:{},price:0};
  function accList(){ return ACCS.filter(function(a){return S.acc[a.id]}); }
  function calcPrice(){
    var m=byId(S.model);
    var p=m.base;
    WHEELS.forEach(function(w){if(w.id===S.wheel)p+=w.p});
    DECALS.forEach(function(d){if(d.id===S.decal)p+=d.p});
    accList().forEach(function(a){p+=a.p});
    return p;
  }

  /* ================= 生成 SVG（literal 颜色，便于直接塞进 <img> 画到 canvas） ================= */
  function spokes(cx,cy,style){
    if(style==="hub"){
      return '<circle cx="'+cx+'" cy="'+cy+'" r="52" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="2"/>'+
             '<circle cx="'+cx+'" cy="'+cy+'" r="86" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>';
    }
    var out='<circle cx="'+cx+'" cy="'+cy+'" r="60" fill="none" stroke="rgba(198,255,0,.55)" stroke-width="2.5"/>';
    var n=style==="star"?5:6, r0=style==="star"?26:40, r1=86;
    for(var i=0;i<n;i++){
      var a=i/n*Math.PI*2;
      out+='<line x1="'+(cx+Math.sin(a)*r0).toFixed(1)+'" y1="'+(cy-Math.cos(a)*r0).toFixed(1)+
           '" x2="'+(cx+Math.sin(a)*r1).toFixed(1)+'" y2="'+(cy-Math.cos(a)*r1).toFixed(1)+
           '" stroke="rgba(255,255,255,.28)" stroke-width="'+(style==="star"?4:3)+'" stroke-linecap="round"/>';
    }
    return out;
  }
  function wheel(cx,cy,style){
    return '<circle cx="'+cx+'" cy="'+cy+'" r="104" fill="#080A0D" stroke="rgba(255,255,255,.16)" stroke-width="3"/>'+
           '<circle cx="'+cx+'" cy="'+cy+'" r="88" fill="none" stroke="rgba(255,255,255,.20)" stroke-width="2"/>'+
           '<g class="spin">'+spokes(cx,cy,style)+'</g>'+
           (style==="hub"?'':'<circle cx="'+cx+'" cy="'+cy+'" r="9" fill="#C6FF00"/>');
  }
  function accShapes(){
    var o="";
    if(S.acc.box) o+='<g><rect x="196" y="300" width="128" height="96" rx="14" fill="#12161A" stroke="rgba(255,255,255,.3)" stroke-width="3"/>'+
      '<path d="M214 330 H306" stroke="rgba(198,255,0,.65)" stroke-width="3"/></g>';
    if(S.acc.basket) o+='<g><path d="M812 400 L902 400 L890 462 L824 462 Z" fill="#12161A" stroke="rgba(255,255,255,.3)" stroke-width="3"/>'+
      '<path d="M824 420 H890 M820 440 H894" stroke="rgba(255,255,255,.2)" stroke-width="2"/></g>';
    if(S.acc.mount) o+='<g><path d="M880 300 L880 262" stroke="rgba(255,255,255,.5)" stroke-width="5" stroke-linecap="round"/>'+
      '<rect x="862" y="222" width="40" height="46" rx="7" fill="#0B0F14" stroke="rgba(0,229,255,.6)" stroke-width="2.5"/>'+
      '<path d="M870 240 H894" stroke="#00E5FF" stroke-width="2"/></g>';
    if(S.acc.mirror) o+='<g><path d="M920 246 L960 208" stroke="rgba(255,255,255,.45)" stroke-width="4" stroke-linecap="round"/>'+
      '<ellipse cx="968" cy="200" rx="20" ry="13" fill="#0B0F14" stroke="rgba(255,255,255,.4)" stroke-width="2.5"/></g>';
    return o;
  }
  function decalShapes(){
    if(S.decal==="volt") return '<g><path d="M254 402 L470 380" stroke="#C6FF00" stroke-width="9" stroke-linecap="round" opacity=".85"/>'+
      '<path d="M330 512 L700 512" stroke="#C6FF00" stroke-width="6" stroke-linecap="round" opacity=".6"/>'+
      '<path d="M712 486 L838 274" stroke="#C6FF00" stroke-width="5" stroke-linecap="round" opacity=".5"/></g>';
    if(S.decal==="num") return '<g><text x="792" y="404" font-size="86" font-family="sans-serif" font-weight="700" '+
      'fill="none" stroke="#C6FF00" stroke-width="2.5" opacity=".9" transform="rotate(-4 792 380)">09</text></g>';
    return "";
  }
  function buildSVG(){
    var m=byId(S.model), col=m.colors[S.ci][1];
    var seat=S.acc.seat?GEO.seatLong:GEO.seat;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -40 1360 900">'+
      '<defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0" stop-color="'+col+'" stop-opacity=".92"/><stop offset=".55" stop-color="'+col+'" stop-opacity=".38"/>'+
        '<stop offset="1" stop-color="#0A0D11"/></linearGradient>'+
      '<radialGradient id="gs" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(0,0,0,.85)"/>'+
        '<stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>'+
      '<linearGradient id="gBm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(198,255,0,.5)"/>'+
        '<stop offset="1" stop-color="rgba(198,255,0,0)"/></linearGradient></defs>'+
      '<line x1="-80" y1="620" x2="1280" y2="620" stroke="rgba(255,255,255,.10)" stroke-dasharray="6 10"/>'+
      '<ellipse cx="580" cy="624" rx="440" ry="20" fill="url(#gs)"/>'+
      '<path d="M906 300 L1250 244 L1250 378 L910 352 Z" fill="url(#gBm)" opacity=".8"/>'+
      /* 轮子 */
      wheel(272,500,S.wheel)+wheel(896,500,S.wheel)+
      /* 车体 */
      '<path d="'+GEO.deck+'" fill="url(#gb)" stroke="rgba(255,255,255,.26)" stroke-width="3" stroke-linejoin="round"/>'+
      '<path d="'+GEO.cowl+'" fill="url(#gb)" stroke="rgba(255,255,255,.28)" stroke-width="3" stroke-linejoin="round"/>'+
      '<path d="'+GEO.shield+'" fill="url(#gb)" stroke="rgba(255,255,255,.28)" stroke-width="3" stroke-linejoin="round"/>'+
      '<path d="'+seat+'" fill="#12161A" stroke="rgba(255,255,255,.28)" stroke-width="3" stroke-linejoin="round"/>'+
      '<path d="M302 320 L464 304" stroke="rgba(198,255,0,.7)" stroke-width="3" stroke-linecap="round"/>'+
      '<path d="M844 282 L936 256" stroke="rgba(255,255,255,.5)" stroke-width="9" stroke-linecap="round"/>'+
      '<circle cx="942" cy="254" r="8" fill="#C6FF00"/>'+
      '<rect x="232" y="398" width="20" height="48" rx="8" fill="#FF6B00" opacity=".8"/>'+
      '<path d="M428 496 L398 552" stroke="#FF6B00" stroke-width="7" stroke-linecap="round" opacity=".8"/>'+
      '<path d="'+GEO.fenderF+'" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="7"/>'+
      '<rect x="794" y="234" width="70" height="44" rx="9" fill="#0B0F14" stroke="rgba(255,255,255,.34)" stroke-width="3"/>'+
      '<path d="M806 256 H852" stroke="#C6FF00" stroke-width="3"/>'+
      '<path d="'+GEO.light+'" fill="#0E1216" stroke="rgba(255,255,255,.3)" stroke-width="3"/>'+
      '<path d="M848 306 L894 296 L900 330 L854 336 Z" fill="#C6FF00" opacity=".5"/>'+
      decalShapes()+accShapes()+
      '</svg>';
  }

  /* ================= 预览 ================= */
  function drawPreview(){
    var m=byId(S.model);
    $('#stage').innerHTML=buildSVG();
    $('#tag').textContent=m.name+" · "+m.sub+" · 实时预览";
  }

  /* ================= 控件 ================= */
  function drawControls(){
    var m=byId(S.model);
    $('#modelOpts').innerHTML=MODELS.map(function(x){
      return '<button class="opt" data-m="'+x.id+'" aria-pressed="'+(x.id===S.model)+'">'+x.name+'</button>'}).join("");
    $('#colorOpts').innerHTML=m.colors.map(function(c,i){
      return '<button class="swbtn" data-c="'+i+'" aria-pressed="'+(i===S.ci)+'" title="'+c[0]+'" '+
        'aria-label="配色 '+c[0]+'" style="background:'+c[1]+'"></button>'}).join("");
    $('#colorName').textContent=m.colors[S.ci][0];
    $('#wheelOpts').innerHTML=WHEELS.map(function(w){
      return '<button class="opt" data-w="'+w.id+'" aria-pressed="'+(w.id===S.wheel)+'">'+w.n+
        (w.p?' <span style="opacity:.6">+'+w.p+'</span>':'')+'</button>'}).join("");
    $('#accOpts').innerHTML=ACCS.map(function(a){
      return '<button class="opt" data-a="'+a.id+'" aria-pressed="'+!!S.acc[a.id]+'">'+a.n+
        ' <span style="opacity:.6">+'+a.p+'</span></button>'}).join("");
    $('#decalOpts').innerHTML=DECALS.map(function(d){
      return '<button class="opt" data-d="'+d.id+'" aria-pressed="'+(d.id===S.decal)+'">'+d.n+
        (d.p?' <span style="opacity:.6">+'+d.p+'</span>':'')+'</button>'}).join("");
    var n=accList().length;
    $('#accSum').textContent=n?("已选 "+n+" 件"):"未选";
  }
  var rafP=null;
  function rollPrice(){
    var to=calcPrice(), from=S.price, t0=performance.now(), D=RM?0:520;
    if(!D){ S.price=to; $('#price').textContent="¥"+to; return; }
    cancelAnimationFrame(rafP);
    (function step(now){
      var k=Math.min(1,(now-t0)/D), e=1-Math.pow(1-k,3);
      var v=Math.round(from+(to-from)*e);
      $('#price').textContent="¥"+v;
      if(k<1) rafP=requestAnimationFrame(step); else S.price=to;
    })(t0);
  }

  /* ================= 配置卡片（Canvas） ================= */
  var card=$('#card'), cx=card.getContext('2d');
  function wrapText(ctx,text,x,y,maxW,lh){
    var line="",lines=[],i;
    for(i=0;i<text.length;i++){
      var t=line+text[i];
      if(ctx.measureText(t).width>maxW && line){ lines.push(line); line=text[i]; }
      else line=t;
    }
    if(line) lines.push(line);
    lines.forEach(function(l,k){ ctx.fillText(l,x,y+k*lh); });
    return lines.length;
  }
  function drawCard(){
    var m=byId(S.model), col=m.colors[S.ci][1], W=1080,H=1440;
    var g=cx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'#080B0F'); g.addColorStop(.55,'#050505'); g.addColorStop(1,'#0A0F12');
    cx.fillStyle=g; cx.fillRect(0,0,W,H);
    /* 网格 */
    cx.strokeStyle='rgba(255,255,255,.05)'; cx.lineWidth=1;
    for(var x=0;x<=W;x+=90){cx.beginPath();cx.moveTo(x+.5,0);cx.lineTo(x+.5,H);cx.stroke();}
    for(var y=0;y<=H;y+=90){cx.beginPath();cx.moveTo(0,y+.5);cx.lineTo(W,y+.5);cx.stroke();}
    /* 顶部光晕 */
    var rg=cx.createRadialGradient(W*0.72,H*0.2,40,W*0.72,H*0.2,720);
    rg.addColorStop(0,col+'26'); rg.addColorStop(1,'rgba(0,0,0,0)');
    cx.fillStyle=rg; cx.fillRect(0,0,W,H);
    /* 页眉 */
    cx.fillStyle='#C6FF00'; cx.font='500 22px "Space Grotesk","Noto Sans SC",sans-serif';
    cx.letterSpacing && (cx.letterSpacing='6px');
    cx.fillText('E-MOTION GALAXY', 70, 96);
    cx.letterSpacing && (cx.letterSpacing='0px');
    cx.strokeStyle='rgba(255,255,255,.12)'; cx.beginPath(); cx.moveTo(70,120); cx.lineTo(1010,120); cx.stroke();
    cx.fillStyle='#98A2AE'; cx.font='400 20px "Noto Sans SC",sans-serif';
    cx.fillText('我的配置卡片 · CONFIG CARD', 70, 158);
    /* 车（把同一份 SVG 画进来） */
    var img=new Image();
    var svgStr=buildSVG().replace('<svg ','<svg width="1080" height="715" ');
    img.onload=function(){
      cx.drawImage(img, 0, 190, 1080, 715);
      finish();
    };
    img.onerror=function(){ finish(); };
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgStr);
  }
  function finish(){
    var m=byId(S.model), col=m.colors[S.ci][1];
    var y=985;
    cx.fillStyle='#F2F5F7'; cx.font='700 64px "Space Grotesk","Noto Sans SC",sans-serif';
    cx.fillText(m.name, 70, y);
    cx.fillStyle='rgba(255,255,255,.28)'; cx.font='400 26px "Noto Sans SC",sans-serif';
    cx.fillText(m.sub, 70, y+40);
    /* 配置行 */
    var rows=[['配色',m.colors[S.ci][0]],
              ['轮毂',(WHEELS.filter(function(w){return w.id===S.wheel})[0]||{}).n],
              ['贴花',(DECALS.filter(function(d){return d.id===S.decal})[0]||{}).n],
              ['配件',accList().length?accList().map(function(a){return a.n}).join(' · '):'未选']];
    var yy=y+100;
    rows.forEach(function(r){
      cx.fillStyle='#5A636E'; cx.font='400 22px "Noto Sans SC",sans-serif';
      cx.fillText(r[0], 70, yy);
      cx.fillStyle='#F2F5F7'; cx.font='500 26px "Noto Sans SC",sans-serif';
      cx.fillText(r[1], 170, yy);
      cx.strokeStyle='rgba(255,255,255,.08)'; cx.beginPath(); cx.moveTo(70,yy+22); cx.lineTo(1010,yy+22); cx.stroke();
      yy+=62;
    });
    /* 骑行人格 */
    try{
      var p=JSON.parse(localStorage.getItem('emg.persona')||'null');
      if(p){
        cx.fillStyle=col; cx.font='500 24px "Space Grotesk","Noto Sans SC",sans-serif';
        cx.fillText('骑行人格 · '+p.label, 70, yy+16);
        yy+=48;
      }
    }catch(e){}
    /* 价格 */
    cx.fillStyle='#5A636E'; cx.font='400 20px "Noto Sans SC",sans-serif';
    cx.fillText('示意加装价 · PLACEHOLDER', 70, 1252);
    cx.fillStyle=col; cx.font='700 76px "Space Grotesk","Noto Sans SC",sans-serif';
    cx.fillText('¥'+calcPrice(), 70, 1320);
    cx.fillStyle='#5A636E'; cx.font='400 18px "Noto Sans SC",sans-serif';
    cx.fillText('不含官方售价；全部数据为占位示例，可替换为官方数据', 70, 1352);
    /* 页脚 */
    cx.strokeStyle='rgba(255,255,255,.12)'; cx.beginPath(); cx.moveTo(70,1382); cx.lineTo(1010,1382); cx.stroke();
    cx.fillStyle='#98A2AE'; cx.font='400 19px "Noto Sans SC",sans-serif';
    cx.fillText('非官方粉丝网站，仅用于学习与展示。', 70, 1412);
    cx.fillStyle='#5A636E'; cx.font='400 17px "Noto Sans SC",sans-serif';
    cx.fillText('辅助工具：DeepSeek · 创作者：苏好好 · 3348304834@qq.com', 550, 1412);
    /* 角标 */
    cx.fillStyle=col; cx.fillRect(W-24, 0, 8, 120);
    cx.fillRect(0, H-8, 160, 8);
  }

  /* ================= 事件 ================= */
  function refresh(roll){
    drawPreview(); drawControls(); drawCard();
    if(roll!==false) rollPrice();
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    if(b.dataset.m){ S.model=b.dataset.m; S.ci=0; refresh(); }
    else if(b.dataset.c!==undefined && b.classList.contains('swbtn')){ S.ci=+b.dataset.c; refresh(false); }
    else if(b.dataset.w){ S.wheel=b.dataset.w; refresh(); }
    else if(b.dataset.a){ S.acc[b.dataset.a]=!S.acc[b.dataset.a]; refresh(); }
    else if(b.dataset.d){ S.decal=b.dataset.d; refresh(); }
  });
  $('#btnReset').addEventListener('click',function(){
    S={model:"nova-c2",ci:0,wheel:"spoke",decal:"none",acc:{},price:0}; refresh();
  });
  $('#btnRandom').addEventListener('click',function(){
    var m=MODELS[Math.floor(Math.random()*MODELS.length)];
    S.model=m.id; S.ci=Math.floor(Math.random()*m.colors.length);
    S.wheel=WHEELS[Math.floor(Math.random()*WHEELS.length)].id;
    S.decal=DECALS[Math.floor(Math.random()*DECALS.length)].id;
    S.acc={}; ACCS.forEach(function(a){ if(Math.random()<0.35) S.acc[a.id]=true; });
    refresh();
  });
  function dataURL(){ return card.toDataURL('image/png'); }
  function fileName(){
    var m=byId(S.model);
    return "我的九号配置_"+m.name+"_"+m.colors[S.ci][0]+".png";
  }
  $('#btnDownload').addEventListener('click',function(e){
    e.preventDefault();
    var a=document.createElement('a');
    a.href=dataURL(); a.download=fileName(); document.body.appendChild(a); a.click(); a.remove();
  });
  /* 预览图/下载链接保持最新 */
  setInterval(function(){
    var a=$('#btnDownload'); a.href=dataURL(); a.download=fileName();
  }, 2500);

  (function init(){
    var q=new URLSearchParams(location.search).get('id');
    if(q) S.model=byId(q).id;
    refresh();
    $('#btnDownload').href=dataURL(); $('#btnDownload').download=fileName();
    $('#btnOpen').addEventListener('click',function(){
      var w=window.open('','_blank');
      if(w) w.document.write('<title>我的九号配置卡片</title><body style="margin:0;background:#050505;display:grid;place-items:center;min-height:100vh"><img src="'+dataURL()+'" style="max-width:100%;height:auto"></body>');
    });
  })();
})();
