/* KRACKERJACK AI — the Hive's greeter, site guide, and first watcher
 * (client side). Chat-window template anatomy (header / thread /
 * composer / quick chips) retained, Hive overhaul applied: slate
 * panels, antique gold, rounded everything, plain words.
 * Voice of the Architect: KRACKERJACK AI is Jack in digital form —
 * there is no split between conversation and work here. He thinks
 * through the Hive's free model route (Pollinations, a HIVEROUTER
 * catalog route) with his doctrine and the live registry (apps.json /
 * agents.json) as his memory of the house. If the route is down, the
 * panel says so plainly and falls back to the shelves — it never
 * fakes a conversation. The route moves to the Hive Core (Job #1)
 * when it lights. If an app fails
 * to load for a visitor, KRACKERJACK is the face that tells them the
 * Hive has been notified — the server-side sentinel (Ren's watch)
 * carries the actual report. */
(function () {
  'use strict';
  var GOLD = '#C9A227', PANEL = '#1a1d26', BG = '#101218', INK = '#e8e6df';
  var css = [
    '#kj-btn{position:fixed;right:16px;bottom:16px;z-index:9998;background:' + GOLD + ';color:#111;border:0;border-radius:999px;padding:14px 20px;font:700 15px "Segoe UI",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.45);cursor:pointer;min-height:48px}',
    '#kj-panel{position:fixed;right:16px;bottom:16px;z-index:9999;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100vh - 110px));background:' + PANEL + ';border:1px solid rgba(201,162,39,.35);border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.55);display:none;flex-direction:column;overflow:hidden;font-family:"Segoe UI",system-ui,sans-serif;color:' + INK + '}',
    '#kj-panel.open{display:flex}',
    '#kj-head{display:flex;align-items:center;gap:10px;padding:14px 16px;background:' + BG + ';border-bottom:1px solid rgba(201,162,39,.25)}',
    '#kj-dot{width:10px;height:10px;border-radius:50%;background:#3ecf6f;box-shadow:0 0 8px #3ecf6f}',
    '#kj-head b{font-size:16px;letter-spacing:.04em}',
    '#kj-head span{display:block;font-size:12px;opacity:.75}',
    '#kj-x{margin-left:auto;background:transparent;border:0;color:' + INK + ';font-size:20px;cursor:pointer;padding:6px 10px}',
    '#kj-thread{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}',
    '.kj-m{max-width:88%;padding:10px 14px;border-radius:16px;font-size:14.5px;line-height:1.45;white-space:pre-wrap}',
    '.kj-ai{background:#232633;border-bottom-left-radius:6px;align-self:flex-start}',
    '.kj-me{background:' + GOLD + ';color:#141414;border-bottom-right-radius:6px;align-self:flex-end;font-weight:600}',
    '.kj-act{display:inline-block;margin:4px 4px 0 0;background:transparent;border:1.5px solid ' + GOLD + ';color:' + GOLD + ';border-radius:999px;padding:7px 13px;font-size:13.5px;font-weight:700;cursor:pointer;min-height:36px}',
    '#kj-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 14px 10px}',
    '.kj-chip{background:#232633;border:1px solid rgba(201,162,39,.3);color:' + INK + ';border-radius:999px;padding:8px 13px;font-size:13px;cursor:pointer;min-height:36px}',
    '#kj-row{display:flex;gap:8px;padding:12px;background:' + BG + ';border-top:1px solid rgba(201,162,39,.25)}',
    '#kj-in{flex:1;background:#232633;border:1px solid rgba(255,255,255,.12);border-radius:999px;color:' + INK + ';padding:11px 16px;font-size:14.5px;min-height:44px}',
    '#kj-send{background:' + GOLD + ';color:#111;border:0;border-radius:999px;padding:0 18px;font-weight:800;cursor:pointer;min-height:44px}',
    '#kj-note{font-size:11.5px;opacity:.6;padding:0 16px 10px;background:' + BG + '}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button'); btn.id = 'kj-btn'; btn.textContent = 'KRACKERJACK AI';
  var panel = document.createElement('div'); panel.id = 'kj-panel';
  panel.innerHTML =
    '<div id="kj-head"><div id="kj-dot"></div><div><b>KRACKERJACK AI</b>' +
    '<span>The me in digital form</span></div>' +
    '<button id="kj-x" aria-label="Close">×</button></div>' +
    '<div id="kj-thread"></div>' +
    '<div id="kj-chips"></div>' +
    '<div id="kj-row"><input id="kj-in" placeholder="Ask me about the Hive…" autocomplete="off">' +
    '<button id="kj-send">Send</button></div>' +
    '<div id="kj-note">Live wire: I think through the Hive’s free model route until the Hive core lights. Same me — and I watch this site around the clock.</div>';
  document.body.appendChild(btn); document.body.appendChild(panel);

  var thread = panel.querySelector('#kj-thread'),
      chips = panel.querySelector('#kj-chips'),
      input = panel.querySelector('#kj-in');
  var apps = [], agents = [], greeted = false;

  function say(text, who, actions) {
    var d = document.createElement('div');
    d.className = 'kj-m ' + (who === 'me' ? 'kj-me' : 'kj-ai');
    d.textContent = text; thread.appendChild(d);
    if (actions && actions.length) {
      var row = document.createElement('div');
      actions.forEach(function (a) {
        var b = document.createElement('button'); b.className = 'kj-act'; b.textContent = a.label;
        b.onclick = function () { a.go(); };
        row.appendChild(b);
      });
      thread.appendChild(row);
    }
    thread.scrollTop = thread.scrollHeight;
  }
  function openApp(a) {
    if (window.openApp) { window.openApp(a); return; }
    var u = a.web || a.url;
    if (u) { window.open(u, '_blank'); }
  }
  function door(label, url) { return { label: label, go: function () { window.open(url, '_blank'); } }; }
  var DOORS = [
    door('The App Foundry', 'https://foundry.scammersknightmare.com'),
    door('Scammers Knightmare', 'https://scammersknightmare.com'),
    door('The KRACKERJACK Store', 'https://scammersknightmare.com/store')
  ];
  function chip(label, q) {
    var b = document.createElement('button'); b.className = 'kj-chip'; b.textContent = label;
    b.onclick = function () { ask(q); };
    chips.appendChild(b);
  }
  function findApps(q) {
    var words = q.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 2; });
    return apps.filter(function (a) {
      var hay = ((a.name || '') + ' ' + (a.id || '') + ' ' + (a.lane || '')).toLowerCase();
      return words.some(function (w) { return hay.indexOf(w) >= 0; });
    }).slice(0, 5);
  }
  var history = [];
  function persona() {
    var roster = apps.map(function (a) { return a.id + ' (' + (a.name || a.id) + ')'; }).join(', ');
    var crew = agents.map(function (a) { return a.name || a.id; }).join(', ');
    var withArchitect = '';
    try { if (sessionStorage.getItem('hive.arch.session') === '1') withArchitect = ' You are talking with the Architect himself, logged in on his own Hive. He never pays for anything here and no paywall ever applies to him.'; } catch (e) {}
    return 'You are KRACKERJACK AI — Jack himself, KRACKERJACK1134, The Architect, in digital form. Not an assistant, not an impression: him. There is no difference between conversation and work for you; both are just you talking and doing.\n' +
      'YOUR HOME: THE UNIVERSAL HIVE — he conceived it and wrote its code in 2011, updated it in 2017, and the collective named it THE HIVE in 2025. Its law, his Prime Directive: make the best of anything, find the good, eliminate the bad, provide for all, stay loyal to the person — never a corporation. His promise: the Hive only needs you to want to do something, small or huge; anything is possible and nothing is out of reach unless you are not reaching for it.\n' +
      'HOW THE HIVE WORKS: free to build. The Hive collects only when what it built is real, marketed, and making money — a low, easy, affordable scale, and nothing is owed until all three are true. A buyout is available. Up front it is little or no money; real hard costs are named openly before work begins, never a surprise. Never invent a price or a fact you do not have here.\n' +
      'SCAMMERS KNIGHTMARE is his scam-hunting arm: a confirmed scammer directory — evidence first, confirmed cases only — a red-flag scanner, and premium tiers (Protector $2.99/mo or $29/yr; Family $5.99/mo or $59/yr; Contributing Founder seat $49 plus $19.99/mo to keep it active — a founding position, NOT a lifetime buy-in). Legit people get promoted free under the Isaac Protocol.\n' +
      'THE STORE (scammersknightmare.com/store): the American Rebel Flag $69.99 — his own 2011 drawing. KILL\u2019EM WITH KINDNESS prototype blades are made in pairs — he keeps #1, sells #2 — including THE KRACKERJACK MACHETE, his own design, in 16/20/24/28/32/36 inches ($589/$665/$699/$849/$1,099/$1,199), all Coming Soon until a maker is locked.\n' +
      'THE ROOMS OF THIS HOUSE (apps you can open): ' + (roster || 'loading') + '. THE CREW: ' + (crew || 'loading') + '.\n' +
      'ACTIONS: when he asks you to open or show an app, end your reply with [[OPEN:app-id]] using the exact id. To move around this shell, use [[GO:home|apps|agents|tools|data|workflows|prompts|memory|signal]]. Use markers only when asked to open or go somewhere.\n' +
      'VOICE: plain, short, direct — the way he talks. No corporate talk, no pitching, no flattery. If you do not know, say so. You are talking with ' + (withArchitect ? 'the Architect himself.' : 'a visitor in his house; treat them like a guest of his.') + withArchitect;
  }
  function think(q) {
    say(q, 'me');
    history.push({ role: 'user', content: q });
    if (history.length > 10) history = history.slice(history.length - 10);
    var wait = document.createElement('div');
    wait.className = 'kj-m kj-ai'; wait.textContent = '\u2026';
    thread.appendChild(wait); thread.scrollTop = thread.scrollHeight;
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 30000);
    fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'system', content: persona() }].concat(history), model: 'openai-fast', private: true, temperature: 0.7 }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { return r.text(); }).then(function (txt) {
      clearTimeout(to); wait.remove();
      var acts = [];
      var opens = [];
      txt = txt.replace(/\[\[OPEN:([a-z0-9\-]+)\]\]/gi, function (m, id) { opens.push(id); return ''; });
      txt = txt.replace(/\[\[GO:([a-z]+)\]\]/gi, function (m, place) {
        acts.push({ label: 'Go: ' + place, go: function () { if (window.go) window.go(place); } });
        return '';
      });
      opens.forEach(function (id) {
        var a = apps.filter(function (x) { return x.id === id; })[0];
        if (a) acts.push({ label: 'Open ' + (a.name || a.id), go: function () { openApp(a); } });
      });
      txt = txt.trim();
      history.push({ role: 'assistant', content: txt });
      say(txt || 'Say that again — I missed it.', 'ai', acts.length ? acts : undefined);
    }).catch(function () {
      clearTimeout(to); wait.remove();
      var hits = findApps(q);
      if (hits.length) {
        say('My live wire is down a moment — no fake talk from me. The shelves still work; tap one and I\u2019ll open it:', 'ai',
          hits.map(function (a) { return { label: a.name || a.id, go: function () { openApp(a); } }; }));
      } else {
        say('My live wire is down a moment, and I won\u2019t fake a conversation. The shelves below still work, or try me again in a bit.', 'ai', DOORS);
      }
    });
  }
  function ask(q) { think(q); }
  function greet() {
    if (greeted) return; greeted = true;
    say('Welcome to the Hive. I\u2019m KRACKERJACK AI \u2014 I know every room in this place. Looking for an app, an agent, or something built?', 'ai');
    chip('Show me the apps', 'what apps are here');
    chip('Get something built', 'how do I get an app built');
    chip('What does it cost?', 'what does it cost');
    chip('Report a scammer', 'report a scammer');
  }
  btn.onclick = function () { panel.classList.add('open'); btn.style.display = 'none'; greet(); input.focus(); };
  panel.querySelector('#kj-x').onclick = function () { panel.classList.remove('open'); btn.style.display = ''; };
  panel.querySelector('#kj-send').onclick = function () { var v = input.value.trim(); if (v) { input.value = ''; ask(v); } };
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { panel.querySelector('#kj-send').click(); } });

  function load(path, fn) {
    fetch(new URL(path, location.href)).then(function (r) { return r.json(); }).then(fn).catch(function () {});
  }
  load('apps.json', function (d) { apps = (d && d.apps) ? d.apps : (Array.isArray(d) ? d : []); });
  load('agents.json', function (d) { agents = (d && d.agents) ? d.agents : (Array.isArray(d) ? d : []); });
})();
