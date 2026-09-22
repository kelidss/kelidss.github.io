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

    /* ---------- 16) barra de navegador nos cards web ---------- */
    function initBrowserBars() {
        document.querySelectorAll('.project-card:not([data-image-type="mobile"])').forEach(card => {
            const box = card.querySelector('.project-image-container');
            const link = card.querySelector('.project-links a');
            if (!box || box.querySelector('.browser-bar')) return;
            let host = '';
            try { host = link ? new URL(link.href).hostname.replace(/^www\./, '') : ''; } catch (e) { host = ''; }
            const bar = document.createElement('div');
            bar.className = 'browser-bar';
            bar.setAttribute('aria-hidden', 'true');
            bar.innerHTML = '<span class="browser-dots"><i></i><i></i><i></i></span>' +
                (host ? '<span class="browser-url">' + host + '</span>' : '');
            box.appendChild(bar);
        });
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
        initBrowserBars();
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
