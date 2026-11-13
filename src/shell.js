/* ---------- shell ---------- */
let tab="play",downloads=null;
function show(t){tab=t;render();scrollTo(0,0)}
function render(){
  for(const b of document.querySelectorAll("nav button[data-tab]"))b.setAttribute("aria-selected",b.dataset.tab===tab?"true":"false");
  $("tSound").setAttribute("aria-pressed",soundOn?"true":"false");$("tVoice").setAttribute("aria-pressed",voiceOn?"true":"false");$("tVoice").hidden=!tts;
  if(tab!=="play"){cancelAnimationFrame(raf);cv=null}
  drawClock();
  if(tab==="edit")return editView();
  if(tab==="data")return dataView();
  const p=G.phase;
  if(p==="start")startView();else if(p==="brief")stageView();else if(p==="recover")recoverView();else if(p==="result")resultView();else endView(p==="won");
}
document.querySelector("nav").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(b){if(testing&&b.dataset.tab!=="play"){testing=false;BASE=LIVE;toStart()}show(b.dataset.tab)}});
$("tSound").addEventListener("click",()=>{soundOn=!soundOn;ls.set("mb-sound",soundOn?"1":"0");if(soundOn)sfx.go();render()});
$("tVoice").addEventListener("click",()=>{voiceOn=!voiceOn;spoken="";if(!voiceOn&&tts){try{tts.stop().catch(()=>{})}catch(e){}}render()});

let names={};
function start(saved){
  toStart();
  if(saved&&saved.G&&!saved.testing&&saved.G.i<LIVE.stages.length&&saved.G.dates){SCN=applyWhatifs(BASE,saved.G.picks||[]);G=saved.G}
  render();
  connect();
}
async function connect(){
  const C=window.claude;if(!C||!C.use)return;
  C.use("sample").then(s=>{sample=s;if(tab==="edit")render()});
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
