"""Versiona styles.css, script.js e features.js no index.html.

O site passa pelo cache da Cloudflare, que guarda CSS e JS por algumas horas.
Este script troca `styles.css` por `styles.css?v=<hash do conteúdo>` (e o mesmo
para os JS). Quando o arquivo muda, o endereço muda e o visitante recebe a
versão nova na hora.

Uso (na raiz do projeto, antes de commitar):
    python tools/bust-cache.py
"""
import hashlib
import io
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FILES = ['styles.css', 'script.js', 'features.js']
PAGES = ['index.html']


def short_hash(path):
    with open(os.path.join(ROOT, path), 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()[:10]


for page in PAGES:
    p = os.path.join(ROOT, page)
    html = io.open(p, encoding='utf-8').read()
    for name in FILES:
        v = short_hash(name)
        html, n = re.subn(r'((?:href|src)=")' + re.escape(name) + r'(?:\?v=[0-9a-f]+)?(")',
                          lambda m: f'{m.group(1)}{name}?v={v}{m.group(2)}', html)
        print(f'{page}: {name} -> ?v={v} ({n}x)')
    io.open(p, 'w', encoding='utf-8', newline='\n').write(html)
