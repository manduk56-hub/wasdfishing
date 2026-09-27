import { drawAtlasFish } from './fish-atlas.js';
import { drawEnvironment, drawProp } from './visual-assets.js';
// Original fallback sprites. The supplied image atlas is used after loading.
// All species face right; silhouettes and markings are based on real fish.
export const PALETTE = {
  '.': null, o:'#122c3d', k:'#153754', b:'#287ccc', B:'#59b7ef',
  s:'#88aeb4', S:'#c6dce0', w:'#f7efd8', g:'#456e71',
  a:'#e57632', A:'#ffad50', r:'#b34d29', y:'#eabd45', Y:'#f9df75',
  t:'#998453', T:'#c7b775', h:'#77744b', c:'#42c8ee', C:'#9aeafa'
};
export const SPRITES = {
  anchovy: [
    '........................',
    '...........gg...........',
    '..g.......gssg..........',
    '..sg...ggggggggggg......',
    '...ssggsssssssssSSgg....',
    '....sSSSSSSSSSSSSSwoog..',
    '...ssSSwwwwwwwwwwSSoog..',
    '..sg...SSSSSSSSSSSSg....',
    '..g.....ggSSSSSgggg.....',
    '..........sgg...........',
    '........................'
  ],
  clown: [
    '............................',
    '...........ooooooo..........',
    '..........oAAAAAaoo.........',
    '........ooAAowwAAaaoo.......',
    '..oo...oAAAowwwAAAowwao.....',
    '..oAo.owAAAowwwAAAowwAAoo...',
    '..oAAowwAAAowwwAAAowwAoYoo..',
    '...oAAwwAAAowwwAAAowwAowko..',
    '..oAAowwAAAowwwAAAowwAaooo..',
    '..oAo.owaaaowwwaaaowwaao....',
    '..oo...ooaaowwwaaaowwao.....',
    '.........ooaowwaaaaaoo......',
    '...........oorrrrrroo.......',
    '.............oooooo.........',
    '............................'
  ],
  tang: [
    '..............................',
    '...........kkkkkkkk...........',
    '.........kkbbbbbbbbkk.........',
    '........kBBBBBBBBBBbbk........',
    '...kk..kBBkkkkkkkkkBBbbk......',
    '...kYkkBBkkbbbbbbBkkBBbk......',
    '....kYYkkkBBBBBBBBBkkBBbkk....',
    '.....kYYkkBBBBBBBBBkkBbwok....',
    '....kYYkkkBBBBBBBBkkBBbbkk....',
    '...kYkkBBkkkkkkkkkBBBbbk......',
    '...kk..kBBBBBBkkBBBBbbk.......',
    '........kBBBBkYYkBBbk.........',
    '.........kkbbkYkbbkk..........',
    '...........kkkkkkk............',
    '..............................'
  ],
  ray: [
    '........................................',
    '........................hhhhh...........',
    '.....................hhTTTTTTh..........',
    '...................hhTTcCTTTTTh.........',
    '.................hhTTTTTTTTcCTTh........',
    '...............hhTTcCTTTTTTTTTTTh.......',
    '..............hTTTTTTTTTTcCTTTTTTh......',
    '.............hTTTTcCTTTTTTTTTTTTTTh.....',
    '..hhhccccccchTTTTTTTTTcCTTTTTTkTTh.....',
    '....hhhhhhhhTTTcCTTTTTTTTTTTTTTkTTh....',
    '.............hTTTTTTcCTTTTTTTTTTTh.....',
    '..............hTTcCTTTTTcCTTTTTTh......',
    '...............hhTTTTTTTTTTTTTTh.......',
    '.................hhTTcCTTTTTTTh........',
    '...................hhTTTTTTTTh.........',
    '.....................hhTTTThh..........',
    '........................hhh.............',
    '........................................'
  ],
  gold: [
    '........................................',
    '..................Y.....................',
    '.................YY.....................',
    '..k.............YYk.....................',
    '..kk...........YYkkkkkkkk...............',
    '...kk..Y.Y.Y..Ykkbbbbbbbbkk.............',
    '....kkkkkkkkkkkbbbbbbbbbbSSkk...........',
    '.....kkssssssssssssssssssssSSko.........',
    '....kkkSSSSSSSSSSSSSSSSSSSSSwooo.......',
    '...kk..YwYwYwwwwwwwwwwwSSSSSooo........',
    '..kk........YwwwwwwwwwwwwSSoo..........',
    '..k..........YYkkkkYkkkkkoo............',
    '..............YY..YY....................',
    '...............YYYY.....................',
    '................YY......................',
    '........................................'
  ]
};

export function drawPixelFish(ctx, species, x, y, direction, size, alpha = 1, time = 0) {
  if(drawAtlasFish(ctx,species,x,y,direction,size,alpha))return;
  const rows = SPRITES[species.id]; if (!rows) return;
  const width = Math.max(...rows.map(row=>row.length));
  const cell = Math.max(2, Math.round(size / 22) * 2);
  const originX = Math.round(x / cell) * cell - Math.floor(width / 2) * cell;
  const originY = Math.round(y / cell) * cell - Math.floor(rows.length / 2) * cell;
  // Two tail frames; the body markings stay stable.
  const tailFrame = Math.floor(time * 4) % 2;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let row=0;row<rows.length;row++) {
    for (let column=0;column<rows[row].length;column++) {
      const color = PALETTE[rows[row][column]]; if (!color) continue;
      const tailShift = column < 5 && tailFrame ? (row < rows.length / 2 ? 1 : -1) : 0;
      ctx.fillStyle=color;
      ctx.fillRect(originX + (direction < 0 ? width-1-column : column)*cell, originY+(row+tailShift)*cell,cell,cell);
    }
  }
  ctx.restore();
}

export function pixelLine(ctx, x1,y1,x2,y2,color,step=2) {
  const length = Math.max(Math.abs(x2-x1),Math.abs(y2-y1));
  ctx.fillStyle=color;
  for(let i=0;i<=length;i+=step){const p=length?i/length:0;ctx.fillRect(Math.round((x1+(x2-x1)*p)/step)*step,Math.round((y1+(y2-y1)*p)/step)*step,step,step);}
}
export function pixelRing(ctx,x,y,r,color,progress=1) {
  ctx.fillStyle=color;
  for(let i=0;i<64*progress;i++){const a=i/64*Math.PI*2-Math.PI/2;ctx.fillRect(Math.round((x+Math.cos(a)*r)/2)*2,Math.round((y+Math.sin(a)*r)/2)*2,2,2);}
}

export function drawPixelLandscape(ctx,time,fishing=false) {
  if(drawEnvironment(ctx,time,fishing))return;
  const block=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  block(0,0,1000,92,'#c0d7b0');block(0,48,1000,44,'#abc6a0');
  // Stepped sun and clouds, limited palette, no filtered gradients.
  block(752,8,28,40,'#f5e4a4');block(746,14,40,28,'#f5e4a4');block(754,14,16,6,'#fff0bc');
  for(const [x,y] of [[125,20],[340,10],[865,30]]){block(x,y,64,6,'#e1e5c4');block(x+12,y-6,28,6,'#e1e5c4');block(x+4,y+6,76,6,'#d0debb');}
  for(let x=0;x<1000;x+=12){const height=Math.round((Math.sin(x*.014)+Math.sin(x*.028)*.4)*10/4)*4;block(x,74+height,12,30-height,'#83ad91');}
  for(let x=0;x<1000;x+=16){const height=Math.round(Math.sin(x*.009+3)*8/4)*4;block(x,84+height,16,16-height,'#709b83');}
  const sea=['#4e9c8f','#428d84','#377d79','#2c6d6f','#245e64','#1b505a','#16434e'];
  sea.forEach((color,i)=>block(0,92+i*70,1000,70,color));
  // Sparse ordered dithering softens the boundaries without blurring pixels.
  for(let i=1;i<sea.length;i++)for(let y=0;y<8;y+=2)for(let x=0;x<1000;x+=8)block(x+(y%4?4:0),92+i*70+y,2,2,sea[i-1]);
  for(let i=0;i<5;i++)for(let y=98;y<550;y+=4){const x=Math.round((120+i*210-y*.17)/4)*4;block(x,y,28+y*.025,4,'#b7e3ad08');}
  const phase=Math.floor(time*2)%4;
  for(let x=0;x<1000;x+=24){block(x,90+(Math.floor(x/24)+phase)%3*2,16,2,'#b9d9b5');if(x%72===0)block(x+8,100,8,2,'#8dbf9f');}
  for(let i=0;i<28;i++){const x=Math.floor((i*139+Math.sin(time*.25+i)*12)/2)*2%1000,y=110+Math.floor((i*71+time*(3+i%4))/2)*2%452;block(x,y,2,2,'#92c7b55e');}
  // Rocks and sand.
  for(let x=0;x<1000;x+=8){const y=566+Math.round(Math.sin(x*.016)*8/4)*4;block(x,y,8,600-y,'#20494d');block(x,y,8,4,'#598174');}
  for(let i=0;i<10;i++){const x=i*113+8,y=570+i%3*6;block(x,y,38,22,'#365e5c');block(x+6,y-8,22,8,'#416d65');block(x+6,y,8,4,'#678d78');}
  for(let i=0;i<110;i++)block((i*137)%1000,584+(i*7)%16,2,2,i%2?'#668673':'#325c58');
  // Forked red coral, fan coral, kelp and anemones.
  for(let i=0;i<13;i++){
    const x=i*86+10,h=24+(i*31%54),sway=(Math.floor(time*2)+i)%3*2;
    for(let y=0;y<h;y+=4)block(x+(y>h*.5?sway:0),584-y,4,4,i%3?'#3c8d72':'#d0917e');
    if(i%3===0){pixelLine(ctx,x,565,x-16,541,'#d0917e',4);pixelLine(ctx,x-16,541,x-16,525,'#dfaa88',4);pixelLine(ctx,x,558,x+18,534,'#d0917e',4);pixelLine(ctx,x+18,534,x+18,518,'#dfaa88',4);block(x+14,514,12,4,'#e3b797');}
    else for(let j=0;j<3;j++){block(x-6,570-j*16,10,4,'#5eac87');block(x+4,562-j*16,10,4,'#4e9b78');}
  }
  for(const x of [285,630,880]){block(x,579,32,10,'#937287');for(let j=0;j<7;j++)block(x+j*4,570-j%3*4,2,12,'#c09b9e');}
}

export function drawPixelBoat(ctx,time,x=500,y=82) {
  y+=Math.floor(Math.sin(time)*2)*2;
  if(drawProp(ctx,'boat',x,y-26,190,125))return;
  const block=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h);};
  block(-52,-4,108,6,'#604b36');block(-48,2,100,6,'#ddbb77');block(-42,8,86,6,'#b98b50');block(-32,14,68,4,'#825b3e');
  block(-44,2,80,2,'#f4d997');block(-18,-12,34,8,'#92633e');
  block(-6,-28,12,16,'#244a44');block(-4,-12,18,4,'#163f3d');
  block(-6,-38,12,10,'#e3b486');block(-10,-42,20,4,'#b6955b');block(-4,-46,10,4,'#cbae70');
  block(4,-23,12,4,'#e3b486');pixelLine(ctx,x+14,y-24,x+44,y-44,'#dbc38c');pixelLine(ctx,x+44,y-44,x+68,y-16,'#dbc38c');
}
