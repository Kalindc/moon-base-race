/* ---------- data and sources ---------- */
function dataView(){
  const main=$("main");main.textContent="";const S=LIVE;
  main.append(h("div",{},h("h2",{text:"Data and sources"}),h("p",{text:"Every number the game uses, as it stands in the live version. The timeline, contract values and mission details come from NASA's Moon Base pages and releases and from CBS, ABC and NBC coverage, linked below. Most payload masses, costs, mishap chances and lead times are working estimates, because NASA has not published them. Each one can be corrected in the scene editor."}),
    EXPLORER?h("p",{},h("a",{href:EXPLORER,target:"_blank",rel:"noopener",text:"Open the timeline explorer"})," to filter and search the published timeline on its own page."):null));
  const lk=u=>u?h("a",{href:u,target:"_blank",rel:"noopener",text:"source"}):"";
  const tbl=(heads,rows)=>h("div",{class:"tw"},h("table",{},h("thead",{},h("tr",{},heads.map(x=>h("th",{text:x})))),h("tbody",{},rows.map(r=>h("tr",{},r.map((x,i)=>h("td",{class:i===0?"n":""},x&&x.nodeType?x:String(x==null?"":x))))))));
  if((S.milestones||[]).length)main.append(h("div",{},h("h3",{text:"Published timeline"}),tbl(["When","Who","Milestone","Source"],S.milestones.map(m=>[m.when,m.who||"",m.text,lk(m.url)]))));
  if((S.facts||[]).length)main.append(h("div",{},h("h3",{text:"Program facts"}),tbl(["Item","Published figure","Source"],S.facts.map(f=>[f[0],f[1],lk(f[2])]))));
  const rules=[["Budget cap",fm(S.budgetM||0)+" over "+(S.budgetYears||7)+" years, as NASA announced. The game releases "+fm(Math.round((S.budgetM||0)/(S.budgetYears||7)))+" each year, and unspent money carries over. You cannot commit a decision that costs more than the released funds on hand. You can wait for the next yearly release."]];
  if(S.night)rules.push(["Lunar night","Work takes "+S.night.pct+"% longer until the base holds one of: "+S.night.tags.join(", ")+"."]);
  rules.push(["Mishaps","A risky choice that goes wrong offers two recoveries: fly a replacement (60% more time and cost) or improvise (about 25% more time, 10% more cost, and 1 extra month on every later stage)."]);
  for(const w of S.whatifs||[])rules.push(["What if: "+w.label,w.desc||""]);
  main.append(h("div",{},h("h3",{text:"Game rules"}),tbl(["Rule","How it works"],rules)));
  const pc=r=>r?Math.round(r*100)+"%":"";
  S.stages.forEach((st,n)=>{
    const rows=[];
    if(st.type==="loadout"){st.carriers.forEach(c=>rows.push(["Delivery",c.label,c.capKg.toLocaleString()+" kg",c.months+" mo",fm(c.costM||0),pc(c.risk),availTxt(c).trim()]));st.items.forEach(i=>rows.push([i.outcome==="fail"?"Payload (always fails)":"Payload",i.label,i.kg.toLocaleString()+" kg","",fm(i.costM||0),"",(i.tags||[]).join(", ")+(i.availableAt?". "+availTxt(i).trim():"")]))}
    else st.options.forEach(o=>rows.push([o.outcome==="ok"?"Works":o.outcome==="setback"?"Setback":"Fails",o.label,"",(o.months||0)+" mo",fm(o.costM||0),pc(o.risk),(o.requires?"needs "+o.requires.join(", "):"")]));
    main.append(h("div",{},h("h3",{text:"Stage "+(n+1)+": "+st.title}),tbl(["Kind","Name","Mass","Time","Cost","Mishap","Provides or needs"],rows),st.insight?h("p",{class:"note",style:"margin-top:6px"},st.insight.text+" ",lk(st.insight.url)):null));
  });
  main.append(h("div",{},h("h3",{text:"Sources"}),h("ul",{},(S.sources||[]).map(s=>h("li",{},h("a",{href:s.url,target:"_blank",rel:"noopener",text:s.label}))))));
}
