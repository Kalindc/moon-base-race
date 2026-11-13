/* ---------- data and sources ---------- */
function dataView(){
  const main=$("main");main.textContent="";const S=LIVE;
  main.append(h("div",{},h("h2",{text:"Data and sources"}),h("p",{text:"Every number the game uses, as it stands in the live version. The timeline, contract values and mission details come from NASA's Moon Base pages and releases and from CBS, ABC and NBC coverage, linked below. Where a cost, mass or date has been published, the last column of each stage table says so and links the source. Rows marked Estimate are this game's working numbers, because nothing has been published. All mishap chances, failure penalties and the times for surface work are estimates. Each one can be corrected in the scene editor."}),
    EXPLORER?h("p",{},h("a",{href:EXPLORER,target:"_blank",rel:"noopener",text:"Open the timeline explorer"})," to filter and search the published timeline on its own page."):null));
  const lk=u=>u?h("a",{href:u,target:"_blank",rel:"noopener",text:"source"}):"";
  const tbl=(heads,rows)=>h("div",{class:"tw"},h("table",{},h("thead",{},h("tr",{},heads.map(x=>h("th",{text:x})))),h("tbody",{},rows.map(r=>h("tr",{},r.map((x,i)=>h("td",{class:i===0?"n":""},x&&x.nodeType?x:String(x==null?"":x))))))));
  if((S.milestones||[]).length)main.append(h("div",{},h("h3",{text:"Published timeline"}),tbl(["When","Who","Milestone","Source"],S.milestones.map(m=>[m.when,m.who||"",m.text,lk(m.url)]))));
  if((S.facts||[]).length)main.append(h("div",{},h("h3",{text:"Program facts"}),tbl(["Item","Published figure","Source"],S.facts.map(f=>[f[0],f[1],lk(f[2])]))));
  const rules=[["Budget cap",fm(S.budgetM||0)+" over "+(S.budgetYears||7)+" years, as NASA announced. The game releases "+fm(Math.round((S.budgetM||0)/(S.budgetYears||7)))+" each year, and unspent money carries over. You cannot commit a decision that costs more than the released funds on hand. You can wait for the next yearly release."]];
  if(S.night)rules.push(["Lunar night","Work takes "+S.night.pct+"% longer until the base holds one of: "+S.night.tags.join(", ")+"."]);
  rules.push(["Mishaps","A risky choice that goes wrong offers two recoveries: fly a replacement (60% more time and cost) or improvise (about 25% more time, 10% more cost, and 1 extra month on every later stage)."]);
  rules.push(["Technologies","Some payloads change the rest of the run once they land: speed technologies shorten every later stage (capped at 40%), reliability instruments lower every later mishap chance (by 10 points at most, and never below 2%), and quality additions raise the base quality score."]);
  rules.push(["Development","A payload still in development adds its development cost to the delivery, charged once, and the delivery cannot land until development is done. Development is counted from the program start. Unproven hardware also adds to that delivery's mishap chance. Development costs and times are this game's estimates, not NASA figures."]);
  if(S.quality)rules.push(["Base quality","Points from payloads and choices, minus "+(S.quality.wearPenalty||0)+" for each improvised repair. Grades: "+S.quality.grades.map(g=>g[1]+" from "+g[0]).join(", ")+"."]);
  for(const w of S.whatifs||[])rules.push(["What if: "+w.label,w.desc||""]);
  main.append(h("div",{},h("h3",{text:"Game rules"}),tbl(["Rule","How it works"],rules)));
  const pc=r=>r?Math.round(r*100)+"%":"";
  const fxs=o=>{const a=[],f=o.fx||{};if(f.monthsPct)a.push("later stages "+f.monthsPct+"%");if(f.risk)a.push("mishap chance "+Math.round(f.risk*100)+" points");if(o.quality)a.push("quality +"+o.quality);return a.join(", ")};
  const bs=o=>o.src?h("span",{},o.src.text+" ",lk(o.src.url)):"Estimate";
  const cb=o=>[(o.caps||[]).join("; "),o.benefit||"",fxs(o)?"Effect: "+fxs(o)+".":""].filter(Boolean).join(" ");
  const nia=S.stages.flatMap(st=>(st.items||[]).filter(i=>i.devCostM||i.devMonths));
  if(nia.length)main.append(h("div",{},h("h3",{text:"Technologies in development"}),h("p",{class:"note",text:"Concepts funded by NASA Innovative Advanced Concepts (NIAC). The concept, lead and year come from NASA's NIAC pages. Development cost and time are this game's estimates."}),tbl(["Concept","NIAC lead and year","Development cost","Development time","Effect in the game","Source"],nia.map(i=>[i.label,i.niac?i.niac.pi+", "+i.niac.year:"",fm(i.devCostM||0),(i.devMonths||0)+" mo",fxs(i),lk(i.niac&&i.niac.url)]))));
  S.stages.forEach((st,n)=>{
    const rows=[];
    if(st.type==="loadout"){st.carriers.forEach(c=>rows.push(["Delivery",c.label,c.capKg.toLocaleString()+" kg",c.months+" mo",fm(c.costM||0),pc(c.risk),availTxt(c).trim(),cb(c),bs(c)]));st.items.forEach(i=>rows.push([i.outcome==="fail"?"Payload (always fails)":i.class?"Payload: "+i.class.toLowerCase():"Payload",i.label,i.kg.toLocaleString()+" kg","",fm(i.costM||0),"",(i.tags||[]).join(", ")+(i.availableAt?". "+availTxt(i).trim():""),cb(i),bs(i)]))}
    else st.options.forEach(o=>rows.push([o.outcome==="ok"?"Works":o.outcome==="setback"?"Setback":"Fails",o.label,"",(o.months||0)+" mo",fm(o.costM||0),pc(o.risk),(o.requires?"needs "+o.requires.join(", "):""),cb(o),bs(o)]));
    main.append(h("div",{},h("h3",{text:"Stage "+(n+1)+": "+st.title}),tbl(["Kind","Name","Mass","Time","Cost","Mishap","Provides or needs","Capabilities and benefit","Basis for the numbers"],rows),st.insight?h("p",{class:"note",style:"margin-top:6px"},st.insight.text+" ",lk(st.insight.url)):null));
  });
  main.append(h("div",{},h("h3",{text:"Sources"}),h("ul",{},(S.sources||[]).map(s=>h("li",{},h("a",{href:s.url,target:"_blank",rel:"noopener",text:s.label}))))));
}
