#!/usr/bin/env python3
"""Generate a static apps index + apps.json for the Pages build."""
import html
import json
import os
import sys

apps_dir = sys.argv[1] if len(sys.argv) > 1 else "apps"
site = sys.argv[2] if len(sys.argv) > 2 else "site"

man = json.load(open(os.path.join(apps_dir, "APPS.json"), encoding="utf-8"))
out = []
for a in man:
    rel = f"apps/{a['lane']}/{a['id']}"
    built = os.path.isfile(os.path.join(site, rel, "index.html"))
    out.append({
        "lane": a["lane"], "id": a["id"], "name": a.get("name") or a["id"],
        "stack": a.get("stack", []), "source_repo": a.get("source_repo"),
        "built": built, "url": f"/{rel}/" if built else None,
        "web": a.get("web"), "embed": bool(a.get("embed")),
    })

# External entries (apps/EXTERNAL.json): live sites hosted elsewhere (OnSpace,
# Wix). They join apps.json so the static shell can launch them via web/embed.
try:
    _ext_path = os.path.join(apps_dir, "EXTERNAL.json")
    if os.path.isfile(_ext_path):
        for _e in json.load(open(_ext_path, encoding="utf-8")):
            out.append({
                "lane": _e.get("lane", "host"), "id": _e["id"],
                "name": _e.get("name") or _e["id"], "stack": [],
                "source_repo": None, "built": False, "url": None,
                "web": _e.get("url"), "embed": bool(_e.get("embed")),
            })
except Exception as _xe:  # never fail the site build over externals
    print(f"externals skipped: {_xe}")

json.dump(out, open(os.path.join(site, "apps.json"), "w", encoding="utf-8"), indent=2)

# --- agents.json: static twin of /api/shell's agents() for the Pages build.
# Derived from seed/registry.json + seed/prompts.json so the shell's Agents
# view has real data on static hosting (no live /api there).
try:
    _seed = os.path.dirname(os.path.abspath(__file__))
    _reg = json.load(open(os.path.join(_seed, "registry.json"), encoding="utf-8")).get("agents", {})
    _prm = json.load(open(os.path.join(_seed, "prompts.json"), encoding="utf-8"))
    _prompts = _prm.get("prompts", {}) or {}
    _tasks = _prm.get("tasks", {}) or {}
    _agents = []
    for _aid, _meta in _reg.items():
        _agents.append({
            "id": _aid,
            "name": _meta.get("name") or _aid,
            "desc": _meta.get("description") or "",
            "prompt_set": bool((_prompts.get(_aid) or {}).get("text")),
            "task_set": bool(_tasks.get(_aid)),
            "notes": _meta.get("notes", ""),
        })
    _agents.sort(key=lambda a: (a["id"] != "employee-alpha", a["id"]))
    json.dump(_agents, open(os.path.join(site, "agents.json"), "w", encoding="utf-8"), indent=2)
    print(f"generated agents.json ({len(_agents)} agents)")
except Exception as _e:  # never fail the site build over the agents index
    print(f"agents.json skipped: {_e}")

by_lane = {}
for a in out:
    by_lane.setdefault(a["lane"], []).append(a)

rows = []
for lane in sorted(by_lane):
    rows.append(f"<h2>{html.escape(lane)}</h2><ul>")
    for a in sorted(by_lane[lane], key=lambda x: x["id"]):
        if a["built"]:
            rows.append(f'<li><a href="/{html.escape(a["lane"])}/{html.escape(a["id"])}/">{html.escape(a["name"])}</a> <small>{html.escape(",".join(a["stack"]) or a["source_repo"] or "")}</small></li>')
        elif a.get("web"):
            rows.append(f'<li><a href="{html.escape(a["web"])}">{html.escape(a["name"])}</a> <small>live — hosted on OnSpace</small></li>')
        else:
            rows.append(f'<li class="off">{html.escape(a["name"])} <small>not built</small></li>')
    rows.append("</ul>")

page = f"""<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>THE UNIVERSAL HIVE — apps</title>
<style>body{{background:#0a0a0a;color:#e8e8e8;font:14px ui-monospace,monospace;margin:0;padding:24px}}
h1{{color:#7CFC00}}a{{color:#4fd1ff}}small{{color:#888}}.off{{opacity:.4}}
h2{{color:#ffb000;text-transform:uppercase;font-size:13px;margin:18px 0 6px}}
ul{{list-style:none;padding:0}}li{{padding:3px 0;border-bottom:1px solid #1a1a1a}}</style>
<h1>THE UNIVERSAL HIVE</h1><p><a href="/">← cockpit</a> · Provide for all. Find the good. Never limit unnecessarily.</p>
{''.join(rows)}
"""
open(os.path.join(site, "apps", "index.html"), "w", encoding="utf-8").write(page)
print(f"generated apps.json + apps/index.html ({sum(1 for a in out if a['built'])} live)")
