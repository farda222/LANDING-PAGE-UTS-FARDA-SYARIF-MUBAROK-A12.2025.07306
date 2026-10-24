(()=>{
const hero=document.getElementById('hero'),cv=document.getElementById('ocean'),g=cv.getContext('2d');
const off=document.createElement('canvas'),og=off.getContext('2d',{willReadFrequently:true});
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const RAMP=' .:tsSX%8#@';
const GRAY=Array.from({length:64},(_,i)=>{const v=Math.round(i/63*215);return `rgb(${v},${v},${v})`});
let CW=9,LH=12,FS=12,W=0,H=0,cols=0,rows=0,t=0,last=0,raf=0,ready=false,Lb=200;
const mouse={x:-999,y:-999};
let sharks=[],schools=[],bubbles=[],splashes=[];
const rnd=(a,b)=>a+Math.random()*(b-a);
const hash=(x,y,n)=>{let v=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(n,1442695041);v=Math.imul(v^(v>>>13),1274126177);return((v^(v>>>16))>>>0)/4294967295};
const wid=(u,L)=>L*(.012+.07*(u<.3?Math.pow(Math.sin(u/.3*Math.PI/2),.85):Math.pow(1-(u-.3)/.7,1.1)));

function init(){
  Lb=Math.max(170,Math.min(300,H*.34));
  sharks=Array.from({length:W<700?4:6},(_,i)=>{const k=[1,.8,.62,.9,.5,.72][i],nn=W<700?4:6;return{x:(i+rnd(.1,.9))/nn*W,y:rnd(0,H),th:rnd(0,6.28),v:rnd(55,80)*k+20,ph:rnd(0,6),L:Lb*k,bt:0}});
  const n=Math.max(6,Math.round(W*H/70000));
  schools=Array.from({length:n},()=>{
    const fish=[];
    for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)if(Math.abs(i)+Math.abs(j)<=3&&Math.random()<.6)fish.push({ox:i*15,oy:j*15,dx:0,dy:0,ph:rnd(0,6),c:Math.random()<.6?'-':'.'});
    return{x:rnd(0,W),y:rnd(0,H),th:rnd(0,6.28),v:rnd(28,45),ph:rnd(0,6),fish};
  });
}
function size(){
  const d=Math.min(devicePixelRatio||1,2),m=document.documentElement.clientWidth<600;
  CW=m?7:8;LH=m?10:11;FS=m?10:11;
  W=document.documentElement.clientWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);
  cols=Math.ceil(W/CW);rows=Math.ceil(H/LH);off.width=cols;off.height=rows;
  if(!ready){init();ready=true}
  if(reduce)draw();
}
function poly(pts,v){og.fillStyle=`rgb(${v},${v},${v})`;og.beginPath();pts.forEach((p,i)=>i?og.lineTo(p[0],p[1]):og.moveTo(p[0],p[1]));og.closePath();og.fill()}
function spine(s){
  const P=[],c=Math.cos(s.th),sn=Math.sin(s.th),L=s.L,A=.05*L,k=Math.PI*2/(.85*L);
  for(let i=0;i<=16;i++){
    const u=i/16,lx=-u*L,ly=A*Math.sin(k*u*L-t*5+s.ph)*(.2+.8*u*u);
    P.push({x:s.x+lx*c-ly*sn,y:s.y+lx*sn+ly*c,u});
  }
  return P;
}
function body(P,L,f,v){
  const a=[],b=[];
  P.forEach((p,i)=>{
    const q=P[Math.max(0,i-1)],r=P[Math.min(16,i+1)],m=Math.hypot(r.x-q.x,r.y-q.y)||1,tx=(r.x-q.x)/m,ty=(r.y-q.y)/m,w=wid(p.u,L)*f;
    a.push([p.x-ty*w,p.y+tx*w]);b.push([p.x+ty*w,p.y-tx*w]);
  });
  poly(a.concat(b.reverse()),v);
}
function drawShark(s){
  const P=spine(s),L=s.L;
  const tan=i=>{const a=P[Math.max(0,i-1)],b=P[Math.min(16,i+1)],m=Math.hypot(b.x-a.x,b.y-a.y)||1;return[(b.x-a.x)/m,(b.y-a.y)/m]};
  const fin=(i,j,d,rw,sw,v)=>{
    const[tx,ty]=tan(i),nx=-ty*d,ny=tx*d,r=P[i],q=P[j],w1=wid(r.u,L),w2=wid(q.u,L);
    poly([[r.x+nx*w1*.6,r.y+ny*w1*.6],[r.x+nx*rw*L+tx*sw*L,r.y+ny*rw*L+ty*sw*L],[q.x+nx*w2*.5,q.y+ny*w2*.5]],v);
  };
  for(const d of[1,-1]){fin(4,8,d,.19,.13,150);fin(10,12,d,.075,.05,120)}
  const[tx,ty]=tan(16),nx=-ty,ny=tx,e=P[16];
  poly([[e.x,e.y],[e.x+nx*.14*L+tx*.14*L,e.y+ny*.14*L+ty*.14*L],[e.x+tx*.05*L,e.y+ty*.05*L],[e.x-nx*.1*L+tx*.1*L,e.y-ny*.1*L+ty*.1*L]],175);
  body(P,L,1,110);body(P,L,.75,160);body(P,L,.5,215);body(P,L,.22,255);
}
function push(f,x,y,px,py,R,k,dt){
  const dx=x-px,dy=y-py,d=Math.hypot(dx,dy);
  if(d<R&&d>.1){const p=(1-d/R)*k*dt;f.dx+=dx/d*p;f.dy+=dy/d*p}
}
function update(dt){
  for(const s of sharks){
    s.th+=Math.sin(t*.35+s.ph)*.22*dt;
    s.x+=Math.cos(s.th)*s.v*dt;s.y+=Math.sin(s.th)*s.v*dt;
    const m=s.L+60;
    if(s.x<-m)s.x=W+m;if(s.x>W+m)s.x=-m;if(s.y<-m)s.y=H+m;if(s.y>H+m)s.y=-m;
    if((s.bt-=dt)<0){s.bt=rnd(.2,.5);bubbles.push({x:s.x+rnd(-12,12),y:s.y+rnd(-12,12),a:0})}
  }
  for(const S of schools){
    S.th+=Math.sin(t*.4+S.ph)*.35*dt;S.x+=Math.cos(S.th)*S.v*dt;S.y+=Math.sin(S.th)*S.v*dt;
    if(S.x<-90)S.x=W+90;if(S.x>W+90)S.x=-90;if(S.y<-90)S.y=H+90;if(S.y>H+90)S.y=-90;
    const c=Math.cos(S.th),sn=Math.sin(S.th),k=Math.pow(.25,dt);
    for(const f of S.fish){
      const x=S.x+f.ox*c-f.oy*sn+f.dx,y=S.y+f.ox*sn+f.oy*c+f.dy;
      push(f,x,y,mouse.x,mouse.y,120,170,dt);
      for(const p of splashes)push(f,x,y,p.x,p.y,p.a*180+40,300,dt);
      for(const h of sharks)push(f,x,y,h.x,h.y,110,150,dt);
      f.dx*=k;f.dy*=k;
    }
  }
  for(const b of bubbles){b.a+=dt;b.y-=6*dt}
  bubbles=bubbles.filter(b=>b.a<1.6);
  splashes=splashes.filter(p=>(p.a+=dt)<1.3);
}
function cell(ch,x,y){g.fillText(ch,Math.floor(x/CW)*CW+CW/2,Math.floor(y/LH)*LH+LH/2+1)}
function draw(){
  g.fillStyle='#000';g.fillRect(0,0,W,H);
  og.setTransform(1,0,0,1,0,0);og.fillStyle='#000';og.fillRect(0,0,cols,rows);og.setTransform(1/CW,0,0,1/LH,0,0);
  for(const s of sharks)drawShark(s);
  const data=og.getImageData(0,0,cols,rows).data;
  g.font=`${FS}px "IBM Plex Mono",monospace`;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='rgba(235,245,250,.8)';
  for(const S of schools){
    const c=Math.cos(S.th),sn=Math.sin(S.th);
    for(const f of S.fish){
      const lx=f.ox+Math.sin(t*1.7+f.ph)*3,ly=f.oy+Math.cos(t*1.3+f.ph)*3;
      cell(f.c,S.x+lx*c-ly*sn+f.dx,S.y+lx*sn+ly*c+f.dy);
    }
  }
  const n=Math.floor(t*7);
  for(let cy=0;cy<rows;cy++)for(let cx=0;cx<cols;cx++){
    const b=data[(cy*cols+cx)*4]/255;
    if(b<.06)continue;
    const ci=Math.max(1,Math.min(10,Math.floor((b+(hash(cx,cy,n)-.5)*.35)*11)));
    g.fillStyle=GRAY[Math.round(b*63)];g.fillRect(cx*CW,cy*LH,CW-1,LH-1);
    g.fillStyle=b>.5?'rgba(0,0,0,.7)':'rgba(255,255,255,.65)';
    g.fillText(RAMP[ci],cx*CW+CW/2,cy*LH+LH/2+1);
  }
  for(const q of bubbles){g.fillStyle=`rgba(255,255,255,${1-q.a/1.6})`;cell('o',q.x,q.y)}
  for(const p of splashes){
    const R=p.a*180,m=Math.round(R/7)+8;
    g.fillStyle=`rgba(255,255,255,${1-p.a/1.3})`;
    for(let i=0;i<m;i++){const a=i/m*Math.PI*2;cell(i%2?'o':'O',p.x+Math.cos(a)*R,p.y+Math.sin(a)*R*.7)}
  }
}
function frame(ts){
  const dt=Math.min((ts-last)/1000||0,.05);last=ts;t+=dt;
  update(dt);draw();raf=requestAnimationFrame(frame);
}
function start(){if(!raf&&!reduce){last=0;raf=requestAnimationFrame(frame)}}
function stop(){cancelAnimationFrame(raf);raf=0}

hero.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top});
hero.addEventListener('pointerleave',()=>{mouse.x=mouse.y=-999});
hero.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();splashes.push({x:e.clientX-r.left,y:e.clientY-r.top,a:0})});
addEventListener('resize',size);size();
const vis=new Set(),io=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target));vis.size?start():stop()});
io.observe(hero);io.observe(document.getElementById('ciri'));
const fade=()=>{cv.style.opacity=1-.65*Math.min(1,scrollY/(innerHeight*.7))};
addEventListener('scroll',fade,{passive:true});fade();
document.fonts.ready.then(size);
})();

(()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const RAMP=' .:tsSX%8#@',GRAY=Array.from({length:64},(_,i)=>{const v=Math.round(i/63*215);return `rgb(${v},${v},${v})`});
const CFG={white:{wf:1.15,ex:.85,pf:.19,tl:1},hammer:{wf:.85,ex:.9,pf:.17,tl:1,hammer:1},whale:{wf:1.45,ex:.45,pf:.16,tl:1.1,spots:1},mako:{wf:.8,ex:1.2,pf:.13,tl:1.15}};
const hash=(x,y,n)=>{let v=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(n,1442695041);v=Math.imul(v^(v>>>13),1274126177);return((v^(v>>>16))>>>0)/4294967295};
const items=[];
function make(cv){
  const c=CFG[cv.dataset.sp],g=cv.getContext('2d'),off=document.createElement('canvas'),og=off.getContext('2d',{willReadFrequently:true});
  let W,H,cols,rows,L,CW=7,LH=10;
  const wid=u=>L*(.012+.07*c.wf*(u<.3?Math.pow(Math.sin(u/.3*Math.PI/2),c.ex):Math.pow(1-(u-.3)/.7,1.1)));
  const poly=(pts,v)=>{og.fillStyle=`rgb(${v},${v},${v})`;og.beginPath();pts.forEach((p,i)=>i?og.lineTo(p[0],p[1]):og.moveTo(p[0],p[1]));og.closePath();og.fill()};
  function size(){
    const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
    W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);
    cols=Math.ceil(W/CW);rows=Math.ceil(H/LH);off.width=cols;off.height=rows;L=Math.min(W*.8,H*2.4);
  }
  function draw(t){
    const P=[],hx=W/2+L/2,hy=H/2,A=.05*L,k=Math.PI*2/(.85*L);
    for(let i=0;i<=16;i++){const u=i/16;P.push({x:hx-u*L,y:hy+A*Math.sin(k*u*L-t*5)*(.2+.8*u*u),u})}
    const tan=i=>{const a=P[Math.max(0,i-1)],b=P[Math.min(16,i+1)],m=Math.hypot(b.x-a.x,b.y-a.y)||1;return[(b.x-a.x)/m,(b.y-a.y)/m]};
    og.setTransform(1,0,0,1,0,0);og.fillStyle='#000';og.fillRect(0,0,cols,rows);og.setTransform(1/CW,0,0,1/LH,0,0);
    const fin=(i,j,d,rw,sw,v)=>{const[tx,ty]=tan(i),nx=-ty*d,ny=tx*d,r=P[i],q=P[j],w1=wid(r.u),w2=wid(q.u);
      poly([[r.x+nx*w1*.6,r.y+ny*w1*.6],[r.x+nx*rw*L+tx*sw*L,r.y+ny*rw*L+ty*sw*L],[q.x+nx*w2*.5,q.y+ny*w2*.5]],v)};
    for(const d of[1,-1]){fin(4,8,d,c.pf,.13,150);fin(10,12,d,c.pf*.4,.05,120)}
    const[tx,ty]=tan(16),nx=-ty,ny=tx,e=P[16],T=c.tl;
    poly([[e.x,e.y],[e.x+(nx*.14+tx*.14)*L*T,e.y+(ny*.14+ty*.14)*L*T],[e.x+tx*.05*L,e.y+ty*.05*L],[e.x+(-nx*.1+tx*.1)*L*T,e.y+(-ny*.1+ty*.1)*L*T]],175);
    for(const[f,v]of[[1,110],[.75,160],[.5,215],[.22,255]]){
      const a=[],b=[];
      P.forEach((p,i)=>{const q=P[Math.max(0,i-1)],r=P[Math.min(16,i+1)],m=Math.hypot(r.x-q.x,r.y-q.y)||1,ux=(r.x-q.x)/m,uy=(r.y-q.y)/m,w=wid(p.u)*f;
        a.push([p.x-uy*w,p.y+ux*w]);b.push([p.x+uy*w,p.y-ux*w])});
      poly(a.concat(b.reverse()),v);
    }
    if(c.hammer){const[hx2,hy2]=tan(1),n2x=-hy2,n2y=hx2,q=P[1],R=.13*L,B=.03*L;
      poly([[q.x+n2x*R-hx2*B,q.y+n2y*R-hy2*B],[q.x+n2x*R+hx2*B,q.y+n2y*R+hy2*B],[q.x-n2x*R+hx2*B,q.y-n2y*R+hy2*B],[q.x-n2x*R-hx2*B,q.y-n2y*R-hy2*B]],235)}
    if(c.spots){og.fillStyle='rgb(60,60,60)';
      for(let i=2;i<=13;i++){const p=P[i],[ux,uy]=tan(i),w=wid(p.u);
        for(const o of[-.5,.15,.55]){const sx=p.x-uy*w*o*(i%2?1:-1),sy=p.y+ux*w*o*(i%2?1:-1);og.beginPath();og.arc(sx,sy,.011*L,0,7);og.fill()}}}
    const data=og.getImageData(0,0,cols,rows).data,n=Math.floor(t*7);
    g.fillStyle='#000';g.fillRect(0,0,W,H);g.font='10px "IBM Plex Mono",monospace';g.textAlign='center';g.textBaseline='middle';
    for(let cy=0;cy<rows;cy++)for(let cx=0;cx<cols;cx++){
      const b=data[(cy*cols+cx)*4]/255;if(b<.06)continue;
      const ci=Math.max(1,Math.min(10,Math.floor((b+(hash(cx,cy,n)-.5)*.35)*11)));
      g.fillStyle=GRAY[Math.round(b*63)];g.fillRect(cx*CW,cy*LH,CW-1,LH-1);
      g.fillStyle=b>.5?'rgba(0,0,0,.7)':'rgba(255,255,255,.65)';g.fillText(RAMP[ci],cx*CW+CW/2,cy*LH+LH/2+1);
    }
  }
  size();items.push({size,draw});
}
document.querySelectorAll('canvas.sp').forEach(make);
let t=0,last=0,raf=0;
const frame=ts=>{const dt=Math.min((ts-last)/1000||0,.05);last=ts;t+=dt;items.forEach(i=>i.draw(t));raf=requestAnimationFrame(frame)};
const redraw=()=>items.forEach(i=>{i.size();i.draw(t)});
addEventListener('resize',redraw);
document.fonts.ready.then(redraw);
if(reduce)redraw();
else new IntersectionObserver(([e])=>{if(e.isIntersecting){if(!raf){last=0;raf=requestAnimationFrame(frame)}}else{cancelAnimationFrame(raf);raf=0}}).observe(document.getElementById('jenis'));
})();
