export const SPECIES = [
  {
    "id": "anchovy",
    "name": "붕어",
    "scientific": "",
    "appearance": "금빛 비늘과 넓은 몸, 갈색 지느러미.",
    "source": "",
    "rarity": 0,
    "label": "일반",
    "color": "#a3d8d3",
    "price": 18,
    "xp": 10,
    "speed": 32,
    "pattern": "shoal",
    "desc": "얕은 물에서 무리를 지어 작은 물결을 그립니다.",
    "depth": [
      100,
      240
    ],
    "size": 13,
    "sprite": 0
  },
  {
    "id": "clown",
    "name": "흰동가리",
    "scientific": "",
    "appearance": "주황색 몸과 흰 띠, 검은 테두리.",
    "source": "",
    "rarity": 1,
    "label": "고급",
    "color": "#f6aa72",
    "price": 38,
    "xp": 18,
    "speed": 27,
    "pattern": "orbit",
    "desc": "산호 주위를 원을 그리며 순찰합니다.",
    "depth": [
      190,
      370
    ],
    "size": 18,
    "sprite": 8
  },
  {
    "id": "tang",
    "name": "송어",
    "scientific": "",
    "appearance": "옆구리의 분홍 줄과 검은 점무늬.",
    "source": "",
    "rarity": 2,
    "label": "희귀",
    "color": "#66b5ef",
    "price": 85,
    "xp": 32,
    "speed": 38,
    "pattern": "zigzag",
    "desc": "일정한 간격으로 방향을 바꾸며 지그재그로 헤엄칩니다.",
    "depth": [
      260,
      480
    ],
    "size": 23,
    "sprite": 2
  },
  {
    "id": "ray",
    "name": "메기",
    "scientific": "",
    "appearance": "갈색 몸과 입 주변의 긴 수염.",
    "source": "",
    "rarity": 3,
    "label": "영웅",
    "color": "#c7b775",
    "price": 180,
    "xp": 55,
    "speed": 28,
    "pattern": "wave",
    "desc": "깊은 수심에서 넓고 느린 파도를 그립니다.",
    "depth": [
      350,
      560
    ],
    "size": 29,
    "sprite": 3
  },
  {
    "id": "gold",
    "name": "참치",
    "scientific": "",
    "appearance": "푸른 등과 은빛 배, 노란 지느러미.",
    "source": "",
    "rarity": 4,
    "label": "전설",
    "color": "#ebcc79",
    "price": 420,
    "xp": 100,
    "speed": 43,
    "pattern": "patrol",
    "desc": "깊은 곳을 직선으로 순찰하다 끝에서 방향을 바꿉니다.",
    "depth": [
      420,
      565
    ],
    "size": 28,
    "sprite": 6
  },
  {
    "id": "bass",
    "name": "배스",
    "sprite": 1,
    "rarity": 1,
    "color": "#7f9845",
    "price": 42,
    "xp": 20,
    "speed": 34,
    "pattern": "patrol",
    "depth": [
      170,
      320
    ],
    "size": 22,
    "appearance": "녹색 몸, 짙은 옆줄과 크게 벌어진 입.",
    "scientific": "",
    "source": "",
    "label": "고급",
    "desc": "활동 구역의 양 끝을 직선으로 왕복합니다."
  },
  {
    "id": "eel",
    "name": "장어",
    "sprite": 4,
    "rarity": 3,
    "color": "#627085",
    "price": 210,
    "xp": 60,
    "speed": 36,
    "pattern": "wave",
    "depth": [
      340,
      520
    ],
    "size": 27,
    "appearance": "길게 굽은 남색 몸과 밝은 배.",
    "scientific": "",
    "source": "",
    "label": "영웅",
    "desc": "활동 구역에서 큰 물결을 그리며 헤엄칩니다."
  },
  {
    "id": "puffer",
    "name": "복어",
    "sprite": 5,
    "rarity": 2,
    "color": "#d9ac42",
    "price": 95,
    "xp": 35,
    "speed": 23,
    "pattern": "orbit",
    "depth": [
      260,
      420
    ],
    "size": 23,
    "appearance": "둥근 노란 몸, 작은 가시와 얼룩.",
    "scientific": "",
    "source": "",
    "label": "희귀",
    "desc": "활동 구역 안을 원형으로 순찰합니다."
  },
  {
    "id": "salmon",
    "name": "연어",
    "sprite": 7,
    "rarity": 2,
    "color": "#c77e65",
    "price": 100,
    "xp": 38,
    "speed": 41,
    "pattern": "zigzag",
    "depth": [
      230,
      440
    ],
    "size": 25,
    "appearance": "회청색 등과 살구빛 배, 주황 지느러미.",
    "scientific": "",
    "source": "",
    "label": "희귀",
    "desc": "활동 구역에서 일정한 지그재그를 그립니다."
  },
  {
    "id": "angler",
    "name": "아귀",
    "sprite": 9,
    "rarity": 4,
    "color": "#947394",
    "price": 550,
    "xp": 120,
    "speed": 22,
    "pattern": "orbit",
    "depth": [
      440,
      565
    ],
    "size": 30,
    "appearance": "보라색 몸, 발광하는 유인 돌기와 큰 이빨.",
    "scientific": "",
    "source": "",
    "label": "전설",
    "desc": "활동 구역 안을 원형으로 순찰합니다."
  }
];
// Additional real-fish sprites; existing IDs stay stable for saved collections.
SPECIES.push(...[
  { id:'carp', name:'잉어', rarity:0, color:'#c9a85d', price:24, xp:12, speed:26, pattern:'wave', depth:[130,290], size:23, appearance:'청동빛 비늘과 넓은 몸, 입가의 짧은 수염.', desc:'얕은 수심에서 완만한 물결을 따라 헤엄칩니다.' },
  { id:'chub', name:'피라미', rarity:0, color:'#8cc7c5', price:16, xp:9, speed:45, pattern:'shoal', depth:[110,250], size:15, appearance:'청록빛 등과 은색 배를 가진 날씬한 몸.', desc:'얕은 물에서 빠르게 무리의 흐름을 따라갑니다.' },
  { id:'mandarin', name:'쏘가리', rarity:2, color:'#b59a48', price:115, xp:40, speed:25, pattern:'patrol', depth:[280,460], size:22, appearance:'황갈색 몸에 짙은 얼룩과 뾰족한 등지느러미.', desc:'중간 수심의 한 구간을 천천히 왕복합니다.' },
  { id:'snakehead', name:'가물치', rarity:3, color:'#627447', price:240, xp:65, speed:31, pattern:'zigzag', depth:[330,520], size:29, appearance:'길고 어두운 얼룩 몸과 길게 이어지는 등지느러미.', desc:'깊은 물에서 각진 경로를 따라 방향을 바꿉니다.' },
  { id:'seabass', name:'농어', rarity:2, color:'#9faeb9', price:125, xp:42, speed:40, pattern:'patrol', depth:[250,440], size:26, appearance:'은회색의 긴 몸과 어두운 등지느러미.', desc:'정해진 순찰 구간을 빠르게 오갑니다.' },
  { id:'mackerel', name:'고등어', rarity:1, color:'#4c999e', price:45, xp:21, speed:48, pattern:'shoal', depth:[190,350], size:21, appearance:'푸른 등 위의 줄무늬와 밝은 은색 배.', desc:'중간 수심에서 빠른 작은 물결을 그립니다.' },
  { id:'seabream', name:'참돔', rarity:3, color:'#d48289', price:275, xp:70, speed:29, pattern:'orbit', depth:[350,540], size:25, appearance:'분홍빛 비늘과 푸른 점, 높고 뾰족한 등지느러미.', desc:'깊은 수심에서 일정한 타원을 따라 움직입니다.' },
  { id:'flounder', name:'넙치', rarity:2, color:'#8a744e', price:110, xp:39, speed:18, pattern:'wave', depth:[390,555], size:24, appearance:'갈색 얼룩의 납작한 몸과 위쪽에 모인 두 눈.', desc:'바닥 가까이에서 낮은 물결을 따라 천천히 이동합니다.' },
  { id:'seahorse', name:'해마', rarity:3, color:'#d4aa53', price:230, xp:62, speed:15, pattern:'orbit', depth:[310,490], size:14, appearance:'금빛의 세운 몸과 굽은 목, 말린 꼬리.', desc:'좁은 타원 궤도를 느린 속도로 맴돕니다.' },
  { id:'marlin', name:'청새치', rarity:4, color:'#4b81bc', price:650, xp:135, speed:55, pattern:'patrol', depth:[420,565], size:32, appearance:'푸른 등과 은빛 배, 길게 뻗은 주둥이와 초승달 꼬리.', desc:'가장 깊은 순찰 구간을 빠르게 가로지릅니다.' }
].map((fish,index)=>({ ...fish, sprite:10+index, scientific:'', source:'', artwork:'추가 제작 도트 스프라이트', label:['일반','고급','희귀','영웅','전설'][fish.rarity] })));

export const RODS = [
  { name: '바닷바람 낚싯대', sub: '가볍고 균형 잡힌 첫 낚싯대', cost: 0, speed: 125, grip: 1, icon: '◡' },
  { name: '산호빛 카본 로드', sub: '빠른 조작과 안정적인 포획', cost: 450, speed: 157, grip: 1.3, icon: '⌁' },
  { name: '심해의 은빛 로드', sub: '희귀 어종을 위한 정밀한 제어', cost: 1400, speed: 185, grip: 1.65, icon: '✧' }
];
export const BAITS = [
  { name: '작은 새우', cost: 15, pack: 10, fear: 1, attraction: 1 },
  { name: '빛나는 크릴', cost: 35, pack: 10, fear: 0.85, attraction: 1.15 },
  { name: '심해 페로몬', cost: 70, pack: 10, fear: 0.65, attraction: 1.3 },
  { name: '오징어 살', cost: 45, pack: 10, fear: 0.75, attraction: 1.1 },
  { name: '발광 플랑크톤', cost: 110, pack: 10, fear: 0.5, attraction: 1.5 }
];
export const SKILLS = [
  { id: 'charm', name: '바다의 유혹', branch: '유인', icon: '♡', desc: '활동 범위에서 바늘을 향하는 돌진 속도 +25%.', requires: null },
  { id: 'stealth', name: '고요한 바늘', branch: '유인', icon: '◈', desc: '희귀 물고기의 도주 후 재접근 대기 35% 감소.', requires: 'charm' },
  { id: 'pulse', name: '물결의 속삭임', branch: '유인', icon: '◎', desc: '스페이스 / 스킬 버튼: 5초 동안 돌진 속도 증가, 도주 대기 빠르게 회복. 재사용 18초.', requires: 'stealth' },
  { id: 'agile', name: '날렵한 손끝', branch: '조작', icon: '↗', desc: '바늘의 이동 속도 +25%.', requires: null },
  { id: 'grip', name: '단단한 매듭', branch: '조작', icon: '⌘', desc: '포획 안정성 +35%로 방향키 실수 보호 증가, 포획 거리 +6.', requires: 'agile' },
  { id: 'patient', name: '오래 머무는 낚시', branch: '조작', icon: '◷', desc: '한 번의 탐험 시간 +60초.', requires: 'grip' },
  { id: 'value', name: '보물 감별사', branch: '성장', icon: '✧', desc: '직접 잡은 물고기의 판매 금액 +25%.', requires: null },
  { id: 'learn', name: '바다의 지식', branch: '성장', icon: '▤', desc: '직접 낚시 경험치 +35%.', requires: 'value' },
  { id: 'idle', name: '부지런한 선원', branch: '성장', icon: '⚑', desc: '자동 조업선의 방치 수익 +40%.', requires: 'learn' }
];
export const SAVE_KEY = 'tideline-save-v1';
export function initialState(now = Date.now()) {
  return { version: 2, coins: 180, xp: 0, level: 1, points: 2, rod: 0, rods: [0], bait: 0, baits: [0], baitStock: [20,0,0,0,0], recall: 0, upgrade: 0, unlocked: [], equipped: [], catches: {}, total: 0, best: 0, boat: 1, idleCoins: 0, idleUpdated: now, lastCatch: null };
}
export function normalizeSave(input, now = Date.now()) {
  const base = initialState(now);
  if (!input || ![1,2].includes(input.version)) return base;
  for (const key of ['coins','xp','level','points','upgrade','total','best','boat','idleCoins','idleUpdated']) {
    if (Number.isFinite(input[key]) && input[key] >= 0) base[key] = input[key];
  }
  base.boat = Math.max(1, Math.min(6, Math.floor(base.boat)));
  base.level = Math.max(1, Math.floor(base.level));
  base.best = Math.min(4, Math.floor(base.best));
  base.upgrade = Math.min(10, Math.floor(base.upgrade));
  base.rods = [...new Set([0, ...(Array.isArray(input.rods) ? input.rods.filter(n => Number.isInteger(n) && RODS[n]) : [])])];
  base.baits = [...new Set([0, ...(Array.isArray(input.baits) ? input.baits.filter(n => Number.isInteger(n) && BAITS[n]) : [])])];
  base.recall = Number.isFinite(input.recall) ? Math.max(0,Math.min(10,Math.floor(input.recall))) : 0;
  base.baitStock = BAITS.map((_,i) => input.version === 1 ? (i === 0 ? 20 : base.baits.includes(i) ? 10 : 0) : Number.isFinite(input.baitStock?.[i]) ? Math.max(0,Math.floor(input.baitStock[i])) : 0);
  base.rod = base.rods.includes(input.rod) ? input.rod : 0;
  base.bait = base.baits.includes(input.bait) ? input.bait : 0;
  base.unlocked = [...new Set(Array.isArray(input.unlocked) ? input.unlocked.filter(id => SKILLS.some(s => s.id === id)) : [])];
  base.equipped = [...new Set(Array.isArray(input.equipped) ? input.equipped.filter(id => base.unlocked.includes(id)) : [])].slice(0,3);
  for (const fish of SPECIES) {
    const count = input.catches?.[fish.id];
    if (Number.isFinite(count) && count > 0) base.catches[fish.id] = Math.floor(count);
  }
  base.lastCatch = SPECIES.some(s => s.id === input.lastCatch) ? input.lastCatch : null;
  return base;
}
export const has = (state, skill) => state.equipped.includes(skill);
export const xpNeeded = level => 60 + level * 40;
export const upgradeCost = state => 100 + state.upgrade * 85;
export const boatCost = state => 250 * state.boat ** 2;
export const recallCost = state => 120 + state.recall * 90;
export function buyBait(state,index) {
  const bait=BAITS[index]; if(!bait || state.coins < bait.cost) return false;
  state.coins-=bait.cost; state.baitStock[index]+=bait.pack;
  if(!state.baits.includes(index))state.baits.push(index);
  return true;
}
export function upgradeRecall(state) {
  if(state.recall>=10 || state.coins<recallCost(state))return false;
  state.coins-=recallCost(state);state.recall++;return true;
}
export const idleRate = state => (2 + (state.boat - 1) * 3) * (has(state,'idle') ? 1.4 : 1);
export function accrueIdle(state, now = Date.now()) {
  const elapsed = Math.min(8 * 3600_000, Math.max(0, now - state.idleUpdated));
  state.idleCoins = Math.min(idleRate(state) * 480, state.idleCoins + elapsed / 60000 * idleRate(state));
  state.idleUpdated = now;
  return elapsed;
}
export function collectIdle(state, now = Date.now()) {
  accrueIdle(state, now);
  const amount = Math.floor(state.idleCoins);
  state.coins += amount; state.idleCoins -= amount;
  return amount;
}
export function stats(state) {
  return { speed: RODS[state.rod].speed * (1 + state.upgrade * 0.035) * (has(state,'agile') ? 1.25 : 1),
    grip: RODS[state.rod].grip * (1 + state.upgrade * 0.07) * (has(state,'grip') ? 1.35 : 1),
    radius: 110 * (has(state,'charm') ? 1.35 : 1), catchRadius: 24 + (has(state,'grip') ? 6 : 0),
    fear: BAITS[state.bait].fear * (has(state,'stealth') ? 0.65 : 1) * Math.max(0.6, 1 - state.upgrade * 0.025),
    attraction: BAITS[state.bait].attraction * (has(state,'charm') ? 1.25 : 1), duration: 180 + (has(state,'patient') ? 60 : 0) };
}
export function hookInfluence(species, distance, state, pulse = false) {
  const config = stats(state);
  if (distance > config.radius) return 0;
  const tendency = (90 - species.rarity * 10) * config.attraction * (pulse ? 1.8 : 1);
  return tendency * (1 - distance / config.radius);
}
export function returnDelay(species,state) {
  return Math.max(.65,(2+species.rarity*.8)*stats(state).fear*(1-state.recall*.065));
}
export function patternPosition(species, t, anchor, phase = 0) {
  const p = t * species.speed / 90 + phase;
  switch (species.pattern) {
    case 'shoal': return { x: anchor.x + Math.sin(p * 0.55) * 135, y: anchor.y + Math.sin(p * 1.4) * 17 };
    case 'orbit': return { x: anchor.x + Math.cos(p * 0.65) * 85, y: anchor.y + Math.sin(p * 0.65) * 44 };
    case 'zigzag': return { x: anchor.x + Math.sin(p * 0.65) * 120, y: anchor.y + (2 / Math.PI) * Math.asin(Math.sin(p * 1.4)) * 36 };
    case 'wave': return { x: anchor.x + Math.sin(p * 0.42) * 155, y: anchor.y + Math.sin(p * 0.84) * 46 };
    default: return { x: anchor.x + (2 / Math.PI) * Math.asin(Math.sin(p * 0.6)) * 165, y: anchor.y + Math.sin(p * 0.35) * 10 };
  }
}
export function awardCatch(state, fish) {
  const coins = Math.round(fish.price * (has(state,'value') ? 1.25 : 1));
  state.coins += coins; state.xp += Math.round(fish.xp * (has(state,'learn') ? 1.35 : 1));
  state.catches[fish.id] = (state.catches[fish.id] || 0) + 1; state.total++; state.lastCatch = fish.id; state.best = Math.max(state.best, fish.rarity);
  let levels = 0;
  while (state.xp >= xpNeeded(state.level)) { state.xp -= xpNeeded(state.level); state.level++; state.points++; levels++; }
  return { coins, levels };
}
export function unlockSkill(state, id) {
  const skill = SKILLS.find(s => s.id === id);
  if (!skill || state.points < 1 || state.unlocked.includes(id) || (skill.requires && !state.unlocked.includes(skill.requires))) return false;
  state.points--; state.unlocked.push(id); return true;
}
export function toggleSkill(state, id, now = Date.now()) {
  if (!state.unlocked.includes(id)) return false;
  const index = state.equipped.indexOf(id);
  if (index === -1 && state.equipped.length >= 3) return false;
  accrueIdle(state, now);
  if (index !== -1) state.equipped.splice(index,1); else state.equipped.push(id);
  return true;
}
