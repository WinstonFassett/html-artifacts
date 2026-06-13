# Screenshot every gallery artifact -> previews/<slug>.png, replacing the live
# iframe previews that tanked scroll perf. Serve the repo over HTTP first (ESM
# artifacts need it), e.g. via the webapp-testing with_server.py helper:
#   python3 with_server.py --server "python3 -m http.server 9731 --directory <repo>" \
#     --port 9731 -- python3 tools/shoot.py [path ...]
# Pass artifact paths as args to (re)shoot just those; no args = all (skips
# previews that already exist). Reads the artifact list straight from index.html.
import json, re, os, sys
from playwright.sync_api import sync_playwright

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 9731
OUT = os.path.join(REPO, "previews")
os.makedirs(OUT, exist_ok=True)

def load_artifacts():
    html = open(os.path.join(REPO, "index.html")).read()
    s = html.index("const artifacts = [") + len("const artifacts = ")
    e = html.index("\n];", s) + 2
    block = html[s:e]
    # JS object literals -> JSON: quote bare keys, strip trailing commas/comments.
    block = re.sub(r"//[^\n]*", "", block)
    block = re.sub(r"(\{|,)\s*([a-zA-Z_]\w*)\s*:", r'\1"\2":', block)
    block = re.sub(r",(\s*[}\]])", r"\1", block)
    return json.loads(block)

artifacts = load_artifacts()

def slug_path(p):
    # stable, unique key derived from the artifact's path
    return re.sub(r"[^a-z0-9]+", "-", p.lower()).strip("-")

# Thumbnail render box: 1280 wide capture, crop to a card-ish aspect.
VW, VH = 1280, 900
CLIP = {"x": 0, "y": 0, "width": 1280, "height": 800}

only = sys.argv[1:] if len(sys.argv) > 1 else None  # optional: subset of paths

results = {"ok": [], "fail": []}
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for i, a in enumerate(artifacts):
        path = a["path"]
        if only and path not in only:
            continue
        key = slug_path(path)
        outfile = os.path.join(OUT, key + ".png")
        if os.path.exists(outfile) and not only:
            results["ok"].append(key)
            continue
        url = f"http://localhost:{PORT}/{path}"
        # Render each artifact in its OWN native theme (forcing dark across 163
        # uncontrolled artifacts produced broken half-dark renders). The gallery
        # UI is dark; thumbnails sit in dark chrome but show true artifact look.
        page = browser.new_page(viewport={"width": VW, "height": VH},
                                device_scale_factor=1)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        try:
            page.goto(url, wait_until="load", timeout=20000)
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except Exception:
                pass
            page.wait_for_timeout(1200)  # let canvas/charts/anim settle
            page.screenshot(path=outfile, clip=CLIP)
            results["ok"].append(key)
            print(f"[{i+1}/{len(artifacts)}] OK  {key}" + (f"  (errs:{len(errors)})" if errors else ""))
        except Exception as e:
            results["fail"].append({"key": key, "path": path, "err": str(e)[:160]})
            print(f"[{i+1}/{len(artifacts)}] FAIL {key}: {str(e)[:120]}")
        finally:
            page.close()
    browser.close()

print(f"\nDONE ok={len(results['ok'])} fail={len(results['fail'])}")
if results["fail"]:
    print("FAILURES:")
    for f in results["fail"]:
        print(" ", f["key"], "::", f["err"])
json.dump(results, open("/tmp/shoot_results.json", "w"), indent=2)
