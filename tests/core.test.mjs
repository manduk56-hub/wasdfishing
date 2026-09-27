import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, normalizeSave, SPECIES, SKILLS, stats, hookInfluence, patternPosition, awardCatch, unlockSkill, toggleSkill, accrueIdle, collectIdle, idleRate, xpNeeded } from '../game-core.js';

test('all fish approach a hook; common fish rush faster and pulse accelerates',()=>{
  const state=initialState(0);
  for(const fish of SPECIES){assert.ok(hookInfluence(fish,30,state)>0);assert.equal(hookInfluence(fish,200,state),0);}
  assert.ok(hookInfluence(SPECIES[0],30,state)>hookInfluence(SPECIES[4],30,state));
  assert.ok(hookInfluence(SPECIES[4],30,state,true)>hookInfluence(SPECIES[4],30,state));
});
test('species movement is repeatable, distinct and finite at all sampled times',()=>{
  const anchor={x:500,y:300};
  for(const fish of SPECIES){for(const t of [0,1,10,100,10000]){const p=patternPosition(fish,t,anchor,.7);assert.deepEqual(p,patternPosition(fish,t,anchor,.7));assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));}}
  assert.equal(new Set(SPECIES.map(s=>JSON.stringify(patternPosition(s,10,anchor,.7)))).size,SPECIES.length);
});
test('gear and skills improve control, capture and rush',()=>{
  const state=initialState(0),base=stats(state),force=hookInfluence(SPECIES[4],30,state);
  state.bait=2;state.rod=2;state.upgrade=5;state.equipped=['stealth','agile','grip'];
  assert.ok(stats(state).speed>base.speed);assert.ok(stats(state).grip>base.grip);assert.ok(stats(state).catchRadius>base.catchRadius);
  assert.ok(hookInfluence(SPECIES[4],30,state)>force);
});
test('skill prerequisites, point spending and three-slot limit are enforced',()=>{
  const state=initialState(0);state.points=20;
  assert.equal(unlockSkill(state,'pulse'),false);assert.equal(unlockSkill(state,'missing'),false);
  for(const skill of SKILLS)assert.equal(unlockSkill(state,skill.id),true);
  assert.equal(state.points,11);assert.equal(unlockSkill(state,'charm'),false);
  for(const id of ['charm','agile','value'])assert.equal(toggleSkill(state,id,0),true);
  assert.equal(toggleSkill(state,'stealth',0),false);assert.equal(toggleSkill(state,'agile',0),true);assert.equal(toggleSkill(state,'stealth',0),true);
  assert.equal(state.equipped.length,3);
});
test('catch rewards sell immediately, record discoveries and support multiple level-ups',()=>{
  const state=initialState(0);state.equipped=['value','learn'];state.xp=95;
  const reward=awardCatch(state,SPECIES[4]);assert.equal(reward.coins,525);assert.equal(state.coins,705);
  assert.equal(state.catches.gold,1);assert.equal(state.total,1);assert.equal(state.best,4);assert.equal(state.lastCatch,'gold');
  assert.equal(reward.levels,1);assert.equal(state.level,2);assert.equal(state.points,3);assert.ok(state.xp<xpNeeded(state.level));
  state.xp=1000;const multiple=awardCatch(state,SPECIES[0]);assert.ok(multiple.levels>1);assert.ok(state.xp<xpNeeded(state.level));
});
test('idle accumulation survives offline time, is capped and cannot be claimed twice',()=>{
  const state=initialState(0);accrueIdle(state,10*3600000);assert.equal(state.idleCoins,960);
  assert.equal(collectIdle(state,10*3600000),960);assert.equal(collectIdle(state,10*3600000),0);assert.equal(state.coins,1140);
  accrueIdle(state,10*3600000+30000);assert.equal(state.idleCoins,1);
  accrueIdle(state,1);assert.equal(state.idleCoins,1);
});
test('equipping idle skill settles prior time at the previous rate',()=>{
  const state=initialState(0);state.unlocked=['idle'];toggleSkill(state,'idle',60000);
  assert.equal(state.idleCoins,2);assert.equal(idleRate(state),2.8);
  accrueIdle(state,120000);assert.equal(state.idleCoins,4.8);
});
test('save round-trip and malformed save recovery keep loadouts valid',()=>{
  const original=initialState(1234);original.unlocked=['charm'];original.equipped=['charm'];
  awardCatch(original,SPECIES[0]);awardCatch(original,SPECIES.find(s=>s.id==='carp'));awardCatch(original,SPECIES.find(s=>s.id==='marlin'));
  assert.deepEqual(normalizeSave(JSON.parse(JSON.stringify(original)),1234),original);
  const fixed=normalizeSave({version:1,coins:-9,rod:9,bait:8,rods:[1,1,-1],baits:[2],unlocked:['charm','charm','bad'],equipped:['bad','charm','charm'],boat:99,upgrade:999,best:999,catches:{gold:2,ray:-1}},0);
  assert.equal(fixed.coins,180);assert.equal(fixed.rod,0);assert.equal(fixed.bait,0);assert.deepEqual(fixed.equipped,['charm']);assert.equal(fixed.boat,6);assert.equal(fixed.upgrade,10);assert.deepEqual(fixed.catches,{gold:2});
  assert.equal(fixed.best,4);
  assert.deepEqual(normalizeSave(null,0),initialState(0));
});
