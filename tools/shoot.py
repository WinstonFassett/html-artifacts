# Screenshot every gallery artifact -> site/public/previews/<id>.png.
# Serve site/public/ over HTTP first (ESM artifacts need it), e.g.:
#   python3 -m http.server 9731 --directory site/public
# Pass artifact ids as args to (re)shoot just those; no args = all (skips
# previews that already exist). Reads artifact list from site/src/data/artifacts.json.
import json, re, os, sys
from playwright.sync_api import sync_playwright

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 9731
OUT = os.path.join(REPO, "site/public/previews")
os.makedirs(OUT, exist_ok=True)

artifacts = json.load(open(os.path.join(REPO, "site/src/data/artifacts.json")))

def slug_path(p):
    return re.sub(r"[^a-z0-9]+", "-", p.lower()).strip("-")

VW, VH = 1280, 900
CLIP = {"x": 0, "y": 0, "width": 1280, "height": 800}

only = set(sys.argv[1:]) if len(sys.argv) > 1 else None

results = {"ok": [], "fail": []}
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for i, a in enumerate(artifacts):
        aid = a["id"]
        path = a["path"]  # e.g. artifacts/winstonfassett/react-chat.html
        if only and aid not in only:
            continue
        outfile = os.path.join(OUT, aid + ".png")
        if os.path.exists(outfile) and not only:
            results["ok"].append(aid)
            continue
        url = f"http://localhost:{PORT}/{path}"
        page = browser.new_page(viewport={"width": VW, "height": VH}, device_scale_factor=1)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        try:
            page.goto(url, wait_until="load", timeout=20000)
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except Exception:
                pass
            page.wait_for_timeout(1200)
            page.screenshot(path=outfile, clip=CLIP)
            results["ok"].append(aid)
            print(f"[{i+1}/{len(artifacts)}] OK  {aid}" + (f"  (errs:{len(errors)})" if errors else ""))
        except Exception as e:
            results["fail"].append({"key": aid, "path": path, "err": str(e)[:160]})
            print(f"[{i+1}/{len(artifacts)}] FAIL {aid}: {str(e)[:120]}")
        finally:
            page.close()
    browser.close()

print(f"\nDONE ok={len(results['ok'])} fail={len(results['fail'])}")
if results["fail"]:
    print("FAILURES:")
    for f in results["fail"]:
        print(" ", f["key"], "::", f["err"])
json.dump(results, open("/tmp/shoot_results.json", "w"), indent=2)
