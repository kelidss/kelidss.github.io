// Grava um vídeo curto de apresentação de cada projeto do portfólio.
// Uso: node record.js [slug ...]   (sem argumentos grava todos)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..'); // raiz do repositório
// ffmpeg que vem com o Playwright (npx playwright install ffmpeg)
const FFMPEG = (() => {
  const base = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  const dir = fs.existsSync(base) && fs.readdirSync(base).filter((d) => d.startsWith('ffmpeg-')).sort().pop();
  return dir ? path.join(base, dir, 'ffmpeg-win64.exe') : 'ffmpeg';
})();
const OUT_RAW = path.join(__dirname, '.raw'); // vídeos brutos (ignorados no git)
const OUT_QA = path.join(__dirname, '.qa');   // frames de conferência (ignorados no git)

const PROJECTS = [
  { slug: 'orfeu', folder: 'orfeu', url: 'https://orfeu.app' },
  { slug: 'aquabit', folder: 'aquabit', url: 'https://web.aquabit.com.br' },
  { slug: 'comunidade-aqua', folder: 'comunidade aqua', url: 'https://comunidadeaqua.com.br' },
  { slug: 'norddev', folder: 'norddev', url: 'https://www.norddev.com.br' },
  { slug: 'amevis', folder: 'amevi', url: 'https://amevis.com.br' },
  { slug: 'mariliadantas', folder: 'mariliadantas', url: 'https://www.mariliadantas.com' },
  { slug: 'leticia', folder: 'blogleticia', url: 'https://psicologaleticiamorais.com' },
  { slug: 'metodocev', folder: 'metodoCEV', url: 'https://metodocev.cleanefontenele.com' },
  { slug: 'noticias-acev', folder: 'noticias-acev', url: 'https://noticiasacev.com.br' },
  { slug: 'movimento-metodo-cev', folder: 'movimento-metodo-cev', url: 'https://metodocevemmovimento.cleanefontenele.com' },
  { slug: 'imersao-metodo-cev', folder: 'imersao-metodo-cev', url: 'https://imersaometodocev.cleanefontenele.com' },
  { slug: 'kompa', folder: 'kompa', url: 'https://manager.kompa.com.br', mobile: true },
  // loja: só cabeçalho do app e as capturas de tela (sem descer até as resenhas)
  { slug: 'mentalclean', folder: 'mentalclean', url: 'https://play.google.com/store/apps/details?id=com.mentalclean.app', mobile: true, maxScreens: 0.6 },
];

const VIEWPORT = { width: 1280, height: 800 };
const VIEWPORT_MOBILE = { width: 430, height: 860 };
const VIDEO = { width: 1280, height: 800 };

// rolagem suave controlada dentro da página (independente de scroll-behavior)
const SCROLL_FN = async ({ to, ms }) => {
  // sites com scroll-behavior: smooth ignoram scrollTo quadro a quadro
  if (!document.getElementById('__rec_style')) {
    const st = document.createElement('style');
    st.id = '__rec_style';
    st.textContent = 'html, body, * { scroll-behavior: auto !important; }';
    document.head.appendChild(st);
  }
  const el = document.scrollingElement || document.documentElement;
  const from = el.scrollTop;
  const t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  await new Promise((resolve) => {
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      const y = from + (to - from) * ease(p);
      el.scrollTop = y;
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
      if (p < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  return el.scrollTop;
};

async function dismissBanners(page) {
  const patterns = [/aceitar/i, /accept/i, /concordo/i, /entendi/i, /got it/i, /^ok$/i, /permitir/i, /allow/i];
  for (const re of patterns) {
    try {
      const btn = page.getByRole('button', { name: re }).first();
      if (await btn.isVisible({ timeout: 300 })) { await btn.click({ timeout: 800 }); return true; }
    } catch (e) { /* segue */ }
  }
  return false;
}

async function recordOne(browser, p) {
  const mobile = Boolean(p.mobile);
  const ctx = await browser.newContext({
    viewport: mobile ? VIEWPORT_MOBILE : VIEWPORT,
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: mobile
      ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36'
      : undefined,
    locale: 'pt-BR',
    recordVideo: { dir: OUT_RAW, size: mobile ? VIEWPORT_MOBILE : VIDEO },
  });
  const tStart = Date.now();
  const page = await ctx.newPage();
  const qaDir = path.join(OUT_QA, p.slug);
  fs.mkdirSync(qaDir, { recursive: true });

  let status = 'ok';
  try {
    const res = await page.goto(p.url, { waitUntil: p.mobile ? 'domcontentloaded' : 'load', timeout: 45000 });
    if (res && res.status() >= 400) status = 'http ' + res.status();
    try { await page.waitForLoadState('networkidle', { timeout: 6000 }); } catch (e) { /* segue */ }
  } catch (e) {
    status = 'erro: ' + e.message.split('\n')[0];
  }

  await page.waitForTimeout(600);
  await dismissBanners(page);
  await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
  const readyAt = (Date.now() - tStart) / 1000; // o vídeo começa aqui (corta o carregamento)
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(qaDir, '1-top.png') });

  // até onde rolar: no máximo 4 telas
  const { docH, vh } = await page.evaluate(() => ({ docH: document.documentElement.scrollHeight, vh: innerHeight }));
  const maxScroll = Math.max(0, Math.min(docH - vh, vh * (p.maxScreens || 4)));

  if (maxScroll > 40) {
    await page.evaluate(SCROLL_FN, { to: maxScroll * 0.5, ms: 2600 });
    await page.screenshot({ path: path.join(qaDir, '2-mid.png') });
    const reached = await page.evaluate(SCROLL_FN, { to: maxScroll, ms: 2600 });
    status += reached > 40 ? '' : ' (não rolou)';
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(qaDir, '3-end.png') });
    await page.evaluate(SCROLL_FN, { to: 0, ms: 1300 });
    await page.waitForTimeout(500);
  } else {
    // página curta (login etc.): zoom lento + cursor passeando
    const vw = mobile ? VIEWPORT_MOBILE.width : VIEWPORT.width;
    const vh2 = mobile ? VIEWPORT_MOBILE.height : VIEWPORT.height;
    await page.evaluate(() => {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.transformOrigin = '50% 40%';
      document.body.style.transition = 'transform 5.5s ease-in-out';
      requestAnimationFrame(() => { document.body.style.transform = 'scale(1.07)'; });
    });
    const pts = [[0.3, 0.35], [0.7, 0.45], [0.72, 0.6], [0.5, 0.5]];
    for (const [x, y] of pts) {
      await page.mouse.move(vw * x, vh2 * y, { steps: 30 });
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: path.join(qaDir, '2-mid.png') });
    await page.waitForTimeout(1200);
  }

  const video = page.video();
  await ctx.close();
  const rawPath = await video.path();
  return { rawPath, status, maxScroll, docH, readyAt };
}

function encode(rawPath, outPath, mobile, startAt) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  // o ffmpeg do Playwright é mínimo (sem filtro fps): redimensiona com -s e -r
  const size = mobile ? '360x720' : '960x600';
  execFileSync(FFMPEG, [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-ss', Math.max(0.3, startAt - 0.2).toFixed(2), // corta o carregamento da página
    '-i', rawPath,
    '-an',
    '-s', size, '-r', '24',
    '-c:v', 'libvpx', '-b:v', '650k', '-crf', '30', '-deadline', 'good', '-cpu-used', '2',
    '-auto-alt-ref', '0',
    outPath,
  ]);
  return fs.statSync(outPath).size;
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? PROJECTS.filter((p) => only.includes(p.slug)) : PROJECTS;
  fs.mkdirSync(OUT_RAW, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const report = [];
  for (const p of list) {
    const t0 = Date.now();
    process.stdout.write(`> ${p.slug} ... `);
    try {
      const r = await recordOne(browser, p);
      const out = path.join(REPO, 'assets', p.folder, 'preview.webm');
      const size = encode(r.rawPath, out, Boolean(p.mobile), r.readyAt);
      report.push({ slug: p.slug, status: r.status, kb: Math.round(size / 1024), scroll: Math.round(r.maxScroll), docH: r.docH, s: Math.round((Date.now() - t0) / 1000) });
      console.log(`${r.status} | ${Math.round(size / 1024)} KB | doc ${r.docH}px | ${Math.round((Date.now() - t0) / 1000)}s`);
    } catch (e) {
      report.push({ slug: p.slug, status: 'FALHOU: ' + e.message.split('\n')[0] });
      console.log('FALHOU:', e.message.split('\n')[0]);
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\nrelatório em report.json');
})();
