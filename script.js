document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTypingEffect();
    initCounters();
    initScrollAnimations();
    initExperienceTabs();
    initProjectFilter();
    initAdvancedSmoothScroll();
    initParallax();
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            const subject = `Contato de ${name} pelo Portfólio`;
            const body = `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`;
            
            const mailtoUrl = `mailto:keliane.dev@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            window.location.href = mailtoUrl;
        });
    }
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
    
    // Scroll effect
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active section
        const sections = document.querySelectorAll('section');
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
        
        lastScroll = currentScroll;
    });
    
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
        'Full Stack Developer',
        'Software Engineer',
        'Backend Architect',
        'Python Specialist',
        'React Developer',
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
        '.exp-layout, .project-card, .contact-card, .contact-cta'
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
    
    .project-card.reveal-element {
        transition-delay: calc(var(--delay, 0) * 0.1s);
    }
`;
document.head.appendChild(style);

document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.setProperty('--delay', index % 4);
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
    const viewMoreBtn = document.getElementById('view-more-btn');
    const projectsToShow = 4;
    let isToggled = false;

    const updateProjectVisibility = () => {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        let visibleProjects = 0;

        projectCards.forEach(card => {
            const categories = card.dataset.category || '';
            const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);

            if (matchesFilter) {
                if (isToggled || visibleProjects < projectsToShow) {
                    card.classList.remove('hidden');
                    visibleProjects++;
                } else {
                    card.classList.add('hidden');
                }
            } else {
                card.classList.add('hidden');
            }
        });

        const totalVisible = Array.from(projectCards).filter(card => {
            const categories = card.dataset.category || '';
            return activeFilter === 'all' || categories.includes(activeFilter);
        }).length;

        if (totalVisible <= projectsToShow) {
            viewMoreBtn.style.display = 'none';
        } else {
            viewMoreBtn.style.display = 'inline-flex';
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            isToggled = false;
            updateProjectVisibility();
            updateViewMoreButton();
        });
    });

    const updateViewMoreButton = () => {
        if (isToggled) {
            viewMoreBtn.querySelector('.btn-text').textContent = 'Ver Menos';
            viewMoreBtn.querySelector('.btn-icon i').classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            viewMoreBtn.querySelector('.btn-text').textContent = 'Ver Mais';
            viewMoreBtn.querySelector('.btn-icon i').classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    };
    
    viewMoreBtn.addEventListener('click', () => {
        isToggled = !isToggled;
        updateProjectVisibility();
        updateViewMoreButton();
    });

    updateProjectVisibility();
    initProjectCardGlow();
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
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        if (heroVisual && scrolled < window.innerHeight) {
            heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
        
        if (gridBg) {
            gridBg.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });
    
    // Mouse parallax on hero
    if (profileFrame) {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const xPercent = (clientX / innerWidth - 0.5) * 2;
            const yPercent = (clientY / innerHeight - 0.5) * 2;
            
            profileFrame.style.transform = `
                perspective(1000px)
                rotateY(${xPercent * 5}deg)
                rotateX(${-yPercent * 5}deg)
            `;
        });
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

