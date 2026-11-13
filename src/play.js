/* ---------- site map ---------- */
function siteMap(){
  const t=x=>has(x),p=[];
  p.push('<rect width="240" height="170" fill="#4b4a46"/><path d="M95 62 Q150 70 205 104 L198 122 Q150 96 100 92Z" fill="#8f8b80"/>');
  p.push('<circle cx="62" cy="92" r="44" fill="#07080b"/><circle cx="205" cy="150" r="30" fill="#07080b"/><circle cx="170" cy="28" r="16" fill="#0d0e12"/>');
  p.push('<text x="62" y="94" text-anchor="middle" font-size="8" fill="#7fc8e8">Shackleton</text><text x="62" y="104" text-anchor="middle" font-size="6" fill="#7fc8e8">permanent shadow, ice</text><text x="205" y="153" text-anchor="middle" font-size="6" fill="#7fc8e8">de Gerlache</text>');
  if(t("mobility")||t("mapping"))p.push('<rect x="112" y="60" width="7" height="7" fill="#d9d9de"/><path d="M116 67 Q104 80 96 88" stroke="#c9c4b8" stroke-dasharray="2 2" fill="none"/><text x="122" y="59" font-size="6" fill="#c9c4b8">scout</text>');
  if(t("haul"))p.push('<path d="M120 70 Q140 78 150 92" stroke="#c9c4b8" stroke-dasharray="1 2" fill="none"/><rect x="128" y="72" width="6" height="4" fill="#f2b84b"/>');
  if(t("site"))p.push('<path d="M150 86 l2 5 5 0 -4 3 2 5 -5 -3 -5 3 2 -5 -4 -3 5 0z" fill="none" stroke="#f2b84b"/>');
  if(t("power"))p.push('<rect x="139" y="74" width="2" height="12" fill="#7fc8e8"/><rect x="136" y="72" width="8" height="5" fill="#7fc8e8"/>');
  if(t("foundation"))p.push('<rect x="143" y="98" width="14" height="9" fill="none" stroke="#c9c4b8"/>');
  if(t("road"))p.push('<path d="M157 103 L176 110" stroke="#2c2b29" stroke-width="4"/>');
  if(t("pad"))p.push('<circle cx="184" cy="113" r="9" fill="#2c2b29" stroke="#f2b84b"/>');
  if(t("reactor"))p.push('<circle cx="184" cy="113" r="4" fill="#fff"/>');
  if(t("placed"))p.push('<rect x="144" y="99" width="12" height="7" rx="3" fill="#e4e4e8"/>');
  if(t("powered"))p.push('<path d="M150 106 L128 128" stroke="#f2b84b"/><rect x="122" y="126" width="7" height="7" fill="#9ab"/><text x="118" y="141" font-size="6" fill="#c9c4b8">reactor</text>');
  if(t("shielded"))p.push('<ellipse cx="150" cy="102" rx="11" ry="8" fill="#7d796f" stroke="#c9c4b8"/>');
  if(t("crew"))p.push('<circle cx="160" cy="100" r="1.5" fill="#fff"/><circle cx="164" cy="102" r="1.5" fill="#fff"/><circle cx="168" cy="105" r="1.5" fill="#fff"/><circle cx="172" cy="107" r="1.5" fill="#fff"/>');
  p.push('<text x="4" y="166" font-size="6" fill="#8b8f99">Schematic, not to scale</text>');
  const d=h("div",{});d.innerHTML='<svg class="map" viewBox="0 0 240 170" role="img" aria-label="Map of the base site at the lunar south pole" font-family="IBM Plex Mono,monospace">'+p.join("")+"</svg>";return d;
}

/* ---------- play ---------- */
const pl=n=>n+(n===1?" month":" months");
function carried(){return G.sel.items||[]}
function banner(main){if(testing)main.append(h("div",{class:"card note"},"You are playtesting your draft. ",h("button",{class:"btn ghost small",onclick:()=>{testing=false;BASE=LIVE;toStart();show("edit")}},"Back to editor")))}
function startView(){
  const main=$("main");main.textContent="";banner(main);
  main.append(screenEl("orbit",SCN.title||"Moon Base Race"));
  const picks=G.picks,box=h("div",{class:"opts"});
  (BASE.whatifs||[]).forEach(w=>box.append(h("button",{class:"opt","aria-pressed":picks.includes(w.id)?"true":"false",onclick:()=>{const p=picks.includes(w.id)?picks.filter(x=>x!==w.id):picks.concat(w.id);newGame(p,"start");render()}},h("span",{class:"box"}),h("span",{},h("strong",{text:w.label}),h("small",{text:w.desc||""})))));
  main.append(h("div",{},h("div",{class:"step",text:"Mission briefing"}),h("h2",{text:"Build the Moon Base before "+dateAt(totalMonths())}),
    h("p",{text:"You run NASA's Moon Base program from "+dateAt(0)+". Each stage is a decision. Every decision costs time and money, and some carry a chance of a mishap. Land the first crew in a powered, shielded habitat before "+((SCN.rival&&SCN.rival.name)||"your rival")+" completes its station, and stay inside the budget. NASA announced "+fm(SCN.budgetM||0)+" over "+(SCN.budgetYears||7)+" years, so "+fm(Math.round(yearly()))+" is released each year and you can never spend more than has been released."}),
    h("h3",{text:"As published, or what if?"}),h("p",{class:"note",text:"Leave these off to play NASA's plan as published. Turn any on to see the knock-on effect."}),box,
    h("div",{class:"row"},h("button",{class:"btn",onclick:()=>{sfx.go();G.phase="brief";render()}},picks.length?"Start the what-if run":"Start as published"))));
}
function stageView(){
  const st=SCN.stages[G.i],main=$("main");main.textContent="";banner(main);
  const left=h("div",{});
  main.append(screenEl(st.scene||"lander",st.title,st.videoPrompt,st.media,st.still));
  say("b"+G.i+"-"+G.log.length,st.title+". "+(st.narration||""));
  left.append(h("div",{class:"step",text:"Stage "+(G.i+1)+" of "+SCN.stages.length}),h("h2",{text:st.title}),h("p",{text:st.narration||""}));
  if(G.i>0&&!nightSafe())left.append(h("p",{class:"note",style:"color:var(--sun)",text:SCN.night.text+" Work takes "+SCN.night.pct+"% longer until that changes."}));
  const go=h("button",{class:"btn",disabled:true,onclick:commit},"Commit decision");let need=0;
  const rk=o=>{const r=effRisk(o.risk||0);return r?h("small",{class:"r",text:Math.round(r*100)+"% chance of a mishap"}):null};
  if(st.type==="choice"){
    const box=h("div",{class:"opts"});
    st.options.forEach(o=>{const miss=(o.requires||[]).filter(t=>!has(t));
      box.append(h("button",{class:"opt radio","aria-pressed":G.sel.opt===o.id?"true":"false",disabled:miss.length>0,onclick:()=>{G.sel.opt=o.id;stageView()}},h("span",{class:"box"}),h("span",{},thumb(o),h("strong",{text:o.label}),h("small",{text:o.desc||""}),capKids(o),o.costM?h("small",{class:"m",text:fm(o.costM)+", "+pl(o.months||0)+"."}):null,rk(o),miss.length?h("small",{class:"m",text:"Needs a landed asset: "+miss.join(", ")}):null)))});
    const co=st.options.find(o=>o.id===G.sel.opt);need=co?co.costM||0:0;
    if(co&&co.lander)left.append(manifest({id:co.lander,label:co.label,shape:co.lander},[],"Crew of four"));
    left.append(h("h3",{text:"Choose one"}),box);go.disabled=!G.sel.opt;
  }else{
    const cb=h("div",{class:"opts"});
    st.carriers.forEach(o=>cb.append(h("button",{class:"opt radio","aria-pressed":G.sel.car===o.id?"true":"false",onclick:()=>{G.sel.car=o.id;stageView()}},h("span",{class:"box"}),h("span",{},thumb(o),h("strong",{text:o.label}),h("small",{text:o.desc||""}),capKids(o),h("small",{class:"m",text:o.capKg.toLocaleString()+" kg payload, "+o.months+" months, "+fm(o.costM||0)+"."+availTxt(o)}),rk(o)))));
    const car=st.carriers.find(c=>c.id===G.sel.car),sel=carried(),its=st.items.filter(i=>sel.includes(i.id)),kg=its.reduce((a,i)=>a+i.kg,0),dev=its.filter(devDue).reduce((a,i)=>a+(i.devCostM||0),0),devMo=Math.max(0,...its.filter(devDue).map(i=>(i.devMonths||0)-G.months)),cost=(car?car.costM||0:0)+its.reduce((a,i)=>a+(i.costM||0),0)+dev,lr=car?effRisk((car.risk||0)+its.reduce((a,i)=>a+(i.risk||0),0)):0;
    const ib=h("div",{class:"opts"});
    st.items.forEach(o=>ib.append(h("button",{class:"opt","aria-pressed":sel.includes(o.id)?"true":"false",onclick:()=>{G.sel.items=sel.includes(o.id)?sel.filter(x=>x!==o.id):sel.concat(o.id);stageView()}},h("span",{class:"box"}),h("span",{},thumb(o),h("strong",{},o.label,o.class?h("span",{class:"cls",text:o.class}):null,o.niac?h("span",{class:"cls niac",text:"NIAC"}):null),h("small",{text:o.desc||""}),capKids(o),h("small",{class:"m",text:o.kg.toLocaleString()+" kg, "+fm(o.costM||0)+"."+availTxt(o)})))));
    const over=car&&kg>car.capKg,got=new Set(its.flatMap(i=>i.tags||[]));
    need=cost;
    left.append(h("h3",{text:"Delivery"}),cb,manifest(car,its),h("h3",{text:"Payloads"}),
      h("div",{class:"mono",text:"Loaded "+kg.toLocaleString()+" kg"+(car?" of "+car.capKg.toLocaleString()+" kg":"")+(over?" (over the limit)":"")+". This delivery costs "+fm(cost)+(dev?", including "+fm(dev)+" of development":"")+"."+(devMo?" Development finishes "+dateAt(G.months+devMo)+".":"")+(lr?" Mishap chance "+Math.round(lr*100)+"%.":"")}),
      h("div",{class:"meter"+(over?" over":"")},h("i",{style:"width:"+(car?Math.min(100,kg/car.capKg*100):0)+"%"})),
      (st.needs||[]).length?h("div",{class:"chips"},st.needs.map(n=>h("span",{class:"chip"+(got.has(n.tag)?" on":""),text:n.label}))):null,
      h("div",{style:"height:8px"}),ib);
    go.disabled=!car||over||!sel.length;
  }
  const short=need>funds();if(short)go.disabled=true;
  left.append(h("div",{class:"row"},go,short?fundsHelp(need):null));
  main.append(h("div",{class:"cols"},left,sidebar()));
}
function fundsHelp(need){
  const w=12-(G.months%12);
  return h("span",{class:"row",style:"margin-top:0"},h("span",{class:"note",style:"color:var(--halt)",text:"This costs "+fm(need)+" and only "+fm(funds())+" has been released."}),
    moreComing()?h("button",{class:"btn ghost small",onclick:()=>{G.months+=w;G.log.push(["Waited for the next yearly funding","+"+w+" mo","$0M"]);if(G.months>=totalMonths())G.phase="lost";render()}},"Wait "+pl(w)+" for the next "+fm(Math.round(yearly()))):
    h("button",{class:"btn ghost small",onclick:()=>{G.broke=true;G.phase="lost";render()}},"The budget is spent: end the program"));
}
function landerSvg(shape){
  const leg='stroke="#999" stroke-width="3" fill="none"';
  if(shape==="starship")return '<path d="M38 132 L38 40 Q50 4 62 40 L62 132Z" fill="#d9d9de"/><rect x="46" y="62" width="8" height="10" fill="#222"/><rect x="62" y="96" width="5" height="36" fill="#999"/><path d="M38 124 L26 140 M62 124 L74 140" '+leg+'/>';
  if(shape==="mk2")return '<circle cx="50" cy="52" r="20" fill="#d9d9de"/><rect x="32" y="70" width="36" height="48" fill="#c9d2dc"/><rect x="42" y="98" width="16" height="20" fill="#222"/><path d="M32 112 L16 140 M68 112 L84 140" '+leg+'/>';
  if(shape==="both")return '<g transform="translate(-20 0)">'+landerSvg("starship")+'</g><g transform="translate(34 30) scale(.75)">'+landerSvg("mk2")+'</g>';
  if(shape==="mk1")return '<rect x="26" y="70" width="48" height="50" rx="4" fill="#d9d9de"/><rect x="22" y="62" width="56" height="8" fill="#b08a3a"/><path d="M28 114 L12 140 M72 114 L88 140" '+leg+'/>';
  if(shape==="mk1x2")return '<g transform="translate(-16 14) scale(.8)">'+landerSvg("mk1")+'</g><g transform="translate(34 14) scale(.8)">'+landerSvg("mk1")+'</g>';
  return '<rect x="30" y="92" width="40" height="24" fill="#b08a3a"/><rect x="24" y="86" width="52" height="6" fill="#2c3e66"/><path d="M32 112 L18 140 M68 112 L82 140" '+leg+'/>';
}
function manifest(car,its,extra){
  const box=h("div",{class:"card mani"});
  if(!car){box.append(h("p",{class:"note",style:"margin:0",text:"Choose a lander below to start loading it."}));return box}
  const shape=car.shape||(/both/.test(car.id)?"both":/starship/.test(car.id)?"starship":/mk2/.test(car.id)?"mk2":/mk1x2/.test(car.id)?"mk1x2":/mk1/.test(car.id)?"mk1":"small");
  const kg=its.reduce((a,i)=>a+i.kg,0),cap=car.capKg||0,cols=["#f2b84b","#7fc8e8","#6fd08c","#c9a0e8","#e88f7f","#9ab"];
  const pic=h("div",{class:"pic"});pic.innerHTML='<svg viewBox="0 0 100 146" role="img" aria-label="'+shape+' lander"><ellipse cx="50" cy="141" rx="46" ry="4" fill="#2c2b29"/>'+landerSvg(shape)+"</svg>";
  const bar=h("div",{class:"bay"+(cap&&kg>cap?" over":"")});
  its.forEach((i,n)=>bar.append(h("i",{style:"width:"+(cap?Math.min(100,i.kg/Math.max(cap,kg)*100):0)+"%;background:"+cols[n%cols.length],title:i.label})));
  box.append(pic,h("div",{style:"min-width:0;flex:1"},h("div",{class:"step",text:"Now loading"}),h("strong",{style:"color:#fff",text:car.label}),
    h("div",{class:"note",text:"Destination: "+(G.site||"lunar south pole, base site not chosen yet")}),
    cap?bar:null,cap?h("div",{class:"mono",text:kg.toLocaleString()+" of "+cap.toLocaleString()+" kg, "+(cap-kg>=0?(cap-kg).toLocaleString()+" kg free":(kg-cap).toLocaleString()+" kg over")}):null,
    its.length?h("ul",{class:"load"},its.map((i,n)=>h("li",{},h("span",{class:"sw",style:"background:"+cols[n%cols.length]}),i.label+", "+i.kg.toLocaleString()+" kg"))):h("div",{class:"note",text:extra||"Nothing loaded yet."})));
  return box;
}
function sidebar(){
  const left=funds();
  return h("aside",{},h("h3",{style:"margin-top:0",text:"Site map"}),siteMap(),
    h("h3",{text:"Status"}),h("div",{class:"stat"},h("span",{class:"chip on",text:fm(left)+" on hand"}),h("span",{class:"chip",text:fm(G.spent)+" spent of "+fm(SCN.budgetM||0)}),SCN.night?h("span",{class:"chip"+(nightSafe()?" on":""),text:nightSafe()?"Powered through the night":"Dormant at night"}):null,G.wear?h("span",{class:"chip",text:"Improvised repairs: +"+G.wear+" mo per stage"}):null,h("span",{class:"chip"+(qScore()?" on":""),text:qTxt()}),G.speed?h("span",{class:"chip on",text:"Work "+Math.abs(speedPct())+"% "+(G.speed<0?"faster":"slower")}):null,G.rel?h("span",{class:"chip on",text:"Mishap chance "+(G.rel<0?"down ":"up ")+pts(Math.min(10,Math.round(Math.abs(G.rel)*100)))}):null),
    h("h3",{text:"Landed assets"}),G.assets.length?h("ul",{},G.assets.map(a=>h("li",{},h("span",{text:a})))):h("p",{class:"note",text:"Nothing on the surface yet."}),
    h("h3",{text:"Mission log"}),G.log.length?h("ul",{},G.log.map(l=>h("li",{},h("span",{text:l[0]}),h("span",{text:l[1]+(l[2]?" · "+l[2]:"")})))):h("p",{class:"note",text:"Each decision adds its lead time and cost."}));
}
function commit(){
  const st=SCN.stages[G.i];let ok=true,soft=false,months=0,cost=0,text="",sc=null,grants=[],assets=[],risk=0,dev=0,gain=[],art=null;const notes=[];
  if(st.type==="choice"){
    const o=st.options.find(x=>x.id===G.sel.opt);ok=o.outcome!=="fail";soft=o.outcome==="setback";months=o.months||0;
    for(const m of o.modifiers||[])if(has(m.has))months+=m.months;months=Math.max(1,months);
    text=o.resultText||(ok?"Done.":"That did not work.");sc=o.scene;art=o.art;grants=ok?o.grants||[]:[];if(ok&&grants.includes("site"))G.site=o.label;cost=o.costM||0;risk=o.risk||0;if(ok)gain=[o];
  }else{
    const car=st.carriers.find(c=>c.id===G.sel.car),its=st.items.filter(i=>carried().includes(i.id));
    const bad=its.find(i=>i.outcome==="fail"),tags=new Set(its.flatMap(i=>i.tags||[])),miss=(st.needs||[]).filter(n=>!tags.has(n.tag));
    const dv=its.filter(devDue),devMo=Math.max(0,...dv.map(i=>(i.devMonths||0)-G.months));dev=dv.reduce((a,i)=>a+(i.devCostM||0),0);cost=(car.costM||0)+its.reduce((a,i)=>a+(i.costM||0),0)+dev;risk=(car.risk||0)+its.reduce((a,i)=>a+(i.risk||0),0);if(dv.length){G.dev.push(...dv.map(i=>i.id));notes.push("Development paid for "+dv.map(i=>i.label).join(", ")+": "+fm(dev)+".")}
    if(bad){ok=false;months=bad.failMonths||st.failMonths||8;text=bad.failText||"The payload failed.";sc=bad.scene;art=bad.art}
    else if(miss.length){ok=false;months=st.failMonths||8;text="The delivery lands but the mission falls short. Nothing on board covers: "+miss.map(n=>n.label.toLowerCase()).join(", ")+". A second delivery has to be prepared."}
    else{const ready=Math.max(availMo(car),...its.map(availMo));months=Math.max(car.months,ready-G.months,devMo);text=(st.successText||"Delivered.");if(months>car.months)notes.push(devMo===months?"The delivery waited until "+dateAt(G.months+devMo)+" for a technology to finish development.":"The delivery waited for hardware that was not ready until "+dateAt(G.months+months)+".");gain=its;grants=[...tags].concat(car.grants||[]);assets=its.map(i=>i.label)}
  }
  if(SCN.monthsPct)months=Math.ceil(months*(1+SCN.monthsPct/100));
  if(G.speed){const b=months;months=Math.max(1,Math.ceil(months*(1+speedPct()/100)));if(b!==months)notes.push("Speed technologies on the surface: "+(months<b?"saved ":"added ")+pl(Math.abs(b-months))+".")}
  if(SCN.night&&G.i>0&&!nightSafe()){const e=Math.ceil(months*SCN.night.pct/100);months+=e;notes.push("Lunar night dormancy: +"+pl(e)+". Nuclear or stored power on the surface removes this.")}
  if(G.wear){months+=G.wear;notes.push("Improvised repairs slow the work: +"+pl(G.wear)+".")}
  const mishap=ok&&!soft&&risk>0&&roll()<effRisk(risk);
  G.months+=months;G.spent+=cost;G.log.push([st.title+(ok?(soft?" (setback)":""):" (failed)"),"+"+months+" mo",fm(cost)]);
  if(ok){for(const g of gain){if(g.fx){G.speed+=g.fx.monthsPct||0;G.rel+=g.fx.risk||0}G.quality+=g.quality||0}const fxn=gain.flatMap(g=>fxList(g).map(t=>g.label+": "+t.toLowerCase()+"."));notes.push(...fxn);for(const t of grants)if(!has(t))G.tags.push(t);G.assets.push(...assets);G.dates[st.id]=G.months}
  G.result={ok,soft,months,cost,text,notes,art:art||(ok&&!soft?{still:st.still,media:st.media}:(SCN.art&&SCN.art.fail)||null),scene:sc||(ok&&!soft&&!mishap?st.scene:"fail")};
  if(G.months>=totalMonths()){G.phase="lost";sfx.bad()}
  else if(mishap){G.rec={months,cost:cost-dev,kind:st.type};G.phase="recover";sfx.bad()}
  else{G.phase="result";ok&&!soft?sfx.go():sfx.bad()}
  render();
}
function recoverView(){
  const st=SCN.stages[G.i],r=G.rec,main=$("main");main.textContent="";banner(main);
  {const a=(SCN.art&&SCN.art.fail)||{};main.append(screenEl("fail","Mishap",null,a.media,a.still))}
  const A={label:"Fly a replacement",m:Math.ceil(r.months*0.6),c:Math.round(r.cost*0.6),desc:"Rebuild what was lost and send it again. Slow and expensive, and the base ends up as planned."},
        B={label:"Improvise on site",m:Math.ceil(r.months*0.25)+1,c:Math.round(r.cost*0.1),wear:1,desc:"Repair and work around the damage with what is already on the surface. Faster and cheaper now, but every later stage takes 1 month longer."};
  const txt=r.kind==="loadout"?"The lander comes down hard and part of the cargo is damaged.":"The operation goes wrong partway through and hardware is damaged.";
  say("m"+G.log.length,"Mishap. "+txt);
  const pick=o=>{G.months+=o.m;G.spent+=o.c;if(o.wear)G.wear+=o.wear;G.log.push(["Recovery: "+o.label.toLowerCase(),"+"+o.m+" mo",fm(o.c)]);G.result.months+=o.m;G.result.cost+=o.c;G.result.notes.push("Mishap recovered by choosing to "+o.label.toLowerCase()+": +"+pl(o.m)+", "+fm(o.c)+".");G.dates[st.id]=G.months;G.rec=null;G.result.scene=st.scene;G.result.art={still:st.still,media:st.media};G.phase=G.months>=totalMonths()?"lost":"result";sfx.go();render()};
  main.append(h("div",{class:"cols"},h("div",{class:"res soft"},h("div",{class:"big",text:"Mishap"}),h("h2",{text:st.title}),h("p",{text:txt+" Choose how to recover."}),
    h("div",{class:"opts"},[A,B].map(o=>h("button",{class:"opt radio",disabled:o.c>funds(),onclick:()=>pick(o)},h("span",{class:"box"}),h("span",{},h("strong",{text:o.label}),h("small",{text:o.desc}),h("small",{class:"m",text:"+"+pl(o.m)+", "+fm(o.c)}))))),B.c>funds()?h("div",{class:"row"},fundsHelp(B.c)):null),sidebar()));
}
function resultView(){
  const st=SCN.stages[G.i],r=G.result,main=$("main");main.textContent="";banner(main);
  const last=G.i===SCN.stages.length-1,good=r.ok;
  main.append(screenEl(r.scene,r.ok?(r.soft?"Setback":"Success"):"Failure",null,r.art&&r.art.media,r.art&&r.art.still));
  say("r"+G.log.length,(r.ok?(r.soft?"Setback. ":"Stage complete. "):"Stage failed. ")+r.text);
  const left=h("div",{class:"res"+(r.ok?(r.soft?" soft":""):" bad")},h("div",{class:"big",text:r.ok?(r.soft?"Setback, then complete":"Stage complete"):"Stage failed"}),h("h2",{text:st.title}),h("p",{text:r.text}),
    r.notes.length?h("ul",{class:"notes"},r.notes.map(n=>h("li",{text:n}))):null,
    h("p",{class:"mono",text:"Time added: "+pl(r.months)+". Cost: "+fm(r.cost)+". Mission date is now "+dateAt(G.months)+". "+(totalMonths()-G.months)+" months remain before the deadline."}),
    good&&st.insight?h("div",{class:"insight"},h("h3",{text:"What NASA is actually doing"}),h("p",{style:"margin:0",text:st.insight.text+" "},st.insight.url?h("a",{href:st.insight.url,target:"_blank",rel:"noopener",text:"Source"}):null)):null,
    h("div",{class:"row"},h("button",{class:"btn",onclick:()=>{G.sel={};G.result=null;if(good){if(last){G.phase="won";sfx.win()}else{G.i++;G.phase="brief"}}else G.phase="brief";render()}},good?(last?"Enter the base":"Next stage"):"Try this stage again")));
  main.append(h("div",{class:"cols"},left,sidebar()));
}
function summaryText(won){
  const w=(BASE.whatifs||[]).filter(x=>G.picks.includes(x.id)).map(x=>x.label);
  return "Moon Base Race: "+(won?"crew moved in "+dateAt(G.months)+", "+(totalMonths()-G.months)+" months ahead of "+SCN.rival.name:"lost the race, "+SCN.rival.name+" finished first in "+dateAt(totalMonths()))+". Spent "+fm(G.spent)+" of "+fm(SCN.budgetM||0)+". "+qTxt()+". "+(w.length?"What-ifs: "+w.join("; ")+". ":"Played as published. ")+"Stages: "+SCN.stages.map(s=>s.title+" "+(G.dates[s.id]!=null?dateAt(G.dates[s.id]):"not reached")).join(", ")+".";
}
function resultCard(won){
  const c=document.createElement("canvas");c.width=1200;c.height=630;const x=c.getContext("2d");
  x.fillStyle="#0b0d12";x.fillRect(0,0,1200,630);x.fillStyle=won?"#6fd08c":"#ff5a4d";x.fillRect(0,0,12,630);
  x.fillStyle="#f2b84b";x.font="600 22px monospace";x.fillText("MOON BASE RACE",50,60);
  x.fillStyle="#fff";x.font="700 50px sans-serif";x.fillText(won?"Crew moved in "+dateAt(G.months):"Lost the race in "+dateAt(totalMonths()),50,125);
  x.fillStyle="#c9c4b8";x.font="24px sans-serif";x.fillText((won?(totalMonths()-G.months)+" months ahead of "+SCN.rival.name+".  ":"")+"Spent "+fm(G.spent)+" of "+fm(SCN.budgetM||0)+".  "+qTxt()+".  "+(G.picks.length?G.picks.length+" what-if"+(G.picks.length>1?"s":"")+" on.":"As published."),50,170);
  x.font="20px monospace";SCN.stages.forEach((s,i)=>{const y=225+i*36;x.fillStyle="#8b8f99";x.fillText(String(i+1).padStart(2,"0"),50,y);x.fillStyle="#c9c4b8";x.font="18px monospace";x.fillText(s.title,95,y);x.font="20px monospace";x.fillStyle=G.dates[s.id]!=null?"#f2b84b":"#ff5a4d";x.fillText(G.dates[s.id]!=null?dateAt(G.dates[s.id]):"not reached",540,y);x.fillStyle="#7fc8e8";x.font="14px monospace";const rl=s.real||"";x.fillText(rl.length>56?rl.slice(0,55)+"…":rl,690,y);x.font="20px monospace"});
  x.fillStyle="#8b8f99";x.font="15px monospace";x.fillText("your date",540,198);x.fillText("NASA's published plan",690,198);
  return c;
}
function endView(won){
  const main=$("main");main.textContent="";banner(main);
  main.append(screenEl(won?"win":"flag",won?"The first crew enters the Moon Base":dateAt(totalMonths())+": "+SCN.rival.name+"'s station is declared complete",null,((SCN.art||{})[won?"win":"loss"]||{}).media,((SCN.art||{})[won?"win":"loss"]||{}).still));
  say("e"+G.log.length,won?"The first crew enters the Moon Base. You win.":SCN.rival.name+"'s station is complete. You lose.");
  const msg=h("div",{class:"msg"}),sum=summaryText(won);
  const copy=h("button",{class:"btn ghost",onclick:async()=>{try{await navigator.clipboard.writeText(sum);msg.textContent="Summary copied."}catch(e){msg.textContent="";msg.append(h("textarea",{readonly:true,style:"min-height:90px"},sum))}}},"Copy summary");
  const save=h("button",{class:"btn ghost",hidden:!downloads,onclick:()=>{resultCard(won).toBlob(async b=>{try{await downloads.save({filename:"moon-base-race-result.png",data:b});msg.textContent="Result card saved."}catch(e){msg.textContent=e&&e.code==="declined"?"Save cancelled.":"The image could not be saved here. Use Copy summary instead."}},"image/png")}},"Save result card");
  main.append(h("div",{class:"res"+(won?"":" bad")},h("div",{class:"big",text:won?"You win":"You lose"}),
    h("p",{text:won?"Four astronauts walk from the pad down the sintered road, cycle the airlock and step into a powered, shielded, stocked habitat in "+dateAt(G.months)+", "+(totalMonths()-G.months)+" months ahead of "+SCN.rival.name+"'s published date. You spent "+fm(G.spent)+" of "+fm(SCN.budgetM||0)+".":(G.broke?"The program ran out of money before the base was ready for crew. ":"The clock reached "+dateAt(totalMonths())+" before your base was ready for crew. ")+"A Chinese flag passes over the lunar south pole. You had spent "+fm(G.spent)+"."}),
    h("h3",{text:"Base quality"}),h("p",{},h("strong",{style:"color:#fff",text:qScore()+" points"+(qGrade()?": "+qGrade():"")}),". Quality counts what the base can do once the crew arrives: local oxygen, water and power, room to live, protection, and spare landing pads."+(G.wear?" Improvised repairs cost "+(((SCN.quality&&SCN.quality.wearPenalty)||0)*G.wear)+" points.":"")+" Grades: "+((SCN.quality&&SCN.quality.grades)||[]).map(g=>g[1]+" from "+g[0]).join(", ")+"."),
    h("h3",{text:"Debrief: your run against the real plan"}),
    h("div",{class:"tw"},h("table",{},h("thead",{},h("tr",{},["Stage","Your date","NASA's published plan"].map(t=>h("th",{text:t})))),h("tbody",{},SCN.stages.map(s=>h("tr",{},h("td",{text:s.title}),h("td",{class:"n",text:G.dates[s.id]!=null?dateAt(G.dates[s.id]):"Not reached"}),h("td",{text:s.real||""})))))),
    h("p",{class:"note",style:"margin-top:8px",text:"NASA's Phase Three, living and working on the Moon, starts in 2032. "+(won?(G.months<=moOf({y:2032,m:1})?"You beat that date.":"You moved in "+dur(G.months-moOf({y:2032,m:1}))+" after it opens."):"")}),
    h("h3",{text:"Mission log"}),h("div",{class:"card",style:"max-width:560px"},h("ul",{style:"list-style:none;margin:0;padding:0"},G.log.map(l=>h("li",{style:"display:flex;justify-content:space-between;gap:10px"},h("span",{text:l[0]}),h("span",{class:"mono",style:"white-space:nowrap",text:l[1]+" · "+l[2]}))))),
    h("div",{class:"row"},h("button",{class:"btn",onclick:()=>{toStart();render()}},"Play again"),copy,save),msg));
}
