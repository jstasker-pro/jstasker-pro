/* JS TASKER PRO - shared helpers */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r4=n=>Math.round((+n||0)*1e4)/1e4;
const usd=n=>'$'+(Math.round((+n||0)*100)/100).toFixed(2);
const usd4=n=>'$'+r4(n).toString();
const now=()=>Date.now();
const DAY=864e5;
const ago=t=>{const m=Math.max(0,(now()-t)/6e4|0);return m<1?'just now':m<60?m+'m ago':m<1440?(m/60|0)+'h ago':(m/1440|0)+'d ago'};
const P={
 home:'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z',plus:'M12 5v14M5 12h14',wallet:'M3 7h16a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l12-3v3M17 13h2',
 down:'M12 4v12m0 0l-5-5m5 5l5-5M5 20h14',up:'M12 20V8m0 0l-5 5m5-5l5 5M5 4h14',user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',users:'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M17 11a3 3 0 100-6M21 20a6 6 0 00-4-5.6',
 bell:'M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 004 0',menu:'M4 6h16M4 12h16M4 18h16',x:'M6 6l12 12M18 6L6 18',back:'M15 5l-7 7 7 7',
 list:'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',clock:'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',trophy:'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3',
 chat:'M21 12a8 8 0 01-11.7 7L4 20l1.2-4.3A8 8 0 1121 12z',info:'M12 8h.01M11 12h1v5h1M12 21a9 9 0 100-18 9 9 0 000 18z',out:'M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 16l-4-4 4-4M6 12h10',
 star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',check:'M5 13l4 4L19 7',shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',copy:'M9 9h10v10H9zM5 15V5h10',
 gift:'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2 0-4-1-4-3s3-2 4 3c1-5 4-5 4-3s-2 3-4 3',cog:'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-2-4-2 1-2-1-1-2h-4l-1 2-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4-2-1z',
 ticket:'M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z',search:'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',pin:'M12 17v5M8 3h8l-1 7 3 3H6l3-3z',
 tag:'M3 12V4h8l10 10-8 8zM7.5 7.5h.01',trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',send:'M22 2L11 13M22 2l-7 20-4-9-9-4z',bolt:'M13 2L4 14h7l-1 8 9-12h-7z',cash:'M3 6h18v12H3zM12 15a3 3 0 100-6 3 3 0 000 6z',img:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4',download:'M12 3v12M7 10l5 5 5-5M5 21h14',lock:'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',moon:'M20 14A8 8 0 0110 4a8 8 0 1010 10z'};
const ic=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n]||P.info}"/></svg>`;

const CATC=['#ef4444','#0ea5e9','#111827','#2563eb','#d946ef','#16a34a','#f59e0b','#8b5cf6','#14b8a6'];
const catColor=(c,list)=>CATC[Math.max(0,(list||[]).indexOf(c))%CATC.length];
const DEFAULTS={
 appName:'JS TASKER PRO',welcome:'Complete simple tasks, grow your channels and earn real money.',
 ticker:'Welcome to JS TASKER PRO  •  Post tasks, complete tasks, get paid  •  Deposits and withdrawals are reviewed manually',
 about:'JS TASKER PRO is a micro-task marketplace. Buyers promote their channels and pages. Workers complete simple tasks and get paid.',
 terms:'Fake or edited proofs lead to a permanent ban. Withdrawals are processed manually.',
 maint:false,chatOn:false,botLink:'https://t.me/YourSupportBot',
 verifyOn:true,verifyFee:1,verifyFrom:'dep',kycWd:false,
 depRate:130,wdRate:123,minDep:1,minWd:1,wdPerDay:3,
 depFeePct:1,taskFeePct:5,workerFeePct:2,wdFeePct:10,
 refOn:true,refPct:10,refBonusOn:true,refNeed:10,refBonus:0.05,refCap:'Join JS TASKER PRO and earn money by completing tasks! {link}',
 boost:0.5,topJob:0.5,minP1:0.01,minP2:0.02,minP3:0.03,
 cats:['YouTube','Telegram','TikTok','Facebook','Instagram'],
 methods:[{id:'bkash',name:'Bkash',col:'#fbcfe8',num:'01XXXXXXXXX',bonus:0,on:true},{id:'nagad',name:'Nagad',col:'#fed7aa',num:'01XXXXXXXXX',bonus:0,on:true},{id:'rocket',name:'Rocket',col:'#e9d5ff',num:'01XXXXXXXXX',bonus:0,on:true},{id:'binance',name:'Binance',col:'#fef08a',num:'Binance Pay ID 000000',bonus:0,on:true},{id:'usdt',name:'USDT',col:'#bbf7d0',num:'USDT (TRC20) wallet address',bonus:0,on:true}],
 workerOpts:[100,200,500,1000,2000],dayOpts:[3,5,10],
 socTg:'',socFb:'',socX:'',socYt:'',stJobs:0,stMembers:0,stDone:0,stPaid:0,activity:'',
 pgPrivacy:'We collect only the information needed to run your account (username, activity and payment requests). We do not sell your data. Contact support to request removal of your account.',
 pgFaq:'How do I earn? Complete tasks and upload the required proof.\nHow do I get paid? Withdraw your earned balance from the Withdraw page. Requests are reviewed manually.\nHow do I post tasks? Add funds to your deposit balance, then use Create Task.',
 pgRefund:'Deposits are used to fund tasks. Money held for a task that is closed or removed is returned to your deposit balance. Contact support for any other refund request.',
 pgContact:'Need help? Open a ticket from the Tickets page after logging in, or message us on Telegram.'
};
const withDefaults=s=>Object.assign({},DEFAULTS,s||{});
const minPrice=(set,shots)=>set['minP'+shots]||0.01;
const taskCost=(set,price,workers,days,boost,top)=>r4(price*workers*(1+set.taskFeePct/100)+(boost?set.boost:0)+(top?set.topJob*days:0));
const level=done=>1+Math.floor((done||0)/10);
const USER_RE=/^[a-z0-9_]{3,20}$/;
const jsFmt=n=>String(n).padStart(4,'0');
function toast(t,k){let b=$('#toasts');if(!b){b=document.createElement('div');b.id='toasts';document.body.appendChild(b)}const e=document.createElement('div');e.className='toast '+(k||'');e.textContent=t;b.appendChild(e);setTimeout(()=>e.classList.add('out'),2600);setTimeout(()=>e.remove(),3000)}
function modal(html,onok,okText){const m=document.createElement('div');m.className='modal';m.innerHTML='<div class="mbox">'+html+'<div class="mbtn"><button class="btn" data-m="x">Cancel</button><button class="btn pri" data-m="ok">'+(okText||'OK')+'</button></div></div>';document.body.appendChild(m);m.onclick=async e=>{const a=e.target.dataset.m;if(a==='x'||e.target===m)m.remove();if(a==='ok'){const r=await onok(m);if(r!==false)m.remove()}}}
function showImg(src){const m=document.createElement('div');m.className='modal';m.innerHTML='<img src="'+src+'" style="max-width:100%;max-height:85vh;border-radius:12px">';m.onclick=()=>m.remove();document.body.appendChild(m)}
function compressImage(file,cb,max){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');const k=Math.min(1,(max||720)/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);let q=.6,d=c.toDataURL('image/jpeg',q);while(d.length>260000&&q>.25){q-=.1;d=c.toDataURL('image/jpeg',q)}cb(d)};im.onerror=()=>toast('Could not read image','err');im.src=r.result};r.readAsDataURL(file)}
function pickImage(cb){const fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.onchange=()=>{const f=fi.files[0];if(f)compressImage(f,cb)};fi.click()}
const copyText=t=>{try{navigator.clipboard.writeText(t)}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(x){}a.remove()}toast('Copied','ok')};
