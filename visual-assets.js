let scenery=null, props=null;
export const PROP_FRAMES=[
  {name:'rod',x:35,y:60,w:513,h:467},
  {name:'reel',x:578,y:119,w:427,h:367},
  {name:'worm',x:1170,y:108,w:236,h:400},
  {name:'lure',x:43,y:663,w:486,h:248},
  {name:'bobber',x:635,y:585,w:231,h:365},
  {name:'boat',x:958,y:598,w:565,h:333}
];
export async function loadVisualAssets(){
  const images=await Promise.all(['./assets/sunset-lake.png','./assets/fishing-props.png'].map(async url=>{
    const image=new Image();image.src=url;await image.decode();return image;
  }));
  [scenery,props]=images;
}
export function drawEnvironment(ctx,time=0,fishing=false){
  if(!scenery)return false;
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(fishing){
    const shore=Math.round(scenery.height*.31);
    ctx.drawImage(scenery,0,0,scenery.width,shore,0,0,1000,96);
    ctx.drawImage(scenery,0,shore,scenery.width,scenery.height-shore,0,96,1000,504);
  }else ctx.drawImage(scenery,0,0,1000,600);
  // A dark, translucent depth tint keeps fish readable against reflected light.
  ctx.fillStyle=fishing?'#032d3b80':'#032d3b10';ctx.fillRect(0,fishing?100:190,1000,500);
  ctx.fillStyle='#ffd88c70';
  for(let i=0;i<14;i++){
    const x=470+Math.round(Math.sin(i*2.4+time*.6)*34/2)*2;
    ctx.fillRect(x,120+i*29,12+(i%3)*8,2);
  }
  ctx.restore();return true;
}
export function drawProp(ctx,name,x,y,width,height){
  const frame=PROP_FRAMES.find(f=>f.name===name);if(!props||!frame)return false;
  const scale=Math.min(width/frame.w,height/frame.h),w=Math.round(frame.w*scale/2)*2,h=Math.round(frame.h*scale/2)*2;
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.drawImage(props,frame.x,frame.y,frame.w,frame.h,Math.round(x-w/2),Math.round(y-h/2),w,h);
  ctx.restore();return true;
}
export function drawWorldSurface(ctx,camera){
  if(!scenery || camera.y>130)return;
  const shore=Math.round(scenery.height*.31);
  ctx.drawImage(scenery,0,0,scenery.width,shore,0,-180-camera.y,1000,280);
}
