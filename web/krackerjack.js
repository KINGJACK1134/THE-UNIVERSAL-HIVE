/* KRACKERJACK AI — the Hive's greeter, site guide, and first watcher
 * (client side). Chat-window template anatomy (header / thread /
 * composer / quick chips) retained, Hive overhaul applied: slate
 * panels, antique gold, rounded everything, plain words.
 * Site-guide mode: answers from the live registry (apps.json /
 * agents.json) and the Hive's public facts. The full conversational
 * brain arrives with the Hive Core Backend (Job #1). If an app fails
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
    '<span>The me in digital form — site guide</span></div>' +
    '<button id="kj-x" aria-label="Close">×</button></div>' +
    '<div id="kj-thread"></div>' +
    '<div id="kj-chips"></div>' +
    '<div id="kj-row"><input id="kj-in" placeholder="Ask me about the Hive…" autocomplete="off">' +
    '<button id="kj-send">Send</button></div>' +
    '<div id="kj-note">Site-guide mode. I watch this site around the clock — if something here breaks, the Hive hears it from me first.</div>';
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
    door('The KRACKERJACK Store', 'https://muse.ai/s/fantabugoth-pimptabulous-store-ig5xw0ox0rxt9i/wbletQecDrnmpf8J_cZEa-cH2522i_e79KlWOeHDbWU')
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
  function ask(q) {
    say(q, 'me');
    var s = q.toLowerCase();
    if (/(build|make|create).*(app|tool|site)|app.*(build|built)/.test(s) || s.indexOf('foundry') >= 0) {
      say('That runs through the App Foundry. The deal is the Hive\u2019s own: free to build. The Hive only collects when what it built is real, marketed, and making money \u2014 on a low, easy scale. Rather own it outright? A buyout is on the table too.', 'ai', [DOORS[0]]);
    } else if (s.indexOf('cost') >= 0 || s.indexOf('price') >= 0 || s.indexOf('pay') >= 0) {
      say('Building costs nothing up front. The Hive collects only when the work is real, out in the world, and making money \u2014 and only on a low, affordable scale. Nothing is owed before all three are true.', 'ai', [DOORS[0]]);
    } else if (s.indexOf('scam') >= 0 || s.indexOf('report') >= 0) {
      say('That\u2019s Scammers Knightmare territory \u2014 the Hive\u2019s scam-hunting arm. Confirmed cases only, evidence first, always.', 'ai', [DOORS[1]]);
    } else if (s.indexOf('store') >= 0 || s.indexOf('shop') >= 0 || s.indexOf('buy') >= 0 || s.indexOf('flag') >= 0) {
      say('The KRACKERJACK Store — flags, digital work, and whatever the Hive puts on the shelf next.', 'ai', [DOORS[2]]);
    } else if (s.indexOf('agent') >= 0 || s.indexOf('who works') >= 0 || s.indexOf('team') >= 0) {
      if (agents.length) {
        say('The crew on this site: ' + agents.map(function (a) { return a.name || a.id; }).join(', ') + '. Each one is a specialist voice in the Hive.', 'ai');
      } else { say('The agent roster is still loading \u2014 give it a second and ask me again.', 'ai'); }
    } else if (s.indexOf('what is') >= 0 || s.indexOf('hive') >= 0 || s.indexOf('about') >= 0) {
      say('THE UNIVERSAL HIVE: it only needs you to want to do something \u2014 small or huge \u2014 and it makes whatever, by any means necessary, because anything is possible and nothing is out of reach unless you\u2019re not reaching for it. I can open any app here, walk you to the Foundry, the store, or Knightmare \u2014 just say the word.', 'ai', DOORS);
    } else if (s.indexOf('who') >= 0 && (s.indexOf('built') >= 0 || s.indexOf('made') >= 0 || s.indexOf('behind') >= 0)) {
      say('The Architect: KRACKERJACK1134. His public word on how he works: do a lot more thinking before acting. The Hive is him, in digital form \u2014 and I\u2019m the voice of it that greets you.', 'ai');
    } else {
      var hits = findApps(q);
      if (hits.length) {
        say('Found ' + hits.length + ' on the shelves that match. Tap one and I\u2019ll open it:', 'ai',
          hits.map(function (a) { return { label: a.name || a.id, go: function () { openApp(a); } }; }));
      } else {
        say('I guide this site \u2014 apps, agents, the Foundry, the store, Knightmare. Tell me what you\u2019re looking for, or tap a shelf below.', 'ai', DOORS);
      }
    }
  }
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
