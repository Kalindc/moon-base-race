#!/usr/bin/env node
/* Balance harness for Moon Base Race.
   Plays thousands of games with the real rules (src/prelude.js and src/play.js are loaded as they are)
   and reports win rate, spend, dead ends, money problems and which choices matter.
   Usage: node tools/balance.js [games=4000] [seed=1] [--json] [--whatif=id,id] [--scenario=path]
   Only the two click handlers that live inside views are mirrored here: mishap recovery and "wait for funding". */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const args = process.argv.slice(2), num = args.filter(a => /^\d+$/.test(a)).map(Number);
const N = num[0] || 4000, SEED = num[1] || 1, JSON_OUT = args.includes("--json");
const WHATIF = (args.find(a => a.startsWith("--whatif=")) || "").slice(9).split(",").filter(Boolean);

/* seeded random (mulberry32) so runs repeat */
let _s = SEED >>> 0;
const rnd = () => { _s = (_s + 0x6D2B79F5) >>> 0; let t = _s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* load the real engine with a minimal page stub */
const SCN_PATH = (args.find(a => a.startsWith("--scenario=")) || "").slice(11) || path.join(root, "scenario.json");
const scenario = fs.readFileSync(SCN_PATH, "utf8");
const stubEl = () => ({ textContent: "", append() {}, setAttribute() {}, addEventListener() {}, classList: { add() {} }, remove() {} });
const ctx = { window: { __roll: rnd }, document: { getElementById: id => id === "scn" ? { textContent: scenario } : stubEl(), createElement: stubEl, createTextNode: stubEl },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, console, Math, JSON, Object, Array, Set, Date, String, Number };
ctx.globalThis = ctx;
const src = fs.readFileSync(path.join(root, "src/prelude.js"), "utf8") + "\n" + fs.readFileSync(path.join(root, "src/play.js"), "utf8") +
  "\nfunction render(){}\n;globalThis.E={newGame,commit,funds,moreComing,totalMonths,has,devDue,effRisk,qScore,qGrade,yearly,get G(){return G},get SCN(){return SCN}};";
vm.runInNewContext(src, ctx, { filename: "engine" });
const E = ctx.E;

/* ---------- players ---------- */
/* sensible: has learned which choices fail, covers every need, adds some extras, keeps to the money.
   careful:  as sensible, but brings the reliability instruments and never the unproven technologies.
   ambitious: as sensible, but loads many extras including technologies in development.
   expert:    plays for speed: fastest lander that fits, cheapest payloads that cover the needs, fastest working option.
   firsttime: covers the needs the page shows, but does not know which choices fail; learns only from its own failures in that game. */
const PLAYERS = { sensible: { extra: 0.3, known: true }, careful: { extra: 0.15, known: true, safe: true }, ambitious: { extra: 0.6, known: true }, expert: { extra: 0, known: true, best: true }, firsttime: { extra: 0.4, known: false } };

function chooseLoadout(st, P, mem) {
  const G = E.G, usable = i => !(P.known && i.outcome === "fail") && !mem.has(i.id) && !(P.safe && (i.devCostM || i.risk));
  const items = st.items.filter(usable), need = (st.needs || []).map(n => n.tag);
  const sel = [], tags = new Set();
  for (const t of shuffle(need)) { if (tags.has(t)) continue; const c = items.filter(i => (i.tags || []).includes(t) && !sel.includes(i)); if (!c.length) continue; const i = P.best ? c.slice().sort((a, b) => (a.costM + (a.devCostM || 0) + (a.devMonths || 0) * 100) - (b.costM + (b.devCostM || 0) + (b.devMonths || 0) * 100))[0] : pick(c); sel.push(i); (i.tags || []).forEach(x => tags.add(x)); }
  if (!sel.length && items.length) sel.push(pick(items));
  for (const i of shuffle(items)) { if (sel.includes(i)) continue; let p = P.extra; if (P.safe && i.fx && i.fx.risk < 0) p = 0.9; if (rnd() < p) sel.push(i); }
  const kg = a => a.reduce((s, i) => s + i.kg, 0);
  let cars = st.carriers.filter(c => c.capKg >= kg(sel.slice(0, Math.max(1, need.length))));
  if (!cars.length) cars = st.carriers.slice();
  const car = P.best ? (cars.filter(c => c.capKg >= kg(sel)).sort((a, b) => a.months - b.months)[0] || cars[0]) : pick(cars);
  const cost = a => (car.costM || 0) + a.reduce((s, i) => s + (i.costM || 0) + (E.devDue(i) ? i.devCostM || 0 : 0), 0);
  const core = new Set(sel.slice(0, need.length));
  while (sel.length > 1 && (kg(sel) > car.capKg || cost(sel) > E.funds())) { const x = sel.filter(i => !core.has(i)); if (!x.length) break; sel.splice(sel.indexOf(x[x.length - 1]), 1); }
  while (sel.length > 1 && kg(sel) > car.capKg) sel.pop();
  return { car, sel, cost: cost(sel), over: kg(sel) > car.capKg };
}
function chooseOption(st, P, mem) {
  let o = st.options.filter(o => (o.requires || []).every(E.has) && !mem.has(o.id));
  if (P.known) o = o.filter(x => x.outcome === "ok");
  if (P.best && o.length) return o.slice().sort((a, b) => a.months - b.months)[0];
  return o.length ? pick(o) : null;
}

function play(pname) {
  const P = PLAYERS[pname], mem = new Set(), log = { player: pname, won: false, end: "", picks: {}, waits: {}, fails: 0, mishaps: 0 };
  E.newGame(WHATIF, "brief");
  const T = E.totalMonths();
  let guard = 0;
  while (guard++ < 400) {
    const G = E.G, st = E.SCN.stages[G.i];
    if (G.months >= T) { log.end = "deadline"; log.lostAt = st.id; break; }
    let need = 0, key;
    if (st.type === "loadout") { const c = chooseLoadout(st, P, mem); if (c.over) { log.end = "deadend"; log.lostAt = st.id; break; } G.sel = { car: c.car.id, items: c.sel.map(i => i.id) }; need = c.cost; key = c; }
    else { const o = chooseOption(st, P, mem); if (!o) { log.end = "deadend"; log.lostAt = st.id; break; } G.sel = { opt: o.id }; need = o.costM || 0; key = o; }
    if (need > E.funds()) {
      if (!E.moreComing()) { log.end = "broke"; log.lostAt = st.id; break; }
      const w = 12 - (G.months % 12); G.months += w; log.waits[st.id] = (log.waits[st.id] || 0) + w; continue;   // mirrors fundsHelp()
    }
    const cost0 = G.spent;
    E.commit();
    if (st.type === "loadout") { log.picks[st.id] = { car: key.car.id, items: key.sel.map(i => i.id) }; } else log.picks[st.id] = { opt: key.id };
    if (G.phase === "recover") {   // mirrors recoverView()
      log.mishaps++; const r = G.rec, A = { m: Math.ceil(r.months * 0.6), c: Math.round(r.cost * 0.6) }, B = { m: Math.ceil(r.months * 0.25) + 1, c: Math.round(r.cost * 0.1), wear: 1 };
      let o = rnd() < 0.5 ? A : B; if (o.c > E.funds()) o = B;
      if (o.c > E.funds()) { if (!E.moreComing()) { log.end = "broke"; log.lostAt = st.id; break; } G.months += 12 - (G.months % 12); }
      G.months += o.m; G.spent += o.c; if (o.wear) G.wear += o.wear; G.dates[st.id] = G.months; G.rec = null; G.phase = G.months >= T ? "lost" : "result";
    }
    if (G.phase === "lost") { log.end = "deadline"; log.lostAt = st.id; break; }
    const ok = G.result && G.result.ok;
    if (!ok) { log.fails++; if (st.type === "loadout") { const bad = key.sel.find(i => i.outcome === "fail"); if (bad) mem.add(bad.id); else mem.add("needs:" + st.id); } else mem.add(key.id); }
    else if (G.i === E.SCN.stages.length - 1) { log.won = true; log.end = "won"; break; }
    else G.i++;
    G.sel = {}; G.result = null; G.phase = "brief";
  }
  if (!log.end) { log.end = "loop"; }
  const G = E.G; log.months = G.months; log.spent = G.spent; log.quality = E.qScore(); log.grade = E.qGrade(); log.wear = G.wear;
  return log;
}

/* ---------- run and report ---------- */
const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0, q = (a, p) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const out = { games: N, seed: SEED, whatif: WHATIF, deadlineMonths: 0, budgetM: 0, players: {} };
const stages = () => E.SCN.stages;
for (const pname of Object.keys(PLAYERS)) {
  const L = []; for (let i = 0; i < N; i++) L.push(play(pname));
  out.deadlineMonths = E.totalMonths(); out.budgetM = E.SCN.budgetM;
  const W = L.filter(l => l.won), ends = {}; for (const l of L) ends[l.end] = (ends[l.end] || 0) + 1;
  const R = { winRate: pct(W.length, N), ends, lostAtStage: {}, monthsWin: { p10: q(W.map(l => l.months), .1), median: q(W.map(l => l.months), .5), p90: q(W.map(l => l.months), .9) },
    spendAll: { p10: q(L.map(l => l.spent), .1), median: q(L.map(l => l.spent), .5), p90: q(L.map(l => l.spent), .9) }, spendWin: { median: q(W.map(l => l.spent), .5) },
    qualityWin: { p10: q(W.map(l => l.quality), .1), median: q(W.map(l => l.quality), .5), p90: q(W.map(l => l.quality), .9) }, grades: {},
    waitedForFunds: {}, mishapsPerGame: Math.round(L.reduce((a, l) => a + l.mishaps, 0) / N * 100) / 100, failsPerGame: Math.round(L.reduce((a, l) => a + l.fails, 0) / N * 100) / 100, choices: {} };
  for (const l of W) R.grades[l.grade] = (R.grades[l.grade] || 0) + 1;
  for (const l of L) { if (!l.won) R.lostAtStage[l.lostAt] = (R.lostAtStage[l.lostAt] || 0) + 1; for (const s in l.waits) R.waitedForFunds[s] = (R.waitedForFunds[s] || 0) + 1; }
  for (const s in R.waitedForFunds) R.waitedForFunds[s] = pct(R.waitedForFunds[s], N);
  /* per choice: how often chosen, win rate with it, and win rate without it */
  for (const st of stages()) {
    const rows = [], add = (id, label, test) => { const a = L.filter(l => l.picks[st.id] && test(l.picks[st.id])), b = L.filter(l => l.picks[st.id] && !test(l.picks[st.id])); if (!a.length) { rows.push({ id, label, used: 0 }); return; }
      rows.push({ id, label, used: pct(a.length, N), winWith: pct(a.filter(l => l.won).length, a.length), winWithout: pct(b.filter(l => l.won).length, b.length), medMonthsWith: q(a.filter(l => l.won).map(l => l.months), .5) }); };
    if (st.type === "loadout") { st.carriers.forEach(c => add(c.id, c.label, p => p.car === c.id)); st.items.forEach(i => add(i.id, i.label, p => p.items.includes(i.id))); }
    else st.options.forEach(o => add(o.id, o.label, p => p.opt === o.id));
    R.choices[st.id] = rows;
  }
  out.players[pname] = R;
}
/* static checks: choices that can never be taken, and stages a player can be locked out of */
out.static = { unreachable: [], lockouts: [] };
for (const st of stages()) if (st.type === "choice") {
  const granted = new Set(stages().flatMap(s => (s.items || []).flatMap(i => i.tags || []).concat((s.options || []).flatMap(o => o.grants || []), (s.carriers || []).flatMap(c => c.grants || []))));
  for (const o of st.options) for (const t of o.requires || []) if (!granted.has(t)) out.static.unreachable.push(st.id + "/" + o.id + " needs '" + t + "', which nothing provides");
  if (!st.options.some(o => o.outcome === "ok" && !(o.requires || []).length)) out.static.lockouts.push(st.id + ": every working option needs a landed asset (" + st.options.filter(o => o.outcome === "ok").map(o => o.id + " needs " + o.requires.join("+")).join("; ") + ")");
}
if (JSON_OUT) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
const fm = m => "$" + (m / 1000).toFixed(1) + "B";
console.log("Moon Base Race balance run: " + N + " games per player, seed " + SEED + (WHATIF.length ? ", what-ifs " + WHATIF.join(",") : ", as published") + ". Deadline at month " + out.deadlineMonths + ", budget " + fm(out.budgetM) + ".\n");
for (const [n, R] of Object.entries(out.players)) {
  console.log("== " + n + " ==  win " + R.winRate + "%   ends " + JSON.stringify(R.ends));
  console.log("   winners finish at month p10/median/p90 " + R.monthsWin.p10 + "/" + R.monthsWin.median + "/" + R.monthsWin.p90 + ", spend median " + fm(R.spendWin.median) + " (all games " + fm(R.spendAll.p10) + " to " + fm(R.spendAll.p90) + ")");
  console.log("   quality p10/median/p90 " + R.qualityWin.p10 + "/" + R.qualityWin.median + "/" + R.qualityWin.p90 + "  grades " + JSON.stringify(R.grades));
  console.log("   mishaps per game " + R.mishapsPerGame + ", failed attempts per game " + R.failsPerGame);
  console.log("   lost at stage " + JSON.stringify(R.lostAtStage) + "\n   had to wait for funding at (% of games) " + JSON.stringify(R.waitedForFunds) + "\n");
}
const S = out.players.sensible;
console.log("Choices, sensible player (used %, win % with, win % without, difference):");
for (const st of stages()) { console.log(" " + st.id); for (const r of S.choices[st.id]) console.log("   " + r.id.padEnd(13) + (r.used ? String(r.used).padStart(5) + "%  " + String(r.winWith).padStart(5) + "  " + String(r.winWithout).padStart(5) + "  " + ((r.winWith - r.winWithout) >= 0 ? "+" : "") + (r.winWith - r.winWithout).toFixed(1) : "  never chosen")); }
console.log("\nStatic checks: " + JSON.stringify(out.static, null, 1));
