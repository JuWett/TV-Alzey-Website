document.addEventListener("DOMContentLoaded",()=>{const y=document.getElementById("year");if(y)y.textContent=new Date().getFullYear();const b=document.querySelector(".menu"),n=document.getElementById("navlinks");if(b&&n)b.addEventListener("click",()=>{const open=n.classList.toggle("open");b.setAttribute("aria-expanded",String(open));b.setAttribute("aria-label",open?"Menü schließen":"Menü öffnen")});if(document.getElementById("event-list"))loadEvents();renderTodayTraining();});async function loadEvents(){const list=document.getElementById("event-list"),status=document.getElementById("event-status"),search=document.getElementById("event-search"),month=document.getElementById("month-filter"),cat=document.getElementById("category-filter");try{const r=await fetch("laufveranstaltungen.json");if(!r.ok)throw new Error();const data=(await r.json()).sort((a,b)=>a.datum.localeCompare(b.datum));const months=[...new Set(data.map(e=>e.datum.slice(0,7)))];months.forEach(m=>{const o=document.createElement("option");o.value=m;o.textContent=new Intl.DateTimeFormat("de-DE",{month:"long",year:"numeric"}).format(new Date(m+"-01T12:00:00"));month.appendChild(o)});[...new Set(data.map(e=>e.kategorie).filter(Boolean))].sort().forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;cat.appendChild(o)});const render=()=>{const q=search.value.toLowerCase().trim(),m=month.value,c=cat.value;const rows=data.filter(e=>(!q||[e.veranstaltung,e.ort,e.veranstalter].filter(Boolean).join(" ").toLowerCase().includes(q))&&(!m||e.datum.startsWith(m))&&(!c||e.kategorie===c));status.textContent=`${rows.length} Termine`;list.innerHTML=rows.map(e=>{const d=new Intl.DateTimeFormat("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(e.datum+"T12:00:00"));const details=[e.uhrzeit?e.uhrzeit+" Uhr":"",[e.plz,e.ort].filter(Boolean).join(" "),e.kategorie,e.distanz_km?e.distanz_km+" km":"",e.hoehenmeter?e.hoehenmeter+" Hm":""].filter(Boolean).join(" · ");return `<article class="event"><div class="event-date">${d}</div><div><h3>${esc(e.veranstaltung)}</h3><p>${esc(details)}</p></div>${e.website?`<a href="${esc(e.website)}" target="_blank" rel="noopener">Details ↗</a>`:""}</article>`}).join("")||"<p>Keine passenden Termine gefunden.</p>"};[search,month,cat].forEach(x=>x.addEventListener("input",render));render()}catch(e){status.textContent="Die Termine konnten nicht geladen werden. Über GitHub Pages funktioniert der Kalender; beim direkten Öffnen einer lokalen HTML-Datei kann der Browser den JSON-Zugriff blockieren."}}function esc(v){return String(v||"").replace(/[&<>"]/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[s]))}
function renderTodayTraining(){const box=document.getElementById("today-training");if(!box)return;const plans={0:{name:"Sunday Running Club",time:"09:30 Uhr · wechselnder Treffpunkt"},1:null,2:{name:"Laufteam & Sunday Running Club",time:"19:00–20:30 Uhr · Wartbergstadion"},3:{name:"Kindertraining",time:"17:30–18:30 Uhr · Wartbergstadion"},4:{name:"Laufteam & Sunday Running Club",time:"19:00–20:30 Uhr · Wartbergstadion"},5:null,6:{name:"Laufteam",time:"11:00–12:30 Uhr · Wartbergstadion"}};const today=plans[new Date().getDay()];const strong=box.querySelector("strong"),small=box.querySelector("small");if(today){strong.textContent=today.name;small.textContent=today.time}else{strong.textContent="Heute kein reguläres Training";small.textContent="Die nächsten Termine findest du direkt darunter."}}


// Vergrößerbare Übungsgrafiken
function initExerciseLightbox(){
  const modal=document.querySelector('.exercise-lightbox');
  const image=document.querySelector('.zoomable-exercise');
  const openButton=document.querySelector('.js-open-exercise');
  if(!modal||!image)return;
  const closeButton=modal.querySelector('.lightbox-close');
  let previousFocus=null;
  const open=()=>{previousFocus=document.activeElement;modal.hidden=false;document.body.style.overflow='hidden';closeButton.focus()};
  const close=()=>{modal.hidden=true;document.body.style.overflow='';if(previousFocus)previousFocus.focus()};
  image.addEventListener('click',open);
  image.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  if(openButton)openButton.addEventListener('click',open);
  closeButton.addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
}
document.addEventListener('DOMContentLoaded',initExerciseLightbox);

// Laufwetter Alzey – Daten von Open-Meteo
async function initRunningWeather(){
  const widget=document.getElementById('weather-widget');
  if(!widget)return;
  const url='https://api.open-meteo.com/v1/forecast?latitude=49.7465&longitude=8.1168&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=Europe%2FBerlin&forecast_days=2';
  try{
    const response=await fetch(url,{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Wetterdienst nicht erreichbar');
    const data=await response.json();
    renderRunningWeather(data);
  }catch(error){
    widget.innerHTML='<div class="weather-error">Die Wetterdaten können gerade nicht geladen werden. Bitte später noch einmal versuchen.</div>';
    const updated=document.getElementById('weather-updated');
    if(updated)updated.textContent='Aktualisierung nicht möglich';
  }
}
function renderRunningWeather(data){
  const current=data.current||{};
  const hourly=data.hourly||{};
  const daily=data.daily||{};
  const description=weatherCodeText(current.weather_code);
  setWeatherText('weather-temperature',Math.round(current.temperature_2m)+'°');
  setWeatherText('weather-feels',Math.round(current.apparent_temperature)+'°');
  setWeatherText('weather-wind',Math.round(current.wind_speed_10m)+' km/h');
  setWeatherText('weather-humidity',Math.round(current.relative_humidity_2m)+' %');
  setWeatherText('weather-description',description.text);
  setWeatherText('weather-icon',description.icon);
  const nowIndex=findClosestHour(hourly.time,new Date());
  const rainProbability=Number(hourly.precipitation_probability?.[nowIndex]??0);
  setWeatherText('weather-rain',Math.round(rainProbability)+' %');
  setWeatherText('sunrise',formatWeatherTime(daily.sunrise?.[0]));
  setWeatherText('sunset',formatWeatherTime(daily.sunset?.[0]));
  const score=runningWeatherScore(Number(current.temperature_2m),Number(current.wind_speed_10m),rainProbability,Number(current.weather_code));
  const light=document.getElementById('running-light');
  if(light){light.className='running-light '+score.className;}
  setWeatherText('running-light-label',score.label);
  setWeatherText('running-rating-title',score.title);
  setWeatherText('running-rating-text',score.text);
  const best=findBestRunningWindow(hourly);
  setWeatherText('weather-best-time',best.label);
  const tip=weatherRunningTip(Number(current.temperature_2m),Number(current.wind_speed_10m),rainProbability,Number(current.weather_code));
  setWeatherText('weather-tip-title',tip.title);
  setWeatherText('weather-tip-text',tip.text);
  const updated=document.getElementById('weather-updated');
  if(updated)updated.textContent='Aktualisiert '+new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(new Date())+' Uhr';
}
function setWeatherText(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
function findClosestHour(times,date){if(!Array.isArray(times)||!times.length)return 0;const target=date.getTime();let best=0,diff=Infinity;times.forEach((t,i)=>{const d=Math.abs(new Date(t).getTime()-target);if(d<diff){diff=d;best=i}});return best;}
function formatWeatherTime(value){if(!value)return '–';return new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(new Date(value))+' Uhr';}
function weatherCodeText(code){
  if(code===0)return{icon:'☀',text:'Klarer Himmel'};
  if([1,2].includes(code))return{icon:'⛅',text:'Leicht bewölkt'};
  if(code===3)return{icon:'☁',text:'Bewölkt'};
  if([45,48].includes(code))return{icon:'🌫',text:'Nebel'};
  if([51,53,55,56,57].includes(code))return{icon:'🌦',text:'Nieselregen'};
  if([61,63,65,66,67,80,81,82].includes(code))return{icon:'🌧',text:'Regen'};
  if([71,73,75,77,85,86].includes(code))return{icon:'🌨',text:'Schnee'};
  if([95,96,99].includes(code))return{icon:'⛈',text:'Gewitter'};
  return{icon:'◌',text:'Wechselhaft'};
}
function runningWeatherScore(temp,wind,rain,code){
  let points=100;
  if(temp<2)points-=25;else if(temp<7)points-=10;else if(temp>30)points-=45;else if(temp>25)points-=20;
  if(wind>45)points-=45;else if(wind>30)points-=25;else if(wind>20)points-=10;
  if(rain>75)points-=35;else if(rain>45)points-=18;else if(rain>20)points-=7;
  if([95,96,99].includes(code))points-=65;
  if(points>=72)return{className:'is-good',label:'Grün · sehr gut',title:'Gute Bedingungen zum Laufen',text:'Das Wetter passt heute für lockere Läufe und – je nach Trainingsplan – auch für zügigere Einheiten.'};
  if(points>=43)return{className:'is-medium',label:'Gelb · mit Vorsicht',title:'Laufen ist möglich',text:'Passe Tempo, Kleidung und Streckenwahl an Wind, Temperatur oder mögliche Niederschläge an.'};
  return{className:'is-bad',label:'Rot · ungünstig',title:'Training besser anpassen',text:'Die Bedingungen sind aktuell ungünstig. Eine kurze, lockere Einheit oder Indoortraining ist die vernünftigere Wahl.'};
}
function weatherRunningTip(temp,wind,rain,code){
  if([95,96,99].includes(code))return{title:'Gewitter ernst nehmen',text:'Bei Gewitter nicht im Freien laufen. Training verschieben und eine sichere Innenalternative wählen.'};
  if(temp>=28)return{title:'Hitze nicht unterschätzen',text:'Tempo reduzieren, ausreichend trinken und möglichst morgens oder abends laufen.'};
  if(temp<=3)return{title:'Langsam aufwärmen',text:'Mehr Zeit fürs Einlaufen einplanen und auf rutschige oder gefrorene Wege achten.'};
  if(wind>=32)return{title:'Windgeschützte Strecke wählen',text:'Wald- oder Häuserbereiche sind angenehmer. Auf Äste und starke Böen achten.'};
  if(rain>=55)return{title:'Sichtbarkeit erhöhen',text:'Helle oder reflektierende Kleidung tragen und auf nassen Wegen kontrolliert laufen.'};
  return{title:'Gute Grundlage für dein Training',text:'Passende Kleidung wählen, locker starten und die Intensität an dein Tagesgefühl anpassen.'};
}
function findBestRunningWindow(hourly){
  if(!Array.isArray(hourly.time))return{label:'Heute keine Prognose'};
  const now=new Date();const today=now.toISOString().slice(0,10);let best=null;
  for(let i=0;i<hourly.time.length-1;i++){
    const d=new Date(hourly.time[i]);
    if(hourly.time[i].slice(0,10)!==today||d<now||d.getHours()<5||d.getHours()>21)continue;
    const temp=Number(hourly.temperature_2m?.[i]);const wind=Number(hourly.wind_speed_10m?.[i]);const rain=Number(hourly.precipitation_probability?.[i]??0);const code=Number(hourly.weather_code?.[i]);
    let score=100-Math.abs(temp-14)*2-rain*.55-Math.max(0,wind-10)*1.3;
    if([95,96,99].includes(code))score-=100;
    if(!best||score>best.score)best={score,index:i};
  }
  if(!best)return{label:'Heute keine geeignete Zeit'};
  const start=new Date(hourly.time[best.index]);const end=new Date(start.getTime()+2*60*60*1000);
  const fmt=new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'});
  return{label:fmt.format(start)+'–'+fmt.format(end)+' Uhr'};
}
document.addEventListener('DOMContentLoaded',initRunningWeather);
