import { createFishPool, createCast, stepFishing, submitDirection } from './fishing.js';
import { CAST_ORIGIN, RETURN_POINT, cameraForHook, screenToWorld, moveHook, onScreen, regionAt } from './world.js';
import { drawWorld, drawMinimap } from './world-renderer.js';
import { loadFishAtlas } from './fish-atlas.js';
import { loadVisualAssets, drawProp } from './visual-assets.js';
import { drawPixelFish, drawPixelLandscape, drawPixelBoat, pixelLine, pixelRing } from './pixel-art.js';
import { SPECIES, RODS, BAITS, SKILLS, SAVE_KEY, initialState, normalizeSave, stats, has, xpNeeded, upgradeCost, boatCost, idleRate, accrueIdle, collectIdle, hookInfluence, patternPosition, awardCatch, unlockSkill, toggleSkill, buyBait, recallCost, upgradeRecall, returnDelay } from './game-core.js';

const $ = id => document.getElementById(id);
let state;
try { state = normalizeSave(JSON.parse(localStorage.getItem(SAVE_KEY))); } catch { state = initialState(); }
accrueIdle(state);
let tab = 'fishing', toastTimeout, popupTimeout, session = null, sound = false, audioContext;
const keys = new Set(), touchDirs = new Set();
let pointerTarget = null;
const hook = { ...CAST_ORIGIN };
const canvas = $('sea'), ctx = canvas.getContext('2d');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const format = n => Math.floor(n).toLocaleString('ko-KR');
const fishPopulation = createFishPool();
function fitCanvas(element){
  const rect=element.getBoundingClientRect(),ratio=window.devicePixelRatio || 1;
  if(rect.width<=0 || rect.height<=0)return false;
  const style=getComputedStyle(element);
  const width=Math.max(1,Math.round((rect.width-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth))*ratio));
  const height=Math.max(1,Math.round((rect.height-parseFloat(style.borderTopWidth)-parseFloat(style.borderBottomWidth))*ratio));
  if(element.width!==width)element.width=width;
  if(element.height!==height)element.height=height;
  element.getContext('2d').imageSmoothingEnabled=false;
  return true;
}
const rarityColors = ['#7ca794','#c59162','#589dc1','#9e80be','#b79748'];
const viewLabels = {
  fishing: ['고요한 산호 만', 'A LITTLE ESCAPE, A BIG ADVENTURE', '오늘은 어떤 만남이 기다릴까요?', '낚싯대를 던지고, 나만의 속도로 바다를 탐험해 보세요.'],
  gear: ['장비 공방', 'BETTER GEAR, DEEPER ADVENTURES', '더 깊은 바다를 위한 준비', '내 손에 맞는 낚싯대와 미끼로 새로운 물고기를 만나세요.'],
  skills: ['스킬 트리', 'MAKE YOUR OWN WAY', '당신만의 낚시에는 이유가 있어요', '유인, 조작, 성장. 세 가지 길에서 나만의 조합을 찾아보세요.'],
  collection: ['물고기 도감', 'EVERY ENCOUNTER TELLS A STORY', '작은 만남들이 모여 바다가 돼요', '스무 가지 어종을 만나고 움직임과 성향을 기록해 보세요.'],
  dock: ['자동 조업', 'THE SEA KEEPS GIVING', '잠시 쉬어도, 항해는 계속돼요', '조업선을 키우고 돌아올 때마다 쌓인 보상을 받아보세요.']
};
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); $('save-label').textContent = '자동 저장 사용 중'; }
  catch { $('save-label').textContent = '저장 불가 · 현재 창에서만 유지'; }
}
function toast(message) {
  $('toast').textContent = message; $('toast').classList.add('show');
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('toast').classList.remove('show'), 3200);
}
function playTone(frequency = 660) {
  if (!sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency,audioContext.currentTime);
    gain.gain.setValueAtTime(0.06,audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(0.001,audioContext.currentTime + 0.3);
    oscillator.connect(gain).connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + .3);
  } catch { sound = false; }
}
function navigate(next) {
  if (!viewLabels[next]) return;
  if (session && next !== 'fishing') { toast('낚시 종료 후 채비를 바꿀 수 있어요.'); return; }
  tab = next;
  document.querySelectorAll('.nav-item').forEach(b => { b.classList.toggle('active',b.dataset.tab === next); b.setAttribute('aria-current',b.dataset.tab === next ? 'page' : 'false'); });
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active',v.id === 'view-' + next));
  const labels = viewLabels[next];
  ['page-name','page-eyebrow','page-title','page-description'].forEach((id,i) => $(id).textContent = labels[i]);
  refresh();
  if (next === 'fishing') resize();
  window.scrollTo({ top:0, behavior:'instant' });
}
function refreshIdle() {
  $('idle-preview').textContent = format(state.idleCoins);
  $('idle-rate').textContent = `분당 ${idleRate(state).toFixed(1).replace('.0','')} 코인 · 최대 8시간`;
  $('idle-dot').style.display = state.idleCoins >= 1 ? 'block' : 'none';
  if ($('dock-amount')) $('dock-amount').textContent = format(state.idleCoins);
  document.querySelectorAll('[data-action="collect"]').forEach(b => b.disabled = state.idleCoins < 1);
}
function refresh() {
  const config = stats(state);
  $('coins').textContent = format(state.coins); $('level').textContent = `Lv. ${state.level}`;
  $('rod-name').textContent = RODS[state.rod].name; $('rod-sub').textContent = RODS[state.rod].sub;
  $('rod-tag').textContent = `강화 +${state.upgrade}`; $('bait-name').textContent = `${BAITS[state.bait].name} · ${state.baitStock[state.bait]}개`;
  $('cast-main').disabled = state.baitStock[state.bait] < 1;
  $('cast-main').innerHTML = state.baitStock[state.bait] > 0 ? '낚싯대 던지기 <span>↗</span>' : '미끼 없음 · 상점에서 구매';
  $('speed-stat').textContent = `${Math.round(config.speed)} / 초`;
  $('skill-count').textContent = `${state.equipped.length} / 3`;
  $('equipped-skills').innerHTML = Array.from({length:3},(_,i) => {
    const s = SKILLS.find(s => s.id === state.equipped[i]);
    return `<button class="skill-slot ${s ? 'filled' : ''}" data-go="skills" title="${s ? s.name : '스킬 선택'}" aria-label="${s ? s.name : '빈 스킬 슬롯, 스킬 선택'}">${s ? s.icon : '+'}</button>`;
  }).join('');
  $('total-catches').textContent = format(state.total); $('discovered').textContent = Object.keys(state.catches).length;
  $('species-total').textContent = `/ ${SPECIES.length}종`;
  $('xp-label').textContent = `${state.xp} / ${xpNeeded(state.level)} XP`;
  $('xp-fill').style.width = `${state.xp / xpNeeded(state.level) * 100}%`;
  $('best-catch').textContent = state.total ? SPECIES[state.best].label : '아직 탐험 중';
  refreshIdle();
  if (tab === 'gear') renderGear();
  if (tab === 'skills') renderSkills();
  if (tab === 'collection') renderCollection();
  if (tab === 'dock') renderDock();
  if (tab === 'fishing') drawEquipment();
}
function drawEquipment(){
  document.querySelectorAll('[data-prop]').forEach(canvas=>{
    if(!fitCanvas(canvas))return;
    const context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);
    drawProp(context,canvas.dataset.prop,canvas.width/2,canvas.height/2,canvas.width-20,canvas.height-16);
  });
}
function renderGear() {
  $('gear-content').innerHTML = `<h2 class="subheading">낚싯대 <span class="mini-label">RODS</span></h2><div class="gear-grid">${RODS.map((rod,i) => `<article class="gear-card ${i === state.rod ? 'selected' : ''}"><span class="mini-label">${['STARTER','EXPLORER','DEEP SEA'][i]}</span><div class="gear-art"><canvas class="equipment-preview" data-prop="rod" width="300" height="180" aria-label="낚싯대 도트 그림"></canvas></div><h3>${rod.name}</h3><p>${rod.sub}</p><div class="gear-specs"><span>속도 ${rod.speed}</span><span>안정성 ×${rod.grip}</span></div><button class="button ${i === state.rod ? '' : 'dark'}" data-buy="rod" data-index="${i}" ${i === state.rod || (!state.rods.includes(i) && state.coins < rod.cost) ? 'disabled' : ''}>${i === state.rod ? '사용 중' : state.rods.includes(i) ? '장착하기' : `✦ ${format(rod.cost)} · 구매`}</button></article>`).join('')}</div>
    <div class="upgrade-panel"><div><h3>낚싯대 강화 <span class="tag">+${state.upgrade} / 10</span></h3><p>강화당 이동 속도 +3.5%, 안정성 +7%, 도주 대기 -2.5%.<br>강화 효과는 낚싯대를 교체해도 유지돼요.</p></div><button class="button dark" data-action="upgrade" ${state.upgrade >= 10 || state.coins < upgradeCost(state) ? 'disabled' : ''}>${state.upgrade >= 10 ? '최대 강화 달성' : `✦ ${format(upgradeCost(state))} · 강화하기`}</button></div>
    <div class="upgrade-panel"><div><h3>재접근 연구 <span class="tag">+${state.recall} / 10</span></h3><p>희귀 어종이 바늘을 놓은 뒤 돌아오는 대기를 단계당 6.5% 줄여요.<br>참치: 현재 ${returnDelay(SPECIES[4],state).toFixed(2)}초 · 낚시와 조업 코인으로 연구</p></div><button class="button dark" data-action="recall" ${state.recall>=10||state.coins<recallCost(state)?'disabled':''}>${state.recall>=10?'최대 연구 완료':`✦ ${recallCost(state)} · 연구하기`}</button></div>
    <h2 class="subheading">미끼 상점 <span class="mini-label">BAIT INVENTORY</span></h2><p class="muted-note">조업선과 낚시로 번 코인으로 구매하세요. 성공한 포획마다 선택한 미끼 1개만 소모해요. 빈손 회수는 소모하지 않아요.</p><div class="gear-grid">${BAITS.map((bait,i)=>`<article class="gear-card ${i===state.bait?'selected':''}"><div class="gear-art"><canvas class="equipment-preview" data-prop="${['worm','lure','bobber','worm','lure'][i]}" width="300" height="180" aria-label="미끼 도트 그림"></canvas></div><h3>${bait.name} <span class="tag">${state.baitStock[i]}개 보유</span></h3><p>돌진 속도 ${Math.round(bait.attraction*100)}% · 도주 대기 ${Math.round(bait.fear*100)}%</p><button class="button dark" data-buy="bait" data-index="${i}" ${state.coins<bait.cost?'disabled':''}>✦ ${bait.cost} · ${bait.pack}개 구매</button><button class="button" data-equip-bait="${i}" ${i===state.bait||state.baitStock[i]<1?'disabled':''}>${i===state.bait?'선택 중':'이 미끼 선택'}</button></article>`).join('')}</div>`;
  drawEquipment();
}
function renderSkills() {
  $('skill-points').textContent = `${state.points} SP · ${state.equipped.length}/3 장착`;
  $('skills-content').innerHTML = ['유인','조작','성장'].map((branch,i) => `<div><h2 class="branch-title">${['♡','↗','✧'][i]} ${branch} <small>${['ATTRACTION','CONTROL','GROWTH'][i]}</small></h2>${SKILLS.filter(s => s.branch === branch).map(s => {
    const unlocked = state.unlocked.includes(s.id), equipped = has(state,s.id), locked = s.requires && !state.unlocked.includes(s.requires);
    const disabled = !unlocked && (locked || state.points < 1);
    return `<article class="skill-node ${equipped ? 'selected' : ''} ${locked ? 'locked' : ''}"><header><span>${s.icon}</span><h3>${s.name}</h3></header><p>${s.desc}</p><button class="button ${equipped ? 'dark' : ''}" data-skill="${s.id}" ${disabled ? 'disabled' : ''}>${equipped ? '✓ 장착 중 · 해제' : unlocked ? '스킬 장착' : locked ? `${SKILLS.find(k=>k.id === s.requires).name} 해금 필요` : '1 SP · 해금하기'}</button></article>`;
  }).join('')}</div>`).join('');
}
function renderCollection() {
  const behaviors = ['랜덤 방향키 3개 · 가까운 바늘로 돌진','랜덤 방향키 5개 · 가까운 바늘로 돌진','랜덤 방향키 7개 · 정확한 순서 입력','랜덤 방향키 10개 · 도주 1회 후 이어서 입력','랜덤 방향키 14개 · 도주 2회 후 이어서 입력'];
  $('collection-content').innerHTML = [...SPECIES].sort((a,b)=>a.sprite-b.sprite).map(s => `<article class="fish-card"><canvas class="fish-preview" data-fish="${s.id}" width="400" height="300" aria-label="${s.name} 도트 그림"></canvas><div class="fish-stars" aria-label="희귀도 ${s.rarity+1}단계">${'★'.repeat(s.rarity+1)}<span>${'★'.repeat(4-s.rarity)}</span></div><span class="rarity" style="color:${rarityColors[s.rarity]}">${s.label.toUpperCase()} · ${['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'][s.rarity]}</span><h3>${s.name}</h3><small class="scientific-name">${s.scientific || (s.artwork ? '실제 어종 기반 픽셀 아트' : '제공 이미지 기반')}</small><p class="fish-appearance">${s.appearance}</p><p>${s.desc}<br>${behaviors[s.rarity]}</p><span class="tag">${state.catches[s.id] ? '발견 완료' : '아직 만나지 못했어요'}</span><footer><span>✦ ${s.price} / 마리</span><span>${state.catches[s.id] || 0}마리 발견</span></footer><span class="species-reference">${s.artwork || '사용자 제공 도트 스프라이트'}</span></article>`).join('');
  document.querySelectorAll('[data-fish]').forEach(c => {
    fitCanvas(c);const k=c.getContext('2d');k.setTransform(c.width/400,0,0,c.height/300,0,0);
    const s=SPECIES.find(s=>s.id===c.dataset.fish);drawFish(k,s,200,150,1,90,1);
  });
}
function renderDock() {
  $('dock-content').innerHTML = `<div class="dock-layout"><div class="dock-scene"><canvas id="dock-sea" class="dock-pixel-scene" width="500" height="300" aria-label="도트 그래픽 자동 조업선"></canvas><h2>작은 항구, 든든한 조업선</h2><p>파도를 따라 오늘도 부지런히 항해 중</p></div><article class="card dock-info"><span class="eyebrow">YOUR LITTLE FLEET</span><h2>자동 조업선 <span class="tag">Lv. ${state.boat}</span></h2><p>게임이 닫혀 있어도 보상이 쌓여요.<br>보상은 최대 8시간 분량까지 보관돼요.</p><div class="idle-amount"><span>✦</span><b id="dock-amount">${format(state.idleCoins)}</b><small>수령 가능</small></div><button class="button dark" data-action="collect" ${state.idleCoins < 1 ? 'disabled' : ''}>조업 보상 받기 ↓</button><div class="loadout-row"><span>조업 속도</span><b>분당 ${idleRate(state).toFixed(1).replace('.0','')} 코인</b></div><div class="loadout-row"><span>최대 보관량</span><b>${format(idleRate(state)*480)} 코인</b></div><button class="button" data-action="boat" ${state.boat >= 6 || state.coins < boatCost(state) ? 'disabled' : ''}>${state.boat >= 6 ? '최대 레벨 달성' : `✦ ${format(boatCost(state))} · 조업선 강화`}</button><button class="button" data-go="gear">미끼 상점으로 ↗</button><p>조업 코인으로 미끼 5종을 구매할 수 있어요.</p><p>조업선 강화마다 기본 분당 수익 +3 코인.<br>부지런한 선원 스킬을 장착하면 수익이 40% 늘어요.</p></article></div>`;
  const dockCanvas=$('dock-sea');fitCanvas(dockCanvas);
  const dockContext=dockCanvas.getContext('2d');
  dockContext.setTransform(dockCanvas.width/1000,0,0,dockCanvas.height/600,0,0);
  drawPixelLandscape(dockContext,0);drawPixelBoat(dockContext,0,500,260);
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.tab || b.dataset.go) return navigate(b.dataset.tab || b.dataset.go);
  if (b.dataset.buy) {
    if (session) return;
    const kind = b.dataset.buy, i = Number(b.dataset.index), data = kind === 'rod' ? RODS : BAITS, owned = kind === 'rod' ? state.rods : state.baits;
    if (!data[i]) return;
    if (kind === 'bait') { if(buyBait(state,i)){state.bait=i;toast(data[i].name+' 10개 구매 및 선택 완료');save();refresh();} return; }
    if (!owned.includes(i)) { if (state.coins < data[i].cost) return; state.coins -= data[i].cost; owned.push(i); }
    state[kind] = i; toast(`${data[i].name} 장착 완료`); save(); refresh();
  }
  if (b.dataset.equipBait !== undefined && !session) { const i=Number(b.dataset.equipBait); if(state.baitStock[i]>0){state.bait=i;save();refresh();} }
  if(b.dataset.action==='recall' && !session && upgradeRecall(state)){toast('재접근 연구 +'+state.recall+' 완료');save();refresh();}
  if (b.dataset.skill) {
    if (session) return;
    const id = b.dataset.skill;
    if (!state.unlocked.includes(id)) {
      if (unlockSkill(state,id)) { if (state.equipped.length < 3) toggleSkill(state,id); toast('스킬을 해금했어요. 자유롭게 조합해 보세요.'); }
    } else if (!toggleSkill(state,id)) toast('최대 3개까지 장착할 수 있어요. 다른 스킬을 먼저 해제해 주세요.');
    save(); refresh();
  }
  if (b.dataset.action === 'collect') {
    const amount = collectIdle(state); if (amount) { toast(`조업선이 ${format(amount)} 코인을 가져왔어요.`); playTone(440); } save(); refresh();
  }
  if (b.dataset.action === 'upgrade' && !session && state.upgrade < 10 && state.coins >= upgradeCost(state)) {
    state.coins -= upgradeCost(state); state.upgrade++; toast(`낚싯대 강화 +${state.upgrade} 완료!`); save(); refresh();
  }
  if (b.dataset.action === 'boat' && state.boat < 6 && state.coins >= boatCost(state)) {
    accrueIdle(state); state.coins -= boatCost(state); state.boat++; toast(`자동 조업선 Lv. ${state.boat}로 성장했어요.`); save(); refresh();
  }
});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();navigate('fishing');});
$('sound-toggle').addEventListener('click', () => { sound = !sound; $('sound-toggle').innerHTML = `♪ <span>${sound ? 'ON' : 'OFF'}</span>`; $('sound-toggle').setAttribute('aria-label',`효과음 ${sound ? '끄기' : '켜기'}`); playTone(); });

function cast() {
  if (session) return;
  const nextCast=createCast(state);
  if(!nextCast){toast('미끼를 공방에서 구매해 주세요.');return;}
  keys.clear(); touchDirs.clear(); pointerTarget = null;
  Object.assign(hook,CAST_ORIGIN);
  fishPopulation.forEach(f => { f.progress=0;f.escapeLeft=0;f.escapes=0;f.biteWait=0;f.mode='routine'; });
  session = nextCast;
  $('sea-intro').hidden = true; $('session-hud').hidden = false; $('reel-button').disabled = false;
  $('session-count').textContent = '0'; $('timer').textContent = session.duration;
  $('touch-controls').hidden = !matchMedia('(pointer:coarse)').matches;
  $('pulse-button').hidden = !has(state,'pulse');
  drawScene(simulationTime);
  toast('물고기 가까이 바늘을 두고 잠시 기다리세요. 걸리면 방향키를 입력하세요.'); playTone(330);
}
function finish() {
  if (!session) return;
  const finished = session; session = null; pointerTarget = null; keys.clear(); touchDirs.clear();
  $('sea-intro').hidden = false; $('session-hud').hidden = true; $('reel-button').disabled = true;
  $('touch-controls').hidden = true; $('pulse-button').hidden = true;
  $('catch-challenge').hidden=true;
  $('result-content').innerHTML = Object.entries(finished.catches).map(([id,n]) => `<div class="result-row"><span>${SPECIES.find(s=>s.id===id).name}</span><b>${n}마리</b></div>`).join('') + `<div class="result-total">${finished.count}마리 · ✦ ${format(finished.coins)} 코인</div><p>${finished.count ? '미끼 1개 소모 · 바늘 회수 완료 · 판매 금액 정산 완료' : '방향키 또는 화면을 누르고 끌어 바늘을 조작해 보세요.'}</p>`;
  $('result-dialog').showModal(); save(); refresh();drawScene(simulationTime);
}
function pulse() {
  if (!session || session.phase !== 'fishing' || !has(state,'pulse') || session.cooldown > 0) return;
  session.pulse = 5; session.cooldown = 18; playTone(880); toast('5초 동안 돌진이 빨라지고 도주 대기가 빠르게 줄어요!');
}
$('cast-main').addEventListener('click',cast); $('reel-button').addEventListener('click',finish);
$('result-close').addEventListener('click',()=>$('result-dialog').close()); $('pulse-button').addEventListener('click',pulse);
window.addEventListener('keydown',e=>{
  if (!session || $('result-dialog').open || e.target.closest('input,textarea,select')) return;
  if(session.phase==='challenge'){
    const direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];
    if(direction){e.preventDefault();if(!e.repeat)enterDirection(direction);}
    return;
  }
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' '].includes(e.key)) {
    e.preventDefault(); keys.add(e.key.toLowerCase()); pointerTarget = null; if (e.key === ' ' && !e.repeat) pulse();
  }
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();touchDirs.clear();pointerTarget=null;});
function point(e) { const r = canvas.getBoundingClientRect(); return { x:(e.clientX-r.left)/r.width*1000, y:(e.clientY-r.top)/r.height*600 }; }
canvas.addEventListener('pointerdown',e=>{if (session?.phase!=='fishing') return; canvas.setPointerCapture(e.pointerId);pointerTarget=point(e);});
canvas.addEventListener('pointermove',e=>{if(session?.phase==='fishing' && canvas.hasPointerCapture(e.pointerId)) pointerTarget=point(e);});
canvas.addEventListener('pointerup',()=>pointerTarget=null); canvas.addEventListener('pointercancel',()=>pointerTarget=null);
document.querySelectorAll('[data-dir]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(session?.phase==='challenge'){enterDirection(b.dataset.dir);return;}b.setPointerCapture(e.pointerId);touchDirs.add(b.dataset.dir);pointerTarget=null;});
  for(const type of ['pointerup','pointercancel','lostpointercapture']) b.addEventListener(type,()=>touchDirs.delete(b.dataset.dir));
});
document.addEventListener('visibilitychange',()=>{
  keys.clear();touchDirs.clear();pointerTarget=null;
  if(document.hidden){accrueIdle(state);save();}
  else{accrueIdle(state);refresh();if(session && Date.now()-session.started >= session.duration*1000)finish();}
});
window.addEventListener('pagehide',()=>{accrueIdle(state);save();});
setInterval(()=>{accrueIdle(state);refreshIdle();},1000);
setInterval(save,10000);

const directionGlyph={up:'↑',down:'↓',left:'←',right:'→'};
let challengeDisplay='';
function renderChallenge(){
  const active=session?.phase==='challenge',panel=$('catch-challenge');panel.hidden=!active;
  if(!active){challengeDisplay='';return;}
  const c=session.challenge,signature=JSON.stringify([c.sequence,c.index,c.guards,c.feedback]);
  if(signature===challengeDisplay)return;challengeDisplay=signature;
  $('challenge-title').textContent=`${c.fish.species.name} · 방향키 ${c.sequence.length}개`;
  $('challenge-progress').textContent=`${c.index} / ${c.sequence.length} 성공 · 실수 보호 ${c.guards}회`;
  $('challenge-sequence').innerHTML=c.sequence.map((dir,i)=>`<span class="${i<c.index?'done':i===c.index?'current':''}" aria-label="${i+1}번째 ${directionGlyph[dir]}${i<c.index?' 완료':i===c.index?' 다음':''}">${directionGlyph[dir]}</span>`).join('');
  $('challenge-next').textContent=`다음 방향 ${directionGlyph[c.sequence[c.index]]}`;
  $('challenge-feedback').textContent=c.feedback;
  $('touch-controls').hidden=true;$('pulse-button').hidden=true;
}
function enterDirection(direction){
  handleFishingEvent(submitDirection(fishPopulation,session,direction,state));renderChallenge();
}
document.querySelectorAll('[data-catch-direction]').forEach(button=>button.addEventListener('click',()=>enterDirection(button.dataset.catchDirection)));
function handleFishingEvent(event){
  if(event?.type==='bite'){
    keys.clear();touchDirs.clear();pointerTarget=null;playTone(550);
  }
  if(event?.type==='escaped'){
    keys.clear();touchDirs.clear();pointerTarget=null;
    $('touch-controls').hidden=!matchMedia('(pointer:coarse)').matches;$('pulse-button').hidden=!has(state,'pulse');
    toast(event.fish.species.name+'가 바늘을 놓았어요. 재접근하면 남은 방향키를 이어서 입력하세요.');
  }
  if(event?.type==='caught'){
    $('session-count').textContent='1';$('reel-button').disabled=true;
    $('catch-popup').innerHTML=event.fish.species.name+'<small>+'+event.reward.coins+' 코인 · 미끼 1개 소모 · 자동 회수 중</small>';
    $('catch-popup').classList.add('show');clearTimeout(popupTimeout);popupTimeout=setTimeout(()=>$('catch-popup').classList.remove('show'),2200);
    playTone(700);save();refresh();
  }
  if(event?.type==='returned'||event?.type==='timeout')finish();
}

function update(dt,t) {
  if (session) {
    const remaining = Math.max(0,session.duration-(Date.now()-session.started)/1000);
    $('timer').textContent = Math.ceil(remaining);

    session.cooldown = Math.max(0,session.cooldown-dt);session.pulse = Math.max(0,session.pulse-dt);
    $('pulse-button').disabled = session.cooldown > 0;
    $('pulse-button').innerHTML = session.cooldown > 0 ? `◎ ${session.pulse > 0 ? '유인 중' : '재사용 대기'} <small>${Math.ceil(session.cooldown)}초</small>` : '◎ 물결의 속삭임 <small>SPACE</small>';
    let dx=0,dy=0;
    if (pointerTarget) { const target=screenToWorld(pointerTarget,cameraForHook(hook));dx=target.x-hook.x;dy=target.y-hook.y; }
    else {
      dx=(keys.has('arrowright')||keys.has('d')||touchDirs.has('right')?1:0)-(keys.has('arrowleft')||keys.has('a')||touchDirs.has('left')?1:0);
      dy=(keys.has('arrowdown')||keys.has('s')||touchDirs.has('down')?1:0)-(keys.has('arrowup')||keys.has('w')||touchDirs.has('up')?1:0);
      dx*=1000;dy*=1000;
    }
    if(session.phase==='fishing')moveHook(hook,dx,dy,stats(state).speed,dt);
  }
  const event=stepFishing(fishPopulation,session,hook,state,dt,t);
  handleFishingEvent(event);renderChallenge();
  if(session){
    const target=session.target,alertCount=fishPopulation.filter(f=>f.respawn<=0 && f.mode!=='routine').length;
    $('target-status').textContent=session.phase==='reeling'?'바늘 자동 회수 중':session.phase==='challenge'?target.species.name+' · 방향키 입력 중':(alertCount>1?alertCount+'마리 반응 · ':'')+(target?.mode==='fleeing'?target.species.name+' · 재접근 '+target.escapeLeft.toFixed(1)+'초':target?.biteWait>0?target.species.name+' · 입질 기다리는 중':target?target.species.name+' · 돌진 중':'물고기에 가까이 다가가세요');
  }
}
function drawFish(k,s,x,y,dir,size,alpha=1) {
  k.imageSmoothingEnabled=false;
  drawPixelFish(k,s,x,y,dir,size,alpha);
}
function resize() {
  // Render directly at the display's physical pixel size instead of stretching
  // the former 500 x 300 buffer. Game coordinates remain 1000 x 600.
  fitCanvas(canvas);
  drawScene(simulationTime);
}
new ResizeObserver(resize).observe(canvas);
window.addEventListener('resize',()=>{
  resize();drawEquipment();
  if(tab==='collection')renderCollection();
  if(tab==='dock')renderDock();
});
function drawScene(t) {
  ctx.setTransform(canvas.width/1000,0,0,canvas.height/600,0,0);
  $('world-map-panel').hidden=!session;
  if(!session){
    drawPixelLandscape(ctx,t,false);drawPixelBoat(ctx,t,500,260);
    $('world-region').textContent='노을 호수';$('world-depth').textContent='여섯 지역으로 떠나는 탐험';
    document.querySelector('.depth-scale').hidden=true;
    return;
  }
  const camera=cameraForHook(hook),depth=Math.max(0,Math.round((hook.y-100)/20));
  $('world-region').textContent=regionAt(hook).name;$('world-depth').textContent=`수심 ${depth} m`;
  $('world-coordinate').textContent=`동서 ${Math.round(hook.x/20)} m · 수심 ${depth} m`;
  document.querySelector('.depth-scale').hidden=false;
  document.querySelectorAll('.depth-scale span').forEach((label,i)=>label.textContent=`${Math.max(0,Math.round((camera.y+i*200-100)/20))} m`);
  const map=$('world-map');fitCanvas(map);drawMinimap(map.getContext('2d'),hook,camera);
  map.setAttribute('aria-label',`${regionAt(hook).name}, 동서 ${Math.round(hook.x/20)}미터, 수심 ${depth}미터`);
  drawWorld(ctx,camera,t);
  ctx.save();ctx.translate(-camera.x,-camera.y);
  if(camera.y<150)drawPixelBoat(ctx,t,RETURN_POINT.x-68,82);
  for(const f of fishPopulation)if(f.respawn<=0 && onScreen(f,camera)){
    drawPixelFish(ctx,f.species,f.x,f.y,f.dir,f.species.size,1,t);
    if(session && f.progress>0)pixelRing(ctx,f.x,f.y,f.species.size+14,'#f4df95',f.progress);
  }
  if(session){
    if(session.phase==='reeling' && session.target)drawPixelFish(ctx,session.target.species,hook.x+18,hook.y+16,1,session.target.species.size,1,t);
    const x=Math.round(hook.x/2)*2,y=Math.round(hook.y/2)*2;
    pixelLine(ctx,RETURN_POINT.x,66,x,y-12,'#cee2bc');
    if(session.pulse>0)pixelRing(ctx,x,y,stats(state).radius*(.85+Math.sin(t*5)*.1),'#badd96');
    pixelRing(ctx,x,y,stats(state).catchRadius,'#cfddaa50');
    const hookPixels=['Y....','w....','w....','w...w','w...w','.www.'];
    hookPixels.forEach((row,i)=>[...row].forEach((p,j)=>{if(p!=='.'){ctx.fillStyle=p==='Y'?'#efc76a':'#fff1c1';ctx.fillRect(x+j*2,y-8+i*2,2,2);}}));
  }
  ctx.restore();
}
let previous=performance.now(),simulationTime=0;
function frame(now) {
  const dt=Math.min(.05,(now-previous)/1000);previous=now;
  if(!document.hidden && tab==='fishing'){simulationTime+=dt;update(dt,simulationTime);drawScene(simulationTime);}
  requestAnimationFrame(frame);
}
try { await loadFishAtlas(); }
catch { toast('물고기 이미지 로딩에 실패했어요. 새로고침해 주세요.'); }
try { await loadVisualAssets(); }
catch { toast('풍경 이미지 로딩에 실패했어요. 새로고침해 주세요.'); }
refresh();drawEquipment();save();resize();requestAnimationFrame(frame);
