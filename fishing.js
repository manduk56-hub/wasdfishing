import { SPECIES, stats, patternPosition, returnDelay, awardCatch } from './game-core.js';
import { WORLD, RETURN_POINT } from './world.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function routineBounds(fish) {
  const sizes={shoal:[135,17],orbit:[85,44],zigzag:[120,36],wave:[155,46],patrol:[165,10]};
  const [x,y]=sizes[fish.species.pattern];
  return {left:clamp(fish.anchor.x-x-18,WORLD.margin,WORLD.width-WORLD.margin),right:clamp(fish.anchor.x+x+18,WORLD.margin,WORLD.width-WORLD.margin),top:clamp(fish.anchor.y-y-18,WORLD.surface,WORLD.height-WORLD.margin),bottom:clamp(fish.anchor.y+y+18,WORLD.surface,WORLD.height-WORLD.margin)};
}
export function inRoutine(fish,hook) {
  const b=routineBounds(fish);return hook.x>=b.left&&hook.x<=b.right&&hook.y>=b.top&&hook.y<=b.bottom;
}
function withinTerritory(fish,point){
  const b=routineBounds(fish);
  return {x:clamp(point.x,b.left,b.right),y:clamp(point.y,b.top,b.bottom)};
}
export function noticesHook(fish,hook,state){
  return Math.hypot(fish.x-hook.x,fish.y-hook.y)<=stats(state).radius;
}
export function createFishPool() {
  let slot=0;
  return [...SPECIES].sort((a,b)=>a.rarity-b.rarity).flatMap((species,si)=>Array.from({length:[3,2,2,1,1][species.rarity]},(_,i)=>{
    const index=slot++,anchor={x:240+(index%12)*390,y:340+Math.floor(index/12)*900+species.rarity*110};
    const phase=i*2.1+si*.83,p=patternPosition(species,0,anchor,phase);
    const fish={species,anchor,phase,...p,previousX:p.x,dir:1,progress:0,respawn:0,escapeLeft:0,escapes:0,mode:'routine'};
    Object.assign(fish,withinTerritory(fish,p));fish.previousX=fish.x;return fish;
  }));
}
export function createCast(state,now=Date.now()) {
  if(!(state.baitStock[state.bait]>0))return null;
  return {started:now,duration:stats(state).duration,bait:state.bait,phase:'fishing',target:null,count:0,coins:0,catches:{},cooldown:0,pulse:0,landed:false};
}
function move(f,target,speed,dt){const dx=target.x-f.x,dy=target.y-f.y,d=Math.hypot(dx,dy),step=Math.min(d,speed*dt);if(d){f.x+=dx/d*step;f.y+=dy/d*step;}}
export function stepFishing(pool,run,hook,state,dt,time,now=Date.now()) {
  if(run?.phase==='reeling') {
    move(hook,RETURN_POINT,900,dt);
    if(Math.hypot(hook.x-RETURN_POINT.x,hook.y-RETURN_POINT.y)<2){run.phase='done';return {type:'returned'};}
    return null;
  }
  if(run?.phase==='done')return null;
  if(run && now-run.started>=run.duration*1000){run.phase='done';return {type:'timeout'};}
  const config=stats(state);
  const alert=fish=>run && (noticesHook(fish,hook,state) || (fish.mode!=='routine' && Math.hypot(fish.x-hook.x,fish.y-hook.y)<=config.radius*2));
  if(run?.target && !alert(run.target))run.target=null;
  if(run && !run.target){
    run.target=pool.filter(f=>f.respawn<=0&&alert(f)).sort((a,b)=>Math.hypot(a.x-hook.x,a.y-hook.y)-Math.hypot(b.x-hook.x,b.y-hook.y))[0]||null;
  }
  let event=null;
  for(const f of pool){
    if(f.respawn>0){f.respawn-=dt;continue;}
    const base=withinTerritory(f,patternPosition(f.species,time,f.anchor,f.phase));
    if(alert(f)){
      // Awareness follows the fish, rather than testing entry into a rectangle.
      // A wider release distance avoids flickering at the detection boundary.
      if(Math.hypot(f.x-hook.x,f.y-hook.y)>config.radius*2){
        f.mode='routine';f.progress=0;f.escapeLeft=0;f.escapes=0;run.target=null;
        move(f,base,f.species.speed*2,dt);
      }else if(f.escapeLeft>0){
        f.mode='fleeing'; f.escapeLeft=Math.max(0,f.escapeLeft-dt*(run.pulse>0?2:1));
        const b=routineBounds(f); const away={x:hook.x<b.left+(b.right-b.left)/2?b.right:b.left,y:clamp(hook.y+45,b.top,b.bottom)};
        move(f,away,130,dt);
      }else{
        f.mode='chasing';move(f,withinTerritory(f,hook),(90-f.species.rarity*9)*config.attraction*(run.pulse>0?1.8:1),dt);
        if(run.target===f && Math.hypot(f.x-hook.x,f.y-hook.y)<=config.catchRadius+f.species.size*.35){
          f.mode='attached';f.progress+=dt*config.grip/[1.2,1.8,3,6,10][f.species.rarity];
          const thresholds=f.species.rarity===4?[.3,.65]:f.species.rarity===3?[.45]:[];
          if(f.escapes<thresholds.length&&f.progress>=thresholds[f.escapes]){
            f.progress=thresholds[f.escapes];f.escapes++;f.escapeLeft=returnDelay(f.species,state);f.mode='fleeing';
            event={type:'escaped',fish:f};
          }
          if(f.progress>=1&&!run.landed){
            if(state.baitStock[run.bait]<1){run.phase='done';return {type:'timeout'};}
            state.baitStock[run.bait]--;run.landed=true;run.phase='reeling';
            const reward=awardCatch(state,f.species);run.count=1;run.coins=reward.coins;run.catches[f.species.id]=1;
            f.respawn=7;
            for(const other of pool)if(other!==f){other.mode='routine';other.progress=0;other.escapeLeft=0;other.escapes=0;}
            return {type:'caught',fish:f,reward};
          }
        }
      }
    }else{f.mode='routine';f.progress=0;f.escapeLeft=0;f.escapes=0;move(f,base,f.species.speed*2,dt);}
    if(Math.abs(f.x-f.previousX)>.03)f.dir=f.x>f.previousX?1:-1;f.previousX=f.x;
  }
  return event;
}
