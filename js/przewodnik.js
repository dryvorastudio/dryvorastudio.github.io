// Strona „Jak grać”: budynki, cechy, pety, bossowie, spis treści.
(function(){
const $=s=>document.querySelector(s), T=EH.t;
const RANGI={C:{kol:'#b0bec5',n:{pl:'Zwykły',en:'Common'},atk:6,es:10},B:{kol:'#64b5f6',n:{pl:'Rzadki',en:'Rare'},atk:9,es:25},A:{kol:'#ba68c8',n:{pl:'Epicki',en:'Epic'},atk:13,es:60},S:{kol:'#ffca28',n:{pl:'Legendarny',en:'Legendary'},atk:18,es:150}};
const SUR={wood:'🪵',stone:'🪨',food:'🌾',gold:'🪙',science:'🔬'};
const BUD=[
 ['hut',{pl:'Chata',en:'Hut'},{wood:15},{pl:'+2 miejsca do zamieszkania na poziom. Więcej chat = więcej osadników.',en:'+2 beds per level. More huts = more settlers.'},'eko'],
 ['farm',{pl:'Farma',en:'Farm'},{wood:30},{pl:'Miejsca pracy dla rolników, z każdym poziomem +30% żywności i większy magazyn.',en:'Jobs for farmers; each level gives +30% food and more storage.'},'eko'],
 ['sawmill',{pl:'Tartak',en:'Sawmill'},{wood:35},{pl:'Drwale dostają +20% drewna na poziom. Magazyn drewna rośnie.',en:'Loggers get +20% wood per level. Wood storage grows.'},'eko'],
 ['quarry',{pl:'Kopalnia',en:'Quarry'},{wood:45},{pl:'Górnicy dostają +20% kamienia na poziom. Magazyn kamienia rośnie.',en:'Miners get +20% stone per level. Stone storage grows.'},'eko'],
 ['well',{pl:'Studnia',en:'Well'},{stone:20,wood:10},{pl:'+5 nastroju osadników na poziom.',en:'+5 settler mood per level.'},'eko'],
 ['campfire',{pl:'Ognisko',en:'Campfire'},{wood:5},{pl:'Serce wioski. +8 nastroju na poziom.',en:'The heart of the village. +8 mood per level.'},'eko'],
 ['library',{pl:'Biblioteka',en:'Library'},{wood:30,stone:20},{pl:'Miejsce dla uczonego. Badania szybsze o 30% na poziom.',en:'A seat for a scholar. Research +30% per level.'},'eko'],
 ['tavern',{pl:'Tawerna',en:'Tavern'},{wood:40,stone:20,food:20},{pl:'Ława najemnych: do 5 chętnych dziennie (1 + poziom).',en:'Mercenary bench: up to 5 recruits a day (1 + level).'},'eko'],
 ['weaponsmith',{pl:'Brońmistrz',en:'Weaponsmith'},{wood:60,stone:50},{pl:'Wykuwa broń, hełmy i buty. Poziom = najlepsza klasa sprzętu.',en:'Forges weapons, helmets and boots. Level = best gear tier.'},'sprzet'],
 ['armory',{pl:'Zbrojownia',en:'Armoury'},{wood:70,stone:60},{pl:'Wyrabia zbroje i tarcze.',en:'Makes armour and shields.'},'sprzet'],
 ['jeweler',{pl:'Jubiler',en:'Jeweller'},{wood:50,stone:70,gold:40},{pl:'Tworzy naszyjniki i pierścienie.',en:'Crafts amulets and rings.'},'sprzet'],
 ['forge',{pl:'Kuźnia',en:'Forge'},{wood:80,stone:90,gold:50},{pl:'Ulepszanie (+2 na poziom, maks. +9), łączenie i przetapianie.',en:'Upgrading (+2 per level, max +9), merging and smelting.'},'sprzet'],
 ['alchemy',{pl:'Alchemik',en:'Alchemist'},{wood:65,stone:45,gold:30},{pl:'Warzy mikstury bojowe i trzyma zioła.',en:'Brews battle potions and stores herbs.'},'sprzet'],
 ['barracks',{pl:'Koszary',en:'Barracks'},{wood:40,stone:30},{pl:'Etaty strażników. +5 obrony wioski na poziom.',en:'Guard posts. +5 village defence per level.'},'obrona'],
 ['hospital',{pl:'Szpital',en:'Hospital'},{wood:35,stone:25},{pl:'Medycy leczą rannych. +12% szans na wyleczenie na poziom.',en:'Medics treat the wounded. +12% recovery chance per level.'},'obrona'],
 ['palisade',{pl:'Palisada',en:'Palisade'},{wood:12},{pl:'Zapora dla wilków: 120 wytrzymałości na poziom.',en:'Stops wolves: 120 durability per level.'},'obrona'],
 ['tower',{pl:'Wieża',en:'Tower'},{wood:45,stone:25},{pl:'Strażnik strzela z góry z większym zasięgiem. 220 wytrzymałości na poziom.',en:'A guard shoots from above with extra range. 220 durability per level.'},'obrona'],
 ['trap',{pl:'Wnyki',en:'Traps'},{wood:8,stone:4},{pl:'Jednorazowo ranią wilka: 40 obrażeń na poziom.',en:'Wound a wolf once: 40 damage per level.'},'obrona'],
];
const TAGI={eko:{pl:'gospodarka',en:'economy'},sprzet:{pl:'sprzęt',en:'gear'},obrona:{pl:'obrona',en:'defence'}};
function budynki(){
  $('#budynki').innerHTML = BUD.map(([id,n,k,d,t])=>`<div class="budynek wej"><div class="obr"><img src="img/bud/${id}.webp" alt="" loading="lazy"></div><b>${T(n)}</b><span>${T(d)}</span><small><span class="tag">${T(TAGI[t])}</span>${Object.entries(k).map(([r,v])=>SUR[r]+' '+v).join(' · ')}</small></div>`).join('');
  EH.obserwuj($('#budynki'));
}
const CECHY=[
 ['💪',{pl:'Pracowity',en:'Hard-working'},{pl:'+25% wydajności w pracy',en:'+25% work output'},1],['🥱',{pl:'Leniwy',en:'Lazy'},{pl:'−25% wydajności w pracy',en:'−25% work output'},0],
 ['🦁',{pl:'Odważny',en:'Brave'},{pl:'+30% obrażeń, śmielszy na wyprawach',en:'+30% damage, bolder on expeditions'},1],['🐁',{pl:'Tchórz',en:'Coward'},{pl:'−30% obrażeń, panikuje',en:'−30% damage, panics'},0],
 ['🛡️',{pl:'Wytrzymały',en:'Tough'},{pl:'Wolniej się wykrwawia',en:'Bleeds out more slowly'},1],['🤧',{pl:'Wątły',en:'Frail'},{pl:'Choruje dwa razy częściej',en:'Gets sick twice as often'},0],
 ['🧘',{pl:'Wstrzemięźliwy',en:'Ascetic'},{pl:'Je o 40% mniej',en:'Eats 40% less'},1],['🍗',{pl:'Żarłok',en:'Glutton'},{pl:'Je o 30% więcej',en:'Eats 30% more'},0],
 ['🎉',{pl:'Dusza towarzystwa',en:'Life of the party'},{pl:'Poprawia nastrój wokół',en:'Lifts the mood around them'},1],['😾',{pl:'Zrzęda',en:'Grump'},{pl:'Psuje nastrój wokół',en:'Spoils the mood around them'},0],
 ['🍀',{pl:'Szczęściarz',en:'Lucky'},{pl:'Lepsze łupy z wypraw',en:'Better expedition loot'},1],['🧠',{pl:'Bystry',en:'Bright'},{pl:'+40% nauki',en:'+40% science'},1],
];
function cechy(){ $('#cechy').innerHTML=CECHY.map(([i,n,d,g])=>`<div class="cecha ${g?'dobra':'zla'}"><i>${i}</i><div><b>${T(n)}</b><span>${T(d)}</span></div></div>`).join(''); }
function pety(){
  const P=window.EH_PETY, UM=window.EH_UM, el=$('#petySiatka'); el.innerHTML='';
  ['C','B','A','S'].forEach(r=>P.filter(p=>p.r===r).forEach(p=>{
    const g=Math.max(...Object.keys(p.g).map(Number));
    const d=document.createElement('div'); d.className='pet-mini'; d.style.setProperty('--rk',RANGI[r].kol);
    d.title=p.um.map(k=>T(UM[k].n)).join(' · ');
    d.innerHTML=`<i style="background:${RANGI[r].kol}">${r}</i><div class="spr"></div><b>${T(p.n)}</b><small style="color:var(--tekst3);font-size:11.5px">${p.um.map(k=>UM[k].ik).join(' ')} ★${g}</small>`;
    const s=d.querySelector('.spr'); EH.pet(s,p,g,80); s.style.margin='0 auto 6px';
    el.appendChild(d); }));
  $('#rangiTab').innerHTML=`<tr><th>${T({pl:'Ranga',en:'Rank'})}</th><th>${T({pl:'Atak bazowy',en:'Base attack'})}</th><th>${T({pl:'Esencja z wypuszczenia',en:'Essence when released'})}</th><th>${T({pl:'Gatunków',en:'Species'})}</th></tr>`+
    ['C','B','A','S'].map(r=>`<tr><td style="color:${RANGI[r].kol}">${r} · ${T(RANGI[r].n)}</td><td>${RANGI[r].atk}</td><td>✨ ${RANGI[r].es}</td><td>${P.filter(p=>p.r===r).length}</td></tr>`).join('');
  $('#umTab').innerHTML = `<tr><th>${T({pl:'Zdolność',en:'Ability'})}</th><th>${T({pl:'Działanie',en:'Effect'})}</th><th>${T({pl:'Odnowienie',en:'Cooldown'})}</th></tr>`+
    Object.values(UM).map(u=>`<tr><td>${u.ik} ${T(u.n)}</td><td>${T(u.d)}</td><td>${u.cd} s</td></tr>`).join('');
}
const BOSS=[['krolszczur',{pl:'Król Szczurów',en:'Rat King'},420,22,25],['rzeznik',{pl:'Rzeźnik',en:'Butcher'},600,28,35],['krolowa',{pl:'Królowa Pająków',en:'Spider Queen'},700,30,40],['pankosci',{pl:'Pan Kości',en:'Bone Lord'},950,38,50],['ork',{pl:'Wódz Orków',en:'Orc Chieftain'},1250,48,70],['klucznik',{pl:'Klucznik',en:'Keymaster'},1500,54,80],['zniwiarz',{pl:'Żniwiarz',en:'Reaper'},1750,60,95],['demon',{pl:'Władca Demonów',en:'Demon Lord'},2100,66,110],['pustykrol',{pl:'Bezgłowy Król',en:'Headless King'},2600,76,140],['smok',{pl:'Prastary Smok',en:'Ancient Dragon'},3200,86,170]];
function bossy(){ $('#bossTab').innerHTML=`<tr><th>Boss</th><th>HP</th><th>${T({pl:'Atak',en:'Attack'})}</th><th>${T({pl:'Nagroda',en:'Reward'})}</th></tr>`+BOSS.map(([,n,hp,a,d])=>`<tr><td>${T(n)}</td><td>${hp}</td><td>${a}</td><td>💎 ${d}</td></tr>`).join(''); }
function kuznia(){
  const m={pl:['Zwykły','Unikatowy','Heroiczny','Legendarny'],en:['Common','Unique','Heroic','Legendary']}, k=[1,1.5,2,2.6];
  let h=`<tr><th>${T({pl:'Ulepszenie',en:'Upgrade'})}</th><th>${T({pl:'Statystyki',en:'Stats'})}</th><th>${T({pl:'Koszt (zwykły)',en:'Cost (common)'})}</th><th>${T({pl:'Koszt (legendarny)',en:'Cost (legendary)'})}</th><th>${T({pl:'Wymagana kuźnia',en:'Forge needed'})}</th></tr>`;
  for(let pl=0;pl<9;pl++){ const c=mn=>`🪨 ${Math.round(50*Math.pow(1.22,pl)*mn)} · 🪙 ${Math.round(35*Math.pow(1.45,pl)*mn)} · 🔬 ${Math.round(9*Math.pow(1.30,pl)*mn)}`;
    h+=`<tr><td>+${pl} → +${pl+1}</td><td>×${(1+0.15*(pl+1)).toFixed(2)}</td><td>${c(1)}</td><td>${c(2.6)}</td><td>${T({pl:'poz.',en:'lvl'})} ${Math.min(5,Math.ceil((pl+1)/2))}</td></tr>`; }
  $('#kuzniaTab').innerHTML=h;
  const L=[[{pl:'Zwykły → unikatowy',en:'Common → unique'},34,5.5,80],[{pl:'Unikatowy → heroiczny',en:'Unique → heroic'},20,4.2,62],[{pl:'Heroiczny → legendarny',en:'Heroic → legendary'},6,2.5,30]];
  $('#laczTab').innerHTML=`<tr><th>${T({pl:'Łączenie (3 w 1)',en:'Merge (3 into 1)'})}</th><th>${T({pl:'Szansa bazowa',en:'Base chance'})}</th><th>${T({pl:'Za poziom kuźni',en:'Per forge level'})}</th><th>${T({pl:'Maksimum',en:'Maximum'})}</th></tr>`+
    L.map(([n,b,l,x])=>`<tr><td>${T(n)}</td><td>${b}%</td><td>+${l}%</td><td>${x}%</td></tr>`).join('');
}
function wszystko(){ budynki(); cechy(); pety(); bossy(); kuznia(); }
EH.naJezyk(wszystko);

// spis treści: podświetl bieżący rozdział
const linki=[...document.querySelectorAll('.spis a')];
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ linki.forEach(a=>a.classList.toggle('akt', a.getAttribute('href')==='#'+e.target.id));
  const a=linki.find(a=>a.classList.contains('akt')); if(a && innerWidth<980) a.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}); } }), {rootMargin:'-30% 0px -65% 0px'});
document.querySelectorAll('.rozdzial').forEach(s=>io.observe(s));
})();
