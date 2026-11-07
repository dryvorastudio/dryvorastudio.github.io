// Strona główna: zwiastun, przypięta opowieść, pory roku, karuzela petów, wylęgarnia, kuźnia, bossowie.
(function(){
const $ = s=>document.querySelector(s), $$ = s=>[...document.querySelectorAll(s)];
const T = EH.t, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RANGI = {C:{kol:'#b0bec5',n:{pl:'Zwykły',en:'Common'},atk:6}, B:{kol:'#64b5f6',n:{pl:'Rzadki',en:'Rare'},atk:9}, A:{kol:'#ba68c8',n:{pl:'Epicki',en:'Epic'},atk:13}, S:{kol:'#ffca28',n:{pl:'Legendarny',en:'Legendary'},atk:18}};

// ═══ dźwięk (syntezowany, tylko po kliknięciu) ═══
let AC=null;
function dzwiek(rodzaj){
  try{ AC = AC || new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  const t=AC.currentTime, g=AC.createGain(); g.connect(AC.destination);
  if(rodzaj==='kowadlo'){
    [880,1320,2210,3170].forEach((f,i)=>{ const o=AC.createOscillator(), gg=AC.createGain(); o.type='triangle'; o.frequency.value=f*(1+Math.random()*0.01);
      gg.gain.setValueAtTime(0.16/(i+1),t); gg.gain.exponentialRampToValueAtTime(0.0001,t+0.9-i*0.15); o.connect(gg); gg.connect(g); o.start(t); o.stop(t+1); });
    const b=AC.createBuffer(1,AC.sampleRate*0.06,AC.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
    const n=AC.createBufferSource(); n.buffer=b; const ng=AC.createGain(); ng.gain.value=0.25; n.connect(ng); ng.connect(g); n.start(t);
    g.gain.value=0.6;
  } else if(rodzaj==='wyklucie'){
    [523,659,784,1047].forEach((f,i)=>{ const o=AC.createOscillator(), gg=AC.createGain(); o.type='sine'; o.frequency.value=f;
      gg.gain.setValueAtTime(0,t+i*0.07); gg.gain.linearRampToValueAtTime(0.12,t+i*0.07+0.02); gg.gain.exponentialRampToValueAtTime(0.0001,t+i*0.07+0.8); o.connect(gg); gg.connect(g); o.start(t+i*0.07); o.stop(t+i*0.07+0.9); });
    g.gain.value=0.7;
  } else if(rodzaj==='trzask'){
    const b=AC.createBuffer(1,AC.sampleRate*0.04,AC.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
    const n=AC.createBufferSource(); n.buffer=b; const f=AC.createBiquadFilter(); f.type='highpass'; f.frequency.value=1800; n.connect(f); f.connect(g); g.gain.value=0.5; n.start(t);
  }
}

// ═══ ZWIASTUN ═══
const modal=$('#modal'), mv=$('#modalVid');
$$('[data-zwiastun]').forEach(el=>{ const otw=()=>{ if(!mv.src) mv.src=mv.dataset.src; modal.classList.add('otw'); modal.setAttribute('aria-hidden','false'); mv.currentTime=0; mv.play().catch(()=>{}); };
  el.addEventListener('click', otw); el.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); otw(); } }); });
const zamk=()=>{ modal.classList.remove('otw'); modal.setAttribute('aria-hidden','true'); mv.pause(); };
$('#modalX').addEventListener('click', zamk); modal.addEventListener('click', e=>{ if(e.target===modal) zamk(); });
addEventListener('keydown', e=>{ if(e.key==='Escape') zamk(); });
// ekran kina prostuje się przy przewijaniu
const kino=$('#kinoEkran');
function kinoPrzew(){ const r=kino.getBoundingClientRect(), p=Math.min(1,Math.max(0,1-(r.top-innerHeight*0.15)/(innerHeight*0.7)));
  kino.style.transform=`rotateX(${(1-p)*16}deg) scale(${0.9+p*0.1})`; }
addEventListener('scroll', kinoPrzew, {passive:true}); kinoPrzew();

// ═══ OPOWIEŚĆ ═══
const kroki=$$('.op-krok'), filmy=$$('#ekran video'), urz=$('#urzadzenie'), pasek=$('#opPasek');
let aktK=0;
function pokazKrok(i){
  if(i===aktK && filmy[i].classList.contains('akt')) return; aktK=i;
  kroki.forEach((k,j)=>k.classList.toggle('akt', j===i));
  filmy.forEach((v,j)=>{ if(j===i){ if(!v.src && v.dataset.src) v.src=v.dataset.src; v.currentTime=0; v.play().catch(()=>{}); v.classList.add('akt'); }
    else { v.classList.remove('akt'); setTimeout(()=>{ if(!v.classList.contains('akt')) v.pause(); }, 900); } });
  // wczytaj następny zawczasu
  const n=filmy[i+1]; if(n && !n.src && n.dataset.src){ n.src=n.dataset.src; n.preload='auto'; }
  pasek.style.width = ((i+1)/kroki.length*100)+'%';
  const ry=[-14,12,-10,14,-12,10][i]||0, rx=[6,4,8,3,7,5][i]||5;
  urz.dataset.ry=ry; urz.dataset.rx=rx; nachyl();
}
let mX=0,mY=0;
function nachyl(){ urz.style.transform=`rotateY(${(+urz.dataset.ry||-14)+mX*6}deg) rotateX(${(+urz.dataset.rx||6)-mY*5}deg)`; }
addEventListener('pointermove', e=>{ mX=e.clientX/innerWidth-0.5; mY=e.clientY/innerHeight-0.5; if(urz) nachyl(); }, {passive:true});
const ioK=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting) pokazKrok(kroki.indexOf(e.target)); }); }, {rootMargin:'-45% 0px -45% 0px'});
kroki.forEach(k=>ioK.observe(k)); kroki[0].classList.add('akt'); pasek.style.width=(100/kroki.length)+'%';
const ioE=new IntersectionObserver(es=>es.forEach(e=>{ const v=filmy[aktK]; if(e.isIntersecting) v.play().catch(()=>{}); else filmy.forEach(x=>x.pause()); }));
ioE.observe($('.op-scena'));

// ═══ PORY ROKU ═══
const PORY=[
  {id:'wiosna', ik:'🌱', kol:'#a5d6a7', n:{pl:'Wiosna',en:'Spring'}, food:1.20, wood:1.00, stone:1.00},
  {id:'lato',   ik:'☀️', kol:'#ffe082', n:{pl:'Lato',en:'Summer'}, food:1.35, wood:1.10, stone:1.05},
  {id:'jesien', ik:'🍂', kol:'#ffb74d', n:{pl:'Jesień',en:'Autumn'}, food:0.85, wood:1.15, stone:1.00},
  {id:'zima',   ik:'❄️', kol:'#b3e5fc', n:{pl:'Zima',en:'Winter'}, food:0.30, wood:0.75, stone:0.80},
];
let pora=0, poraRecznie=0;
const pw=$('#poryWybor'), pv=$$('#poryOkno video'), okno=$('#poryOkno');
function rysujPory(){
  pw.innerHTML = PORY.map((p,i)=>`<button style="--kol:${p.kol}" data-i="${i}" class="${i===pora?'akt':''}"><span>${p.ik}</span>${T(p.n)}</button>`).join('');
  const p=PORY[pora], pr=v=>{ const d=Math.round((v-1)*100); return `<em class="${d>0?'plus':d<0?'minus':''}">${d>0?'+':''}${d}%</em>`; };
  $('#poryDane').innerHTML = `<span>🌾 ${T({pl:'Żywność',en:'Food'})}${pr(p.food)}</span><span>🪵 ${T({pl:'Drewno',en:'Wood'})}${pr(p.wood)}</span><span>🪨 ${T({pl:'Kamień',en:'Stone'})}${pr(p.stone)}</span>`;
}
// zmiana pory: nowe nagranie odsłania się kołem od klikniętego miejsca, w tym samym momencie ujęcia
function zmienPore(i, x, y){
  if(i===pora) return; const stary=pv[pora], nowy=pv[i]; pora=i;
  if(!nowy.src && nowy.dataset.src) nowy.src=nowy.dataset.src;
  try{ nowy.currentTime = (stary.currentTime||0) % (nowy.duration||5); }catch(e){}
  nowy.play().catch(()=>{});
  pv.forEach(v=>{ v.classList.remove('bylo'); if(v!==nowy && v!==stary) v.classList.remove('akt'); });
  stary.classList.remove('akt'); stary.classList.add('bylo');
  okno.style.setProperty('--wx', (x??85)+'%'); okno.style.setProperty('--wy', (y??20)+'%');
  void nowy.offsetWidth; nowy.classList.add('akt');
  setTimeout(()=>{ if(!stary.classList.contains('akt')){ stary.classList.remove('bylo'); stary.pause(); } }, 1200);
  // wczytaj następną porę zawczasu
  const nn=pv[(i+1)%4]; if(!nn.src && nn.dataset.src){ nn.src=nn.dataset.src; nn.preload='auto'; }
  rysujPory();
}
pw.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; poraRecznie=performance.now();
  const r=okno.getBoundingClientRect(), rb=b.getBoundingClientRect();
  zmienPore(+b.dataset.i, Math.max(0,Math.min(100,(rb.left+rb.width/2-r.left)/r.width*100)), 0); });
// rok płynie sam: gdy nagranie dobiega końca, przychodzi kolejna pora
pv.forEach((v,i)=>v.addEventListener('timeupdate', ()=>{ if(i!==pora || !v.duration) return;
  if(v.currentTime > v.duration-0.4 && performance.now()-poraRecznie>15000 && !v._prz){ v._prz=1; zmienPore((pora+1)%4, 88, 12); setTimeout(()=>v._prz=0, 1500); } }));
new IntersectionObserver(es=>es.forEach(e=>{ const v=pv[pora]; if(e.isIntersecting){ if(!v.src&&v.dataset.src) v.src=v.dataset.src; v.play().catch(()=>{}); } else pv.forEach(x=>x.pause()); })).observe(okno);
// koło roku: 32 dni, znacznik biegnie razem z nagraniem
(function(){
  const k=$('#poryKolo'), R=48, C=2*Math.PI*R;
  k.innerHTML = `<svg viewBox="-60 -60 120 120"><circle r="56" fill="rgba(10,8,17,.72)" stroke="rgba(255,200,140,.25)"/>`+
    PORY.map((p,i)=>`<circle r="${R}" fill="none" stroke="${p.kol}" stroke-width="7" stroke-dasharray="${C/4-3} ${C}" stroke-dashoffset="${-C/4*i}" transform="rotate(-90)" opacity=".85"/>`).join('')+
    `<g id="kolZn"><circle cx="0" cy="${-R}" r="7" fill="#fff" stroke="#1a1020" stroke-width="2"/></g><text id="kolDz" y="-2" text-anchor="middle" fill="#fff" font-size="20" font-weight="800" font-family="Inter,system-ui"></text><text id="kolPod" y="16" text-anchor="middle" fill="#c9bba3" font-size="9.5" font-weight="700" letter-spacing="1.5" font-family="Inter,system-ui"></text></svg>`;
  const zn=k.querySelector('#kolZn'), dz=k.querySelector('#kolDz'), pod=k.querySelector('#kolPod');
  (function f(){ const v=pv[pora], u=v.duration? Math.min(0.999,(v.currentTime||0)/v.duration) : 0, rok=(pora+u)/4;
    zn.setAttribute('transform',`rotate(${rok*360})`); dz.textContent=Math.floor(rok*32)+1; pod.textContent=T({pl:'DZIEŃ / 32',en:'DAY / 32'}); requestAnimationFrame(f); })();
})();
EH.naJezyk(rysujPory);
// cząsteczki pór roku
(function(){
  const cv=$('#poryCz'), c=cv.getContext('2d'); let w,h; const P=[];
  const rs=()=>{ const r=cv.getBoundingClientRect(); w=cv.width=r.width*1; h=cv.height=r.height*1; }; rs(); addEventListener('resize',rs);
  function nowa(){ const id=PORY[pora].id;
    return {x:Math.random()*w, y:-10, vx:(Math.random()-.5)*0.6, vy:0.4+Math.random()*1.2, r:id==='zima'?1+Math.random()*2.6:2+Math.random()*3, a:Math.random()*6.28, id}; }
  (function f(){
    c.clearRect(0,0,w,h);
    if(!RM && P.length<(PORY[pora].id==='lato'?40:140)) P.push(nowa());
    for(let i=P.length-1;i>=0;i--){ const p=P[i]; p.a+=0.03; p.x+=p.vx+Math.sin(p.a)*0.6; p.y+=p.vy*(p.id==='lato'?0.25:1);
      if(p.y>h+10 || p.id!==PORY[pora].id && Math.random()<0.05){ P.splice(i,1); continue; }
      c.save(); c.translate(p.x,p.y); c.rotate(p.a);
      if(p.id==='zima'){ c.fillStyle='rgba(255,255,255,.85)'; c.beginPath(); c.arc(0,0,p.r,0,6.28); c.fill(); }
      else if(p.id==='jesien'){ c.fillStyle=['#e0782f','#c9551f','#f0a43a'][i%3]; c.beginPath(); c.ellipse(0,0,p.r*1.6,p.r*0.8,0,0,6.28); c.fill(); }
      else if(p.id==='wiosna'){ c.fillStyle='rgba(255,190,220,.9)'; c.beginPath(); c.ellipse(0,0,p.r*1.2,p.r*0.7,0,0,6.28); c.fill(); }
      else { c.fillStyle='rgba(255,240,170,'+(0.3+0.3*Math.sin(p.a*3))+')'; c.beginPath(); c.arc(0,0,p.r*0.7,0,6.28); c.fill(); }
      c.restore(); }
    requestAnimationFrame(f);
  })();
})();

// ═══ PETY ═══
const UM=window.EH_UM, PETY=window.EH_PETY;
const gwMax = p => Math.max(...Object.keys(p.g).map(Number));
const etap = (p,gw)=>{ let g=Math.min(gw,gwMax(p)); while(g>1 && p.g[g]==null) g--; return p.g[g]!=null?g:+Object.keys(p.g)[0]; };
let filtr='*', lista=PETY.slice(), wybrany=PETY.find(p=>p.id==='smok'), gw=1, katKar=0, celKat=0;
const pier=$('#pierscien'), kar=$('#karuzela');
function rysujFiltry(){
  $('#filtryRang').innerHTML = [['*',{pl:'Wszystkie',en:'All'}],...Object.entries(RANGI).map(([r,d])=>[r,d.n])].map(([r,n])=>
    `<button data-r="${r}" class="${filtr===r?'akt':''}">${r!=='*'?`<b style="background:${RANGI[r].kol}"></b>`:''}${T(n)}</button>`).join('');
}
function budujKaruzele(){
  lista = PETY.filter(p=>filtr==='*'||p.r===filtr);
  pier.innerHTML='';
  const N=lista.length, R=Math.max(300, Math.min(760, N*26)) * (innerWidth<700?0.55:1);
  pier._R=R;
  lista.forEach((p,i)=>{
    const g=gwMax(p);
    const el=document.createElement('button'); el.className='kar-el'; el.dataset.i=i; el.setAttribute('aria-label',T(p.n));
    el.innerHTML=`<div class="cien"></div><div class="spr"></div><span class="ran" style="background:${RANGI[p.r].kol}">${p.r}</span>`; el._ran=el.querySelector('.ran');
    const s=el.querySelector('.spr'); EH.pet(s, p, g, innerWidth<700?92:126);
    s.style.left='50%'; s.style.top='auto'; s.style.bottom='10px'; s.style.marginLeft=(-parseFloat(s.style.width)/2)+'px';
    el._kat = i/N*360;
    el.addEventListener('click', ()=>{ if(przeciaganie>6) return; wybierz(p); doKata(-el._kat); });
    pier.appendChild(el);
  });
  celKat = katKar = -(lista.indexOf(wybrany)>=0 ? lista.indexOf(wybrany)/N*360 : 0);
}
function ustawKaruzele(){
  const R=pier._R||400; let naj=null, nz=-2;
  for(const el of pier.children){
    const a=(el._kat+katKar)*Math.PI/180, z=Math.cos(a);
    el.style.transform=`rotateY(${el._kat}deg) translateZ(${R}px) rotateY(${-el._kat-katKar}deg)`;
    const q=(z+1)/2;
    el.style.filter=`brightness(${0.25+0.75*q*q}) saturate(${0.5+0.5*q})`;
    el.style.zIndex = Math.round(q*200);
    el.style.opacity = 0.35+0.65*q;
    el._ran.style.opacity = 0; if(z>nz){ nz=z; naj=el; }
  }
  if(naj) naj._ran.style.opacity=1;
  pier.style.transform=`translateZ(${-R*0.85}px) rotateX(-13deg) rotateY(${katKar}deg)`;
}
const doKata=a=>{ celKat += ((((a-celKat)%360)+540)%360)-180; };
let przeciaganie=0, sX=0, sKat=0, wDol=false, ostRuch=performance.now();
kar.addEventListener('pointerdown', e=>{ wDol=true; przeciaganie=0; sX=e.clientX; sKat=celKat; ostRuch=performance.now(); });
addEventListener('pointermove', e=>{ if(!wDol) return; const dx=e.clientX-sX; przeciaganie=Math.abs(dx); celKat=sKat+dx*0.35; ostRuch=performance.now(); });
addEventListener('pointerup', ()=>{ if(!wDol) return; wDol=false; if(przeciaganie>6){ const st=360/lista.length; celKat=Math.round(celKat/st)*st; najblizszy(); } });
function najblizszy(){ const st=360/lista.length, i=((Math.round(-celKat/st)%lista.length)+lista.length)%lista.length; wybierz(lista[i]); }
$('#karLewo').onclick=()=>{ celKat+=360/lista.length; najblizszy(); ostRuch=performance.now(); };
$('#karPrawo').onclick=()=>{ celKat-=360/lista.length; najblizszy(); ostRuch=performance.now(); };
$('#filtryRang').addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; filtr=b.dataset.r; rysujFiltry(); budujKaruzele(); wybierz(lista[0]); });
(function obrot(){
  // powolny samoobrót, gdy nikt nie dotyka
  if(!wDol && performance.now()-ostRuch>6000 && !RM){ celKat-=0.05; }
  katKar += (celKat-katKar)*0.09; ustawKaruzele(); requestAnimationFrame(obrot);
})();
function wybierz(p, bezPop){
  if(!p) return; const zm = p!==wybrany; wybrany=p; if(zm) gw=1; rysujPeta(!bezPop && zm);
}
function rysujPeta(pop){
  const p=wybrany, g=etap(p,gw), R=RANGI[p.r];
  const d=$('#petDuzy'); EH.pet(d, p, g, innerWidth<700?170:230);
  if(pop){ d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); }
  const mx=gwMax(p);
  $('#petGwiazdy').innerHTML=[1,2,3,4,5].map(s=>`<button data-s="${s}" class="${s<=gw?'wl':''}" ${s>mx?'disabled':''} aria-label="${s}★">★</button>`).join('');
  const atk = R.atk*(1+0.15*(gw-1));
  $('#petInfo').innerHTML = `
    <span class="ranga" style="background:${R.kol}22;color:${R.kol};border:1px solid ${R.kol}55">${p.r} · ${T(R.n)}</span>
    <h3>${T(p.n)}</h3>
    <div class="moc">⚔️ ${T({pl:'Siła ataku',en:'Attack power'})}: <b style="color:var(--tekst)">${atk.toFixed(1)}</b> · ★${gw}/${mx}${p.lata?' · 🪽 '+T({pl:'lata',en:'flies'}):''}</div>
    ${p.um.map(k=>{ const u=UM[k]; return `<div class="um"><div class="ik" style="background:${u.kol}22;border:1px solid ${u.kol}55">${u.ik}</div><div><b>${T(u.n)}<em>⏱ ${u.cd}s</em></b><span>${T(u.d)}</span></div></div>`; }).join('')}
    <p style="color:var(--tekst3);font-size:14px;margin:16px 0 0">${T({pl:'Połącz dwa pety tego samego gatunku, a zostanie jeden, o gwiazdkę silniejszy. Wygląd zmienia się z kolejnymi gwiazdkami.',en:'Merge two pets of the same species to get one that is a star stronger. Its look changes as it gains stars.'})}</p>`;
}
$('#petGwiazdy').addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b||b.disabled) return; const s=+b.dataset.s; if(s!==gw){ const st=etap(wybrany,gw); gw=s; rysujPeta(etap(wybrany,gw)!==st); dzwiek('trzask'); } });
EH.naJezyk(()=>{ rysujFiltry(); budujKaruzele(); rysujPeta(false); });

// ═══ WYLĘGARNIA ═══
const JAJA=[
  {id:'zwykle', n:{pl:'Zwykłe',en:'Common'}, czas:{pl:'15 min',en:'15 min'}, sz:{C:70,B:27,A:3}},
  {id:'srebrne', n:{pl:'Srebrne',en:'Silver'}, czas:{pl:'1 godz.',en:'1 h'}, sz:{B:70,A:29.5,S:0.5}},
  {id:'zlote', n:{pl:'Złote',en:'Golden'}, czas:{pl:'3 godz.',en:'3 h'}, sz:{B:30,A:67,S:3}},
  {id:'smocze', n:{pl:'Smocze',en:'Dragon'}, czas:{pl:'6 godz.',en:'6 h'}, sz:{B:25,A:60,S:15}},
];
let jajo=1; const statW={n:0,C:0,B:0,A:0,S:0};
function rysujJaja(zmiana){
  $('#jaja').innerHTML = JAJA.map((j,i)=>`<button class="jajo-wyb ${i===jajo?'akt':''}" data-i="${i}"><img src="img/jajo_${j.id}.webp" alt="" loading="lazy"><span>${T(j.n)}</span><small>⏳ ${T(j.czas)}</small></button>`).join('');
  const sz=JAJA[jajo].sz;
  $('#szanse').innerHTML = ['C','B','A','S'].map(r=>`<div class="szansa"><span style="color:${RANGI[r].kol};font-weight:700">${r} · ${T(RANGI[r].n)}</span><div class="tor"><b style="width:${sz[r]||0}%;background:${RANGI[r].kol}"></b></div><span class="pr">${(sz[r]||0).toString().replace('.',EH.lang()==='pl'?',':'.')}%</span></div>`).join('');
  $('#licznik').innerHTML = statW.n ? `<span>${T({pl:'Wyklute',en:'Hatched'})}: <b>${statW.n}</b></span>`+['C','B','A','S'].map(r=>`<span style="color:${RANGI[r].kol}">${r}: <b>${statW[r]}</b></span>`).join('') : '';
  if(zmiana) ink.ustawJajo(JAJA[jajo].id);
}
$('#jaja').addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return; jajo=+b.dataset.i; rysujJaja(true); });
function losuj(){
  const sz=JAJA[jajo].sz; let x=Math.random()*100, r='B';
  for(const k of ['C','B','A','S']){ if(!sz[k]) continue; if(x<sz[k]){ r=k; break; } x-=sz[k]; r=k; }
  const pula=PETY.filter(p=>p.r===r && p.egg); return pula[Math.floor(Math.random()*pula.length)];
}
// inkubator na płótnie: jajo drży, pęka, błysk, wylatuje pet
const ink=(function(){
  const cv=$('#inkCv'), c=cv.getContext('2d'); let W,H,D=Math.min(2,devicePixelRatio||1);
  const rs=()=>{ const r=cv.getBoundingClientRect(); W=r.width; H=r.height; cv.width=W*D; cv.height=H*D; }; rs(); addEventListener('resize',rs);
  const obr={}, inkO=new Image(); inkO.src='img/inkubator_4.webp';
  JAJA.forEach(j=>{ const im=new Image(); im.src=`img/jajo_${j.id}.webp`; obr[j.id]=im; });
  let stan='spoczynek', t=0, jid='srebrne', pet=null, petIm=null, petKl=null, cz=[];
  function start(p){ if(stan==='drzy'||stan==='blysk') return false; pet=p; stan='drzy'; t=0; cz=[];
    const g0=etap(p,1); petKl=[p.s[0],p.s[1],p.s[2],p.g[g0]]; petIm=new Image(); petIm.src=`pety/${p.id}.webp`;
    $('#inkWynik').classList.remove('jest'); return true; }
  function f(){
    t+=1/60; c.setTransform(D,0,0,D,0,0); c.clearRect(0,0,W,H);
    const cx=W/2, cy=H*0.5;
    // poświata
    const kol = pet && stan!=='drzy' ? RANGI[pet.r].kol : '#ff9a3c';
    const g=c.createRadialGradient(cx,cy,10,cx,cy,W*0.5); g.addColorStop(0,kol+'55'); g.addColorStop(1,'transparent'); c.fillStyle=g; c.fillRect(0,0,W,H);
    if(inkO.complete && inkO.naturalWidth){ const w=W*0.92, h=w*inkO.naturalHeight/inkO.naturalWidth; c.globalAlpha=0.95; c.drawImage(inkO,cx-w/2,cy-h*0.42,w,h); c.globalAlpha=1; }
    const im=obr[jid];
    if(stan==='spoczynek' || stan==='drzy'){
      const sila = stan==='drzy' ? Math.min(1,t/1.6) : 0;
      const kat = stan==='drzy' ? Math.sin(t*(18+sila*30))*0.12*sila : Math.sin(t*1.5)*0.03;
      const dy = Math.sin(t*2)*4;
      if(im.complete && im.naturalWidth){ const w=W*0.34, h=w*im.naturalHeight/im.naturalWidth;
        c.save(); c.translate(cx, cy+h*0.1+dy); c.rotate(kat); c.drawImage(im,-w/2,-h*0.9,w,h);
        if(stan==='drzy'){ c.strokeStyle='rgba(255,250,230,'+(0.4+sila*0.6)+')'; c.lineWidth=2.5; c.beginPath();
          const n=Math.floor(sila*7); let x=-w*0.22, y=-h*0.45; c.moveTo(x,y); for(let i=0;i<n;i++){ x+=w*0.07; y+=(i%2?-1:1)*h*0.05; c.lineTo(x,y); } c.stroke();
          c.fillStyle=`rgba(255,240,200,${sila*0.5})`; c.globalCompositeOperation='lighter'; c.beginPath(); c.ellipse(0,-h*0.45,w*0.6*sila,h*0.6*sila,0,0,6.28); c.fill(); }
        c.restore(); }
      if(stan==='drzy' && Math.random()<0.25+sila*0.4) cz.push({x:cx+(Math.random()-.5)*W*0.2, y:cy, vx:(Math.random()-.5)*2, vy:-1-Math.random()*2, z:0, k:'#ffe0a0'});
      if(stan==='drzy' && t>1.8){ stan='blysk'; t=0; dzwiek('wyklucie');
        for(let i=0;i<90;i++){ const a=Math.random()*6.28, v=2+Math.random()*7; cz.push({x:cx,y:cy-20,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,z:0,k:Math.random()<.5?kol:'#ffffff'}); } }
    }
    if(stan==='blysk' || stan==='wynik'){
      const e=Math.min(1,t/0.6);
      if(stan==='blysk' && t<0.5){ c.fillStyle=`rgba(255,255,255,${(1-t/0.5)*0.9})`; c.fillRect(0,0,W,H); }
      // promienie
      c.save(); c.translate(cx,cy-20); c.rotate(t*0.35); c.globalCompositeOperation='lighter';
      for(let i=0;i<14;i++){ c.rotate(Math.PI*2/14); c.fillStyle=kol+'22'; c.beginPath(); c.moveTo(0,0); c.lineTo(W*0.6, -18); c.lineTo(W*0.6, 18); c.fill(); }
      c.restore(); c.save(); c.translate(cx,cy-20); c.rotate(t*0.3); c.restore();
      if(petIm && petIm.complete && petIm.naturalWidth){ const [fw,fh,n,row]=petKl; const fr=Math.floor(t*9)%n, s=Math.min(W*0.5/fw, H*0.42/fh)*(0.4+0.6*(1-Math.pow(1-e,3)));
        c.imageSmoothingEnabled=false; c.drawImage(petIm, fr*fw,row*fh,fw,fh, cx-fw*s/2, cy-fh*s*0.98+Math.sin(t*3)*5, fw*s, fh*s); }
      if(stan==='wynik' && Math.random()<0.35){ const a=Math.random()*6.28, r=W*(0.12+Math.random()*0.2); cz.push({x:cx+Math.cos(a)*r, y:cy-30+Math.sin(a)*r*0.7, vx:0, vy:-0.4, z:0.6, k:Math.random()<.5?kol:'#ffffff'}); }
      if(stan==='blysk' && t>0.35){ stan='wynik'; const R=RANGI[pet.r];
        $('#inkWynik').innerHTML=`<span class="ranga" style="background:${R.kol};color:#140a00">${pet.r} · ${T(R.n)}</span><b>${T(pet.n)}</b>`; $('#inkWynik').classList.add('jest'); }
    }
    c.globalCompositeOperation='lighter';
    for(let i=cz.length-1;i>=0;i--){ const p=cz[i]; p.z+=1/60; p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.vx*=0.98; if(p.z>1.4){ cz.splice(i,1); continue; }
      c.fillStyle=p.k; c.globalAlpha=1-p.z/1.4; c.beginPath(); c.arc(p.x,p.y,2.2,0,6.28); c.fill(); }
    c.globalAlpha=1; c.globalCompositeOperation='source-over';
    requestAnimationFrame(f);
  }
  f();
  return { start, ustawJajo:id=>{ if(stan==='spoczynek'||stan==='wynik'){ jid=id; if(stan==='wynik'){ stan='spoczynek'; $('#inkWynik').classList.remove('jest'); } } }, stan:()=>stan };
})();
$('#wyklujBtn').addEventListener('click', ()=>{
  const p=losuj(); if(!p) return;
  if(ink.stan()==='wynik'){ ink.ustawJajo(JAJA[jajo].id); }
  if(ink.start(p)){ dzwiek('trzask'); statW.n++; statW[p.r]++; setTimeout(()=>{ rysujJaja(); if(filtr!=='*' && filtr!==p.r){ filtr='*'; rysujFiltry(); budujKaruzele(); } const i=lista.indexOf(p); if(i>=0){ doKata(-i/lista.length*360); ostRuch=performance.now(); } wybierz(p); }, 2300); }
});
EH.naJezyk(()=>rysujJaja(false)); ink.ustawJajo(JAJA[jajo].id);

// ═══ KUŹNIA ═══
const RAR={null:{m:1,kol:'#dcedc8',n:{pl:'Zwykły',en:'Common'},k:1}, uni:{m:1.3,kol:'#ffd54f',n:{pl:'Unikatowy',en:'Unique'},k:1.5}, her:{m:1.7,kol:'#42a5f5',n:{pl:'Heroiczny',en:'Heroic'},k:2.0}, leg:{m:2.3,kol:'#ba68c8',n:{pl:'Legendarny',en:'Legendary'},k:2.6}};
const BASE5={weapon:{sila:29,wytrz:5}, armor:{wytrz:31,sila:5}, helmet:{wytrz:22,sila:4}, amulet:{obrona:26,praca:9}, ring:{praca:22,sila:8}};
const ST={sila:{pl:'Siła',en:'Power'}, wytrz:{pl:'Wytrzymałość',en:'Endurance'}, praca:{pl:'Praca',en:'Work'}, obrona:{pl:'Obrona',en:'Defence'}};
const PRZ=[
  {img:'w2', rar:null, st:{sila:16}, n:{pl:'Miecz',en:'Sword'}},
  {img:'weapon_uni', rar:'uni', slot:'weapon', n:{pl:'Kieł Watahy',en:'Pack Fang'}},
  {img:'weapon_her', rar:'her', slot:'weapon', n:{pl:'Ostrze Zorzy',en:'Blade of Dawn'}},
  {img:'weapon_leg', rar:'leg', slot:'weapon', n:{pl:'Grom Prastarych',en:'Thunder of the Ancients'}},
  {img:'armor_leg', rar:'leg', slot:'armor', n:{pl:'Egida Wieków',en:'Aegis of Ages'}},
  {img:'helmet_leg', rar:'leg', slot:'helmet', n:{pl:'Diadem Królów',en:'Diadem of Kings'}},
  {img:'amulet_leg', rar:'leg', slot:'amulet', n:{pl:'Łza Gwiazdy',en:'Star Tear'}},
  {img:'ring_leg', rar:'leg', slot:'ring', n:{pl:'Pierścień Pradawnych',en:'Ring of the Ancients'}},
];
PRZ.forEach(p=>{ if(!p.st){ p.st={}; for(const k in BASE5[p.slot]) p.st[k]=Math.round(BASE5[p.slot][k]*RAR[p.rar].m); } p.plus=0; });
let pI=3, pozK=5;
const kzKoszt = p=>{ const m=RAR[p.rar].k, pl=p.plus; return {stone:Math.round(50*Math.pow(1.22,pl)*m), gold:Math.round(35*Math.pow(1.45,pl)*m), science:Math.round(9*Math.pow(1.30,pl)*m)}; };
const limit = ()=> Math.min(9, Math.max(2, pozK*2));
function rysujKuznie(kom){
  const p=PRZ[pI], R=RAR[p.rar], lim=limit();
  $('#kzWybor').innerHTML = PRZ.map((q,i)=>`<button class="${i===pI?'akt':''}" data-i="${i}" style="--rk:${RAR[q.rar].kol}" aria-label="${T(q.n)}" title="${T(q.n)}"><img src="img/items/${q.img}.webp" alt=""></button>`).join('');
  $('#kzPoziomy').innerHTML = [1,2,3,4,5].map(l=>`<button class="${l===pozK?'akt':''}" data-l="${l}">${l}</button>`).join('');
  $('#kzTory').innerHTML = Array.from({length:9},(_,i)=>`<i class="${i<p.plus?'wl':i>=lim?'blok':''}"></i>`).join('');
  const m=1+0.15*p.plus;
  $('#kzStaty').innerHTML = `<div class="stat" style="grid-column:1/-1"><small>${T(R.n)}</small><b style="color:${R.kol};font-family:var(--f-tyt)">${T(p.n)}${p.plus?' +'+p.plus:''}</b></div>`+
    Object.entries(p.st).map(([k,v])=>`<div class="stat"><small>${T(ST[k])}</small><b>${Math.round(v*m)}${p.plus?`<em>+${Math.round(v*m)-v}</em>`:''}</b></div>`).join('');
  const k=kzKoszt(p);
  $('#kzKoszt').innerHTML = p.plus>=9 ? `<span style="color:var(--zloto)">✨ ${T({pl:'Maksymalne ulepszenie',en:'Fully upgraded'})}</span>` :
    `<span>${T({pl:'Koszt',en:'Cost'})}:</span><span>🪨 <b>${k.stone}</b></span><span>🪙 <b>${k.gold}</b></span><span>🔬 <b>${k.science}</b></span>`;
  const pl=$('#kzPlus'); pl.textContent='+'+p.plus; pl.classList.toggle('max', p.plus>=9); pl.style.setProperty('--pos', R.kol);
  const img=$('#kzImg'); if(!img.src.endsWith(p.img+'.webp')) img.src=`img/items/${p.img}.webp`;
  img.style.filter = p.plus>=9 ? `drop-shadow(0 0 18px ${R.kol}) drop-shadow(0 0 40px ${R.kol}) drop-shadow(0 20px 26px rgba(0,0,0,.7))` : `drop-shadow(0 0 ${p.plus*2}px rgba(255,170,80,.7)) drop-shadow(0 20px 26px rgba(0,0,0,.7))`;
  $('#kzKom').innerHTML = kom||'';
}
$('#kzWybor').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b){ pI=+b.dataset.i; rysujKuznie(); } });
$('#kzPoziomy').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b){ pozK=+b.dataset.l; rysujKuznie(); } });
$('#kzReset').addEventListener('click', ()=>{ PRZ.forEach(p=>p.plus=0); rysujKuznie(); });
$('#kzUlepsz').addEventListener('click', ()=>{
  const p=PRZ[pI];
  if(p.plus>=9) return rysujKuznie(T({pl:'Ten przedmiot osiągnął już +9.',en:'This item is already +9.'}));
  if(p.plus>=limit()) return rysujKuznie(T({pl:`Kuźnia poziomu ${pozK} ulepsza tylko do +${limit()}. Rozbuduj kuźnię, aby iść dalej.`,en:`A level ${pozK} forge only upgrades to +${limit()}. Upgrade the forge to go further.`}));
  p.plus++; dzwiek('kowadlo'); iskry(p.plus>=9?160:60, RAR[p.rar].kol);
  const img=$('#kzImg'); img.classList.remove('uderz'); void img.offsetWidth; img.classList.add('uderz');
  rysujKuznie(p.plus>=9 ? T({pl:'✨ Kowal doskonały! Przedmiot +9 świeci barwą swojej klasy.',en:'✨ Master smith! A +9 item glows in the colour of its class.'}) : T({pl:`${T(p.n)} +${p.plus} — wykute!`,en:`${T(p.n)} +${p.plus} — forged!`}));
});
const iskry=(function(){
  const cv=$('#kzCv'), c=cv.getContext('2d'); let W,H; const P=[], D=Math.min(2,devicePixelRatio||1);
  const rs=()=>{ const r=cv.getBoundingClientRect(); W=r.width; H=r.height; cv.width=W*D; cv.height=H*D; }; rs(); addEventListener('resize',rs);
  (function f(){ c.setTransform(D,0,0,D,0,0); c.clearRect(0,0,W,H); c.globalCompositeOperation='lighter';
    if(!RM && Math.random()<0.3) P.push({x:W/2+(Math.random()-.5)*W*0.3, y:H*0.72, vx:(Math.random()-.5)*0.6, vy:-0.4-Math.random()*1.2, z:0, zm:2+Math.random()*2, k:'#ff9a3c', r:1.6});
    for(let i=P.length-1;i>=0;i--){ const p=P[i]; p.z+=1/60; if(p.z>p.zm){ P.splice(i,1); continue; } p.x+=p.vx; p.y+=p.vy; p.vy+=p.g||0; p.vx*=0.985;
      const a=1-p.z/p.zm; c.strokeStyle=p.k; c.globalAlpha=a; c.lineWidth=p.r; c.beginPath(); c.moveTo(p.x,p.y); c.lineTo(p.x-p.vx*3,p.y-p.vy*3); c.stroke(); }
    c.globalAlpha=1; requestAnimationFrame(f); })();
  return (n,kol)=>{ for(let i=0;i<n;i++){ const a=-Math.PI/2+(Math.random()-.5)*2.6, v=3+Math.random()*9; P.push({x:W/2,y:H*0.5,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:0.22,z:0,zm:0.6+Math.random()*0.9,k:Math.random()<0.6?'#ffcf7a':kol,r:1.4+Math.random()*1.6}); } };
})();
EH.naJezyk(()=>rysujKuznie());

// ═══ BOSSOWIE ═══
const BOSS=[
  ['krolszczur',{pl:'Król Szczurów',en:'Rat King'},420,218,208],['rzeznik',{pl:'Rzeźnik',en:'Butcher'},600,152,180],['krolowa',{pl:'Królowa Pająków',en:'Spider Queen'},700,168,153],
  ['pankosci',{pl:'Pan Kości',en:'Bone Lord'},950,174,218],['ork',{pl:'Wódz Orków',en:'Orc Chieftain'},1250,231,248],['klucznik',{pl:'Klucznik',en:'Keymaster'},1500,262,245],
  ['zniwiarz',{pl:'Żniwiarz',en:'Reaper'},1750,222,220],['demon',{pl:'Władca Demonów',en:'Demon Lord'},2100,256,253],['pustykrol',{pl:'Bezgłowy Król',en:'Headless King'},2600,142,147],
];
function rysujBossow(){
  const rz=$('#bossRzad'); rz.innerHTML='';
  rz.style.gridTemplateColumns='';
  BOSS.forEach(([id,n,hp,fw,fh],i)=>{ const d=document.createElement('div'); d.className='boss wej'; d.style.setProperty('--d',(i*0.06)+'s');
    d.innerHTML=`<div class="spr pix" style="margin:0 auto 12px;filter:drop-shadow(0 0 22px rgba(130,90,255,.55))"></div><b>${T(n)}</b><small>❤️ ${hp} HP</small>`;
    EH.pasek(d.querySelector('.spr'), `img/boss_${id}.webp`, 6, fw, fh, innerWidth<700?110:130, 7); rz.appendChild(d); });
  const d=document.createElement('div'); d.className='boss wej';
  d.innerHTML=`<div class="spr" style="margin:0 auto 12px;filter:brightness(0) drop-shadow(0 0 16px rgba(255,60,40,.8))"></div><b>???</b><small>❤️ 3200 HP</small>`;
  EH.pasek(d.querySelector('.spr'), 'img/boss_smok.webp', 6, 300, 323, innerWidth<700?110:130, 5); rz.appendChild(d);
  EH.obserwuj(rz);
}
EH.naJezyk(rysujBossow);
$('#bossRzad').style.gridTemplateColumns='';
// 10 kafelków: 5 w rzędzie na dużym ekranie

// ═══ NAGRODA 3D ═══
const nag=$('#nagroda3d'), nob=$('#nagrodaObrot'); let nx=0, ny=0, ntx=0, nty=0;
nag.addEventListener('pointermove', e=>{ const r=nag.getBoundingClientRect(); ntx=(e.clientX-r.left)/r.width-0.5; nty=(e.clientY-r.top)/r.height-0.5; });
nag.addEventListener('pointerleave', ()=>{ ntx=0; nty=0; });
(function f(t){ const a=t/1000; nx+=(ntx+Math.sin(a*0.7)*0.12-nx)*0.08; ny+=(nty+Math.cos(a*0.5)*0.08-ny)*0.08;
  nob.style.transform=`rotateY(${nx*34}deg) rotateX(${-ny*26}deg)`; requestAnimationFrame(f); })(0);
})();
