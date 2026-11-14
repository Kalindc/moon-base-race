/* ---------- the case: awarded-only core first, then the clock, sensitivity, adversary and China ---------- */
let caseFrame="nasa";
function caseView(){
  const main=$("main");main.textContent="";
  const S=BASE,A=S.awarded,BP=S.backplan,AN=typeof ANALYSIS!=="undefined"?ANALYSIS:null,C=S.china;
  const link=(u,t)=>u?h("a",{href:u,target:"_blank",rel:"noopener",text:t||"Source"}):null;
  const tbl=(heads,rows)=>h("div",{class:"tw"},h("table",{},h("thead",{},h("tr",{},heads.map(x=>h("th",{text:x})))),h("tbody",{},rows.map(r=>h("tr",{},r.map((x,i)=>h("td",{class:i===0?"n":""},x&&x.nodeType?x:String(x==null?"":x))))))));
  const sec=(n,title,...kids)=>h("section",{class:"case"},h("div",{class:"step",text:n}),h("h2",{text:title}),...kids);
  const goPlay=fn=>()=>{fn();sfx.go();tab="play";render();scrollTo(0,0)};
  const fmB=m=>"$"+(m/1000).toFixed(1)+"B";
  main.append(h("p",{class:"note",style:"margin-top:0",text:"This page separates what is fact from what is assumed. Layer 1 uses only signed contracts. Every later layer is labelled with what it assumes."}));

  /* 1. under contract */
  if(A){const Ms=A.missions,tot=Ms.reduce((a,m)=>a+m.costM,0),last=Ms[Ms.length-1],gap=Object.fromEntries((A.gaps||[]).map(g=>[g.stage,g.text])),cov=new Set(Ms.map(m=>m.covers));
    const missing=S.stages.filter(s=>gap[s.id]).map(s=>s.title.toLowerCase());
    main.append(sec("Layer 1 · fact: signed contracts only","What is under contract, and what is not",
      h("p",{class:"claim"},"Under contract: "+Ms.length+" missions worth "+fmB(tot)+", the last flying "+last.when+". They scout the south pole, test the site and land two short crew visits. ",h("strong",{text:"Not under contract, any of the steps that build the base itself: "+missing.join("; ")+"."})),
      h("p",{text:"Every row below is a published award at its awarded value and latest published date, so anyone can check it. No estimate is used in this layer."}),
      tbl(["Stage","Under contract?","What exists"],S.stages.map(s=>{const ms=Ms.filter(m=>m.covers===s.id);return [s.title,gap[s.id]?"No":cov.has(s.id)?(s.id==="crew"?"Visits only":"Yes"):"No",gap[s.id]||(ms.length?ms.map(m=>m.name).join("; "):"Nothing awarded")]})),
      h("h3",{text:"The awarded missions"}),
      tbl(["When","Mission","Contractor","Value",""],Ms.map(m=>[m.when,m.name,m.who,fm(m.costM),link(m.url)])),
      h("p",{class:"note",text:A.note||""}),
      h("div",{class:"row"},h("button",{class:"btn",onclick:goPlay(()=>{newGame([],"awd",G.dl);G.ai=-1})},"Watch it fly, mission by mission"))))}

  /* 2. the clock */
  if(BP){const pub=dlIdx(S),T=G.dl==null?pub:G.dl,r=backPlan(BP,caseFrame==="nasa"?"nasa":"date",T),f=r.first;
    const left=m=>m<0?"passed "+(-m)+" months ago":"is "+m+" months away, counting from "+ymS(r.now),short=m=>m<0?"passed "+(-m)+" mo ago":m+" mo left";
    const nasaFirst=BP.items.filter(i=>i.nasa).sort((a,b)=>ymI(a.nasa)-ymI(b.nasa))[0];
    const frameBtn=(id,label)=>h("button",{class:"btn small"+(caseFrame===id?"":" ghost"),"aria-pressed":caseFrame===id?"true":"false",onclick:()=>{caseFrame=id;render()}},label);
    const target=caseFrame==="nasa"?"NASA's own date ("+((f.it.nasa||nasaFirst).label.replace(/^NASA: /,""))+")":ymS(T)+" ("+((S.rival&&S.rival.name)||"rival")+", assumed)";
    const bpA=AN&&AN.backplan&&AN.backplan[caseFrame==="nasa"?"nasa":"china"];
    main.append(sec("Layer 2 · published development times, labelled estimates for surface work","When the clock runs out",
      h("p",{text:BP.intro}),
      h("div",{class:"row",style:"margin:8px 0"},frameBtn("nasa","Against NASA's own dates"),frameBtn("china","Against China's announced date")),
      caseFrame==="china"?deadlineSlider(v=>{newGame(G.picks,G.phase==="start"?"start":G.phase,v===pub?null:v);if(G.phase!=="start")toStart();render()}):h("p",{class:"note",text:"NASA's dates: "+BP.items.filter(i=>i.nasa).map(i=>i.nasa.label).join("; ")+". Cargo landers and pads must be ready for the earliest of these."}),
      h("p",{class:"claim"},"Unless a contract for the ",h("strong",{text:f.it.label.toLowerCase()})," is signed by ",h("strong",{text:ymS(f.award.med)}),", the base misses "+target+", if it takes as long as the median comparable project. That date "+left(f.margin.med)+". Even at the pace of the fastest comparable, the award is needed by "+ymS(f.award.fast)+"."),
      tbl(["What is missing","Must land by","Development: fastest / median / slowest","Latest award: fastest / median / slowest","Median date"],r.rows.map(x=>[x.it.label,ymS(x.landBy),x.dev.min+" / "+x.dev.med+" / "+x.dev.max+" mo",ymS(x.award.fast)+" / "+ymS(x.award.med)+" / "+ymS(x.award.slow),short(x.margin.med)])),
      h("p",{class:"note",text:"Latest award = must-land-by date, minus shipping and integration ("+r.rows.map(x=>x.it.label.split(" ")[0]+" "+x.tail+" mo").join(", ")+", estimates), minus development time. Surface work after the cargo lands takes "+r.after+" months in total: "+BP.after.map(a=>a.label.toLowerCase()+" "+a.months).join(", ")+" (game estimates). "+BP.afterNote}),
      h("h3",{text:"Comparable projects behind each number"}),
      ...r.rows.map(x=>h("details",{},h("summary",{text:x.it.label+": "+x.it.comps.length+" comparables"}),h("p",{class:"note",text:x.it.status}),
        h("ul",{class:"notes"},x.it.comps.map(c=>h("li",{},h("strong",{text:c.name+": "+compMo(c)+" months"})," ("+c.kind+", "+ymS(ymI(c.from))+" to "+ymS(ymI(c.to))+"). "+c.what+" ",link(c.url)))))),
      h("p",{class:"note",text:"Planned and still-open entries have not flown, so their times are a floor: the real figure can only get longer."}),
      bpA?h("p",{class:"note",text:"How much the estimates move this: with surface work twice as fast the first award date is "+bpA.surfaceHalf.med+"; twice as slow, "+bpA.surfaceDouble.med+"; with no shipping time, "+bpA.tail0.med+"; with a year of it, "+bpA.tail12.med+"."}):null))}

  /* 3. sensitivity */
  if(AN&&AN.sensitivity){const Bl=AN.baseline,fl=AN.sensitivity.filter(s=>s.flips.length),top=AN.sensitivity.slice(0,12);
    main.append(sec("Layer 3 · every estimate pushed to the ends of a wide range","Which estimates flip the outcome",
      h("p",{text:"The game's playable layer uses estimates wherever no figure is published. Each group below was pushed to both ends of its range and replayed "+AN.games+" times per player against "+AN.deadline+". As published, a sensible player wins "+Bl.sensible+"% ("+Bl.play+"), an expert "+Bl.expert+"%, and a perfect run with no mishaps "+(Bl.best==="possible"?"finishes in time":"cannot finish")+"."}),
      h("p",{class:"claim"},fl.length?"Only "+fl.length+" of "+AN.sensitivity.length+" groups change the verdict: "+fl.map(s=>s.name+" ("+s.flips.join("; ")+")").join(". ")+". Every other estimate can be halved or doubled and the verdict stands.":"No single estimate changes the verdict across its range."),
      tbl(["Parameter","Range","Sensible player wins","Expert wins","Perfect run in time?"],top.map(s=>[s.name,s.lo+" to "+s.hi,s.low.sensible+"% to "+s.high.sensible+"%",s.low.expert+"% to "+s.high.expert+"%",(s.low.clean>=50?"yes":"no")+" / "+(s.high.clean>=50?"yes":"no")])),
      h("p",{class:"note",text:"The "+top.length+" groups with the largest swing are shown; the full table of "+AN.sensitivity.length+" is in tools/analysis-report.md. Layer 1 uses no estimates, so nothing here can change it. Generated "+AN.generated+"."})))}

  /* 4. adversary */
  if(AN&&AN.adversary&&S.adversary){const D=AN.adversary,mc=D.monteCarlo;
    main.append(sec("Layer 4 · an adversary tries to win","Awarded hardware plus the fewest new contracts",
      h("p",{text:S.adversary.desc+" "+(S.adversary.note||"")}),
      h("p",{class:"claim"},"Every one of "+D.plans.toLocaleString()+" complete plans was searched. The smallest needs ",h("strong",{text:D.additions+" new contracts"}),". With no mishaps the crew moves in "+D.finish+" for "+fmB(D.spent)+" in total; with mishaps on it wins "+mc.winRate+"% of "+mc.runs.toLocaleString()+" runs before "+D.deadline+" (median finish "+mc.median+")."),
      tbl(["Stage","New contracts","Done"],D.path.map(p=>[p.stage,p.label,p.date])),
      h("p",{class:"note",text:"The catch: this run trusts the announced ready dates (reactor 2030, habitat and pressurized rover 2032) and lets each contract be signed when its stage comes up. Layer 2 shows those ready dates already need contracts signed far earlier than that, and none has been. So the adversary's win is conditional on awards that do not yet exist."}),
      h("div",{class:"row"},h("button",{class:"btn",onclick:goPlay(()=>{newGame([],"brief",G.dl);startAdversary()})},"Try it yourself"))))}

  /* 5. China symmetry */
  if(C){const it=(BP&&BP.items.find(i=>i.id==="reactor")),dv=it?devStats(it):null,ilrs=ymI({y:2031,m:6});
    const chip=s=>h("span",{class:"chip st-"+s,text:({flown:"Flown",tested:"In hardware test",announced:"Announced only",slipped:"Slipped"})[s]||s});
    main.append(sec("Layer 5 · the same test applied to China","Does the race hold against China's best case?",
      h("p",{text:C.intro}),
      tbl(["Item","Status","When","What the record shows",""],C.record.map(x=>[x.name,chip(x.status),x.when,x.what,link(x.url)])),
      h("p",{text:C.backplan+(dv?" With the reactor comparables, a 2031 landing needed work to start by "+ymS(ilrs-6-dv.med)+" at the median pace, or "+ymS(ilrs-6-dv.min)+" at the fastest.":"")}),
      h("p",{class:"claim",text:C.verdict})))}

  /* budget */
  main.append(sec("Assumption","The budget",h("p",{},(S.budgetNote||"")+" ",link(S.budgetSource))));
}
