/* ============================================================
   features.js — recursos extras do portfólio
   - Barra de progresso de leitura
   - Tema claro/escuro (persistido)
   - Luz que segue o mouse nos cards + tilt 3D nos projetos
   - Copiar e-mail com aviso
   - Relógio local de Fortaleza
   - GitHub ao vivo: último commit e mapa de contribuições
   - Modal de projeto (vídeo grande + detalhes)
   - Linha do tempo da carreira
   Usa `translations` e `currentLanguage` definidos em script.js.
   ============================================================ */
(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const t = (key) => ((typeof translations !== 'undefined' && translations[currentLanguage]) || {})[key] || '';

    /* ---------- 16) vitrine dos projetos (visual do WaxyWeb) ----------
       Em cada card monta, a partir do próprio conteúdo:
       - a palavra gigante atrás do aparelho (data-word do <article>);
       - o adesivo costurado com o tipo do projeto e, se houver, o da métrica;
       - o rótulo em arco com o endereço do projeto;
       - o endereço ao lado do ícone de link.
       Os adesivos são refeitos na troca de idioma. */
    function projectHost(card) {
        const link = card.querySelector('.project-links a');
        if (!link) return '';
        try {
            const host = new URL(link.href).hostname.replace(/^www\./, '');
            return host === 'play.google.com' ? 'Google Play' : host;
        } catch (e) { return ''; }
    }

    function buildArc(text, id) {
        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'stage-arc');
        svg.setAttribute('viewBox', '0 0 220 120');
        svg.setAttribute('aria-hidden', 'true');
        const d = 'M 22,112 A 96,96 0 0,1 198,112';
        const band = document.createElementNS(NS, 'path');
        band.setAttribute('d', d);
        band.setAttribute('class', 'stage-arc-band');
        const guide = document.createElementNS(NS, 'path');
        guide.setAttribute('d', d);
        guide.setAttribute('id', id);
        guide.setAttribute('fill', 'none');
        const label = document.createElementNS(NS, 'text');
        label.setAttribute('class', 'stage-arc-text');
        const tp = document.createElementNS(NS, 'textPath');
        tp.setAttribute('href', '#' + id);
        tp.setAttribute('startOffset', '50%');
        tp.setAttribute('text-anchor', 'middle');
        tp.textContent = text + ' \u2197';
        // endereços longos são comprimidos para caber na faixa
        if ((text.length + 2) * 8.4 > 176) {
            tp.setAttribute('textLength', '176');
            tp.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        }
        label.appendChild(tp);
        svg.append(band, guide, label);
        return svg;
    }

    function syncStickers(card) {
        const stage = card.querySelector('.project-image-container');
        if (!stage) return;
        stage.querySelectorAll('.stage-sticker').forEach(el => el.remove());

        const type = card.querySelector('.project-type');
        if (type && type.textContent.trim()) {
            const tag = document.createElement('span');
            tag.className = 'stage-sticker stage-sticker--type';
            tag.textContent = type.textContent.trim();
            stage.appendChild(tag);
        }
        const metric = card.querySelector('.project-metric');
        if (metric && metric.textContent.trim()) {
            const m = document.createElement('span');
            m.className = 'stage-sticker stage-sticker--metric';
            m.innerHTML = metric.innerHTML;
            stage.appendChild(m);
        }
    }

    function initShowcase() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, i) => {
            const stage = card.querySelector('.project-image-container');
            if (!stage || stage.querySelector('.stage-word')) return;

            const word = card.dataset.word ||
                (card.querySelector('.project-title') || {}).textContent || '';
            const bg = document.createElement('div');
            bg.className = 'stage-word';
            bg.setAttribute('aria-hidden', 'true');
            bg.innerHTML = '<span></span><span></span><span></span>';
            bg.querySelectorAll('span').forEach(s => { s.textContent = word.trim().toUpperCase(); });
            stage.prepend(bg);

            const host = projectHost(card);
            if (host) {
                stage.appendChild(buildArc(host, 'stage-arc-' + i));
                const link = card.querySelector('.project-links a');
                if (link && !link.querySelector('.link-host')) {
                    const h = document.createElement('span');
                    h.className = 'link-host';
                    h.textContent = host;
                    link.prepend(h);
                }
            }
            syncStickers(card);
        });
        syncOnLanguageChange(cards);
    }

    function syncOnLanguageChange(cards) {
        document.addEventListener('languagechange-portfolio', () => cards.forEach(syncStickers));
    }

    /* ---------- 17) teclado de ferramentas: alguém digitando ----------
       Enquanto o teclado está na tela, uma tecla de ferramenta afunda
       de vez em quando. Desligado com prefers-reduced-motion. */
    function initKeyboard() {
        const keys = [...document.querySelectorAll('.keyboard .key[role="listitem"]')];
        if (!keys.length || reduceMotion) return;
        let timer = null;
        const press = () => {
            const key = keys[Math.floor(Math.random() * keys.length)];
            key.classList.add('is-pressed');
            setTimeout(() => key.classList.remove('is-pressed'), 180);
            timer = setTimeout(press, 450 + Math.random() * 900);
        };
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !timer) press();
            if (!entry.isIntersecting && timer) { clearTimeout(timer); timer = null; }
        }, { threshold: 0.3 });
        io.observe(document.querySelector('.keyboard'));
    }

    /* ---------- 13) progresso de leitura ---------- */
    function initReadProgress() {
        const bar = document.querySelector('.read-progress');
        if (!bar) return;
        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    /* ---------- 16) tema claro/escuro ---------- */
    function initTheme() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        const root = document.documentElement;
        const apply = (theme) => {
            root.setAttribute('data-theme', theme);
            btn.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
            btn.setAttribute('aria-label', theme === 'light' ? 'Tema escuro' : 'Tema claro');
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.content = theme === 'light' ? '#f5f2fa' : '#1f1c2c';
        };
        let saved = null;
        try { saved = localStorage.getItem('ks-theme'); } catch (e) { /* sem storage */ }
        apply(saved === 'light' ? 'light' : 'dark');
        btn.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            apply(next);
            try { localStorage.setItem('ks-theme', next); } catch (e) { /* idem */ }
        });
    }

    /* ---------- 6) luz que segue o mouse ---------- */
    function initSpotlight() {
        if (!finePointer) return;
        const cards = document.querySelectorAll('.project-card, .service-item, .info-card, .method-item');
        cards.forEach(card => {
            card.classList.add('has-spotlight');
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            }, { passive: true });
        });
    }


    /* ---------- 14) copiar e-mail ---------- */
    function initCopyEmail() {
        const btn = document.querySelector('.copy-btn');
        if (!btn || !navigator.clipboard) { if (btn) btn.hidden = true; return; }
        const toast = document.querySelector('.toast');
        let timer = null;
        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(btn.dataset.copy);
                if (toast) {
                    toast.textContent = t('toast-copied') || 'copiado ✓';
                    toast.classList.add('is-visible');
                    clearTimeout(timer);
                    timer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
                }
                btn.classList.add('is-done');
                setTimeout(() => btn.classList.remove('is-done'), 2000);
            } catch (e) { /* clipboard bloqueado: o link mailto continua funcionando */ }
        });
    }

    /* ---------- 4) relógio local ---------- */
    function initLocalTime() {
        const el = document.getElementById('local-time');
        if (!el) return;
        const fmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' });
        const tick = () => { el.textContent = fmt.format(new Date()); };
        tick();
        setInterval(tick, 30000);
    }




    /* ---------- experiência atual em destaque ---------- */
    function markCurrentExperience() {
        const current = document.querySelector('.exp-panel .exp-badge');
        if (current) current.closest('.exp-panel').classList.add('is-current');
    }

    /* ---------- experiência: um cargo por vez ---------- */
    // A linha do tempo é o navegador: clicar num ponto mostra aquele cargo.
    // Abaixo dela fica um único card compacto, com setas para trocar.
    let selectExperience = null;   // preenchido pelo switcher, usado pela linha do tempo
    let setTimelineActive = null;  // preenchido pela linha do tempo, usado pelo switcher
    let activeExperience = null;

    function initExperienceSwitcher() {
        const content = document.querySelector('.exp-content');
        const panels = [...document.querySelectorAll('.exp-panel')];
        if (!content || !panels.length || content.querySelector('.exp-nav')) return;

        const nav = document.createElement('div');
        nav.className = 'exp-nav';
        nav.innerHTML =
            '<button type="button" class="exp-nav-btn" data-dir="-1" aria-label="Anterior"><i class="fas fa-arrow-left"></i></button>' +
            '<span class="exp-count" aria-live="polite"></span>' +
            '<button type="button" class="exp-nav-btn" data-dir="1" aria-label="Próxima"><i class="fas fa-arrow-right"></i></button>';
        content.prepend(nav);
        const count = nav.querySelector('.exp-count');
        const pad = (n) => String(n).padStart(2, '0');

        const select = (id) => {
            const idx = panels.findIndex(p => p.id === id);
            if (idx < 0) return;
            activeExperience = id;
            panels.forEach(p => {
                const on = p.id === id;
                p.classList.toggle('is-active', on);
                p.hidden = !on;
            });
            const active = panels[idx];
            active.classList.remove('is-entering');
            void active.offsetWidth; // reinicia a animação de entrada
            active.classList.add('is-entering');
            count.textContent = `${pad(idx + 1)} / ${pad(panels.length)}`;
            if (setTimelineActive) setTimelineActive(id);
        };

        nav.querySelectorAll('.exp-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = panels.findIndex(p => p.id === activeExperience);
                const next = (idx + Number(btn.dataset.dir) + panels.length) % panels.length;
                select(panels[next].id);
            });
        });

        selectExperience = select;
        select(panels[0].id);
    }

    /* ---------- 11) linha do tempo da carreira ---------- */
    const CAREER = [
        { id: 'vida', label: 'Vida Premium', start: '2023-05' },
        { id: 'passamanaria', label: 'Passamanaria', start: '2023-11' },
        { id: 'kompa', label: 'Kompa Saúde', start: '2024-08' },
        { id: 'aquabit', label: 'Aquabit', start: '2025-03' },
        { id: 'orfeu', label: 'Orfeu', start: '2025-11' },
        { id: 'acev', label: 'ACEV', start: '2025-12' },
        { id: 'bluecircuit', label: 'BlueCircuit', start: '2026-07', current: true }
    ];

    function initCareerTimeline() {
        const wrap = document.getElementById('career-timeline');
        if (!wrap) return;
        const toMonths = (ym) => { const [y, m] = ym.split('-').map(Number); return y * 12 + (m - 1); };
        const now = new Date();
        const startM = toMonths(CAREER[0].start) - 1;
        const endM = now.getFullYear() * 12 + now.getMonth() + 1;
        const span = endM - startM;
        const pct = (ym) => ((toMonths(ym) - startM) / span) * 100;

        const years = [];
        for (let y = Number(CAREER[0].start.slice(0, 4)); y <= now.getFullYear(); y++) years.push(y);

        const monthNames = { pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
                             en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
        const fmtDate = (ym) => {
            const [y, m] = ym.split('-').map(Number);
            return `${(monthNames[currentLanguage] || monthNames.pt)[m - 1]}/${String(y).slice(2)}`;
        };
        const yearPct = (y) => Math.max(0, Math.min(100, ((y * 12 - startM) / span) * 100));

        wrap.innerHTML = `
            <div class="tl-line"></div>
            ${years.map(y => `<span class="tl-year" style="left:${yearPct(y)}%">${y}</span>`).join('')}
            ${CAREER.map((c, i) => `
                <button type="button" class="tl-dot${c.current ? ' is-current' : ''}${i % 2 ? ' is-below' : ''}" style="left:${pct(c.start)}%" data-tab="${c.id}" title="${c.label}">
                    <span class="tl-label"><span class="tl-name">${c.label}</span><span class="tl-date">${fmtDate(c.start)}${c.current ? ' →' : ''}</span></span>
                </button>`).join('')}`;

        const dots = [...wrap.querySelectorAll('.tl-dot')];
        const setActive = (id) => dots.forEach(d => d.classList.toggle('is-active', d.dataset.tab === id));

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                if (selectExperience) selectExperience(dot.dataset.tab);
            });
        });

        setTimelineActive = setActive;
        if (activeExperience) setActive(activeExperience);
    }

    document.addEventListener('DOMContentLoaded', () => {
        initShowcase();
        initKeyboard();
        initReadProgress();
        initTheme();
        initCopyEmail();
        initLocalTime();
        initCareerTimeline();
        markCurrentExperience();
        initExperienceSwitcher();
        document.addEventListener('languagechange-portfolio', () => { initCareerTimeline(); });
    });
})();
