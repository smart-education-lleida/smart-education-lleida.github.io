// Proves de l'eina SELFIE IA v5.0 (Chrome sense interfície)
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(process.argv[2]);
const SHOTS = process.argv[3];
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FALLA:', msg); } };

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('request', r => { if (!r.url().startsWith('file://') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) requests.push(r.url()); });
  const open = async (hash = '') => { await page.goto('about:blank'); await page.goto(FILE + hash); await page.waitForTimeout(150); };
  const text = () => page.evaluate(() => document.getElementById('app').innerText);
  const clean = async (label) => { const t = await text(); ok(!/undefined|NaN|\[object|null/.test(t), `text net a ${label}`); return t; };

  // A. mediana baixa
  await open();
  const A = await page.evaluate(() => { const m = window.__selfie.medLow; return [m([0,1,2,3]), m([1]), m([0,3]), m([0,0,3,3,3]), m([]), m([3,0,2,1,1,2]), m([2,2,1,1]), m([3,3,3,0])]; });
  ok(JSON.stringify(A) === JSON.stringify([1,1,0,3,0,1,1,3]), 'medLow ' + JSON.stringify(A));

  // B. paritat de diccionaris
  const parity = await page.evaluate(() => {
    const { UI, TX } = window.__selfie; const out = [];
    const walk = (a, b, p) => { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a) || !(k in b)) { out.push(p + k + ' absent'); continue; }
      if (typeof a[k] !== typeof b[k] || Array.isArray(a[k]) !== Array.isArray(b[k])) { out.push(p + k + ' tipus'); continue; }
      if (typeof a[k] === 'function' && a[k].length !== b[k].length) out.push(p + k + ' aritat');
      if (a[k] && typeof a[k] === 'object') walk(a[k], b[k], p + k + '.'); } };
    walk(UI.ca, UI.es, 'es:'); walk(UI.ca, UI.en, 'en:'); walk(TX.ca, TX.es, 'TXes:'); walk(TX.ca, TX.en, 'TXen:');
    return out; });
  ok(parity.length === 0, 'paritat ' + parity.join(' | '));

  // C. codi: anada i tornada, error de còpia, format anterior
  const codes = await page.evaluate(() => { const s = window.__selfie; let bad = 0;
    for (let k = 0; k < 2000; k++) { const ans = Array.from({ length: 20 }, () => Math.floor(Math.random() * 4)); const p = s.parseCode(s.makeCode(ans, 'ESO', 'AB12')); if (!p || p.ans.join() !== ans.join()) bad++; }
    const c = s.makeCode(Array(20).fill(1), 'PRI', 'ZZ99'); const typo = c.slice(0, 5) + (c[5] === '0' ? '1' : '0') + c.slice(6);
    return { bad, typo: s.parseCode(typo) === null && s.codeLooksTypo(typo), sf1: !!s.parseCode('SF1-BCBBC-CBBAB-CBBCBA-BCBB-PRI-0A') }; });
  ok(codes.bad === 0 && codes.typo && codes.sf1, 'codi ' + JSON.stringify(codes));

  // D. flux individual amb teclat, en tres idiomes
  await open();
  await page.click('#start');
  const keys = '2,2,1,1,3,2,2,1,2,1,2,3,1,2,2,1,2,2,3,2'.split(',');
  for (const k of keys) { await page.keyboard.press(k); await page.waitForTimeout(300); }
  await page.waitForSelector('#resH');
  const h1 = await page.textContent('#resH');
  ok(/Bàsica/.test(h1) && /etapa mediana/.test(h1), 'resultat individual: ' + h1.trim());
  const code1 = await page.textContent('#codeBox');
  await clean('resultat individual');
  await page.screenshot({ path: SHOTS + '/1-individual.png', fullPage: true });
  await page.click('.langs button[data-lang="en"]'); const h1en = await page.textContent('#resH'); const code2 = await page.textContent('#codeBox');
  ok(/Basic/.test(h1en) && /median stage/.test(h1en) && code1 === code2, 'individual EN ' + h1en.trim());
  await page.click('.langs button[data-lang="es"]'); ok(/Básica/.test(await page.textContent('#resH')), 'individual ES');
  await clean('resultat ES');

  // E. quadre d'equip (mostra) contra un càlcul independent
  await open('#demo');
  const team = await page.evaluate(() => { const s = window.__selfie; const P = s.team.people; const S = s.stats(P);
    const ml = a => [...a].sort((x, y) => x - y)[Math.floor((a.length - 1) / 2)];
    const itemOK = S.item.every((x, i) => x.med === ml(P.map(p => p.ans[i])));
    const per = P.map(p => ml(p.ans)); const predOK = S.pred === ml(per);
    const dimOK = S.dim.every((x, k) => x.med === ml(P.map(p => ml([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].filter(i => (k===0&&i<5)||(k===1&&i>=5&&i<10)||(k===2&&i>=10&&i<16)||(k===3&&i>=16)).map(i => p.ans[i])))));
    const idx = Math.round(P.flatMap(p => p.ans).reduce((a, b) => a + b, 0) / (P.length * 20) / 3 * 100);
    const D = s.dafo(S), PL = s.pla(S);
    return { n: S.n, itemOK, predOK, dimOK, idxOK: idx === S.index, index: S.index, pred: S.pred, stage: S.stage, polar: S.polar, meds: S.item.map(x => x.med).join(''), dims: S.dim.map(x => x.med).join(''),
      dafo: { F: D.F.map(x => x.t), D: D.D.map(x => x.t), O: D.O.map(x => x.t), A: D.A.map(x => x.t) }, pla: PL.map(p => `${p.i + 1}:${p.from}->${p.to}`) }; });
  ok(team.n === 24 && team.itemOK && team.predOK && team.dimOK && team.idxOK, 'estadístics equip ' + JSON.stringify(team));
  console.log('EQUIP MOSTRA', JSON.stringify(team, null, 1));
  await clean('equip CA');
  await page.screenshot({ path: SHOTS + '/2-equip.png', fullPage: true });
  await page.check('#tMean'); await page.check('#tInd');
  ok(await page.locator('#teamRadar polygon[stroke-dasharray="1.5 4.5"]').count() === 1, 'línia de mitjanes a equip');
  await page.screenshot({ path: SHOTS + '/2b-equip-mitjana.png', clip: { x: 0, y: 380, width: 1280, height: 620 } });
  for (const l of ['es', 'en']) { await page.click(`.langs button[data-lang="${l}"]`); await clean('equip ' + l); }

  // F. polarització 25/25
  const pol = await page.evaluate(() => { const s = window.__selfie; const mk = (v, n) => Array.from({ length: n }, () => ({ ans: Array(20).fill(v), etapa: '', code: 'x' + Math.random() }));
    const t1 = [...mk(0, 3), ...mk(3, 3), ...mk(1, 6)];          // 25% i 25% exactes sobre 12
    const t2 = [...mk(0, 2), ...mk(3, 3), ...mk(1, 7)];          // 17% en inicial
    const t3 = [...mk(0, 6), ...mk(3, 6)];                       // meitat i meitat: mediana baixa = inicial
    return [s.stats(t1).polar, s.stats(t2).polar, s.stats(t3).polar, s.stats(t3).pred]; });
  ok(pol[0] === true && pol[1] === false && pol[2] === true && pol[3] === 0, 'polarització ' + JSON.stringify(pol));

  // G. evolució (mostra)
  await open('#evolucio-demo');
  const evoTxt = await clean('evolució CA');
  ok(/Polarització/i.test(evoTxt) && /etapa predominant/i.test(evoTxt), 'evolució: polarització i etapa predominant');
  const evo = await page.evaluate(() => { const s = window.__selfie; const SA = s.stats(s.evo.A.people), SB = s.stats(s.evo.B.people);
    return { idx: [SA.index, SB.index], pred: [SA.pred, SB.pred], medsA: SA.item.map(x => x.med).join(''), medsB: SB.item.map(x => x.med).join(''), dimsA: SA.dim.map(x => x.med).join(''), dimsB: SB.dim.map(x => x.med).join(''),
      chips: [...document.querySelectorAll('.chipst')].map(e => e.textContent), read: [...document.querySelectorAll('.read div')].map(e => e.textContent) }; });
  console.log('EVOLUCIÓ MOSTRA', JSON.stringify(evo, null, 1));
  await page.waitForTimeout(1700);
  await page.screenshot({ path: SHOTS + '/3-evolucio.png', fullPage: true });
  await page.check('#tMeanE'); ok(await page.locator('#evoRadar polygon[stroke-dasharray="1.5 4.5"]').count() === 2, 'línies de mitjanes a evolució');
  await page.screenshot({ path: SHOTS + '/3b-evolucio-mitjana.png', clip: { x: 0, y: 560, width: 1280, height: 640 } });
  for (const l of ['es', 'en']) { await page.click(`.langs button[data-lang="${l}"]`); await clean('evolució ' + l); }
  // evolució individual: dos codis d'una mateixa persona
  await open('#evolucio');
  await page.fill('#pasteA', await page.evaluate(() => window.__selfie.makeCode(Array(20).fill(1), 'ESO', 'AAAA'))); await page.click('[data-add="A"]');
  await page.fill('#pasteB', await page.evaluate(() => window.__selfie.makeCode([2,2,2,2,2,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1], 'ESO', 'BBBB'))); await page.click('[data-add="B"]');
  await clean('evolució individual');

  // H. xarxa (mostra) + instantània de xarxa + compatibilitat d'instantànies
  await open('#xarxa-demo');
  const netTxt = await clean('xarxa CA');
  ok(/Polarització/i.test(netTxt), 'xarxa: indicador de polarització');
  await page.screenshot({ path: SHOTS + '/4-xarxa.png', fullPage: true });
  await page.check('#tCenters'); await page.check('#tMeanN'); await clean('xarxa amb superposicions');
  for (const l of ['es', 'en']) { await page.click(`.langs button[data-lang="${l}"]`); await clean('xarxa ' + l); }
  const snap = await page.evaluate(() => { const s = window.__selfie; s.loadDemo(); const d = s.snapshotOf(s.team.people, 'r', 30, 'c'); const back = s.peopleFromSnapshot(JSON.parse(JSON.stringify(d)));
    const a = s.stats(s.team.people), b = s.stats(back); const nd = s.networkSnapshotOf();
    return { fmt: d.format, same: a.index === b.index && a.pred === b.pred && a.item.map(x => x.med).join() === b.item.map(x => x.med).join(), names: !JSON.stringify(d).match(/alias|mail|nom\b/), netFmt: nd.format, netN: nd.snapshots.length }; });
  ok(snap.fmt === 'selfie-equip-1' && snap.same && snap.netFmt === 'selfie-xarxa-1' && snap.netN === 12, 'instantànies ' + JSON.stringify(snap));

  // I. prova de càrrega: 500 centres
  await open('#xarxa');
  const load = await page.evaluate(() => { const s = window.__selfie; let seed = 11; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const et = ['INF', 'PRI', 'ESO', 'BAT', 'CF']; const snaps = []; let total = 0;
    for (let c = 0; c < 500; c++) { const n = 20 + Math.floor(rnd() * 59), bias = rnd() * 1.6 - 0.2, codes = [];
      for (let k = 0; k < n; k++) { const base = bias + rnd() * 1.2 - 0.6; const ans = Array.from({ length: 20 }, () => Math.max(0, Math.min(3, Math.round(base + (rnd() - 0.5) * 1.4)))); codes.push(s.makeCode(ans, et[Math.floor(rnd() * 5)], undefined)); }
      total += n; snaps.push({ format: 'selfie-equip-1', id: 'L' + c, name: 'Prova', center: 'Centre ' + (c + 1), date: '2026-11-14', plantilla: n + 3, codes }); }
    const t0 = performance.now(); let added = 0; snaps.forEach(d => { if (s.addSnap(d)) added++; }); const t1 = performance.now();
    s.render(); const t2 = performance.now();
    return { centres: added, docents: s.net.snaps.reduce((a, x) => a + x.people.length, 0), generats: total, carregaMs: Math.round(t1 - t0), dibuixMs: Math.round(t2 - t1) }; });
  console.log('CÀRREGA 500 CENTRES', JSON.stringify(load));
  ok(load.centres === 500 && load.dibuixMs < 8000, 'càrrega 500 centres');
  await clean('xarxa 500 centres');

  // J. col·lisions del sufix aleatori (4 caràcters)
  const coll = await page.evaluate(() => { const s = window.__selfie; const run = n => { const seen = new Set(); let c = 0; for (let i = 0; i < n; i++) { const id = s.makeCode(Array(20).fill(1), 'ESO').slice(-4); if (seen.has(id)) c++; else seen.add(id); } return c; }; return [run(150), run(2000), run(20000)]; });
  console.log('COL·LISIONS (150, 2.000, 20.000 codis idèntics):', coll.join(', '));
  ok(coll[0] <= 1 && coll[2] > 100 && coll[2] < 300, 'col·lisions ' + coll);

  // K. capçalera: ordre de pestanyes i contrast del botó Evolució
  await open();
  const nav = await page.evaluate(() => { const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    return { order: [...document.querySelectorAll('header nav button')].map(b => b.id).join(','), inactive: cr('#0a5b66', '#dcecee').toFixed(1), active: cr('#ffffff', '#0a5b66').toFixed(1), border: cr('#8fc3c9', '#f4f7f8').toFixed(1) }; });
  ok(nav.order === 'navSelf,navTeam,navNet,navEvo' && +nav.inactive >= 4.5 && +nav.active >= 4.5, 'capçalera ' + JSON.stringify(nav));
  console.log('CAPÇALERA', JSON.stringify(nav));
  await page.screenshot({ path: SHOTS + '/0-capcalera.png', clip: { x: 0, y: 0, width: 1280, height: 330 } });
  await page.click('#navEvo'); await page.screenshot({ path: SHOTS + '/0b-capcalera-evo.png', clip: { x: 0, y: 0, width: 1280, height: 80 } });
  // mòbil
  await page.setViewportSize({ width: 390, height: 800 }); await open('#demo');
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'sense desplaçament horitzontal al mòbil (equip)');
  await page.screenshot({ path: SHOTS + '/5-mobil-equip.png', fullPage: false });
  await open('#evolucio-demo'); ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'sense desplaçament horitzontal al mòbil (evolució)');

  // L. sense xarxa ni errors
  ok(requests.length === 0, 'peticions de xarxa: ' + requests.join(', '));
  ok(errors.length === 0, 'errors: ' + errors.join(' | '));
  await browser.close();
  console.log(`\nRESULTAT: ${pass} comprovacions correctes, ${fail} fallades`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
