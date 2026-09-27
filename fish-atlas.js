// First sheet: user-supplied 5 x 2 atlas. Second: matching generated fish sprites.
// Tight bounds omit surrounding padding and keep adjacent fish out of the frame.
export const ATLAS_FRAMES = [
  { name:'붕어', x:8, y:88, w:366, h:286 },
  { name:'배스', x:382, y:108, w:405, h:250 },
  { name:'송어', x:793, y:117, w:392, h:232 },
  { name:'메기', x:1188, y:108, w:429, h:263 },
  { name:'장어', x:1620, y:108, w:355, h:237 },
  { name:'복어', x:7, y:433, w:338, h:276 },
  { name:'참치', x:351, y:420, w:445, h:277 },
  { name:'연어', x:803, y:444, w:425, h:239 },
  { name:'흰동가리', x:1235, y:443, w:367, h:241 },
  { name:'아귀', x:1606, y:416, w:369, h:287 },
  { name:'잉어', sheet:1, x:8, y:100, w:383, h:263 },
  { name:'피라미', sheet:1, x:397, y:136, w:393, h:214 },
  { name:'쏘가리', sheet:1, x:795, y:120, w:357, h:233 },
  { name:'가물치', sheet:1, x:1153, y:155, w:423, h:173 },
  { name:'농어', sheet:1, x:1577, y:129, w:403, h:221 },
  { name:'고등어', sheet:1, x:7, y:477, w:411, h:191 },
  { name:'참돔', sheet:1, x:418, y:430, w:381, h:260 },
  { name:'넙치', sheet:1, x:801, y:436, w:416, h:255 },
  { name:'해마', sheet:1, x:1281, y:398, w:200, h:326 },
  { name:'청새치', sheet:1, x:1493, y:421, w:487, h:271 }
];
const atlases = [];
export async function loadFishAtlas() {
  await Promise.all(['./assets/fish-atlas.png','./assets/fish-atlas-extra.png'].map(async (url,sheet)=>{
  const source = new Image();
  source.src = url;
  await source.decode();
  const buffer = document.createElement('canvas');
  buffer.width=source.naturalWidth;buffer.height=source.naturalHeight;
  const context=buffer.getContext('2d',{willReadFrequently:true});
  context.drawImage(source,0,0);
  const pixels=context.getImageData(0,0,buffer.width,buffer.height);
  // Sheets may use transparent or black padding. Only edge-connected black
  // padding is keyed out; internal black eyes, mouths and outlines are retained.
  for(const frame of ATLAS_FRAMES.filter(frame=>(frame.sheet || 0)===sheet)){
    const visited=new Uint8Array(frame.w*frame.h),queue=new Int32Array(frame.w*frame.h);
    let head=0,tail=0;
    const add=(x,y)=>{
      if(x<0||y<0||x>=frame.w||y>=frame.h)return;
      const p=y*frame.w+x;if(visited[p])return;visited[p]=1;
      const at=((frame.y+y)*buffer.width+frame.x+x)*4;
      if(pixels.data[at+3]===0 || (pixels.data[at]<12&&pixels.data[at+1]<12&&pixels.data[at+2]<12))queue[tail++]=p;
    };
    for(let x=0;x<frame.w;x++){add(x,0);add(x,frame.h-1);}
    for(let y=0;y<frame.h;y++){add(0,y);add(frame.w-1,y);}
    while(head<tail){const p=queue[head++],x=p%frame.w,y=Math.floor(p/frame.w);pixels.data[((frame.y+y)*buffer.width+frame.x+x)*4+3]=0;add(x-1,y);add(x+1,y);add(x,y-1);add(x,y+1);}
  }
  context.putImageData(pixels,0,0);atlases[sheet]=buffer;
  }));
}
export function drawAtlasFish(ctx,species,x,y,direction,size,alpha=1){
  const frame=ATLAS_FRAMES[species.sprite];if(!frame)return false;
  const atlas=atlases[frame.sheet || 0];if(!atlas)return false;
  // Fit upright species such as the seahorse inside the same sprite envelope.
  const width=Math.round(size*3*Math.min(1,frame.w/frame.h)/2)*2,height=Math.round(width*frame.h/frame.w/2)*2;
  ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;
  ctx.translate(Math.round(x/2)*2,Math.round(y/2)*2);ctx.scale(direction<0?-1:1,1);
  ctx.drawImage(atlas,frame.x,frame.y,frame.w,frame.h,-Math.round(width/4)*2,-Math.round(height/4)*2,width,height);
  ctx.restore();return true;
}
