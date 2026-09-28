import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,SPECIES} from '../game-core.js';
import {DIRECTIONS,catchDifficulty,biteDelay,createFishPool,createCast,stepFishing,submitDirection} from '../fishing.js';
function bite(species=SPECIES[0],configure=()=>{}){
  const state=initialState(0);configure(state);
  const fish=createFishPool().find(f=>f.species===species),hook={x:fish.x,y:fish.y},pool=[fish],run=createCast(state,0);
  for(let i=1;i<100&&run.phase==='fishing';i++)stepFishing(pool,run,hook,state,.05,i*.05,i*50);
  assert.equal(run.phase,'challenge');
  return {state,fish,hook,pool,run};
}
test('every species gets its difficulty count of random valid directions, and waiting never catches it',()=>{
  const sequences=new Set();
  for(const species of SPECIES){
    const {state,fish,hook,pool,run}=bite(species);
    assert.equal(run.challenge.sequence.length,[3,5,7,10,14][species.rarity]);
    assert.ok(run.challenge.sequence.every(dir=>DIRECTIONS.includes(dir)));
    sequences.add(run.challenge.sequence.join(','));
    for(let i=0;i<400;i++)stepFishing(pool,run,hook,state,.05,i*.05,i*50);
    assert.equal(run.phase,'challenge');assert.equal(fish.progress,0);assert.equal(state.total,0);assert.equal(state.baitStock[0],20);
  }
  assert.ok(sequences.size>5);
});
test('a fish waits at the hook before biting, and the full sequence catches it',()=>{
  const state=initialState(0),fish=createFishPool()[0],hook={x:fish.x,y:fish.y},run=createCast(state,0);
  const steps=10;
  for(let i=1;i<=steps;i++)stepFishing([fish],run,hook,state,.05,i*.05,i*50);
  assert.equal(run.phase,'fishing');assert.equal(state.total,0);assert.ok(fish.biteWait<biteDelay(fish.species));
  for(let i=steps+1;i<100&&run.phase==='fishing';i++)stepFishing([fish],run,hook,state,.05,i*.05,i*50);
  assert.equal(run.phase,'challenge');
});
test('only the full correct sequence catches a fish, with one reward and one bait consumed',()=>{
  const {state,pool,run}=bite();const sequence=[...run.challenge.sequence];
  for(let i=0;i<sequence.length-1;i++){
    assert.equal(submitDirection(pool,run,sequence[i],state).type,'input');assert.equal(state.total,0);
  }
  assert.equal(submitDirection(pool,run,sequence.at(-1),state).type,'caught');
  assert.equal(run.phase,'fishing');assert.equal(state.total,1);assert.equal(state.baitStock[0],19);
  assert.equal(submitDirection(pool,run,sequence.at(-1),state),null);assert.equal(state.total,1);
});
test('wrong directions restart progress; invalid input cannot advance the challenge',()=>{
  const {state,fish,pool,run}=bite();submitDirection(pool,run,run.challenge.sequence[0],state);
  assert.equal(run.challenge.index,1);
  assert.equal(submitDirection(pool,run,'w',state),null);assert.equal(run.challenge.index,1);
  const wrong=DIRECTIONS.find(d=>d!==run.challenge.sequence[1]);
  assert.equal(submitDirection(pool,run,wrong,state).type,'wrong');
  assert.equal(run.challenge.index,0);assert.equal(fish.progress,0);assert.equal(state.total,0);assert.equal(state.baitStock[0],20);
});
test('equipment protects mistakes but never skips a required correct direction',()=>{
  const {state,pool,run}=bite(SPECIES[0],s=>{s.rod=2;s.upgrade=3;s.equipped=['grip'];});
  const guards=run.challenge.guards;assert.ok(guards>0);
  submitDirection(pool,run,run.challenge.sequence[0],state);
  const wrong=DIRECTIONS.find(d=>d!==run.challenge.sequence[1]);
  submitDirection(pool,run,wrong,state);assert.equal(run.challenge.index,1);assert.equal(run.challenge.guards,guards-1);
  assert.equal(run.challenge.sequence.length,catchDifficulty(SPECIES[0]));assert.equal(state.total,0);
});
test('rare fish preserve their sequence through escape and reapproach, and timeout gives no reward',()=>{
  const {state,fish,pool,run,hook}=bite(SPECIES.find(s=>s.rarity===4));
  const sequence=[...run.challenge.sequence];
  while(run.phase==='challenge')submitDirection(pool,run,run.challenge.sequence[run.challenge.index],state);
  assert.equal(run.phase,'fishing');assert.equal(fish.mode,'fleeing');const index=run.challenge.index;
  for(let i=1;i<500&&run.phase==='fishing';i++)stepFishing(pool,run,hook,state,.05,i*.05,i*50);
  assert.equal(run.phase,'challenge');assert.equal(run.challenge.index,index);assert.deepEqual(run.challenge.sequence,sequence);
  assert.equal(stepFishing(pool,run,hook,state,.05,200,run.duration*1000+1).type,'timeout');
  assert.equal(submitDirection(pool,run,sequence[index],state),null);assert.equal(state.total,0);assert.equal(state.baitStock[0],20);
});
