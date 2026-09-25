
(function(){
  "use strict";
  /* ================= 数据（占位示例，可替换为官方数据） ================= */
  var MODELS=[
    {id:"nova-c1",series:"city-flow",name:"NOVA C1",sub:"轻量入门通勤",range:60,speed:25,
     battery:{voltage:"48V",capacity:"20Ah"},assist:["EABS"],
     feat:["RideyGo 感应解锁","离车自动落锁","App 远程控制","整车 OTA","定位防盗","能量回收"],
     brake:{front:"鼓刹",rear:"鼓刹"},scenes:["通勤","城市"]},
    {id:"nova-c2",series:"city-flow",name:"NOVA C2",sub:"城市穿梭进阶",range:95,speed:45,
     battery:{voltage:"60V",capacity:"26Ah"},assist:["EABS","TCS"],
     feat:["RideyGo 感应解锁","离车自动落锁","App 远程控制","整车 OTA","定速巡航","定位防盗","能量回收","胎压提示"],
     brake:{front:"碟刹",rear:"碟刹"},scenes:["通勤","城市","夜骑"]},
    {id:"volt-p1",series:"voltage-pro",name:"VOLT P1",sub:"性能电摩入门",range:110,speed:80,
     battery:{voltage:"72V",capacity:"32Ah"},assist:["EABS","TCS"],
     feat:["RideyGo 感应解锁","整车 OTA","FOC 矢量控制","App 远程控制","定速巡航","定位防盗","能量回收","骑行数据回传"],
     brake:{front:"液压碟刹",rear:"液压碟刹"},scenes:["城市","夜骑","长途"]},
    {id:"volt-p2",series:"voltage-pro",name:"VOLT P2",sub:"性能旗舰",range:160,speed:120,
     battery:{voltage:"高压平台",capacity:"—"},assist:["EABS","TCS","ABS"],
     feat:["RideyGo 感应解锁","整车 OTA","FOC 矢量控制","TCS 牵引力控制","ABS 防抱死","App 远程控制","定位防盗","能量回收","骑行数据回传"],
     brake:{front:"液压碟刹 + ABS",rear:"液压碟刹"},scenes:["夜骑","长途","城市"]},
    {id:"terra-x1",series:"terra-x",name:"TERRA X1",sub:"城郊探索",range:70,speed:25,
     battery:{voltage:"48V",capacity:"24Ah"},assist:["EABS"],
     feat:["RideyGo 感应解锁","整车 OTA","App 远程控制","定位防盗","能量回收"],
     brake:{front:"碟刹",rear:"碟刹"},scenes:["越野","城市"]},
    {id:"terra-x2",series:"terra-x",name:"TERRA X2",sub:"全地形进阶",range:110,speed:60,
     battery:{voltage:"60V",capacity:"32Ah"},assist:["EABS","TCS"],
     feat:["RideyGo 感应解锁","整车 OTA","FOC 矢量控制","TCS 牵引力控制","App 远程控制","定位防盗","能量回收","胎压提示"],
     brake:{front:"液压碟刹",rear:"液压碟刹"},scenes:["越野","长途","夜骑"]}
  ];
  var BRANCH={
    agent:{id:"commuter-ace",label:"通勤秩序者",code:"ORDERLY COMMUTER",color:"#C6FF00",
      tags:["平稳","省心","零摩擦"],
      desc:"你追求的是「到达时不狼狈」。路线固定、节奏稳定，最在意解锁快、起步顺、别出意外。",
      rules:{distance:"short|mid",road:"smooth|rough",style:"calm|agile",priority:"smart|range"},
      series:"城市流动系列",models:["nova-c2","nova-c1"],
      reason:"轻量化车身 + 感应解锁与能量回收，最适合高频短途、走走停停的城市节奏。"},
    night:{id:"night-rider",label:"夜行视觉系",code:"NIGHT RIDER",color:"#00E5FF",
      tags:["夜骑","氛围","姿态"],
      desc:"你的骑行有一半是为了那段路的光。夜间视野、灯光语言、整车姿态，比参数表更能说服你。",
      rules:{road:"smooth|rough",style:"agile|fast",priority:"style|safety"},
      series:"高压性能系列",models:["volt-p1","nova-c2"],
      reason:"灯光与仪表语言更完整、底盘更稳，夜间中速巡航的信心主要来自制动与牵引力控制。"},
    range:{id:"range-marathon",label:"长途耐力派",code:"RANGE MARATHON",color:"#FF6B00",
      tags:["续航","效率","数据"],
      desc:"你把电量当成里程焦虑的解药。单次充电能推多远、能量回收能省多少，是你真正关心的数字。",
      rules:{distance:"long",style:"calm|fast",priority:"range|smart"},
      series:"高压性能系列",models:["volt-p2","volt-p1"],
      reason:"大容量锂电 + BMS 管理与 EABS 能量回收，是长途场景里更不容易「掉电」的组合。"},
    trail:{id:"trail-seeker",label:"探索野趣派",code:"TRAIL SEEKER",color:"#FF6B00",
      tags:["非铺装","低扭","抓地"],
      desc:"铺装路的尽头才是你的起点。你接受颠簸，但要求抓地、低扭和悬挂行程给得起回应。",
      rules:{road:"offroad",style:"agile|calm",priority:"safety|range"},
      series:"全地形探索系列",models:["terra-x2","terra-x1"],
      reason:"更高离地、更宽胎面与 TCS 牵引力控制，在湿滑与砂石路面上更容易把动力落到地面。"}
  };
  var QUESTIONS=[
    {k:"distance",t:"单程通勤距离",o:[["3 km 以内","short"],["3–10 km","mid"],["10 km 以上","long"]]},
    {k:"road",    t:"常走路况",    o:[["平整城市道路","smooth"],["坑洼 / 修补路面","rough"],["城郊土路 / 非铺装","offroad"]]},
    {k:"style",   t:"骑行风格",    o:[["平稳省心","calm"],["轻快灵活","agile"],["要速度与推背感","fast"]]},
    {k:"budget",  t:"预算区间",    o:[["入门","low"],["中端","mid"],["高端 / 旗舰","high"]]},
    {k:"priority",t:"最在意的一点",o:[["续航","range"],["智能体验","smart"],["外观与夜骑氛围","style"],["安全与制动","safety"]]}
  ];
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId=function(id){for(var i=0;i<MODELS.length;i++) if(MODELS[i].id===id) return MODELS[i]; return MODELS[0]};

  /* ================= 人格匹配 ================= */
  var ans={};
  function renderQ(){
    $('#qwrap').innerHTML=QUESTIONS.map(function(q,i){
      return '<div class="q"><div class="qt"><b>0'+(i+1)+'</b>'+q.t+'</div><div class="opt" data-k="'+q.k+'">'+
        q.o.map(function(o){return '<button type="button" data-v="'+o[1]+'">'+o[0]+'</button>'}).join('')+
        '</div></div>';
    }).join("");
    $$('#qwrap .opt').forEach(function(g){
      g.addEventListener('click',function(e){
        var b=e.target.closest('button'); if(!b) return;
        ans[g.dataset.k]=b.dataset.v;
        $$('button',g).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});
        updateBar(); if(Object.keys(ans).length===QUESTIONS.length) match();
      });
    });
  }
  function updateBar(){
    var n=Object.keys(ans).length;
    $('#qbar').style.width=(n/QUESTIONS.length*100)+"%";
  }
  function match(){
    var best=null,bestScore=-1;
    Object.keys(BRANCH).forEach(function(k){
      var p=BRANCH[k], s=0;
      Object.keys(p.rules).forEach(function(f){
        var a=ans[f]; if(!a) return;
        if(p.rules[f].split("|").indexOf(a)>=0) s+=2;
      });
      if(s>bestScore){bestScore=s;best=p;}
    });
    // 预算只做人话提示，不参与打分（占位数据里没有价格）
    var p=best;
    $('#presult').innerHTML=
      '<div class="pcard" style="border-color:'+p.color+';background:'+p.color+'0d">'+
        '<div><div class="pcode">RIDER PERSONA · '+p.code+'</div>'+
        '<div class="plabel" style="color:'+p.color+'">'+p.label+'</div>'+
        '<div style="color:var(--mid);font-size:.9rem">'+p.desc+'</div>'+
        '<div class="tagline">'+p.tags.map(function(t){return '<span class="tag" style="color:'+p.color+';border-color:'+p.color+'59">'+t+'</span>'}).join("")+'</div>'+
        '<div style="color:var(--lo);font-size:.78rem">匹配得分 '+bestScore+' / 8（口径：4 个维度各 2 分；预算不参与评分）</div></div>'+
        '<div><div class="caps" style="font-size:10px;color:var(--lo)">推荐系列</div>'+
        '<div style="font-family:var(--fd);font-size:1.05rem;margin:4px 0 12px">'+p.series+'</div>'+
        '<div class="rec" style="border-color:'+p.color+'">'+
          '<div class="caps" style="font-size:10px;color:var(--lo)">推荐车型</div>'+
          p.models.map(function(m){var d=byId(m);
            return '<div class="m">'+d.name+' <span style="color:var(--mid);font-size:.78rem">'+d.sub+'</span></div>'}).join("")+
          '<div style="color:var(--mid);font-size:.86rem;margin-top:10px">'+p.reason+'</div>'+
        '</div>'+
        '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">'+
          '<button class="btn pri" id="btnUse" style="background:'+p.color+';border-color:'+p.color+'">把推荐的两款放进对比 ↓</button>'+
          '<button class="btn" id="btnReset">重答</button></div></div>'+
      '</div>';
    $('#presult').classList.add('on');
    try{ localStorage.setItem('emg.persona',JSON.stringify({id:p.id,label:p.label,models:p.models})); }catch(e){}
    $('#btnUse').addEventListener('click',function(){
      $('#selA').value=p.models[0]; $('#selB').value=p.models[1]; render();
      $('#compare').scrollIntoView({behavior:RM?'auto':'smooth'});
    });
    $('#btnReset').addEventListener('click',function(){
      ans={}; $$('#qwrap button').forEach(function(b){b.removeAttribute('aria-pressed')});
      updateBar(); $('#presult').classList.remove('on');
    });
    $('#presult').scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'});
  }

  /* ================= 评分口径 ================= */
  function brakeLv(m){
    var s=m.brake.front+(m.brake.rear||"");
    var lv=0;
    if(/液压/.test(s)) lv=3; else if(/碟刹/.test(s)) lv=2; else lv=1;
    if(/ABS/.test(s)||m.assist.indexOf("ABS")>=0) lv+=0.5;
    return lv;             /* 1 鼓刹 / 2 碟刹 / 3 液压碟刹 / 3.5 +ABS */
  }
  var AXES=[
    {k:"range", label:"续航",   get:function(m){return m.range},                 denom:160, unit:"km"},
    {k:"speed", label:"最高速度", get:function(m){return m.speed},               denom:120, unit:"km/h"},
    {k:"feat",  label:"智能功能", get:function(m){return m.feat.length},          denom:9,   unit:"项"},
    {k:"brake", label:"制动规格", get:function(m){return brakeLv(m)},            denom:3.5, unit:"级"},
    {k:"assist",label:"电控辅助", get:function(m){return m.assist.length},        denom:3,   unit:"项"},
    {k:"scene", label:"场景覆盖", get:function(m){return m.scenes.length},        denom:3,   unit:"个"}
  ];
  var CRIT="口径说明：六根轴 = 续航 km ÷ 160、最高速度 km/h ÷ 120、智能功能项数 ÷ 9、"
    +"制动规格（鼓刹 1 / 碟刹 2 / 液压碟刹 3，带 ABS +0.5）÷ 3.5、电控辅助项数 ÷ 3、场景覆盖数 ÷ 3。"
    +"分母取本站 6 款占位车型的最大值 —— <b>这是本站自创的示意口径，不是官方评级，也不代表真实性能排序</b>。";

  /* ================= 雷达图 ================= */
  var R=158, CX=230, CY=228;
  function pt(i,v){
    var a=-Math.PI/2 + i*(Math.PI*2/AXES.length);
    return [CX+Math.cos(a)*R*v, CY+Math.sin(a)*R*v];
  }
  function poly(vals,t){
    return vals.map(function(v,i){var p=pt(i,v*t); return p[0].toFixed(1)+","+p[1].toFixed(1)}).join(" ");
  }
  var radarT=0, anim=null;
  function drawRadar(t){
    var A=byId($('#selA').value), B=byId($('#selB').value);
    var va=AXES.map(function(a){return Math.min(1,a.get(A)/a.denom)});
    var vb=AXES.map(function(a){return Math.min(1,a.get(B)/a.denom)});
    var diff=va.map(function(v,i){return Math.abs(v-vb[i])});
    var maxI=diff.indexOf(Math.max.apply(null,diff));
    var s='<defs><linearGradient id="gA" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0" stop-color="#C6FF00"/><stop offset="1" stop-color="#8FCC00"/></linearGradient>'+
      '<linearGradient id="gB" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0" stop-color="#00E5FF"/><stop offset="1" stop-color="#0090B0"/></linearGradient></defs>';
    /* 网格 */
    [0.25,0.5,0.75,1].forEach(function(g){
      s+='<polygon points="'+poly([1,1,1,1,1,1],g)+'" fill="none" stroke="rgba(255,255,255,'+(g===1?.16:.08)+')" stroke-width="1"/>';
    });
    /* 轴 + 标签 + 差异高亮 */
    AXES.forEach(function(a,i){
      var e=pt(i,1);
      s+='<line x1="'+CX+'" y1="'+CY+'" x2="'+e[0].toFixed(1)+'" y2="'+e[1].toFixed(1)+
         '" stroke="'+(i===maxI?'rgba(255,107,0,.55)':'rgba(255,255,255,.10)')+'" stroke-width="'+(i===maxI?2:1)+
         '"'+(i===maxI?' stroke-dasharray="4 4"':'')+'/>';
      var lp=pt(i,1.17), anc=Math.abs(lp[0]-CX)<6?"middle":(lp[0]>CX?"start":"end");
      s+='<text x="'+lp[0].toFixed(1)+'" y="'+lp[1].toFixed(1)+'" text-anchor="'+anc+'" dominant-baseline="middle" '+
         'font-size="11.5" letter-spacing="1" fill="'+(i===maxI?'#FF6B00':'#98A2AE')+'" font-family="\'Noto Sans SC\',sans-serif">'+a.label+'</text>';
      if(i===maxI){
        var lp2=pt(i,1.06);
        s+='<text x="'+lp2[0].toFixed(1)+'" y="'+(lp2[1]+13).toFixed(1)+'" text-anchor="'+anc+'" '+
           'font-size="10" fill="#FF6B00" font-family="ui-monospace,monospace">Δ'+Math.round(diff[i]*100)+'%</text>';
      }
    });
    /* 两个多边形 */
    s+='<polygon points="'+poly(va,t)+'" fill="rgba(198,255,0,.16)" stroke="url(#gA)" stroke-width="2"/>';
    s+='<polygon points="'+poly(vb,t)+'" fill="rgba(0,229,255,.14)" stroke="url(#gB)" stroke-width="2"/>';
    AXES.forEach(function(a,i){
      var pa=pt(i,va[i]*t), pb=pt(i,vb[i]*t);
      s+='<circle cx="'+pa[0].toFixed(1)+'" cy="'+pa[1].toFixed(1)+'" r="3.4" fill="#C6FF00"/>';
      s+='<circle cx="'+pb[0].toFixed(1)+'" cy="'+pb[1].toFixed(1)+'" r="3.4" fill="#00E5FF"/>';
    });
    s+='<text x="'+CX+'" y="'+(CY+R+56)+'" text-anchor="middle" font-size="10" letter-spacing="2" '+
       'fill="#5A636E" font-family="ui-monospace,monospace">RADAR · 示意口径 · 非官方评级</text>';
    $('#radar').innerHTML=s;
    return {va:va,vb:vb,diff:diff,maxI:maxI,A:A,B:B};
  }
  function animateRadar(){
    if(RM){ radarT=1; drawRadar(1); return; }
    cancelAnimationFrame(anim); radarT=0;
    var t0=performance.now(), D=900;
    (function step(now){
      radarT=Math.min(1,(now-t0)/D);
      drawRadar(1-Math.pow(1-radarT,3));
      if(radarT<1) anim=requestAnimationFrame(step);
    })(t0);
  }

  /* ================= 条形图 / 摘要 ================= */
  function renderBars(res){
    var A=res.A,B=res.B;
    var rows=[
      {label:"续航",    get:function(m){return m.range},       u:"km",   d:160},
      {label:"最高速度",get:function(m){return m.speed},       u:"km/h", d:120},
      {label:"智能功能",get:function(m){return m.feat.length}, u:"项",   d:9}
    ];
    $('#bars').innerHTML=rows.map(function(r){
      var av=r.get(A), bv=r.get(B);
      var pctA=Math.min(100,av/r.d*100), pctB=Math.min(100,bv/r.d*100);
      var d=bv-av, dt=(d===0?"持平":(d>0?"B 高 ":"A 高 ")+Math.abs(d)+r.u);
      return '<div class="bar"><div class="bt"><span>'+r.label+'</span>'+
        '<span class="delta">'+dt+(d?('（'+Math.abs(Math.round(d/(av||1)*100))+'%）'):'')+'</span></div>'+
        '<div class="row"><span class="nm" style="color:#C6FF00">'+A.name+'</span>'+
          '<span class="track"><i style="background:linear-gradient(90deg,#8FCC00,#C6FF00)" data-w="'+pctA+'"></i></span>'+
          '<span class="val">'+av+'<small>'+r.u+'</small></span></div>'+
        '<div class="row"><span class="nm" style="color:#00E5FF">'+B.name+'</span>'+
          '<span class="track"><i style="background:linear-gradient(90deg,#0090B0,#00E5FF)" data-w="'+pctB+'"></i></span>'+
          '<span class="val">'+bv+'<small>'+r.u+'</small></span></div></div>';
    }).join("");
    requestAnimationFrame(function(){
      $$('#bars .track i').forEach(function(el){ el.style.width=el.dataset.w+"%"; });
    });
    /* 差异摘要：取差异最大的 3 根轴 */
    var order=AXES.map(function(a,i){return {i:i,d:res.diff[i]}}).sort(function(x,y){return y.d-x.d}).slice(0,3);
    $('#sum').innerHTML=order.map(function(o){
      var a=AXES[o.i];
      var vA=a.get(A), vB=a.get(B);
      var who=res.va[o.i]>res.vb[o.i]?A:B, other=who===A?B:A;
      var hi=who===A?"#C6FF00":"#00E5FF";
      return '<div class="sumrow"><span class="ax">'+a.label+'</span><span>'+
        '<b style="color:'+hi+'">'+who.name+'</b> 为 '+(who===A?vA:vB)+a.unit+
        '，'+(o.d<0.02?'与 '+other.name+' 基本持平':'领先 '+other.name+' 约 '+Math.round(o.d*100)+'%（示意口径）')+
        '</span></div>';
    }).join("");
    $('#crit').innerHTML=CRIT;
  }
  function render(){
    var A=byId($('#selA').value), B=byId($('#selB').value);
    $('#infoA').innerHTML=A.sub+' · 续航 '+A.range+' km · '+A.speed+' km/h <span class="badge">示例</span>';
    $('#infoB').innerHTML=B.sub+' · 续航 '+B.range+' km · '+B.speed+' km/h <span class="badge">示例</span>';
    $('#lnOpen').href="03-model.html?id="+A.id;
    var res=drawRadar(1);          /* 先算一次用于条形图 */
    renderBars(res);
    animateRadar();                /* 再从中心生长一遍（同帧内重置，不会闪） */
    try{ localStorage.setItem('emg.compare',JSON.stringify([A.id,B.id])); }catch(e){}
  }

  /* ================= 启动 ================= */
  (function init(){
    var sel=MODELS.map(function(m){return '<option value="'+m.id+'">'+m.name+' · '+m.sub+'</option>'}).join("");
    $('#selA').innerHTML=sel; $('#selB').innerHTML=sel;
    var q=new URLSearchParams(location.search).get('ids');
    var defA="nova-c2", defB="volt-p1";
    try{ var s=JSON.parse(localStorage.getItem('emg.compare')||'null'); if(s){defA=s[0];defB=s[1];} }catch(e){}
    if(q){ var parts=q.split(","); if(parts[0])defA=parts[0]; if(parts[1])defB=parts[1]; }
    $('#selA').value=byId(defA).id; $('#selB').value=byId(defB).id;
    $('#selA').addEventListener('change',render);
    $('#selB').addEventListener('change',render);
    $('#btnSwap').addEventListener('click',function(){
      var a=$('#selA').value; $('#selA').value=$('#selB').value; $('#selB').value=a; render();
    });
    renderQ(); updateBar(); render();
    try{
      var p=JSON.parse(localStorage.getItem('emg.persona')||'null');
      if(p) { $('#pT').insertAdjacentHTML('afterend','<p class="sub" style="color:var(--volt)">上次结果：'+p.label+'</p>'); }
    }catch(e){}
  })();
})();
