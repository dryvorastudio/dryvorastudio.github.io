// Wspólne dla obu stron: język, nawigacja, pojawianie się, karty 3D, wideo na żądanie.
(function(){
const H = document.documentElement;
window.EH = window.EH || {};
EH.lang = ()=> H.lang==='en' ? 'en' : 'pl';
EH.t = o => (o && typeof o==='object') ? (o[EH.lang()] ?? o.pl) : o;
const sluchacze = [];
EH.naJezyk = f => sluchacze.push(f);

// ── przełącznik języka ──
const jz = document.getElementById('jezyk');
function ustawJezyk(l, zapisz){
  H.lang = l; if(jz) jz.dataset.l = l;
  jz && jz.querySelectorAll('button').forEach(b=>b.classList.toggle('akt', b.dataset.l===l));
  document.title = H.dataset['tytul'+l.toUpperCase()] || document.title;
  if(zapisz) try{ localStorage.setItem('eh_lang', l); }catch(e){}
  sluchacze.forEach(f=>{ try{ f(l); }catch(e){ console.error(e); } });
}
jz && jz.addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) ustawJezyk(b.dataset.l, true); });
document.addEventListener('DOMContentLoaded', ()=>ustawJezyk(EH.lang(), false));

// ── nawigacja ──
const nav = document.getElementById('nav');
const tloNav = ()=> nav && nav.classList.toggle('tlo', scrollY > 40);
addEventListener('scroll', tloNav, {passive:true}); tloNav();
const bg = document.getElementById('burger');
bg && bg.addEventListener('click', ()=> document.body.classList.toggle('menu-otw'));
document.querySelectorAll('.nav-linki a').forEach(a=>a.addEventListener('click', ()=>document.body.classList.remove('menu-otw')));

// ── pojawianie się przy przewijaniu ──
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('jest'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px', threshold:0.08});
EH.obserwuj = root => (root||document).querySelectorAll('.wej:not(.jest)').forEach(el=>io.observe(el));
document.addEventListener('DOMContentLoaded', ()=>EH.obserwuj());

// ── wideo: mp4 (H.264), a gdy przeglądarka go nie zna — webm (VP9) ──
const MP4 = !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"');
EH.klip = u => (!MP4 && /klipy\/(?!zwiastun)[^/]+\.mp4$/.test(u)) ? u.replace(/\.mp4$/,'.webm') : u;
document.querySelectorAll('video').forEach(v=>{ if(v.dataset.src) v.dataset.src=EH.klip(v.dataset.src); const a=v.getAttribute('src'); if(a){ const b=EH.klip(a); if(b!==a){ v.src=b; } } });
// ── wideo: ładuj i odtwarzaj tylko na ekranie ──
const iov = new IntersectionObserver(es=>es.forEach(e=>{
  const v=e.target;
  if(e.isIntersecting){ if(v.dataset.src && !v.src){ v.src=v.dataset.src; } v.play && v.play().catch(()=>{}); }
  else v.pause && v.pause();
}), {rootMargin:'200px 0px'});
EH.wideo = root => (root||document).querySelectorAll('video[data-src]:not([data-reczne]), video[autoplay]').forEach(v=>{ if(!v.closest('#ekran') && !v.closest('#modal') && !v.closest('#poryOkno')) iov.observe(v); });
document.addEventListener('DOMContentLoaded', ()=>EH.wideo());

// ── karty: światło pod kursorem + lekki przechył 3D ──
const DOTYK = matchMedia('(hover:none)').matches;
document.addEventListener('pointermove', e=>{
  const k = e.target.closest && e.target.closest('.karta, .budynek, .boss');
  if(!k || DOTYK) return;
  const r = k.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
  k.style.setProperty('--mx', (x*100)+'%'); k.style.setProperty('--my', (y*100)+'%');
  k.style.transform = `perspective(900px) rotateX(${(0.5-y)*6}deg) rotateY(${(x-0.5)*8}deg) translateY(-4px)`;
});
document.addEventListener('pointerout', e=>{ const k=e.target.closest && e.target.closest('.karta, .budynek, .boss'); if(k && !k.contains(e.relatedTarget)) k.style.transform=''; });

// ── kursor-światło ──
const ku = document.getElementById('kursor');
if(ku && !DOTYK){ let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y;
  addEventListener('pointermove', e=>{ x=e.clientX; y=e.clientY; }, {passive:true});
  (function f(){ cx+=(x-cx)*0.12; cy+=(y-cy)*0.12; ku.style.transform=`translate(${cx}px,${cy}px)`; requestAnimationFrame(f); })(); }

const rok=document.getElementById('rok'); if(rok) rok.textContent = Math.max(2026, new Date().getFullYear());

// ── widoczność: pętle animacji działają tylko, gdy element jest na ekranie ──
EH.widac = el => { const o={v:false}; if(!el) return o; new IntersectionObserver(es=>es.forEach(e=>{ o.v=e.isIntersecting; }), {rootMargin:'100px'}).observe(el); return o; };
EH.mobil = matchMedia('(max-width:700px), (hover:none)').matches;
const ioPas = new IntersectionObserver(es=>es.forEach(e=>{ e.target._vis=e.isIntersecting; }), {rootMargin:'60px'});
// ── animowane paski klatek (pety, bossowie) ──
// el.dataset: src, n (klatek), fw, fh — rysowane przez background-position, jeden zegar dla wszystkich
const paski = new Set();
EH.pasek = (el, src, n, fw, fh, wys, fps, row, rows)=>{
  const k = wys/fh, w = Math.round(fw*k), h=Math.round(wys); row=row||0; rows=rows||1;
  el.style.width = w+'px'; el.style.height = h+'px';
  el.style.backgroundImage = `url(${src})`; el.style.backgroundSize = `${w*n}px ${h*rows}px`;
  el._n=n; el._w=w; el._y=-row*h; el._fps=fps||8; el._f=Math.floor(Math.random()*n); el.style.backgroundPosition=`${-el._f*w}px ${el._y}px`; if(!paski.has(el)){ paski.add(el); el._vis=true; ioPas.observe(el); } return el;
};
// pet: jeden arkusz na gatunek, wiersz = etap wyglądu (gwiazdka)
EH.pet = (el, p, g, wys)=>{ const [w,h,n,rows]=p.s; return EH.pasek(el, `pety/${p.id}.webp`, n, w, h, wys, 6, p.g[g], rows); };
EH.pasekStop = el => paski.delete(el);
let ostP=0;
(function tik(t){ const dt=Math.min(200,t-ostP); ostP=t;
  for(const el of paski){ if(!el.isConnected){ paski.delete(el); ioPas.unobserve(el); continue; } if(!el._vis || el._stop) continue;
    el._acc=(el._acc||0)+dt; const okres=1000/(el._fps||6);
    if(el._acc>=okres){ el._acc%=okres; el._f=(el._f+1)%el._n; el.style.backgroundPosition = `${-el._f*el._w}px ${el._y||0}px`; } }
  requestAnimationFrame(tik); })(0);
})();
