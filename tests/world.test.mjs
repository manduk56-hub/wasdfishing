import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD, CAST_ORIGIN, RETURN_POINT, moveHook, cameraForHook, screenToWorld, onScreen, regionAt } from '../world.js';
import { createFishPool, createCast, stepFishing } from '../fishing.js';
import { initialState, stats } from '../game-core.js';

test('exploration travels beyond the former screen while the hook stays centered',()=>{
  const state=initialState(0),hook={...CAST_ORIGIN},start=cameraForHook(hook);
  for(let i=0;i<600;i++)moveHook(hook,1000,1000,stats(state).speed,.05);
  assert.ok(hook.x>4000 && hook.y>1800);
  assert.notEqual(regionAt(hook).index,regionAt(CAST_ORIGIN).index);
  const camera=cameraForHook(hook);
  assert.ok(camera.x>start.x && camera.y>start.y);
  assert.deepEqual({x:hook.x-camera.x,y:hook.y-camera.y},{x:500,y:300});
  assert.ok(30<stats(state).duration);
});

test('held screen touch continues steering as the camera scrolls; boundaries keep the hook centered',()=>{
  const hook={...CAST_ORIGIN};
  for(let i=0;i<1000;i++){
    const target=screenToWorld({x:850,y:550},cameraForHook(hook));
    assert.ok(Math.abs(target.x-hook.x-350)<1e-9);assert.ok(Math.abs(target.y-hook.y-250)<1e-9);
    moveHook(hook,target.x-hook.x,target.y-hook.y,125,.05);
  }
  assert.equal(hook.x,WORLD.width-WORLD.margin);assert.equal(hook.y,WORLD.height-WORLD.margin);
  assert.deepEqual(screenToWorld({x:500,y:300},cameraForHook(hook)),hook);
  moveHook(hook,-10000,-10000,125,100);
  assert.equal(hook.x,WORLD.margin);assert.equal(hook.y,120);
});

test('all species are distributed across six regions, with a small fraction visible at once',()=>{
  const pool=createFishPool();
  assert.equal(new Set(pool.map(f=>f.species.id)).size,20);
  assert.equal(new Set(pool.map(f=>regionAt(f.anchor).index)).size,6);
  let largest=0;
  for(let x=500;x<WORLD.width;x+=250)for(let y=300;y<WORLD.height;y+=150){
    largest=Math.max(largest,pool.filter(f=>onScreen(f,cameraForHook({x,y}),0)).length);
  }
  assert.ok(largest<=6,`${largest} fish in busiest viewport`);
  assert.ok(largest<pool.length/3);
});

test('a deep-world fish can be captured and reeled back to the original boat',()=>{
  const state=initialState(0),fish=createFishPool().find(f=>f.anchor.x>4000&&f.anchor.y>2000);
  const hook={x:fish.x,y:fish.y},run=createCast(state,0),events=[];
  for(let i=1;i<2000;i++){
    const event=stepFishing([fish],run,hook,state,.05,i*.05,i*50);
    if(event)events.push(event.type);
    if(run.phase==='done')break;
  }
  assert.equal(state.catches[fish.species.id],1);
  assert.equal(state.baitStock[0],19);
  assert.ok(events.includes('caught'));assert.equal(events.at(-1),'returned');
  assert.ok(Math.hypot(hook.x-RETURN_POINT.x,hook.y-RETURN_POINT.y)<2);
});
