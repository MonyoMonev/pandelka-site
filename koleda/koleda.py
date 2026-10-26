#!/usr/bin/env python3
"""Включва и изключва коледното оформление на сайта.

    python3 koleda/koleda.py on     слага коледната секция, линка в менюто и стила
    python3 koleda/koleda.py off    маха ги, без да пипа нищо друго
    python3 koleda/koleda.py status показва текущото състояние

Коледното съдържание живее в koleda/*.html, затова изключването не го трие,
а само го изважда от страниците. Следващата година се включва пак с една команда.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTS = {
    "CSS": [("index.html", "koleda/css.html")],
    "NAV": [("index.html", "koleda/nav.html"), ("galeria.html", "koleda/nav.html")],
    "SECTION": [("index.html", "koleda/section.html")],
}
SITEMAP_ENTRY = """  <url>
    <loc>https://golyamatapandelka.com/koledni-pandelki.html</loc>
    <lastmod>2026-10-26</lastmod>
    <priority>0.9</priority>
  </url>
"""


def swap(path: Path, name: str, content: str) -> int:
    text = path.read_text()
    pattern = re.compile(
        r"(<!-- KOLEDA:%s:START -->).*?(<!-- KOLEDA:%s:END -->)" % (name, name),
        re.S,
    )
    if not pattern.search(text):
        print("  внимание: няма маркер %s в %s" % (name, path.name))
        return 0
    new = pattern.sub(lambda m: m.group(1) + content + m.group(2), text)
    if new != text:
        path.write_text(new)
    return len(pattern.findall(new))


def set_state(on: bool) -> None:
    for name, targets in PARTS.items():
        for page, fragment in targets:
            body = (ROOT / fragment).read_text().strip() if on else ""
            count = swap(ROOT / page, name, body)
            print("  %-12s %-14s %d място(а)" % (name, page, count))

    sitemap = ROOT / "sitemap.xml"
    text = sitemap.read_text()
    has = "koledni-pandelki" in text
    if on and not has:
        text = text.replace("</urlset>", SITEMAP_ENTRY + "</urlset>")
        sitemap.write_text(text)
        print("  картата на сайта: добавена коледната страница")
    elif not on and has:
        text = re.sub(r"  <url>\s*<loc>[^<]*koledni-pandelki[^<]*</loc>.*?</url>\n", "", text, flags=re.S)
        sitemap.write_text(text)
        print("  картата на сайта: махната коледната страница")


def status() -> None:
    text = (ROOT / "index.html").read_text()
    on = "KOLEDA:SECTION:START --><" not in text.replace("<!-- KOLEDA:SECTION:START --><!-- KOLEDA:SECTION:END -->", "ИЗКЛЮЧЕНО")
    on = "class=\"kol\"" in text
    print("коледното оформление е", "ВКЛЮЧЕНО" if on else "изключено")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    if cmd == "on":
        print("включвам коледното оформление:")
        set_state(True)
    elif cmd == "off":
        print("изключвам коледното оформление:")
        set_state(False)
    elif cmd == "status":
        status()
    else:
        print(__doc__)
        sys.exit(1)
    if cmd in ("on", "off"):
        status()
