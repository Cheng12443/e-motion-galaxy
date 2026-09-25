
(function(){
  "use strict";
  var $=function(s){return document.querySelector(s)};
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE = window.matchMedia('(max-width:980px),(pointer:coarse)').matches;
  var root = document.documentElement;

  /* ---------- 0. 日 / 夜 环境叙事 ---------- */
  var btnScene=$('#btnScene'), btnSound=$('#btnSound'), sceneLabel=$('#sceneLabel');
  function applyScene(night){
    root.classList.toggle('is-night',night);
    root.classList.toggle('is-day',!night);
    btnScene.textContent = night ? '☾ 夜间' : '☀ 日间';
    btnScene.setAttribute('aria-pressed', String(!night));
    sceneLabel.textContent = night ? 'NIGHT · 夜骑霓虹' : 'DAY · 城市通勤';
    try{ localStorage.setItem('emg.night', night?'1':'0'); }catch(e){}
  }
  var savedNight = null;
  try{ savedNight = localStorage.getItem('emg.night'); }catch(e){}
  var h = new Date().getHours();
  var night = (savedNight===null) ? (h<6||h>=18) : (savedNight==='1');
  applyScene(night);
  btnScene.addEventListener('click',function(){ applyScene(!root.classList.contains('is-night')); });

  /* ---------- 1. 电流环几何（刻度 / 闪电） ---------- */
  var ticks=$('#ticks'), bolts=$('#bolts'), N=72, TICK=[];
  (function buildRing(){
    var NS='http://www.w3.org/2000/svg', out='';
    for(var i=0;i<N;i++){
      var a=i/N*Math.PI*2, r1=300, r2=(i%6===0)?322:312;
      var x1=350+Math.sin(a)*r1, y1=350-Math.cos(a)*r1;
      var x2=350+Math.sin(a)*r2, y2=350-Math.cos(a)*r2;
      out+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+
           '" stroke="rgba(255,255,255,.22)" stroke-width="'+(i%6===0?2.4:1.2)+'" data-i="'+i+'"/>';
    }
    ticks.innerHTML=out;
    TICK=[].slice.call(ticks.querySelectorAll('line'));
    // 6 道电弧
    var b='';
    for(var k=0;k<6;k++){
      var base=(k/6)*360 - 90;
      var d='M0 0 l14 -22 l-8 -4 l20 -30 l-6 -3 l26 -34';
      b+='<path class="bolt" data-k="'+k+'" d="'+d+'" fill="none" stroke="var(--arc)" stroke-width="3" '+
         'stroke-linejoin="miter" opacity="0" filter="url(#fGlow)" '+
         'transform="translate(350 50) rotate('+base+' 0 300)"/>';
    }
    bolts.innerHTML=b;
  })();
  var PROG=$('#ringProgress'), C=2*Math.PI*300;
  PROG.setAttribute('stroke-dasharray', C.toFixed(1));
  PROG.setAttribute('stroke-dashoffset', C.toFixed(1));
  var BOLT=[].slice.call(bolts.querySelectorAll('.bolt'));

  /* ---------- 2. 状态机 ---------- */
  var st={ charge:0, phase:'charge', sound:false };
  var gate=$('#gate'), pfill=$('#pfill'), pct=$('#pct'), pbar=$('#pbar'), live=$('#live');
  var vwrap=$('#vwrap'), ringwrap=$('#ringwrap'), hero=$('#hero'), body=document.body;
  var mSpeed=$('#mSpeed'), mRange=$('#mRange'), mCharge=$('#mCharge');

  function setCharge(p, silent){
    p=Math.max(0,Math.min(1,p));
    st.charge=p;
    root.style.setProperty('--v-charge', p.toFixed(3));
    PROG.setAttribute('stroke-dashoffset', (C*(1-p)).toFixed(1));
    var t=Math.round(p*N);
    for(var i=0;i<TICK.length;i++){
      var on=i<t, el=TICK[i];
      el.setAttribute('stroke', on?'var(--volt)':'rgba(255,255,255,.22)');
      el.setAttribute('opacity', on?'0.95':'0.55');
    }
    for(var k=0;k<BOLT.length;k++){
      var need=(k+1)/BOLT.length;
      BOLT[k].setAttribute('opacity', p>=need*0.92 ? (0.25+0.75*Math.min(1,(p-need*0.92)/0.08)).toFixed(2) : '0');
    }
    pfill.style.width=(p*100).toFixed(1)+'%';
    pct.textContent=Math.round(p*100)+'%';
    pbar.setAttribute('aria-valuenow', String(Math.round(p*100)));
    mCharge.textContent=String(Math.round(p*100));
    if(!silent && Math.round(p*100)%25===0) live.textContent='充能 '+Math.round(p*100)+'%';
    if(vwrap) vwrap.style.opacity = RM ? (p>=1?1:.9) : (0.18+p*0.82);
  }

  function finish(){
    if(st.phase!=='charge') return;
    setCharge(1, true);
    st.phase='open';
    live.textContent='充能完成，电流环开启';
    ringwrap.classList.add('opened');
    vwrap.classList.add('assembled');
    sfx('open');
    var t1 = RM?0:900, t2 = RM?0:1500;
    setTimeout(function(){
      vwrap.classList.add('out');
      hero.classList.add('rolling');
      st.phase='ride';
      sfx('ride');
      roll();
    }, t1);
    setTimeout(function(){
      st.phase='done';
      gate.classList.add('hide');
      body.classList.remove('gated');
      live.textContent='启动完成';
      try{ localStorage.setItem('emg.entered','1'); }catch(e){}
    }, t2);
  }

  function roll(){
    var targets=[[mSpeed,62],[mRange,95]];
    if(RM){ mSpeed.textContent='62'; mRange.textContent='95'; return; }
    targets.forEach(function(t){
      var el=t[0], to=t[1], t0=performance.now(), D=1500;
      (function step(now){
        var k=Math.min(1,(now-t0)/D), e=1-Math.pow(1-k,3);
        el.textContent=String(Math.round(to*e));
        if(k<1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ---------- 3. 充能输入 ---------- */
  var hold=false;
  function add(p){ if(st.phase!=='charge') return; setCharge(st.charge+p); if(st.charge>=1) finish(); }

  window.addEventListener('wheel', function(e){
    if(st.phase!=='charge') return;
    e.preventDefault();
    add(Math.min(0.06, Math.abs(e.deltaY)/1600));
  }, {passive:false});

  var touchY=null;
  window.addEventListener('touchstart',function(e){ touchY=e.touches[0].clientY; },{passive:true});
  window.addEventListener('touchmove',function(e){
    if(st.phase!=='charge'||touchY===null) return;
    e.preventDefault();
    var y=e.touches[0].clientY, d=touchY-y; touchY=y;
    if(d>0) add(Math.min(0.05, d/900));
  },{passive:false});

  ringwrap.addEventListener('pointerdown',function(e){ e.preventDefault(); hold=true; ringwrap.setPointerCapture&&ringwrap.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup',function(){ hold=false; });
  ringwrap.addEventListener('pointerleave',function(){ hold=false; });
  ringwrap.addEventListener('click',function(){ if(st.phase==='charge'){ add(0.12); tapChargeSound(); } });

  window.addEventListener('keydown',function(e){
    if(st.phase!=='charge') return;
    if(e.key==='ArrowUp'||e.key==='ArrowDown'||e.key===' '||e.key==='Enter'){ hold=true; e.preventDefault(); }
    if(e.key==='Escape') finish();
  });
  window.addEventListener('keyup',function(){ hold=false; });

  var lastT=performance.now();
  (function loop(now){
    var dt=Math.min(64,now-lastT); lastT=now;
    if(hold && st.phase==='charge'){ add(dt/1000*0.42); hum(true); } else hum(false);
    requestAnimationFrame(loop);
  })(lastT);

  $('#btnSkip').addEventListener('click',function(){ setCharge(Math.max(st.charge,0.999)); finish(); });

  /* ---------- 4. 粒子 ---------- */
  var cvs=$('#particles'), ctx=null, parts=[], W=0, H=0, dpr=1;
  if(!RM){
    ctx=cvs.getContext('2d');
    var COUNT = MOBILE?70:150;
    for(var i=0;i<COUNT;i++) parts.push({a:Math.random()*Math.PI*2, r:0.45+Math.random()*0.55, s:0.4+Math.random()*1.6, o:Math.random()});
    function resize(){
      var r=cvs.parentElement.getBoundingClientRect();
      dpr=Math.min(2, window.devicePixelRatio||1);
      W=r.width; H=r.height;
      cvs.width=Math.floor(W*dpr); cvs.height=Math.floor(H*dpr);
      cvs.style.width=W+'px'; cvs.style.height=H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(); window.addEventListener('resize',resize);
    var t=0;
    (function draw(){
      t+=0.006;
      ctx.clearRect(0,0,W,H);
      var cx=W/2, cy=H*0.56, base=Math.min(W,H)*0.30;
      var p=st.charge, burst = (st.phase==='ride'||st.phase==='done');
      for(var i=0;i<parts.length;i++){
        var q=parts[i];
        var a=q.a + t*q.s*(0.4+p);
        var rr=base*(q.r)*(1.9-p*1.05);
        var x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr*0.72;
        if(burst){ x+= (x-cx)*0.9; y+=(y-cy)*0.9; }
        var al=(0.10+p*0.55)*(1-q.o*0.5)*(burst?0.4:1);
        ctx.beginPath();
        ctx.fillStyle= (q.o>0.72?'rgba(0,229,255,'+al.toFixed(2)+')':'rgba(198,255,0,'+al.toFixed(2)+')');
        ctx.arc(x,y,burst?1.0:(1.1+q.o*1.4),0,6.283);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- 5. 视差（车辆轻微转向 + 环偏移） ---------- */
  if(!RM && !MOBILE){
    var tx=0,ty=0,cx2=0,cy2=0;
    window.addEventListener('pointermove',function(e){
      tx=(e.clientX/window.innerWidth-0.5)*2; ty=(e.clientY/window.innerHeight-0.5)*2;
    },{passive:true});
    (function par(){
      cx2+=(tx-cx2)*0.07; cy2+=(ty-cy2)*0.07;
      var v=$('.vinner');
      v.style.setProperty('--tilt',(cx2*4.2).toFixed(2));
      v.style.setProperty('--tiltY',(cy2*2.4).toFixed(2));
      ringwrap.style.setProperty('--px',(cx2*-10).toFixed(2)+'px');
      ringwrap.style.setProperty('--py',(cy2*-8).toFixed(2)+'px');
      requestAnimationFrame(par);
    })();
  }

  /* ---------- 6. 能量光标（磁吸） ---------- */
  var cur=$('#cur');
  if(!RM && !MOBILE && cur){
    var mx=0,my=0,cx3=0,cy3=0,mag=null;
    window.addEventListener('pointermove',function(e){
      mx=e.clientX; my=e.clientY; cur.classList.remove('hide');
      var el=e.target.closest && e.target.closest('.magnetic, a, button');
      mag = el || null; cur.classList.toggle('mag', !!mag);
    },{passive:true});
    document.addEventListener('pointerleave',function(){ cur.classList.add('hide'); });
    (function follow(){
      var gx=mx, gy=my;
      if(mag){ var r=mag.getBoundingClientRect(); gx=(r.left+r.width/2)*0.82+mx*0.18; gy=(r.top+r.height/2)*0.82+my*0.18; }
      cx3+=(gx-cx3)*0.22; cy3+=(gy-cy3)*0.22;
      cur.style.transform='translate3d('+cx3+'px,'+cy3+'px,0)';
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- 7. 合成声音（默认静音） ---------- */
  var AC=null, humOsc=null, humGain=null, humNoise=null;
  function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return AC; }
  function hum(on){
    if(!st.sound) return; var c=ac(); if(!c) return;
    if(!humOsc){
      humOsc=c.createOscillator(); humGain=c.createGain(); humNoise=c.createBiquadFilter();
      humOsc.type='sawtooth'; humOsc.frequency.value=60; humGain.gain.value=0;
      humNoise.type='bandpass'; humNoise.frequency.value=900; humNoise.Q.value=6;
      humOsc.connect(humGain); humGain.connect(c.destination);
    }
    var t=c.currentTime;
    humOsc.frequency.setTargetAtTime(58+st.charge*180, t, 0.08);
    humGain.gain.setTargetAtTime(on?0.035+st.charge*0.045:0, t, 0.12);
  }
  function tone(f1,f2,dur,type,vol){
    var c=ac(); if(!c) return;
    var o=c.createOscillator(), g=c.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(f1,c.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(40,f2), c.currentTime+dur);
    g.gain.setValueAtTime(0.0001,c.currentTime);
    g.gain.exponentialRampToValueAtTime(vol||0.14,c.currentTime+0.04);
    g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+dur+0.05);
  }
  function noiseSweep(dur,f1,f2,vol){
    var c=ac(); if(!c) return;
    var n=c.createBufferSource(), len=Math.floor(c.sampleRate*dur), buf=c.createBuffer(1,len,c.sampleRate), d=buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
    n.buffer=buf;
    var bpf=c.createBiquadFilter(), g=c.createGain();
    bpf.type='bandpass'; bpf.frequency.setValueAtTime(f1,c.currentTime);
    bpf.frequency.exponentialRampToValueAtTime(f2,c.currentTime+dur); bpf.Q.value=1.2;
    g.gain.value=vol||0.10;
    n.connect(bpf); bpf.connect(g); g.connect(c.destination); n.start();
  }
  function sfx(kind){
    if(!st.sound) return;
    if(kind==='open'){ tone(220,900,0.5,'square',0.10); noiseSweep(0.6,400,5200,0.12); }
    else if(kind==='ride'){ tone(70,300,1.1,'sawtooth',0.12); noiseSweep(1.0,600,240,0.09); }
  }
  function tapChargeSound(){ if(st.sound) tone(700,1200,0.12,'triangle',0.05); }
  btnSound.addEventListener('click',function(){
    st.sound=!st.sound;
    btnSound.setAttribute('aria-pressed',String(st.sound));
    btnSound.textContent = st.sound?'♪ 声音 开':'♪ 声音 关';
    if(st.sound){ var c=ac(); if(c && c.state==='suspended') c.resume(); hum(true); }
    else hum(false);
  });

  /* ---------- 8. 启动：回访则跳过仪式 ---------- */
  var entered=false; try{ entered=localStorage.getItem('emg.entered')==='1'; }catch(e){}
  if(entered){
    setCharge(1,true); ringwrap.classList.add('opened'); vwrap.classList.add('assembled','out');
    hero.classList.add('rolling'); st.phase='done'; body.classList.remove('gated'); gate.classList.add('hide');
    mSpeed.textContent='62'; mRange.textContent='95';
  }else{
    setCharge(0,true);
    if(RM){ $('#gateHint').innerHTML='按 <kbd>空格</kbd> 完成充能（已按系统设置关闭动画）'; }
  }
})();
