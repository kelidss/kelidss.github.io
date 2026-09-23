// Gera og-image.jpg (1200x630, imagem de preview de link) a partir de og.html.
//
// Uso: node tools/og-image/render.js [url-exibida-no-rodapé]
//   ex.: node tools/og-image/render.js keliane.dev
//
// Usa o modo headless do Edge ou Chrome já instalado no Windows para tirar a captura
// e o Python (Pillow) para converter em JPEG. Não depende do Playwright.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const siteUrl = process.argv[2] || 'kelidss.github.io';
const dir = __dirname;
const htmlSrc = path.join(dir, 'og.html');
const htmlTmp = path.join(dir, 'og.tmp.html');
const png = path.join(dir, 'og.png');
const jpg = path.join(dir, '..', '..', 'og-image.jpg');

const browsers = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
];
const browser = browsers.find(fs.existsSync);
if (!browser) {
    console.error('Nenhum Edge ou Chrome encontrado para renderizar a imagem.');
    process.exit(1);
}

// Injeta a URL do rodapé em uma cópia temporária do HTML.
const html = fs.readFileSync(htmlSrc, 'utf8')
    .replace(/(<span class="url" id="site-url">)[^<]*(<\/span>)/, `$1${siteUrl}$2`);
fs.writeFileSync(htmlTmp, html);

try {
    execFileSync(browser, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars',
        '--window-size=1200,630',
        '--virtual-time-budget=8000',      // espera as fontes do Google carregarem
        `--screenshot=${png}`,
        'file:///' + htmlTmp.replace(/\\/g, '/'),
    ], { stdio: 'ignore' });

    execFileSync('python', ['-c', [
        'import sys',
        'from PIL import Image',
        'im = Image.open(sys.argv[1]).convert("RGB")',
        'im.save(sys.argv[2], quality=90, optimize=True)',
        'print(im.size)',
    ].join('\n'), png, jpg], { stdio: 'inherit' });

    console.log('gerado:', jpg);
} finally {
    for (const f of [htmlTmp, png]) if (fs.existsSync(f)) fs.unlinkSync(f);
}
