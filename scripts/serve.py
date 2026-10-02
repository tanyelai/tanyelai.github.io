#!/usr/bin/env python3
"""Local preview that resolves URLs the way GitHub Pages does.

The site links to pages without their extension (/research, /path,
/notes/following-distance). GitHub Pages serves research.html for
/research; Python's plain http.server does not, so every such link 404s
in a local preview. This adds that one rule and nothing else.

    python3 scripts/serve.py          # http://localhost:8000
    python3 scripts/serve.py 8765     # another port
"""

import http.server
import os
import sys
from functools import partial

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PagesHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = super().translate_path(path)
        if not os.path.exists(local) and os.path.exists(local + ".html"):
            return local + ".html"
        return local


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(PagesHandler, directory=ROOT)
    with http.server.ThreadingHTTPServer(("", port), handler) as server:
        print(f"Serving {ROOT} at http://localhost:{port}")
        server.serve_forever()


if __name__ == "__main__":
    main()
