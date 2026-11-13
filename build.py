# Builds index.html (the game) and timeline.html from scenario.json and src/.
# Run from the repository root: python3 build.py
import json,re,sys
old=open('src/template.html').read()
css=old[old.index('<style>'):old.index('</style>')]
css=css.replace(".tl{position:relative;height:30px;margin-bottom:6px}","")
css+=open('src/css_extra.css').read()+'</style>'
head=old[:old.index('<style>')]
painter=old[old.index('/* ---------- cutscene painter'):old.index('/* ---------- play ---------- */')]
editor=old[old.index('/* ---------- scene editor ---------- */'):old.index('/* ---------- shell ---------- */')]
rep=[
("let db=null,user=null,","const SETKEYS=['title','start','deadline','budgetM','budgetYears','night','whatifs','rival','quality','art','shareUrl','markers','milestones','facts','sources'];\nlet db=null,user=null,"),
("'A \"loadout\" stage has carriers: [{id,label,capKg,months,desc}]","'Every option, carrier and item may carry costM (cost in millions of dollars); options and carriers may carry risk (0 to 1 chance of a mishap). An option outcome may also be \"setback\": it costs its months, then the stage completes with its grants. A stage may carry still (a picture link) and media (a video link) for its cutscene. A stage may carry insight: {text,url} (a sourced fact shown after the decision) and real (what NASA has published for that step). Items and carriers may carry availableAt: {y,m}. Options, carriers and items may carry caps (a list of short capability phrases) and benefit (one sentence). Items and options may carry quality (points added to the base quality score); items may carry fx: {monthsPct, risk} (changes every later stage: negative monthsPct is faster, negative risk is safer), class (a short label), image (a picture link), rec (true puts it in the recommended set shown first), devCostM and devMonths (development cost and time charged once), risk (added to the mishap chance of that delivery) and niac: {pi,year,url}. '+\n'A \"loadout\" stage has carriers: [{id,label,capKg,months,desc}]"),
("if(edSel>=draft.stages.length)edSel=0;\n  const st=draft.stages[edSel];","if(edSel>=draft.stages.length)edSel=0;\n  const isSet=edSel<0,st=isSet?Object.fromEntries(SETKEYS.filter(k=>k in draft).map(k=>[k,draft[k]])):draft.stages[edSel];"),
("if(!validStage(o)){say(\"A stage needs an id, a title, a type, and either options with one that works or carriers and items.\",true);return null}return o};","if(isSet?!(o&&typeof o===\"object\"&&!Array.isArray(o)):!validStage(o)){say(isSet?\"Settings must be one JSON object.\":\"A stage needs an id, a title, a type, and either options with one that works or carriers and items.\",true);return null}return o};"),
("const apply=()=>{const o=readJson();if(!o)return false;draft.stages[edSel]=o;saveDraft();return true};","const apply=()=>{const o=readJson();if(!o)return false;if(isSet){const t=Object.assign(clone(draft),o);if(!validScenario(t)){say(\"Settings need a start date and a deadline.\",true);return false}draft=t}else draft.stages[edSel]=o;saveDraft();return true};"),
("},draft.stages.map((s,i)=>{const o=h(\"option\",{value:i,text:(i+1)+\". \"+s.title});if(i===edSel)o.selected=true;return o}));","},[h(\"option\",{value:-1,selected:isSet,text:\"Game settings: budget, lunar night, what-ifs, rival, timeline, facts\"})].concat(draft.stages.map((s,i)=>{const o=h(\"option\",{value:i,text:(i+1)+\". \"+s.title});if(i===edSel)o.selected=true;return o})));"),
("try{const out=await sample.json(\"You edit one stage of a data-driven game about building NASA's lunar base. \"+SCHEMA+","try{const out=await sample.json((isSet?\"You edit the global settings object of a data-driven game about building NASA's lunar base. It holds budgetM (total program budget in millions of dollars), budgetYears (the budget is released in equal yearly parts over this many years and spending can never exceed what has been released), night {pct,tags,text}, whatifs [{id,label,desc,deadlineShift,budgetDeltaM,monthsPct,riskAdd,carrierReady}], rival {name,milestones:[{y,m,label}]}, markers, milestones [{when,y,m,text,url,cat,who}], facts [[item,figure,url]] and sources. \":\"You edit one stage of a data-driven game about building NASA's lunar base. \"+SCHEMA)+"),
("\"\\n\\nCurrent stage:\\n\"","\"\\n\\nCurrent \"+(isSet?\"settings\":\"stage\")+\":\\n\""),
("Reply with only the complete updated stage as one JSON object.","Reply with only the complete updated object as one JSON object."),
("if(!validStage(out)){say(\"Claude's answer was not a usable stage.","if(isSet?!(out&&typeof out===\"object\"&&!Array.isArray(out)):!validStage(out)){say(\"Claude's answer was not usable."),
("draft.stages.splice(edSel+1,0,","draft.stages.splice(Math.max(0,edSel)+1,0,"),
("h(\"button\",{class:\"btn ghost small\",disabled:edSel===0,","h(\"button\",{class:\"btn ghost small\",disabled:edSel<=0,"),
("disabled:edSel===draft.stages.length-1,","disabled:isSet||edSel===draft.stages.length-1,"),
("resultText:\"It fails.\"}]});edSel++;","resultText:\"It fails.\"}]});edSel=Math.max(0,edSel)+1;"),
("disabled:draft.stages.length<2,","disabled:isSet||draft.stages.length<2,"),
("testing=true;SCN=clone(draft);newGame();G.i=edSel;G.tags=[...new Set(draft.stages.slice(0,edSel)","testing=true;BASE=clone(draft);newGame([]);G.i=Math.max(0,edSel);G.tags=[...new Set(draft.stages.slice(0,Math.max(0,edSel))"),
("h(\"label\",{for:\"edJson\",text:\"Stage data\"})","h(\"label\",{for:\"edJson\",text:isSet?\"Settings data\":\"Stage data\"})"),
("onclick:async()=>{const o=readJson();if(!o)return;try{await db.collection(\"proposals\")","onclick:async()=>{if(isSet){say(\"Proposals carry one stage. Pick a stage first.\",true);return}const o=readJson();if(!o)return;try{await db.collection(\"proposals\")"),
("Change any cutscene, the actions it offers, and what each action leads to.","Change any cutscene, the actions it offers, their cost and risk, and what each action leads to. Game settings holds the budget, lunar night rule, what-ifs and timeline."),
# GitHub Pages: no window.claude, so sharing goes through GitHub instead
("if(!db)side.append(h(\"p\",{class:\"note\",text:\"Sign in to claude.ai to publish or propose changes. Your draft still works for playtesting.\"}));","if(!db)hostedShare(side,readJson,isSet,say);"),
("sample?null:h(\"span\",{class:\"note\",text:\"Claude rewriting is not available in this view. Edit the data below instead.\"})","sample?null:h(\"span\",{class:\"note\",text:\"Rewriting with Claude works only in the claude.ai version (see the panel on the right). Edit the data below instead.\"})"),
]
for a,b in rep:
    assert a in editor,a[:60]; editor=editor.replace(a,b)
_old='''  if(media)s.append(h("video",{src:media,autoplay:true,muted:true,loop:true,playsinline:true}));
  else if(prompt)s.append(h("div",{class:"tag",text:"Placeholder scene. Video brief: "+prompt}));'''
_new='''  const key=[sc,caption,artUrl(media),artUrl(still)].join("|");
  if(lastScr&&lastScr.key===key){cv=lastScr.cv;cancelAnimationFrame(raf);raf=requestAnimationFrame(paint);const v=lastScr.el.querySelector("video");if(v)setTimeout(()=>{try{v.play().catch(()=>{})}catch(e){}},0);return lastScr.el}
  const tag=prompt?h("div",{class:"tag",text:"Placeholder scene. Video brief: "+prompt}):null,gone=()=>{if(tag)tag.remove()};
  const im=artEl("img",still,{class:"art",alt:""},gone);if(im)s.append(im);
  const vd=artEl("video",media,{class:"art",autoplay:true,muted:true,loop:true,playsinline:true,preload:"auto"},gone);if(vd){vd.muted=true;s.append(vd)}
  if(tag)s.append(tag);lastScr={key,el:s,cv};'''
assert _old in painter; painter=painter.replace(_old,_new).replace("function screenEl(sc,caption,prompt,media){","let lastScr=null;\nfunction screenEl(sc,caption,prompt,media,still){")
assert "media,still)" in painter
body='''<header><div class="wrap">
  <div class="bar"><h1>Moon Base Race</h1>
    <div class="clock"><span>Mission date <b id="cDate"></b></span><span>Elapsed <b id="cEl"></b></span><span>Funds <b id="cBud"></b></span><span class="cn">Deadline <b id="cCn"></b></span></div></div>
  <div class="race" id="tl"></div><div class="racenote" id="tln"></div>
  <nav><button role="tab" id="tabPlay" data-tab="play">Play</button><button role="tab" id="tabEdit" data-tab="edit">Scene editor</button><button role="tab" id="tabData" data-tab="data">Data and sources</button><span class="sp"></span><button class="tog" id="tSound" aria-pressed="false">Sound</button><button class="tog" id="tVoice" aria-pressed="false" hidden>Mission control voice</button></nav>
</div></header>
<div class="wrap"><main id="main"></main></div>
'''
d=json.load(open('scenario.json'))
def _bad(s):
    if not (isinstance(s.get('id'),str) and isinstance(s.get('title'),str)): return "needs an id and a title"
    if s.get('type')=='choice':
        if not any(o.get('outcome')=='ok' for o in s.get('options') or []): return "is a choice stage with no option whose outcome is \"ok\""
    elif s.get('type')=='loadout':
        if not (s.get('carriers') and isinstance(s.get('items'),list)): return "is a loadout stage without carriers and items"
    else: return "has type %r; it must be \"choice\" or \"loadout\"" % s.get('type')
problems=[] if d.get('start') and d.get('deadline') and d.get('stages') else ["scenario.json needs start, deadline and stages"]
problems+=["Stage %d (%s) %s"%(i+1,s.get('id','?'),_bad(s)) for i,s in enumerate(d.get('stages') or []) if _bad(s)]
if problems: sys.exit("scenario.json has problems:\n  "+"\n  ".join(problems))
s=json.dumps(d,ensure_ascii=False).replace('</','<\\/')
explorer=sys.argv[1] if len(sys.argv)>1 else "timeline.html"
js=open('src/prelude.js').read()+"const EXPLORER="+json.dumps(explorer)+";\n"+painter+open('src/play.js').read()+open('src/data.js').read()+editor+open('src/shell.js').read()+open('src/hosted.js').read()
# A plain web page needs its own doctype, charset and viewport (claude.ai adds them for artifacts).
SKEL='<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
open('index.html','w').write(SKEL+head+css+"\n"+body+'<script id="scn" type="application/json">'+s+'</script>\n<script>\n'+js+'</script>\n')
# explorer page
t=open('src/timeline.html').read()
ex={k:d.get(k) for k in ("milestones","facts","sources","start","deadline")}
open('timeline.html','w').write(SKEL+t.replace('__DATA__',json.dumps(ex,ensure_ascii=False).replace('</','<\\/')).replace('__GAME__',"index.html").replace('target="_blank" rel="noopener">Play the race','>Play the race'))
print(len(open('index.html').read()))
