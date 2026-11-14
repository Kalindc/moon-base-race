/* ---------- back-planning: latest award dates (pure, also used by tools/analysis.js) ---------- */
const ymI=d=>d.y*12+d.m-1;
const ymS=i=>["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][((i%12)+12)%12]+" "+Math.floor(i/12);
const compMo=c=>ymI(c.to)-ymI(c.from);
function devStats(it){const v=it.comps.map(compMo).sort((a,b)=>a-b),n=v.length;return {min:v[0],med:n%2?v[(n-1)/2]:Math.round((v[n/2-1]+v[n/2])/2),max:v[n-1]}}
/* frame "date": everything works back from one completion date (target, a month index).
   frame "nasa": each item works back from NASA's own date for it; cargo and pads work back from the earliest of those.
   o.scale multiplies the estimated surface times, o.tail overrides the estimated shipping and integration time. */
function backPlan(bp,frame,target,o){
  o=o||{};const sc=o.scale||1,est=m=>Math.round(m*sc);
  const after=bp.after.reduce((a,x)=>a+est(x.months),0);
  const nasaDates=bp.items.filter(i=>i.nasa).map(i=>ymI(i.nasa));
  const cargoBy=frame==="nasa"?Math.min(...nasaDates):target-after;
  const now=ymI(bp.asOf);
  const rows=bp.items.map(it=>{
    let landBy=it.needBy==="pads"?cargoBy-est(it.buildMonths||0):(frame==="nasa"&&it.nasa?ymI(it.nasa):cargoBy);
    const tail=o.tail!=null&&it.tail?o.tail:(it.tail||0),d=devStats(it);
    const aw={fast:landBy-tail-d.min,med:landBy-tail-d.med,slow:landBy-tail-d.max};
    return {id:it.id,it,landBy,tail,dev:d,award:aw,margin:{fast:aw.fast-now,med:aw.med-now,slow:aw.slow-now}};
  });
  const first=rows.slice().sort((a,b)=>a.award.med-b.award.med)[0];
  return {frame,target,after,cargoBy,now,rows,first};
}
