"use strict";
const DEFAULT=JSON.parse(document.getElementById("scn").textContent);
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const $=id=>document.getElementById(id);
function h(tag,attrs,...kids){const e=document.createElement(tag);for(const k in attrs||{}){const v=attrs[k];if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k.startsWith("on"))e.addEventListener(k.slice(2),v);else if(k==="text")e.textContent=v;else e.setAttribute(k,v===true?"":v)}for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(String(c)))}return e}
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const clone=o=>JSON.parse(JSON.stringify(o));
function validScenario(s){return s&&Array.isArray(s.stages)&&s.stages.length>0&&s.start&&s.deadline&&s.stages.every(validStage)}
function validStage(s){return s&&typeof s.id==="string"&&typeof s.title==="string"&&((s.type==="choice"&&Array.isArray(s.options)&&s.options.some(o=>o.outcome==="ok"))||(s.type==="loadout"&&Array.isArray(s.carriers)&&s.carriers.length&&Array.isArray(s.items)))}

let LIVE=clone(DEFAULT);          // scenario everyone plays
let BASE=LIVE;                     // scenario a run is built from (live, or a draft under test)
let SCN=LIVE;                      // BASE with the chosen what-ifs applied
let testing=false;
let G=null;
function applyWhatifs(base,picks){
  const s=clone(base);s.riskAdd=0;s.monthsPct=0;
  for(const w of (base.whatifs||[]).filter(w=>picks.includes(w.id))){
    if(w.deadlineShift){const t=s.deadline.y*12+s.deadline.m-1+w.deadlineShift;s.deadline.y=Math.floor(t/12);s.deadline.m=t%12+1;const rm=s.rival&&s.rival.milestones;if(rm&&rm.length){rm[rm.length-1].y=s.deadline.y;rm[rm.length-1].m=s.deadline.m}}
    if(w.budgetDeltaM)s.budgetM=(s.budgetM||0)+w.budgetDeltaM;
    if(w.monthsPct)s.monthsPct+=w.monthsPct;
    if(w.riskAdd)s.riskAdd+=w.riskAdd;
    if(w.carrierReady)for(const st of s.stages)for(const c of st.carriers||[])if(w.carrierReady[c.id])c.availableAt=w.carrierReady[c.id];
  }
  return s;
}
function newGame(picks,phase){picks=picks||[];SCN=applyWhatifs(BASE,picks);G={site:"",broke:false,i:0,months:0,spent:0,wear:0,tags:[],assets:[],log:[],dates:{},phase:phase||"brief",sel:{},result:null,rec:null,picks}}
const toStart=()=>newGame([],"start");
const totalMonths=()=>(SCN.deadline.y-SCN.start.y)*12+(SCN.deadline.m-SCN.start.m);
const moOf=d=>(d.y-SCN.start.y)*12+(d.m-SCN.start.m);
function dateAt(mo){const t=SCN.start.y*12+SCN.start.m-1+mo;return MONTHS[t%12]+" "+Math.floor(t/12)}
function dur(mo){const y=Math.floor(mo/12),m=mo%12;return (y?y+" yr ":"")+m+" mo"}
const fm=m=>Math.abs(m)>=1000?(m<0?"-":"")+"$"+(Math.abs(m)/1000).toFixed(1)+"B":"$"+m+"M";
const has=t=>G.tags.includes(t);
const availMo=o=>o&&o.availableAt?moOf(o.availableAt):0;
const availTxt=o=>o&&o.availableAt?" Ready no earlier than "+MONTHS[o.availableAt.m-1]+" "+o.availableAt.y+".":"";
const roll=()=>typeof window.__roll==="function"?window.__roll():Math.random();
const yearly=()=>(SCN.budgetM||0)/(SCN.budgetYears||7);
const released=m=>Math.min(SCN.budgetM||0,Math.round(yearly()*(Math.floor(m/12)+1)));
const funds=()=>released(G.months)-G.spent;
const moreComing=()=>released(G.months)<(SCN.budgetM||0);
const nightSafe=()=>!SCN.night||SCN.night.tags.some(has);

/* ---------- sound and voice ---------- */
let soundOn=ls.get("mb-sound")==="1",voiceOn=false,tts=null,actx=null,spoken="";
function tone(f,d,type,when){if(!soundOn)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+(when||0);o.type=type||"sine";o.frequency.value=f;g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d)}catch(e){}}
const sfx={go(){tone(2525,.25);tone(2475,.25,"sine",.3)},bad(){tone(110,.7,"sawtooth");tone(82,.9,"sawtooth",.15)},win(){[523,659,784,1047].forEach((f,i)=>tone(f,.6,"triangle",i*.18))}};
function say(key,text){if(!voiceOn||!tts||spoken===key)return;spoken=key;try{tts.speak(text.slice(0,1900)).catch(()=>{})}catch(e){}}

/* ---------- header ---------- */
function drawClock(){
  $("cDate").textContent=dateAt(G.months);$("cEl").textContent=dur(G.months);$("cCn").textContent=dateAt(totalMonths());
  $("cBud").textContent=fm(funds())+" of "+fm(released(G.months))+" released";
  const T=totalMonths(),pct=m=>Math.max(0,Math.min(100,m/T*100)),race=$("tl");race.textContent="";
  const you=h("div",{class:"rb"},h("div",{class:"track"}),h("div",{class:"fill",style:"width:"+pct(G.months)+"%"}));
  for(const m of SCN.markers||[]){const mo=moOf(m);if(mo>0&&mo<T)you.append(h("div",{class:"mk",style:"left:"+pct(mo)+"%",title:m.label}))}
  const cn=h("div",{class:"rb cn"},h("div",{class:"track"}),h("div",{class:"fill",style:"width:"+pct(G.months)+"%"}));
  const rms=(SCN.rival&&SCN.rival.milestones)||[];let next=null;
  for(const m of rms){const mo=moOf(m);if(mo<0)continue;const hit=G.months>=mo;if(!hit&&!next)next=m;cn.append(h("div",{class:"mk"+(hit?" hit":""),style:"left:calc("+pct(mo)+"% - "+(mo>=T?3:0)+"px)",title:m.label}))}
  race.append(h("span",{text:"You"}),you,h("span",{text:(SCN.rival&&SCN.rival.name)||"Rival"}),cn);
  const nm=(SCN.markers||[]).find(m=>moOf(m)>G.months);
  $("tln").textContent="";if(nm)$("tln").append(h("span",{text:"Next for NASA: "+nm.label+", "+nm.y}));if(next)$("tln").append(h("span",{},"Next for "+SCN.rival.name+": ",h("b",{text:next.label+", "+MONTHS[next.m-1]+" "+next.y})));
}
