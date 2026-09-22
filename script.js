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
        } else {
            header.classList.remove('scrolled');
        }

        // Active section
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
                const id = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
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
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

function initTypingEffect() {
    const element = document.getElementById('typed-role');
    if (!element) return;
    
    const roles = [
        'Full Stack Engineer',
        'Software Engineer',
        'Backend Architect',
        'AI Integration Dev',
        'Python Specialist',
        'Tech Lead',
        'DevOps Enthusiast'
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

function initExperienceTabs() {
    const tabs = document.querySelectorAll('.exp-tab');
    const panels = document.querySelectorAll('.exp-panel');
    
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

    const updateProjectVisibility = () => {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;

        projectCards.forEach(card => {
            const categories = card.dataset.category || '';
            const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);

            if (matchesFilter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateProjectVisibility();
        });
    });

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

document.querySelectorAll('.btn-primary, .btn-large, .nav-cta').forEach(btn => {
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
    
    // Animate scan line
    const scanLine = document.querySelector('.scan-line');
    if (scanLine) {
        scanLine.style.opacity = '0.1';
    }
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
        'svc-auto-4': 'Soluções sob demanda',
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
        'hero-description': 'Engenheira de Software <span class="text-accent">Full Stack</span> especializada em arquitetura de sistemas escaláveis e na <span class="text-accent">integração prática de IA</span>. Construo back-ends robustos com Python (FastAPI, Django, Flask), C#/.NET e Node.js, além de interfaces web e mobile com React, TypeScript e Flutter. Da modelagem de dados à cultura DevOps, entrego código performático — de CRMs sob medida a sistemas críticos com triagem em tempo real.',
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
        'about-intro': '<span class="code-comment">/** Engenheira de Software Full Stack */</span> Priorizo a lógica estrutural e a resolução de problemas, criando soluções escaláveis com <strong>React, TypeScript, Python, C#/.NET e Node.js</strong>. Integro <strong>Inteligência Artificial (LLMs)</strong> em produtos reais — de análise de sentimentos a triagem em tempo real.',
        'about-details': 'Atuo com desenvolvimento full-stack há mais de 3 anos, entregando desde CRMs sob medida e algoritmos de matchmaking até sistemas críticos de saúde. Domínio de bancos relacionais e NoSQL, práticas DevOps (Docker, AWS, CI/CD) e código performático em múltiplas plataformas.',
        'about-formation-label': 'Formação',
        'about-formation-value': 'Ciência da Computação',
        'about-tech-label': 'Tech Stack:',
        'exp-title': 'Experiência',
        'projects-title': 'Projetos',
        'projects-subtitle': '// Soluções que transformam ideias em realidade digital',
        'filter-all': 'Todos',
        'btn-view-more': 'Ver Mais',
        'btn-view-less': 'Ver Menos',
        'contact-title': 'Entre em Contato',
        'contact-heading': 'Vamos construir algo incrível?',
        'contact-text': 'Estou disponível para novos projetos, consultorias e oportunidades. Se você tem uma ideia inovadora ou precisa de uma solução técnica, mande uma mensagem!',
        'contact-location-label': 'Localização',
        'form-name-label': 'const nome =',
        'form-name-placeholder': '"Seu Nome";',
        'form-email-label': 'const email =',
        'form-email-placeholder': '"seu@email.com";',
        'form-message-label': 'const mensagem =',
        'form-message-placeholder': '`Escreva sua mensagem aqui...`;',
        'form-submit': 'enviarMensagem()',
        'footer-tagline': 'Building the future, one commit at a time.',
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
        'svc-auto-4': 'On-demand solutions',
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
        'hero-description': '<span class="text-accent">Full Stack</span> Software Engineer specialized in scalable systems architecture and the <span class="text-accent">practical integration of AI</span>. I build robust back-ends with Python (FastAPI, Django, Flask), C#/.NET and Node.js, plus web and mobile interfaces with React, TypeScript and Flutter. From data modeling to DevOps culture, I deliver high-performing code — from tailor-made CRMs to critical systems with real-time triage.',
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
        'about-intro': '<span class="code-comment">/** Full Stack Software Engineer */</span> I prioritize structural logic and problem-solving, creating scalable solutions with <strong>React, TypeScript, Python, C#/.NET and Node.js</strong>. I integrate <strong>Artificial Intelligence (LLMs)</strong> into real products — from sentiment analysis to real-time triage.',
        'about-details': 'I\'ve been working with full-stack development for over 3 years, delivering everything from tailor-made CRMs and matchmaking algorithms to critical healthcare systems. Proficient in relational and NoSQL databases, DevOps practices (Docker, AWS, CI/CD), and high-performance code across multiple platforms.',
        'about-formation-label': 'Education',
        'about-formation-value': 'Computer Science',
        'about-tech-label': 'Tech Stack:',
        'exp-title': 'Experience',
        'projects-title': 'Projects',
        'projects-subtitle': '// Solutions that turn ideas into digital reality',
        'filter-all': 'All',
        'btn-view-more': 'View More',
        'btn-view-less': 'View Less',
        'contact-title': 'Get in Touch',
        'contact-heading': 'Let\'s build something amazing?',
        'contact-text': 'I\'m available for new projects, consulting, and opportunities. If you have an innovative idea or need a technical solution, send me a message!',
        'contact-location-label': 'Location',
        'form-name-label': 'const name =',
        'form-name-placeholder': '"Your Name";',
        'form-email-label': 'const email =',
        'form-email-placeholder': '"your@email.com";',
        'form-message-label': 'const message =',
        'form-message-placeholder': '`Write your message here...`;',
        'form-submit': 'sendMessage()',
        'footer-tagline': 'Building the future, one commit at a time.',
    }
};

const expTranslations = {
    pt: {
        bluecircuit: {
            date: 'Jul 2026 - Presente',
            badge: 'Atual',
            items: [
                'Desenvolvimento de sites, landing pages, lojas virtuais e sistemas web completos (SaaS, CRM e ERP sob medida)',
                'Apps mobile (iOS, Android e multiplataforma), PWAs e dashboards administrativos',
                'Integrações com APIs de terceiros, gateways de pagamento e WhatsApp Business',
                'Modernização de sistemas legados, design UX/UI e consultoria em arquitetura de software'
            ]
        },
        orfeu: {
            date: 'Nov 2025 - Mai 2026',
            items: [
                'Interfaces ricas e responsivas com React e TypeScript, com foco em UX e tipagem segura',
                'Serviços backend robustos com Node.js, aplicando boas práticas de arquitetura e design de APIs',
                'Integração de IA Generativa e programação determinística de LLMs para automação de tarefas',
                'Otimização de performance front-end e gerenciamento de estados complexos'
            ]
        },
        acev: {
            date: 'Dez 2025 - Abr 2026',
            badge: 'Tech Lead',
            items: [
                'Liderança técnica no desenvolvimento de CRMs e sistemas sob medida, definindo a arquitetura de software',
                'Back-end com Python (FastAPI, Django, Flask) e Node.js para APIs RESTful de alta performance',
                'Interfaces web e mobile com React e Flutter em múltiplas plataformas',
                'Integração de IA (LLMs) e implementação de cultura DevOps com pipelines de CI/CD'
            ]
        },
        aquabit: {
            date: 'Mar 2025 - Fev 2026',
            items: [
                'APIs escaláveis utilizando Python (FastAPI e Django)',
                'Modelagem avançada de dados e otimização de consultas com PostgreSQL e SQLAlchemy',
                'Infraestrutura, orquestração e containerização de aplicações com Docker',
                'Scripts de automação em Python e rotinas de observabilidade (logs e monitoramento)'
            ]
        },
        kompa: {
            date: 'Ago 2024 - Dez 2025',
            items: [
                'APIs RESTful em Python/Flask com integração de modelos de IA para análise de risco e triagem de pacientes',
                'Funcionalidades em tempo real via WebSocketIO e notificações push',
                'Gerenciamento de dados em PostgreSQL e otimização de performance com SQLAlchemy',
                'DevOps com deploy em AWS (EC2, S3), secrets e orquestração via Docker Swarm'
            ]
        },
        passamanaria: {
            date: 'Nov 2023 - Mai 2024',
            items: [
                'Dashboards gerenciais dinâmicos e relatórios interativos com Flask',
                'Desenvolvimento e manutenção de aplicativo mobile em Flutter',
                'Integração e manutenção de banco de dados Microsoft SQL Server',
                'Scripts de automação para reduzir retrabalho em tarefas repetitivas'
            ]
        },
        vida: {
            date: 'Mai 2023 - Out 2023',
            items: [
                'Extração e tratamento de dados com SQL',
                'Relatórios estratégicos e dashboards interativos',
                'Automações web para otimização de rotinas'
            ]
        }
    },
    en: {
        bluecircuit: {
            date: 'Jul 2026 - Present',
            badge: 'Current',
            items: [
                'Websites, landing pages, online stores and complete web systems (SaaS, CRM and tailor-made ERP)',
                'Mobile apps (iOS, Android and cross-platform), PWAs and admin dashboards',
                'Integrations with third-party APIs, payment gateways and WhatsApp Business',
                'Legacy system modernization, UX/UI design and software architecture consulting'
            ]
        },
        orfeu: {
            date: 'Nov 2025 - May 2026',
            items: [
                'Rich and responsive interfaces with React and TypeScript, focused on UX and type safety',
                'Robust backend services with Node.js, applying solid architecture and API design practices',
                'Integration of Generative AI and deterministic LLM programming for task automation',
                'Front-end performance optimization and complex state management'
            ]
        },
        acev: {
            date: 'Dec 2025 - Apr 2026',
            badge: 'Tech Lead',
            items: [
                'Technical leadership building tailor-made CRMs and systems, defining the software architecture',
                'Back-end with Python (FastAPI, Django, Flask) and Node.js for high-performance RESTful APIs',
                'Web and mobile interfaces with React and Flutter across multiple platforms',
                'AI (LLMs) integration and DevOps culture with CI/CD pipelines'
            ]
        },
        aquabit: {
            date: 'Mar 2025 - Feb 2026',
            items: [
                'Scalable APIs using Python (FastAPI and Django)',
                'Advanced data modeling and query optimization with PostgreSQL and SQLAlchemy',
                'Infrastructure, orchestration and application containerization with Docker',
                'Python automation scripts and observability routines (logs and monitoring)'
            ]
        },
        kompa: {
            date: 'Aug 2024 - Dec 2025',
            items: [
                'RESTful APIs in Python/Flask with AI model integration for risk analysis and patient triage',
                'Real-time features via WebSocketIO and push notifications',
                'Data management in PostgreSQL and performance optimization with SQLAlchemy',
                'DevOps with deployment on AWS (EC2, S3), secrets and orchestration via Docker Swarm'
            ]
        },
        passamanaria: {
            date: 'Nov 2023 - May 2024',
            items: [
                'Dynamic management dashboards and interactive reports with Flask',
                'Development and maintenance of a mobile app in Flutter',
                'Microsoft SQL Server database integration and maintenance',
                'Automation scripts to reduce rework on repetitive tasks'
            ]
        },
        vida: {
            date: 'May 2023 - Oct 2023',
            items: [
                'Data extraction and processing with SQL',
                'Strategic reports and interactive dashboards',
                'Web automations for routine optimization'
            ]
        }
    }
};

const projectTranslations = {
    pt: {
        'Orfeu': { type: '<i class="fas fa-project-diagram"></i> Orquestrador', desc: 'Funciona como um orquestrador de jornadas de inovação corporativa global. A ferramenta ajuda empresas a gerenciar e transformar iniciativas de inovação dispersas em vantagens estratégicas reais.' },
        'Aquabit': { type: '<i class="fas fa-fish"></i> Agritech', desc: 'Plataforma de inteligência e gestão para aquicultura (produção de peixes e camarões). O site e o aplicativo oferecem controle de biometrias e mortalidade, gestão de estoque por tanques e lotes, além de acompanhar custos e rentabilidade da produção.' },
        'Comunidade Aqua': { type: '<i class="fas fa-users"></i> Social', desc: 'Plataforma de interação para a comunidade de aquicultura, conectando produtores e técnicos. Desenvolvida em Django, traz autenticação, feed em tempo real e recursos colaborativos para troca de conhecimento e suporte técnico.' },
        'NordDev': { type: '<i class="fas fa-building"></i> Institucional', desc: 'Portal institucional para empresa de tecnologia que cria sites, plataformas e sistemas para outras empresas. Projetado para apresentar serviços, portfólio e facilitar a captura de leads.' },
        'Amevis': { type: '<i class="fas fa-briefcase"></i> Corporativo', desc: 'Site de e-commerce/loja de perfumes, especializado em fragrâncias similares e orientais. Estruturado para exibir produtos, facilitar compras e promover a marca.' },
        'Marília Dantas': { type: '<i class="fas fa-palette"></i> Portfolio', desc: 'Site institucional de um estúdio de beleza e estética, apresentando serviços, tratamentos e informações de contato para clientes.' },
        'Letícia Morais': { type: '<i class="fas fa-brain"></i> Psicologia', desc: 'Site profissional da psicóloga Letícia Morais, especializada em luto: apresentação, metodologia de trabalho, livro e journal com artigos e reflexões sobre perdas.' },
        'Método CEV': { type: '<i class="fas fa-graduation-cap"></i> Educação', desc: 'Plataforma educacional baseada no Método CEV, voltada para capacitação e desenvolvimento profissional com conteúdos estruturados e acompanhamento de progresso.' },
        'Kompa Saúde': { type: '<i class="fas fa-heartbeat"></i> HealthTech', desc: 'Ecossistema de saúde digital com APIs Python/Flask, integração para análise preditiva e infraestrutura AWS.' },
        'MentalClean': { type: '<i class="fas fa-heartbeat"></i> HealthTech', desc: 'Plataforma de saúde e bem-estar focada no ambiente corporativo, oferecida às empresas como canal de suporte emocional para colaboradores. Disponibiliza atendimento psicossocial, central de atendimento 24/7, assessorias especializadas e programas educativos para promoção do equilíbrio emocional e da produtividade.' },
        'Noticias ACEV': { type: '<i class="fas fa-newspaper"></i> Portal de Notícias', desc: 'Portal de notícias e conteúdo da Associação de Conselheiros e Ex-Conselheiros Tutelares do Estado do Ceará, com foco em direitos da criança e do adolescente.' },
        'Movimento Metodo CEV': { type: '<i class="fas fa-users"></i> Comunidade', desc: 'Plataforma para a comunidade do Método CEV, promovendo engajamento e desenvolvimento contínuo através de conteúdos e interações exclusivas.' },
        'Imersao Metodo CEV': { type: '<i class="fas fa-chalkboard-teacher"></i> Evento', desc: 'Landing page para o evento de imersão do Método CEV, projetada para capturar inscrições e fornecer informações detalhadas sobre o programa.' },
    },
    en: {
        'Orfeu': { type: '<i class="fas fa-project-diagram"></i> Orchestrator', desc: 'Works as an orchestrator for global corporate innovation journeys. The tool helps companies manage and transform scattered innovation initiatives into real strategic advantages.' },
        'Aquabit': { type: '<i class="fas fa-fish"></i> Agritech', desc: 'Intelligence and management platform for aquaculture (fish and shrimp production). The website and app offer biometrics and mortality control, inventory management by tanks and batches, plus tracking production costs and profitability.' },
        'Comunidade Aqua': { type: '<i class="fas fa-users"></i> Social', desc: 'Interaction platform for the aquaculture community, connecting producers and technicians. Built with Django, it features authentication, real-time feed, and collaborative resources for knowledge sharing and technical support.' },
        'NordDev': { type: '<i class="fas fa-building"></i> Institutional', desc: 'Institutional portal for a technology company that creates websites, platforms, and systems for other businesses. Designed to showcase services, portfolio, and facilitate lead capture.' },
        'Amevis': { type: '<i class="fas fa-briefcase"></i> Corporate', desc: 'E-commerce/perfume store website, specialized in similar and oriental fragrances. Structured to display products, facilitate purchases, and promote the brand.' },
        'Marília Dantas': { type: '<i class="fas fa-palette"></i> Portfolio', desc: 'Institutional website for a beauty and aesthetics studio, showcasing services, treatments, and contact information for clients.' },
        'Letícia Morais': { type: '<i class="fas fa-brain"></i> Psychology', desc: 'Professional website of psychologist Letícia Morais, specialized in grief: introduction, working methodology, book, and a journal with articles and reflections on loss.' },
        'Método CEV': { type: '<i class="fas fa-graduation-cap"></i> Education', desc: 'Educational platform based on the CEV Method, focused on professional training and development with structured content and progress tracking.' },
        'Kompa Saúde': { type: '<i class="fas fa-heartbeat"></i> HealthTech', desc: 'Digital health ecosystem with Python/Flask APIs, predictive analysis integration, and AWS infrastructure.' },
        'MentalClean': { type: '<i class="fas fa-heartbeat"></i> HealthTech', desc: 'Corporate wellness platform offered to companies as an emotional support channel for employees. Provides psychosocial care, 24/7 support center, specialized advisory services, and educational programs for promoting emotional balance and productivity.' },
        'Noticias ACEV': { type: '<i class="fas fa-newspaper"></i> News Portal', desc: 'News and content portal for the Association of Counselors and Former Guardianship Counselors of the State of Ceará, focusing on the rights of children and adolescents.' },
        'Movimento Metodo CEV': { type: '<i class="fas fa-users"></i> Community', desc: 'Platform for the Método CEV community, promoting engagement and continuous development through exclusive content and interactions.' },
        'Imersao Metodo CEV': { type: '<i class="fas fa-chalkboard-teacher"></i> Event', desc: 'Landing page for the Método CEV immersion event, designed to capture registrations and provide detailed information about the program.' },
    }
};

function initLanguageToggle() {
    const langBtns = document.querySelectorAll('.lang-btn');

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLanguage) return;
            currentLanguage = lang;
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyTranslations(lang);
        });
    });
}

function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    // Simple text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
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
                    li.innerHTML = '<span class="list-marker">▹</span>' + t.items[i];
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
