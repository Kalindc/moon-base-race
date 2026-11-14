#!/usr/bin/env node
/* Analysis for "The case" view of Moon Base Race.
   1. Sensitivity: runs tools/balance.js with every estimated parameter group pushed to the low and high end of a wide range,
      and reports which ones flip the outcome.
   2. Adversary: searches every plan that starts from the awarded hardware (June 2028) and adds the fewest new contracts,
      then plays the best one thousands of times with mishaps on.
   3. Back-plan: how far the latest award dates move when the estimated surface times change.
   Usage: node tools/analysis.js [games=1000]   Writes tools/analysis.json (read by build.py) and tools/analysis-report.md. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), os = require("os"), cp = require("child_process");
const root = path.join(__dirname, ".."), N = +(process.argv.slice(2).find(a => /^\d+$/.test(a)) || 1000);
const base = JSON.parse(fs.readFileSync(path.join(root, "scenario.json"), "utf8"));
const clone = o => JSON.parse(JSON.stringify(o));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mbr-"));

/* ---------- 1. sensitivity ---------- */
function bal(scn, extra) {
  const f = path.join(tmp, "s" + Math.random().toString(36).slice(2) + ".json"); fs.writeFileSync(f, JSON.stringify(scn));
  const run = a => JSON.parse(cp.execFileSync("node", [path.join(__dirname, "balance.js"), String(a.n), "7", "--json", "--scenario=" + f].concat(a.args, extra || []), { maxBuffer: 1 << 28 }).toString());
  const r = run({ n: N, args: ["--players=sensible,expert"] }), c = run({ n: 40, args: ["--players=expert", "--clean"] });
  fs.unlinkSync(f);
  return { sensible: r.players.sensible.winRate, expert: r.players.expert.winRate, clean: c.players.expert.winRate, cleanMonths: c.players.expert.monthsWin.median, deadline: r.deadlineMonths };
}
const est = o => !o.src;                          // an entry with no published source is an estimate
const each = (s, fn) => { for (const st of s.stages) for (const k of ["carriers", "items", "options"]) for (const o of st[k] || []) fn(o, st, k); };
const scale = (field, f, only) => s => { each(s, (o, st) => { if ((!only || only(st)) && est(o) && typeof o[field] === "number") o[field] = field === "risk" ? Math.min(0.9, +(o[field] * f).toFixed(3)) : Math.max(field === "months" ? 1 : 0, Math.round(o[field] * f)); }); return s; };
const groups = [];
for (const st of base.stages) {
  const ent = [].concat(st.carriers || [], st.items || [], st.options || []).filter(est), one = x => x.id === st.id;
  if (ent.some(o => o.costM)) groups.push({ name: st.title + ": estimated costs", lo: "half", hi: "double", f: [scale("costM", 0.5, one), scale("costM", 2, one)] });
  if (ent.some(o => o.months)) groups.push({ name: st.title + ": estimated times", lo: "half", hi: "double", f: [scale("months", 0.5, one), scale("months", 2, one)] });
  if (ent.some(o => o.risk)) groups.push({ name: st.title + ": estimated mishap chances", lo: "none", hi: "double", f: [scale("risk", 0, one), scale("risk", 2, one)] });
}
const fail = f => s => { for (const st of s.stages) { if (st.failMonths) st.failMonths = Math.max(1, Math.round(st.failMonths * f)); for (const o of [].concat(st.items || [], st.options || [])) if (o.failMonths) o.failMonths = Math.max(1, Math.round(o.failMonths * f)); } return s; };
const dev = f => s => { each(s, o => { if (o.devCostM) o.devCostM = Math.round(o.devCostM * f); if (o.devMonths) o.devMonths = Math.round(o.devMonths * f); }); return s; };
const ready = d => s => { each(s, o => { if (o.availableAt) { const t = o.availableAt.y * 12 + o.availableAt.m - 1 + d; o.availableAt = { y: Math.floor(t / 12), m: t % 12 + 1 }; } }); return s; };
const crew = c => s => { s.stages.find(x => x.id === "crew").options.forEach(o => { if (o.outcome === "ok") o.costM = c; }); return s; };
const all = f => s => { const g = f < 1 ? 0 : 2; for (const x of ["costM", "months"]) scale(x, f)(s); scale("risk", g)(s); fail(f)(s); dev(f)(s); if (s.night) s.night.pct = f < 1 ? 0 : s.night.pct * 2; return s; };
groups.push(
  { name: "Delays after a failed attempt (all stages)", lo: "half", hi: "double", f: [fail(0.5), fail(2)] },
  { name: "Lunar night slowdown (" + base.night.pct + "%)", lo: "0%", hi: (base.night.pct * 2) + "%", f: [s => (s.night.pct = 0, s), s => (s.night.pct *= 2, s)] },
  { name: "Development cost and time of new technologies", lo: "half", hi: "double", f: [dev(0.5), dev(2)] },
  { name: "Ready dates of reactor, habitats and rovers (published)", lo: "1 yr earlier", hi: "1 yr later", f: [ready(-12), ready(12)] },
  { name: "Crew flight cost (2021 Inspector General, $4.1B)", lo: "$2.0B", hi: "$6.0B", f: [crew(2000), crew(6000)] },
  { name: "Budget release in equal yearly parts (assumption)", lo: "all at once", hi: "over 10 yrs", f: [s => (s.budgetYears = 1, s), s => (s.budgetYears = 10, s)] },
  { name: "Total budget ($20B spoken figure)", lo: "$15B", hi: "$30B", f: [s => (s.budgetM = 15000, s), s => (s.budgetM = 30000, s)] },
  { name: "China's date (assumption)", lo: "Dec 2030", hi: "Dec 2040", f: [s => s, s => s], args: [["--deadline=2030-12"], ["--deadline=2040-12"]] },
  { name: "Every estimate at once", lo: "all kind", hi: "all harsh", f: [all(0.5), all(2)] });
const cls = r => ({ play: r.sensible >= 75 ? "usually won" : r.sensible >= 25 ? "a coin flip" : "usually lost", best: r.clean >= 50 ? "possible" : "impossible" });
console.error("baseline...");
const B = bal(clone(base)), Bc = cls(B);
const sens = [];
for (const g of groups) {
  console.error(g.name);
  const lo = bal(g.f[0](clone(base)), g.args && g.args[0]), hi = bal(g.f[1](clone(base)), g.args && g.args[1]);
  const flips = [];
  for (const [r, w] of [[lo, g.lo], [hi, g.hi]]) { const c = cls(r); if (c.play !== Bc.play) flips.push(w + ": a sensible player's run becomes " + c.play); if (c.best !== Bc.best) flips.push(w + ": the base becomes " + c.best + " even with perfect play"); }
  sens.push({ name: g.name, lo: g.lo, hi: g.hi, low: lo, high: hi, swing: Math.round(Math.abs(hi.sensible - lo.sensible) * 10) / 10, flips });
}
sens.sort((a, b) => b.swing - a.swing);

/* ---------- 2. adversary ---------- */
const scnText = JSON.stringify(base);
let rollFn = () => 0.99;
const stub = () => ({ textContent: "", append() {}, setAttribute() {}, addEventListener() {}, classList: { add() {} }, remove() {} });
const ctx = { window: { __roll: () => rollFn() }, document: { getElementById: id => id === "scn" ? { textContent: scnText } : stub(), createElement: stub, createTextNode: stub },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, console, Math, JSON, Object, Array, Set, Date, String, Number };
ctx.globalThis = ctx;
vm.runInNewContext(["src/prelude.js", "src/backplan.js", "src/play.js"].map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n") +
  "\nfunction render(){}\n;globalThis.E={newGame,commit,funds,moreComing,totalMonths,has,devDue,startAdversary,qScore,dateAt,get G(){return G},set G(v){G=v},get SCN(){return SCN}};", ctx);
const E = ctx.E, snap = () => JSON.parse(JSON.stringify(E.G));
function covers(st) {           // every smallest payload set that covers the stage's needs, with and without each enabling extra
  const items = st.items.filter(i => i.outcome !== "fail"), need = (st.needs || []).map(n => n.tag);
  let sets = [[]];
  for (const t of need) { const c = items.filter(i => (i.tags || []).includes(t)); const nx = []; for (const s of sets) { if (s.some(i => (i.tags || []).includes(t))) { nx.push(s); continue; } for (const i of c) nx.push(s.concat(i)); } sets = nx; }
  const extras = items.filter(i => (i.tags || []).includes("crane"));   // a crane lets the awarded rovers move the habitat
  return sets.concat(...extras.map(x => sets.filter(s => !s.includes(x)).map(s => s.concat(x))));
}
function options(st) {
  if (st.type === "choice") return st.options.filter(o => o.outcome !== "fail" && (o.requires || []).every(E.has)).map(o => ({ sel: { opt: o.id }, cost: o.costM || 0, adds: 1, label: o.label }));
  const r = [];
  for (const s of covers(st)) for (const c of st.carriers) { const kg = s.reduce((a, i) => a + i.kg, 0); if (kg > c.capKg) continue;
    r.push({ sel: { car: c.id, items: s.map(i => i.id) }, cost: (c.costM || 0) + s.reduce((a, i) => a + (i.costM || 0) + (E.devDue(i) ? i.devCostM || 0 : 0), 0), adds: 1 + s.length, label: c.label + " with " + s.map(i => i.label).join(", ") }); }
  return r;
}
function step(o) {           // one decision, waiting for yearly funding when needed; returns false when it cannot go on
  const G = E.G; while (o.cost > E.funds()) { if (!E.moreComing()) return false; G.months += 12 - (G.months % 12); }
  G.sel = o.sel; E.commit();
  if (G.phase === "recover") { const r = G.rec, A = { m: Math.ceil(r.months * 0.6), c: Math.round(r.cost * 0.6) }, Bq = { m: Math.ceil(r.months * 0.25) + 1, c: Math.round(r.cost * 0.1), wear: 1 };
    let p = rollFn() < 0.5 ? A : Bq; if (p.c > E.funds()) p = Bq; while (p.c > E.funds()) { if (!E.moreComing()) return false; G.months += 12 - (G.months % 12); }
    G.months += p.m; G.spent += p.c; if (p.wear) G.wear += p.wear; G.dates[E.SCN.stages[G.i].id] = G.months; G.rec = null; G.phase = G.months >= E.totalMonths() ? "lost" : "result"; }
  return G.phase !== "lost";
}
let best = null, plans = 0;
function dfs(path, adds) {
  const G = E.G, st = E.SCN.stages[G.i];
  for (const o of options(st)) {
    const keep = snap();
    if (step(o) && E.G.result && E.G.result.ok) {
      const p = path.concat({ stage: st.title, id: st.id, label: o.label, sel: o.sel, date: E.dateAt(E.G.months), cost: E.G.spent });
      if (E.G.i === E.SCN.stages.length - 1) { plans++; const k = [adds + o.adds, E.G.months, E.G.spent];
        if (!best || k[0] < best.k[0] || (k[0] === best.k[0] && (k[1] < best.k[1] || (k[1] === best.k[1] && k[2] < best.k[2])))) best = { k, path: p, months: E.G.months, spent: E.G.spent, quality: E.qScore() }; }
      else { E.G.i++; E.G.sel = {}; E.G.result = null; E.G.phase = "brief"; dfs(p, adds + o.adds); }
    }
    E.G = keep;
  }
}
rollFn = () => 0.99;
E.newGame([], "brief", null); E.startAdversary();
const start = { date: E.dateAt(E.G.months), spent: E.G.spent };
dfs([], 0);
/* the same plan with mishaps on */
let s32 = 11 >>> 0; const rnd = () => { s32 = (s32 + 0x6D2B79F5) >>> 0; let t = s32; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
rollFn = rnd; const MC = 4000, fin = []; let wins = 0;
for (let n = 0; n < MC; n++) {
  E.newGame([], "brief", null); E.startAdversary(); let ok = true;
  for (const p of best.path) { let o = options(E.SCN.stages[E.G.i]).find(x => JSON.stringify(x.sel) === JSON.stringify(p.sel)); if (!o || !step(o)) { ok = false; break; }
    while (E.G.result && !E.G.result.ok) { ok = false; break; } if (!ok) break; if (E.G.i < E.SCN.stages.length - 1) { E.G.i++; E.G.sel = {}; E.G.result = null; E.G.phase = "brief"; } }
  if (ok) { wins++; fin.push(E.G.months); }
}
fin.sort((a, b) => a - b);
const q = p => fin.length ? E.dateAt(fin[Math.min(fin.length - 1, Math.floor(p * fin.length))]) : "none";
const cargoStep = best.path.find(p => p.id === "cargo"), totalAwarded = base.awarded.missions.reduce((a, m) => a + m.costM, 0);
const adversary = { start, plans, additions: best.k[0], path: best.path, finish: E.dateAt(best.months), spent: best.spent, quality: best.quality,
  monteCarlo: { runs: MC, winRate: Math.round(wins / MC * 1000) / 10, p10: q(0.1), median: q(0.5), p90: q(0.9) },
  reactorLands: cargoStep ? cargoStep.date : "", deadline: E.dateAt(E.totalMonths()), withArtemisLeftM: base.budgetM - totalAwarded };

/* ---------- 3. back-plan ranges ---------- */
const bc = {}; vm.runInNewContext(fs.readFileSync(path.join(root, "src/backplan.js"), "utf8") + ";this.R={backPlan,ymI,ymS}", bc);
const { backPlan, ymI, ymS } = bc.R, T = ymI(base.deadline);
const bp = (f, o) => { const r = backPlan(base.backplan, f, T, o); return { first: r.first.it.label, med: ymS(r.first.award.med), rows: r.rows.map(x => ({ id: x.id, fast: ymS(x.award.fast), med: ymS(x.award.med), slow: ymS(x.award.slow), margin: x.margin.med })) }; };
const backplan = { china: { base: bp("date"), surfaceHalf: bp("date", { scale: 0.5 }), surfaceDouble: bp("date", { scale: 2 }), tail0: bp("date", { tail: 0 }), tail12: bp("date", { tail: 12 }) },
  nasa: { base: bp("nasa"), surfaceHalf: bp("nasa", { scale: 0.5 }), surfaceDouble: bp("nasa", { scale: 2 }), tail0: bp("nasa", { tail: 0 }), tail12: bp("nasa", { tail: 12 }) } };

const out = { generated: new Date().toISOString().slice(0, 10), games: N, deadline: E.dateAt(E.totalMonths()), baseline: Object.assign(B, Bc), sensitivity: sens, adversary, backplan };
fs.writeFileSync(path.join(__dirname, "analysis.json"), JSON.stringify(out, null, 1));

/* ---------- report ---------- */
const fm = m => "$" + (m / 1000).toFixed(1) + "B", L = [];
L.push("# Moon Base Race: analysis", "", "Generated " + out.generated + " by `node tools/analysis.js " + N + "`. Deadline " + out.deadline + " unless stated.", "");
L.push("## Sensitivity", "", "Baseline: a sensible player wins " + B.sensible + "% (" + Bc.play + "), an expert " + B.expert + "%, and a perfect run with no mishaps " + (B.clean >= 50 ? "finishes in time" : "cannot finish in time") + ". The awarded-only result uses no estimates and cannot change.", "",
  "| Parameter | Range | Sensible win low / high | Expert low / high | Perfect run low / high | Flips |", "|---|---|---|---|---|---|");
for (const s of sens) L.push("| " + s.name + " | " + s.lo + " to " + s.hi + " | " + s.low.sensible + "% / " + s.high.sensible + "% | " + s.low.expert + "% / " + s.high.expert + "% | " + (s.low.clean >= 50 ? "yes" : "no") + " / " + (s.high.clean >= 50 ? "yes" : "no") + " | " + (s.flips.join("; ") || "none") + " |");
L.push("", "## Adversary: awarded hardware plus the fewest additions", "", "Starts " + start.date + " with " + fm(start.spent) + " of awarded robotic missions paid. Searched " + plans + " complete plans. Fewest additions: " + adversary.additions + " new contracts.", "");
for (const p of best.path) L.push("- " + p.stage + ": " + p.label + " (done " + p.date + ", total spent " + fm(p.cost) + ")");
L.push("", "With no mishaps the crew moves in " + adversary.finish + " for " + fm(adversary.spent) + ". With mishaps on, over " + MC + " runs, it wins " + adversary.monteCarlo.winRate + "% before " + adversary.deadline + "; finish p10/median/p90 " + adversary.monteCarlo.p10 + " / " + adversary.monteCarlo.median + " / " + adversary.monteCarlo.p90 + ".",
  "If Artemis IV and V count against the $20B, " + fm(adversary.withArtemisLeftM) + " is left for everything else.", "");
L.push("## Back-plan ranges", "");
for (const [f, v] of Object.entries(backplan)) { L.push("### " + (f === "nasa" ? "Against NASA's own dates" : "Against China's announced date"), ""); for (const [k, r] of Object.entries(v)) L.push("- " + k + ": first deadline " + r.first + ", " + r.med + " (median comparable). " + r.rows.map(x => x.id + " " + x.fast + " / " + x.med + " / " + x.slow).join("; ")); L.push(""); }
fs.writeFileSync(path.join(__dirname, "analysis-report.md"), L.join("\n") + "\n");
console.log(L.join("\n"));
fs.rmSync(tmp, { recursive: true, force: true });
