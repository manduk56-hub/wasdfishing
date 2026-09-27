import { WORLD, regionAt } from './world.js';
import { drawWorldSurface } from './visual-assets.js';
import { pixelLine } from './pixel-art.js';
export function drawWorld(ctx,camera,time){
  const fill=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
  fill(0,0,1000,600,regionAt({x:camera.x+500,y:camera.y+300}).color);
  ctx.save();ctx.translate(-camera.x,-camera.y);
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
    const x=col*1600,y=row*1600,region=regionAt({x:x+1,y:y+1});
    fill(x,y,1600,1600,region.color);
    for(let i=0;i<5;i++)fill(x+i*320+90,y,10,1600,'#9ad5c807');
  }
  // Only paint visible world tiles. Fixed coordinates make scenery scroll
  // with the hook instead of repeating a single screen under it.
  for(let gy=Math.floor(Math.max(130,camera.y)/200);gy<=Math.ceil((camera.y+600)/200);gy++){
    for(let gx=Math.floor(camera.x/240);gx<=Math.ceil((camera.x+1000)/240);gx++){
      const seed=Math.abs(gx*71+gy*137),x=gx*240+seed%80,y=gy*200+seed%50;
      const region=regionAt({x,y});
      for(let j=0;j<5;j++)fill(x+j*24,y+(j%2)*4,20,2,'#72bfc526');
      if(seed%3===0){
        fill(x,y+60,90,26,'#08232e');fill(x+8,y+42,74,20,region.floor);fill(x+20,y+34,48,10,region.floor);
        fill(x+24,y+37,20,4,'#779a852a');
      }else{
        const sway=Math.floor(Math.sin(time*.7+seed)*2)*2;
        for(let i=0;i<3;i++){
          const height=35+(seed+i*7)%45,stem=x+i*12;
          pixelLine(ctx,stem,y+80,stem+sway,y+80-height,region.index===1?'#aa647d':'#397966',4);
          for(let j=0;j<height;j+=16)fill(stem-4+sway,y+75-j,14,4,region.index===1?'#dc9a9d':'#60a489');
        }
      }
      if(seed%7===0){fill(x+140,y+100,28,20,'#1b3941');fill(x+148,y+92,12,8,'#8c7756');fill(x+149,y+99,10,4,'#e4bd68');}
    }
  }
  for(let x of [-160,WORLD.width])for(let y=Math.floor(camera.y/64)*64;y<camera.y+664;y+=64){
    fill(x,y,160,64,'#102530');fill(x+(x<0?100:0),y+8,60,40,'#31464e');
  }
  fill(0,WORLD.height,4800,600,'#142733');
  for(let x=Math.floor(camera.x/48)*48;x<camera.x+1050;x+=48)fill(x,WORLD.height,44,12,'#536877');
  ctx.restore();
  if(camera.y<130){
    drawWorldSurface(ctx,camera);
    for(let x=0;x<1000;x+=36)fill(x,100-camera.y+(Math.floor(time*2)+x/36)%3*2,24,2,'#fee3a6');
  }
}
export function drawMinimap(ctx,hook,camera){
  const width=ctx.canvas.width,height=ctx.canvas.height;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);
  const sx=width/WORLD.width,sy=height/WORLD.height;
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
    ctx.fillStyle=regionAt({x:col*1600+1,y:row*1600+1}).color;ctx.fillRect(col*width/3,row*height/2,width/3,height/2);
  }
  ctx.strokeStyle='#ddc17d';ctx.lineWidth=2;
  ctx.strokeRect(camera.x*sx,camera.y*sy,WORLD.viewWidth*sx,WORLD.viewHeight*sy);
  ctx.fillStyle='#ffe19b';ctx.fillRect(Math.round(hook.x*sx)-3,Math.round(hook.y*sy)-3,6,6);
}
