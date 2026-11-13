# Builds references/index.html from references/references.json.
# Run from the repository root: python3 references/make_gallery.py
import json, html, collections
rows = json.load(open('references/references.json'))
groups = collections.OrderedDict()
for r in sorted(rows, key=lambda r: (r['group'], r['asset'])):
    groups.setdefault(r['group'], collections.OrderedDict()).setdefault(r['asset'], []).append(r)
e = html.escape
out = []
for g, assets in groups.items():
    out.append(f'<h2>{e(g)}</h2>')
    for a, items in assets.items():
        out.append(f'<h3>{e(a)}</h3><div class="grid">')
        for r in items:
            host = r['image_url'].split('/')[2]
            thumb = (f'<a href="{e(r["image_url"])}" target="_blank" rel="noopener"><img loading="lazy" src="{e(r["image_url"])}" alt="{e(r["description"])}"></a>'
                     if host.endswith('nasa.gov') else
                     f'<a class="ph" href="{e(r["image_url"])}" target="_blank" rel="noopener">Image hosted by {e(host)}</a>')
            out.append(f'<figure>{thumb}<figcaption>{e(r["description"])}<br><small>Credit: {e(r["credit"])} · '
                       f'<a href="{e(r["source_page"])}" target="_blank" rel="noopener">source page</a></small></figcaption></figure>')
        out.append('</div>')
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Moon Base Race references</title>
<style>
:root{{--bg:#0f1115;--fg:#e8e8ea;--mut:#9aa0aa;--card:#181b22;--line:#2a2f3a;--a:#7fb4ff}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif;padding:16px}}
main{{max-width:1200px;margin:auto}} a{{color:var(--a)}} h2{{border-bottom:1px solid var(--line);padding-bottom:4px;margin-top:2em}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}}
figure{{margin:0;background:var(--card);border:1px solid var(--line);border-radius:6px;overflow:hidden}}
img{{width:100%;height:160px;object-fit:cover;display:block;background:#000}}
.ph{{display:flex;height:160px;align-items:center;justify-content:center;text-align:center;padding:8px;box-sizing:border-box;background:#000}}
figcaption{{padding:8px;font-size:14px}} small{{color:var(--mut)}} p{{color:var(--mut);max-width:70ch}}
</style></head><body><main>
<p><a href="../index.html">Play Moon Base Race</a></p>
<h1>Reference images</h1>
<p>Public domain NASA images that show the real hardware and places in the game. They are reference material for the future photorealistic cutscenes. This page only links to the images; nothing is copied into this repository. NASA images are generally not copyrighted, but NASA asks for credit and does not endorse this game. Images marked "hosted by" are NASA images republished on another site; check the original before reusing them.</p>
<p>Company and press images used as private references were left out because they need permission to publish. The data is in <a href="references.csv">references.csv</a> and <a href="references.json">references.json</a>.</p>
{"".join(out)}
</main></body></html>
'''
open('references/index.html', 'w').write(page)
print(len(rows), 'images')
