/* ---------- shell ---------- */
let tab="play",downloads=null;
function show(t){tab=t;render();scrollTo(0,0)}
function render(){
  for(const b of document.querySelectorAll("nav button[data-tab]"))b.setAttribute("aria-selected",b.dataset.tab===tab?"true":"false");
  $("tSound").setAttribute("aria-pressed",soundOn?"true":"false");$("tVoice").setAttribute("aria-pressed",voiceOn?"true":"false");$("tVoice").hidden=!tts;
  if(tab!=="play"){cancelAnimationFrame(raf);cv=null}
  drawClock();
  if(tab==="edit"){editView();artPanel();return}
  if(tab==="data")return dataView();
  const p=G.phase;
  if(p==="start")startView();else if(p==="brief")stageView();else if(p==="recover")recoverView();else if(p==="result")resultView();else if(p==="awd"&&SCN.awarded)awardedView();else endView(p==="won");
}
document.querySelector("nav").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(b){if(testing&&b.dataset.tab!=="play"){testing=false;BASE=LIVE;toStart()}show(b.dataset.tab)}});
$("tSound").addEventListener("click",()=>{soundOn=!soundOn;ls.set("mb-sound",soundOn?"1":"0");if(soundOn)sfx.go();render()});
$("tVoice").addEventListener("click",()=>{voiceOn=!voiceOn;spoken="";if(!voiceOn&&tts){try{tts.stop().catch(()=>{})}catch(e){}}render()});

let names={},artMsg="";
function artKeys(){const m={};const put=(k,u)=>{const j=jobOf(u);if(j)m[k]=j};
  for(const st of LIVE.stages){put(st.id+".png",st.still);put(st.id+".mp4",st.media);for(const k of ["carriers","items","options"])for(const o of st[k]||[]){if(typeof o.image==="string")put(o.id+".png",o.image);if(o.art){put("out_"+o.id+".png",o.art.still);put("out_"+o.id+".mp4",o.art.media)}}}
  for(const k of ["fail","win","loss"]){const a=(LIVE.art||{})[k];if(a){put("out_"+k+".png",a.still);put("out_"+k+".mp4",a.media)}}return m}
function artPanel(){
  if(!canPublish||!assets||!db)return;
  const keys=artKeys(),jobs=new Set(Object.values(keys)),have=[...jobs].filter(j=>ART[j]).length;
  const inp=h("input",{type:"file",multiple:true,accept:"image/png,image/jpeg,image/webp,video/mp4"});
  const msg=h("div",{class:"msg",text:artMsg});
  inp.addEventListener("change",async()=>{const map=Object.assign({},ART);let ok=0;const skip=[];
    for(const f of inp.files){const nm=f.name.toLowerCase();let j=jobOf(nm)||keys[nm]||keys[nm.replace(/\.jpe?g$|\.webp$/,".png")];if(!j||!jobs.has(j)){skip.push(f.name);continue}
      msg.textContent="Uploading "+f.name+"...";try{const r=await assets.upload(f);map[j]=r.id;ok++}catch(e){skip.push(f.name+" ("+((e&&e.code)||"failed")+")")}}
    try{if(ok)await db.doc("game/art").set({map,at:Date.now()});artMsg="Stored "+ok+" file"+(ok===1?"":"s")+"."+(skip.length?" Not used: "+skip.join(", ")+".":"")}catch(e){artMsg="The files uploaded but the list could not be saved."}
    msg.textContent=artMsg});
  $("main").append(h("div",{class:"card",style:"margin-top:16px;max-width:68ch"},h("h3",{style:"margin-top:0",text:"Game art"}),
    h("p",{class:"note",text:"This page cannot load pictures or clips from outside sites, so the Higgsfield art shows here only after its files are stored with the page. "+have+" of "+jobs.size+" are stored. Download the files from Higgsfield and choose them here. Keep the original file names, or name each one after its game id, such as viper.png, scout.png, scout.mp4 or out_win.mp4."}),inp,msg));
}
function start(saved){
  toStart();SHARED=readShare();
  if(saved&&saved.G&&!saved.testing&&saved.G.i<LIVE.stages.length&&saved.G.dates){SCN=applyWhatifs(BASE,saved.G.picks||[]);G=saved.G}
  render();
  connect();
}
async function connect(){
  const C=window.claude;if(!C||!C.use)return;
  C.use("sample").then(s=>{sample=s;if(tab==="edit")render()});
  C.use("assets").then(a=>{assets=a;if(tab==="edit")render()});
  C.use("tts").then(t=>{tts=t;$("tVoice").hidden=!t});
  C.use("downloads").then(d=>{downloads=d;if(tab==="play"&&(G.phase==="won"||G.phase==="lost"))render()});
  user=await C.use("user");
  if(user){try{canPublish=await user.canEdit();myId=await user.id()}catch(e){}}
  db=await C.use("db");if(!db){if(tab==="edit")render();return}
  db.doc("game/live").onSnapshot(snap=>{
    let s=null;if(snap.exists){try{s=JSON.parse(snap.data().json)}catch(e){}}
    LIVE=validScenario(s)?s:clone(DEFAULT);
    if(!testing){BASE=LIVE;if(G.phase==="start"||(G.months===0&&G.i===0)||G.i>=LIVE.stages.length)toStart();else SCN=applyWhatifs(BASE,G.picks)}
    if(!ls.get("mb-draft"))draft=null;
    if(!(tab==="edit"&&/TEXTAREA|INPUT|SELECT/.test(document.activeElement.tagName)))render();
  },()=>{});
  db.doc("game/art").onSnapshot(snap=>{ART=(snap.exists&&snap.data().map)||{};if(!(tab==="edit"&&/TEXTAREA|INPUT|SELECT/.test(document.activeElement.tagName)))render()},()=>{});
  db.collection("proposals").orderBy("at","desc").limit(30).onSnapshot(async q=>{
    proposals=q.docs.map(d=>Object.assign({id:d.id},d.data()));
    if(user&&user.profiles){try{const ps=await user.profiles([...new Set(proposals.map(p=>p.by).filter(Boolean))]);names={};for(const id in ps)names[id]=ps[id].name||""}catch(e){}}
    if(tab==="edit"&&!/TEXTAREA|INPUT|SELECT/.test(document.activeElement.tagName))render();
  },()=>{});
  if(tab==="edit")render();
}
const hot=window.claude&&window.claude.hot;
if(hot&&hot.snapshot)hot.snapshot(()=>({G,testing}));
if(hot&&hot.ready)hot.ready(start);else start((hot&&hot.data)||{});
