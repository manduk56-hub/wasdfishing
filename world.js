export const WORLD={width:4800,height:3200,viewWidth:1000,viewHeight:600,surface:100,margin:80};
export const CAST_ORIGIN={x:2400,y:150};
export const RETURN_POINT={x:2400,y:90};
export const REGIONS=[
  {name:'수초 숲',color:'#185956',floor:'#294e45'},
  {name:'산호 정원',color:'#14576b',floor:'#3b6263'},
  {name:'푸른 해협',color:'#124d71',floor:'#334b65'},
  {name:'바위 협곡',color:'#173a4a',floor:'#444d50'},
  {name:'해초 동굴',color:'#103e40',floor:'#314c42'},
  {name:'심해 분지',color:'#102b49',floor:'#303c55'}
];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function regionAt(point){
  const col=clamp(Math.floor(point.x/(WORLD.width/3)),0,2),row=point.y>=1600?1:0;
  return {...REGIONS[row*3+col],index:row*3+col};
}
export function cameraForHook(hook){
  // The hook stays centered, including near map edges. Terrain fills beyond
  // the traversable boundary so the view never exposes an empty canvas.
  return {x:hook.x-WORLD.viewWidth/2,y:hook.y-WORLD.viewHeight/2};
}
export function screenToWorld(point,camera){return {x:point.x+camera.x,y:point.y+camera.y};}
export function moveHook(hook,dx,dy,speed,dt){
  const length=Math.hypot(dx,dy);if(!length)return;
  const step=Math.min(speed*dt,length);
  hook.x=clamp(hook.x+dx/length*step,WORLD.margin,WORLD.width-WORLD.margin);
  hook.y=clamp(hook.y+dy/length*step,120,WORLD.height-WORLD.margin);
}
export function onScreen(fish,camera,padding=100){
  return fish.x>=camera.x-padding&&fish.x<=camera.x+WORLD.viewWidth+padding&&fish.y>=camera.y-padding&&fish.y<=camera.y+WORLD.viewHeight+padding;
}
