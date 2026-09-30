/* ============================================================
   features.js — recursos extras do portfólio
   - Barra de progresso de leitura
   - Tema claro/escuro (persistido)
   - Luz que segue o mouse nos cards + tilt 3D nos projetos
   - Copiar e-mail com aviso
   - Relógio local de Fortaleza
   - GitHub ao vivo: último commit e mapa de contribuições
   - Modal de projeto (vídeo grande + detalhes)
   - Experiência em sanfona e faixa corrida de serviços
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
       - a barra de navegador com o endereço, dentro da tela do notebook;
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
            const display = card.querySelector('.device--laptop .device-display');
            if (host && display && !display.querySelector('.screen-bar')) {
                const bar = document.createElement('div');
                bar.className = 'screen-bar';
                bar.setAttribute('aria-hidden', 'true');
                bar.innerHTML = '<span class="screen-dots"><i></i><i></i><i></i></span><span class="screen-url"></span>';
                bar.querySelector('.screen-url').textContent = host;
                display.prepend(bar);
            }
            if (host) {
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
            if (meta) meta.content = theme === 'light' ? '#f3f4fa' : '#15151c';
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

    /* ---------- experiência: lista em sanfona ----------
       Todos os cargos ficam visíveis (data, cargo e empresa). Clicar
       na linha abre os detalhes; o cargo atual já começa aberto. */
    function initExperienceAccordion() {
        const panels = [...document.querySelectorAll('.exp-panel')];
        panels.forEach((panel, i) => {
            if (panel.querySelector('.exp-toggle')) return;
            panel.hidden = false;
            const body = document.createElement('div');
            body.className = 'exp-body';
            body.id = panel.id + '-body';
            panel.querySelectorAll('.exp-list, .exp-stack').forEach(el => body.appendChild(el));
            panel.appendChild(body);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'exp-toggle';
            btn.setAttribute('aria-controls', body.id);
            btn.innerHTML = '<span class="exp-toggle-icon" aria-hidden="true"></span>';
            const title = panel.querySelector('.exp-title');
            btn.setAttribute('aria-label', title ? title.textContent.trim() : 'Detalhes');
            panel.appendChild(btn);

            const set = (open) => {
                panel.classList.toggle('is-open', open);
                btn.setAttribute('aria-expanded', String(open));
            };
            set(panel.classList.contains('is-current') || (i === 0 && !document.querySelector('.exp-panel.is-current')));
            // a linha inteira é clicável; o botão é o alvo acessível
            panel.addEventListener('click', (e) => {
                if (e.target.closest('.exp-body a')) return;
                if (e.target.closest('.exp-body') && panel.classList.contains('is-open')) return;
                set(!panel.classList.contains('is-open'));
            });
        });
    }

    /* ---------- serviços: faixa corrida com os nomes ---------- */
    function initServicesMarquee() {
        const track = document.querySelector('.services-marquee .marquee-track');
        if (!track) return;
        const build = () => {
            const names = [...document.querySelectorAll('.service-item-name')].map(n => n.textContent.trim());
            const run = names.map(n => `<span>${n}</span><i>\u2726</i>`).join('');
            track.innerHTML = run + run; // duas voltas: o loop fica contínuo
        };
        build();
        document.addEventListener('languagechange-portfolio', build);
    }

    document.addEventListener('DOMContentLoaded', () => {
        initShowcase();
        initKeyboard();
        initReadProgress();
        initTheme();
        initCopyEmail();
        initLocalTime();
        markCurrentExperience();
        initExperienceAccordion();
        initServicesMarquee();
    });
})();
