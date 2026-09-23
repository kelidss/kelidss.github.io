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

const siteUrl = process.argv[2] || 'keliane.dev';
const dir = __dirname;
const html = 'file:///' + path.join(dir, 'og.html').replace(/\\/g, '/') + '?url=' + encodeURIComponent(siteUrl);
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

try {
    if (fs.existsSync(png)) fs.unlinkSync(png);

    execFileSync(browser, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars',
        '--window-size=1200,630',
        '--virtual-time-budget=8000',      // espera as fontes do Google carregarem
        `--screenshot=${png}`,
        html,
    ], { stdio: 'ignore', timeout: 60000 });

    // Se já houver uma janela do navegador aberta, o comando volta antes da captura
    // terminar: espera o arquivo aparecer e parar de crescer.
    const deadline = Date.now() + 30000;
    let last = -1;
    while (Date.now() < deadline) {
        const size = fs.existsSync(png) ? fs.statSync(png).size : -1;
        if (size > 0 && size === last) break;
        last = size;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
    if (!fs.existsSync(png)) throw new Error('o navegador não gerou a captura');

    execFileSync('python', ['-c', [
        'import sys',
        'from PIL import Image',
        'im = Image.open(sys.argv[1]).convert("RGB")',
        'im.save(sys.argv[2], quality=90, optimize=True)',
        'print(im.size)',
    ].join('\n'), png, jpg], { stdio: 'inherit' });

    console.log('gerado:', jpg);
} finally {
    if (fs.existsSync(png)) fs.unlinkSync(png);
}
