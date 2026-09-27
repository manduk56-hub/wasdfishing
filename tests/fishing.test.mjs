import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,normalizeSave,SPECIES,BAITS,buyBait,collectIdle,returnDelay,upgradeRecall,patternPosition} from '../game-core.js';
import {createFishPool,createCast,routineBounds,inRoutine,noticesHook,stepFishing} from '../fishing.js';

test('idle income buys consumable packs of every bait, with insufficient funds rejected',()=>{
  const s=initialState(0);s.coins=0;assert.equal(buyBait(s,4),false);
  collectIdle(s,8*3600000);const before=s.coins;
  BAITS.forEach((bait,i)=>{const stock=s.baitStock[i];assert.ok(buyBait(s,i));assert.equal(s.baitStock[i],stock+10);});
  assert.equal(s.coins,before-BAITS.reduce((a,b)=>a+b.cost,0));assert.equal(buyBait(s,99),false);
});
test('empty bait prevents casting; cancelling or timing out consumes no bait',()=>{
  const s=initialState(0);s.baitStock[0]=0;assert.equal(createCast(s,0),null);
  s.baitStock[0]=1;const run=createCast(s,0);
  assert.equal(stepFishing(createFishPool(),run,{x:950,y:100},s,.1,0,61000).type,'timeout');
  assert.equal(s.baitStock[0],1);assert.equal(s.total,0);
});
test('fish patrol their own invisible territories throughout long simulations',()=>{
  const pool=createFishPool(),state=initialState(0);
  for(let i=0;i<2400;i++){
    stepFishing(pool,null,{x:500,y:300},state,.05,i*.05,i*50);
    for(const fish of pool){assert.ok(inRoutine(fish,fish),fish.species.name+' stays home');assert.equal(fish.mode,'routine');}
  }
});
test('proximity triggers reactions; entering a territory far from its fish does not',()=>{
  const state=initialState(0),fish=createFishPool()[0];fish.anchor={x:500,y:300};
  const b=routineBounds(fish);fish.x=b.left;fish.y=300;
  const run=createCast(state,0),far={x:b.right,y:300};
  assert.ok(inRoutine(fish,far));assert.equal(noticesHook(fish,far,state),false);
  stepFishing([fish],run,far,state,.05,0,50);assert.equal(run.target,null);assert.equal(fish.mode,'routine');
  fish.x=b.right;fish.y=300;const near={x:b.right+15,y:300};
  assert.equal(inRoutine(fish,near),false);assert.ok(noticesHook(fish,near,state));
  stepFishing([fish],run,near,state,.05,0,100);assert.equal(run.target,fish);assert.notEqual(fish.mode,'routine');assert.ok(inRoutine(fish,fish));
  stepFishing([fish],run,{x:30,y:100},state,.05,1,150);
  assert.equal(run.target,null);assert.equal(fish.mode,'routine');assert.equal(fish.progress,0);
});
test('a detected fish keeps tracking near the boundary and attraction skills extend awareness',()=>{
  const state=initialState(0),fish=createFishPool()[0];fish.anchor={x:500,y:300};fish.x=500;fish.y=300;
  const run=createCast(state,0);stepFishing([fish],run,{x:600,y:300},state,.05,0,50);assert.equal(run.target,fish);
  stepFishing([fish],run,{x:640,y:300},state,.05,0,100);assert.equal(run.target,fish);
  const hook={x:fish.x+130,y:fish.y};assert.equal(noticesHook(fish,hook,state),false);
  state.equipped=['charm'];assert.equal(noticesHook(fish,hook,state),true);
});
function simulate(species,configure=()=>{}){
  const s=initialState(0);configure(s);const f=createFishPool().find(f=>f.species===species);
  f.anchor={x:500,y:450};f.x=500;f.y=450;
  const run=createCast(s,0),hook={x:500,y:450},events=[];
  for(let i=1;i<=1200;i++){
    const e=stepFishing([f],run,hook,s,.05,i*.05,i*50);if(e)events.push({...e,at:i*.05});
    if(run.phase==='done')break;
  }
  return {s,run,hook,f,events};
}
test('all nearby fish in overlapping territories chase together while distant fish patrol',()=>{
  const state=initialState(0),pool=createFishPool().slice(0,3),hook={x:500,y:300},run=createCast(state,0);
  pool.forEach((fish,i)=>{fish.anchor={x:500+i*30,y:300};fish.x=i===2?760:480+i*60;fish.y=300;});
  const before=pool.map(f=>Math.hypot(f.x-hook.x,f.y-hook.y));
  stepFishing(pool,run,hook,state,.1,0,100);
  for(let i=0;i<2;i++){
    assert.notEqual(pool[i].mode,'routine');
    assert.ok(Math.hypot(pool[i].x-hook.x,pool[i].y-hook.y)<before[i]);
    assert.ok(inRoutine(pool[i],pool[i]));
  }
  assert.equal(pool[2].mode,'routine');
  stepFishing(pool,run,{x:30,y:100},state,.1,1,200);
  assert.equal(run.target,null);assert.ok(pool.every(f=>f.mode==='routine'));
});
test('simultaneous aggro captures only one fish and consumes exactly one bait',()=>{
  const state=initialState(0),pool=createFishPool().slice(0,2),hook={x:500,y:300},run=createCast(state,0);
  pool.forEach(f=>{f.anchor={...hook};f.x=500;f.y=300;});
  let caught=0;
  for(let i=1;i<300;i++){
    const event=stepFishing(pool,run,hook,state,.05,i*.05,i*50);
    if(event?.type==='caught')caught++;
    if(run.phase==='done')break;
  }
  assert.equal(caught,1);assert.equal(state.total,1);assert.equal(state.baitStock[0],19);
  assert.equal(run.count,1);assert.equal(run.phase,'done');
  assert.ok(pool.filter(f=>f.respawn<=0).every(f=>f.mode==='routine'));
});
test('successful capture consumes exactly one bait, rewards one fish and returns hook automatically',()=>{
  const {s,run,hook,f,events}=simulate(SPECIES[0]);
  assert.equal(s.baitStock[0],19);assert.equal(s.total,1);assert.equal(run.count,1);assert.equal(run.phase,'done');
  assert.deepEqual(events.map(e=>e.type),['caught','returned']);assert.ok(Math.hypot(hook.x-568,hook.y-90)<2);
  const coins=s.coins;for(let i=0;i<100;i++)stepFishing([f],run,hook,s,.05,100,1000);
  assert.equal(s.total,1);assert.equal(s.coins,coins);assert.equal(s.baitStock[0],19);
});
test('epic and legendary fish release, flee, return and require longer capture',()=>{
  const common=simulate(SPECIES[0]),epic=simulate(SPECIES[3]),legend=simulate(SPECIES[4]);
  assert.equal(epic.events.filter(e=>e.type==='escaped').length,1);
  assert.equal(legend.events.filter(e=>e.type==='escaped').length,2);
  for(const result of [epic,legend]){
    assert.equal(result.run.phase,'done');assert.equal(result.s.total,1);assert.equal(result.s.baitStock[0],19);
    assert.ok(result.events.find(e=>e.type==='caught').at>common.events.find(e=>e.type==='caught').at+4);
  }
});
test('research paid with gameplay coins, bait and stealth reduce real rare-fish wait and total time',()=>{
  const base=simulate(SPECIES[4]);const boosted=simulate(SPECIES[4],s=>{s.coins=3000;for(let i=0;i<5;i++)assert.ok(upgradeRecall(s));});
  assert.ok(returnDelay(SPECIES[4],boosted.s)<returnDelay(SPECIES[4],base.s));
  assert.ok(boosted.events.find(e=>e.type==='caught').at<base.events.find(e=>e.type==='caught').at);
  const before=boosted.s.coins;boosted.s.recall=10;assert.equal(upgradeRecall(boosted.s),false);assert.equal(boosted.s.coins,before);
  boosted.s.equipped=['stealth'];boosted.s.bait=4;assert.ok(returnDelay(SPECIES[4],boosted.s)<1);
});
test('old saves migrate once; zero stocks and research survive subsequent reloads',()=>{
  const migrated=normalizeSave({version:1,coins:700,baits:[0,1,2],bait:2},0);
  assert.equal(migrated.coins,700);assert.deepEqual(migrated.baitStock,[20,10,10,0,0]);assert.equal(migrated.version,2);
  migrated.baitStock=[0,0,0,0,0];migrated.recall=4;
  const reload=normalizeSave(JSON.parse(JSON.stringify(migrated)),0);
  assert.deepEqual(reload.baitStock,[0,0,0,0,0]);assert.equal(reload.recall,4);assert.equal(createCast(reload),null);
});
test('all twenty fish appear in the population and complete the full capture cycle',()=>{
  const pool=createFishPool();
  assert.equal(SPECIES.length,20);
  for(const species of SPECIES){
    assert.ok(pool.some(f=>f.species.id===species.id),species.name+' must spawn');
    const result=simulate(species);
    assert.equal(result.run.phase,'done',species.name+' must return');
    assert.equal(result.s.catches[species.id],1,species.name+' must be catchable');
    assert.equal(result.s.baitStock[0],19);
  }
});
