// ================= CONFIG (tune here) =================
const C={W:960,H:600,lives:3,maxDodge:3,regenSec:3,
 pull1:100,pull10:900,odds1:0.007,odds10:0.04,top1:1e-10,top10:0.001,upCost:[40,90,160,250,1500],upOdds1:.25, // top = Eternal Sovereign: 0.00000001% per x1, 0.1% per x10
 strongSurcharge:3, // surcharge while 20 levels not yet beaten
 ptsKill:5,ptsLevel:25,ptsBoss:100,ptsWin:500,maxLevel:20,
 enemyHp:20,hpGrowth:0.45,bossHp:250};
// Skin 0 is a free starter; skins 1-5 come from the gacha (5 = strongest). w = gacha weight.
const SKINS=[
 {n:'Squire Kael',r:0,c:'#8cf',s:'#fff',u:'Shockwave',h:'#630',o:'#48c',l:'#333',a:'#fc4',f:''},
 {n:'Frost Ranger',r:1,c:'#6ef',s:'#aef',u:'Time Slow',h:'#eef',o:'#4ac',l:'#246',a:'#aef',f:'hood'},
 {n:'Paladin',r:2,c:'#fd5',s:'#fff6c0',u:'Invincible + 2x Damage',h:'#fd5',o:'#ccd',l:'#889',a:'#e33',f:'helm'},
 {n:'Tempest Monk',r:1,c:'#6f8',s:'#bfc',u:'Blade Storm',h:'#222',o:'#3a5',l:'#253',a:'#fff',f:'band'},
 {n:'Blood Duelist',r:3,c:'#f46',s:'#f9a',u:'Lifesteal Burst',h:'#a22',o:'#712',l:'#322',a:'#d12',f:'cape'},
 {n:'Eternal Sovereign',r:4,c:'#c6f',s:'#e9f',u:'ONE-HIT KILL',h:'#fff',o:'#a4f',l:'#52a',a:'#fd0',f:'cape crown'},
 {n:'Desert Nomad',r:0,c:'#da6',s:'#fed',u:'Sandstorm',h:'#852',o:'#c93',l:'#753',a:'#fed',f:'hood'},
 {n:'Shadow Ninja',r:2,c:'#c22',s:'#f66',u:'Shadow Strike',h:'#111',o:'#223',l:'#111',a:'#c22',f:'mask band'},
 {n:'Sun Knight',r:3,c:'#fc3',s:'#fff',u:'Solar Flare',h:'#fb4',o:'#fc3',l:'#c82',a:'#fff',f:'helm cape'},
 {n:'Storm Valkyrie',r:1,c:'#8af',s:'#ff6',u:'Lightning Chain',h:'#9cf',o:'#68e',l:'#349',a:'#ff6',f:'wings band'},
 {n:'Dragon Lord',r:3,c:'#f80',s:'#fa0',u:'Dragon Breath',h:'#f60',o:'#822',l:'#411',a:'#fa0',f:'horns cape'},
 {n:'Arcane Archer',r:1,c:'#8ef',s:'#8ef',u:'Arrow Rain (shoots piercing arrows)',h:'#3a6',o:'#2a7',l:'#143',a:'#8ef',f:'hood',sh:1},
 {n:'Pyro Mage',r:2,c:'#f84',s:'#f84',u:'Fire Burst (shoots a fireball spread)',h:'#f60',o:'#c32',l:'#512',a:'#fd4',f:'helm',sh:2},
 {n:'Gunslinger',r:3,c:'#ff6',s:'#ff6',u:'Dead Eye (rapid fire)',h:'#531',o:'#a86',l:'#432',a:'#ff6',f:'band',sh:3},
 {n:'Star Sniper',r:3,c:'#fff',s:'#fff',u:'Starfall (heavy piercing shots)',h:'#cdf',o:'#336',l:'#224',a:'#fff',f:'mask',sh:4}];
SKINS.forEach(k=>k.w=[40,20,10,4,1][k.r]); // gacha weight by rarity
// ================= STATE =================
const cv=document.getElementById('c'),g=cv.getContext('2d'),ui=document.getElementById('ui'),W=C.W,H=C.H;
let slot=0,save={pts:0,own:[0],eq:0,beat:false,up:{},best:0};
save.up=save.up||{};const lv=k=>save.up[k]||0;
const store=()=>localStorage.setItem('shs'+slot,JSON.stringify(save));
const keys={},mouse={x:W/2,y:H/2};
let PKt=0,PKm='',PKc='#fff',D3=false,ENT=0,finT=0,MODE='camp',dcls='swordsman',DG=null,bx=0,by=0,fin=false,PB=[],IT=[],cleared=false,SK=null,A=null,god=false,bg,st='menu',P,E=[],PR=[],FX=[],L=1,banner=0,shake=0,slash=null,ulted=false,slow=1,atk=false,last=0;
const diff=l=>l>=15?'HELL':l>=10?'Hard':l>=5?'Medium':'Easy';
const ang=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const add=n=>{if(god)return;P.gold+=n*(P.gm||1)};
const pts=()=>god?'∞':save.pts;
const part=(x,y,c,n)=>{for(let i=0;i<n;i++){const a=Math.random()*6.28,s=60+Math.random()*160;FX.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.5,c})}};
// ================= SCREENS =================
function show(h){ui.className='';ui.innerHTML=h;ui.style.display='flex'}
function hide(){ui.style.display='none'}
function equip(i){save.eq=i;store();skins()}
const pool=()=>[1,2,3,4,5,6,7,8,9,10,11,12,13,14].filter(i=>!save.own.includes(i));
const price=n=>(n==1?C.pull1:C.pull10)*(pool().includes(5)&&!save.beat?C.strongSurcharge:1);
function gacha(msg='',cards=[]){const p=pool(),done=!p.length;
 show(`<h2>Gacha</h2><p>Points: <b>${pts()}</b></p><p>x1: ${+(C.odds1*100).toFixed(2)}% · x10: ${+(C.odds10*100).toFixed(2)}% for a skin<br>Eternal Sovereign: x1 0.00000001% · x10 0.1%<br>No skin? Half of all cards are Rubber Duckies (useless). x1: 25% upgrade · x10: 10 cards<br>Total pulls: ${save.pt||0} · Pity: ${Math.min(100,save.pc||0)}/100 (the 101st pull is a guaranteed lowest-tier skin)</p>
 <p>${save.beat?'Strongest skin discount active!':'Beat level 20 to cut the cost of the strongest skin.'}</p>
 ${done?'<p>You own every skin!</p>':''}<div class="row"><button onclick="pull(1)" ${!god&&save.pts<price(1)?'disabled':''}>Pull x1 (${price(1)})</button>
 <button onclick="pull(10)" ${!god&&save.pts<price(10)?'disabled':''}>Pull x10 (${price(10)})</button></div>
 <div class="row" style="zoom:${cards.length>5?.72:1}">${cards.map((c,i)=>cardHTML(c[0],c[1],c[2],true,i)).join('')}</div><h2>${msg}</h2><button onclick="menu()">Back</button>`)}
function pull(n){const p=pool(),cost=price(n);if(!god&&save.pts<cost)return;
 if(!god)save.pts-=cost;sfx('pull');let msg='No skin this time...',w=-1,cards=[],pity=false;save.pt=(save.pt||0)+n;if((save.pc||0)>=100){const q0=p.filter(i=>i!=5);if(q0.length){const mr=Math.min(...q0.map(i=>SKINS[i].r)),lo=q0.filter(i=>SKINS[i].r==mr);w=lo[Math.random()*lo.length|0];pity=true;save.pc=0}}else save.pc=(save.pc||0)+n;
 if(w>=0){}else if(p.includes(5)&&Math.random()<(n==1?C.top1:C.top10))w=5;
 else{const q=p.filter(i=>i!=5);if(q.length&&Math.random()<(n==1?C.odds1:C.odds10)){let r=Math.random()*q.reduce((a,i)=>a+SKINS[i].w,0);w=q[0];for(const i of q){r-=SKINS[i].w;if(r<=0){w=i;break}}}}
 if(w>=0){save.own.push(w);msg='NEW SKIN: '+SKINS[w].n+'!';cards=[[SKINS[w].r,SKINS[w].n,SKINS[w].u]];if(pity)msg+=' (pity)'}
 {let cnt=n==1?(w<0&&Math.random()<C.upOdds1?1:0):(w>=0?9:10),t=[];while(cnt--){if(n>1&&Math.random()<.5){cards.push([0,'Rubber Ducky','Useless. Gives nothing.']);continue}const o=UP.filter(u=>lv(u[0])<4);if(!o.length){save.pts+=25;cards.push([0,'Maxed','+25 points']);continue}const u=o[Math.random()*o.length|0];save.up[u[0]]=lv(u[0])+1;t.push(u[1]);cards.push([1,u[1],'+1 level'])}if(t.length&&w<0)msg='No skin, but upgrades: '+t.join(', ')}
 if(!cards.length)cards=[Math.random()<.67?[0,'Rubber Ducky','Useless. Gives nothing.']:[0,'Nothing','Try again']];const dk=cards.filter(c=>c[1]=='Rubber Ducky').length;if(dk)S('ducks',dk);store();show('<h2>Pulling...</h2><div class="rc r1 spin"></div>');setTimeout(()=>gacha(msg,cards),1100)}
function over(){st='over';save.run=null;const cg=cashOut();show(`<h1>GAME OVER</h1><p>Reached level ${L}<br>${cg} gold converted to points</p><div class="row"><button onclick="newRun()">Retry</button><button onclick="menu()">Menu</button></div>`)}
function win(){fin=false;music('peace');S('wins');st='over';save.beat=true;save.run=null;add(C.ptsWin);const cg=cashOut();show(`<h1>VICTORY!</h1><p>${EPI}</p><div class="letter"><b>The shopkeeper steps out of the shadows and hands you a letter...</b><br><br>Dear Kael,<br>You freed Aldoria, but the Shadow King's last breath carried a name I do not recognize. Something older is waking beyond the horizon.<br><br><b>Watch out for the next update.</b><br><br>- The Shopkeeper</div><h1>THE END</h1><p>${cg} gold converted to points</p><button onclick="credits()">Continue</button>`)}
// ================= POWER-UPS =================
const UPS=[
 ['Sharper Blade',s=>`+${Math.round(12*s)}% damage`,s=>P.dmg*=1+.12*s],
 ['Swift Strikes',s=>`+${Math.round(8*s)}% attack speed`,s=>P.aspd*=1+.08*s],
 ['Fleet Feet',s=>`+${Math.round(10*s)} move speed`,s=>P.spd+=10*s],
 ['Long Reach',s=>`+${Math.round(5*s)} slash range`,s=>P.rng+=5*s],
 ['Second Wind',s=>`+${Math.round(15*s)}% dodge regen`,s=>P.rgr*=1+.15*s],
 ['Vitality',s=>'+1 life',s=>P.lives++],
 ['Deflecting Blade',s=>'Slashes destroy projectiles; each level bounces more back',s=>P.def++],
 ['Heavy Strikes',s=>`+${Math.round(25*s)}% knockback`,s=>P.kb*=1+.25*s],
 ['Wide Slash',s=>`+${Math.round(10*s)}% slash size`,s=>{P.sw*=1+.1*s;P.rng*=1+.05*s}],
 ['Lifesteal Edge',s=>'Heal 1 life every few kills (stacks)',s=>{P.lsl++}],['Gold Rush',s=>`+${Math.round(15*s)}% gold earned`,s=>{P.gm=(P.gm||1)*(1+.15*s)}],['Armor Plating',s=>'+1 shield bubble',s=>{P.sh++}],
 ['Berserker',s=>`+${Math.round(10*s)}% damage, +${Math.round(8*s)} speed`,s=>{P.dmg*=1+.1*s;P.spd+=8*s}],['Spirit Ward',s=>'+1 deflect level and +1 shield',s=>{P.def++;P.sh++}]];
function pickScreen(){st='pick';const s=1+L*.15,o=[...UPS].sort(()=>Math.random()-.5).slice(0,3);
 window._o=o;show(`<h2>Level ${L} cleared! Choose a power-up</h2><div class="row">${o.map((u,i)=>`<div class="card"><b>${u[0]}</b><br>${u[1](s)}<br><br><button onclick="takeUp(${i})">Take</button></div>`).join('')}</div>`)}
function takeUp(i){window._o[i][2](1+L*.15);(MODE=='dun'?nextFloor():enterClear())}
// ================= GAME FLOW =================
function newRun(m){MODE=m||'camp';D3=gfx=='3d';fin=false;P={x:W/2,y:H/2,r:14,lives:C.lives,inv:0,dash:0,dx:0,dy:1,ch:C.maxDodge,rg:0,rgr:1,cd:0,dmg:10,aspd:1,spd:200,rng:75,buff:0,storm:0,slowT:0,def:0,sh:0,kb:260,sw:1,lsl:0,lk:0,gold:0,al:[]};L=1;applyPerm();save.run=null;if(MODE=='dun')dStart();else startLevel()}
function startLevel(skip){if(!skip&&MODE=='camp')return storyScreen();bg=makeBg();E=[];A=null;cleared=false;IT=[];PB=[];PR=[];FX=[];ulted=false;slow=1;P.buff=P.storm=P.slowT=0;P.x=W/2;P.y=H/2;P.al=P.al.filter(a=>a.rem>0);P.al.forEach(a=>{a.x=P.x+Math.random()*80-40;a.y=P.y+40});
 const boss=L%5==0,n=boss?3:L<5?2+L:4+Math.floor(L*1.2),hp=C.enemyHp*(1+C.hpGrowth*(L-1));
 const ez=L<5?.65:L<10?.85:1,tl=typesOf(L);for(let i=0;i<n;i++){const t=tl[i%3],hh=(t=='charger'?hp*1.8:hp)*ez;E.push({t,ti:TY.indexOf(t),x:Math.random()<.5?30:W-30,y:40+Math.random()*(H-80),r:t=='charger'?20:14,hp:hh,mh:hh,rng:'archer orbiter sprayer'.includes(t),sp:(42+L*3.5)*ez*.5,cd:1+Math.random()*2,tc:0,fl:0})}
 if(boss){const bh=C.bossHp*L;E.push({boss:1,x:W/2,y:70,r:50,hp:bh,mh:bh,sp:(35+L*2)*.5,cd:2,tc:0,fl:0,pat:Math.min(4,L/5)})}
 banner=2;st='play';hide();snap();music(boss?'boss':'play')}
function hurt(){if(god||P.inv>0||P.dash>0)return false;if(P.sh>0){P.sh--;P.inv=1;part(P.x,P.y,'#6cf',30);sfx('pop');return true}P.lives--;P.inv=1.2;sfx('hurt');shake=12;part(P.x,P.y,'#f44',14);if(P.lives<=0)over();return true}
function shot(o,a,s){s*=(L<5?.7:L<10?.85:1)*.48;PR.push({x:o.x,y:o.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:6,life:6})}
function bossAtk(b){const k=Math.floor(Math.random()*b.pat),a=ang(b,P);
 if(k==0)for(let i=-1;i<=1;i++)shot(b,a+i*.25,200);
 if(k==1)for(let i=0;i<16;i++)shot(b,i/16*6.283,150);
 if(k==2)for(let i=0;i<8;i++)shot(b,a+i*.1-.35,280);
 if(k==3){for(let i=0;i<24;i++)shot(b,i/24*6.283,180);shot(b,a,320)}}
function ultimate(){if(st!='play'||ulted)return;ulted=true;const k=MODE=='dun'?CLS[P.cls].u:save.eq,all=f=>E.forEach(e=>{e.hp-=e.mh*f*(e.boss?.25:1);e.fl=.15});
 FX.push({ring:1,x:P.x,y:P.y,l:.6,c:SKINS[k].c});shake=10;sfx('ult');if(god){E.forEach(e=>e.hp=0);PR=[];return}
 if(k==0){all(.3);PR=[]} // % of max HP: never a one-hit kill on a healthy enemy
 if(k==1||k==5){slow=.3;P.slowT=k==5?4:5}
 if(k==2||k==5){P.buff=6;P.inv=k==5?3:6}
 if(k==3)P.storm=4;
 if(k==4){all(.25);P.lives++}
 if(k==5){E.forEach(e=>e.hp=0);PR=[]}
 if(k==6)P.storm=3.5;if(k==7){all(.35);P.inv=3}if(k==8){all(.5);PR=[]}if(k==9){all(.25);slow=.5;P.slowT=3}if(k==10){all(.45);P.buff=4} // only the Eternal Sovereign one-hits everything
}
function dodge(){if(st!='play'||(!god&&P.ch<1)||P.dash>0)return;if(!god)P.ch--;
 let mx=(keys.d?1:0)-(keys.a?1:0),my=(keys.s?1:0)-(keys.w?1:0);
 if(!mx&&!my){const a=ang(P,mouse);mx=Math.cos(a);my=Math.sin(a)}
 const m=Math.hypot(mx,my);P.dx=mx/m;P.dy=my/m;P.dash=.22;sfx('dodge');S('dodges')}
function update(dt){if(MOB)aimAuto();else if(D3&&mouse.sx!=null)unp(mouse.sx,mouse.sy);const es=dt*slow;banner-=dt;P.inv=Math.max(0,P.inv-dt);P.cd-=dt;P.buff-=dt;
 if(P.slowT>0&&(P.slowT-=dt)<=0)slow=1;
 const mx=(keys.d?1:0)-(keys.a?1:0),my=(keys.s?1:0)-(keys.w?1:0),m=Math.hypot(mx,my)||1;
 if(P.dash>0){P.dash-=dt;P.x+=P.dx*620*dt;P.y+=P.dy*620*dt}
 else{P.x+=mx/m*P.spd*dt;P.y+=my/m*P.spd*dt;if(P.ch<C.maxDodge&&(P.rg+=dt*P.rgr)>=C.regenSec){P.ch++;P.rg=0}}
 P.x=Math.max(P.r,Math.min(W-P.r,P.x));P.y=Math.max(P.r,Math.min(H-P.r,P.y));
 if(cleared&&fin){finT-=dt;if(finT<0){if(P.x>W-P.r-4){win();return}if(P.y<P.r+4&&Math.abs(P.x-W/2)<60){startEndless();return}}}else if(cleared&&MODE=='dun'){if(doorMove())return}else if(cleared){if(MODE=='end'&&(ENT-=dt)<=0){nextRound();return}if(dist(P,SK)<45){shop();return}if(P.x>W-P.r-4&&MODE!='end'){if(MODE=='camp'&&L>=C.maxLevel){win();return}L++;startLevel();return}}
 if(atk&&P.cd<=0&&shT()){const a=ang(P,mouse);P.cd=(shT()==3?.2:.4)/P.aspd;fire(a,shT())}
 else if(atk&&P.cd<=0){const a=ang(P,mouse),d=P.dmg*(P.buff>0?2:1);P.cd=.4/P.aspd;slash={a,t:.15};sfx('slash');if(P.def>0)deflect(a);
  for(const e of E){const df=Math.abs((ang(P,e)-a+9.42)%6.283-3.14);
   if(dist(P,e)<P.rng+e.r&&df<Math.min(3.1,P.sw)){e.hp-=d;e.fl=.1;{const f=P.kb*(e.boss?.25:1);e.kx=Math.cos(a)*f;e.ky=Math.sin(a)*f}part(e.x,e.y,'#fc4',5);sfx('hit')}}}
 if(slash&&(slash.t-=dt)<=0)slash=null;
 if(P.storm>0){P.storm-=dt;for(const e of E)if(dist(P,e)<120+e.r){e.hp-=P.dmg*6*dt;e.fl=.05}}
 for(const e of E){e.fl-=dt;e.cd-=es;e.tc-=es;if(e.kx||e.ky){e.x+=e.kx*dt;e.y+=e.ky*dt;const q=Math.pow(.004,dt);e.kx*=q;e.ky*=q}const d=dist(e,P),a=ang(e,P),sg=Math.cos(a),sn=Math.sin(a);
  if(e.boss){const v=d<280?-2.4:d>400?1:0;e.x+=sg*e.sp*v*es;e.y+=sn*e.sp*v*es;if(e.cd<=0){bossAtk(e);e.cd=Math.max(.7,2-L*.04)}}
  else if(e.t=='orbiter'){e.ph=(e.ph||0)+es*.6;e.x+=(P.x+Math.cos(e.ph+e.ti)*250-e.x)*es*.75;e.y+=(P.y+Math.sin(e.ph+e.ti)*250-e.y)*es*.75;if(e.cd<=0){shot(e,a,150+L*7);e.cd=Math.max(1,2.8-L*.1)}}
  else if(e.t=='sprayer'){const v=d<260?-1:d>380?1:0;e.x+=sg*e.sp*v*es;e.y+=sn*e.sp*v*es;if(e.cd<=0){for(let i=-2;i<=2;i++)shot(e,a+i*.22,140+L*6);e.cd=Math.max(1.6,3.4-L*.1)}}
  else if(e.rng){const v=d<220?-1:d>320?1:0;e.x+=sg*e.sp*v*es;e.y+=sn*e.sp*v*es;if(e.cd<=0){shot(e,a,160+L*8);e.cd=Math.max(.8,2.6-L*.1)}}
  else if(e.t=='dasher'){if(e.dash>0){e.dash-=es;e.x+=e.vx*es;e.y+=e.vy*es}else if(e.wu>0){e.wu-=es;if(e.wu<=0){e.dash=.5;e.vx=sg*170;e.vy=sn*170;e.cd=2.2}}else{e.x+=sg*e.sp*.5*es;e.y+=sn*e.sp*.5*es;if(e.cd<=0)e.wu=.6}}
  else if(e.t=='charger'){const b=e.cd<=0;e.x+=sg*e.sp*(b?2.4:.4)*es;e.y+=sn*e.sp*(b?2.4:.4)*es;if(b&&(e.bt=(e.bt||0)+es)>.7){e.bt=0;e.cd=2.5}}
  else{e.x+=sg*e.sp*es;e.y+=sn*e.sp*es}
  if(e.boss){if(d<e.r+P.r+6&&e.tc<=0){e.tc=1;if(e.au){if(!A)hurt()}else{A={t:5,x:e.x,y:e.y-60,cd:0};e.au=1;e.fl=.3;shake=14;FX.push({angel:1,x:e.x,y:e.y,l:1,c:'#fff',vx:0,vy:0})}}} // the angel protects you for 5s; after that the boss hurts on touch
  else if(!e.rng&&d<e.r+P.r&&e.tc<=0&&hurt())e.tc=1;
  e.x=Math.max(e.r,Math.min(W-e.r,e.x));e.y=Math.max(e.r,Math.min(H-e.r,e.y))} // keep enemies on screen
 for(const p of PR){const sl=p.mine?1:slow;p.x+=p.vx*sl*dt;p.y+=p.vy*sl*dt;p.life-=dt;
  if(p.mine){for(const e of E)if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r){e.hp-=P.dmg;e.fl=.1;p.life=0;part(p.x,p.y,'#4ef',4);break}}
  else if(Math.hypot(p.x-P.x,p.y-P.y)<p.r+P.r&&hurt())p.life=0;else if(p.life>0){for(const a of P.al)if(Math.hypot(p.x-a.x,p.y-a.y)<p.r+14){a.hp-=8;p.life=0;break}}}
 PR=PR.filter(p=>p.life>0&&p.x>-20&&p.x<W+20&&p.y>-20&&p.y<H+20);
 for(const f of FX){f.l-=dt;if(!f.ring){f.x+=f.vx*dt;f.y+=f.vy*dt}}FX=FX.filter(f=>f.l>0);
 for(const a of P.al){a.cd-=es;a.hc=(a.hc||0)-es;if(a.hc<=0)for(const e of E)if(!e.rng&&dist(a,e)<e.r+14){a.hp-=e.boss?14:10;a.hc=.8;break}const t=E.reduce((b,e)=>!b||dist(a,e)<dist(a,b)?e:b,null),o=t||P,sp=(a.k=='k'?180:140)*es,aa=ang(a,o),dd=dist(a,o);
  if(dd>(t?t.r+18:60)){a.x+=Math.cos(aa)*sp;a.y+=Math.sin(aa)*sp}
  if(t&&dd<t.r+26&&a.cd<=0){a.cd=a.k=='k'?.5:.8;t.hp-=a.k=='k'?25+L*3:3+L*.3;t.fl=.1;t.kx=Math.cos(aa)*120;t.ky=Math.sin(aa)*120;part(t.x,t.y,'#fff',3)}}
 for(const b of PB){b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;for(const e of E){if(b.h.includes(e)||Math.hypot(b.x-e.x,b.y-e.y)>e.r+b.r)continue;e.hp-=b.d;e.fl=.1;e.kx=b.vx*.1*(e.boss?.25:1);e.ky=b.vy*.1*(e.boss?.25:1);part(e.x,e.y,'#fc4',3);sfx('hit');b.h.push(e);if(b.pr--<=0){b.l=0;break}}}PB=PB.filter(b=>b.l>0&&b.x>-20&&b.x<W+20&&b.y>-20&&b.y<H+20);
 for(const i of IT){i.l-=dt;if(dist(i,P)<28){i.l=0;sfx('item_'+i.t);S('items');{const d=ITM[i.t];PKm=d[0];PKc=d[1];PKt=2}if(i.t=='heart')P.lives++;else if(i.t=='coin')add(30);else if(i.t=='shield')P.sh++;else P.buff=6}}IT=IT.filter(i=>i.l>0);
 P.al=P.al.filter(a=>a.hp>0);
 if(A){A.t-=dt;A.cd-=dt;const t=E.find(e=>e.boss)||E.reduce((b,e)=>!b||dist(A,e)<dist(A,b)?e:b,null); // angel ally: 30s, massive damage
  if(!t||A.t<=0)A=null;else{const a=ang(A,t);A.x+=Math.cos(a)*320*dt;A.y+=Math.sin(a)*320*dt;
   if(dist(A,t)<t.r+40&&A.cd<=0){A.cd=.35;t.hp-=t.mh*(t.boss?.03:.6);t.fl=.1;part(t.x,t.y,'#ffe',6)}}}
 for(const e of E)if(e.hp<=0){add(e.boss?C.ptsBoss:C.ptsKill);part(e.x,e.y,e.boss?'#f80':'#f55',e.boss?40:12);sfx('kill');S('kills');if(P.lsl&&++P.lk>=Math.max(5,16-P.lsl*3)){P.lk=0;P.lives++}if(e.boss){S('bosses');bx=e.x;by=e.y}else if(Math.random()<.14)IT.push({x:e.x,y:e.y,t:['heart','coin','shield','power'][Math.random()*4|0],l:12})}
 E=E.filter(e=>e.hp>0);shake*=.9;
 if(st=='play'&&!cleared&&!E.length){if(MODE=='dun')dClear();else{add(C.ptsLevel);S('levels');if(L==C.maxLevel&&MODE=='camp')finale();else pickScreen()}}}
// ================= RENDER =================
function draw(){if(D3&&P&&st!='menu'){draw3D();return}g.save();g.clearRect(0,0,W,H);if(bg)g.drawImage(bg,0,0);if(shake>.5)g.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 if(P&&st!='menu'){
  for(const f of FX){g.globalAlpha=Math.max(0,f.l*2);g.strokeStyle=g.fillStyle=f.c;
   if(f.ring){g.lineWidth=5;g.beginPath();g.arc(f.x,f.y,(.6-f.l)*1000,0,6.28);g.stroke()}else if(f.angel)angel(f);else g.fillRect(f.x,f.y,4,4)}g.globalAlpha=1;
  for(const e of E){monster(e);
   if(!e.boss){g.fillStyle='#400';g.fillRect(e.x-14,e.y-e.r-8,28,4);g.fillStyle='#4f4';g.fillRect(e.x-14,e.y-e.r-8,28*e.hp/e.mh,4)}}
  g.shadowBlur=gfx=='enhanced'?14:0;for(const p of PR){g.shadowColor=g.fillStyle=p.mine?'#4ef':'#ff6';g.beginPath();g.arc(p.x,p.y,p.r,0,6.28);g.fill()}g.shadowBlur=0
  g.shadowBlur=gfx=='enhanced'?14:0;for(const b of PB){g.shadowColor=g.fillStyle=b.c;g.beginPath();g.arc(b.x,b.y,b.r,0,6.28);g.fill()}g.shadowBlur=0
  for(const i of IT){g.fillStyle={heart:'#f44',coin:'#fd0',shield:'#6cf',power:'#f80'}[i.t];g.beginPath();g.arc(i.x,i.y,9,0,6.28);g.fill();g.fillStyle='#000';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText({heart:'+',coin:'$',shield:'S',power:'!'}[i.t],i.x,i.y+4)}
  if(fin)drawFin();else if(cleared&&MODE!='dun')drawClear();for(const a of P.al){human(a.x,a.y,a.k=='k'?KN:MC2,a.k=='k'?1.5:1,false);g.fillStyle='#400';g.fillRect(a.x-14,a.y-34,28,4);g.fillStyle='#4f4';g.fillRect(a.x-14,a.y-34,28*Math.max(0,a.hp)/a.mh,4)}if(A)angel({x:A.x,y:A.y+60,l:1,txt:Math.ceil(A.t)+'s'});const k=SKINS[save.eq];
  if(slash){g.strokeStyle=k.s;g.lineWidth=6+3*P.sw;g.globalAlpha=slash.t/.15;g.beginPath();g.arc(P.x,P.y,P.rng,slash.a-Math.min(3.1,P.sw),slash.a+Math.min(3.1,P.sw));g.stroke();g.globalAlpha=1}
  if(P.storm>0){g.strokeStyle=k.s;g.beginPath();g.arc(P.x,P.y,120,0,6.28);g.stroke()}
  g.globalAlpha=P.dash>0?.4:(P.inv>0&&Math.floor(P.inv*15)%2?.4:1);human(P.x,P.y,k,1.3,mouse.x<P.x);g.save();g.translate(P.x,P.y);g.rotate(ang(P,mouse));g.fillStyle=k.s;g.fillRect(12,-2,24,4);g.fillStyle='#864';g.fillRect(8,-3,5,6);g.restore();g.globalAlpha=1;
  if(save.ti>=0&&ACH[save.ti]){g.fillStyle='#fc4';g.font='bold 12px sans-serif';g.textAlign='center';g.fillText('['+ACH[save.ti][0]+']',P.x,P.y-48)}
  if(P.sh>0){g.fillStyle='rgba(80,160,255,.25)';g.strokeStyle='rgba(120,200,255,.9)';g.lineWidth=3;g.beginPath();g.arc(P.x,P.y,30,0,6.28);g.fill();g.stroke()}
  hud();if(banner>0){g.fillStyle='#fc4';g.font='bold 34px sans-serif';g.textAlign='center';
   g.fillText((L%5==0?CH[Math.min(3,(L-1)/5|0)].boss+' - ':'')+'LEVEL '+L+' - '+diff(L),W/2,H/2-80);g.font='20px sans-serif';g.fillText(LORE[Math.min(19,L-1)].n,W/2,H/2-50)}}
 if(tt>0){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(W/2-170,H-70,340,40);g.fillStyle='#fc4';g.font='bold 16px sans-serif';g.textAlign='center';g.fillText(tmsg,W/2,H-44)}
 if(st=='menu')menuArt();post();g.restore()}
function hud(){if(PKt>0){g.globalAlpha=Math.min(1,PKt*2);g.fillStyle='rgba(0,0,0,.65)';g.fillRect(W/2-150,H-118,300,34);g.fillStyle=PKc;g.beginPath();g.arc(W/2-130,H-101,8,0,6.28);g.fill();g.fillStyle='#fff';g.font='bold 15px sans-serif';g.textAlign='left';g.fillText(PKm,W/2-114,H-96);g.globalAlpha=1}if(MODE=='dun'&&DG)drawMap();g.textAlign='left';g.fillStyle='#fff';g.font='16px sans-serif';
 g.fillText(`Lives: ${'♥'.repeat(Math.max(0,P.lives))} ${'◆'.repeat(P.sh||0)}`,12,24);g.fillText(`${MODE=='dun'?'Floor '+DG.floor:(MODE=='end'?'ENDLESS wave ':'Level ')+L+(MODE=='camp'?'/'+C.maxLevel:'')} · ${diff(L)} · Enemies: ${E.length}`,12,46);
 g.fillText(`Gold: ${god?'∞':P.gold|0}`,12,68);g.fillText('Dodge:',12,92);if(god){g.fillStyle='#f66';g.fillText('GOD MODE',200,24);g.fillStyle='#fff'}
 for(let i=0;i<C.maxDodge;i++){g.fillStyle=i<P.ch?'#4cf':'#234';g.fillRect(70+i*24,80,18,14)}
 g.fillStyle='#4cf';g.fillRect(70,97,72*(P.ch<C.maxDodge?P.rg/C.regenSec:0),3);
 g.fillStyle=ulted?'#666':'#fc4';g.fillText(ulted?'Ultimate used':'[Q] '+SKINS[MODE=='dun'?CLS[P.cls].u:save.eq].u+' READY',12,120);
 const b=E.find(e=>e.boss);if(b){g.fillStyle='#400';g.fillRect(W/2-250,12,500,16);g.fillStyle='#f60';g.fillRect(W/2-250,12,500*b.hp/b.mh,16);
  g.fillStyle='#fff';g.textAlign='center';g.fillText('BOSS',W/2,25)}}
// ================= INPUT & LOOP =================
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if(k=='q')ultimate();if(k=='escape'){if(st=='play')pause();else if(st=='pause')unpause()}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
cv.addEventListener('contextmenu',e=>e.preventDefault());
ui.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('mousemove',e=>{if(MOB)return;const r=cv.getBoundingClientRect();mouse.sx=(e.clientX-r.left)*W/r.width;mouse.sy=(e.clientY-r.top)*H/r.height;if(D3)unp(mouse.sx,mouse.sy);else{mouse.x=mouse.sx;mouse.y=mouse.sy}});
cv.addEventListener('mousedown',e=>{if(MOB)return;if(e.button==0)atk=true;if(e.button==2)dodge()});
addEventListener('mouseup',e=>{if(e.button==0)atk=false});
function loop(ts){const dt=Math.min(.033,(ts-last)/1000||0);last=ts;tt-=dt;PKt-=dt;bar.style.display=(MODE=='end'&&cleared&&st=='play')?'flex':'none';mc.style.display=(MOB&&st=='play')?'block':'none';if(st=='play')update(dt);draw();requestAnimationFrame(loop)}
// ================= STORY =================
const CH=[
 {t:'Chapter 1: Ashfall Village',boss:'Gorrak the Hollow Brute',s:"Aldoria was a kingdom of light until the Shadow King cursed its heart. Now ash falls like snow and monsters crawl from the Hollow. Kael, last squire of the Crown, has only a rusted sword and a promise to his dying father: end the curse."},
 {t:'Chapter 2: Whispering Forest',boss:'Thornmaw the Rotwood',s:'Beyond the ashes lies the Whispering Forest, once the kingdoms pride. The curse has twisted every root and branch. An angel watches over Kael from above, waiting for the moment he needs her most.'},
 {t:'Chapter 3: Molten Depths',boss:'Cinderfang the Magma Wyrm',s:'The only road to the capital runs through the Molten Depths. The air burns, the stone bleeds fire, and the monsters here were forged by the Shadow King himself. The end is near, but so is the danger.'},
 {t:'Chapter 4: Throne of Night',boss:'The Shadow King',s:'The black castle looms under a blood moon. Behind its gates waits the Shadow King, the source of every scream in Aldoria. End this, Kael. Free the kingdom.'}];
const EPI='The Shadow King falls and the curse breaks. Dawn rises over Aldoria, and Kael is hailed as its savior.';
const BG=[['#f7a05a','#3a2230','#2a1d1a'],['#1f3b3a','#0c1a18','#14231a'],['#3a0f0a','#150404','#241410'],['#2a0a3a','#07020d','#14101c']];
const MC=['#c55','#6a4','#f82','#86c'],BC=['#a33','#385','#e50','#222'];
function storyScreen(){st='story';bg=makeBg();const c=CH[Math.min(3,(L-1)/5|0)],o=LORE[Math.min(19,L-1)],ch=(L-1)%5==0;
 show(`<h2>${ch?c.t:'Level '+L}</h2>${ch?`<p style="max-width:640px;line-height:1.5">${c.s}</p>`:''}<h3 style="margin:0;color:#fc4">${o.n}</h3><p style="max-width:640px;line-height:1.5">${o.s}</p><p class="dim">Enemies: ${[...new Set(typesOf(L))].join(', ')}${L%5==0?' · Boss: '+c.boss:''}</p><button onclick="startLevel(true)">Begin</button>`)}
// ================= BACKGROUNDS (change every level, darker as the story goes on) =================
function makeBg(){if(MODE=='end')return hellBg||(hellBg=mkHell());const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),ci=Math.min(3,(L-1)/5|0),p=(L-1)%5,T=BG[ci],gy=H*.68;
 let s=L*7919;const R=()=>(s=s*16807%2147483647)/2147483647;
 let gr=x.createLinearGradient(0,0,0,gy);gr.addColorStop(0,T[0]);gr.addColorStop(1,T[1]);x.fillStyle=gr;x.fillRect(0,0,W,H);
 if(ci!=2){x.fillStyle=ci==0?'#ffd27a':ci==1?'#dfe':'#e22';x.beginPath();x.arc(780-p*60,ci==0?150+p*30:90,ci==3?55:40,0,6.28);x.fill()}
 if(ci==0)for(let i=0;i<7;i++){const a=40+i*135+R()*30,h=60+R()*40;x.fillStyle='#1b1215';x.fillRect(a,gy-h,70,h);x.beginPath();x.moveTo(a-8,gy-h);x.lineTo(a+35,gy-h-40);x.lineTo(a+78,gy-h);x.fill();x.fillStyle='rgba(255,120,30,'+(.3+p*.15)+')';x.fillRect(a+20,gy-h+20,14,18)}
 if(ci==1)for(let i=0;i<16;i++){const a=R()*W,h=120+R()*120;x.fillStyle='#0a140f';x.fillRect(a-6,gy-h*.4,12,h*.4);for(let j=0;j<3;j++){x.beginPath();x.moveTo(a-45+j*8,gy-h*.3-j*h*.22);x.lineTo(a,gy-h*.6-j*h*.22-30);x.lineTo(a+45-j*8,gy-h*.3-j*h*.22);x.fill()}}
 if(ci==2){for(let i=0;i<14;i++){const a=R()*W,h=40+R()*90;x.fillStyle='#120807';x.beginPath();x.moveTo(a-25,0);x.lineTo(a,h);x.lineTo(a+25,0);x.fill()}
  let l=x.createLinearGradient(0,gy-60,0,gy);l.addColorStop(0,'rgba(255,90,0,0)');l.addColorStop(1,'rgba(255,120,0,'+(.5+p*.1)+')');x.fillStyle=l;x.fillRect(0,gy-60,W,60)}
 if(ci==3){for(let i=0;i<5;i++){const a=60+i*190,h=140+R()*120;x.fillStyle='#0c0714';x.fillRect(a,gy-h,60,h);for(let j=0;j<4;j++)x.fillRect(a+j*16-2,gy-h-12,10,12);x.fillStyle='#fc4';x.fillRect(a+24,gy-h+30,10,16)}
  if(p>1){x.strokeStyle='rgba(220,200,255,.7)';x.lineWidth=2;x.beginPath();let lx=100+R()*700,ly=0;x.moveTo(lx,ly);while(ly<gy-40){lx+=R()*50-25;ly+=40;x.lineTo(lx,ly)}x.stroke()}}
 x.fillStyle=T[2];x.fillRect(0,gy,W,H-gy);x.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<80;i++)x.fillRect(R()*W,gy+R()*(H-gy),3,2);
 x.fillStyle=`hsla(${L*47%360},70%,45%,.16)`;x.fillRect(0,0,W,H); // every level gets its own tint + weather
 const wt=L%4;for(let i=0;i<60;i++){const a=R()*W,b=R()*gy;
  if(wt==0){x.fillStyle='rgba(255,255,255,.8)';x.fillRect(a,b*.6,2,2)}
  else if(wt==1){x.fillStyle='rgba(255,255,255,.04)';x.fillRect(0,b,W,12)}
  else if(wt==2){x.fillStyle='rgba(255,140,40,.7)';x.fillRect(a,b,3,3)}
  else{x.strokeStyle='rgba(180,200,255,.35)';x.beginPath();x.moveTo(a,b);x.lineTo(a-6,b+22);x.stroke()}}
 x.fillStyle='rgba(0,0,0,'+p*.07+')';x.fillRect(0,0,W,H);return c}
// ================= CHARACTER ART =================
function human(x,y,k,s,fl){g.save();g.translate(x,y);g.scale(fl?-s:s,s);if(gfx!='classic'){g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,20,12,4,0,0,6.28);g.fill()}
 if(k.f.includes('crown')){g.fillStyle='rgba(200,100,255,.25)';g.beginPath();g.arc(0,0,26,0,6.28);g.fill()}
 if(k.f.includes('wings')){g.fillStyle='#fff';for(const d of[-1,1]){g.beginPath();g.moveTo(d*6,-6);g.lineTo(d*26,-22);g.lineTo(d*22,6);g.fill()}}
 if(k.f.includes('cape')){g.fillStyle=k.a;g.beginPath();g.moveTo(-8,-6);g.lineTo(8,-6);g.lineTo(12,18);g.lineTo(-12,18);g.fill()}
 g.fillStyle=k.l;g.fillRect(-6,8,5,11);g.fillRect(1,8,5,11);
 g.fillStyle=k.o;g.fillRect(-8,-8,16,17);g.fillRect(-12,-7,4,12);g.fillRect(8,-7,4,12);
 g.fillStyle=k.a;g.fillRect(-8,3,16,3);
 g.fillStyle='#f1c7a0';g.beginPath();g.arc(0,-15,8,0,6.28);g.fill();g.fillRect(-12,3,4,4);g.fillRect(8,3,4,4);
 g.fillStyle=k.h;g.beginPath();g.arc(0,-16,8.5,3.14,6.28);g.fill();
 if(k.f.includes('hood')){g.fillStyle=k.o;g.beginPath();g.arc(0,-15,10,2.9,6.5);g.fill()}
 if(k.f.includes('helm')){g.fillStyle='#bcd';g.beginPath();g.arc(0,-16,9,3.14,6.28);g.fill();g.fillStyle=k.a;g.fillRect(-2,-31,4,9)}
 if(k.f.includes('band')){g.fillStyle=k.a;g.fillRect(-9,-18,18,3)}
 if(k.f.includes('crown')){g.fillStyle='#fd0';g.fillRect(-7,-27,14,5);g.fillRect(-7,-31,3,5);g.fillRect(-1,-32,3,6);g.fillRect(4,-31,3,5)}
 if(k.f.includes('mask')){g.fillStyle=k.a;g.fillRect(-8,-14,16,6)}
 if(k.f.includes('horns')){g.fillStyle='#eee';g.beginPath();g.moveTo(-7,-22);g.lineTo(-12,-34);g.lineTo(-2,-24);g.moveTo(7,-22);g.lineTo(12,-34);g.lineTo(2,-24);g.fill()}
 g.fillStyle='#000';g.fillRect(2,-16,2,2);g.fillRect(-4,-16,2,2);g.restore()}
function monster(e){const ci=Math.min(3,(L-1)/5|0),c=e.fl>0?'#fff':e.col||(e.boss?BC[ci]:`hsl(${(HUE[ci]+(e.ti||0)*35)%360},60%,45%)`),r=e.r,t=performance.now()/250;g.save();g.translate(e.x,e.y);if(gfx!='classic'){g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,e.r*.9,e.r,e.r*.3,0,0,6.28);g.fill()}if(e.wu>0){g.fillStyle='#f33';g.fillRect(-2,-e.r*2.4,4,12)}g.fillStyle=c;
 if(e.boss){if(e.dn=='dragon'){g.fillStyle=c;for(const d of[-1,1]){g.beginPath();g.moveTo(d*r*.6,-r*.2);g.lineTo(d*r*1.9,-r*1.1);g.lineTo(d*r*1.2,r*.5);g.fill()}}g.beginPath();g.ellipse(0,0,r,r*.9,0,0,6.28);g.fill();
  for(const d of[-1,1]){g.beginPath();g.moveTo(d*r*.5,-r*.7);g.lineTo(d*r*.9,-r*1.5);g.lineTo(d*r*.2,-r*.9);g.fill()}
  g.fillStyle='#ff0';const n=2+ci;for(let i=0;i<n;i++){g.beginPath();g.arc((i-(n-1)/2)*r*.35,-r*.25,r*.1,0,6.28);g.fill()}
  g.fillStyle='#200';g.beginPath();g.arc(0,r*.3,r*.45,0,3.14);g.fill();g.fillStyle='#fff';for(let i=-3;i<=3;i++)g.fillRect(i*r*.12-2,r*.3,4,r*.15)}
 else if(e.rng&&!e.dn){g.beginPath();g.arc(0,0,r,0,6.28);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,-2,r*.65,0,6.28);g.fill();
  const a=ang(e,P);g.fillStyle='#d00';g.beginPath();g.arc(Math.cos(a)*5,-2+Math.sin(a)*5,r*.3,0,6.28);g.fill();
  g.strokeStyle=c;g.lineWidth=3;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*5,r*.8);g.quadraticCurveTo(i*5+Math.sin(t+i)*6,r*1.4,i*6,r*1.8);g.stroke()}}
 else{g.beginPath();g.arc(0,0,r,0,6.28);g.fill();for(const d of[-1,1]){g.beginPath();g.moveTo(d*r*.4,-r*.7);g.lineTo(d*r*.8,-r*1.5);g.lineTo(d*r*.1,-r*.9);g.fill()}
  g.fillStyle='#ff0';g.fillRect(-7,-5,5,4);g.fillRect(2,-5,5,4);g.fillStyle='#fff';g.fillRect(-5,4,3,5);g.fillRect(2,4,3,5)}
 g.restore()}
// ================= DEV CODE =================
function code(){const v=document.getElementById('cd').value;if(v==='Elan')god=!god;else if(hub&&v==='Money'){save.pts+=1000;store();sfx('buy')}else if(hub&&v==='Randy'){if(!save.own.includes(5))save.own.push(5);store();sfx('ach')}hub?menu():title()}
// ================= PERMANENT UPGRADES (0.4) =================
const UP=[['dmg','Blade Power','+12% damage per level'],['aspd','Strike Speed','+12% attack speed per level'],['spd','Fleet Feet','+18 move speed per level'],
 ['rng','Long Reach','+8 slash range per level'],['rgr','Dodge Regen','+12% dodge regen per level'],['life','Vitality','+1 starting life per level'],
 ['def','Deflect','Slash destroys projectiles; Lv2+ bounces some back'],['kb','Knockback','+12% knockback per level'],['sw','Wide Slash','+10% slash width, +6% range per level'],['gm','Gold Rush','+10% gold earned per level'],['ls','Lifesteal','Heal on kills (faster per level)']];
const mu=l=>1+.12*l+(l>=5?.6:0); // level 5 (MAX) adds a huge bonus
function applyPerm(){const l=lv;P.dmg*=mu(l('dmg'));P.aspd*=mu(l('aspd'));P.rgr*=mu(l('rgr'));P.spd+=18*l('spd')+(l('spd')>=5?60:0);
 P.rng+=8*l('rng')+(l('rng')>=5?30:0);P.lives+=l('life')+(l('life')>=5?2:0);P.def=l('def')+(l('def')>=5?2:0);P.kb*=mu(l('kb'));P.sw*=1+.1*l('sw')+(l('sw')>=5?.4:0);P.rng*=1+.06*l('sw');P.gm=(P.gm||1)*(1+.1*l('gm')+(l('gm')>=5?.5:0));P.lsl+=l('ls');if(save.ti>=0&&ACH[save.ti])ACH[save.ti][4]()}
function forge(msg=''){show(`<h2>Upgrades</h2><p>Points: <b>${pts()}</b> · Gacha can also give upgrades (up to Lv4). MAX (Lv5) is points only and overpowered.</p><div class="row">${UP.map(([k,n,d])=>{const l=lv(k),c=C.upCost[l];
 return `<div class="card"><b>${n}</b><br>${'■'.repeat(l)}${'□'.repeat(5-l)}<br><span class="dim">${d}</span><br><br><button onclick="buyUp('${k}')" ${l>=5||(!god&&save.pts<c)?'disabled':''}>${l>=5?'MAX':'Upgrade ('+c+')'}</button></div>`}).join('')}</div><p>${msg}</p><button onclick="menu()">Back</button>`)}
function buyUp(k){const l=lv(k),c=C.upCost[l];if(l>=5||(!god&&save.pts<c))return;if(!god)save.pts-=c;save.up[k]=l+1;store();forge(UP.find(u=>u[0]==k)[1]+' upgraded!')}
function deflect(a){const bc=Math.min(.9,(P.def-1)*.2);for(const p of PR){if(p.mine||dist(P,p)>P.rng+p.r)continue;if(Math.abs((ang(P,p)-a+9.42)%6.283-3.14)>1.1*P.sw)continue;
 const t=E.reduce((b,e)=>!b||dist(p,e)<dist(p,b)?e:b,null);
 if(t&&Math.random()<bc){const sp=420,b=ang(p,t);p.vx=Math.cos(b)*sp;p.vy=Math.sin(b)*sp;p.mine=true;p.life=4}else{p.life=0;part(p.x,p.y,'#fff',4)}}}
function angel(f){const y=f.y-60+(1-f.l)*50;g.fillStyle='rgba(255,255,200,.25)';g.fillRect(f.x-14,0,28,f.y);g.fillStyle='#fff';
 for(const d of[-1,1]){g.beginPath();g.ellipse(f.x+d*22,y,24,9,-d*.5,0,6.28);g.fill()}
 g.beginPath();g.arc(f.x,y,9,0,6.28);g.fill();g.fillRect(f.x-6,y+8,12,18);g.strokeStyle='#fd0';g.lineWidth=3;g.beginPath();g.ellipse(f.x,y-14,10,3,0,0,6.28);g.stroke();
 g.fillStyle='#fd0';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText(f.txt||'SMITE!',f.x,y-30)}
if(localStorage.shsave&&!localStorage.shs0)localStorage.shs0=localStorage.shsave;
// ================= 0.5: LORE, ENEMY TYPES, SHOP, SAVES, CARDS =================
const LORE=[['Ashfall Gate','Smoke chokes the village gate. Kael draws his fathers rusted sword as the first raiders pour in.'],
['Burning Market','The market stalls burn. Merchants beg for help while beasts feast on the ruins.'],
['Ruined Chapel','In the chapel, a dying priest whispers of the Shadow Kings seven seals.'],
['Blackened Fields','Crops rot black. Something fast is hunting between the scarecrows.'],
['Hollow Rift','A crack in the earth bleeds darkness. Gorrak guards the way, and he never lets travelers pass.'],
['Forest Edge','Gorrak is dead, but the trees whisper Kaels name. The road forks into shadow.'],
['Hanging Moss','Moss hangs like burial shrouds. Glowing eyes follow every step.'],
['Spirit Pond','Drowned souls rise from the pond and beg for release. Cut the corrupted ones down.'],
['Hunters Camp','Abandoned camps, still warm. The hunters have become the hunted.'],
['Heart of Thorns','Thornmaw coils around the withered World Tree. Its roots drink the kingdom dry.'],
['Ember Pass','Thornmaw falls and a scorched pass opens. The mountain itself seems to breathe.'],
['Obsidian Bridge','A narrow bridge of black glass over lava. One wrong step and the Depths take you.'],
['Forgotten Forge','Dwarven anvils still glow. Their cursed smiths forged weapons for the Shadow King.'],
['Magma Falls','Rivers of fire fall into the dark. The heat steals the breath from Kaels lungs.'],
['Cinderfangs Lair','Bones of heroes litter the lair. Cinderfang uncoils and the cavern shakes.'],
['Capital Outskirts','Cinderfang is slain. The capitals towers rise ahead, silent and cold.'],
['Hollow Streets','The streets are empty but for echoes. Every window hides a watcher.'],
['Royal Gardens','Black roses bloom where the queen once walked. Their petals cut like glass.'],
['Hall of Kings','Statues of fallen kings turn their heads to follow Kael. The throne is close.'],
['Throne of Night','The Shadow King rises from his throne. This is the end of the curse, one way or the other.']].map(([n,s])=>({n,s}));
const TY=['brute','archer','dasher','orbiter','sprayer','charger'],typesOf=l=>[TY[l%6],TY[(l*2+1)%6],TY[(l+3)%6]],HUE=[0,110,25,270];
const RN=['Common','Uncommon','Rare','Legendary','Mythic'];
const BOLT='<svg class="bolt" viewBox="0 0 100 140"><polyline gold="30,0 55,45 38,48 70,100 50,104 80,140" fill="none" stroke="#f33" stroke-width="3"/><polyline gold="75,0 60,30 72,34 52,70" fill="none" stroke="#f55" stroke-width="2"/></svg>';
const cardHTML=(r,t,sub,an,i)=>`<div class="rc r${r}${an?' pull':''}" ${an?`style="animation-delay:${i*.18}s"`:''}><small>${RN[r]}</small><div style="font-size:15px;text-align:center;margin:6px 0">${t}</div><small>${sub}</small>${r==4?BOLT:''}${r>=3?'<i class="spark"></i><i class="spark s2"></i>':''}${an&&r>=2?`<div class="cover" style="animation-delay:${i*.18+.9}s"></div>`:''}</div>`;
function skins(){show(`<h2>Skins</h2><p>Points: ${pts()}</p><div class="row" style="max-width:900px">${SKINS.map((s,i)=>save.own.includes(i)
 ?`<div>${cardHTML(s.r,s.n,s.u)}<button onclick="equip(${i})">${save.eq==i?'Equipped':'Equip'}</button></div>`
 :`<div class="lock">${cardHTML(0,'???','Locked')}</div>`).join('')}</div><button onclick="menu()">Back</button>`)}
// ---- shop (after every level) ----
const SHOP=[['Healing Potion','+1 life',60,()=>{P.lives++}],['Iron Shield','Blocks the next hit',90,()=>{P.sh++}],['Whetstone','+10% damage',80,()=>{P.dmg*=1.1}],
 ['Swift Boots','+12 move speed',70,()=>{P.spd+=12}],['Deflect Rune','+1 deflect level',110,()=>{P.def++}],
 ['Forge Upgrade','Random permanent upgrade (from next run)',150,()=>{const o=UP.filter(u=>lv(u[0])<4);if(o.length){const u=o[Math.random()*o.length|0];save.up[u[0]]=lv(u[0])+1}}],
 ['Hire Mercenary','Cheap and weak. Fights for 3 rounds',40,()=>hire('m')],['Hire Knight','Strong. Fights for 3 rounds',220,()=>hire('k')]];
const cost=i=>Math.round(SHOP[i][2]*(1+L*.12));
function shop(msg=''){if(!msg)sfx('shop_open');st='shop';show(`<h2>Shopkeeper's Wares</h2><p>Gold: <b>${god?'∞':P.gold|0}</b> · Allies: ${P.al.length}/5</p><div class="row">${SHOP.map((s,i)=>`<div class="card"><b>${s[0]}</b><br>${s[1]}<br><br><button onclick="buy(${i})" ${!god&&P.gold<cost(i)?'disabled':''}>${cost(i)} gold</button></div>`).join('')}</div><p>${msg}</p><button onclick="leaveShop()">Leave shop</button>`)}
function buy(i){const c=cost(i);if(!god&&P.gold<c){sfx('shop_deny');return}if(i>5&&P.al.length>=5){sfx('shop_deny');return shop('Party full (max 5 allies)')}if(!god)P.gold-=c;SHOP[i][3]();sfx(i>5?'shop_hire':'shop_buy');store();shop(SHOP[i][0]+' bought!')}
// ---- saves ----
function delSlot(i,m){if(!confirm('Delete this save permanently? This cannot be undone.'))return;localStorage.removeItem('shs'+i);if(slot==i)setSave({pts:0,own:[0],eq:0,beat:false,up:{},best:0});m?slots(m):title()}
function setSave(o){save=o;save.up=save.up||{};save.ac=save.ac||{};save.sx=save.sx||{};save.cl=save.cl||{};save.best=save.best||0}
function snap(){if(MODE=='dun')return;save.best=Math.max(save.best||0,L);save.run={L,lives:P.lives,dmg:P.dmg,aspd:P.aspd,spd:P.spd,rng:P.rng,rgr:P.rgr,def:P.def,sh:P.sh,mode:MODE,kb:P.kb,sw:P.sw,lsl:P.lsl,gold:P.gold,al:P.al.map(a=>({k:a.k,rem:a.rem,x:P.x,y:P.y,cd:0,hp:a.hp,mh:a.mh}))};store()}
function resume(){const r=save.run;newRun(r.mode);Object.assign(P,r);L=r.L;startLevel(true)}
function slots(m){show(`<h2>${m=='new'?'New Game':'Load Game'}</h2><div class="row">${[0,1,2].map(i=>{const d=JSON.parse(localStorage.getItem('shs'+i)||'null');
 return `<div class="card"><b>Slot ${i+1}</b><br>${d?`Points ${d.pts}<br>Skins ${d.own.length}/${SKINS.length}<br>Best Lv ${d.best||0}${d.run?'<br>Run: Lv '+d.run.L:''}`:'Empty'}<br><br><button onclick="pickSlot(${i},'${m}')" ${m=='load'&&!d?'disabled':''}>${m=='new'?'Start':'Load'}</button> <button onclick="delSlot(${i},'${m}')" ${d?'':'disabled'}>Delete</button></div>`}).join('')}</div><button onclick="title()">Back</button>`)}
function pickSlot(i,m){if(m=='new'){if(localStorage.getItem('shs'+i)&&!confirm('Overwrite this save?'))return;setSave({pts:0,own:[0],eq:0,beat:false,up:{},best:0})}else setSave(JSON.parse(localStorage.getItem('shs'+i)));slot=i;store();menu()}
// ---- menus ----
let hub=false;
function title(){music('menu');MODE='camp';D3=false;st='menu';hub=false;L=1;bg=makeBg();show(`<div class="logo">ARGON</div><div class="tag">A Tale of Aldoria <span class="ver">1.02</span></div>
 <div class="stack"><button onclick="slots('new')">New Game</button><button onclick="slots('load')">Load Game</button><button onclick="settings()">Settings</button></div>
 <div class="dev"><input id="cd" placeholder="Dev code" size="8"> <button onclick="code()">OK</button> ${god?'<b>GOD MODE ON</b>':''}</div>`);ui.className='m'}
function menu(){music('menu');MODE='camp';D3=false;st='menu';hub=true;L=1;bg=makeBg();const r=save.run;
 show(`<div class="logo small">ARGON <span class="ver">1.02</span></div><p>Slot ${slot+1} · Points <b>${pts()}</b> · Skin: ${SKINS[save.eq].n} · Best: Lv ${save.best||0}</p>
 <div class="stack">${r?`<button onclick="resume()">Continue (Level ${r.L})</button>`:''}<button onclick="newRun()">${r?'New Campaign':'Campaign'}</button><button onclick="classes()">Dungeons</button>${save.beat?`<button onclick="newRun('end')">Endless</button>`:''}<button onclick="skins()">Skins</button><button onclick="gacha()">Gacha</button><button onclick="forge()">Upgrades</button><button onclick="missions()">Missions</button><button onclick="titles()">Titles</button><button onclick="settings()">Settings</button><button onclick="title()">Save Slots</button><button onclick="delSlot(slot,'')">Delete Save</button></div>
 <p class="dim">Move: WASD · Attack: Left Click · Dodge: Right Click · Ultimate: Q</p>
 <div class="dev"><input id="cd" placeholder="Dev code" size="8"> <button onclick="code()">OK</button> ${god?'<b>GOD MODE ON</b>':''}</div>`);ui.className='m'}
function menuArt(){const t=performance.now()/1000,k=SKINS[save.eq];g.fillStyle='rgba(255,150,40,.8)';
 for(let i=0;i<40;i++)g.fillRect((i*97+t*(15+i%4*8))%W,H-(t*(30+i%5*12)+i*53)%H,2+i%3,2+i%3);
 const y=H-150+Math.sin(t*2)*4;human(190,y,k,7,false);g.save();g.translate(190,y);g.rotate(-.9);g.fillStyle=k.s;g.fillRect(40,-6,110,10);g.restore()}
// ================= 0.6: PAUSE, ALLIES, CLEAR-ROOM SHOP, INTRO =================
const SHOPK={h:'#ddd',o:'#7a3',l:'#432',a:'#fc4',f:'hood'},MC2={h:'#432',o:'#865',l:'#432',a:'#aaa',f:'band'},KN={h:'#ccc',o:'#9ab',l:'#678',a:'#fc4',f:'helm cape'};
function hire(k){if(P.al.length<5){P.al.push({k,rem:3,x:P.x,y:P.y,cd:0,hp:k=='k'?90:30,mh:k=='k'?90:30});S('hires')}} // allies fight for 3 rounds
function enterClear(){ENT=10;sfx('win');cleared=true;PR=[];P.al.forEach(a=>a.rem--);SK={x:W/2-220,y:H/2+20};st='play';hide();banner=0}
function leaveShop(){sfx('shop_leave');st='play';hide();P.x=SK.x+90;P.y=SK.y}
function cashOut(){const n=Math.floor(P.gold||0);if(!god)save.pts+=n;P.gold=0;store();return n} // gold -> points
function pause(){sfx('pause');st='pause';atk=false;show('<h2>Paused</h2><div class="stack"><button onclick="unpause()">Resume</button><button onclick="menu()">Menu</button><button onclick="mobP()">Mobile controls: '+(MOB?'ON':'OFF')+'</button></div><p class="dim">Menu returns you to your last checkpoint (the start of this round).</p>')}
function unpause(){hide();st='play'}
function drawClear(){const t=performance.now()/300;g.fillStyle='#5a2a1a';g.fillRect(SK.x-45,SK.y-30,90,60);g.fillStyle='#c33';g.beginPath();g.moveTo(SK.x-55,SK.y-30);g.lineTo(SK.x,SK.y-65);g.lineTo(SK.x+55,SK.y-30);g.fill();
 human(SK.x,SK.y+8,SHOPK,1.3,false);g.fillStyle='#fc4';g.font='bold 16px sans-serif';g.textAlign='center';g.fillText('SHOP',SK.x,SK.y-72);
 if(MODE!='end'){g.fillStyle='rgba(255,220,80,'+(.6+Math.sin(t)*.3)+')';g.beginPath();g.moveTo(W-44,H/2-30);g.lineTo(W-8,H/2);g.lineTo(W-44,H/2+30);g.fill();g.fillStyle='#fff';g.fillText('NEXT',W-30,H/2-40)}
 g.font='18px sans-serif';g.fillText(MODE=='end'?'Next round in '+Math.max(0,Math.ceil(ENT))+'s - visit the shop or press Skip':'Round cleared! Walk into the shop, or to the arrow on the right.',W/2,30)}
let itm;
function credits(){st='menu';hub=false;show('<div class="credits"><h2>Credits</h2><p>Producer<br><b>Lan</b></p><p>Honorable Mention<br><b>Ms. Charis</b></p><p>Together with<br><b>Claude.ai</b></p><h1>Thank you for playing!</h1></div><button class="skipb" onclick="clearTimeout(itm);settle()">Skip</button>');itm=setTimeout(settle,16000)}
function skipIntro(){clearTimeout(itm);title()}
function intro(){st='menu';hub=false;bg=makeBg();const sl=['<h1 class="logo">LAN</h1><p>presents</p>',
 '<h2>Meet the developer</h2><p style="max-width:560px;line-height:1.6;font-size:24px">Hi, I am <b>Lan</b>, the developer of this game. Thank you for playing the game, please enjoy.</p>',
 '<div class="logo">ARGON</div><div class="tag">A Tale of Aldoria <span class="ver">1.02</span></div>'];let i=0;
 const nx=()=>{if(i>=sl.length)return title();show('<div class="fade">'+sl[i++]+'</div><button onclick="skipIntro()">Skip</button>');itm=setTimeout(nx,7000)};nx()}
// ================= 0.8: SOUND, FULLSCREEN, MISSIONS, TITLES =================
let AC,tmsg='',tt=0;
const SFX={click:[600,.05,'square'],slash:[300,.08,'sawtooth',150],hit:[180,.08,'square',90],kill:[120,.15,'sawtooth',50],hurt:[110,.25,'sawtooth',60],dodge:[500,.1,'sine',900],ult:[200,.5,'sawtooth',800],pop:[900,.12,'triangle',300],item:[700,.15,'sine',1200],buy:[800,.12,'square',1000],pull:[400,.4,'triangle',900],win:[500,.6,'sine',1000],ach:[900,.3,'sine',1400],pause:[350,.1,'triangle'],
 item_heart:[[523,.2,'sine',0,0],[659,.2,'sine',0,.12],[784,.3,'sine',0,.24]],item_coin:[[1319,.08,'square',0,0],[1760,.18,'square',0,.07]],
 item_shield:[[330,.35,'triangle',700,0],[660,.3,'sine',990,.1]],item_power:[[110,.5,'sawtooth',900,0],[220,.4,'square',1200,.1]],
 shop_open:[[880,.1,'sine',0,0],[1175,.18,'sine',0,.09]],shop_buy:[[1000,.06,'square',0,0],[1500,.06,'square',0,.06],[2000,.15,'square',0,.12]],
 shop_deny:[[160,.22,'sawtooth',90,0]],shop_hire:[[392,.15,'triangle',0,0],[523,.15,'triangle',0,.12],[659,.28,'triangle',0,.24]],shop_leave:[[600,.14,'sine',300,0]]};
const ITM={heart:['Heart: +1 life','#f44'],coin:['Coin: +30 gold','#fd0'],shield:['Shield: blocks one hit','#6cf'],power:['Power Orb: 2x damage for 6s','#f80']};
function sfx(n){try{AC=AC||new AudioContext();const v0=SFX[n]||SFX.click;(Array.isArray(v0[0])?v0:[v0]).forEach(([f,d,w,t,dl])=>{const o=AC.createOscillator(),v=AC.createGain(),a=AC.currentTime+(dl||0);o.type=w||'sine';o.frequency.setValueAtTime(f,a);if(t)o.frequency.exponentialRampToValueAtTime(t,a+d);v.gain.setValueAtTime(.08,a);v.gain.exponentialRampToValueAtTime(.001,a+d);o.connect(v);v.connect(AC.destination);o.start(a);o.stop(a+d)})}catch(e){}}
document.addEventListener('click',e=>{if(e.target.tagName=='BUTTON')sfx('click')});
// fullscreen: scale the game to the window, go fullscreen on the first click
const wrap=document.getElementById('wrap');
function fit(){wrap.style.transform='scale('+Math.min(innerWidth/W,innerHeight/H)+')'}
addEventListener('resize',fit);fit();
addEventListener('click',()=>{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().then(()=>{if(navigator.keyboard&&navigator.keyboard.lock)navigator.keyboard.lock(['Escape'])}).catch(()=>{})},{once:true});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&st=='play')pause()});
// stats, missions, achievement titles
const sx=k=>(save.sx||{})[k]||0,S=(k,n=1)=>{save.sx=save.sx||{};save.sx[k]=(save.sx[k]||0)+n;chk()};
const ACH=[['Novice','Slay 50 enemies',()=>sx('kills')>=50,'+5% damage',()=>{P.dmg*=1.05}],['Boss Hunter','Defeat 3 bosses',()=>sx('bosses')>=3,'+6% attack speed',()=>{P.aspd*=1.06}],
 ['Quack Collector','Pull 5 Rubber Duckies',()=>sx('ducks')>=5,'+10% gold earned',()=>{P.gm=1.1}],['Dodge Master','Dodge 100 times',()=>sx('dodges')>=100,'+10% dodge regen',()=>{P.rgr*=1.1}],
 ['Captain','Hire 10 allies',()=>sx('hires')>=10,'+12 move speed',()=>{P.spd+=12}],['Slayer','Slay 500 enemies',()=>sx('kills')>=500,'+10% damage',()=>{P.dmg*=1.1}],
 ['Hero of Aldoria','Beat level 20',()=>!!save.beat,'+1 life, +5% damage',()=>{P.lives++;P.dmg*=1.05}],
 ['Guardian','Clear 30 rounds',()=>sx('levels')>=30,'+1 life',()=>{P.lives++}],['Duck Lord','Pull 10 Rubber Duckies',()=>sx('ducks')>=10,'+15% gold earned',()=>{P.gm=1.15}],
 ['Treasure Hunter','Collect 25 items',()=>sx('items')>=25,'+8% damage',()=>{P.dmg*=1.08}],['Dungeon Delver','Clear 5 dungeon floors',()=>sx('floors')>=5,'+10% attack speed',()=>{P.aspd*=1.1}],
 ['Dragon Slayer','Defeat a dragon',()=>sx('dragons')>=1,'+12% damage',()=>{P.dmg*=1.12}],['Endless Warrior','Reach level 25',()=>(save.best||0)>=25,'+10% knockback',()=>{P.kb*=1.1}],
 ['Legend','Slay 1500 enemies',()=>sx('kills')>=1500,'+15% damage',()=>{P.dmg*=1.15}]];
function chk(){save.ac=save.ac||{};ACH.forEach((a,i)=>{if(!save.ac[i]&&a[2]()){save.ac[i]=1;sfx('ach');tmsg='Achievement: '+a[0];tt=3.5;store()}})}
function titles(){show(`<h2>Titles</h2><p>Equip one for a permanent buff.</p><div class="row" style="max-width:900px">${ACH.map((a,i)=>{const u=(save.ac||{})[i];return `<div class="card ${save.ti===i?'eq':''}"><b>${u?a[0]:'???'}</b><br><span class="dim">${a[1]}</span><br>${u?a[3]:''}<br><br><button onclick="eqT(${i})" ${u?'':'disabled'}>${save.ti===i?'Unequip':'Equip'}</button></div>`}).join('')}</div><button onclick="menu()">Back</button>`)}
function eqT(i){save.ti=save.ti===i?-1:i;store();titles()}
function settle(){st='menu';show('<div class="logo small settle">ARGON <span class="ver">1.02</span></div>');itm=setTimeout(menu,4200)}
// ================= 0.9: MUSIC, SHOOTING, FINALE, CLASSES, DUNGEONS, MISSIONS =================
const TR={menu:[[220,262,330,262,196,247,294,247],.45,'sine'],play:[[110,0,131,0,147,0,131,165],.22,'square'],boss:[[82,82,98,82,110,98,82,73,65,65,82,65,98,110,123,98],.13,'sawtooth'],peace:[[262,330,392,330,294,349,440,349,262,330,392,523],.5,'triangle']};
let musI,musN='',musS=0;
function music(n){if(n==musN)return;musN=n;clearInterval(musI);if(!n)return;const[sq,sp,w]=TR[n];musS=0;musI=setInterval(()=>{try{AC=AC||new AudioContext();const f=sq[musS++%sq.length];if(!f)return;const o=AC.createOscillator(),v=AC.createGain(),a=AC.currentTime;o.type=w;o.frequency.value=f;v.gain.setValueAtTime(.04,a);v.gain.exponentialRampToValueAtTime(.001,a+sp*.9);o.connect(v);v.connect(AC.destination);o.start(a);o.stop(a+sp)}catch(e){}},sp*1000)}
document.addEventListener('click',()=>{if(AC&&AC.state=='suspended')AC.resume()});
// ---- shooting (fast player projectiles) ----
const shT=()=>MODE=='dun'?CLS[P.cls].sh:SKINS[save.eq].sh;
function fire(a,t){sfx('slash');const d=P.dmg*(P.buff>0?2:1),m=(aa,pr,dm,c)=>PB.push({x:P.x,y:P.y,vx:Math.cos(aa)*760,vy:Math.sin(aa)*760,r:5,d:dm,pr,l:1.1,h:[],c});
 if(t==1)m(a,1,d*.9,'#8ef');if(t==2)for(let i=-1;i<=1;i++)m(a+i*.2,0,d*.7,'#f84');if(t==3)m(a+(Math.random()-.5)*.1,0,d*.5,'#ff6');if(t==4)m(a,5,d*2.2,'#fff')}
// ---- final boss: black blood, peaceful world, credits (right) or Endless (up) ----
function makePeace(){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),gy=H*.68;let gr=x.createLinearGradient(0,0,0,gy);gr.addColorStop(0,'#7cc8ff');gr.addColorStop(1,'#eaf8ff');x.fillStyle=gr;x.fillRect(0,0,W,H);
 x.fillStyle='#ffe27a';x.beginPath();x.arc(760,110,50,0,6.28);x.fill();x.fillStyle='#fff';for(let i=0;i<5;i++){x.beginPath();x.arc(100+i*190,80+i%2*40,30,0,6.28);x.arc(130+i*190,85+i%2*40,24,0,6.28);x.fill()}
 x.fillStyle='#5cae5c';x.fillRect(0,gy,W,H-gy);x.fillStyle='#8be08b';x.beginPath();x.ellipse(300,gy,400,70,0,3.14,6.28);x.fill();for(let i=0;i<40;i++){x.fillStyle=['#f66','#fd4','#fff','#c6f'][i%4];x.fillRect((i*131)%W,gy+10+(i*47)%(H-gy-20),5,5)}return c}
function finale(){fin=true;finT=2.5;cleared=true;PR=[];shake=45;sfx('ult');save.beat=true;store();for(let i=0;i<140;i++){const a=Math.random()*6.28,s=60+Math.random()*360;FX.push({x:bx,y:by,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:2.5,c:'#000'})}bg=makePeace();music('peace');st='play';banner=0}
function drawFin(){const t=performance.now()/300;g.fillStyle='#234';g.font='bold 17px sans-serif';g.textAlign='center';g.fillText('The darkness is gone. Go RIGHT to finish the story, or UP to challenge Endless mode.',W/2,H-18);
 g.fillStyle='rgba(255,200,40,'+(.6+Math.sin(t)*.3)+')';g.beginPath();g.moveTo(W-44,H/2-30);g.lineTo(W-8,H/2);g.lineTo(W-44,H/2+30);g.fill();g.beginPath();g.moveTo(W/2-30,50);g.lineTo(W/2,12);g.lineTo(W/2+30,50);g.fill();g.fillStyle='#234';g.font='bold 14px sans-serif';g.fillText('CREDITS',W-34,H/2-40);g.fillText('ENDLESS',W/2,68)}
function startEndless(){MODE='end';fin=false;cleared=false;L++;startLevel(true)}
// ---- classes and dungeons ----
const CLS={swordsman:{n:'Swordsman',d:'Wide balanced slash. Ult: Shockwave.',sh:0,u:0},fighter:{n:'Fighter',d:'+1 life, very fast short punches, heavy knockback. Ult: Rage (invincible, 2x damage).',sh:0,u:2},
 marksman:{n:'Marksman',d:'Fast piercing arrows, quick feet, fragile. Ult: Lightning volley.',sh:1,u:9},mage:{n:'Mage',d:'Spread orbs, fast dodge regen, fragile. Ult: Meteor.',sh:2,u:8}};
const DN=[['goblin','brute',12,.7,'#5a3',0,false,1.4],['ork','charger',20,1.8,'#7a5',5,false,.8],['skeleton','archer',14,.9,'#ddd',1,true,1],['kobold','dasher',11,.6,'#d63',2,false,1],['demon','sprayer',16,1.2,'#c22',4,true,.9]];
function classes(){show(`<h2>Dungeons</h2><p>Choose a class. Clear rooms, read the map, and slay the dragon.</p><div class="row">${Object.entries(CLS).map(([k,c])=>`<div class="card"><b>${c.n}</b><br><span class="dim">${c.d}</span><br><br><button onclick="dcls='${k}';newRun('dun')">Enter</button></div>`).join('')}</div><button onclick="menu()">Back</button>`)}
function applyCls(){const c=dcls;P.cls=c;if(c=='swordsman')P.sw*=1.2;if(c=='fighter'){P.lives++;P.aspd*=1.6;P.rng*=.75;P.sw*=1.4;P.kb*=1.5;P.dmg*=.85}if(c=='marksman'){P.lives--;P.spd+=20;P.dmg*=1.15}if(c=='mage'){P.lives--;P.rgr*=1.3;P.dmg*=1.05}}
function dStart(){applyCls();DG={floor:1};genFloor();enterRoom()}
function genFloor(){const R={},k=(x,y)=>x+','+y,o=[];R[k(2,2)]={x:2,y:2,d:0,vis:0,clr:0};o.push(R[k(2,2)]);let tr=0;
 while(o.length<6+Math.min(4,DG.floor)&&tr++<300){const b=o[Math.random()*o.length|0],[dx,dy]=[[1,0],[-1,0],[0,1],[0,-1]][Math.random()*4|0],nx=b.x+dx,ny=b.y+dy;if(nx<0||ny<0||nx>4||ny>4||R[k(nx,ny)])continue;R[k(nx,ny)]={x:nx,y:ny,d:b.d+1,vis:0,clr:0};o.push(R[k(nx,ny)])}
 o.reduce((a,b)=>b.d>a.d?b:a).boss=1;DG.R=R;DG.k=k;DG.cx=2;DG.cy=2}
function enterRoom(dx=0,dy=0){const r=DG.R[DG.k(DG.cx,DG.cy)];r.vis=1;E=[];PR=[];PB=[];IT=r.it||[];A=null;fin=false;ulted=false;slow=1;P.buff=P.storm=P.slowT=0;L=DG.floor*4+r.d;bg=makeBg();banner=0;st='play';hide();music(r.boss?'boss':'play');
 P.x=dx>0?50:dx<0?W-50:W/2;P.y=dy>0?50:dy<0?H-50:H/2;P.inv=1.5;
 if(r.clr||(r.d==0&&!r.boss)){r.clr=1;cleared=true;return}cleared=false;const hp=C.enemyHp*(1+C.hpGrowth*(L-1));
 if(r.boss)E.push({boss:1,dn:'dragon',x:W/2,y:90,r:55,hp:hp*14,mh:hp*14,sp:(35+L*2)*.5,cd:2,tc:0,fl:0,pat:4,col:'#c22'});
 const n=r.boss?3:2+Math.floor(L/3);for(let i=0;i<n;i++){const d=DN[Math.random()*5|0];E.push({dn:d[0],t:d[1],ti:d[5],rng:d[6],r:d[2],hp:hp*d[3],mh:hp*d[3],col:d[4],x:Math.random()<.5?30:W-30,y:40+Math.random()*(H-80),sp:(42+L*3.5)*.5*d[7],cd:1+Math.random()*2,tc:0,fl:0})}}
function dClear(){const r=DG.R[DG.k(DG.cx,DG.cy)];r.clr=1;cleared=true;add(15+DG.floor*5);S('levels');sfx('win');
 if(r.boss){S('floors');S('dragons');pickScreen()}else if(Math.random()<.4)IT.push({x:W/2,y:H/2,t:['heart','coin','shield','power'][Math.random()*4|0],l:30})}
function nextFloor(){DG.floor++;genFloor();enterRoom()}
function doorMove(){let dx=0,dy=0;if(P.x>W-P.r-4)dx=1;else if(P.x<P.r+4)dx=-1;else if(P.y>H-P.r-4)dy=1;else if(P.y<P.r+4)dy=-1;if(!dx&&!dy)return false;
 if(!(dx?Math.abs(P.y-H/2)<50:Math.abs(P.x-W/2)<50)||!DG.R[DG.k(DG.cx+dx,DG.cy+dy)])return false;DG.R[DG.k(DG.cx,DG.cy)].it=IT;DG.cx+=dx;DG.cy+=dy;enterRoom(dx,dy);return true}
function drawMap(){const r0=DG.R[DG.k(DG.cx,DG.cy)],D=[[1,0],[-1,0],[0,1],[0,-1]];g.fillStyle=r0.clr||cleared?'#fc4':'#a33';
 for(const [a,b] of D)if(DG.R[DG.k(DG.cx+a,DG.cy+b)]){if(a)g.fillRect(a>0?W-8:0,H/2-45,8,90);else g.fillRect(W/2-45,b>0?H-8:0,90,8)}
 g.fillStyle='rgba(0,0,0,.5)';g.fillRect(W-106,64,92,92);
 for(const r of Object.values(DG.R)){const nb=D.some(([a,b])=>{const q=DG.R[DG.k(r.x+a,r.y+b)];return q&&q.vis});if(!r.vis&&!nb)continue;g.fillStyle=r.x==DG.cx&&r.y==DG.cy?'#fff':r.boss?'#f33':r.vis?(r.clr?'#6a6':'#aa6'):'#444';g.fillRect(W-100+r.x*17,70+r.y*17,14,14)}
 g.fillStyle='#fff';g.font='12px sans-serif';g.textAlign='right';g.fillText('Floor '+DG.floor+' MAP',W-14,56)}
// ---- rotating missions (6 active, replaced after claiming) ----
const MP=[['Slay 30 enemies','Easy',40,'kills',30],['Slay 100 enemies','Easy',90,'kills',100],['Slay 400 enemies','Medium',250,'kills',400],['Slay 1500 enemies','Hard',900,'kills',1500],
 ['Clear 3 rounds','Easy',50,'levels',3],['Clear 10 rounds','Medium',200,'levels',10],['Clear 30 rounds','Hard',700,'levels',30],['Defeat 1 boss','Medium',120,'bosses',1],['Defeat 5 bosses','Hard',600,'bosses',5],
 ['Dodge 50 times','Easy',60,'dodges',50],['Dodge 400 times','Hard',450,'dodges',400],['Hire 3 allies','Easy',60,'hires',3],['Hire 15 allies','Medium',220,'hires',15],
 ['Collect 10 items','Medium',150,'items',10],['Pull 10 Rubber Duckies','Medium',200,'ducks',10],['Clear 3 dungeon floors','Hard',500,'floors',3],['Win the campaign','Hell',1000,'wins',1]];
function mNew(j){const used=save.ma.filter((x,i)=>i!=j),o=MP.map((_,i)=>i).filter(i=>!used.includes(i)&&i!=save.ma[j]),i=o[Math.random()*o.length|0];save.ma[j]=i;save.mb[j]=sx(MP[i][3])}
function missions(msg=''){if(!save.ma||save.ma.length<6){save.ma=[];save.mb=[];for(let j=0;j<6;j++)mNew(j)}
 show(`<h2>Missions</h2><p>Points: <b>${pts()}</b> · a claimed mission is replaced by a new one</p><div class="row" style="max-width:900px">${save.ma.map((mi,j)=>{const m=MP[mi],p=Math.min(m[4],sx(m[3])-save.mb[j]);return `<div class="card"><b>${m[0]}</b><br><span class="dim">${m[1]} · ${m[2]} pts</span><br>${p>=m[4]?'<b style="color:#6f6">Complete! Claim it to get the next mission</b>':p+'/'+m[4]}<br><br><button onclick="claim(${j})" ${p>=m[4]?'':'disabled'}>Claim</button></div>`}).join('')}</div><p>${msg}</p><button onclick="menu()">Back</button>`)}
function claim(j){const m=MP[save.ma[j]];if(sx(m[3])-save.mb[j]<m[4])return;save.pts+=m[2];mNew(j);store();sfx('ach');missions('+'+m[2]+' points!')}
// ================= 1.0: ENDLESS TIMER, HELL, GRAPHICS, 3D PEEK =================
let hellBg;
function mkHell(){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),gy=H*.62;let gr=x.createLinearGradient(0,0,0,gy);gr.addColorStop(0,'#1a0000');gr.addColorStop(1,'#c2200a');x.fillStyle=gr;x.fillRect(0,0,W,H);
 x.fillStyle='#ff5a1a';x.beginPath();x.arc(480,gy-20,90,0,6.28);x.fill();x.fillStyle='#120000';for(let i=0;i<9;i++){const a=i*125-30,h=90+(i*53)%110;x.beginPath();x.moveTo(a,gy);x.lineTo(a+60,gy-h);x.lineTo(a+130,gy);x.fill()}
 gr=x.createLinearGradient(0,gy,0,H);gr.addColorStop(0,'#ff4a00');gr.addColorStop(.25,'#5a0e00');gr.addColorStop(1,'#1c0500');x.fillStyle=gr;x.fillRect(0,gy,W,H-gy);
 x.strokeStyle='#ff9a2a';x.lineWidth=2;for(let i=0;i<14;i++){const a=(i*97)%W,b=gy+(i*41)%(H-gy);x.beginPath();x.moveTo(a,b);x.lineTo(a+60,b+14);x.stroke()}
 x.fillStyle='rgba(255,160,40,.8)';for(let i=0;i<70;i++)x.fillRect((i*131)%W,(i*71)%H,2,2);return c}
const bar=document.createElement('div');bar.id='bar';bar.style.display='none';bar.innerHTML='<button onclick="nextRound()">Skip &#9654;</button><button onclick="leaveEndless()">Menu</button>';wrap.appendChild(bar);
function nextRound(){if(MODE!='end'||!cleared||st!='play')return;L++;startLevel()}
function leaveEndless(){cashOut();menu()}
// ---- graphics options ----
let gfx=localStorage.argfx||'enhanced';
function applyG(){D3=gfx=='3d';cv.style.imageRendering=gfx=='retro'?'pixelated':'auto';cv.style.filter=gfx=='retro'?'contrast(1.2) saturate(1.5)':''}
function gfxT(){gfx={classic:'enhanced',enhanced:'retro',retro:'3d','3d':'classic'}[gfx];localStorage.argfx=gfx;applyG();hub?menu():title()}
function post(){if(gfx=='enhanced'){const v=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.85);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=v;g.fillRect(0,0,W,H)}
 if(gfx=='retro'){g.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<H;y+=3)g.fillRect(0,y,W,1)}}
// ================= 1.01: THIRD-PERSON 3D RENDERER (Graphics option "3d") =================
const cam={x:W/2,y:H/2},CZ=200,PIT=.35,FOV=520,CD=330;
const P3=(x,y,z)=>{const dx=x-cam.x,dy=y-cam.y-CD,dz=z-CZ,c=Math.cos(PIT),s=Math.sin(PIT),d=-dy*c-dz*s;if(d<25)return null;const k=FOV/d;return[W/2+dx*k,H*.52-(-dy*s+dz*c)*k,k,d]};
function unp(mx,my){const c=Math.cos(PIT),s=Math.sin(PIT),a=(mx-W/2)/FOV,b=-(my-H*.52)/FOV,dy=-b*s-c,dz=b*c-s;if(dz>-.02)return;const t=-CZ/dz;mouse.x=cam.x+a*t;mouse.y=cam.y+CD+dy*t}
function sh(c,f){c=c.length==4?'#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3]:c;const n=parseInt(c.slice(1),16),r=n>>16,q=n>>8&255,b=n&255,m=f<0?0:255,t=Math.abs(f);return`rgb(${r+(m-r)*t|0},${q+(m-q)*t|0},${b+(m-b)*t|0})`}
const h2x=(h,s,l)=>{s/=100;l/=100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return'#'+[f(0),f(8),f(4)].map(v=>v.toString(16).padStart(2,'0')).join('')};
function sphere(p,r,c,glow){const R=r*p[2],gr=g.createRadialGradient(p[0]-R*.35,p[1]-R*.4,R*.1,p[0],p[1],R);gr.addColorStop(0,sh(c,.55));gr.addColorStop(.55,c);gr.addColorStop(1,sh(c,-.55));g.fillStyle=gr;if(glow){g.shadowColor=c;g.shadowBlur=12}g.beginPath();g.arc(p[0],p[1],R,0,6.28);g.fill();g.shadowBlur=0}
function cap(A,B,r,c){const w=r*(A[2]+B[2]);g.lineCap='round';g.strokeStyle=sh(c,-.5);g.lineWidth=w+2;g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.stroke();g.strokeStyle=c;g.lineWidth=w;g.stroke();g.strokeStyle=sh(c,.45);g.lineWidth=w*.35;g.beginPath();g.moveTo(A[0]-w*.18,A[1]-w*.18);g.lineTo(B[0]-w*.18,B[1]-w*.18);g.stroke()}
const shadow=(p,r)=>{g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(p[0],p[1],r*p[2],r*p[2]*.35,0,0,6.28);g.fill()};
const poly=(q,c)=>{if(!q.every(Boolean))return;g.fillStyle=c;g.beginPath();q.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.fill()};
function human3(x,y,k,s,f,ph,o){o=o||{};const cf=Math.cos(f),sf=Math.sin(f),J=(lx,lf,z)=>P3(x-sf*lx*s+cf*lf*s,y+cf*lx*s+sf*lf*s,z*s),pt=[],sw=Math.sin(ph)*9,bo=Math.abs(Math.sin(ph))*1.4,b0=P3(x,y,0);if(!b0)return;shadow(b0,13*s);
 const C=(a,b,r,c)=>{const A=J(...a),B=J(...b);if(A&&B)pt.push([(A[3]+B[3])/2,()=>cap(A,B,r*s,c)])},S=(a,r,c,gl)=>{const A=J(...a);if(A)pt.push([A[3],()=>sphere(A,r*s,c,gl)])};
 if(k.f.includes('cape')){const q=[J(-8,-2,42),J(8,-2,42),J(11,-9,6),J(-11,-9,6)];if(q.every(Boolean))pt.push([q[0][3]+4,()=>poly(q,k.a)])}
 if(k.f.includes('wings'))for(const d of[-1,1]){const q=[J(d*5,-3,42),J(d*30,-8,66),J(d*26,-8,22)];if(q.every(Boolean))pt.push([q[0][3]+3,()=>poly(q,'rgba(255,255,255,.85)')])}
 C([-4,sw,22],[-4,sw*.5,3],4,k.l);C([4,-sw,22],[4,-sw*.5,3],4,k.l);C([0,0,24+bo],[0,0,42+bo],7.5,k.o);C([-10,0,41+bo],[-10,-sw*.5,26+bo],3,k.o);C([10,0,41+bo],[11,7,33+bo],3,k.o);C([-7.5,0,28+bo],[7.5,0,28+bo],2,k.a);
 S([0,0,56+bo],8,'#f1c7a0');S([0,-2,58+bo],8.6,k.h);S([-3,6,57+bo],1.1,'#111');S([3,6,57+bo],1.1,'#111');
 if(k.f.includes('hood'))S([0,-1.5,57+bo],10,k.o);
 if(k.f.includes('helm')){S([0,-.5,59+bo],9.2,'#bcd');C([0,0,66+bo],[0,-3,76+bo],1.8,k.a)}
 if(k.f.includes('band'))C([-8,2,58+bo],[8,2,58+bo],1.3,k.a);
 if(k.f.includes('mask'))C([-6,6,53+bo],[6,6,53+bo],2.5,k.a);
 if(k.f.includes('crown'))for(let i=-1;i<=1;i++)C([i*4,0,65+bo],[i*4,0,72+bo],1.3,'#fd0');
 if(k.f.includes('horns'))for(const d of[-1,1])C([d*5,0,62+bo],[d*9,0,74+bo],1.6,'#eee');
 const a=o.sw!=null?o.sw:.5;C([11,7,33+bo],o.gun?[11,22,34+bo]:[11+Math.sin(a)*30,7+Math.cos(a)*30,36],o.gun?2:1.3,o.gun?'#444':(k.s||'#ccd'));
 pt.sort((p,q)=>q[0]-p[0]);pt.forEach(p=>p[1]())}
function monster3(e){const ci=Math.min(3,(L-1)/5|0),c=e.fl>0?'#ffffff':e.col||(e.boss?BC[ci]:h2x((HUE[ci]+(e.ti||0)*35)%360,60,45)),f=ang(e,P),r=e.r,t=performance.now()/260,cf=Math.cos(f),sf=Math.sin(f),b0=P3(e.x,e.y,0);if(!b0)return;shadow(b0,r*1.1);
 const J=(lx,lf,z)=>P3(e.x-sf*lx+cf*lf,e.y+cf*lx+sf*lf,z),pt=[],S=(a,rr,col,gl)=>{const A=J(...a);if(A)pt.push([A[3],()=>sphere(A,rr,col,gl)])},C=(a,b,rr,col)=>{const A=J(...a),B=J(...b);if(A&&B)pt.push([(A[3]+B[3])/2,()=>cap(A,B,rr,col)])},w=Math.sin(t+e.x)*r*.5;
 if(e.rng&&!e.dn){const z=r*1.9+Math.sin(t)*3;for(let i=-2;i<=2;i++)C([i*r*.3,0,z-r*.6],[i*r*.4+Math.sin(t+i)*r*.3,0,z-r*1.8],1.6,c);S([0,0,z],r*1.15,'#f4f4f4');S([0,r*.9,z],r*.55,e.fl>0?c:'#cc2222',true);S([0,r*1.35,z],r*.25,'#111111')}
 else if(e.boss){C([-r*.5,0,r*.9],[-r*.5,w,0],r*.4,c);C([r*.5,0,r*.9],[r*.5,-w,0],r*.4,c);
  if(e.dn=='dragon')for(const d of[-1,1]){const q=[J(d*r*.6,-r*.2,r*1.8),J(d*r*2.6,-r*.5,r*2.8),J(d*r*2.2,-r*.9,r*.8)];if(q.every(Boolean))pt.push([q[0][3]+2,()=>poly(q,sh(c,-.25))])}
  S([0,0,r*1.2],r*1.15,c);S([0,r*.9,r*1.9],r*.7,c);for(const d of[-1,1])C([d*r*.4,r*.8,r*2.4],[d*r*.9,r*.7,r*3.3],r*.14,'#eeeeee');
  for(let i=0;i<2+ci;i++)S([(i-(1+ci)/2)*r*.28,r*1.45,r*2.05],r*.1,'#ffee00',true);C([-r*.4,r*1.5,r*1.5],[r*.4,r*1.5,r*1.5],r*.1,'#ffffff')}
 else{C([-r*.4,0,r*.7],[-r*.4,w,0],r*.28,c);C([r*.4,0,r*.7],[r*.4,-w,0],r*.28,c);C([-r*.9,0,r*1.2],[-r*1.1,r*.7,r*.8],r*.2,c);C([r*.9,0,r*1.2],[r*1.1,r*.7,r*.8],r*.2,c);
  S([0,0,r*1.1],r,c);S([0,r*.85,r*1.7],r*.6,c);for(const d of[-1,1])C([d*r*.35,r*.8,r*2.1],[d*r*.7,r*.7,r*3],r*.14,'#dddddd');
  S([-r*.25,r*1.35,r*1.8],r*.1,'#ffee00',true);S([r*.25,r*1.35,r*1.8],r*.1,'#ffee00',true);if(e.t=='dasher')for(let i=-2;i<=2;i++)C([0,-r*.3+i*r*.2,r*1.9],[0,-r*.5+i*r*.2,r*2.5],r*.1,'#dddddd')}
 pt.sort((p,q)=>q[0]-p[0]);pt.forEach(p=>p[1]());
 const h=P3(e.x,e.y,r*(e.boss?4:3.2));if(h){if(!e.boss){g.fillStyle='#400';g.fillRect(h[0]-15*h[2],h[1],30*h[2],4);g.fillStyle='#4f4';g.fillRect(h[0]-15*h[2],h[1],30*h[2]*Math.max(0,e.hp)/e.mh,4)}if(e.wu>0){g.fillStyle='#f33';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText('!',h[0],h[1]-6)}}}
function garr(x,y,dx,dy,txt,c){const t=performance.now()/300;poly([P3(x+dx*24,y+dy*24,2),P3(x-dx*12+dy*26,y-dy*12-dx*26,2),P3(x-dx*12-dy*26,y-dy*12+dx*26,2)],c||`rgba(255,210,60,${.6+Math.sin(t)*.3})`);const p=P3(x,y,45);if(p){g.fillStyle='#fff';g.font='bold 13px sans-serif';g.textAlign='center';g.fillText(txt,p[0],p[1])}}
function draw3D(){g.save();const ci=Math.min(3,(L-1)/5|0),T=fin?['#7cc8ff','#eaf8ff','#5cae5c']:MODE=='end'?['#1a0000','#c2200a','#3a0a00']:BG[ci];
 cam.x+=(P.x-cam.x)*.12;cam.y+=(P.y-cam.y)*.12;const yh=H*.52-FOV*Math.tan(PIT),ym=Math.min(H,cam.y+CD+25),k=SKINS[save.eq];
 if(shake>.5)g.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 let gr=g.createLinearGradient(0,0,0,Math.max(40,yh+10));gr.addColorStop(0,T[1]);gr.addColorStop(1,T[0]);g.fillStyle=gr;g.fillRect(-20,-20,W+40,H+40);
 g.fillStyle=sh(T[1],-.6);for(let i=0;i<9;i++){const a=i*130-60-(cam.x-W/2)*.05,h=50+(i*47)%60;g.beginPath();g.moveTo(a,yh+4);g.lineTo(a+70,yh-h);g.lineTo(a+140,yh+4);g.fill()}
 g.fillStyle=sh(T[2],-.5);g.fillRect(-20,Math.max(0,yh),W+40,H);
 gr=g.createLinearGradient(0,Math.max(0,yh),0,H);gr.addColorStop(0,sh(T[2],-.15));gr.addColorStop(1,sh(T[2],.3));poly([P3(0,0,0),P3(W,0,0),P3(W,ym,0),P3(0,ym,0)],gr);
 g.strokeStyle='rgba(255,255,255,.1)';g.lineWidth=1;for(let x=0;x<=W;x+=80){const a=P3(x,0,0),b=P3(x,ym,0);if(a&&b){g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}}
 for(let y=0;y<=ym;y+=80){const a=P3(0,y,0),b=P3(W,y,0);if(a&&b){g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}}
 poly([P3(0,0,0),P3(W,0,0),P3(W,0,95),P3(0,0,95)],sh(T[2],-.35));for(const x of[0,W])poly([P3(x,0,0),P3(x,ym,0),P3(x,ym,95),P3(x,0,95)],sh(T[2],-.45));
 g.globalCompositeOperation='lighter';const lp=P3(P.x,P.y,0);if(lp){gr=g.createRadialGradient(lp[0],lp[1],5,lp[0],lp[1],170*lp[2]);gr.addColorStop(0,'rgba(255,230,180,.25)');gr.addColorStop(1,'rgba(255,230,180,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)}g.globalCompositeOperation='source-over';
 if(fin){garr(W-34,H/2,1,0,'CREDITS');garr(W/2,34,0,-1,'ENDLESS')}else if(cleared&&MODE=='dun'){const D=[[1,0,W-34,H/2],[-1,0,34,H/2],[0,-1,W/2,34],[0,1,W/2,H-34]];for(const[a,b,x,y]of D)if(DG.R[DG.k(DG.cx+a,DG.cy+b)])garr(x,y,a,b,'DOOR')}else if(cleared&&MODE=='camp')garr(W-34,H/2,1,0,'NEXT');
 const Q=[],add=(x,y,fn)=>{const p=P3(x,y,0);if(p)Q.push([p[3],fn])},orb=(x,y,z,c,r)=>{const p=P3(x,y,z),s0=P3(x,y,0);if(!p)return;if(s0)shadow(s0,r*.8);g.shadowColor=c;g.shadowBlur=14;g.fillStyle=c;g.beginPath();g.arc(p[0],p[1],r*p[2],0,6.28);g.fill();g.shadowBlur=0};
 for(const[x,y]of[[60,8],[270,8],[480,8],[690,8],[900,8],[8,170],[8,350],[W-8,170],[W-8,350]])add(x,y,()=>{const A=P3(x,y,0),B=P3(x,y,100);if(!A||!B)return;cap(A,B,13,sh(T[2],.15));const f=P3(x,y,112);if(f){g.globalCompositeOperation='lighter';gr=g.createRadialGradient(f[0],f[1],2,f[0],f[1],46*f[2]);gr.addColorStop(0,'rgba(255,170,60,.7)');gr.addColorStop(1,'rgba(255,100,0,0)');g.fillStyle=gr;g.fillRect(f[0]-60,f[1]-60,120,120);g.globalCompositeOperation='source-over'}});
 for(const e of E)add(e.x,e.y,()=>monster3(e));
 const mv=keys.w||keys.a||keys.s||keys.d||P.dash>0;
 for(const a of P.al)add(a.x,a.y,()=>{human3(a.x,a.y,a.k=='k'?KN:MC2,a.k=='k'?1:.8,ang(a,E[0]||P),performance.now()/110+a.x,{sw:.5});const h=P3(a.x,a.y,78);if(h){g.fillStyle='#400';g.fillRect(h[0]-14,h[1],28,4);g.fillStyle='#4f4';g.fillRect(h[0]-14,h[1],28*Math.max(0,a.hp)/a.mh,4)}});
 for(const i of IT)add(i.x,i.y,()=>orb(i.x,i.y,10+Math.sin(performance.now()/200)*3,{heart:'#ff4444',coin:'#ffdd00',shield:'#66ccff',power:'#ff8800'}[i.t],9));
 for(const p of PR)add(p.x,p.y,()=>orb(p.x,p.y,16,p.mine?'#44eeff':'#ffee66',p.r));
 for(const b of PB)add(b.x,b.y,()=>{const A=P3(b.x,b.y,16),B=P3(b.x-b.vx*.04,b.y-b.vy*.04,16);if(A&&B){g.strokeStyle=b.c;g.lineWidth=3*A[2];g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.stroke()}orb(b.x,b.y,16,b.c.length==4?'#'+b.c[1]+b.c[1]+b.c[2]+b.c[2]+b.c[3]+b.c[3]:b.c,b.r)});
 for(const f of FX)add(f.x,f.y,()=>{g.globalAlpha=Math.max(0,Math.min(1,f.l*2));if(f.ring){g.strokeStyle=f.c;g.lineWidth=4;g.beginPath();for(let i=0;i<=32;i++){const q=P3(f.x+Math.cos(i/32*6.283)*(.6-f.l)*1000,f.y+Math.sin(i/32*6.283)*(.6-f.l)*1000,3);if(q)i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}g.stroke()}else if(f.angel){const q=P3(f.x,f.y,60);if(q){g.save();g.translate(q[0],q[1]);g.scale(q[2],q[2]);angel({x:0,y:60,l:f.l,txt:f.txt});g.restore()}}else{const q=P3(f.x,f.y,f.l*50);if(q){g.fillStyle=f.c;g.beginPath();g.arc(q[0],q[1],3*q[2],0,6.28);g.fill()}}g.globalAlpha=1});
 if(A)add(A.x,A.y,()=>{const q=P3(A.x,A.y,60);if(q){g.save();g.translate(q[0],q[1]);g.scale(q[2]*.9,q[2]*.9);angel({x:0,y:60,l:1,txt:Math.ceil(A.t)+'s'});g.restore()}});
 if(cleared&&!fin&&MODE!='dun'&&SK)add(SK.x,SK.y,()=>{const c=[[-40,-30],[40,-30],[40,30],[-40,30]].map(([a,b])=>P3(SK.x+a,SK.y+b,0)),ap=P3(SK.x,SK.y,75);if(ap&&c.every(Boolean)){for(let i=0;i<4;i++)poly([c[i],c[(i+1)%4],ap],i%2?'#b02828':'#d03a3a')}human3(SK.x,SK.y+36,SHOPK,1,ang(SK,P),0,{})});
 add(P.x,P.y,()=>{const al=P.dash>0?.4:(P.inv>0&&Math.floor(P.inv*15)%2?.45:1);g.globalAlpha=al;
  human3(P.x,P.y,k,.9,ang(P,mouse),mv?performance.now()/95:0,{sw:slash?(1-slash.t/.15)*2.6-1.3:.5,gun:shT()>0});g.globalAlpha=1;
  if(slash){g.strokeStyle=k.s||'#fff';g.globalAlpha=Math.max(0,slash.t/.15);g.beginPath();const sw=Math.min(3.1,P.sw);for(let i=0;i<=16;i++){const a=slash.a-sw+i/16*2*sw,q=P3(P.x+Math.cos(a)*P.rng,P.y+Math.sin(a)*P.rng,14);if(q){g.lineWidth=8*q[2];i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}}g.stroke();g.globalAlpha=1}
  const c0=P3(P.x,P.y,30);if(c0&&P.sh>0){gr=g.createRadialGradient(c0[0]-8,c0[1]-10,4,c0[0],c0[1],34*c0[2]);gr.addColorStop(0,'rgba(160,210,255,.1)');gr.addColorStop(1,'rgba(80,160,255,.35)');g.fillStyle=gr;g.strokeStyle='rgba(140,210,255,.9)';g.lineWidth=2;g.beginPath();g.arc(c0[0],c0[1],34*c0[2],0,6.28);g.fill();g.stroke()}
  const tp=P3(P.x,P.y,92);if(tp&&save.ti>=0&&ACH[save.ti]){g.fillStyle='#fc4';g.font='bold 12px sans-serif';g.textAlign='center';g.fillText('['+ACH[save.ti][0]+']',tp[0],tp[1])}});
 Q.sort((a,b)=>b[0]-a[0]);Q.forEach(o=>o[1]());hud();
 if(banner>0){g.fillStyle='#fc4';g.font='bold 34px sans-serif';g.textAlign='center';g.fillText(MODE=='camp'?(L%5==0?CH[ci].boss+' - ':'')+'LEVEL '+L+' - '+diff(L):MODE=='end'?'ENDLESS WAVE '+L:'DUNGEON',W/2,H/2-120)}
 const msg=fin?'The darkness is gone. Go RIGHT to finish the story, or UP to challenge Endless mode.':cleared&&MODE=='camp'?'Round cleared! Walk into the shop, or to the arrow on the right.':cleared&&MODE=='end'?'Next round in '+Math.max(0,Math.ceil(ENT))+'s - visit the shop or press Skip':'';
 if(msg){g.fillStyle='#fff';g.font='bold 17px sans-serif';g.textAlign='center';g.shadowColor='#000';g.shadowBlur=6;g.fillText(msg,W/2,34);g.shadowBlur=0}
 if(tt>0){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(W/2-170,H-70,340,40);g.fillStyle='#fc4';g.font='bold 16px sans-serif';g.textAlign='center';g.fillText(tmsg,W/2,H-44)}
 post();g.restore()}
// ================= 1.02: MOBILE CONTROLS + SETTINGS =================
let MOB=localStorage.argmob==null?('ontouchstart' in window||(navigator.maxTouchPoints>0)):localStorage.argmob=='1';
const mc=document.createElement('div');mc.id='mc';
mc.innerHTML='<div id="joy"><div id="knob"></div></div><div id="mb"><button id="bA">ATK</button><button id="bD">DODGE</button><button id="bU">ULT</button></div><button id="bP">II</button>';wrap.appendChild(mc);
const joy=document.getElementById('joy'),knob=document.getElementById('knob');
const jm=e=>{const r=joy.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),m=Math.max(1,Math.hypot(dx,dy)),k=Math.min(1,m/(r.width/2)),t=r.width*.12;
 knob.style.transform=`translate(${dx/m*k*r.width*.3}px,${dy/m*k*r.width*.3}px)`;keys.a=dx<-t;keys.d=dx>t;keys.w=dy<-t;keys.s=dy>t};
const jend=()=>{joy.on=0;keys.a=keys.d=keys.w=keys.s=false;knob.style.transform=''};
joy.onpointerdown=e=>{e.preventDefault();joy.setPointerCapture&&joy.setPointerCapture(e.pointerId);joy.on=1;jm(e)};joy.onpointermove=e=>{if(joy.on)jm(e)};joy.onpointerup=joy.onpointercancel=jend;
const hold=(id,dn,up)=>{const b=document.getElementById(id);b.onpointerdown=e=>{e.preventDefault();dn()};if(up)b.onpointerup=b.onpointerleave=b.onpointercancel=up};
hold('bA',()=>{atk=true},()=>{atk=false});hold('bD',dodge);hold('bU',ultimate);hold('bP',()=>{if(st=='play')pause();else if(st=='pause')unpause()});
function aimAuto(){let t=null,bd=1e9;for(const e of E){const d=dist(P,e);if(d<bd){bd=d;t=e}}if(t){mouse.x=t.x;mouse.y=t.y}else{const dx=(keys.d?1:0)-(keys.a?1:0),dy=(keys.s?1:0)-(keys.w?1:0);if(dx||dy){mouse.x=P.x+dx*100;mouse.y=P.y+dy*100}}}
function mobT(){MOB=!MOB;localStorage.argmob=MOB?'1':'0';atk=false;jend();settings()}
function mobP(){MOB=!MOB;localStorage.argmob=MOB?'1':'0';atk=false;jend();pause()}
function gfxS(){gfx={classic:'enhanced',enhanced:'retro',retro:'3d','3d':'classic'}[gfx];localStorage.argfx=gfx;applyG();settings()}
function settings(){show(`<h2>Settings</h2><div class="stack" style="grid-template-columns:1fr"><button onclick="mobT()">Mobile controls: ${MOB?'ON':'OFF'}</button><button onclick="gfxS()">Graphics: ${gfx}</button></div><p class="dim">Mobile controls add an on-screen stick and buttons (attacks auto-aim at the nearest enemy). Turn them OFF for a clear screen on a computer.</p><button onclick="hub?menu():title()">Back</button>`)}
applyG();bg=makeBg();intro();music('menu');requestAnimationFrame(loop);
