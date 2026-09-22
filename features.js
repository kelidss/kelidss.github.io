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

    /* ---------- 15) tela de carregamento ---------- */
    function initPreloader() {
        const el = document.getElementById('preloader');
        if (!el) return;
        const done = () => {
            el.classList.add('is-done');
            setTimeout(() => el.remove(), 600);
        };
        if (document.readyState === 'complete') setTimeout(done, 300);
        else window.addEventListener('load', () => setTimeout(done, 200), { once: true });
        setTimeout(done, 1200); // teto: nunca segura a página
    }

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

    /* ---------- 1 e 2) GitHub ao vivo ---------- */
    const GH_USER = 'kelidss';

    function relativeTime(date) {
        const diff = Math.max(0, Date.now() - date.getTime());
        const min = Math.round(diff / 60000);
        const h = Math.round(min / 60);
        const d = Math.round(h / 24);
        const en = currentLanguage === 'en';
        if (min < 60) return en ? `${min} min ago` : `há ${min} min`;
        if (h < 24) return en ? `${h}h ago` : `há ${h}h`;
        if (d === 1) return en ? 'yesterday' : 'ontem';
        if (d < 30) return en ? `${d} days ago` : `há ${d} dias`;
        const m = Math.round(d / 30);
        return en ? `${m} months ago` : `há ${m} meses`;
    }

    let lastPush = null;

    function renderCommit() {
        const el = document.getElementById('hero-commit');
        if (!el || !lastPush) return;
        const repo = lastPush.repo.split('/').pop();
        const msg = (lastPush.message || '').split('\n')[0].slice(0, 56);
        el.innerHTML = `<i class="fas fa-code-commit"></i> <span class="commit-label">${t('commit-label') || 'último commit'}</span> ` +
            `<a href="https://github.com/${lastPush.repo}" target="_blank" rel="noopener" class="commit-repo">${repo}</a> ` +
            `<span class="commit-time">· ${relativeTime(new Date(lastPush.date))}</span>` +
            (msg ? `<span class="commit-msg">"${msg.replace(/</g, '&lt;')}"</span>` : '');
        el.hidden = false;
    }

    async function initLastCommit() {
        const el = document.getElementById('hero-commit');
        if (!el) return;
        try {
            const res = await fetch(`https://api.github.com/users/${GH_USER}/events/public?per_page=30`);
            if (!res.ok) return;
            const events = await res.json();
            const push = events.find(e => e.type === 'PushEvent');
            if (!push) return;
            const commits = (push.payload && push.payload.commits) || [];
            lastPush = { repo: push.repo.name, date: push.created_at, message: commits.length ? commits[commits.length - 1].message : '' };
            renderCommit();
        } catch (e) { /* offline ou limite da API: some em silêncio */ }
    }

    async function initHeatmap() {
        const wrap = document.getElementById('gh-heatmap');
        if (!wrap) return;
        try {
            const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
            if (!res.ok) throw new Error(res.status);
            const data = await res.json();
            const days = data.contributions;
            if (!days || !days.length) throw new Error('vazio');

            // alinha a primeira coluna no domingo
            const first = new Date(days[0].date + 'T00:00:00');
            const pad = first.getDay();
            const cells = [];
            for (let i = 0; i < pad; i++) cells.push(null);
            days.forEach(d => cells.push(d));

            const grid = wrap.querySelector('.gh-grid');
            grid.innerHTML = cells.map(d => d
                ? `<i data-level="${d.level}" title="${d.count} ${d.count === 1 ? 'contribuição' : 'contribuições'} · ${d.date}"></i>`
                : '<i data-level="-1"></i>').join('');
            const total = wrap.querySelector('.gh-total');
            if (total) total.textContent = data.total.lastYear.toLocaleString('pt-BR');
            wrap.hidden = false;
        } catch (e) {
            wrap.hidden = true;
        }
    }

    /* ---------- 7) modal de projeto ---------- */
    function initProjectModal() {
        const dialog = document.getElementById('project-modal');
        if (!dialog || typeof dialog.showModal !== 'function') return;
        const body = dialog.querySelector('.modal-body');
        let activeVideo = null;

        const open = (card) => {
            const title = card.querySelector('.project-title')?.textContent.trim() || '';
            const type = card.querySelector('.project-type')?.innerHTML || '';
            const desc = card.querySelector('.project-description')?.textContent.trim() || '';
            const stack = [...card.querySelectorAll('.project-stack span')].map(s => `<span>${s.textContent}</span>`).join('');
            const link = card.querySelector('.project-links a');
            const metric = card.querySelector('.project-metric');
            const video = card.querySelector('.project-video source');
            const poster = card.querySelector('.project-image-container img');
            const isMobile = card.dataset.imageType === 'mobile';

            const media = video
                ? `<video class="modal-video" autoplay muted loop playsinline poster="${poster ? poster.currentSrc || poster.src : ''}"><source src="${video.getAttribute('src')}" type="video/webm"></video>`
                : (poster ? `<img class="modal-img" src="${poster.currentSrc || poster.src}" alt="">` : '');

            body.innerHTML = `
                <div class="modal-media${isMobile ? ' modal-media--mobile' : ''}">${media}</div>
                <div class="modal-info">
                    <span class="project-type">${type}</span>
                    <h3 class="modal-title">${title}</h3>
                    ${metric ? `<p class="modal-metric">${metric.innerHTML}</p>` : ''}
                    <p class="modal-desc">${desc}</p>
                    <div class="modal-stack">${stack}</div>
                    ${link ? `<a href="${link.href}" target="_blank" rel="noopener" class="btn-primary modal-link"><span class="btn-text">${t('modal-visit') || 'Abrir projeto'}</span><span class="btn-icon"><i class="fas fa-arrow-up-right-from-square"></i></span></a>` : ''}
                </div>`;
            activeVideo = body.querySelector('video');
            dialog.showModal();
            document.body.classList.add('modal-open');
        };

        const close = () => {
            if (activeVideo) { activeVideo.pause(); activeVideo = null; }
            dialog.close();
        };

        document.querySelectorAll('.project-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.addEventListener('click', (e) => {
                if (e.target.closest('a, button')) return; // links do card continuam normais
                open(card);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
            });
        });

        dialog.querySelector('.modal-close').addEventListener('click', close);
        dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
        dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); });
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

        const sync = () => {
            const active = document.querySelector('.exp-tab.active')?.dataset.tab;
            wrap.querySelectorAll('.tl-dot').forEach(d => d.classList.toggle('is-active', d.dataset.tab === active));
        };
        wrap.querySelectorAll('.tl-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const tab = document.querySelector(`.exp-tab[data-tab="${dot.dataset.tab}"]`);
                if (tab) tab.click();
                sync();
            });
        });
        document.querySelectorAll('.exp-tab').forEach(tab => tab.addEventListener('click', () => setTimeout(sync, 0)));
        sync();
    }

    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initBrowserBars();
        initReadProgress();
        initTheme();
        initSpotlight();
        initCopyEmail();
        initLocalTime();
        initLastCommit();
        initHeatmap();
        initProjectModal();
        initCareerTimeline();
        document.addEventListener('languagechange-portfolio', () => { renderCommit(); initCareerTimeline(); });
    });
})();
