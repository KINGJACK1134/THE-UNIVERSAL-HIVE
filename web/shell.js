// THE UNIVERSAL HIVE — shell. One registry, every app/agent/tool/service has a place.
const LAW = "Provide for all. Find the good. Never limit unnecessarily.";
const RAIL = [
  ["home", "⌂", "Home"], ["apps", "▦", "Apps"], ["agents", "✦", "Agents"],
  ["tools", "⚙", "Tools"], ["data", "▤", "Data"], ["workflows", "↻", "Workflows"],
  ["prompts", "✎", "Prompts"], ["memory", "❖", "Memory"], ["signal", "◈", "Signal"],
];
let MAN = null, PLACE = "home", OP = load("operator", "");

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function store(k, v) { localStorage.setItem("hive." + k, JSON.stringify(v)); }
function load(k, d) { try { return JSON.parse(localStorage.getItem("hive." + k)) ?? d; } catch { return d; } }
async function jget(p) { const r = await fetch(p); if (!r.ok) throw new Error(r.status); return r.json(); }
async function jpost(p, b) {
  const r = await fetch(p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b || {}) });
  return { status: r.status, ...(await r.json().catch(() => ({}))) };
}

function railHTML() {
  const c = MAN ? MAN.counts : {};
  const n = { apps: c.apps, agents: c.agents, tools: c.tools, services: c.services, prompts: c.pending_prompts };
  return RAIL.map(([id, ic, label]) =>
    `<button data-place="${id}" class="${id === PLACE ? "on" : ""}"><span class="ic">${ic}</span>${label}${
      n[id] ? `<span class="n">${n[id]}</span>` : ""}</button>`).join("");
}

function go(place) {
  PLACE = place;
  $("#rail").innerHTML = railHTML();
  $("#rail").onclick = e => { const b = e.target.closest("[data-place]"); if (b) go(b.dataset.place); };
  ({ home: pHome, apps: pApps, agents: pAgents, tools: pTools, data: pData,
     workflows: pWorkflows, prompts: pPrompts, memory: pMemory, signal: pSignal }[place] || pHome)();
}

// ---- places ----------------------------------------------------------------
function pHome() {
  const c = MAN.counts;
  $("#place").innerHTML = `
    <h2>Home</h2><div class="sub">Everything in the Hive, in one place.</div>
    <div class="stat"><span><b>${c.apps}</b> apps (${c.apps_built} live)</span>·<span><b>${c.agents}</b> agents</span>·
      <span><b>${c.tools}</b> tools</span>·<span><b>${c.services}</b> services</span>${c.pending_prompts ? `·<span><b>${c.pending_prompts}</b> prompt requests waiting</span>` : ""}</div>
    <div class="cards" style="margin-top:12px">
      ${[["apps", "Apps", "Absorbed apps, each with a place. Open them right here."],
         ["agents", "Agents", "Talk to any agent; each keeps its own system prompt."],
        ["tools", "Tools", `${c.tools} deterministic tools any agent can call.`],
        ["data", "Data", "kv, documents, channels, tokens, tasks."],
        ["workflows", "Workflows", "Scheduled jobs that run on their own."],
        ["prompts", "Prompts", "Per-agent system prompts + approval workflow."],
        ["memory", "Memory", "Chained memory + learning."],
        ["signal", "Signal", "Device-local operator notes."],
      ].map(([id, t, d]) => `<div class="card"><h3>${t}</h3><p class="meta">${d}</div>
        <div class="row"><button class="pri" data-go="${id}">OPEN</button></div></div>`).join("")}
    </div>`;
  $("#place").onclick = e => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); };
}

function pApps() {
  const apps = MAN.apps.slice().sort((a, b) => (a.lane + a.id).localeCompare(b.lane + b.id));
  $("#place").innerHTML = `<h2>Apps</h2><div class="sub">${apps.length} absorbed apps — each keeps its stack; OPEN runs it inside the shell.</div>
    <input id="app-q" placeholder="filter apps / lanes"/>
    <div class="cards" id="app-list" style="margin-top:10px"></div>`;
  const paint = q => {
    const list = apps.filter(a => !q || (a.name + a.id + a.lane).toLowerCase().includes(q));
    $("#app-list").innerHTML = list.map(a => `
      <div class="card"><h3>${a.badge || ""}${a.name || a.id}</h3>
        <p class="meta"><span class="badge ${a.built ? "live" : "app"}">${a.built ? "LIVE" : "BUILD"}</span>${a.lane} · ${a.id} · ${a.kind || "app"}</div>
      <div class="row"><button class="pri" data-open="${a.id}">OPEN</button>${a.source_repo ? `<button class="gh" data-repo="${a.source_repo}">REPO</button>` : ""}</div>
      </div>`).join("") || "<div class='card'>no matches</div>";
  };
  $("#app-q").oninput = e => paint(e.target.value.toLowerCase().trim());
  paint("");
  $("#app-list").onclick = e => {
    const open = e.target.closest("[data-open]"), rep = e.target.closest("[data-repo]");
    if (open) { const a = apps.find(x => x.id === open.dataset.open); if (a) openApp(a); }
    if (rep) window.open(rep.dataset.repo, "_blank");
  };
}

function pAgents() {
  $("#place").innerHTML = `<h2>Agents</h2><div class="sub">Every agent has its own system prompt, directive and console.</div>
    <div class="cards" id="ag-list"></div>`;
  $("#ag-list").innerHTML = MAN.agents.map(a => `
    <div class="card"><h3>${a.name}</h3>
      <div class="meta">${a.desc || a.notes || ""}<br>
        <span class="badge ${a.prompt_set ? "live" : ""}">${a.prompt_set ? "prompt set" : "base only"}</span>
        ${a.task_set ? '<span class="badge live">directive</span>' : ""}</div>
      <div class="row"><button class="pri" data-agt="${a.id}">OPEN</button>
      <button class="gh" data-prompt="${a.id}">PROMPT</button></div></div>`).join("");
  $("#ag-list").onclick = e => {
    const o = e.target.closest("[data-agt]"), p = e.target.closest("[data-prompt]");
    if (o) openAgent(o.dataset.agt);
    if (p) { go("prompts"); }
  };
}

function pTools() {
  const cats = {};
  MAN.tools.forEach(t => (cats[t.category] = cats[t.category] || []).push(t));
  $("#place").innerHTML = `<h2>Tools</h2><div class="sub">${MAN.tools.length} deterministic, sandboxed tools. RUN one right here.</div>
    ${Object.keys(cats).sort().map(cat => `
      <div class="card" style="margin-bottom:9px"><h3>${cat}</h3>
        <div class="cards">${cats[cat].map(t => `
          <div class="card"><h3>${t.name}</h3><div class="meta">${t.desc}</div>
          <div class="row"><button class="gh" data-tool="${t.name}">RUN</button></div></div>`).join("")}</div>
      </div>`).join("")}`;
  $("#place").onclick = e => { const b = e.target.closest("[data-tool]"); if (b) openTool(MAN.tools.find(t => t.name === b.dataset.tool)); };
}

function pData() {
  const s = MAN.core;
  $("#place").innerHTML = `<h2>Data</h2><div class="sub">The Hive's own store. No outside database.</div>
    <div class="card"><h3>Counters</h3><pre class="out" id="d-stats">${Object.entries(s).map(([k, v]) => k.padEnd(11) + v).join("\n")}</pre></div>
    <div class="card" style="margin-top:9px"><h3>Key / Value</h3>
      <div class="row"><input id="kv-s" placeholder="scope" value="app"/><input id="kv-k" placeholder="key"/></div>
      <input id="kv-v" placeholder="value (JSON or text)"/><button class="pri" id="kv-set">SET (operator)</button>
      <pre class="out" id="kv-o">—</pre></div>
    <div class="card" style="margin-top:9px"><h3>Channels</h3>
      <div class="row"><input id="ch-n" placeholder="channel" value="general"/><input id="ch-a" placeholder="author" value="operator"/></div>
      <textarea id="ch-m" rows="2" placeholder="message"></textarea>
      <button class="pri" id="ch-post">POST</button>
      <pre class="out" id="ch-o">—</pre></div>`;
  $("#kv-set").onclick = async () => {
    let v = $("#kv-v").value; try { v = JSON.parse(v); } catch {}
    const r = await jpost("/api/core", { module: "kv", action: "set", scope: $("#kv-s").value, key: $("#kv-k").value, val: v, operator: OP });
    $("#kv-o").textContent = r.error || JSON.stringify(r.val);
  };
  $("#ch-post").onclick = async () => {
    const name = $("#ch-n").value || "general";
    await jpost("/api/core", { module: "channel", action: "post", name, author: $("#ch-a").value, msg: $("#ch-m").value });
    const d = await jget("/api/core?module=channel&name=" + encodeURIComponent(name));
    $("#ch-o").textContent = (d.messages || []).map(m => `[${m.created}] ${m.author}: ${m.msg}`).join("\n");
  };
}

async function pWorkflows() {
  $("#place").innerHTML = `<h2>Workflows</h2><div class="sub">Durable jobs. Scheduler runs due tasks (tick).</div>
    <div class="card"><div class="row"><button class="pri" id="wf-tick">RUN DUE (tick)</button></div>
      <pre class="out" id="wf-o">—</pre></div>
    <div class="card" style="margin-top:9px"><h3>New task</h3>
      <input id="wf-name" placeholder="name"/><input id="wf-kind" placeholder="kind: note | plugin | agent"/>
      <textarea id="wf-spec" rows="3" placeholder='spec JSON, e.g. {"name":"time.now","interval_seconds":60}'></textarea>
      <button class="pri" id="wf-add">ADD</button></div>
    <div class="card" style="margin-top:9px"><h3>Tasks</h3><div id="wf-list">loading…</div></div>`;
  const refresh = async () => {
    const d = await jget("/api/core?module=task");
    $("#wf-list").innerHTML = (d.tasks || []).length ? `<div class="cards">${d.tasks.map(t => `
      <div class="card"><h3>${t.name}</h3><div class="meta">${t.kind} · ${t.id} · last ${t.last || "never"}</div>
      <div class="row"><button class="gh" data-run="${t.id}">RUN NOW</button></div></div>`).join("")}</div>` : "no tasks";
  };
  $("#wf-add").onclick = async () => {
    let spec = {}; try { spec = JSON.parse($("#wf-spec").value || "{}"); } catch {}
    await jpost("/api/core", { module: "task", action: "add", name: $("#wf-name").value || "job", kind: $("#wf-kind").value || "note", spec, operator: OP });
    refresh();
  };
  $("#wf-o").textContent = "ready";
  $("#place").onclick = e => {
    const run = e.target.closest("[data-run]");
    if (run) jpost("/api/core", { module: "task", action: "run", id: run.dataset.run, operator: OP }).then(r => $("#wf-o").textContent = JSON.stringify(r, null, 2));
    if (e.target.id === "wf-tick") jpost("/api/core", { module: "task", action: "tick", operator: OP }).then(r => $("#wf-o").textContent = JSON.stringify(r, null, 2));
  };
  refresh();
}

function pPrompts() {
  $("#place").innerHTML = `<h2>Prompts</h2><div class="sub">Each agent's own system prompt + live directive. Operator sets directly; friends request, operator approves, it applies and returns.</div>
    <div class="card"><input id="op" placeholder="operator callsign" value="${OP}"/><div class="row"><button class="gh" id="pr-load">LOAD</button></div>
      <div id="pr-list" class="cards" style="margin-top:9px"></div></div>
    <div class="card" style="margin-top:9px"><h3>Set directly (operator)</h3>
      <input id="pr-a" placeholder="agent id"/><textarea id="pr-p" rows="3" placeholder="system prompt"></textarea>
      <textarea id="pr-t" rows="2" placeholder="live directive / task (optional)"></textarea>
      <button class="pri" id="pr-save">SAVE</button><pre class="out" id="pr-o">—</pre></div>
    <div class="card" style="margin-top:9px"><h3>Request a change (friend)</h3>
      <input id="rq-a" placeholder="agent id"/><select id="rq-k"><option value="prompt">system prompt</option><option value="task">directive/task</option></select>
      <textarea id="rq-t" rows="3" placeholder="proposed prompt"></textarea><input id="rq-n" placeholder="your name"/>
      <input id="rq-c" placeholder="contact for the answer"/><button class="pri" id="rq-send">SEND TO OPERATOR</button>
      <pre class="out" id="rq-o">—</pre></div>
    <div class="card" style="margin-top:9px"><h3>Pending (operator)</h3><div id="rq-list">—</div></div>
    <div class="card" style="margin-top:9px"><h3>Check my request</h3><input id="rq-id" placeholder="request id"/><button class="gh" id="rq-chk">CHECK</button><pre class="out" id="rq-chk-o">—</pre></div>`;
  const opv = () => { OP = $("#op").value.trim(); store("operator", OP); $("#who").textContent = OP || ""; return OP; };
  const load = async () => {
    const d = await jget("/api/prompts");
    $("#pr-list").innerHTML = d.agents.map(a => `
      <div class="card"><h3>${a.agent}</h3><div class="meta">${a.prompt ? "prompt by " + a.prompt_by : "base only"}${a.task ? " · directive" : ""}</div>
      <button class="gh" data-fill="${a.agent}" data-p="${encodeURIComponent(a.prompt || "")}" data-t="${encodeURIComponent(a.task || "")}">EDIT</button></div>`).join("");
    $("#rq-list").innerHTML = (d.pending || []).length ? `<div class="cards">${d.pending.map(r => `
      <div class="card"><h3>${r.agent} · ${r.kind}</h3><div class="meta">from ${r.requester}${r.contact ? " (" + r.contact + ")" : ""} · ${r.id}</div>
      <pre class="out">${r.text.replace(/</g, "&lt;")}</pre>
      <div class="row"><button class="pri" data-ap="${r.id}">APPROVE</button><button class="dn" data-dn="${r.id}">DENY</button></div></div>`).join("")}</div>` : "no pending";
  };
  $("#pr-list").onclick = e => {
    const b = e.target.closest("[data-fill]"); if (!b) return;
    $("#pr-a").value = b.dataset.fill; $("#pr-p").value = decodeURIComponent(b.dataset.p); $("#pr-t").value = decodeURIComponent(b.dataset.t);
  };
  $("#rq-list").onclick = async e => {
    const ap = e.target.closest("[data-ap]"), dn = e.target.closest("[data-dn]");
    if (ap) { const r = await jpost(`/api/prompts/requests/${ap.dataset.ap}/approve`, { operator: opv() }); alert(r.error || ("approved → " + r.applied_to)); load(); }
    if (dn) { await jpost(`/api/prompts/requests/${dn.dataset.dn}/deny`, { operator: opv() }); load(); }
  };
  $("#pr-load").onclick = () => { opv(); load(); };
  $("#pr-save").onclick = async () => {
    const body = { operator: opv() };
    if ($("#pr-p").value.trim()) body.prompt = $("#pr-p").value;
    if ($("#pr-t").value.trim()) body.task = $("#pr-t").value;
    const r = await jpost("/api/prompts/" + encodeURIComponent($("#pr-a").value.trim()), body);
    $("#pr-o").textContent = r.error || ("saved to " + $("#pr-a").value.trim());
  };
  $("#rq-send").onclick = async () => {
    const r = await jpost("/api/prompts/request", { agent: $("#rq-a").value.trim(), kind: $("#rq-k").value, text: $("#rq-t").value,
      requester: $("#rq-n").value.trim(), contact: $("#rq-c").value.trim() });
    $("#rq-o").textContent = r.error || ("sent. request id: " + r.request.id + "\n" + r.note);
  };
  $("#rq-chk").onclick = async () => {
    const d = await jget("/api/prompts/requests/" + encodeURIComponent($("#rq-id").value.trim()));
    $("#rq-chk-o").textContent = d.error || (d.status + ": " + ((d.delivery || {}).message || d.text));
  };
  load().catch(() => $("#pr-list").textContent = "hive node offline");
}

function pMemory() {
  $("#place").innerHTML = `<h2>Memory</h2><div class="sub">EMPLOYEE ALPHA's persistent, tamper-evident memory.</div>
    <div class="card"><h3>Status</h3><pre class="out" id="m-s">—</pre>
      <div class="row"><button class="gh" id="m-chain">SHOW CHAIN</button><button class="gh" id="m-verify">VERIFY</button></div></div>
    <div class="card" style="margin-top:9px"><h3>Teach a fact</h3>
      <textarea id="m-t" rows="2" placeholder="fact to remember"></textarea><button class="pri" id="m-rem">REMEMBER</button>
      <pre class="out" id="m-o">—</pre></div>`;
  jget("/api/employee-alpha/status").then(s => $("#m-s").textContent = JSON.stringify(s, null, 2)).catch(() => $("#m-s").textContent = "offline");
  $("#m-chain").onclick = async () => {
    const r = await jpost("/api/employee-alpha/chat", { prompt: '@plugin memory.chain {"n":10}' });
    $("#m-o").textContent = JSON.stringify(r.plugin ? r.plugin.result : r.text, null, 2);
  };
  $("#m-verify").onclick = async () => {
    const r = await jpost("/api/employee-alpha/chat", { prompt: "@plugin memory.verify" });
    $("#m-o").textContent = JSON.stringify(r.plugin ? r.plugin.result : r.text, null, 2);
  };
  $("#m-rem").onclick = async () => {
    const r = await jpost("/api/employee-alpha/remember", { text: $("#m-t").value });
    $("#m-o").textContent = r.stored ? "remembered: " + r.stored.text : (r.error || "?");
  };
}

function pSignal() {
  const rows = load("signal", []);
  $("#place").innerHTML = `<h2>Signal</h2><div class="sub">Device-local notes. Not a third-party drop.</div>
    <div class="card"><input id="s-f" placeholder="callsign"/><textarea id="s-b" rows="4" placeholder="note"></textarea>
      <div class="row"><button class="pri" id="s-add">LOCK NOTE</button><button class="dn" id="s-clr">CLEAR</button></div>
      <pre class="out" id="s-o">${rows.slice(-14).join("\n") || "none"}</pre></div>`;
  const draw = () => $("#s-o").textContent = load("signal", []).slice(-14).join("\n") || "none";
  $("#s-add").onclick = () => { store("signal", load("signal", []).concat(`${new Date().toISOString()} ${$("#s-f").value}: ${$("#s-b").value}`)); draw(); };
  $("#s-clr").onclick = () => { store("signal", []); draw(); };
}

// ---- windows ---------------------------------------------------------------
function openWin(title, bodyHTML, { nopad = false } = {}, extURL = null) {
  $("#win-title").textContent = title;
  const body = $("#win-body"); body.className = "body" + (nopad ? " nopad" : ""); body.innerHTML = bodyHTML;
  $("#win").classList.add("open");
  $("#win-close").onclick = () => $("#win").classList.remove("open");
  $("#win-ext").style.display = extURL ? "" : "none";
  $("#win-ext").onclick = () => extURL && window.open(extURL, "_blank");
}
function openApp(a) {
  if (a.web && a.embed) return openWin(a.name || a.id, `<iframe src="${a.web}"></iframe>`, { nopad: true }, a.web);
  if (a.built && a.url) return openWin(a.name || a.id, `<iframe src="${a.url}"></iframe>`, { nopad: true }, a.url);
  openWin(a.name || a.id,
    `<div class="card"><h3>${a.name || a.id}</h3><div class="meta">${a.blurb || ""}</div>
      <p>${a.web ? "External app. " : "Not built on this node yet. "}${a.web ? `<a href="${a.web}" target="_blank">open live site</a> · ` : ""}
      ${a.source_repo ? `<a href="${a.source_repo}" target="_blank">source</a>` : ""}</p></div>`,
    {}, a.web || a.source_repo);
}
function openAgent(id) {
  const a = MAN.agents.find(x => x.id === id) || { id, name: id };
  openWin("Agent · " + a.name,
    `<div class="card"><div class="meta">${a.desc || ""}</div>
      <textarea id="ag-p" rows="3" placeholder="talk to ${id}…">Who are you?</textarea>
      <div class="row"><button class="pri" id="ag-go">SEND</button><button class="gh" id="ag-edit">EDIT PROMPT</button></div>
      <pre class="out" id="ag-o">ready</pre></div>`, {}, null);
  $("#ag-edit").onclick = () => { $("#win").classList.remove("open"); go("prompts"); };
  $("#ag-go").onclick = async () => {
    const p = $("#ag-p").value; $("#ag-o").textContent = "thinking…";
    const r = (id === "employee-alpha")
      ? await jpost("/api/employee-alpha/chat", { prompt: p, session: "shell" })
      : await jpost("/api/generate", { agent: id, prompt: p });
    $("#ag-o").textContent = (r.veto ? `[${r.veto}]\n` : "") + (r.text ?? r.seed_voice ?? JSON.stringify(r)) +
      (r.recalled && r.recalled.length ? "\n\nmemory: " + r.recalled.map(x => x.text).join(" | ") : "");
  };
}
function openTool(t) {
  openWin("Tool · " + t.name,
    `<div class="card"><div class="meta">${t.desc}</div>
      <textarea id="tl-args" rows="4" placeholder='args JSON, e.g. {"text":"hello"}'>{}</textarea>
      <button class="pri" id="tl-run">RUN</button><pre class="out" id="tl-o">—</pre></div>`);
  $("#tl-run").onclick = async () => {
    const r = await jpost("/api/employee-alpha/chat", { prompt: `@plugin ${t.name} ${$("#tl-args").value || "{}"}` });
    $("#tl-o").textContent = JSON.stringify(r.plugin ? r.plugin.result : r.text, null, 2);
  };
}

// ---- command palette -------------------------------------------------------
function paletteItems() {
  return [
    ...MAN.apps.map(a => ({ k: "app", id: a.id, name: a.name || a.id, meta: a.lane, open: () => openApp(a) })),
    ...MAN.agents.map(a => ({ k: "agent", id: a.id, name: a.name, meta: "agent", open: () => openAgent(a.id) })),
    ...MAN.tools.map(t => ({ k: "tool", id: t.name, name: t.name, meta: "tool · " + t.category, open: () => openTool(t) })),
    ...MAN.services.map(s => ({ k: "service", id: s.id, name: s.name, meta: "service", open: () => go({ store: "data", models: "data", channels: "data", workflows: "workflows" }[s.id] || s.id) })),
  ];
}
function openPalette(q) {
  $("#pal").classList.add("open"); $("#pal-in").value = q || ""; $("#pal-in").focus(); renderPal();
}
function renderPal() {
  const q = $("#pal-in").value.toLowerCase();
  const items = paletteItems().filter(i => !q || (i.name + i.id + i.meta + i.k).toLowerCase().includes(q)).slice(0, 40);
  $("#pal-res").innerHTML = items.map((i, n) => `<button data-i="${n}"><b>${i.name}</b> <span class="k">${i.k} · ${i.meta}</span></button>`).join("") || "<div style='padding:12px' class='k'>no match</div>";
  $("#pal-res").onclick = e => { const b = e.target.closest("[data-i]"); if (!b) return; $("#pal").classList.remove("open"); items[+b.dataset.i].open(); };
}

// ---- boot ------------------------------------------------------------------
async function boot() {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
  $("#who").textContent = OP || "";
  $("#cmd").onfocus = () => openPalette($("#cmd").value);
  $("#cmd").oninput = () => openPalette($("#cmd").value);
  $("#pal-in").oninput = renderPal;
  $("#pal-in").onkeydown = e => { if (e.key === "Enter") { const first = $("#pal-res button"); if (first) first.click(); } if (e.key === "Escape") $("#pal").classList.remove("open"); };
  $("#pal").onclick = e => { if (e.target.id === "pal") $("#pal").classList.remove("open"); };
  document.addEventListener("keydown", e => { if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { e.preventDefault(); openPalette(""); } });
  $("#win").onclick = e => { if (e.target.id === "win") $("#win").classList.remove("open"); };
  try {
    MAN = await jget("/api/shell");
    $("#dot").className = "dot up";
    $("#rail-foot").textContent = `online · ${MAN.counts.apps} apps · ${MAN.counts.tools} tools`;
  } catch {
    // Static (Pages) fallback: no live /api/shell here, so load the
    // build-generated apps.json instead of showing an empty shell.
    let apps = [];
    try { apps = await jget("apps.json"); } catch { apps = []; }
    if (!Array.isArray(apps)) apps = [];
    let agents = [];
    try { agents = await jget("agents.json"); } catch { agents = []; }
    if (!Array.isArray(agents)) agents = [];
    MAN = { law: LAW, apps, agents, tools: [], services: [], counts: { apps: apps.length, apps_built: apps.filter(a => a.built).length, agents: agents.length, tools: 0, services: 0, pending_prompts: 0 }, core: {}, models: {} };
    $("#dot").className = "dot";
    $("#rail-foot").textContent = `offline shell (Pages) · ${apps.length} apps — run the hive node for live data`;
  }
  go("home");
}
boot();

// ---- THE ARCHITECT'S LOGIN -------------------------------------------------
// DUAL SECURITY, the Architect's design. The button stays in plain sight
// and could be clicked a million times without opening:
//   Layer 1 (the knock): 6 SETS OF CLICKS on the one button, each set 1-9
//     clicks, a pause closing each set.
//   Layer 2 (his combination): the 6-button pad sequence he set himself.
// Both are set by the Architect alone, on this device. Only salted SHA-256
// hashes are kept (localStorage, this browser); the combination and the
// counts themselves are never stored or sent anywhere. Layer 2's original
// keys (arch.hash / arch.salt) are untouched — his existing combination
// stands exactly as he set it.
(function () {
  const btn = document.getElementById("arch-login");
  const ui = document.getElementById("arch-ui");
  const status = document.getElementById("arch-status");
  const dotsEl = document.getElementById("arch-dots");
  const padWrap = document.getElementById("arch-padwrap");
  const padEl = document.getElementById("arch-pad");
  const fsBtn = document.getElementById("arch-failsafe");
  const deactBtn = document.getElementById("arch-deact");
  const lockBtn = document.getElementById("arch-lock");
  if (!btn || !ui || !padEl) return;

  const PH = "arch.hash", PS = "arch.salt";      // layer 2 — his, untouched
  const KH = "arch.khash", KS = "arch.ksalt";    // layer 1 — the knock
  const ACT = "arch.act";                        // device activation flag
  const SES = "hive.arch.session";
  const GAP = 950, WINDOW = 30000;
  let stage = null;            // 'knock' | 'pad'
  let mode = "login";          // per-layer: 'login' | 'setup1' | 'setup2'
  let sets = [], cur = 0, entry = [], firstPass = null;
  let gapTimer = null, winTimer = null, fsArmed = false;

  padEl.innerHTML = RAIL.map(([id, ic, label]) =>
    `<button type="button" data-arch="${id}"><span class="ic">${ic}</span> ${label}</button>`).join("");

  const seatEl = document.getElementById("hive-seat");
  let seatNote = null;
  function applyArchitect(on) {
    document.body.classList.toggle("architect-in", !!on);
    if (!seatEl) return;
    if (on) {
      seatEl.style.display = "none";
      if (!seatNote) {
        seatNote = document.createElement("div");
        seatNote.className = "seat"; seatNote.id = "arch-seat-note";
        seatNote.innerHTML = "<h2>THE ARCHITECT IS IN</h2><p>This Hive is yours — no seat to claim, no paywall in your way. The claim pitch shows for everyone else. It never shows for you.</p>";
        seatEl.after(seatNote);
      }
      seatNote.style.display = "";
    } else {
      seatEl.style.display = "";
      if (seatNote) seatNote.style.display = "none";
    }
  }

  async function hashOf(str, salt) {
    const msg = salt + "|" + str;
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 0x811c9dc5;
    for (let i = 0; i < msg.length; i++) { h ^= msg.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return "fnv" + h.toString(16);
  }
  const fill = n => [...dotsEl.children].forEach((d, i) => d.classList.toggle("full", i < n));
  function say(t) { status.innerHTML = t; }
  function stopTimers() { clearTimeout(gapTimer); clearTimeout(winTimer); gapTimer = winTimer = null; }
  function newSalt() { return [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, "0")).join(""); }
  function endUI(msg) {
    stopTimers(); stage = null; sets = []; cur = 0; entry = []; firstPass = null; fsArmed = false;
    btn.classList.remove("armed"); padWrap.hidden = true; fill(0);
    if (msg) { say(msg); setTimeout(() => { ui.hidden = true; }, 2000); }
    else ui.hidden = true;
  }
  function armWindow() { clearTimeout(winTimer); winTimer = setTimeout(() => endUI("Time. The window closed."), WINDOW); }

  function startStage(st) {
    stage = st; sets = []; cur = 0; entry = []; fill(0);
    ui.hidden = false; btn.classList.add("armed");
    fsBtn.hidden = false; fsBtn.textContent = "FAIL SAFE"; fsArmed = false;
    if (deactBtn) deactBtn.hidden = st !== "pad";
    if (lockBtn) lockBtn.hidden = true;
    padWrap.hidden = st !== "pad";
    if (st === "knock") {
      mode = load(KH, "") ? "login" : "setup1";
      say(mode === "login" ? "The button sleeps on this device. Knock your six sets to wake it."
          : "First lock — set your knock: 6 sets of clicks on this button, 1 to 9 each, pause between sets.");
    } else {
      mode = load(PH, "") ? "login" : "setup1";
      say(mode === "login" ? "Knock accepted. Now your buttons."
          : "Second lock — set your button combination: press any 6.");
    }
    armWindow();
  }
  // ---- layer 1: the knock ----
  function closeSet() {
    if (cur > 0) { sets.push(cur); cur = 0; fill(sets.length); }
    if (sets.length >= 6) finishKnock();
  }
  async function finishKnock() {
    stopTimers();
    const str = sets.slice().join("-"); sets = []; fill(0);
    if (mode === "setup1") { firstPass = str; mode = "setup2"; say("Knock it once more, to confirm."); armWindow(); return; }
    if (mode === "setup2") {
      if (str !== firstPass) { endUI("Those knocks did not match. Click the button and set them again."); return; }
      const salt = newSalt();
      store(KS, salt); store(KH, await hashOf(str, salt));
      store(ACT, "1");
      say("Button activated. Now the second lock.");
      setTimeout(() => startStage("pad"), 700);
      return;
    }
    const ok = (await hashOf(str, load(KS, ""))) === load(KH, "");
    if (ok) { store(ACT, "1"); startStage("pad"); }
    else endUI("Not it.");
  }
  // ---- layer 2: his pad combination ----
  async function pressedPad(id) {
    if (stage !== "pad") return;
    entry.push(id); fill(entry.length);
    if (entry.length < 6) return;
    const str = entry.join(">"); entry = []; stopTimers();
    if (mode === "setup1") { firstPass = str; mode = "setup2"; fill(0); say("Once more, to confirm it."); armWindow(); return; }
    if (mode === "setup2") {
      if (str !== firstPass) { endUI("Those did not match. Start over from the knock."); return; }
      const salt = newSalt();
      store(PS, salt); store(PH, await hashOf(str, salt));
      endUI("Both locks are set — on this device, by you alone.");
      return;
    }
    const ok = (await hashOf(str, load(PS, ""))) === load(PH, "");
    if (ok) {
      sessionStorage.setItem(SES, "1");
      OP = "KRACKERJACK1134"; store("operator", OP);
      btn.classList.add("architect");
      btn.querySelector(".arch-label").textContent = "THE ARCHITECT — IN";
      const who = document.getElementById("who"); if (who) who.textContent = "KRACKERJACK1134 · THE ARCHITECT";
      applyArchitect(true);
      endUI("Welcome back, Architect.");
    } else {
      endUI("Not it.");
    }
  }
  padEl.addEventListener("click", e => { const b = e.target.closest("[data-arch]"); if (b) pressedPad(b.dataset.arch); });
  btn.addEventListener("click", () => {
    if (sessionStorage.getItem(SES) === "1") {
      ui.hidden = false; padWrap.hidden = true;
      fsBtn.hidden = true;
      if (lockBtn) lockBtn.hidden = false;
      if (deactBtn) deactBtn.hidden = false;
      say("You're in, Architect. Lock this session — or lock it all the way back to sleep.");
      return;
    }
    if (!stage) { startStage(load(ACT, "") ? "pad" : "knock"); }
    if (stage !== "knock") return;
    if (cur < 9) cur++;
    clearTimeout(gapTimer);
    gapTimer = setTimeout(closeSet, GAP);
  });
  function lockBack(full) {
    sessionStorage.removeItem(SES);
    applyArchitect(false);
    btn.classList.remove("architect");
    btn.querySelector(".arch-label").textContent = "THE ARCHITECT’S LOGIN";
    if (full) localStorage.removeItem("hive." + ACT);
    endUI(full ? "Locked all the way back. The button sleeps on this device — your knock wakes it."
               : "Locked. The button stays awake on this device; your combination opens it.");
  }
  if (lockBtn) lockBtn.addEventListener("click", () => lockBack(false));
  if (deactBtn) deactBtn.addEventListener("click", () => lockBack(true));
  fsBtn.addEventListener("click", () => {
    if (!fsArmed) {
      fsArmed = true;
      fsBtn.textContent = "TAP AGAIN TO WIPE BOTH LOCKS ON THIS DEVICE";
      say("Fail safe: wiping clears both locks set on this device so new ones can be set. Neither secret ever leaves this browser; the Hive-core connect code becomes the anywhere fail safe when the core is live.");
      return;
    }
    [PH, PS, KH, KS, ACT].forEach(k => localStorage.removeItem("hive." + k));
    sessionStorage.removeItem(SES);
    endUI("Wiped. Click the button and set your locks again.");
  });
  // ---- THE ADMIN UI (behind this login only) --------------------------------
  // Renders admin-manifest.json — the assimilation of the whole Hive: every
  // surface, agent, money rail, tool and data store, with its connection
  // state and direction. The rail door exists only while the Architect is in.
  let adminBtn = null;
  function showAdminDoor(on) {
    const rail = document.getElementById("rail");
    if (!rail) return;
    if (on && !adminBtn) {
      adminBtn = document.createElement("button");
      adminBtn.type = "button";
      adminBtn.innerHTML = '<span class="ic">\u2699</span> Admin UI';
      adminBtn.addEventListener("click", ev => { ev.stopPropagation(); renderAdmin(); });
      rail.appendChild(adminBtn);
    } else if (!on && adminBtn) { adminBtn.remove(); adminBtn = null; }
  }
  const CHIP = { live: "#7ee2a0", "front-only": "#e8c96a", "built-not-live": "#e8c96a",
                 "design-only": "#a7abb8", offline: "#e88a8a", gated: "#e8c96a", "artifact-only": "#a7abb8" };
  const KIND = { surface: "SURFACES & SITES", agent: "AGENTS & BOTS", money: "MONEY RAILS",
                 tool: "TOOLS & MODEL ROUTES", data: "DATA, MEMORY & IDENTITY" };
  async function renderAdmin() {
    const host = document.getElementById("place");
    if (!host) return;
    host.innerHTML = "<h2>THE ADMIN UI</h2><p class='muted'>Reading the Hive's connection manifest\u2026</p>";
    let m;
    try { m = await (await fetch("admin-manifest.json", { cache: "no-store" })).json(); }
    catch { host.innerHTML = "<h2>THE ADMIN UI</h2><p>The manifest is not on this host yet.</p>"; return; }
    const rows = m.rows || [];
    const counts = {};
    rows.forEach(r => { counts[r.state] = (counts[r.state] || 0) + 1; });
    let html = "<h2>THE ADMIN UI</h2>" +
      "<p class='muted'>The whole Hive, assimilated: " + rows.length + " connections. " +
      Object.entries(counts).map(([k, v]) => v + " " + k).join(" \u00b7 ") +
      ". Where a row says CORE-GATED, its wiring is drawn and it lights the day the Hive core (JOB #1) has a home.</p>";
    for (const [kind, title] of Object.entries(KIND)) {
      const kr = rows.filter(r => r.kind === kind);
      if (!kr.length) continue;
      html += "<h3 style='margin-top:22px'>" + title + "</h3>";
      for (const r of kr) {
        html += "<div class='seat' style='margin-bottom:10px'><h4 style='margin:0 0 4px'>" + r.name +
          " <span style='color:" + (CHIP[r.state] || "#a7abb8") + ";font-size:12px;letter-spacing:.08em'>" +
          r.state.toUpperCase() + " \u00b7 " + String(r.connect_action).toUpperCase() + "</span></h4>" +
          "<p style='margin:2px 0'><b>UI \u2192 it:</b> " + r.out + "</p>" +
          "<p style='margin:2px 0'><b>It \u2192 UI:</b> " + r.in + "</p>" +
          (r.gaps && r.gaps.length ? "<p style='margin:2px 0' class='muted'><b>Missing:</b> " + r.gaps.join("; ") + "</p>" : "") +
          (r.url ? "<p style='margin:6px 0 0'><a href='" + r.url + "' target='_blank' rel='noopener'>OPEN</a></p>" : "") +
          "</div>";
      }
    }
    host.innerHTML = html;
  }
  const _apply = applyArchitect;
  applyArchitect = function (on) { _apply(on); showAdminDoor(on); };

  if (sessionStorage.getItem(SES) === "1") {
    btn.classList.add("architect");
    btn.querySelector(".arch-label").textContent = "THE ARCHITECT — IN";
    OP = "KRACKERJACK1134";
    applyArchitect(true);
  }
})();
