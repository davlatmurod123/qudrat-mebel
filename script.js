const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { type: null, measure: true, addr: "" };

/* заглушка, если фото нет */
function ph(label){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#E9DCC2"/><g fill="none" stroke="#9A6414" stroke-width="6" opacity=".5"><rect x="300" y="200" width="200" height="170" rx="8"/><line x1="400" y1="200" x2="400" y2="370"/></g><text x="400" y="440" text-anchor="middle" font-family="Arial" font-size="34" fill="#56625C">${label || 'Фото'}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function setImg(img, src, label){
  img.onerror = () => { img.onerror = null; img.src = ph(label); };
  img.src = src || ph(label);
}

/* тексты */
const bind = (k, v) => $$('[data-bind="' + k + '"]').forEach(e => e.textContent = v);
bind('name', CONFIG.name); bind('city', CONFIG.city); bind('hours', CONFIG.hours);
bind('heroTitle', CONFIG.heroTitle); bind('heroText', CONFIG.heroText); bind('phoneText', CONFIG.phone);
document.title = CONFIG.name + " — мебель на заказ";

/* шаги */
$('#steps').style.setProperty('--cols', CONFIG.steps.length);
$('#steps').innerHTML = CONFIG.steps.map((s, i) =>
  `<li><span class="n">${i + 1}</span><div><b>${s.title}</b><span>${s.text}</span></div></li>`).join("");

/* карточки «что делаем» */
const cards = $('#cards');
CONFIG.types.forEach((t, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'card';
  b.innerHTML = `<div class="ph"><img alt="${t.label}" loading="lazy"><span class="cnt">${(t.photos || []).length} фото</span></div>
    <div class="tx"><h3>${t.label}</h3><p>${t.text || ''}</p><span class="more">Смотреть работы →</span></div>`;
  setImg(b.querySelector('img'), (t.photos || [])[0], t.label);
  b.addEventListener('click', () => openGal(i));
  cards.appendChild(b);
});

/* галерея */
const gal = $('#gal');
let gi = 0, gp = 0;
function showPhoto(){
  const t = CONFIG.types[gi], list = t.photos && t.photos.length ? t.photos : [null];
  gp = (gp + list.length) % list.length;
  setImg($('#galImg'), list[gp], t.label); $('#galImg').alt = t.label;
  $('#galCount').textContent = `Фото ${gp + 1} из ${list.length}`;
  [...$('#thumbs').children].forEach((b, k) => b.setAttribute('aria-current', String(k === gp)));
  const multi = list.length > 1;
  $('#galPrev').style.display = $('#galNext').style.display = multi ? '' : 'none';
}
function openGal(i){
  gi = i; gp = 0;
  const t = CONFIG.types[i], list = t.photos && t.photos.length ? t.photos : [null];
  $('#galTitle').textContent = t.label;
  $('#thumbs').innerHTML = '';
  if (list.length > 1) list.forEach((src, k) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Фото ' + (k + 1));
    const im = document.createElement('img'); im.alt = ''; setImg(im, src, t.label); b.appendChild(im);
    b.addEventListener('click', () => { gp = k; showPhoto(); });
    $('#thumbs').appendChild(b);
  });
  showPhoto();
  gal.showModal();
}
$('#galPrev').addEventListener('click', () => { gp--; showPhoto(); });
$('#galNext').addEventListener('click', () => { gp++; showPhoto(); });
$('#galX').addEventListener('click', () => gal.close());
gal.addEventListener('click', e => { if (e.target === gal) gal.close(); });
gal.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft'){ gp--; showPhoto(); }
  if (e.key === 'ArrowRight'){ gp++; showPhoto(); }
});
$('#galOrder').addEventListener('click', () => {
  state.type = gi; update(); gal.close();
  $('#order').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
});

/* заявка */
const chips = $('#chips');
CONFIG.types.forEach((t, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'chip'; b.textContent = t.label;
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => { state.type = state.type === i ? null : i; update(); });
  chips.appendChild(b);
});

function buildMessage(){
  const t = state.type !== null ? CONFIG.types[state.type] : null;
  let m = `${CONFIG.messageStart} Хочу заказать ${t ? t.what : "мебель на заказ"}.`;
  if (state.measure) m += " Нужен выезд на замер.";
  if (state.addr.trim()) m += ` Район: ${state.addr.trim()}.`;
  return m + " " + CONFIG.messageEnd;
}

function update(){
  [...chips.children].forEach((b, i) => b.setAttribute('aria-pressed', String(state.type === i)));
  const pick = $('#pick');
  if (state.type !== null){
    const t = CONFIG.types[state.type];
    setImg($('#pickImg'), (t.photos || [])[0], t.label); $('#pickImg').alt = t.label;
    $('#pickLabel').textContent = t.label;
    pick.classList.add('on');
  } else pick.classList.remove('on');

  const msg = buildMessage();
  $('#bubble').textContent = msg;
  const enc = encodeURIComponent(msg);
  const links = {
    wa:  `https://wa.me/${CONFIG.whatsapp}?text=${enc}`,
    tel: `tel:${CONFIG.phone}`
  };
  $$('[data-ch]').forEach(a => a.href = links[a.dataset.ch]);
}
$('#measure').addEventListener('change', e => { state.measure = e.target.checked; update(); });
$('#addr').addEventListener('input', e => { state.addr = e.target.value; update(); });
update();

/* фон: пильные диски и опилки */
function blade(el, teeth, ro, ri){
  let d = '';
  for (let i = 0; i < teeth; i++){
    const a0 = (i / teeth) * Math.PI * 2, a1 = ((i + .5) / teeth) * Math.PI * 2, a2 = ((i + 1) / teeth) * Math.PI * 2;
    const p = (a, r) => (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1);
    d += (i ? 'L' : 'M') + p(a0, ri) + 'L' + p(a1, ro) + 'L' + p(a2, ri);
  }
  el.innerHTML = `<path d="${d}Z" fill="#1F4A3B" fill-rule="evenodd"/><circle r="14" fill="#F8F0E2"/>` +
    [0,1,2,3,4,5].map(k => `<circle cx="${(Math.cos(k*Math.PI/3)*52).toFixed(1)}" cy="${(Math.sin(k*Math.PI/3)*52).toFixed(1)}" r="9" fill="#F8F0E2"/>`).join('');
}
blade($('#blade1'), 36, 104, 90);
blade($('#blade2'), 28, 104, 90);
(function(){
  const box = $('#dust'), n = window.innerWidth < 760 ? 16 : 28;
  for (let i = 0; i < n; i++){
    const d = document.createElement('span'); d.className = 'dust';
    const s = 3 + Math.random() * 7;
    d.style.width = d.style.height = s + 'px';
    d.style.left = (Math.random() * 100) + '%';
    d.style.setProperty('--sway', (Math.random() * 80 - 40) + 'px');
    d.style.animationDuration = (16 + Math.random() * 20) + 's';
    d.style.animationDelay = (-Math.random() * 26) + 's';
    if (reduce) d.style.top = (Math.random() * 90) + '%';
    box.appendChild(d);
  }
})();
