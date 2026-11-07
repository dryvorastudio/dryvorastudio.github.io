// ═══════════════════════════════════════════════════════════════
// EMBERHOLD — scena 3D w nagłówku (czysty WebGL2, bez bibliotek)
// Warstwy grafiki z gry ustawione w głębi → paralaksa za myszą i przy
// przewijaniu, żar z ogniska, świetliki, gwiazdy, mgła i latające pety.
// ═══════════════════════════════════════════════════════════════
(function(){
const cv = document.getElementById('scena');
if(!cv) return;
const gl = cv.getContext('webgl2', {premultipliedAlpha:true, antialias:false, alpha:false});
if(!gl){ document.documentElement.classList.add('bez-gl'); return; }
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── źródło: grafika ekranu ładowania 941×1672 ──
const SW = 941, SH = 1672;
const OGNISKO = {x:470, y:1262};
const WARSTWY = [
  {src:'img/L_sky.webp',   y0:0,    h:820, g:0.10},
  {src:'img/L_mid.webp',   y0:700,  h:450, g:0.38},
  {src:'img/L_front.webp', y0:1040, h:632, g:1.00},
];

// ── shadery ──
function sh(typ, src){ const s=gl.createShader(typ); gl.shaderSource(s,src); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; }
function prog(vs, fs){ const p=gl.createProgram(); gl.attachShader(p,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p);
  const u={}; const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS); for(let i=0;i<n;i++){ const a=gl.getActiveUniform(p,i); u[a.name]=gl.getUniformLocation(p,a.name); } return {p,u}; }

const VS_QUAD = `#version 300 es
in vec2 a; uniform vec4 uRect; uniform vec4 uUV; uniform vec2 uRes; out vec2 vUV; out vec2 vP;
void main(){ vec2 p = uRect.xy + a*uRect.zw; vP=p; vUV = mix(uUV.xy, uUV.zw, a);
  gl_Position = vec4(p/uRes*2.0-1.0, 0.0, 1.0); gl_Position.y *= -1.0; }`;
const FS_TEX = `#version 300 es
precision highp float; in vec2 vUV; uniform sampler2D uT; uniform float uA; uniform vec3 uMul; out vec4 o;
void main(){ vec4 c = texture(uT, vUV); o = vec4(c.rgb*uMul, c.a)*uA; }`;
// mgła: szum warstwowy przesuwany w czasie
const FS_MGLA = `#version 300 es
precision highp float; in vec2 vUV; uniform float uT; uniform float uA; uniform vec3 uKol; out vec4 o;
float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0.0, a=0.5; for(int i=0;i<5;i++){ s+=a*n(p); p*=2.03; a*=0.5; } return s; }
void main(){ vec2 p = vUV*vec2(5.0,1.6);
  float f = fbm(p + vec2(uT*0.035, 0.0)) * fbm(p*1.7 - vec2(uT*0.05, uT*0.01));
  float pas = smoothstep(0.0,0.35,vUV.y)*smoothstep(1.0,0.55,vUV.y);
  float a = clamp(f*1.9-0.25, 0.0, 1.0)*pas*uA; o = vec4(uKol*a, a); }`;
// światło: miękka poświata (addytywnie)
const FS_BLASK = `#version 300 es
precision highp float; in vec2 vUV; uniform vec3 uKol; uniform float uA; out vec4 o;
void main(){ float d = length(vUV-0.5)*2.0; float a = pow(max(0.0,1.0-d),2.2)*uA; o = vec4(uKol*a, 0.0); }`;
// winieta: przyciemnia boki poza oryginalną grafiką + lekko rogi
const FS_WIN = `#version 300 es
precision highp float; in vec2 vP; uniform vec2 uRes; uniform vec2 uArt; uniform float uZgas; out vec4 o;
void main(){ float x=vP.x, w=uRes.x;
  float poza = max(uArt.x - x, x - uArt.y); poza = max(poza,0.0);
  float boki = smoothstep(0.0, max(w*0.22, 120.0), poza)*0.78;
  vec2 q = vP/uRes - 0.5; float rog = smoothstep(0.35, 0.95, length(q*vec2(1.0,1.25)))*0.55;
  float g = smoothstep(0.55, 1.0, vP.y/uRes.y)*0.25;
  float a = clamp(max(boki, rog) + g, 0.0, 1.0); a = mix(a, 1.0, uZgas);
  o = vec4(vec3(0.035,0.028,0.06)*a, a); }`;
const VS_PT = `#version 300 es
in vec2 aP; in float aS; in vec4 aK; uniform vec2 uRes; out vec4 vK;
void main(){ gl_Position = vec4(aP/uRes*2.0-1.0, 0.0, 1.0); gl_Position.y*=-1.0; gl_PointSize = aS; vK = aK; }`;
const FS_PT = `#version 300 es
precision highp float; in vec4 vK; out vec4 o;
void main(){ vec2 c = gl_PointCoord-0.5; float d = length(c)*2.0;
  float a = pow(max(0.0,1.0-d), 1.8) + 0.9*pow(max(0.0,1.0-d*2.6),2.0); a*=vK.a; o = vec4(vK.rgb*a, 0.0); }`;

const P_TEX = prog(VS_QUAD, FS_TEX), P_MGLA = prog(VS_QUAD, FS_MGLA), P_BLASK = prog(VS_QUAD, FS_BLASK), P_WIN = prog(VS_QUAD, FS_WIN), P_PT = prog(VS_PT, FS_PT);

// geometria kwadratu
const vaoQ = gl.createVertexArray(); gl.bindVertexArray(vaoQ);
const bq = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bq); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),gl.STATIC_DRAW);
for(const P of [P_TEX,P_MGLA,P_BLASK,P_WIN]){ const l=gl.getAttribLocation(P.p,'a'); if(l>=0){ gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0); } }

// cząsteczki
const MAXP = 1400, PD = new Float32Array(MAXP*7);
const vaoP = gl.createVertexArray(); gl.bindVertexArray(vaoP);
const bp = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bp); gl.bufferData(gl.ARRAY_BUFFER,PD.byteLength,gl.DYNAMIC_DRAW);
{ const L=n=>gl.getAttribLocation(P_PT.p,n);
  gl.enableVertexAttribArray(L('aP')); gl.vertexAttribPointer(L('aP'),2,gl.FLOAT,false,28,0);
  gl.enableVertexAttribArray(L('aS')); gl.vertexAttribPointer(L('aS'),1,gl.FLOAT,false,28,8);
  gl.enableVertexAttribArray(L('aK')); gl.vertexAttribPointer(L('aK'),4,gl.FLOAT,false,28,12); }

// tekstury
function tex(src, lustro){ return new Promise(ok=>{ const im=new Image(); im.decoding='async'; im.onload=()=>{
  const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S, lustro?gl.MIRRORED_REPEAT:gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  ok({t,w:im.width,h:im.height}); }; im.onerror=()=>ok(null); im.src=src; }); }

// latające pety (widok z boku, 6 klatek, patrzą w lewo)
const LOTNICY = [
  {id:'feniks', ogon:[1,.55,.18]}, {id:'burzosmok', ogon:[.55,.75,1]}, {id:'gryf', ogon:null}, {id:'wezoskrzydly', ogon:[.4,.95,1]}];

let W=0,H=0,DPR=1, s=1, ox=0, oy=0, gotowe=false;
const mysz={x:0,y:0,tx:0,ty:0}; let przew=0, czas=0, ost=performance.now();

function rozmiar(){
  DPR = Math.min(2, window.devicePixelRatio||1) * (innerWidth<700 ? 0.85 : 1);
  const r = cv.getBoundingClientRect(); W=r.width; H=r.height;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  // widoczna wysokość źródła ok. 1180 px (niebo, góry, wioska) — boki dopełnia lustro i ciemność
  s = H/1180; if(W/s < 560) s = W/560;
  ox = W/2 - OGNISKO.x*s; oy = H - SH*s + H*(W>H ? 0.2 : 0.08);
}
addEventListener('resize', rozmiar);
addEventListener('pointermove', e=>{ mysz.tx = e.clientX/innerWidth*2-1; mysz.ty = e.clientY/innerHeight*2-1; }, {passive:true});
addEventListener('scroll', ()=>{ przew = Math.min(1, scrollY/Math.max(1,H)); }, {passive:true});

// mapowanie: punkt źródła → ekran dla warstwy o głębi g
function mapuj(x,y,g){
  const fx = W/2, fy = oy + OGNISKO.y*s;
  const zoom = 1 + przew*0.55*g;
  const px = mysz.x*28*g + Math.sin(czas*0.15)*6*g, py = mysz.y*16*g - przew*H*0.12*(1-g);
  return [fx + (ox + x*s - fx)*zoom + px, fy + (oy + y*s - fy)*zoom + py, s*zoom];
}

function quad(P, rect, uv){
  gl.useProgram(P.p); gl.bindVertexArray(vaoQ);
  gl.uniform2f(P.u.uRes, W, H); gl.uniform4f(P.u.uRect, rect[0],rect[1],rect[2],rect[3]);
  gl.uniform4f(P.u.uUV, uv[0],uv[1],uv[2],uv[3]);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
function warstwa(L){
  if(!L.tx) return;
  const [x0,y0,k] = mapuj(0, L.y0, L.g);
  const w = SW*k, h = L.h*k;
  // poszerz poziomo, żeby pokryć ekran (lustrzane powtórzenie tekstury)
  const lew = Math.ceil(Math.max(0, x0)/w + 0.2), pra = Math.ceil(Math.max(0, W-(x0+w))/w + 0.2);
  gl.useProgram(P_TEX.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, L.tx.t);
  gl.uniform1i(P_TEX.u.uT,0); gl.uniform1f(P_TEX.u.uA,1); gl.uniform3f(P_TEX.u.uMul,1,1,1);
  quad(P_TEX, [x0-lew*w, y0, w*(1+lew+pra), h], [-lew, 0, 1+pra, 1]);
}

// ── cząsteczki ──
const czast=[];
function nowa(typ){
  const r=Math.random;
  if(typ==='zar') return {typ, x:OGNISKO.x+(r()-.5)*26, y:OGNISKO.y-6, vx:(r()-.5)*14, vy:-(26+r()*46), z:0, zmax:2.2+r()*3.2, wl:r()*6.28, ro:1.4+r()*2.6, g:1};
  if(typ==='swietlik') return {typ, x:r()*SW*1.6-SW*0.3, y:1120+r()*520, vx:0, vy:0, z:r()*6, zmax:1e9, wl:r()*6.28, ro:2.2+r()*2.2, g:1.15, f:0.5+r()*1.4};
  if(typ==='gwiazda') return {typ, x:r()*SW*2.4-SW*0.7, y:r()*560, z:0, zmax:1e9, wl:r()*6.28, ro:0.7+Math.pow(r(),3)*2.6, g:0.10, f:0.6+r()*2.2};
  return {typ, x:0,y:0,vx:0,vy:0,z:0,zmax:1, wl:0, ro:2, g:0.5};
}
for(let i=0;i<180;i++) czast.push(nowa('gwiazda'));
for(let i=0;i<70;i++) czast.push(nowa('swietlik'));

// ── pety w locie ──
const lot={a:null, nast:2.5, i:0};
function startLotu(){
  const d=LOTNICY[lot.i++ % LOTNICY.length]; if(!d.tx) return;
  const zPrawej = true;
  lot.a = {d, t:0, dl:13+Math.random()*4, y0:330+Math.random()*260, amp:30+Math.random()*30, g:0.25+Math.random()*0.18, wys: 96+Math.random()*40};
}

function klatka(teraz){
  const dt = Math.min(0.05,(teraz-ost)/1000); ost=teraz; czas+=dt;
  mysz.x += (mysz.tx-mysz.x)*Math.min(1,dt*3); mysz.y += (mysz.ty-mysz.y)*Math.min(1,dt*3);
  if(!gotowe || przew>=1){ requestAnimationFrame(klatka); return; }
  gl.viewport(0,0,cv.width,cv.height);
  gl.clearColor(0.04,0.03,0.07,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  warstwa(WARSTWY[0]);
  rysujCzast('gwiazda');
  // poświata księżyca/zachodu nad górami
  blask(470, 620, 900, [0.45,0.22,0.55], 0.25, 0.10);
  lecacy(true);
  warstwa(WARSTWY[1]);
  mgla(960, 1120, 0.38, [0.62,0.48,0.72], 0.40, 0.42);
  warstwa(WARSTWY[2]);
  // ognisko: migotanie
  const mig = 0.82 + Math.sin(czas*11.0)*0.06 + Math.sin(czas*23.7)*0.05 + Math.sin(czas*5.3)*0.07;
  blask(OGNISKO.x, OGNISKO.y-14, 520, [1.0,0.48,0.14], 0.55*mig, 1.0);
  blask(OGNISKO.x, OGNISKO.y-10, 150, [1.0,0.72,0.35], 0.75*mig, 1.0);
  mgla(1500, 1672, 0.95, [0.35,0.25,0.45], 0.22, 1.05);
  rysujCzast('swietlik'); rysujCzast('zar');
  // winieta
  const a0=mapuj(0,0,1), a1=mapuj(SW,0,1);
  gl.useProgram(P_WIN.p); gl.uniform2f(P_WIN.u.uArt, a0[0], a1[0]); gl.uniform1f(P_WIN.u.uZgas, Math.pow(przew,1.6)*0.9);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  quad(P_WIN,[0,0,W,H],[0,0,1,1]);
  requestAnimationFrame(klatka);
}

function blask(x,y,r,kol,a,g){
  const [sx,sy,k]=mapuj(x,y,g); const R=r*k;
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.useProgram(P_BLASK.p); gl.uniform3f(P_BLASK.u.uKol,kol[0],kol[1],kol[2]); gl.uniform1f(P_BLASK.u.uA,a);
  quad(P_BLASK,[sx-R,sy-R,R*2,R*2],[0,0,1,1]);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}
function mgla(y0,y1,g,kol,a,gl2){
  const [x,ya,k]=mapuj(-SW,y0,gl2), [,yb]=mapuj(-SW,y1,gl2);
  gl.useProgram(P_MGLA.p); gl.uniform1f(P_MGLA.u.uT, czas); gl.uniform1f(P_MGLA.u.uA, a); gl.uniform3f(P_MGLA.u.uKol,kol[0],kol[1],kol[2]);
  quad(P_MGLA,[x,ya,SW*3*k,yb-ya],[0,0,1,1]);
}

let zarAkum=0;
function rysujCzast(typ){
  const dt=1/60; let n=0;
  if(typ==='zar' && !RM){ zarAkum += 0.9; while(zarAkum>1){ zarAkum--; if(czast.length<900) czast.push(nowa('zar')); } }
  for(let i=czast.length-1;i>=0;i--){
    const p=czast[i]; if(p.typ!==typ) continue;
    let a=1, kol;
    if(typ==='zar'){
      p.z+=dt; if(p.z>p.zmax){ czast.splice(i,1); continue; }
      p.wl+=dt*2.2; p.vx += Math.sin(p.wl+p.y*0.02)*22*dt; p.vx*=0.985; p.vy*=0.996;
      p.x+=p.vx*dt; p.y+=p.vy*dt;
      const t=p.z/p.zmax; a = Math.min(1,p.z*5)*(1-t)*(0.7+0.3*Math.sin(czas*20+p.wl*5));
      kol=[1.0, 0.45+0.45*(1-t), 0.12*(1-t)];
    } else if(typ==='swietlik'){
      p.wl+=dt*p.f; p.x+=Math.sin(p.wl*0.7)*9*dt; p.y+=Math.cos(p.wl*0.9)*6*dt;
      a = Math.max(0, Math.sin(p.wl*2.0+p.z))*0.9; kol=[0.75,1.0,0.45];
    } else {
      a = 0.35+0.65*Math.pow(0.5+0.5*Math.sin(czas*p.f+p.wl),3); kol=[0.92,0.9,1.0];
    }
    const [sx,sy,k]=mapuj(p.x,p.y,p.g);
    if(sx<-20||sx>W+20||sy<-20||sy>H+20) continue;
    const o=n*7; PD[o]=sx; PD[o+1]=sy; PD[o+2]=Math.max(1.5,p.ro*k*2.2*(typ==='gwiazda'?1:1.6))*DPR; PD[o+3]=kol[0]; PD[o+4]=kol[1]; PD[o+5]=kol[2]; PD[o+6]=a;
    if(++n>=MAXP) break;
  }
  if(!n) return;
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.useProgram(P_PT.p); gl.uniform2f(P_PT.u.uRes, W, H); gl.bindVertexArray(vaoP);
  gl.bindBuffer(gl.ARRAY_BUFFER,bp); gl.bufferSubData(gl.ARRAY_BUFFER,0,PD.subarray(0,n*7));
  gl.drawArrays(gl.POINTS,0,n);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}

const ogonP=[];
function lecacy(){
  if(RM) return;
  if(!lot.a){ lot.nast-=1/60; if(lot.nast<=0) startLotu(); return; }
  const L=lot.a, d=L.d; L.t+=1/60;
  const t=L.t/L.dl; if(t>=1){ lot.a=null; lot.nast=3+Math.random()*4; return; }
  const x = SW*1.55 - t*SW*2.1, y = L.y0 + Math.sin(t*6.28*1.3)*L.amp - Math.sin(t*3.14)*60;
  const [sx,sy,k]=mapuj(x,y,L.g);
  const fr = Math.floor(czas*9)%6, fw=d.tx.w/6, h=L.wys*k, w=h*fw/d.tx.h;
  if(d.ogon && Math.random()<0.9) ogonP.push({x:x+40, y:y+10, z:0, vx:20+Math.random()*30, vy:(Math.random()-.5)*20});
  // ogień / iskry za lotnikiem
  if(d.ogon){ let n=0;
    for(let i=ogonP.length-1;i>=0;i--){ const p=ogonP[i]; p.z+=1/60; if(p.z>1.1){ ogonP.splice(i,1); continue; }
      p.x+=p.vx/60; p.y+=p.vy/60; const [px,py,kk]=mapuj(p.x,p.y,L.g); const o=n*7; const tt=p.z/1.1;
      PD[o]=px; PD[o+1]=py; PD[o+2]=(10*(1-tt)+3)*kk*DPR*2.2; PD[o+3]=d.ogon[0]; PD[o+4]=d.ogon[1]*(1-tt*0.5); PD[o+5]=d.ogon[2]; PD[o+6]=(1-tt)*0.65; n++; }
    if(n){ gl.blendFunc(gl.ONE, gl.ONE); gl.useProgram(P_PT.p); gl.uniform2f(P_PT.u.uRes,W,H); gl.bindVertexArray(vaoP);
      gl.bindBuffer(gl.ARRAY_BUFFER,bp); gl.bufferSubData(gl.ARRAY_BUFFER,0,PD.subarray(0,n*7)); gl.drawArrays(gl.POINTS,0,n); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); }
  }
  gl.useProgram(P_TEX.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,d.tx.t);
  gl.uniform1i(P_TEX.u.uT,0); gl.uniform1f(P_TEX.u.uA,Math.min(1,Math.min(t,1-t)*12)); gl.uniform3f(P_TEX.u.uMul,0.78,0.72,0.95);
  quad(P_TEX,[sx-w/2, sy-h/2, w, h],[fr/6, 0, (fr+1)/6, 1]);
}

// ── start ──
rozmiar();
Promise.all([
  ...WARSTWY.map(L=>tex(L.src,true).then(t=>L.tx=t)),
  ...LOTNICY.map(d=>tex('pety/'+d.id+'_bok.webp',false).then(t=>d.tx=t)),
]).then(()=>{ gotowe=true; cv.classList.add('jest'); document.documentElement.classList.add('scena-ok'); });
requestAnimationFrame(klatka);
})();
