#!/usr/bin/env bash
# Assemble lane-built slices into a complete site/ for Pages.
# Runs AFTER the lane-sharded build jobs: each lane job uploaded its
# site/ slice (apps/<lane>/ + _report-<lane>.txt) as an artifact, and the
# workflow downloaded them all merged into site/.
# This script adds cockpit/docs/index, merges the per-lane truth reports
# into site/apps/_build_report.json, and optionally reports back.
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/site"
APPS="$ROOT/apps"

REPORT="$SITE/apps/_build_report.json"
MERGED_TXT="$SITE/apps/_report-all.txt"

mkdir -p "$SITE/apps"
cat "$SITE"/apps/_report-*.txt > "$MERGED_TXT" 2>/dev/null || : > "$MERGED_TXT"

# cockpit + static index
cp -a "$ROOT/web/." "$SITE/"
[ -d "$ROOT/docs" ] && { mkdir -p "$SITE/docs"; cp -a "$ROOT/docs/." "$SITE/docs/"; }
python3 "$ROOT/seed/ci_site.py" "$APPS" "$SITE" || true

# ASSET PATH REPAIR (2026-10-30): Vite-built apps emit root-absolute asset
# references (src="/assets/..."), but they are served from /apps/<lane>/<id>/
# subpaths, so the browser requests the bundle from the domain root, gets a
# 404, and the app opens dead (HIGH-JACKED AI was the reported case; every
# Vite-built app had it). Rewrite entry-document references to relative ones
# so each app resolves its own assets wherever it is served from.
find "$SITE/apps" -name 'index.html' -type f 2>/dev/null | while read -r f; do
  sed -i \
    -e 's#\(src\|href\)="/assets/#\1="./assets/#g' \
    -e 's#\(src\|href\)="/manifest.json"#\1="./manifest.json"#g' \
    -e 's#\(src\|href\)="/vite.svg"#\1="./vite.svg"#g' \
    "$f"
done
# CSS files live inside assets/; root-absolute asset urls inside CSS get the
# same treatment, relative to the CSS file itself.
find "$SITE/apps" -name '*.css' -type f 2>/dev/null | while read -r f; do
  sed -i 's#url(/assets/#url(./#g' "$f"
done
echo "asset path repair applied"

# per-app truth report, merged from every lane (also lands in the Pages
# deploy + github-pages artifact)
python3 - "$MERGED_TXT" "$REPORT" <<'PY'
import json, sys
rows_file, out = sys.argv[1:3]
rows = {}
for line in open(rows_file):
    line = line.rstrip("\n")
    if not line:
        continue
    app, status, err = line.split("\t", 2)
    rows[app] = {"status": status, "error": err[:240]}
counts = {"built": 0, "skipped": 0, "failed": 0}
for r in rows.values():
    if r["status"] in counts:
        counts[r["status"]] += 1
json.dump({"counts": counts,
           "apps": rows,
           "note": "lane-sharded build; one job per lane, assemble merges; HIVE_STRICT_BUILD=1 turns any failed into an exit 1"},
          open(out, "w"), indent=2, sort_keys=True)
print(f"wrote {out} ({len(rows)} apps)")
PY
echo "report:"; cat "$REPORT"
echo "site contents:"; find "$SITE" -maxdepth 3 -name index.html | sed "s#$SITE#  #"

# strict mode: fail the job so Pages/#/apps shows the truth
if [ "${HIVE_STRICT_BUILD:-0}" = "1" ]; then
  failed="$(python3 -c "import json; print(json.load(open('$REPORT'))['counts']['failed'])")"
  if [ "$failed" -gt 0 ]; then
    echo "HIVE_STRICT_BUILD: $failed app(s) failed"
    exit 1
  fi
fi

# report back: commit the per-app truth into the repo so it is readable at
# raw.githubusercontent.com/<owner>/<repo>/main/site/apps/_build_report.json
# (the github-pages artifact is not readable through plain HTTP). The push uses
# GITHUB_TOKEN, whose commits never re-trigger workflows -> no loop.
if [ "${HIVE_REPORT_BACK:-0}" = "1" ]; then
  if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git -C "$ROOT" add -f "$REPORT"
    if ! git -C "$ROOT" diff --cached --quiet; then
      git -C "$ROOT" config user.email "citeam@hive.local"
      git -C "$ROOT" config user.name "hive ci"
      git -C "$ROOT" commit -q -m "ci: per-app build report [skip ci]" -- "$REPORT"
      git -C "$ROOT" push -q origin HEAD:main 2>&1 | sed 's/^/    /'
      echo "reported: $REPORT"
    else
      echo "report unchanged -> no commit"
    fi
  fi
fi
exit 0
