let currentLanguage = 'pt';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTypingEffect();
    initCounters();
    initScrollAnimations();
    initExperienceTabs();
    initProjectFilter();
    initProjectVideos();
    initAdvancedSmoothScroll();
    initParallax();
    initContactForm();
    initResumeButton();
    initLanguageToggle();
    initPacman();
});

// ========== Pac-Man dots ==========
function initPacman() {
    const track = document.getElementById('pac-dots');
    if (!track) return;
    const total = 60;
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('span');
        dot.className = 'pac-dot' + ((i + 1) % 8 === 0 ? ' power' : '');
        track.appendChild(dot);
    }
}

// Formulário de contato.
// Com a chave do Web3Forms em data-web3forms-key, envia direto (sem backend)
// e mostra o resultado. Sem chave, abre o app de e-mail (mailto) como antes.
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const status = contactForm.querySelector('.form-status');
    const submitBtn = contactForm.querySelector('.btn-submit');
    const accessKey = (contactForm.dataset.web3formsKey || '').trim();

    const t = (key) => (translations[currentLanguage] || translations.pt)[key] || '';
    const setStatus = (key, cls) => {
        if (!status) return;
        status.textContent = t(key);
        status.className = 'form-status' + (cls ? ' ' + cls : '');
    };

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!name || !emailOk || !message) {
            setStatus('form-invalid', 'is-error');
            return;
        }

        const isEn = currentLanguage === 'en';
        const subject = isEn ? `Contact from ${name} via Portfolio` : `Contato de ${name} pelo Portfólio`;

        // sem chave: comportamento antigo (mailto)
        if (!accessKey) {
            const body = isEn
                ? `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
                : `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`;
            window.location.href = `mailto:keliane.dev@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            return;
        }

        // honeypot preenchido = bot
        const honeypot = contactForm.querySelector('[name="botcheck"]');
        if (honeypot && honeypot.checked) return;

        submitBtn.disabled = true;
        setStatus('form-sending');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ access_key: accessKey, subject, name, email, message })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setStatus('form-sent', 'is-ok');
                contactForm.reset();
            } else {
                throw new Error(data.message || 'erro');
            }
        } catch (err) {
            setStatus('form-error', 'is-error');
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// Botão de currículo: só aparece se o PDF existir em assets/
function initResumeButton() {
    const btn = document.querySelector('.btn-cv');
    if (!btn) return;
    fetch(btn.getAttribute('href'), { method: 'HEAD' })
        .then(r => { if (r.ok) btn.hidden = false; })
        .catch(() => {});
}

function initAdvancedSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offset = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                
                scrollTo(targetPosition, 1000);
            }
        });
    });

    function scrollTo(to, duration) {
        const start = window.pageYOffset;
        const change = to - start;
        let currentTime = 0;
        const increment = 20;

        function animateScroll() {
            currentTime += increment;
            const val = easeInOutQuad(currentTime, start, change, duration);
            window.scrollTo(0, val);
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        }
        animateScroll();
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
}

function initNavigation() {
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect (throttled with requestAnimationFrame to avoid layout thrash)
    const sections = document.querySelectorAll('section');
    let scrollTicking = false;

    function onScroll() {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
            document.body.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            document.body.classList.remove('scrolled');
        }

        // Active section
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
                const id = section.getAttribute('id');
                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === '#' + id;
                    link.classList.toggle('active', isActive);
                    if (isActive) link.setAttribute('aria-current', 'page');
                    else link.removeAttribute('aria-current');
                });
            }
        });

        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    
    // Mobile menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active', open);
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open
                ? (currentLanguage === 'en' ? 'Close menu' : 'Fechar menu')
                : (currentLanguage === 'en' ? 'Open menu' : 'Abrir menu'));
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

function initTypingEffect() {
    const element = document.getElementById('typed-role');
    if (!element) return;

    // prefers-reduced-motion: mostra o cargo principal, sem digitar/apagar
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.textContent = 'Full Stack Engineer';
        return;
    }
    
    const roles = [
        'Full Stack Engineer',
        'Python Backend Dev',
        'React + TypeScript',
        'Flutter Dev',
        'LLM Integration',
        'Tech Lead'
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let speed = 100;
    
    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            element.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            speed = 50;
        } else {
            element.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            speed = 100;
        }
        
        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            speed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            speed = 500;
        }
        
        setTimeout(type, speed);
    }
    
    setTimeout(type, 1500);
}

function initCounters() {
    const counters = document.querySelectorAll('.metric-value');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.section-header, .about-image-wrapper, .about-content, ' +
        '.service-item, .exp-layout, .project-card, .contact-card, .contact-cta'
    );
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        el.classList.add('reveal-element');
        observer.observe(el);
    });
}

const style = document.createElement('style');
style.textContent = `
    .reveal-element {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .reveal-element.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    .project-card.reveal-element,
    .service-item.reveal-element {
        transition-delay: calc(var(--delay, 0) * 0.1s);
    }
`;
document.head.appendChild(style);

document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.setProperty('--delay', index % 4);
});

document.querySelectorAll('.service-item').forEach((card, index) => {
    card.style.setProperty('--delay', index % 2);
});

// A Experiência não usa mais abas (os painéis ficam empilhados).
function initExperienceTabs() {
    const tabs = document.querySelectorAll('.exp-tab');
    const panels = document.querySelectorAll('.exp-panel');
    if (!tabs.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetId) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

function initProjectFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const toggleBtn = document.getElementById('projects-toggle');
    const INITIAL = 6; // cards visíveis antes do "Ver mais"
    let expanded = false;

    const updateProjectVisibility = () => {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        let shown = 0;
        let collapsedAny = false;

        projectCards.forEach(card => {
            const categories = card.dataset.category || '';
            const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
            // "Ver mais" só vale na lista completa; filtros mostram tudo que casar
            const collapsed = matchesFilter && activeFilter === 'all' && !expanded && shown >= INITIAL;
            if (matchesFilter) shown++;
            if (collapsed) collapsedAny = true;
            card.classList.toggle('hidden', !matchesFilter || collapsed);
        });

        const grid = document.querySelector('.projects-grid');
        if (grid) grid.classList.toggle('is-collapsed', collapsedAny);

        if (toggleBtn) {
            const t = translations[currentLanguage] || translations.pt;
            toggleBtn.hidden = activeFilter !== 'all' || projectCards.length <= INITIAL;
            toggleBtn.setAttribute('aria-expanded', String(expanded));
            toggleBtn.classList.toggle('is-open', expanded);
            toggleBtn.querySelector('.btn-text').textContent = expanded ? t['btn-view-less'] : t['btn-view-more'];
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            expanded = false;
            updateProjectVisibility();
        });
    });

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            expanded = !expanded;
            updateProjectVisibility();
            if (!expanded) {
                // recolheu: volta para o topo da seção para não ficar no vazio
                const top = document.getElementById('projects').getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    }

    // troca de idioma: reaplica o texto do botão
    document.addEventListener('languagechange-portfolio', () => updateProjectVisibility());

    updateProjectVisibility();
    initProjectCardGlow();
}

// ========== Vídeos de apresentação dos projetos ==========
// Cada card tem um <video> (webm) por cima da imagem. O vídeo só é
// carregado e tocado quando o card entra na tela; sai da tela, pausa.
// Se o navegador não tocar webm ou a rede pedir economia de dados,
// o vídeo some e a imagem continua.
function initProjectVideos() {
    const videos = document.querySelectorAll('.project-video');
    if (!videos.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData) {
        videos.forEach(v => v.remove());
        return;
    }

    videos.forEach(video => {
        video.addEventListener('canplay', () => video.classList.add('is-ready'), { once: true });
        // erro de <source> não borbulha: escuta no último source
        const lastSource = video.querySelector('source:last-child');
        (lastSource || video).addEventListener('error', () => video.remove(), { once: true });
        video.addEventListener('error', () => video.remove(), { once: true });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                const p = video.play();
                if (p && p.catch) p.catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.35 });

    videos.forEach(video => observer.observe(video));
}

function initProjectCardGlow() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}



function initParallax() {
    const heroVisual = document.querySelector('.hero-visual');
    const profileFrame = document.querySelector('.profile-frame');
    const gridBg = document.querySelector('.grid-bg');
    
    let parallaxTicking = false;

    function onParallaxScroll() {
        const scrolled = window.scrollY;

        if (heroVisual && scrolled < window.innerHeight) {
            heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
        }

        if (gridBg) {
            gridBg.style.transform = `translateY(${scrolled * 0.1}px)`;
        }

        parallaxTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            parallaxTicking = true;
            requestAnimationFrame(onParallaxScroll);
        }
    }, { passive: true });
    
    // Mouse parallax on hero (throttled with requestAnimationFrame)
    if (profileFrame) {
        let mouseTicking = false;
        let lastX = 0;
        let lastY = 0;

        document.addEventListener('mousemove', (e) => {
            lastX = e.clientX;
            lastY = e.clientY;
            if (!mouseTicking) {
                mouseTicking = true;
                requestAnimationFrame(() => {
                    const { innerWidth, innerHeight } = window;
                    const xPercent = (lastX / innerWidth - 0.5) * 2;
                    const yPercent = (lastY / innerHeight - 0.5) * 2;

                    profileFrame.style.transform = `
                        perspective(1000px)
                        rotateY(${xPercent * 5}deg)
                        rotateX(${-yPercent * 5}deg)
                    `;
                    mouseTicking = false;
                });
            }
        }, { passive: true });
    }
}

document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

const heroName = document.querySelector('.hero-name');
if (heroName) {
    heroName.addEventListener('mouseenter', () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        heroName.style.animation = 'textGlitch 0.3s ease';
        setTimeout(() => {
            heroName.style.animation = '';
        }, 300);
    });
}

// Add glitch keyframes
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
    @keyframes textGlitch {
        0% { transform: translate(0); }
        20% { transform: translate(-3px, 3px); }
        40% { transform: translate(-3px, -3px); }
        60% { transform: translate(3px, 3px); }
        80% { transform: translate(3px, -3px); }
        100% { transform: translate(0); }
    }
`;
document.head.appendChild(glitchStyle);

const techTags = document.querySelectorAll('.tech-tag');
const techObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'all 0.3s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 50);
            
            techObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

techTags.forEach(tag => techObserver.observe(tag));

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});


let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Matrix rain effect
        createMatrixRain();
    }
});

function createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        pointer-events: none;
    `;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff88';
        ctx.font = fontSize + 'px JetBrains Mono';
        
        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    const interval = setInterval(draw, 33);
    
    setTimeout(() => {
        clearInterval(interval);
        canvas.remove();
    }, 5000);
}


// ========== Internationalization (i18n) ==========

const translations = {
    pt: {
        'nav-home': 'Home',
        'nav-about': 'Sobre',
        'nav-services': 'Serviços',
        'nav-experience': 'Experiência',
        'nav-projects': 'Projetos',
        'nav-contact': 'Contato',
        'services-title': 'Serviços',
        'services-subtitle': '// O que construo hoje na <span class="text-accent">BlueCircuit</span> — do design ao deploy',
        'svc-sites': 'Sites & Landing Pages',
        'svc-sites-1': 'Sites institucionais',
        'svc-sites-2': 'Sites empresariais',
        'svc-sites-3': 'Landing pages',
        'svc-sites-4': 'Lojas virtuais',
        'svc-sites-5': 'Portais corporativos',
        'svc-web': 'Sistemas Web',
        'svc-web-1': 'Sistemas completos',
        'svc-web-2': 'Plataformas SaaS',
        'svc-web-3': 'CRM personalizado',
        'svc-web-4': 'ERP sob medida',
        'svc-web-5': 'Sistemas de gestão',
        'svc-mobile': 'Apps Mobile',
        'svc-mobile-1': 'Apps iOS',
        'svc-mobile-2': 'Apps Android',
        'svc-mobile-3': 'Apps multiplataforma',
        'svc-mobile-4': 'Progressive Web Apps',
        'svc-dash': 'Dashboards & Painéis',
        'svc-dash-1': 'Dashboards administrativos',
        'svc-dash-2': 'Painéis de gestão',
        'svc-dash-3': 'Portais de clientes',
        'svc-dash-4': 'Sistemas internos',
        'svc-auto': 'Plataformas & Automação',
        'svc-auto-1': 'Plataformas de agendamento',
        'svc-auto-2': 'Sistemas de vendas',
        'svc-auto-3': 'Automação de processos',
        'svc-auto-4': 'Ferramentas internas sob medida',
        'svc-ai-1': 'Integração de LLMs',
        'svc-ai-2': 'Chatbots e assistentes',
        'svc-ai-3': 'Classificação e triagem automática',
        'svc-ai-4': 'Extração de dados de documentos',
        'svc-ai-5': 'Automação de rotinas com IA',
        'svc-int': 'Integrações',
        'svc-int-1': 'APIs de terceiros',
        'svc-int-2': 'Gateways de pagamento',
        'svc-int-3': 'WhatsApp Business',
        'svc-int-4': 'ERPs & CRMs',
        'svc-mod': 'Modernização',
        'svc-mod-1': 'Sistemas legados',
        'svc-mod-2': 'Refatoração de front-end',
        'svc-mod-3': 'Interfaces modernas',
        'svc-mod-4': 'Arquitetura de software',
        'svc-design': 'Design & UX',
        'svc-design-2': 'Prototipagem de telas',
        'svc-design-3': 'Interfaces responsivas',
        'svc-design-4': 'Design systems',
        'hero-greeting': 'Olá, meu nome é',
        'hero-description': 'Engenheira de Software <span class="text-accent">Full Stack</span> com Python, C#/.NET, Node.js, React e Flutter. Criei um <span class="text-accent">algoritmo de matchmaking premiado</span> em congresso latino-americano de inovação e sistemas de triagem em tempo real para a área da saúde.',
        'about-location-value': 'Fortaleza, CE · remoto',
        'gh-title': 'atividade no GitHub',
        'gh-total-label': 'contribuições nos últimos 12 meses',
        'commit-label': 'último commit',
        'metric-aqua': '<b>+1.000</b> empreendedores na comunidade',
        'metric-mental': '<b>10 mil+</b> downloads na Play Store',
        'modal-visit': 'Abrir projeto',
        'toast-copied': 'e-mail copiado ✓',
        'stack-backend': 'backend',
        'stack-frontend': 'frontend & mobile',
        'stack-data': 'dados',
        'stack-devops': 'devops & infra',
        'btn-projects': 'Ver Projetos',
        'btn-cv': 'Currículo (PDF)',
        'form-sending': '// enviando...',
        'form-sent': '// mensagem enviada! respondo em breve.',
        'form-error': '// não foi possível enviar. tente de novo ou use o e-mail.',
        'form-invalid': '// preencha nome, e-mail válido e mensagem.',
        'metric-years': 'Anos de exp.',
        'metric-projects': 'Projetos',
        'metric-commits': 'Commits',
        'about-title': 'Sobre Mim',
        'about-image-label': 'Mentora & Dev',
        'about-intro': '<span class="code-comment">/** Engenheira de Software Full Stack */</span> Gosto de entender o problema antes de abrir o editor. No dia a dia uso <strong>React, TypeScript, Python, C#/.NET e Node.js</strong>, e nos últimos anos integrei <strong>LLMs</strong> em sistemas reais: análise de sentimento, triagem de pacientes pela Escala de Manchester e automação de fluxos de inovação.',
        'about-details': 'Programo profissionalmente desde 2023 e passei por agritech, saúde, indústria e um hub de inovação. Na Orfeu desenhei e construí o algoritmo de matchmaking que conecta demandas do ecossistema de saúde a soluções tecnológicas, premiado no Congresso Latino-Americano de Inovação Aberta. Na ACEV fui tech lead de um CRM sob medida, e na Kompa escrevi as APIs que fazem triagem de pacientes em tempo real. Também cuido do que fica em volta do código: PostgreSQL, MongoDB, Redis, Docker, AWS e CI/CD.',
        'about-formation-label': 'Formação',
        'about-formation-value': 'Ciência da Computação',
        'about-tech-label': 'Tech Stack:',
        'exp-title': 'Experiência',
        'projects-title': 'Projetos',
        'projects-subtitle': '// Alguns dos sistemas que já entreguei',
        'filter-all': 'Todos',
        'btn-view-more': 'Ver Mais',
        'btn-view-less': 'Ver Menos',
        'contact-title': 'Entre em Contato',
        'contact-heading': 'Tem um projeto em mente?',
        'contact-text': 'Aceito projetos freelance, consultoria e propostas de trabalho. Me conta o que você precisa, mesmo que ainda esteja meio vago, e eu respondo por e-mail ou WhatsApp.',
        'contact-location-label': 'Localização',
        'form-name-label': 'const nome =',
        'form-name-placeholder': '"Seu Nome";',
        'form-email-label': 'const email =',
        'form-email-placeholder': '"seu@email.com";',
        'form-message-label': 'const mensagem =',
        'form-message-placeholder': '`Escreva sua mensagem aqui...`;',
        'form-submit': 'enviarMensagem()',
    },
    en: {
        'nav-home': 'Home',
        'nav-about': 'About',
        'nav-services': 'Services',
        'nav-experience': 'Experience',
        'nav-projects': 'Projects',
        'nav-contact': 'Contact',
        'services-title': 'Services',
        'services-subtitle': '// What I build today at <span class="text-accent">BlueCircuit</span> — from design to deploy',
        'svc-sites': 'Websites & Landing Pages',
        'svc-sites-1': 'Institutional websites',
        'svc-sites-2': 'Business websites',
        'svc-sites-3': 'Landing pages',
        'svc-sites-4': 'Online stores',
        'svc-sites-5': 'Corporate portals',
        'svc-web': 'Web Systems',
        'svc-web-1': 'Complete systems',
        'svc-web-2': 'SaaS platforms',
        'svc-web-3': 'Custom CRM',
        'svc-web-4': 'Tailor-made ERP',
        'svc-web-5': 'Management systems',
        'svc-mobile': 'Mobile Apps',
        'svc-mobile-1': 'iOS apps',
        'svc-mobile-2': 'Android apps',
        'svc-mobile-3': 'Cross-platform apps',
        'svc-mobile-4': 'Progressive Web Apps',
        'svc-dash': 'Dashboards & Panels',
        'svc-dash-1': 'Admin dashboards',
        'svc-dash-2': 'Management panels',
        'svc-dash-3': 'Client portals',
        'svc-dash-4': 'Internal systems',
        'svc-auto': 'Platforms & Automation',
        'svc-auto-1': 'Scheduling platforms',
        'svc-auto-2': 'Sales systems',
        'svc-auto-3': 'Process automation',
        'svc-auto-4': 'Custom internal tools',
        'svc-ai-1': 'LLM integration',
        'svc-ai-2': 'Chatbots and assistants',
        'svc-ai-3': 'Automatic classification and triage',
        'svc-ai-4': 'Data extraction from documents',
        'svc-ai-5': 'AI-powered routine automation',
        'svc-int': 'Integrations',
        'svc-int-1': 'Third-party APIs',
        'svc-int-2': 'Payment gateways',
        'svc-int-3': 'WhatsApp Business',
        'svc-int-4': 'ERPs & CRMs',
        'svc-mod': 'Modernization',
        'svc-mod-1': 'Legacy systems',
        'svc-mod-2': 'Front-end refactoring',
        'svc-mod-3': 'Modern interfaces',
        'svc-mod-4': 'Software architecture',
        'svc-design': 'Design & UX',
        'svc-design-1': 'UX/UI design',
        'svc-design-2': 'Screen prototyping',
        'svc-design-3': 'Responsive interfaces',
        'svc-design-4': 'Design systems',
        'svc-support': 'Support & Consulting',
        'svc-support-1': 'System maintenance',
        'svc-support-2': 'Continuous tech support',
        'svc-support-3': 'Technology consulting',
        'svc-support-4': 'Strategic planning',
        'hero-greeting': 'Hi, my name is',
        'hero-description': '<span class="text-accent">Full Stack</span> Software Engineer working with Python, C#/.NET, Node.js, React and Flutter. I built an <span class="text-accent">award-winning matchmaking algorithm</span>, recognized at a Latin American open innovation congress, and real-time triage systems for healthcare.',
        'about-location-value': 'Fortaleza, Brazil · remote',
        'gh-title': 'GitHub activity',
        'gh-total-label': 'contributions in the last 12 months',
        'commit-label': 'last commit',
        'metric-aqua': '<b>1,000+</b> entrepreneurs in the community',
        'metric-mental': '<b>10k+</b> downloads on Google Play',
        'modal-visit': 'Open project',
        'toast-copied': 'email copied ✓',
        'stack-backend': 'backend',
        'stack-frontend': 'frontend & mobile',
        'stack-data': 'data',
        'stack-devops': 'devops & infra',
        'btn-projects': 'View Projects',
        'btn-cv': 'Resume (PDF)',
        'form-sending': '// sending...',
        'form-sent': '// message sent! I will reply soon.',
        'form-error': '// could not send. try again or use the email.',
        'form-invalid': '// please fill in name, a valid email and message.',
        'metric-years': 'Years of exp.',
        'metric-projects': 'Projects',
        'metric-commits': 'Commits',
        'about-title': 'About Me',
        'about-image-label': 'Mentor & Dev',
        'about-intro': '<span class="code-comment">/** Full Stack Software Engineer */</span> I like to understand the problem before opening the editor. Day to day I work with <strong>React, TypeScript, Python, C#/.NET and Node.js</strong>, and over the last few years I have wired <strong>LLMs</strong> into real systems: sentiment analysis, patient triage based on the Manchester Triage Scale and automation of innovation workflows.',
        'about-details': 'I have been coding professionally since 2023, across agritech, healthcare, manufacturing and an innovation hub. At Orfeu I designed and built the matchmaking algorithm that connects healthcare ecosystem demands to technology solutions, awarded at the Latin American Open Innovation Congress. At ACEV I was tech lead on a custom CRM, and at Kompa I wrote the APIs that triage patients in real time. I also take care of what surrounds the code: PostgreSQL, MongoDB, Redis, Docker, AWS and CI/CD.',
        'about-formation-label': 'Education',
        'about-formation-value': 'Computer Science',
        'about-tech-label': 'Tech Stack:',
        'exp-title': 'Experience',
        'projects-title': 'Projects',
        'projects-subtitle': '// Some of the systems I have shipped',
        'filter-all': 'All',
        'btn-view-more': 'View More',
        'btn-view-less': 'View Less',
        'contact-title': 'Get in Touch',
        'contact-heading': 'Got a project in mind?',
        'contact-text': 'I take on freelance projects, consulting and job offers. Tell me what you need, even if it is still a bit vague, and I will get back to you by email or WhatsApp.',
        'contact-location-label': 'Location',
        'form-name-label': 'const name =',
        'form-name-placeholder': '"Your Name";',
        'form-email-label': 'const email =',
        'form-email-placeholder': '"your@email.com";',
        'form-message-label': 'const message =',
        'form-message-placeholder': '`Write your message here...`;',
        'form-submit': 'sendMessage()',
    }
};

const expTranslations = {
    pt: {
        bluecircuit: {
            date: 'Jul 2026 - Presente',
            badge: 'Atual',
            items: [
                'Sites, landing pages, lojas virtuais e sistemas web (SaaS, CRM e ERP) para clientes de vários segmentos',
                'Apps mobile em Flutter, PWAs e painéis administrativos',
                'Integração com APIs de terceiros, gateways de pagamento e WhatsApp Business',
                'Modernização de sistemas legados, design de interface e consultoria de arquitetura'
            ]
        },
        orfeu: {
            date: 'Nov 2025 - Mai 2026',
            items: [
                'Algoritmo de matchmaking que conecta demandas do ecossistema de saúde a soluções tecnológicas, premiado no Congresso Latino-Americano de Inovação Aberta',
                'Serviços em Node.js e desenho das APIs que o front consome',
                'Integração de LLMs com saída estruturada para automatizar etapas do fluxo de inovação',
                'Front-end em React e TypeScript, do componente à tela inteira, com cuidado com a experiência de uso'
            ]
        },
        acev: {
            date: 'Dez 2025 - Abr 2026',
            badge: 'Tech Lead',
            items: [
                'Liderei a parte técnica de um CRM e de sistemas sob medida, decidindo a arquitetura e revisando o código do time',
                'Back-end em Python (FastAPI, Django, Flask) e Node.js',
                'Web em React e mobile em Flutter',
                'Integração de LLMs e montagem dos pipelines de CI/CD'
            ]
        },
        aquabit: {
            date: 'Mar 2025 - Fev 2026',
            items: [
                'APIs em Python com FastAPI e Django',
                'Modelagem do banco e ajuste de consultas lentas no PostgreSQL com SQLAlchemy',
                'Containers e orquestração das aplicações com Docker',
                'Scripts de automação e rotinas de log e monitoramento'
            ]
        },
        kompa: {
            date: 'Ago 2024 - Dez 2025',
            items: [
                'APIs em Python/Flask integradas a modelos de IA para triagem e análise de risco de pacientes',
                'Chat e notificações em tempo real com WebSocket e push',
                'PostgreSQL com SQLAlchemy, incluindo otimização de consultas',
                'Deploy em AWS (EC2, S3), gestão de secrets e orquestração com Docker Swarm'
            ]
        },
        passamanaria: {
            date: 'Nov 2023 - Mai 2024',
            items: [
                'Dashboards e relatórios gerenciais em Flask',
                'App mobile em Flutter, do zero à manutenção',
                'Integração e manutenção do banco Microsoft SQL Server',
                'Scripts para automatizar tarefas repetitivas do setor'
            ]
        },
        vida: {
            date: 'Mai 2023 - Out 2023',
            items: [
                'Extração e limpeza de dados com SQL',
                'Relatórios e dashboards interativos',
                'Automação de rotinas manuais com scripts web'
            ]
        }
    },
    en: {
        bluecircuit: {
            date: 'Jul 2026 - Present',
            badge: 'Current',
            items: [
                'Websites, landing pages, online stores and web systems (SaaS, CRM and ERP) for clients across several industries',
                'Mobile apps in Flutter, PWAs and admin panels',
                'Integration with third-party APIs, payment gateways and WhatsApp Business',
                'Legacy system modernization, interface design and architecture consulting'
            ]
        },
        orfeu: {
            date: 'Nov 2025 - May 2026',
            items: [
                'Matchmaking algorithm that connects healthcare ecosystem demands to technology solutions, awarded at the Latin American Open Innovation Congress',
                'Node.js services and design of the APIs the front-end consumes',
                'LLM integration with structured output to automate steps of the innovation flow',
                'React and TypeScript front-end, from single components to full screens, with care for the user experience'
            ]
        },
        acev: {
            date: 'Dec 2025 - Apr 2026',
            badge: 'Tech Lead',
            items: [
                'Led the technical side of a CRM and custom systems, deciding on architecture and reviewing the team\'s code',
                'Back-end in Python (FastAPI, Django, Flask) and Node.js',
                'Web in React and mobile in Flutter',
                'LLM integration and setting up the CI/CD pipelines'
            ]
        },
        aquabit: {
            date: 'Mar 2025 - Feb 2026',
            items: [
                'Python APIs with FastAPI and Django',
                'Database modeling and tuning slow queries in PostgreSQL with SQLAlchemy',
                'Containers and orchestration of the applications with Docker',
                'Automation scripts and logging and monitoring routines'
            ]
        },
        kompa: {
            date: 'Aug 2024 - Dec 2025',
            items: [
                'Python/Flask APIs wired to AI models for patient triage and risk analysis',
                'Real-time chat and notifications with WebSockets and push',
                'PostgreSQL with SQLAlchemy, including query optimization',
                'Deployment on AWS (EC2, S3), secrets management and orchestration with Docker Swarm'
            ]
        },
        passamanaria: {
            date: 'Nov 2023 - May 2024',
            items: [
                'Management dashboards and reports in Flask',
                'Flutter mobile app, from scratch to maintenance',
                'Microsoft SQL Server database integration and maintenance',
                'Scripts to automate repetitive tasks in the department'
            ]
        },
        vida: {
            date: 'May 2023 - Oct 2023',
            items: [
                'Data extraction and cleanup with SQL',
                'Interactive reports and dashboards',
                'Automating manual routines with web scripts'
            ]
        }
    }
};

const projectTranslations = {
    pt: {
        'Orfeu': { type: '<i class="fas fa-project-diagram"></i> Orquestrador', desc: 'Hub de inovação que conecta demandas do ecossistema de saúde a soluções tecnológicas. Fiz o front em React/TypeScript, o backend em Node e o algoritmo de matchmaking que faz essa conexão, premiado no Congresso Latino-Americano de Inovação Aberta.' },
        'Aquabit': { type: '<i class="fas fa-fish"></i> Agritech', desc: 'Sistema de gestão para quem cria peixe e camarão. O produtor registra biometria, mortalidade e ração por tanque e lote, e acompanha custo e rentabilidade de cada ciclo. Fui responsável pelas APIs em FastAPI e Django, pela modelagem no PostgreSQL e pela infra em Docker.' },
        'Comunidade Aqua': { type: '<i class="fas fa-users"></i> Social', desc: 'Rede social da aquicultura: produtores e técnicos tiram dúvidas, publicam no feed e se ajudam com os problemas do dia a dia nos tanques. Fiz o backend, a autenticação e o feed em tempo real.' },
        'Amevis': { type: '<i class="fas fa-briefcase"></i> Corporativo', desc: 'Loja virtual de perfumes orientais e similares de importados. Catálogo, carrinho e checkout feitos em Next.js.' },
        'Marília Dantas': { type: '<i class="fas fa-palette"></i> Portfolio', desc: 'Site de um estúdio de beleza e estética: serviços, tratamentos e contato. Feito em Next.js e pensado primeiro para o celular.' },
        'Letícia Morais': { type: '<i class="fas fa-brain"></i> Psicologia', desc: 'Site da psicóloga Letícia Morais, que trabalha com luto. Além da apresentação e do livro dela, tem um journal onde ela publica textos sobre perdas. Feito em PHP.' },
        'Método CEV': { type: '<i class="fas fa-graduation-cap"></i> Educação', desc: 'Plataforma de cursos do Método CEV. O aluno acompanha as aulas em módulos e vê o próprio progresso; a equipe gerencia conteúdo e alunos pelo painel. React, TypeScript e Node.' },
        'Kompa Saúde': { type: '<i class="fas fa-heartbeat"></i> HealthTech', desc: 'Plataforma de saúde digital que atende pacientes de empresas. Escrevi as APIs em Flask, o chat em tempo real com WebSocket e a integração com modelos de IA que classificam o risco de cada atendimento pela Escala de Manchester. Deploy em AWS.' },
        'MentalClean': { type: '<i class="fas fa-heartbeat"></i> HealthTech', desc: 'App de apoio emocional que empresas oferecem aos funcionários: atendimento psicológico, central 24h e conteúdo educativo. Cuidei do backend em Flask e da infra em Docker.' },
        'Noticias ACEV': { type: '<i class="fas fa-newspaper"></i> Portal de Notícias', desc: 'Portal de notícias da ACEV, a associação dos conselheiros tutelares do Ceará, com pautas sobre direitos da criança e do adolescente. Feito em PHP.' },
        'Movimento Metodo CEV': { type: '<i class="fas fa-users"></i> Comunidade', desc: 'Área de membros da comunidade do Método CEV, com conteúdo exclusivo e espaço para os alunos interagirem entre si. Next.js e TypeScript.' },
        'Imersao Metodo CEV': { type: '<i class="fas fa-chalkboard-teacher"></i> Evento', desc: 'Landing page do evento de imersão do Método CEV: o que é, para quem é e formulário de inscrição. Next.js.' },
    },
    en: {
        'Orfeu': { type: '<i class="fas fa-project-diagram"></i> Orchestrator', desc: 'Innovation hub that connects healthcare ecosystem demands to technology solutions. I built the React/TypeScript front-end, the Node backend and the matchmaking algorithm behind those connections, awarded at the Latin American Open Innovation Congress.' },
        'Aquabit': { type: '<i class="fas fa-fish"></i> Agritech', desc: 'Management system for fish and shrimp farmers. Producers log biometrics, mortality and feed per tank and batch, and follow the cost and profitability of each cycle. I owned the FastAPI and Django APIs, the PostgreSQL modeling and the Docker infrastructure.' },
        'Comunidade Aqua': { type: '<i class="fas fa-users"></i> Social', desc: 'Social network for aquaculture: farmers and technicians ask questions, post to the feed and help each other with day-to-day problems in the tanks. I built the backend, authentication and the real-time feed.' },
        'Amevis': { type: '<i class="fas fa-briefcase"></i> Corporate', desc: 'Online perfume store focused on oriental fragrances and designer-inspired scents. Catalog, cart and checkout built with Next.js.' },
        'Marília Dantas': { type: '<i class="fas fa-palette"></i> Portfolio', desc: 'Website for a beauty and aesthetics studio: services, treatments and contact. Built with Next.js and designed mobile-first.' },
        'Letícia Morais': { type: '<i class="fas fa-brain"></i> Psychology', desc: 'Website for psychologist Letícia Morais, who specializes in grief. Besides her introduction and book, it has a journal where she publishes essays on loss. Built with PHP.' },
        'Método CEV': { type: '<i class="fas fa-graduation-cap"></i> Education', desc: 'Course platform for Método CEV. Students follow lessons in modules and track their progress; the team manages content and students from an admin panel. React, TypeScript and Node.' },
        'Kompa Saúde': { type: '<i class="fas fa-heartbeat"></i> HealthTech', desc: 'Digital health platform that serves corporate patients. I wrote the Flask APIs, the real-time chat over WebSockets and the integration with AI models that score the risk of each case using the Manchester Triage Scale. Deployed on AWS.' },
        'MentalClean': { type: '<i class="fas fa-heartbeat"></i> HealthTech', desc: 'Emotional support app that companies offer to their employees: psychological care, a 24-hour help line and educational content. I handled the Flask backend and the Docker infrastructure.' },
        'Noticias ACEV': { type: '<i class="fas fa-newspaper"></i> News Portal', desc: 'News portal for ACEV, the association of guardianship counselors in Ceará, covering children\'s and adolescents\' rights. Built with PHP.' },
        'Movimento Metodo CEV': { type: '<i class="fas fa-users"></i> Community', desc: 'Members area for the Método CEV community, with exclusive content and a space for students to interact with each other. Next.js and TypeScript.' },
        'Imersao Metodo CEV': { type: '<i class="fas fa-chalkboard-teacher"></i> Event', desc: 'Landing page for the Método CEV immersion event: what it is, who it is for and the sign-up form. Next.js.' },
    }
};

function initLanguageToggle() {
    const langBtns = document.querySelectorAll('.lang-btn');

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLanguage) return;
            currentLanguage = lang;
            langBtns.forEach(b => {
                const on = b === btn;
                b.classList.toggle('active', on);
                b.setAttribute('aria-pressed', String(on));
            });
            applyTranslations(lang);
        });
    });
}

function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    // idioma do documento e título da aba acompanham a troca
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    document.title = lang === 'en'
        ? 'Keliane Soares | Full Stack Developer'
        : 'Keliane Soares | Desenvolvedora Full Stack';

    // Simple text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });

    // métricas dos projetos (têm <b>)
    document.querySelectorAll('.project-metric[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // HTML content
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Experience panels
    translateExperience(lang);

    // Project cards
    translateProjects(lang);

    document.dispatchEvent(new CustomEvent('languagechange-portfolio'));
}

function translateExperience(lang) {
    const data = expTranslations[lang];
    if (!data) return;

    Object.keys(data).forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const t = data[panelId];

        const dateEl = panel.querySelector('.exp-date');
        if (dateEl && t.date) {
            dateEl.innerHTML = '<i class="far fa-calendar"></i> ' + t.date;
        }

        if (t.badge) {
            const badge = panel.querySelector('.exp-badge');
            if (badge) badge.textContent = t.badge;
        }

        const items = panel.querySelectorAll('.exp-list li');
        if (t.items) {
            items.forEach((li, i) => {
                if (t.items[i] !== undefined) {
                    li.innerHTML = '<span class="list-marker"></span>' + t.items[i];
                }
            });
        }
    });
}

function translateProjects(lang) {
    const data = projectTranslations[lang];
    if (!data) return;

    document.querySelectorAll('.project-card').forEach(card => {
        const titleEl = card.querySelector('.project-title');
        if (!titleEl) return;
        const title = titleEl.textContent.trim();

        if (data[title]) {
            const typeEl = card.querySelector('.project-type');
            if (typeEl && data[title].type) typeEl.innerHTML = data[title].type;

            const descEl = card.querySelector('.project-description');
            if (descEl && data[title].desc) descEl.textContent = data[title].desc;
        }
    });
}
