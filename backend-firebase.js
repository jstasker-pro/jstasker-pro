/* JS TASKER PRO - Firebase backend (Auth + Firestore). Users sign in with username + password
   (stored as hidden email username@users.jstasker.app). The admin signs in with a real email. */
(function(){
const cfg=window.FIREBASE_CONFIG||{};
const configured=!!cfg.apiKey&&String(cfg.apiKey).indexOf('PASTE')!==0&&!!cfg.projectId&&String(cfg.projectId).indexOf('PASTE')!==0&&typeof firebase!=='undefined';
const B={mode:'firebase',configured};window.Backend=B;
B.ready=Promise.resolve();
if(!configured){B.watch=()=>()=>{};B.onAuth=cb=>{setTimeout(()=>cb(null),0);return()=>{}};B.adm={onAuth:cb=>{setTimeout(()=>cb(null),0);return()=>{}},watch:()=>()=>{}};return}
firebase.initializeApp(cfg);
const auth=firebase.auth(),db=firebase.firestore(),FV=firebase.firestore.FieldValue;
const DOM='@users.jstasker.app';
const col=n=>db.collection(n);const D=(c,id)=>col(c).doc(id);
const isUser=u=>!!(u&&u.email&&u.email.endsWith(DOM));
const uid=()=>auth.currentUser.uid;
const mapDoc=d=>Object.assign({id:d.id},d.data());
const rid=()=>col('x').doc().id;
const settings=async()=>{const s=await D('settings','app').get();return withDefaults(s.exists?s.data():{})};
const myDoc=async()=>{const s=await D('users',uid()).get();if(!s.exists)throw new Error('Profile not found');return Object.assign({uid:s.id},s.data())};
const genCode=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return 'JS'+s};
// ---------- auth ----------
B.onAuth=cb=>auth.onAuthStateChanged(u=>cb(isUser(u)?{uid:u.uid,username:u.email.split('@')[0]}:null));
B.ensureProfile=async()=>{const u=auth.currentUser;if(!isUser(u))return;await createProfile(u.uid,u.email.split('@')[0],null)};
async function createProfile(id,username,ref){
 if((await D('users',id).get()).exists)return;
 let referrer=null;if(ref){try{const c=await D('codes',String(ref).toUpperCase()).get();if(c.exists&&c.data().uid!==id)referrer=c.data().uid}catch(e){}}
 for(let attempt=0;attempt<4;attempt++){
  const cref=D('meta','counter');let c=await cref.get();if(!c.exists){await cref.set({n:1});c=await cref.get()}
  const n=c.data().n,code=genCode(),t=now();
  const user={uid:id,name:username,username,jsId:jsFmt(n),jsNum:n,bio:'',phone:'',av:Math.floor(Math.random()*10),pic:'',dep:0,earn:0,verified:false,done:0,spent:0,totalEarn:0,refBy:referrer,code,createdAt:t,banned:false};
  const b=db.batch();b.set(D('users',id),user);b.update(cref,{n:n+1});b.set(D('codes',code),{uid:id});if(referrer)b.set(D('refs',id),{by:referrer,name:username,at:t});b.set(D('lb',id),{uid:id,name:username,jsId:user.jsId,earn:0,buyer:0,ref:0,verified:false});
  try{await b.commit();return}catch(e){if(attempt===3)throw e}
 }}
B.register=async(username,pass,ref)=>{let cred;try{cred=await auth.createUserWithEmailAndPassword(username+DOM,pass)}catch(e){
 if(e.code==='auth/email-already-in-use')throw new Error('That username is already taken.');if(e.code==='auth/weak-password')throw new Error('Password must be at least 6 characters.');if(e.code==='auth/operation-not-allowed')throw new Error('Sign-up is not enabled yet (owner: enable Email/Password in Firebase Authentication).');throw new Error('Could not register: '+(e.code||e.message))}
 try{await createProfile(cred.user.uid,username,ref)}catch(e){console.error(e);throw new Error('Account created but profile setup failed ('+(e.code||e.message)+'). Please log in again.')}};
B.login=async(username,pass)=>{let cred;try{cred=await auth.signInWithEmailAndPassword(username+DOM,pass)}catch(e){
 if(['auth/invalid-credential','auth/wrong-password','auth/user-not-found','auth/invalid-email'].includes(e.code))throw new Error('Wrong username or password.');if(e.code==='auth/too-many-requests')throw new Error('Too many attempts. Try again later.');throw new Error('Could not log in: '+(e.code||e.message))}
 try{await createProfile(cred.user.uid,username,null)}catch(e){console.error(e)}};
B.logout=()=>auth.signOut();
// ---------- watchers ----------
const Q={
 settings:()=>D('settings','app'),
 me:()=>D('users',uid()),
 tasks:()=>col('tasks').where('status','==','active').limit(300),
 myTasks:()=>col('tasks').where('owner','==',uid()),
 mySubs:()=>col('subs').where('uid','==',uid()),
 ownerSubs:()=>col('subs').where('owner','==',uid()),
 deps:()=>col('deposits').where('uid','==',uid()),
 wds:()=>col('withdraws').where('uid','==',uid()),
 notifs:()=>col('notifs').where('uid','==',uid()),
 hist:()=>col('hist').where('uid','==',uid()),
 lb:()=>col('lb').limit(150),
 tickets:()=>col('tickets').where('uid','==',uid()),
 refs:()=>col('refs').where('by','==',uid()),
 reflogs:()=>col('reflogs').where('to','==',uid()).where('claimed','==',false),
 a_users:()=>col('users').orderBy('createdAt','desc').limit(500),
 a_tasks:()=>col('tasks').orderBy('created','desc').limit(300),
 a_subs:()=>col('subs').orderBy('at','desc').limit(60),
 a_deps:()=>col('deposits').orderBy('at','desc').limit(150),
 a_wds:()=>col('withdraws').orderBy('at','desc').limit(150),
 a_tickets:()=>col('tickets').orderBy('at','desc').limit(100)};
B.watch=(n,cb)=>{let q;try{q=Q[n]()}catch(e){return()=>{}}
 return q.onSnapshot(s=>{if(n==='settings')cb(withDefaults(s.exists?s.data():{}));else if(n==='me')cb(s.exists?Object.assign({uid:s.id},s.data()):null);else cb(s.docs.map(mapDoc))},e=>{console.warn('watch '+n,e.code);if(n==='settings')cb(withDefaults());else if(n==='me')cb(null);else cb([])})};
// ---------- user actions ----------
const hist=(b,k,t,a,st)=>{b.set(D('hist',rid()),{uid:uid(),k,t,a:r4(a),st:st||'approved',at:now()})};
const notifTo=(b,to,t)=>{b.set(D('notifs',rid()),{uid:to,from:uid(),t:String(t).slice(0,280),at:now(),read:false})};
B.syncLb=async()=>{try{const u=await myDoc();const refs=await col('refs').where('by','==',u.uid).get();await D('lb',u.uid).set({uid:u.uid,name:u.name,jsId:u.jsId,earn:r4(u.totalEarn||0),buyer:r4(u.spent||0),ref:refs.size,verified:!!u.verified,av:(u.av!=null?u.av:(u.jsNum||0)%10),pic:u.pic||''})}catch(e){console.warn('lb',e.code)}};
const lbLater=()=>setTimeout(()=>B.syncLb(),600);
B.createTask=async f=>{const S=await settings(),u=await myDoc();if(u.banned)throw new Error('Account suspended');{const mn=minFor(S,f.tid,f.mins,f.shots);if(!(f.tid in (S.tMin||{})))throw new Error('Task type not available');if(!(f.price>0)||f.price<mn-1e-9)throw new Error('Price is too low. Minimum for this task is '+usd(mn)+' per worker')}
 const cost=taskCost(S,f.price,f.workers,f.days,f.boost,f.top);if(cost>u.dep+1e-9)throw new Error('Not enough deposit balance. Need '+usd(cost));
 const id=rid(),t=now(),b=db.batch();
 b.set(D('tasks',id),{id,owner:u.uid,ownerName:u.name,ownerJs:u.jsId,title:f.title,desc:f.desc,cat:f.cat,tid:f.tid,tname:f.tname||'',mins:f.mins||0,link:f.link,price:f.price,workers:f.workers,done:0,pending:0,days:f.days,shots:f.shots,note:!!f.note,vo:!!f.vo,status:'review',created:t,expiry:t+f.days*DAY,cost,pinned:false,top:!!f.top,bst:!!f.boost,boostUntil:0,hasEx:!!f.ex});if(f.ex)b.set(D('taskex',id),{owner:u.uid,img:f.ex});
 b.update(D('users',u.uid),{dep:FV.increment(-cost),spent:FV.increment(cost),op:{type:'task',id,amt:cost}});hist(b,'spend','Task submitted for approval: '+f.title,cost);await b.commit();lbLater();return id};
B.getEx=async id=>{const d=await D('taskex',id).get();return d.exists?(d.data().img||''):''};
B.editTask=async(id,workers,price)=>{const S=await settings(),u=await myDoc(),ts=await D('tasks',id).get(),t=ts.data();if(t.owner!==u.uid)throw new Error('Not your task');if(workers<t.workers||price<t.price)throw new Error('You can only increase workers and price');
 const amt=r4((workers*price-t.workers*t.price)*(1+S.taskFeePct/100));if(amt>u.dep+1e-9)throw new Error('Not enough deposit balance. Need '+usd(amt));const b=db.batch();
 b.update(D('tasks',id),{workers,price,cost:r4(t.cost+amt)});b.update(D('users',u.uid),{dep:FV.increment(-amt),spent:FV.increment(amt),op:{type:'edit',id,amt}});hist(b,'spend','Edited task: '+t.title,amt);await b.commit();lbLater()};
B.closeTask=async id=>{const u=await myDoc(),t=(await D('tasks',id).get()).data();if(t.owner!==u.uid||t.status!=='active')throw new Error('Cannot close this task');if(t.pending>0)throw new Error('Review all pending proofs first');
 const amt=r4((t.workers-t.done)*t.price),b=db.batch();b.update(D('tasks',id),{status:'closed'});b.update(D('users',u.uid),{dep:FV.increment(amt),op:{type:'close',id,amt}});hist(b,'refund','Task closed, refund: '+t.title,amt);await b.commit();return amt};
B.submitProof=async(t,imgs,text)=>{const u=await myDoc();if(u.banned)throw new Error('Account suspended');if(t.owner===u.uid)throw new Error('You cannot do your own task');const id=t.id+'_'+u.uid;
 if((await D('subs',id).get().catch(()=>({exists:false}))).exists)throw new Error('You already submitted this task');
 const fresh=(await D('tasks',t.id).get()).data();if(!fresh||fresh.status!=='active'||fresh.done+fresh.pending>=fresh.workers)throw new Error('No slots left');if(fresh.vo&&!u.verified)throw new Error('Verified workers only');
 const b=db.batch();b.set(D('subs',id),{id,taskId:t.id,taskTitle:t.title,price:t.price,uid:u.uid,user:u.name,jsId:u.jsId,owner:t.owner,status:'pending',paid:false,text:text||'',imgs,at:now(),dueAt:now()+t.days*DAY,reason:''});
 b.update(D('tasks',t.id),{pending:FV.increment(1)});notifTo(b,t.owner,'New proof submitted for "'+t.title+'"');await b.commit()};
B.review=async(id,status,reason)=>{const s=(await D('subs',id).get()).data();if(s.owner!==uid()||s.status!=='pending')throw new Error('Already reviewed');if(status==='rejected'&&(reason||'').trim().length<3)throw new Error('Please write a reason');
 const b=db.batch();if(status==='approved'){b.update(D('subs',id),{status:'approved'});notifTo(b,s.uid,'Your proof for "'+s.taskTitle+'" was approved.')}else{b.update(D('subs',id),{status:'rejected',reason});b.update(D('tasks',s.taskId),{pending:FV.increment(-1)});notifTo(b,s.uid,'Your proof for "'+s.taskTitle+'" was rejected: '+reason)}await b.commit()};
B.claimSub=async id=>{const ss=await D('subs',id).get();if(!ss.exists)return;const s=ss.data();if(s.uid!==uid()||s.paid||s.status==='rejected')return;if(!(s.status==='approved'||now()>s.dueAt+2000))return;
 const S=await settings(),u=await myDoc(),net=r4(s.price*(1-S.workerFeePct/100)),auto=s.status!=='approved',b=db.batch();
 b.update(D('subs',id),{paid:true,imgs:[],status:'approved'});b.update(D('tasks',s.taskId),{pending:FV.increment(-1),done:FV.increment(1)});
 b.update(D('users',u.uid),{earn:FV.increment(net),totalEarn:FV.increment(net),done:FV.increment(1),op:{type:'claim',id,amt:net}});hist(b,'earn','Task approved: '+s.taskTitle,net);if(auto)notifTo(b,u.uid,'Auto-approved (buyer did not review in time): '+s.taskTitle);
 if(u.refBy&&S.refOn){b.set(D('reflogs',id),{kind:'pct',sub:id,to:u.refBy,from:u.uid,amt:r4(s.price*S.refPct/100),claimed:false,at:now()});
  if(S.refBonusOn&&u.done+1>=S.refNeed){const bs=await D('reflogs','bonus_'+u.uid).get().catch(()=>({exists:true}));if(!bs.exists)b.set(D('reflogs','bonus_'+u.uid),{kind:'bonus',to:u.refBy,from:u.uid,amt:S.refBonus,claimed:false,at:now()})}}
 await b.commit();lbLater()};
B.claimRef=async id=>{const ls=await D('reflogs',id).get();if(!ls.exists)return;const l=ls.data();if(l.to!==uid()||l.claimed)return;const b=db.batch();
 b.update(D('reflogs',id),{claimed:true});b.update(D('users',uid()),{earn:FV.increment(l.amt),totalEarn:FV.increment(l.amt),op:{type:'ref',id,amt:l.amt}});hist(b,'ref',l.kind==='bonus'?'Referral bonus':'Referral commission',l.amt);await b.commit();lbLater()};
B.reqDeposit=async d=>{const u=await myDoc();await col('deposits').add(Object.assign({uid:u.uid,user:u.name,jsId:u.jsId,status:'pending',at:now()},d))};
B.reqWithdraw=async w=>{const S=await settings(),u=await myDoc();if(S.kycWd&&!u.verified)throw new Error('Verify your account first');if(w.amt>u.earn+1e-9)throw new Error('Not enough earned balance');
 const id=rid(),b=db.batch();b.set(D('withdraws',id),Object.assign({uid:u.uid,user:u.name,jsId:u.jsId,status:'pending',at:now()},w));b.update(D('users',u.uid),{earn:FV.increment(-w.amt),op:{type:'wd',id,amt:w.amt}});await b.commit()};
B.payVerify=async()=>{const S=await settings(),u=await myDoc();if(!S.verifyOn)throw new Error('Verification is off');const k=S.verifyFrom==='earn'?'earn':'dep';if(u[k]<S.verifyFee-1e-9)throw new Error('Not enough '+(k==='dep'?'deposit':'earned')+' balance');
 const b=db.batch();const p={verified:true,op:{type:'verify',id:'v',amt:S.verifyFee}};p[k]=FV.increment(-S.verifyFee);b.update(D('users',u.uid),p);hist(b,'spend','Account verification',S.verifyFee);await b.commit();lbLater()};
B.saveProfile=async p=>{await D('users',uid()).update(p);lbLater()};
B.setPassword=async p=>{if(p.length<6)throw new Error('Password must be at least 6 characters.');try{await auth.currentUser.updatePassword(p)}catch(e){if(e.code==='auth/requires-recent-login')throw new Error('For security, please log out and log in again, then change your password.');throw e}};
B.ticketNew=async(sub,msg)=>{const u=await myDoc();const r=await col('tickets').add({uid:u.uid,user:u.name,sub,status:'open',at:now(),msgs:[{by:'user',t:msg,at:now()}]});return r.id};
B.ticketReply=async(id,t)=>{await D('tickets',id).update({msgs:FV.arrayUnion({by:'user',t,at:now()}),status:'open'})};
B.markRead=async()=>{const s=await col('notifs').where('uid','==',uid()).get();const b=db.batch();let n=0;s.forEach(d=>{if(!d.data().read){b.update(d.ref,{read:true});n++}});if(n)await b.commit()};
B.pruneHist=async cutoff=>{const s=await col('hist').where('uid','==',uid()).get();const old=s.docs.filter(d=>(d.data().at||0)<cutoff);for(let i=0;i<old.length;i+=400){const b=db.batch();old.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit()}};
// ---------- admin ----------
const adminHist=(b,u,k,t,a)=>b.set(D('hist',rid()),{uid:u,k,t,a:r4(a),st:'approved',at:now()});
const adminNotif=(b,u,t)=>b.set(D('notifs',rid()),{uid:u,from:'admin',t:String(t).slice(0,280),at:now(),read:false});
B.adm={
 login:async(e,p)=>{if(e.endsWith(DOM))throw new Error('Wrong email or password.');try{await auth.signInWithEmailAndPassword(e,p)}catch(x){if(['auth/invalid-credential','auth/wrong-password','auth/user-not-found','auth/invalid-email'].includes(x.code))throw new Error('Wrong email or password.');throw new Error('Could not sign in: '+(x.code||x.message))}},
 onAuth:cb=>auth.onAuthStateChanged(u=>cb(u&&u.email&&!u.email.endsWith(DOM)?{email:u.email}:null)),
 logout:()=>auth.signOut(),
 watch:(n,cb)=>B.watch('a_'+n,cb),
 approveDep:async(id,credit)=>{await db.runTransaction(async tx=>{const r=D('deposits',id),s=await tx.get(r);const d=s.data();if(!d||d.status!=='pending')throw new Error('Already processed');tx.update(r,{status:'approved',credit});tx.update(D('users',d.uid),{dep:FV.increment(credit)});adminHist(tx,d.uid,'dep','Deposit via '+d.method,credit);adminNotif(tx,d.uid,'Deposit approved: '+usd(credit)+' added to your deposit balance.')})},
 rejectDep:async(id,why)=>{await db.runTransaction(async tx=>{const r=D('deposits',id),s=await tx.get(r);const d=s.data();if(!d||d.status!=='pending')throw new Error('Already processed');tx.update(r,{status:'rejected',note:why});adminNotif(tx,d.uid,'Deposit rejected: '+why)})},
 payWd:async id=>{await db.runTransaction(async tx=>{const r=D('withdraws',id),s=await tx.get(r);const d=s.data();if(!d||d.status!=='pending')throw new Error('Already processed');tx.update(r,{status:'paid'});adminNotif(tx,d.uid,'Withdraw paid: '+usd(d.net)+' via '+d.method);adminHist(tx,d.uid,'wd','Withdraw via '+d.method,d.amt)})},
 rejectWd:async(id,why)=>{await db.runTransaction(async tx=>{const r=D('withdraws',id),s=await tx.get(r);const d=s.data();if(!d||d.status!=='pending')throw new Error('Already processed');tx.update(r,{status:'rejected',note:why});tx.update(D('users',d.uid),{earn:FV.increment(d.amt)});adminNotif(tx,d.uid,'Withdraw rejected: '+why+'. The amount was refunded.')})},
 approveTask:async id=>{await db.runTransaction(async tx=>{const r=D('tasks',id),s=await tx.get(r);const t=s.data();if(!t||t.status!=='review')throw new Error('Already processed');const n=now();tx.update(r,{status:'active',created:n,expiry:n+t.days*DAY,boostUntil:t.bst?n+DAY:0});adminNotif(tx,t.owner,'Your task "'+t.title+'" was approved and is now live.')})},
 rejectTask:async(id,why)=>{await db.runTransaction(async tx=>{const r=D('tasks',id),s=await tx.get(r);const t=s.data();if(!t||t.status!=='review')throw new Error('Already processed');tx.update(r,{status:'rejected',reason:why});tx.update(D('users',t.owner),{dep:FV.increment(t.cost),spent:FV.increment(-t.cost)});adminHist(tx,t.owner,'refund','Task rejected, refund: '+t.title,t.cost);adminNotif(tx,t.owner,'Your task "'+t.title+'" was rejected: '+why+'. Full amount '+usd(t.cost)+' was refunded to your deposit balance.')})},
 setUser:async(u,p)=>{await D('users',u).update(p);if('verified' in p)await D('lb',u).set({verified:p.verified},{merge:true}).catch(()=>{})},
 adjust:async(u,f,delta,note)=>{const b=db.batch();const p={};p[f]=FV.increment(delta);b.update(D('users',u),p);adminNotif(b,u,'Balance adjusted by admin: '+(delta>=0?'+':'-')+usd(Math.abs(delta))+(note?' ('+note+')':''));adminHist(b,u,'adj','Admin adjustment',delta);await b.commit()},
 taskPatch:(id,p)=>D('tasks',id).update(p),
 deleteTask:async id=>{const t=(await D('tasks',id).get()).data();const amt=r4(Math.max(0,(t.workers-t.done-t.pending)*t.price));const b=db.batch();b.update(D('users',t.owner),{dep:FV.increment(amt)});adminNotif(b,t.owner,'Your task "'+t.title+'" was removed by admin. Refund: '+usd(amt));b.delete(D('tasks',id));await b.commit()},
 forcePay:id=>D('subs',id).update({status:'approved'}),
 saveSettings:p=>D('settings','app').set(p,{merge:true}),
 notify:async(u,t)=>{const b=db.batch();adminNotif(b,u,t);await b.commit()},
 ticketReply:async(id,t)=>{const k=(await D('tickets',id).get()).data();const b=db.batch();b.update(D('tickets',id),{msgs:FV.arrayUnion({by:'admin',t,at:now()})});adminNotif(b,k.uid,'Support replied to your ticket: '+k.sub);await b.commit()},
 ticketClose:id=>D('tickets',id).update({status:'closed'}),
 initCounter:n=>D('meta','counter').set({n}),
 ensureSettings:async()=>{const s=await D('settings','app').get();const cur=s.exists?s.data():{};const miss={};Object.keys(DEFAULTS).forEach(k=>{if(!(k in cur))miss[k]=DEFAULTS[k]});if(Object.keys(miss).length)await D('settings','app').set(miss,{merge:true})}};
// ---- double-click protection: an identical call that is still running (or finished <1s ago) is not run again ----
const dedupe=o=>{Object.keys(o).forEach(k=>{const f=o[k];if(typeof f!=='function'||f.constructor.name!=='AsyncFunction')return;const live={};o[k]=function(){let key;try{key=JSON.stringify([].slice.call(arguments)).slice(0,600)}catch(e){return f.apply(this,arguments)}if(live[key])return live[key];const p=f.apply(this,arguments);live[key]=p;const done=()=>setTimeout(()=>{delete live[key]},1000);p.then(done,done);return p}})};
dedupe(B);dedupe(B.adm);
})();
