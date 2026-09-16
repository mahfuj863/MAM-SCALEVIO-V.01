/* ===================================================
   MAM SCALEVIO V2 — Premium JavaScript
   Three.js Globe | GSAP | FAQ | Counters | Multi-step Form | WhatsApp
   =================================================== */

'use strict';

// ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────
const scrollBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const scrollTop  = document.documentElement.scrollTop;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollBar) scrollBar.style.width = pct + '%';
}, { passive: true });

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileMenu.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });
    });
}

// ─── ACTIVE NAV LINK (scroll spy) ────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollPos = window.scrollY + 140;
    sections.forEach(section => {
        const top    = section.offsetTop;
        const height = section.offsetHeight;
        const id     = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
        }
    });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href === '#' || href.startsWith('#faq-') || href.startsWith('#form')) return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            
            window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
        }
    });
});

// ─── CARD TILT EFFECT ────────────────────────────────────────────────────────
function initTilt() {
    const tiltCards = document.querySelectorAll('.glass-card, .service-card, .who-card, .why-card, .case-card, .resource-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx   = rect.left + rect.width / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) / (rect.width  / 2);
            const dy   = (e.clientY - cy) / (rect.height / 2);
            const maxT = 8;
            card.style.transform = `perspective(1000px) rotateY(${dx * maxT}deg) rotateX(${-dy * maxT}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
initTilt();

// ─── HERO 3D CANVAS (Three.js) ───────────────────────────────────────────────
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const container = canvas.parentElement;
    let width  = container.clientWidth;
    let height = container.clientHeight || 560;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Scene & Camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.8);

    // ── Lights ──
    const ambientLight = new THREE.AmbientLight(0x4F8CFF, 0.4);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0x4F8CFF, 1.8, 20);
    pointLight1.position.set(4, 3, 4);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x7C6AFF, 1.2, 20);
    pointLight2.position.set(-4, -2, 3);
    scene.add(pointLight2);
    const pointLight3 = new THREE.PointLight(0x18D39E, 0.8, 15);
    pointLight3.position.set(0, 4, -2);
    scene.add(pointLight3);

    // ── Globe core ──
    const globeGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
        color: 0x0C1220,
        emissive: 0x050810,
        specular: 0x4F8CFF,
        shininess: 50,
        transparent: true,
        opacity: 0.9
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // ── Wireframe overlay ──
    const wireGeo = new THREE.SphereGeometry(1.82, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x4F8CFF,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // ── Outer glow rings ──
    const ringGeo = new THREE.TorusGeometry(2.1, 0.015, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4F8CFF, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.35;
    scene.add(ring);

    const ring2Geo = new THREE.TorusGeometry(2.4, 0.01, 8, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x7C6AFF, transparent: true, opacity: 0.25 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.2;
    ring2.rotation.y = Math.PI * 0.3;
    scene.add(ring2);

    // ── Marketplace nodes ──
    function latLonToVec3(lat, lon, r) {
        const phi   = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
             r * Math.cos(phi),
             r * Math.sin(phi) * Math.sin(theta)
        );
    }

    const marketplaces = [
        { lat: 51.5,  lon: -0.1,   color: 0x4F8CFF, label: 'UK'  },
        { lat: 52.5,  lon: 13.4,   color: 0x7C6AFF, label: 'DE'  },
        { lat: 48.8,  lon: 2.3,    color: 0x4F8CFF, label: 'FR'  },
        { lat: 41.9,  lon: 12.5,   color: 0x18D39E, label: 'IT'  },
        { lat: 40.4,  lon: -3.7,   color: 0x7C6AFF, label: 'ES'  },
        { lat: 40.7,  lon: -74.0,  color: 0xF8B84E, label: 'US'  },
        { lat: 35.7,  lon: 139.7,  color: 0x18D39E, label: 'JP'  },
        { lat: 28.6,  lon: 77.2,   color: 0x4F8CFF, label: 'IN'  },
    ];

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodePositions = [];
    marketplaces.forEach(mp => {
        const pos = latLonToVec3(mp.lat, mp.lon, 1.85);
        nodePositions.push(pos.clone());
        
        // Glowing dot
        const dotGeo = new THREE.SphereGeometry(0.05, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: mp.color });
        const dot    = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);
        nodeGroup.add(dot);
        
        // Halo ring around dot
        const haloGeo = new THREE.RingGeometry(0.08, 0.1, 24);
        const haloMat = new THREE.MeshBasicMaterial({ color: mp.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const halo    = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(pos);
        halo.lookAt(0, 0, 0);
        nodeGroup.add(halo);
    });

    // ── Connection arcs ──
    function makeArc(p1, p2, color) {
        const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(2.5);
        const pts = new THREE.QuadraticBezierCurve3(p1, mid, p2).getPoints(40);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
        return new THREE.Line(geo, mat);
    }

    const connections = [
        [0,1, 0x4F8CFF], [1,2, 0x7C6AFF], [0,3, 0x18D39E], [1,4, 0x7C6AFF],
        [0,5, 0xF8B84E], [2,3, 0x4F8CFF], [5,6, 0x18D39E]
    ];
    connections.forEach(([a, b, c]) => {
        if (nodePositions[a] && nodePositions[b]) {
            scene.add(makeArc(nodePositions[a], nodePositions[b], c));
        }
    });

    // ── Particle field ──
    const particleCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        pPos[i] = (Math.random() - 0.5) * 16;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x4F8CFF, size: 0.03, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Floating data panels (3D planes) ──
    function makeDataPanel(w, h, color, x, y, z) {
        const geo = new THREE.PlaneGeometry(w, h);
        const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        
        const edgesGeo = new THREE.EdgesGeometry(geo);
        const edgesMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
        const edges = new THREE.LineSegments(edgesGeo, edgesMat);
        mesh.add(edges);
        
        return mesh;
    }
    const panel1 = makeDataPanel(1.0, 0.6, 0x4F8CFF,  3.0,  1.4, 0.5);
    const panel2 = makeDataPanel(0.8, 0.5, 0x18D39E, -2.8, -1.0, 0.3);
    const panel3 = makeDataPanel(0.7, 0.4, 0x7C6AFF,  2.6, -1.8, 0.2);
    scene.add(panel1, panel2, panel3);

    // ─ Mouse tracking ──
    let mouseX = 0, mouseY = 0;
    const heroVisual = document.getElementById('heroVisual');
    if (heroVisual) {
        heroVisual.addEventListener('mousemove', e => {
            const rect = heroVisual.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
            mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        }, { passive: true });
    }

    // ─ Animation loop ──
    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.005;

        // Globe slow rotation
        globe.rotation.y    += 0.0025;
        wireMesh.rotation.y += 0.0025;
        nodeGroup.rotation.y = globe.rotation.y;

        // Ring rotation
        ring.rotation.z  += 0.002;
        ring2.rotation.z -= 0.0015;

        // Mouse parallax on camera
        camera.position.x += (mouseX * 0.9  - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.7 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        // Floating panels animation
        panel1.position.y = 1.4  + Math.sin(t * 0.9) * 0.2;
        panel1.rotation.y = Math.sin(t * 0.5) * 0.25;
        panel2.position.y = -1.0 + Math.sin(t * 1.1 + 1) * 0.15;
        panel2.rotation.y = Math.sin(t * 0.7 + 2) * 0.2;
        panel3.position.y = -1.8 + Math.sin(t * 0.8 + 2) * 0.12;

        // Pulsing lights
        pointLight1.intensity = 1.6 + Math.sin(t * 1.5) * 0.4;
        pointLight3.intensity = 0.6 + Math.sin(t * 1.2) * 0.3;

        // Particle drift
        particles.rotation.y += 0.0005;
        particles.rotation.x  = Math.sin(t * 0.3) * 0.06;

        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        width  = container.clientWidth;
        height = container.clientHeight || 560;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// ─── GSAP SCROLL ANIMATIONS ───────────────────────────────────────────────────
function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        initFallbackReveal();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const fadeEls = document.querySelectorAll('.fade-up');
    fadeEls.forEach(el => {
        const delay = parseFloat(el.style.getPropertyValue('--delay')) || 0;
        gsap.fromTo(el,
            { opacity: 0, y: 45 },
            {
                opacity: 1, y: 0,
                duration: 1.0,
                delay,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });
}

function initFallbackReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ─── COUNTER ANIMATIONS ───────────────────────────────────────────────────────
function animateCounter(el, target, suffix, duration = 2000) {
    const start     = 0;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const pct     = Math.min(elapsed / duration, 1);
        const eased = pct === 1 ? 1 : 1 - Math.pow(2, -10 * pct);
        const val   = Math.round(start + (target - start) * eased);
        el.textContent = val + suffix;
        if (pct < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function initCounters() {
    const counterEls = document.querySelectorAll('.trust-val[data-target]');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el     = entry.target;
                const target = parseFloat(el.dataset.target);
                const suffix = el.dataset.suffix || '';
                animateCounter(el, target, suffix);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counterEls.forEach(el => obs.observe(el));
}

// ─── KPI RING ANIMATIONS ──────────────────────────────────────────────────────
function initRings() {
    const circumference = 2 * Math.PI * 32; // r=32
    const ringFills = document.querySelectorAll('.ring-fill');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el  = entry.target;
                const pct = parseFloat(el.dataset.pct) / 100;
                const offset = circumference * (1 - pct);
                el.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)';
                el.style.strokeDashoffset = offset;
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.3 });
    ringFills.forEach(el => {
        el.style.strokeDasharray = circumference;
        el.style.strokeDashoffset = circumference;
        obs.observe(el);
    });
}

// ─── REVENUE CHART ────────────────────────────────────────────────────────────
function initRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w   = canvas.parentElement.clientWidth - 48;
    canvas.width  = w;
    canvas.height = 120;

    const months     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const salesData  = [28,35,31,45,52,48,61,70,65,82,91,105];
    const ppcData    = [12,16,14,22,28,25,34,40,38,50,58,68];

    let animPct = 0;
    let animFrame;

    function drawChart(pct) {
        ctx.clearRect(0, 0, w, 120);

        const padL = 10, padR = 10, padT = 10, padB = 28;
        const chartW = w - padL - padR;
        const chartH = 120 - padT - padB;

        const maxVal = 115;
        const points = Math.round((salesData.length - 1) * pct);

        function toX(i) { return padL + (i / (salesData.length - 1)) * chartW; }
        function toY(v) { return padT + chartH - (v / maxVal) * chartH; }

        // Grid lines
        for (let i = 0; i <= 3; i++) {
            const y = padT + (i / 3) * chartH;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + chartW, y);
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        function drawLine(data, color, glowColor) {
            if (points < 1) return;
            
            const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
            grad.addColorStop(0, glowColor.replace('1)', '0.2)'));
            grad.addColorStop(1, glowColor.replace('1)', '0)'));

            ctx.beginPath();
            ctx.moveTo(toX(0), toY(data[0]));
            for (let i = 1; i <= points; i++) {
                const x0 = toX(i - 1), y0 = toY(data[i - 1]);
                const x1 = toX(i),     y1 = toY(data[i]);
                const cpx = (x0 + x1) / 2;
                ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
            }

            const lastX = toX(Math.min(points, salesData.length - 1));
            const lastY = toY(data[Math.min(points, salesData.length - 1)]);
            ctx.lineTo(lastX, padT + chartH);
            ctx.lineTo(padL, padT + chartH);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(toX(0), toY(data[0]));
            for (let i = 1; i <= points; i++) {
                const x0 = toX(i - 1), y0 = toY(data[i - 1]);
                const x1 = toX(i),     y1 = toY(data[i]);
                const cpx = (x0 + x1) / 2;
                ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;

            if (points >= 1) {
                const lX = toX(points);
                const lY = toY(data[points]);
                ctx.beginPath();
                ctx.arc(lX, lY, 4.5, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        drawLine(salesData, '#4F8CFF', 'rgba(79,140,255,1)');
        drawLine(ppcData,   '#18D39E', 'rgba(24,211,158,1)');

        ctx.fillStyle = 'rgba(160,170,191,0.7)';
        ctx.font = '600 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        for (let i = 0; i < months.length; i += 2) {
            ctx.fillText(months[i].toUpperCase(), toX(i), 120 - 6);
        }
    }

    function animChart() {
        animPct += 0.03;
        if (animPct >= 1) { animPct = 1; drawChart(1); return; }
        drawChart(animPct);
        animFrame = requestAnimationFrame(animChart);
    }

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cancelAnimationFrame(animFrame);
                animPct = 0;
                animChart();
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    obs.observe(canvas);
}

// ─── SERVICES CATEGORY FILTERING & INQUIRY BINDING ────────────────────────────
function initServices() {
    const tabButtons = document.querySelectorAll('.svc-tab-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    if (tabButtons.length && serviceCards.length) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active tab state
                tabButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                // Filter cards with smooth presentation
                const visibleCards = [];
                serviceCards.forEach(card => {
                    const category = card.dataset.category;
                    const shouldShow = filter === 'all' || category === filter;
                    if (shouldShow) {
                        card.classList.remove('is-hidden');
                        visibleCards.push(card);
                    } else {
                        card.classList.add('is-hidden');
                    }
                });

                if (window.gsap && visibleCards.length) {
                    gsap.fromTo(visibleCards, 
                        { opacity: 0, y: 15, scale: 0.98 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.03, ease: 'power2.out', clearProps: 'all' }
                    );
                }
            });
        });
    }

    // Direct "Inquire Service" CTA click handling
    document.querySelectorAll('.service-learn-more[data-service]').forEach(link => {
        link.addEventListener('click', () => {
            const requestedService = link.dataset.service;
            if (window.selectInquiryService) {
                window.selectInquiryService(requestedService);
            }
            const challengeInput = document.getElementById('inq-challenge');
            if (challengeInput && (!challengeInput.value.trim() || challengeInput.value.startsWith('Inquiring about'))) {
                challengeInput.value = `Inquiring about ${requestedService} for our brand.`;
            }
        });
    });
}

// ─── FAQ ACCORDION ────────────────────────────────────────────────────────────
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn    = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            faqItems.forEach(i => {
                i.classList.remove('active');
                const b = i.querySelector('.faq-question');
                const a = i.querySelector('.faq-answer');
                if (b) b.setAttribute('aria-expanded', 'false');
                if (a) a.style.maxHeight = null;
            });
            
            if (!isOpen) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
}

// ─── MULTI-STEP CONTACT FORM WITH REAL-TIME VALIDATION ─────────────────────────
function initMultiStepForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    let currentStep = 1;
    const totalSteps = 4;
    
    // UI Elements
    const steps = [
        document.getElementById('formStep1'),
        document.getElementById('formStep2'),
        document.getElementById('formStep3'),
        document.getElementById('formStep4')
    ];
    const successStep = document.getElementById('formStepSuccess');
    
    const indicators = document.querySelectorAll('.inquiry-step-indicator');
    const lines = [
        document.getElementById('line-1-2'),
        document.getElementById('line-2-3'),
        document.getElementById('line-3-4')
    ];

    // Inputs & Error Elements
    const step1Error = document.getElementById('step1-error');
    const serviceGrid = document.getElementById('serviceSelectGrid');
    
    const brandInput = document.getElementById('inq-brand');
    const brandError = document.getElementById('error-inq-brand');
    const urlInput = document.getElementById('inq-url');
    const urlError = document.getElementById('error-inq-url');
    
    const challengeInput = document.getElementById('inq-challenge');
    const charCounter = document.getElementById('challenge-char-count');
    
    const nameInput = document.getElementById('inq-name');
    const nameError = document.getElementById('error-inq-name');
    const emailInput = document.getElementById('inq-email');
    const emailError = document.getElementById('error-inq-email');
    const phoneInput = document.getElementById('inq-phone');
    const phoneError = document.getElementById('error-inq-phone');
    const step4Error = document.getElementById('step4-error');
    const submitBtn = document.getElementById('form-submit-btn');

    // Track touched state for graceful error surfacing
    let brandTouched = false;
    let urlTouched = false;
    let nameTouched = false;
    let emailTouched = false;
    let phoneTouched = false;
    
    // Service Selection
    const serviceOptions = document.querySelectorAll('.service-select-option');
    let selectedServices = [];
    let selectedService = '';

    function updateSelectedServiceVar() {
        const activeOpts = document.querySelectorAll('.service-select-option.selected');
        selectedServices = Array.from(activeOpts).map(o => o.dataset.service || o.textContent.trim());
        selectedService = selectedServices.join(', ');
    }
    
    serviceOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            opt.classList.toggle('selected');
            updateSelectedServiceVar();
            if (selectedServices.length > 0 && step1Error) {
                step1Error.style.display = 'none';
            }
        });
    });

    // Helper for cross-navigation from Services cards
    window.selectInquiryService = function(serviceName) {
        if (!serviceName) return;
        const matchingOption = Array.from(serviceOptions).find(opt => {
            const optVal = (opt.dataset.service || opt.textContent || '').toLowerCase();
            const target = serviceName.toLowerCase();
            return optVal === target || optVal.includes(target) || target.includes(optVal);
        });

        if (matchingOption) {
            serviceOptions.forEach(o => o.classList.remove('selected'));
            matchingOption.classList.add('selected');
            updateSelectedServiceVar();
            if (step1Error) step1Error.style.display = 'none';
            currentStep = 1;
            updateUI();
        }
    };

    // ─── VALIDATION HELPERS ──────────────────────────────────────────────────
    function isValidEmail(email) {
        if (!email) return false;
        const trimmed = email.trim();
        const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        return re.test(trimmed) && trimmed.length <= 254;
    }

    function isValidUrl(val) {
        if (!val || !val.trim()) return true;
        const trimmed = val.trim();
        try {
            const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
            const parsed = new URL(candidate);
            return parsed.hostname && parsed.hostname.includes('.') && parsed.hostname.length >= 4;
        } catch (e) {
            return false;
        }
    }

    function isValidPhone(phone) {
        if (!phone || !phone.trim()) return true;
        const trimmed = phone.trim();
        const digitCount = (trimmed.match(/\d/g) || []).length;
        return digitCount >= 6 && /^[+]?[0-9\s\-().]{6,25}$/.test(trimmed);
    }

    function setFieldError(input, errorEl, message) {
        if (!input) return;
        const group = input.closest('.form-group');
        if (group) {
            group.classList.add('has-error');
            group.classList.remove('has-success');
            const icon = group.querySelector('.input-status-icon');
            if (icon) icon.innerHTML = '<i class="fas fa-circle-exclamation" aria-hidden="true"></i>';
        }
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) {
            errorEl.innerHTML = `<i class="fas fa-circle-exclamation" aria-hidden="true"></i> <span>${message}</span>`;
            errorEl.style.display = 'flex';
            input.setAttribute('aria-describedby', errorEl.id);
        }
    }

    function setFieldSuccess(input, errorEl) {
        if (!input) return;
        const group = input.closest('.form-group');
        if (group) {
            group.classList.remove('has-error');
            group.classList.add('has-success');
            const icon = group.querySelector('.input-status-icon');
            if (icon) icon.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i>';
        }
        input.removeAttribute('aria-invalid');
        if (errorEl) {
            errorEl.style.display = 'none';
            errorEl.innerHTML = '';
            input.removeAttribute('aria-describedby');
        }
    }

    function clearFieldStatus(input, errorEl) {
        if (!input) return;
        const group = input.closest('.form-group');
        if (group) {
            group.classList.remove('has-error', 'has-success');
            const icon = group.querySelector('.input-status-icon');
            if (icon) icon.innerHTML = '';
        }
        input.removeAttribute('aria-invalid');
        if (errorEl) {
            errorEl.style.display = 'none';
            errorEl.innerHTML = '';
            input.removeAttribute('aria-describedby');
        }
    }

    // Field-level validators
    function validateBrand(showError = true) {
        const val = brandInput ? brandInput.value.trim() : '';
        if (!val) {
            if (showError) setFieldError(brandInput, brandError, 'Brand or company name is required.');
            return false;
        }
        if (val.length < 2) {
            if (showError) setFieldError(brandInput, brandError, 'Brand name must be at least 2 characters.');
            return false;
        }
        setFieldSuccess(brandInput, brandError);
        return true;
    }

    function validateUrl(showError = true) {
        if (!urlInput) return true;
        const val = urlInput.value.trim();
        if (!val) {
            clearFieldStatus(urlInput, urlError);
            return true;
        }
        if (!isValidUrl(val)) {
            if (showError) setFieldError(urlInput, urlError, 'Please enter a valid website address (e.g. https://yourbrand.com).');
            return false;
        }
        setFieldSuccess(urlInput, urlError);
        return true;
    }

    function validateName(showError = true) {
        const val = nameInput ? nameInput.value.trim() : '';
        if (!val) {
            if (showError) setFieldError(nameInput, nameError, 'Full name is required.');
            return false;
        }
        if (val.length < 2) {
            if (showError) setFieldError(nameInput, nameError, 'Please enter your full name (at least 2 characters).');
            return false;
        }
        setFieldSuccess(nameInput, nameError);
        return true;
    }

    function validateEmailField(showError = true) {
        const val = emailInput ? emailInput.value.trim() : '';
        if (!val) {
            if (showError) setFieldError(emailInput, emailError, 'Work email address is required.');
            return false;
        }
        if (!isValidEmail(val)) {
            if (showError) setFieldError(emailInput, emailError, 'Please enter a valid work email (e.g. name@brand.com).');
            return false;
        }
        setFieldSuccess(emailInput, emailError);
        return true;
    }

    function validatePhone(showError = true) {
        if (!phoneInput) return true;
        const val = phoneInput.value.trim();
        if (!val) {
            clearFieldStatus(phoneInput, phoneError);
            return true;
        }
        if (!isValidPhone(val)) {
            if (showError) setFieldError(phoneInput, phoneError, 'Please enter a valid phone number (at least 6 digits).');
            return false;
        }
        setFieldSuccess(phoneInput, phoneError);
        return true;
    }

    // ─── REAL-TIME EVENT LISTENERS ───────────────────────────────────────────
    if (brandInput) {
        brandInput.addEventListener('input', () => {
            if (brandTouched || brandInput.value.trim().length >= 2) {
                validateBrand(true);
            }
        });
        brandInput.addEventListener('blur', () => {
            brandTouched = true;
            validateBrand(true);
        });
    }

    if (urlInput) {
        urlInput.addEventListener('input', () => {
            if (urlTouched || urlInput.value.trim().length > 0) {
                validateUrl(true);
            } else {
                clearFieldStatus(urlInput, urlError);
            }
        });
        urlInput.addEventListener('blur', () => {
            urlTouched = true;
            validateUrl(true);
        });
    }

    if (challengeInput && charCounter) {
        challengeInput.addEventListener('input', () => {
            const len = challengeInput.value.length;
            charCounter.textContent = `${len} character${len === 1 ? '' : 's'}`;
        });
    }

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            if (nameTouched || nameInput.value.trim().length >= 2) {
                validateName(true);
            }
        });
        nameInput.addEventListener('blur', () => {
            nameTouched = true;
            validateName(true);
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const val = emailInput.value.trim();
            if (emailTouched || val.includes('@')) {
                validateEmailField(true);
            }
            if (step4Error) step4Error.style.display = 'none';
        });
        emailInput.addEventListener('blur', () => {
            emailTouched = true;
            validateEmailField(true);
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            if (phoneTouched && phoneInput.value.trim()) {
                validatePhone(true);
            } else if (!phoneInput.value.trim()) {
                clearFieldStatus(phoneInput, phoneError);
            }
        });
        phoneInput.addEventListener('blur', () => {
            phoneTouched = true;
            validatePhone(true);
        });
    }
    
    // Navigation Functions
    function updateUI() {
        // Update form steps
        steps.forEach((step, index) => {
            if (step) {
                if (index + 1 === currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            }
        });
        
        // Update indicators
        indicators.forEach((ind, index) => {
            const stepNum = index + 1;
            ind.classList.remove('active', 'done');
            if (stepNum < currentStep) {
                ind.classList.add('done');
                ind.innerHTML = '<i class="fas fa-check"></i>';
            } else if (stepNum === currentStep) {
                ind.classList.add('active');
                ind.innerHTML = stepNum;
            } else {
                ind.innerHTML = stepNum;
            }
        });
        
        // Update lines
        lines.forEach((line, index) => {
            if (line) {
                if (index + 1 < currentStep) {
                    line.classList.add('filled');
                } else {
                    line.classList.remove('filled');
                }
            }
        });
    }
    
    function nextStep() {
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
        }
    }
    
    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    }
    
    // Bind Step 1 Navigation
    const btnNext1 = document.getElementById('step1Next');
    if (btnNext1) btnNext1.addEventListener('click', () => {
        if (!selectedService || selectedServices.length === 0) {
            if (step1Error) step1Error.style.display = 'flex';
            if (serviceGrid) {
                serviceGrid.classList.remove('shake-error');
                void serviceGrid.offsetWidth;
                serviceGrid.classList.add('shake-error');
            }
            return;
        }
        if (step1Error) step1Error.style.display = 'none';
        nextStep();
    });
    
    // Bind Step 2 Navigation
    const btnNext2 = document.getElementById('step2Next');
    if (btnNext2) btnNext2.addEventListener('click', () => {
        brandTouched = true;
        urlTouched = true;
        const isBrandValid = validateBrand(true);
        const isUrlValid = validateUrl(true);
        
        if (!isBrandValid || !isUrlValid) {
            const target = !isBrandValid ? brandInput : urlInput;
            if (target) {
                target.focus();
                const group = target.closest('.form-group');
                if (group) {
                    group.classList.remove('shake-error');
                    void group.offsetWidth;
                    group.classList.add('shake-error');
                }
            }
            return;
        }
        nextStep();
    });
    
    const btnBack2 = document.getElementById('step2Back');
    if (btnBack2) btnBack2.addEventListener('click', prevStep);
    
    // Bind Step 3 Navigation
    const btnNext3 = document.getElementById('step3Next');
    if (btnNext3) btnNext3.addEventListener('click', nextStep);
    
    const btnBack3 = document.getElementById('step3Back');
    if (btnBack3) btnBack3.addEventListener('click', prevStep);
    
    // Bind Step 4 Navigation
    const btnBack4 = document.getElementById('step4Back');
    if (btnBack4) btnBack4.addEventListener('click', prevStep);
    
    // Final Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        nameTouched = true;
        emailTouched = true;
        phoneTouched = true;

        const isNameValid = validateName(true);
        const isEmailValid = validateEmailField(true);
        const isPhoneValid = validatePhone(true);

        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            if (step4Error) step4Error.style.display = 'flex';
            const target = !isNameValid ? nameInput : (!isEmailValid ? emailInput : phoneInput);
            if (target) {
                target.focus();
                const group = target.closest('.form-group');
                if (group) {
                    group.classList.remove('shake-error');
                    void group.offsetWidth;
                    group.classList.add('shake-error');
                }
            }
            return;
        }

        if (step4Error) step4Error.style.display = 'none';
        
        // Collect all data
        const formData = {
            id: Date.now().toString(),
            service: selectedService,
            brand: document.getElementById('inq-brand')?.value || '',
            url: document.getElementById('inq-url')?.value || '',
            marketplaces: document.getElementById('inq-markets')?.value || '',
            revenue: document.getElementById('inq-revenue')?.value || '',
            category: document.getElementById('inq-category')?.value || '',
            challenge: document.getElementById('inq-challenge')?.value || '',
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: document.getElementById('inq-phone')?.value || '',
            contactMethod: document.getElementById('inq-contact-method')?.value || '',
            status: 'new',
            read: false,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage for Admin Panel
        const existingMessages = JSON.parse(localStorage.getItem('mam_messages')) || [];
        existingMessages.unshift({
            id: formData.id,
            name: formData.name,
            email: formData.email,
            subject: `New Inquiry: ${formData.brand} (${formData.service})`,
            message: `Brand: ${formData.brand}\nURL: ${formData.url}\nMarkets: ${formData.marketplaces}\nRevenue: ${formData.revenue}\n\nChallenge:\n${formData.challenge}`,
            status: formData.status,
            read: formData.read,
            timestamp: formData.timestamp,
            fullData: formData
        });
        localStorage.setItem('mam_messages', JSON.stringify(existingMessages));
        
        // Show success UI
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';
        }
        
        setTimeout(() => {
            steps.forEach(s => { if(s) s.style.display = 'none'; });
            const progress = document.getElementById('inquiryProgress');
            if (progress) progress.style.display = 'none';
            if (successStep) successStep.classList.add('active');
            
            // Also update total lead count in localStorage for dashboard
            const stats = JSON.parse(localStorage.getItem('mam_stats')) || { totalLeads: 0, activeClients: 0, revenue: 0 };
            stats.totalLeads += 1;
            localStorage.setItem('mam_stats', JSON.stringify(stats));
            
        }, 1200);
    });
}

// ─── TOOL BADGES HOVER ANIMATION ─────────────────────────────────────────────
function initToolBadges() {
    const badges = document.querySelectorAll('.tool-badge-inner');
    badges.forEach((badge, i) => {
        badge.style.animationDelay = (i * 0.1) + 's';
    });
}

// ─── MAGNETIC BUTTONS ─────────────────────────────────────────────────────────
function initMagneticButtons() {
    const btns = document.querySelectorAll('.btn-primary, .btn-nav-primary, .btn-founder, .resource-btn');
    btns.forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) * 0.2;
            const dy   = (e.clientY - cy) * 0.2;
            btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ─── WHATSAPP STICKY BUBBLE ───────────────────────────────────────────────────
function initWhatsApp() {
    const bubble = document.getElementById('whatsappBubble');
    const closeBtn = document.getElementById('whatsappBubbleClose');
    
    if (bubble && closeBtn) {
        // Show bubble after 5 seconds
        setTimeout(() => {
            bubble.classList.add('visible');
        }, 5000);
        
        closeBtn.addEventListener('click', () => {
            bubble.classList.remove('visible');
        });
    }
}

// ─── MOBILE STICKY CTA SHOW/HIDE ─────────────────────────────────────────────
function initStickyCtA() {
    const cta = document.getElementById('mobileStickyCtA');
    if (!cta) return;
    const hero = document.getElementById('home');
    if (!hero) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            cta.style.transform = entry.isIntersecting ? 'translateY(100%)' : 'translateY(0)';
            cta.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        });
    }, { threshold: 0.1 });

    cta.style.transform = 'translateY(100%)';
    obs.observe(hero);
}

// ─── CMS DATA INJECTION (FROM ADMIN PANEL) ────────────────────────────────────
function initCMSData() {
    // Hero Content
    const homeData = localStorage.getItem('mam_v2_home');
    if (homeData) {
        const home = JSON.parse(homeData);
        const title = document.getElementById('hero-heading');
        const sub = document.querySelector('.hero-sub');
        if (title && home.headline) title.innerHTML = home.headline;
        if (sub && home.subtitle) sub.innerText = home.subtitle;
    }

    // WhatsApp Settings
    const settingsData = localStorage.getItem('mam_v2_settings');
    if (settingsData) {
        const settings = JSON.parse(settingsData);
        const waBtn = document.getElementById('whatsappBtn');
        if (waBtn && settings.waNumber) {
            const msg = encodeURIComponent(settings.waMessage || 'Hello MAM SCALEVIO team!');
            waBtn.href = `https://wa.me/${settings.waNumber.replace(/[^0-9]/g, '')}?text=${msg}`;
        }
    }

    // Services
    const srvData = localStorage.getItem('mam_v2_services');
    if (srvData) {
        const services = JSON.parse(srvData);
        const grid = document.querySelector('.services-grid');
        if (grid && services.length > 0) {
            grid.innerHTML = services.map(s => `
                <div class="glass-card service-card fade-up">
                    <div class="service-card-glow"></div>
                    <div class="service-icon-wrap"><div class="service-icon"><i class="${s.icon}" aria-hidden="true"></i></div></div>
                    <h3>${s.title}</h3>
                    <p>${s.desc}</p>
                    <ul class="service-deliverables" role="list">
                        ${s.deliverables.map(d => `<li role="listitem"><i class="fas fa-check" aria-hidden="true"></i> ${d}</li>`).join('')}
                    </ul>
                    <div class="service-cta"><a href="#contact" class="service-learn-more">Get Started <i class="fas fa-arrow-right" aria-hidden="true"></i></a></div>
                </div>
            `).join('');
            // Need to re-init tilt on new elements
            initTilt();
        }
    }

    // FAQs
    const faqData = localStorage.getItem('mam_v2_faqs');
    if (faqData) {
        const faqs = JSON.parse(faqData);
        const list = document.querySelector('.faq-list');
        if (list && faqs.length > 0) {
            list.innerHTML = faqs.map(f => `
                <div class="faq-item fade-up">
                    <button class="faq-question" aria-expanded="false">
                        ${f.q}
                        <i class="fas fa-plus faq-icon" aria-hidden="true"></i>
                    </button>
                    <div class="faq-answer">
                        <p>${f.a}</p>
                    </div>
                </div>
            `).join('');
            initFAQ();
        }
    }

    // Metrics
    const metricsData = localStorage.getItem('mam_v2_metrics');
    if (metricsData) {
        const m = JSON.parse(metricsData);
        const metricsUI = document.querySelectorAll('.trust-metric');
        if (metricsUI.length >= 2) {
            metricsUI[0].querySelector('.trust-val').innerText = m.m1v || '$10M+';
            metricsUI[0].querySelector('.trust-label').innerText = m.m1l || 'Revenue Managed';
            metricsUI[1].querySelector('.trust-val').innerText = m.m2v || '500+';
            metricsUI[1].querySelector('.trust-label').innerText = m.m2l || 'Listings Optimized';
        }
    }

    // Resources
    const resData = localStorage.getItem('mam_v2_resources');
    if (resData) {
        const r = JSON.parse(resData);
        const resourceTitle = document.querySelector('.resource-card:first-child h3');
        const resourceBtn = document.querySelector('.resource-card:first-child .resource-btn');
        if (resourceTitle && r.title) resourceTitle.innerText = r.title;
        if (resourceBtn && r.url) resourceBtn.href = r.url;
    }
}

// ─── ROI CALCULATOR ─────────────────────────────────────────────────────────
function initRoiCalculator() {
    const calcSection = document.getElementById('calculator');
    if (!calcSection) return;

    // Inputs & Sliders
    const spendInput = document.getElementById('calcSpendInput');
    const spendRange = document.getElementById('calcSpendRange');
    const spendCurr = document.getElementById('calcSpendCurr');
    const spendChips = document.querySelectorAll('.calc-chip[data-spend]');

    const revenueInput = document.getElementById('calcRevenueInput');
    const revenueRange = document.getElementById('calcRevenueRange');
    const revenueCurr = document.getElementById('calcRevenueCurr');
    const revenueChips = document.querySelectorAll('.calc-chip[data-revenue]');

    const acosInput = document.getElementById('calcAcosInput');
    const acosRange = document.getElementById('calcAcosRange');
    const acosChips = document.querySelectorAll('.calc-chip[data-acos]');

    const tierCards = document.querySelectorAll('.calc-tier-card');
    const currButtons = document.querySelectorAll('.btn-currency');

    // Outputs
    const monthlySavingsVal = document.getElementById('calcMonthlySavingsVal');
    const annualSavingsVal = document.getElementById('calcAnnualSavingsVal');
    const currentAcosDisp = document.getElementById('calcCurrentAcosDisp');
    const currentRoasDisp = document.getElementById('calcCurrentRoasDisp');
    const currentWasteDisp = document.getElementById('calcCurrentWasteDisp');
    const targetAcosDisp = document.getElementById('calcTargetAcosDisp');
    const targetRoasDisp = document.getElementById('calcTargetRoasDisp');
    const reinvestedSalesDisp = document.getElementById('calcReinvestedSalesDisp');
    const multipleBadge = document.getElementById('calcMultipleBadge');
    const reinvestedSubtext = document.getElementById('calcReinvestedSubtext');
    const insightText = document.getElementById('calcInsightText');
    const effProductiveBar = document.getElementById('effProductiveBar');
    const effWasteBar = document.getElementById('effWasteBar');
    const efficiencyBreakdownLabel = document.getElementById('efficiencyBreakdownLabel');
    const applyBtn = document.getElementById('calcApplyBtn');

    let currentCurrency = '$';
    let currentReduction = 0.32; // Benchmark: 32% ACoS reduction
    let animFrameId = null;

    function formatAmount(amount) {
        return currentCurrency + Math.round(amount).toLocaleString('en-US');
    }

    // GSAP staggered animation for comparison results
    function animateComparisonResults() {
        if (typeof gsap === 'undefined') return;

        const metrics = document.querySelectorAll('.calc-comparison-grid .comp-metric');
        if (!metrics.length) return;

        // Kill existing tweens on metrics to prevent visual collision during rapid slider drag
        gsap.killTweensOf(metrics);

        // Subtle stagger animation across comparison metrics
        gsap.fromTo(
            metrics,
            {
                opacity: 0.55,
                y: 4,
                scale: 0.985
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.32,
                stagger: 0.04,
                ease: 'power2.out',
                overwrite: 'auto'
            }
        );

        // Micro-pop for key dynamic values
        const highlightElements = document.querySelectorAll('#calcMonthlySavingsVal, #calcReinvestedSalesDisp, #calcMultipleBadge');
        if (highlightElements.length) {
            gsap.killTweensOf(highlightElements);
            gsap.fromTo(
                highlightElements,
                { scale: 0.97 },
                { scale: 1, duration: 0.28, ease: 'back.out(1.5)', overwrite: 'auto' }
            );
        }
    }

    function triggerSmoothTransition() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(() => {
            animateComparisonResults();
        });
    }

    function calculate(animate = false) {
        if (!spendInput || !acosInput) return;

        let spend = parseFloat(spendInput.value);
        if (isNaN(spend) || spend < 500) spend = 500;
        if (spend > 500000) spend = 500000;

        let revenue = parseFloat(revenueInput ? revenueInput.value : 60000);
        if (isNaN(revenue) || revenue < 2000) revenue = 2000;
        if (revenue > 2000000) revenue = 2000000;

        let acos = parseFloat(acosInput.value);
        if (isNaN(acos) || acos < 5) acos = 5;
        if (acos > 90) acos = 90;

        // Metrics math
        const targetAcos = Math.max(5, acos * (1 - currentReduction));
        const currentRoas = 100 / acos;
        const targetRoas = 100 / targetAcos;

        // Sales generated from current ad spend
        const currentSales = spend / (acos / 100);

        // Custom revenue multiple: ratio of Total Revenue to Ad-generated Sales
        // Represents total revenue leverage, brand scale, and organic halo multiplier
        const revenueMultiple = Math.max(1.0, revenue / Math.max(1, currentSales));

        // Required ad spend for the same sales volume at optimized ACoS
        const optimizedSpendForSameSales = currentSales * (targetAcos / 100);

        // Direct monthly ad spend savings
        const monthlySavings = Math.max(0, spend - optimizedSpendForSameSales);
        const annualSavings = monthlySavings * 12;

        // Potential ad sales if full current ad budget is reinvested at new efficiency
        const potentialScaledAdSales = spend / (targetAcos / 100);
        const directAdSalesUpside = Math.max(0, potentialScaledAdSales - currentSales);

        // Reinvested Sales Upside scaled by the custom revenue multiple
        const scaledTotalSalesUpside = directAdSalesUpside * revenueMultiple;
        const projectedTotalMonthlyRevenue = revenue + scaledTotalSalesUpside;

        // Budget efficiency breakdown
        const wastePct = Math.min(65, Math.max(18, Math.round((monthlySavings / spend) * 100)));
        const productivePct = 100 - wastePct;

        // Update DOM
        if (monthlySavingsVal) {
            monthlySavingsVal.textContent = formatAmount(monthlySavings);
        }
        if (annualSavingsVal) {
            annualSavingsVal.textContent = formatAmount(annualSavings) + ' / year';
        }
        if (currentAcosDisp) {
            currentAcosDisp.textContent = acos.toFixed(1) + '%';
        }
        if (currentRoasDisp) {
            currentRoasDisp.textContent = currentRoas.toFixed(2) + 'x';
        }
        if (currentWasteDisp) {
            currentWasteDisp.textContent = formatAmount(monthlySavings);
        }
        if (targetAcosDisp) {
            targetAcosDisp.textContent = targetAcos.toFixed(1) + '%';
        }
        if (targetRoasDisp) {
            targetRoasDisp.textContent = targetRoas.toFixed(2) + 'x';
        }
        if (reinvestedSalesDisp) {
            reinvestedSalesDisp.textContent = '+' + formatAmount(scaledTotalSalesUpside) + '/mo';
        }
        if (multipleBadge) {
            multipleBadge.textContent = `${revenueMultiple.toFixed(1)}x Growth Lever`;
        }
        if (reinvestedSubtext) {
            reinvestedSubtext.textContent = `Includes ${formatAmount(directAdSalesUpside)} direct PPC + organic halo`;
        }
        if (efficiencyBreakdownLabel) {
            efficiencyBreakdownLabel.textContent = `${productivePct}% Productive · ${wastePct}% Recoverable Waste`;
        }
        if (effProductiveBar) {
            effProductiveBar.style.width = productivePct + '%';
        }
        if (effWasteBar) {
            effWasteBar.style.width = wastePct + '%';
        }
        if (insightText) {
            insightText.innerHTML = `By lowering your ACoS from <strong>${acos.toFixed(1)}%</strong> to <strong>${targetAcos.toFixed(1)}%</strong> with your <strong>${revenueMultiple.toFixed(1)}x</strong> revenue growth multiple, you can either pocket <strong>${formatAmount(monthlySavings)}/mo</strong> in net savings or scale total store revenue to <strong>${formatAmount(projectedTotalMonthlyRevenue)}/mo</strong> (+${formatAmount(scaledTotalSalesUpside)}/mo upside) on the same ${formatAmount(spend)} budget.`;
        }

        if (animate) {
            triggerSmoothTransition();
        }
    }

    // Synchronize spend input and range
    if (spendRange && spendInput) {
        spendRange.addEventListener('input', () => {
            spendInput.value = spendRange.value;
            syncSpendChips(parseFloat(spendRange.value));
            calculate(true);
        });

        spendInput.addEventListener('input', () => {
            const val = parseFloat(spendInput.value) || 1000;
            spendRange.value = Math.min(150000, Math.max(1000, val));
            syncSpendChips(val);
            calculate(true);
        });
    }

    function syncSpendChips(val) {
        spendChips.forEach(chip => {
            chip.classList.toggle('active', parseFloat(chip.dataset.spend) === val);
        });
    }

    spendChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const val = parseFloat(chip.dataset.spend);
            if (spendInput) spendInput.value = val;
            if (spendRange) spendRange.value = Math.min(150000, val);
            syncSpendChips(val);
            calculate(true);
        });
    });

    // Synchronize revenue input and range
    if (revenueRange && revenueInput) {
        revenueRange.addEventListener('input', () => {
            revenueInput.value = revenueRange.value;
            syncRevenueChips(parseFloat(revenueRange.value));
            calculate(true);
        });

        revenueInput.addEventListener('input', () => {
            const val = parseFloat(revenueInput.value) || 5000;
            revenueRange.value = Math.min(350000, Math.max(5000, val));
            syncRevenueChips(val);
            calculate(true);
        });
    }

    function syncRevenueChips(val) {
        revenueChips.forEach(chip => {
            chip.classList.toggle('active', parseFloat(chip.dataset.revenue) === val);
        });
    }

    revenueChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const val = parseFloat(chip.dataset.revenue);
            if (revenueInput) revenueInput.value = val;
            if (revenueRange) revenueRange.value = Math.min(350000, val);
            syncRevenueChips(val);
            calculate(true);
        });
    });

    // Synchronize ACoS input and range
    if (acosRange && acosInput) {
        acosRange.addEventListener('input', () => {
            acosInput.value = acosRange.value;
            syncAcosChips(parseFloat(acosRange.value));
            calculate(true);
        });

        acosInput.addEventListener('input', () => {
            const val = parseFloat(acosInput.value) || 20;
            acosRange.value = Math.min(65, Math.max(15, val));
            syncAcosChips(val);
            calculate(true);
        });
    }

    function syncAcosChips(val) {
        acosChips.forEach(chip => {
            chip.classList.toggle('active', parseFloat(chip.dataset.acos) === val);
        });
    }

    acosChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const val = parseFloat(chip.dataset.acos);
            if (acosInput) acosInput.value = val;
            if (acosRange) acosRange.value = val;
            syncAcosChips(val);
            calculate(true);
        });
    });

    // Optimization Tiers
    tierCards.forEach(card => {
        card.addEventListener('click', () => {
            tierCards.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-checked', 'false');
            });
            card.classList.add('active');
            card.setAttribute('aria-checked', 'true');
            currentReduction = parseFloat(card.dataset.reduction) || 0.32;
            calculate(true);
        });
    });

    // Currency Switcher
    currButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            currentCurrency = btn.dataset.curr || '$';
            if (spendCurr) spendCurr.textContent = currentCurrency;
            if (revenueCurr) revenueCurr.textContent = currentCurrency;

            // Update preset labels
            spendChips.forEach(chip => {
                const sp = parseFloat(chip.dataset.spend);
                chip.textContent = currentCurrency + (sp / 1000) + 'K';
            });
            revenueChips.forEach(chip => {
                const rev = parseFloat(chip.dataset.revenue);
                chip.textContent = currentCurrency + (rev / 1000) + 'K';
            });

            calculate(true);
        });
    });

    // Apply Button -> Smooth scroll & Pre-fill contact form
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const spend = parseFloat(spendInput ? spendInput.value : 15000);
            const revenue = parseFloat(revenueInput ? revenueInput.value : 60000);
            const acos = parseFloat(acosInput ? acosInput.value : 34);
            const targetAcos = acos * (1 - currentReduction);
            const monthlySavings = spend * (1 - targetAcos / acos);
            const currentSales = spend / (acos / 100);
            const revenueMultiple = Math.max(1.0, revenue / Math.max(1, currentSales));
            const directAdSalesUpside = (spend / (targetAcos / 100)) - currentSales;
            const scaledTotalSalesUpside = directAdSalesUpside * revenueMultiple;

            // Pre-select PPC Management in Step 1
            const serviceOptions = document.querySelectorAll('.service-select-option');
            serviceOptions.forEach(opt => {
                if (opt.dataset.service === 'PPC Management') {
                    serviceOptions.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                }
            });

            // Pre-fill challenge description
            const challengeField = document.getElementById('inq-challenge');
            if (challengeField) {
                challengeField.value = `[ROI Calculator Projection]\nMonthly Amazon Ad Spend: ${formatAmount(spend)}\nTotal Monthly Revenue: ${formatAmount(revenue)}\nCurrent Average ACoS: ${acos.toFixed(1)}%\nProjected Target ACoS: ${targetAcos.toFixed(1)}%\nRevenue Growth Multiple: ${revenueMultiple.toFixed(1)}x\nEstimated Monthly Spend Savings: ${formatAmount(monthlySavings)}\nProjected Annual Spend Saved: ${formatAmount(monthlySavings * 12)}\nEstimated Scaled Sales Upside: +${formatAmount(scaledTotalSalesUpside)}/mo\n\nLooking for a comprehensive PPC audit and negative search term analysis to unlock these efficiencies.`;
            }

            // Scroll to contact form
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const headerOffset = 80;
                const elementPosition = contactSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Initial calculation run
    calculate(false);
}

// ─── HERO GROWTH PILLARS & COCKPIT BAR ───────────────────────────────────────
function initHeroPillars() {
    const tabs = document.querySelectorAll('.hero-pillar-tab');
    const cockpitItems = document.querySelectorAll('.cockpit-item');
    if (!tabs.length || !cockpitItems.length) return;

    let activeIndex = 0;
    let autoRotateTimer = null;

    function activatePillar(index) {
        tabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
        const targetPillar = tabs[index].getAttribute('data-pillar');
        cockpitItems.forEach(item => {
            if (item.getAttribute('data-pillar') === targetPillar) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        activeIndex = index;
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
            activatePillar(i);
            // Reset auto-rotation timer on user click
            if (autoRotateTimer) clearInterval(autoRotateTimer);
            startAutoRotate();
        });
    });

    function startAutoRotate() {
        autoRotateTimer = setInterval(() => {
            activeIndex = (activeIndex + 1) % tabs.length;
            activatePillar(activeIndex);
        }, 5500);
    }

    startAutoRotate();
}

// ─── 4B. VIDEO AD PREVIEW STUDIO ─────────────────────────────────────────────
function initVideoAdStudio() {
    const section = document.getElementById('video-preview');
    if (!section) return;

    // Hook Datasets
    const hooksData = {
        'problem-agitation': {
            title: 'Stop-The-Scroll: $4,200 Inventory Flaw',
            tag: 'Problem Agitation Hook',
            tagBg: 'rgba(255, 91, 91, 0.15)',
            tagColor: '#FF7B7B',
            thumbScore: '84.6%',
            desc: 'A pattern-interrupt visual designed specifically for Amazon & DTC brand buyers. Hits the viewer within 1.2 seconds with a glaring financial leakage alert that stops mindless feed scrolling in its tracks.',
            kpis: {
                ctr: '4.8%',
                watch: '9.4s',
                roas: '+180%',
                cac: '-38%'
            },
            brand: 'Scalevio FeeGuard',
            avatar: 'F',
            views: '342K views',
            likes: '48.2K',
            comments: '1,290',
            shares: '8,920',
            ecom: {
                title: 'Scalevio Fee Guard Enterprise',
                stars: '4.9 ★★★★★',
                reviews: '(1,842)',
                price: '$149/mo',
                prime: 'Instant Setup',
                icon: 'fa-solid fa-shield-halved'
            },
            captions: [
                { word: 'Stop', highlight: true },
                { word: 'scrolling!' },
                { word: 'Are' },
                { word: 'you' },
                { word: 'losing' },
                { word: '$4,200/mo', highlight: true },
                { word: 'to' },
                { word: 'hidden' },
                { word: 'Amazon' },
                { word: 'fee' },
                { word: 'glitches?' },
                { word: "Here's" },
                { word: 'the' },
                { word: 'automated' },
                { word: 'audit', highlight: true }
            ],
            phases: {
                p1: {
                    time: '0:00 - 0:03',
                    role: 'Pattern Interrupt',
                    text: 'High-contrast pulsating warning beacon flashing a <strong>94% defect rate alert</strong>. Immediate neuro-visceral stop trigger.',
                    visual: 'Flashing red hazard ring, tactile glitch vibration effect, bold contrast metrics.'
                },
                p2: {
                    time: '0:03 - 0:10',
                    role: 'Mechanism Proof',
                    text: 'Direct screen capture showing <strong>$4,200 auto-reimbursed directly into Seller Central balance</strong> in under 48 hours.',
                    visual: 'Side-by-side verification ticker with real automated claim approvals.'
                },
                p3: {
                    time: '0:10 - 0:15',
                    role: 'Native Amazon CTA',
                    text: 'One-tap direct audit scan CTA with <strong>zero upfront fee guarantee</strong>.',
                    visual: 'Swipe-up product card with verified Amazon partner security badge.'
                }
            },
            renderScene: function() {
                return `
                    <div class="stage-scene scene-problem">
                        <div class="scene-ambient-alert"></div>
                        <div class="scene-problem-card">
                            <div class="alert-icon-ring">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div class="alert-headline">CRITICAL LEAKAGE DETECTED</div>
                            <div class="alert-stat-box">
                                <span class="alert-stat-num">$4,200</span>
                                <span class="alert-stat-sub">Hidden FBA Overcharge Glitch per 10K Orders</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        },
        'tiktok-ugc': {
            title: "TikTok UGC: 'I Tested 5 Brands So You Don't Have To'",
            tag: 'Social Proof Comparison',
            tagBg: 'rgba(24, 211, 158, 0.15)',
            tagColor: '#18D39E',
            thumbScore: '89.2%',
            desc: 'High-trust, creator-led TikTok native vertical format. Uses authentic first-person framing and extreme contrast to eliminate buyer hesitation before they can swipe away.',
            kpis: {
                ctr: '5.6%',
                watch: '11.2s',
                roas: '+240%',
                cac: '-46%'
            },
            brand: 'Maya @ eCommerceDaily',
            avatar: 'M',
            views: '612K views',
            likes: '112.5K',
            comments: '3,840',
            shares: '14.6K',
            ecom: {
                title: 'UltraShield Pro Ergonomic Grip',
                stars: '4.8 ★★★★★',
                reviews: '(3,410)',
                price: '$34.99',
                prime: 'FREE 1-Day',
                icon: 'fa-solid fa-mobile-screen-button'
            },
            captions: [
                { word: 'I' },
                { word: 'literally' },
                { word: 'tested', highlight: true },
                { word: '5' },
                { word: 'top' },
                { word: 'Amazon' },
                { word: 'brands...' },
                { word: 'Only' },
                { word: 'ONE', highlight: true },
                { word: 'passed' },
                { word: 'the' },
                { word: 'drop' },
                { word: 'test!' }
            ],
            phases: {
                p1: {
                    time: '0:00 - 0:03',
                    role: 'Candid Self-Test Hook',
                    text: 'Fast-paced creator selfie camera shot introducing <strong>skeptical review of Amazon top sellers</strong>.',
                    visual: 'Split-screen side-by-side dividing line with authentic ambient studio lighting.'
                },
                p2: {
                    time: '0:03 - 0:10',
                    role: 'Unbiased Drop Test',
                    text: 'Live 10-foot marble floor drop test proving competitors crack instantly while <strong>Scalevio client design survives untouched</strong>.',
                    visual: 'Slow-motion impact replay, floating TikTok comment overlays with genuine questions.'
                },
                p3: {
                    time: '0:10 - 0:15',
                    role: 'Creator Discount CTA',
                    text: 'Creator points downward to the in-app <strong>Amazon Prime 1-Day delivery button</strong>.',
                    visual: 'Pulsing yellow shop sticker with 20% off clip-coupon reminder.'
                }
            },
            renderScene: function() {
                return `
                    <div class="stage-scene scene-ugc">
                        <div class="ugc-live-comment">
                            <div class="ugc-user-avatar">J</div>
                            <div class="ugc-comment-text"><strong>@jordan_k:</strong> Does it actually survive a drop? 👀</div>
                        </div>
                        <div class="scene-ugc-split">
                            <div class="split-side bad">
                                <span class="split-badge bad-tag">Competitor A</span>
                                <div class="split-prod-icon"><i class="fa-solid fa-heart-crack"></i></div>
                                <div class="split-metric-line" style="color:#FF7B7B;">Snapped at 4 ft</div>
                            </div>
                            <div class="split-side good">
                                <span class="split-badge good-tag">Scalevio Client</span>
                                <div class="split-prod-icon"><i class="fa-solid fa-shield-halved"></i></div>
                                <div class="split-metric-line" style="color:#18D39E;">Flawless at 12 ft</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        },
        'exploded-view': {
            title: '3D Anatomy: Aerospace Engineering Inside Everyday Tech',
            tag: 'Visual Authority Hook',
            tagBg: 'rgba(79, 140, 255, 0.15)',
            tagColor: '#4F8CFF',
            thumbScore: '81.4%',
            desc: 'High-end CGI exploded breakdown framing physical products with luxury engineering authority. Disarms price resistance by demonstrating internal patent-pending technology.',
            kpis: {
                ctr: '4.2%',
                watch: '8.8s',
                roas: '+160%',
                cac: '-32%'
            },
            brand: 'AeroCore Labs',
            avatar: 'A',
            views: '280K views',
            likes: '32.1K',
            comments: '840',
            shares: '6,210',
            ecom: {
                title: 'AeroCore Titanium Edition',
                stars: '5.0 ★★★★★',
                reviews: '(980)',
                price: '$89.00',
                prime: 'FREE 1-Day',
                icon: 'fa-solid fa-cube'
            },
            captions: [
                { word: 'What' },
                { word: 'actually' },
                { word: 'happens', highlight: true },
                { word: 'inside' },
                { word: 'your' },
                { word: 'bottle?' },
                { word: "Let's" },
                { word: 'peel' },
                { word: 'it' },
                { word: 'apart', highlight: true },
                { word: 'layer' },
                { word: 'by' },
                { word: 'layer.' }
            ],
            phases: {
                p1: {
                    time: '0:00 - 0:03',
                    role: 'Isometric CAD Reveal',
                    text: 'Dramatic 3D disassembly showcasing <strong>triple-vacuum aerospace insulation</strong> in floating isometric perspective.',
                    visual: 'Separating matte titanium layers with floating digital measurement lines.'
                },
                p2: {
                    time: '0:03 - 0:10',
                    role: 'Thermal Chamber Proof',
                    text: 'Infrared heat map showing <strong>sub-zero ice retention for 48 continuous hours</strong> in extreme desert simulation.',
                    visual: 'Interactive floating callout chips pointing to copper thermal barrier.'
                },
                p3: {
                    time: '0:10 - 0:15',
                    role: 'Premium Unbox CTA',
                    text: 'Layers snap back together seamlessly into luxury gift packaging with <strong>Lifetime Warranty certificate</strong>.',
                    visual: 'One-click Prime Add-to-Cart card with bundled magnetic lid.'
                }
            },
            renderScene: function() {
                return `
                    <div class="stage-scene scene-exploded">
                        <div class="scene-3d-wrap">
                            <span class="pointer-chip chip-left"><i class="fa-solid fa-microchip"></i> Quad-Damper Core</span>
                            <span class="pointer-chip chip-right"><i class="fa-solid fa-shield"></i> Grade-5 Titanium</span>
                            <div class="exploded-core-model">
                                <div class="layer-plate top">AEROSPACE SEAL</div>
                                <div class="layer-plate mid">VACUUM CHAMBER</div>
                                <div class="layer-plate bot">TITANIUM SHELL</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        },
        'asmr-satisfaction': {
            title: 'Sensory ASMR: The Satisfying Click That Sold 80K Units',
            tag: 'Sensory Dopamine Hook',
            tagBg: 'rgba(248, 184, 78, 0.15)',
            tagColor: '#F8B84E',
            thumbScore: '91.8%',
            desc: 'Binaural sensory engineering that triggers instant auditory satisfaction. By maximizing macro textures and tactile sound design, it creates visceral product craving.',
            kpis: {
                ctr: '6.1%',
                watch: '12.8s',
                roas: '+310%',
                cac: '-52%'
            },
            brand: 'MagLock Studio',
            avatar: 'M',
            views: '840K views',
            likes: '185.2K',
            comments: '5,190',
            shares: '28.4K',
            ecom: {
                title: 'MagLock Precision Dock',
                stars: '4.9 ★★★★★',
                reviews: '(5,120)',
                price: '$68.00',
                prime: 'FREE 1-Day',
                icon: 'fa-solid fa-volume-high'
            },
            captions: [
                { word: 'Turn' },
                { word: 'your' },
                { word: 'volume', highlight: true },
                { word: 'UP.' },
                { word: 'Hear' },
                { word: 'that' },
                { word: 'magnetic', highlight: true },
                { word: 'snap?' },
                { word: "That's" },
                { word: 'pure' },
                { word: 'anodized' },
                { word: 'precision.' }
            ],
            phases: {
                p1: {
                    time: '0:00 - 0:03',
                    role: 'Macro Audio Trigger',
                    text: 'Close-up slow-motion magnetic coupling producing a <strong>crisp, satisfying tactile click sound</strong>.',
                    visual: 'Audio ripple wave rings expanding across deep obsidian background.'
                },
                p2: {
                    time: '0:03 - 0:10',
                    role: 'Sensory Immersion',
                    text: 'Matte aluminum bevel sweeps past cinematic lighting flare highlighting <strong>zero-gap CNC machining</strong>.',
                    visual: 'Golden reflection beam traveling along 45-degree chamfered edge.'
                },
                p3: {
                    time: '0:10 - 0:15',
                    role: 'Limited Batch CTA',
                    text: 'Direct purchase overlay indicating <strong>next batch shipping in 24 hours via Amazon Prime</strong>.',
                    visual: 'Limited inventory stock counter with Prime 1-day checkout.'
                }
            },
            renderScene: function() {
                return `
                    <div class="stage-scene scene-asmr">
                        <div class="scene-asmr-wrap">
                            <div class="asmr-ripple-ring"></div>
                            <div class="asmr-ripple-ring"></div>
                            <div class="asmr-ripple-ring"></div>
                            <div class="asmr-hero-box">
                                <i class="fa-solid fa-magnet"></i>
                                <span class="asmr-sound-label">*MAGNETIC CLICK*</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        },
        'extreme-stress': {
            title: 'Extreme Stress Test: 1,000 PSI Hydraulic Press vs Titanium Core',
            tag: 'High Stakes Hook',
            tagBg: 'rgba(124, 106, 255, 0.15)',
            tagColor: '#7C6AFF',
            thumbScore: '93.4%',
            desc: 'High-stakes viral engineering: puts the product under extreme, real-world physical punishment. Generates immense curiosity and undeniable proof of quality.',
            kpis: {
                ctr: '6.8%',
                watch: '13.5s',
                roas: '+350%',
                cac: '-58%'
            },
            brand: 'TitanForge Labs',
            avatar: 'T',
            views: '1.2M views',
            likes: '240.8K',
            comments: '7,830',
            shares: '41.9K',
            ecom: {
                title: 'TitanForge Armor Box',
                stars: '4.9 ★★★★★',
                reviews: '(4,210)',
                price: '$44.95',
                prime: 'FREE 1-Day',
                icon: 'fa-solid fa-shield-virus'
            },
            captions: [
                { word: 'Can' },
                { word: 'a' },
                { word: '$45', highlight: true },
                { word: 'case' },
                { word: 'survive' },
                { word: 'a' },
                { word: '1,000', highlight: true },
                { word: 'PSI' },
                { word: 'hydraulic' },
                { word: 'press?' },
                { word: 'Watch' },
                { word: 'this.' }
            ],
            phases: {
                p1: {
                    time: '0:00 - 0:03',
                    role: 'High Tension Countdown',
                    text: 'Industrial hydraulic press cylinder descending slowly towards product. <strong>Tension clock ticking at 240 FPS</strong>.',
                    visual: 'Hydraulic piston pounding down with dynamic shockwave particles.'
                },
                p2: {
                    time: '0:03 - 0:10',
                    role: 'Peak Impact & Survival',
                    text: 'Pressure gauge spikes to 1,000 PSI. Press lifts to show <strong>product intact without single hairline fracture</strong>.',
                    visual: 'High-speed sparks, fluorescent pressure gauge needle, green certified checkmark.'
                },
                p3: {
                    time: '0:10 - 0:15',
                    role: 'Indestructible Guarantee CTA',
                    text: 'Unconditional <strong>10-year replacement warranty CTA</strong> with direct Amazon Buy Now button.',
                    visual: 'Glowing green verified badge and Amazon Prime checkout card.'
                }
            },
            renderScene: function() {
                return `
                    <div class="stage-scene scene-stress">
                        <div class="scene-stress-wrap">
                            <div class="hydraulic-ram"></div>
                            <div class="stress-target-item">
                                <i class="fa-solid fa-cube"></i>
                            </div>
                            <div class="stress-cert-stamp">SURVIVED 1,000 PSI</div>
                        </div>
                    </div>
                `;
            }
        }
    };

    // DOM Elements
    const hookTabs = document.querySelectorAll('.hook-tab-btn');
    const ratioBtns = document.querySelectorAll('.ratio-btn');
    const deviceFrame = document.getElementById('videoDeviceFrame');
    const videoStage = document.getElementById('videoStage');
    const brandName = document.getElementById('vBrandName');
    const brandAvatar = document.getElementById('vBrandAvatar');
    const viewsCount = document.getElementById('vViewsCount');
    const captionsBox = document.getElementById('videoCaptionsBox');
    const ecomThumb = document.getElementById('vEcomThumb');
    const ecomTitle = document.getElementById('vEcomTitle');
    const ecomPrice = document.getElementById('vEcomPrice');
    const ecomStars = document.getElementById('vEcomStars');
    const ecomReviews = document.getElementById('vEcomReviews');
    const likesCount = document.getElementById('vLikesCount');
    const commentsCount = document.getElementById('vCommentsCount');
    const sharesCount = document.getElementById('vSharesCount');
    const likeBtn = document.getElementById('vLikeBtn');

    // Blueprint DOM Elements (supporting both ID conventions)
    const bpTitle = document.getElementById('bpHookTitle') || document.getElementById('bpTitle');
    const bpTag = document.getElementById('bpCategoryTag') || document.getElementById('bpTag');
    const bpScore = document.getElementById('bpScoreNum') || document.getElementById('bpScore');
    const bpDesc = document.getElementById('bpHookDesc') || document.getElementById('bpDesc');

    const bpPhase1Role = document.getElementById('phase1Role') || document.getElementById('bpPhase1Role');
    const bpPhase1Text = document.getElementById('phase1Script') || document.getElementById('bpPhase1Text');
    const bpPhase1Visual = document.getElementById('phase1Visual') || document.getElementById('bpPhase1Visual');

    const bpPhase2Role = document.getElementById('phase2Role') || document.getElementById('bpPhase2Role');
    const bpPhase2Text = document.getElementById('phase2Script') || document.getElementById('bpPhase2Text');
    const bpPhase2Visual = document.getElementById('phase2Visual') || document.getElementById('bpPhase2Visual');

    const bpPhase3Role = document.getElementById('phase3Role') || document.getElementById('bpPhase3Role');
    const bpPhase3Text = document.getElementById('phase3Script') || document.getElementById('bpPhase3Text');
    const bpPhase3Visual = document.getElementById('phase3Visual') || document.getElementById('bpPhase3Visual');

    const scriptPhases = document.querySelectorAll('.script-phase');

    // Playback Controls Elements
    const playBtn = document.getElementById('vPlayPauseBtn') || document.getElementById('videoPlayBtn');
    const replayBtn = document.getElementById('vReplayBtn') || document.getElementById('videoReplayBtn');
    const scrubberWrap = document.getElementById('vScrubberWrap') || document.getElementById('videoScrubber');
    const scrubberFill = document.getElementById('vScrubberFill');
    const scrubberThumb = document.getElementById('vScrubberThumb');
    const timeDisplay = document.getElementById('vTimeDisplay');
    const speedBtns = document.querySelectorAll('.speed-btn');
    const soundBtn = document.getElementById('vSoundToggle') || document.getElementById('videoSoundBtn');
    const audioWave = document.getElementById('videoAudioWave');
    const audioDisc = document.getElementById('socialAudioDisc');

    // Action CTAs & Download Buttons
    const btnDownloadHookScript = document.getElementById('btnDownloadHookScript');
    const btnDownloadScriptHeader = document.getElementById('btnDownloadScriptHeader');
    const downloadScriptBtn = document.getElementById('downloadScriptBtn');
    const btnInquireThisHook = document.getElementById('btnInquireThisHook');
    const btnCustomAuditHook = document.getElementById('btnCustomAuditHook');

    // State Variables
    let currentHookId = 'problem-agitation';
    let isPlaying = true;
    let playbackTime = 0; // in seconds, 0 to 15
    const totalDuration = 15;
    let playbackSpeed = 1;
    let isMuted = false;
    let playInterval = null;
    let isLiked = false;

    // Hook Alias Map (Ensures both short IDs like 'problem' and full IDs like 'problem-agitation' work)
    const hookKeyMap = {
        'problem': 'problem-agitation',
        'problem-agitation': 'problem-agitation',
        'ugc': 'tiktok-ugc',
        'tiktok-ugc': 'tiktok-ugc',
        '3d': 'exploded-view',
        'exploded-view': 'exploded-view',
        'asmr': 'asmr-satisfaction',
        'asmr-satisfaction': 'asmr-satisfaction',
        'stress': 'extreme-stress',
        'extreme-stress': 'extreme-stress'
    };

    // Load Hook Data
    function loadHook(hookId) {
        const canonicalKey = hookKeyMap[hookId] || hookId;
        const data = hooksData[canonicalKey] || hooksData[hookId] || hooksData['problem-agitation'];
        if (!data) return;

        currentHookId = canonicalKey;

        // Update active hook tab
        hookTabs.forEach(tab => {
            const tabKey = tab.getAttribute('data-hook');
            const isMatch = tabKey === hookId || tabKey === canonicalKey || hookKeyMap[tabKey] === canonicalKey;
            tab.classList.toggle('active', isMatch);
        });

        // Update stage scene
        if (videoStage) {
            videoStage.innerHTML = data.renderScene();
        }

        // Update top brand info
        if (brandName) brandName.textContent = data.brand;
        if (brandAvatar) brandAvatar.textContent = data.avatar;
        if (viewsCount) viewsCount.textContent = data.views;

        // Update social stats
        if (likesCount) likesCount.textContent = data.likes;
        if (commentsCount) commentsCount.textContent = data.comments;
        if (sharesCount) sharesCount.textContent = data.shares;
        if (likeBtn) {
            isLiked = false;
            const heartIcon = likeBtn.querySelector('i');
            if (heartIcon) {
                heartIcon.className = 'fa-regular fa-heart';
                heartIcon.style.color = '#fff';
            }
        }

        // Update e-com card
        if (ecomThumb) ecomThumb.innerHTML = `<i class="${data.ecom.icon}"></i>`;
        if (ecomTitle) ecomTitle.textContent = data.ecom.title;
        if (ecomPrice) ecomPrice.textContent = data.ecom.price;
        if (ecomStars) ecomStars.innerHTML = `<i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>`;
        if (ecomReviews) ecomReviews.textContent = data.ecom.reviews;

        // Update captions
        if (captionsBox) {
            const karaokeHtml = data.captions.map((c, i) => {
                const highlightClass = c.highlight ? 'highlight' : '';
                return `<span class="word ${highlightClass}" data-index="${i}">${c.word}</span>`;
            }).join(' ');
            captionsBox.innerHTML = `<div class="caption-karaoke">${karaokeHtml}</div>`;
        }

        // Update Blueprint card
        if (bpTitle) bpTitle.textContent = data.title;
        if (bpTag) {
            bpTag.textContent = data.tag;
            bpTag.style.background = data.tagBg || 'rgba(79, 140, 255, 0.15)';
            bpTag.style.color = data.tagColor || '#4F8CFF';
        }
        if (bpScore) bpScore.textContent = data.thumbScore;
        if (bpDesc) bpDesc.textContent = data.desc;

        // KPIs
        const elRetention = document.getElementById('bpMetricRetention');
        if (elRetention) elRetention.textContent = '+58% vs Avg';
        const elRoas = document.getElementById('bpMetricRoas');
        if (elRoas) elRoas.textContent = data.kpis ? data.kpis.roas : '+180%';
        const elWatch = document.getElementById('bpMetricWatch');
        if (elWatch) elWatch.textContent = data.kpis ? data.kpis.watch : '9.4s';
        const elFormat = document.getElementById('bpMetricFormat');
        if (elFormat) elFormat.textContent = '9:16 & 16:9';

        // Storyboard Phases
        if (bpPhase1Role) bpPhase1Role.textContent = data.phases.p1.role;
        if (bpPhase1Text) {
            bpPhase1Text.innerHTML = `<strong>Voiceover &amp; Screen:</strong> &ldquo;${data.phases.p1.text.replace(/<[^>]*>?/gm, '')}&rdquo;`;
        }
        if (bpPhase1Visual) {
            bpPhase1Visual.innerHTML = `<i class="fas fa-eye"></i> <em>Visual: ${data.phases.p1.visual}</em>`;
        }

        if (bpPhase2Role) bpPhase2Role.textContent = data.phases.p2.role;
        if (bpPhase2Text) {
            bpPhase2Text.innerHTML = `<strong>Voiceover &amp; Screen:</strong> &ldquo;${data.phases.p2.text.replace(/<[^>]*>?/gm, '')}&rdquo;`;
        }
        if (bpPhase2Visual) {
            bpPhase2Visual.innerHTML = `<i class="fas fa-eye"></i> <em>Visual: ${data.phases.p2.visual}</em>`;
        }

        if (bpPhase3Role) bpPhase3Role.textContent = data.phases.p3.role;
        if (bpPhase3Text) {
            bpPhase3Text.innerHTML = `<strong>Voiceover &amp; Screen:</strong> &ldquo;${data.phases.p3.text.replace(/<[^>]*>?/gm, '')}&rdquo;`;
        }
        if (bpPhase3Visual) {
            bpPhase3Visual.innerHTML = `<i class="fas fa-eye"></i> <em>Visual: ${data.phases.p3.visual}</em>`;
        }

        // Restart video timer
        restartPlayback();
    }

    // Playback Tick & Scrubber Update
    function updatePlaybackUI() {
        const percent = (playbackTime / totalDuration) * 100;
        if (scrubberFill) scrubberFill.style.width = `${percent}%`;
        if (scrubberThumb) scrubberThumb.style.left = `${percent}%`;

        // Time display
        const currentSec = Math.floor(playbackTime);
        const secStr = currentSec < 10 ? `0:0${currentSec}` : `0:${currentSec}`;
        if (timeDisplay) timeDisplay.textContent = `${secStr} / 0:15`;

        // Sync active phase in blueprint storyboard
        let activePhase = 1;
        if (playbackTime >= 10) {
            activePhase = 3;
        } else if (playbackTime >= 3) {
            activePhase = 2;
        }
        scriptPhases.forEach(sp => {
            const pNum = parseInt(sp.getAttribute('data-phase'), 10);
            sp.classList.toggle('active', pNum === activePhase);
        });

        // Sync karaoke captions
        const data = hooksData[currentHookId];
        if (data && captionsBox) {
            const words = captionsBox.querySelectorAll('.caption-karaoke .word');
            const totalWords = words.length;
            const wordsToShow = Math.floor((playbackTime / totalDuration) * totalWords);
            words.forEach((w, idx) => {
                if (idx <= wordsToShow) {
                    w.classList.add('active');
                } else {
                    w.classList.remove('active');
                }
            });
        }
    }

    function startPlaybackLoop() {
        if (playInterval) clearInterval(playInterval);
        playInterval = setInterval(() => {
            if (!isPlaying) return;
            playbackTime += 0.1 * playbackSpeed;
            if (playbackTime >= totalDuration) {
                playbackTime = 0; // loop
            }
            updatePlaybackUI();
        }, 100);
    }

    function togglePlay(state) {
        if (typeof state === 'boolean') {
            isPlaying = state;
        } else {
            isPlaying = !isPlaying;
        }
        if (playBtn) {
            playBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        }
        if (audioWave) {
            audioWave.style.opacity = isPlaying ? '1' : '0.2';
        }
        if (audioDisc) {
            audioDisc.style.animationPlayState = isPlaying ? 'running' : 'paused';
        }
    }

    function restartPlayback() {
        playbackTime = 0;
        togglePlay(true);
        updatePlaybackUI();
    }

    // Scrubber click/scrub
    if (scrubberWrap) {
        scrubberWrap.addEventListener('click', (e) => {
            const rect = scrubberWrap.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const fraction = Math.max(0, Math.min(1, clickX / rect.width));
            playbackTime = fraction * totalDuration;
            updatePlaybackUI();
        });
    }

    // Play & Replay buttons
    if (playBtn) {
        playBtn.addEventListener('click', () => togglePlay());
    }
    if (replayBtn) {
        replayBtn.addEventListener('click', () => restartPlayback());
    }

    // Speed toggles
    speedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            speedBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playbackSpeed = parseFloat(btn.getAttribute('data-speed')) || 1;
        });
    });

    // Sound toggle
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            soundBtn.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
            if (audioWave) audioWave.style.display = isMuted ? 'none' : 'flex';
        });
    }

    // Like button interaction
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            isLiked = !isLiked;
            const heartIcon = likeBtn.querySelector('i');
            if (isLiked) {
                heartIcon.className = 'fa-solid fa-heart';
                heartIcon.style.color = '#FF5B5B';
                heartIcon.style.transform = 'scale(1.3)';
                setTimeout(() => heartIcon.style.transform = 'scale(1)', 200);
            } else {
                heartIcon.className = 'fa-regular fa-heart';
                heartIcon.style.color = '#fff';
            }
        });
    }

    // Hook tab clicks
    hookTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const hookId = tab.getAttribute('data-hook');
            if (hookId && hookId !== currentHookId) {
                loadHook(hookId);
            }
        });
    });

    // Aspect ratio toggles
    ratioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const ratio = btn.getAttribute('data-ratio');
            ratioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (deviceFrame) {
                if (ratio === '16-9') {
                    deviceFrame.classList.add('aspect-16-9');
                } else {
                    deviceFrame.classList.remove('aspect-16-9');
                }
            }
        });
    });

    // Blueprint CTA buttons
    if (btnInquireThisHook) {
        btnInquireThisHook.addEventListener('click', () => {
            const hookData = hooksData[currentHookId] || hooksData['problem-agitation'];
            const challengeField = document.getElementById('inq-challenge');
            if (challengeField && hookData) {
                challengeField.value = `[Creative Video Ad Studio Request]\nSelected Hook Blueprint: ${hookData.title}\nCategory Tag: ${hookData.tag}\nTarget Thumbstop Rate: ${hookData.thumbScore}\nExpected ROAS Target: ${hookData.kpis ? hookData.kpis.roas : '+180%'}\n\nWe are looking to produce dynamic video creatives using this framework for our Amazon product line.`;
            }
            const serviceOptions = document.querySelectorAll('.service-select-option');
            serviceOptions.forEach(opt => {
                if (opt.dataset.service && opt.dataset.service.includes('Creative')) {
                    serviceOptions.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                }
            });
        });
    }

    if (btnCustomAuditHook) {
        btnCustomAuditHook.addEventListener('click', () => {
            const hookData = hooksData[currentHookId] || hooksData['problem-agitation'];
            const challengeField = document.getElementById('inq-challenge');
            if (challengeField && hookData) {
                challengeField.value = `[Creative Performance Audit Request]\nRequesting a diagnostic audit of our current video creatives against MAM Scalevio's ${hookData.title} framework.`;
            }
        });
    }

    // ─── PDF EXPORT ENGINE ────────────────────────────────────────────────────────
    function showPdfToast(title, msg) {
        let toast = document.getElementById('pdfToastNotification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pdfToastNotification';
            toast.className = 'pdf-toast-notification';
            toast.innerHTML = `
                <div class="pdf-toast-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="pdf-toast-content">
                    <span class="pdf-toast-title" id="pdfToastTitle">PDF Downloaded</span>
                    <span class="pdf-toast-sub" id="pdfToastSub">Hook breakdown saved successfully.</span>
                </div>
            `;
            document.body.appendChild(toast);
        }
        const titleEl = document.getElementById('pdfToastTitle');
        const subEl = document.getElementById('pdfToastSub');
        if (titleEl) titleEl.textContent = title;
        if (subEl) subEl.textContent = msg;

        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('show');
        }, 4500);
    }

    function exportHookScriptAsPDF(hookData, onComplete) {
        if (!hookData) return;

        // Check if jsPDF is loaded
        const hasJsPdf = typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF;

        if (hasJsPdf) {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = 210;
                const pageHeight = 297;
                const margin = 14;
                const contentWidth = pageWidth - (margin * 2); // 182mm

                // Colors
                const cNavy = [10, 17, 40];        // #0A1128
                const cGold = [255, 183, 3];       // #FFB703
                const cEmerald = [24, 211, 158];   // #18D39E
                const cCoral = [255, 91, 91];      // #FF5B5B
                const cCobalt = [79, 140, 255];    // #4F8CFF
                const cDarkText = [15, 23, 42];    // #0F172A
                const cSlate = [100, 116, 139];    // #64748B
                const cBgBox = [248, 250, 252];    // #F8FAFC
                const cBorder = [226, 232, 240];   // #E2E8F0

                // 1. TOP HEADER BANNER (Navy)
                doc.setFillColor(...cNavy);
                doc.rect(0, 0, pageWidth, 28, 'F');

                // Accent gold line
                doc.setFillColor(...cGold);
                doc.rect(0, 28, pageWidth, 1.2, 'F');

                // Brand Name & Dot
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(255, 255, 255);
                doc.text('MAM SCALEVIO', margin, 13);
                doc.setTextColor(...cGold);
                doc.text('.', margin + 50, 13);

                // Subtitles
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(148, 163, 184);
                doc.text('CREATIVE PRODUCTION LAB  |  HIGH-ROAS VIDEO AD BLUEPRINT & CONVERSION STORYBOARD', margin, 19);
                doc.text('E-COMMERCE & AMAZON FBA GROWTH ACCELERATOR  |  WWW.MAMSCALEVIO.COM', margin, 23);

                // Top Right Badge
                doc.setFillColor(18, 28, 60);
                doc.roundedRect(pageWidth - margin - 48, 7, 48, 14, 2, 2, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(...cGold);
                doc.text('OFFICIAL PRODUCTION SPEC', pageWidth - margin - 45, 12);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.5);
                doc.setTextColor(203, 213, 225);
                const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                doc.text(`DATE: ${todayStr}`, pageWidth - margin - 45, 16);

                let currentY = 36;

                // 2. HOOK TITLE & CLASSIFICATION
                // Tag pill
                doc.setFillColor(241, 245, 249);
                doc.setDrawColor(...cBorder);
                doc.roundedRect(margin, currentY, 60, 6.5, 3, 3, 'FD');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(...cCobalt);
                doc.text((hookData.tag || 'VIDEO HOOK FRAMEWORK').toUpperCase(), margin + 4, currentY + 4.5);

                // Doc ref
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(...cSlate);
                const docId = `MS-VID-${Math.abs((hookData.title || '').length * 137 + 542).toString().slice(0, 4)}`;
                doc.text(`DOC REF: ${docId}`, pageWidth - margin - 35, currentY + 4.5);

                currentY += 11;

                // Title
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13.5);
                doc.setTextColor(...cDarkText);
                const titleLines = doc.splitTextToSize(hookData.title, contentWidth - 45);
                doc.text(titleLines, margin, currentY);

                // Thumb-Stop Rate Box on right
                const scoreBoxX = pageWidth - margin - 38;
                doc.setFillColor(236, 253, 245);
                doc.setDrawColor(...cEmerald);
                doc.roundedRect(scoreBoxX, currentY - 5, 38, 16, 2, 2, 'FD');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(5, 150, 105);
                doc.text(hookData.thumbScore || '84.6%', scoreBoxX + 6, currentY + 3);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(5.8);
                doc.setTextColor(4, 120, 87);
                doc.text('THUMB-STOP RATE', scoreBoxX + 6, currentY + 8);

                currentY += (titleLines.length * 6) + 4;

                // Executive Strategy Description
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.2);
                doc.setTextColor(...cDarkText);
                const descLines = doc.splitTextToSize(hookData.desc, contentWidth);
                doc.text(descLines, margin, currentY);
                currentY += (descLines.length * 4.2) + 6;

                // 3. AUDITED PERFORMANCE MATRIX (KPI CARDS)
                const kpiItems = [
                    { label: 'THUMB-STOP RATE', val: hookData.thumbScore || '84.6%', note: 'Scroll-stop trigger' },
                    { label: '3-SEC RETENTION', val: '+58%', note: 'Vs Category Avg' },
                    { label: 'TARGET ROAS LIFT', val: hookData.kpis ? hookData.kpis.roas : '+180%', note: 'Paid social lift' },
                    { label: 'AVG WATCH TIME', val: hookData.kpis ? hookData.kpis.watch : '9.4s', note: 'Drop-off protection' },
                    { label: 'EST. CAC REDUCTION', val: hookData.kpis ? hookData.kpis.cac : '-38%', note: 'Customer acq cost' }
                ];

                const kpiCardWidth = (contentWidth - ((kpiItems.length - 1) * 3)) / kpiItems.length;
                kpiItems.forEach((kpi, idx) => {
                    const kX = margin + (idx * (kpiCardWidth + 3));
                    doc.setFillColor(...cBgBox);
                    doc.setDrawColor(...cBorder);
                    doc.roundedRect(kX, currentY, kpiCardWidth, 16, 2, 2, 'FD');

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9.5);
                    doc.setTextColor(...cNavy);
                    doc.text(kpi.val, kX + (kpiCardWidth / 2), currentY + 6, { align: 'center' });

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(5.2);
                    doc.setTextColor(...cSlate);
                    doc.text(kpi.label, kX + (kpiCardWidth / 2), currentY + 10.5, { align: 'center' });

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(5);
                    doc.setTextColor(148, 163, 184);
                    doc.text(kpi.note, kX + (kpiCardWidth / 2), currentY + 14, { align: 'center' });
                });

                currentY += 21;

                // 4. SECTION HEADER: 15-SECOND CONVERSION STORYBOARD
                doc.setFillColor(241, 245, 249);
                doc.rect(margin, currentY, contentWidth, 7, 'F');
                doc.setFillColor(...cCobalt);
                doc.rect(margin, currentY, 2.5, 7, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(...cNavy);
                doc.text('15-SECOND HIGH-CONVERSION STORYBOARD & SHOOTING SCRIPT', margin + 6, currentY + 5);

                currentY += 10;

                // 5. THREE SCRIPT PHASES
                const phases = [
                    {
                        num: '01',
                        badgeBg: cCoral,
                        time: hookData.phases?.p1?.time || '00:00 – 00:03',
                        role: hookData.phases?.p1?.role || 'The Pattern Interrupt Hook',
                        script: hookData.phases?.p1?.text?.replace(/<[^>]*>?/gm, '') || 'Stop buying ordinary products before checking this critical flaw...',
                        visual: hookData.phases?.p1?.visual || 'Urgent red ambient flash, animated warning alert, shock-reaction cut, and bold kinetic highlighted text. SFX sub-bass drop.'
                    },
                    {
                        num: '02',
                        badgeBg: cCobalt,
                        time: hookData.phases?.p2?.time || '00:04 – 00:10',
                        role: hookData.phases?.p2?.role || 'Mechanism of Action & Social Proof',
                        script: hookData.phases?.p2?.text?.replace(/<[^>]*>?/gm, '') || 'Here is what happens when you switch to our dual-patented bioavailability formula. Instant dissolution, zero fillers.',
                        visual: hookData.phases?.p2?.visual || 'Macro texture shot, lab-certified test split-screen, customer 5-star review callout popup.'
                    },
                    {
                        num: '03',
                        badgeBg: cEmerald,
                        time: hookData.phases?.p3?.time || '00:11 – 00:15',
                        role: hookData.phases?.p3?.role || 'Amazon Prime Urgency & High-Converting CTA',
                        script: hookData.phases?.p3?.text?.replace(/<[^>]*>?/gm, '') || 'Available with 1-Day Prime Delivery. Tap the link below before the 20% discount expires today.',
                        visual: hookData.phases?.p3?.visual || 'Amazon Prime badge pulse, discount code pill bounce, animated finger pointing directly at the Shop Now card.'
                    }
                ];

                phases.forEach((p) => {
                    const cardStartY = currentY;

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8.2);
                    const scriptLines = doc.splitTextToSize(`Voiceover / Copy: "${p.script}"`, contentWidth - 10);

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(7.5);
                    const visualLines = doc.splitTextToSize(`Visual & Sound Direction: ${p.visual}`, contentWidth - 10);

                    const cardH = 11 + (scriptLines.length * 4) + (visualLines.length * 3.6) + 4;

                    doc.setFillColor(252, 253, 255);
                    doc.setDrawColor(...cBorder);
                    doc.roundedRect(margin, cardStartY, contentWidth, cardH, 2, 2, 'FD');

                    // Badge Pill
                    doc.setFillColor(...p.badgeBg);
                    doc.roundedRect(margin + 4, cardStartY + 3, 17, 5, 1.5, 1.5, 'F');
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(6.5);
                    doc.setTextColor(255, 255, 255);
                    doc.text(`PHASE ${p.num}`, margin + 5.5, cardStartY + 6.7);

                    // Time
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(7.2);
                    doc.setTextColor(...cSlate);
                    doc.text(p.time, margin + 24, cardStartY + 6.7);

                    // Role
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(7.5);
                    doc.setTextColor(...cNavy);
                    doc.text(p.role, pageWidth - margin - 4, cardStartY + 6.7, { align: 'right' });

                    // Voiceover Script
                    let textY = cardStartY + 11.5;
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8);
                    doc.setTextColor(...cDarkText);
                    doc.text(scriptLines, margin + 4, textY);
                    textY += (scriptLines.length * 4) + 1.5;

                    // Visual Direction
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(7.3);
                    doc.setTextColor(71, 85, 105);
                    doc.text(visualLines, margin + 4, textY);

                    currentY += cardH + 3.5;
                });

                currentY += 1.5;

                // 6. CREATIVE PRODUCTION & SAFE ZONE DIRECTIVES
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(...cBorder);
                doc.roundedRect(margin, currentY, contentWidth, 19, 2, 2, 'FD');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.5);
                doc.setTextColor(...cNavy);
                doc.text('DIRECTOR GUIDELINES & SAFE-ZONE RULES:', margin + 4, currentY + 5);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.8);
                doc.setTextColor(...cSlate);
                doc.text('• Formats: 9:16 Vertical (1080x1920) for TikTok Spark & Reels | 16:9 Landscape (1920x1080) for Amazon Sponsored Brands Video.', margin + 4, currentY + 9.2);
                doc.text('• Safe Zones: Position subtitles 180px above screen bottom to prevent platform UI and profile buttons from obscuring copy.', margin + 4, currentY + 13);
                doc.text('• Pacing Velocity: Cut length strictly under 1.6s. High-energy audio transition on 00:00. Compressed vocal EQ for mobile speakers.', margin + 4, currentY + 16.8);

                currentY += 22.5;

                // 7. AGENCY EXECUTION & BOOKING CALLOUT
                doc.setFillColor(...cNavy);
                doc.roundedRect(margin, currentY, contentWidth, 21, 2, 2, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(...cGold);
                doc.text('WANT MAM SCALEVIO TO SCRIPT, SHOOT & 3D ANIMATE THIS AD FOR YOUR BRAND?', margin + 5, currentY + 6);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(226, 232, 240);
                doc.text('We produce high-ROAS creative video ads, manage end-to-end TikTok Spark/Meta campaigns, and scale Amazon FBA storefronts.', margin + 5, currentY + 10.5);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(...cGold);
                doc.text('Email: mamscalevio@hotmail.com   |   WhatsApp: +880 1890 595543   |   LinkedIn: company/mam-scalevio', margin + 5, currentY + 15.5);

                // 8. FOOTER
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.5);
                doc.setTextColor(148, 163, 184);
                doc.text('CONFIDENTIAL & PROPRIETARY — MAM SCALEVIO CREATIVE PRODUCTION LAB © 2026. ALL RIGHTS RESERVED.', margin, pageHeight - 6);
                doc.text('PAGE 1 OF 1  |  VERIFIED FOR AMAZON & TIKTOK AD STANDARDS', pageWidth - margin, pageHeight - 6, { align: 'right' });

                // Clean filename
                const cleanName = (hookData.title || 'Video_Hook_Script')
                    .replace(/[^a-zA-Z0-9]/g, '_')
                    .replace(/_+/g, '_')
                    .substring(0, 35);
                const fileName = `MAM_Scalevio_Video_Script_${cleanName}.pdf`;

                doc.save(fileName);
                if (typeof onComplete === 'function') onComplete(fileName);
                return;
            } catch (err) {
                console.error('jsPDF generation error, switching to formatted export', err);
            }
        }

        // Fallback: Formatted Printable / Exportable Window
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>MAM Scalevio Hook Script - ${hookData.title}</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0F172A; max-width: 800px; margin: auto; }
                        .header { background: #0A1128; color: #fff; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
                        .header h1 { margin: 0; color: #FFB703; font-size: 24px; }
                        .header p { margin: 6px 0 0; color: #94A3B8; font-size: 13px; }
                        .tag { display: inline-block; background: #EEF2FF; color: #4F8CFF; font-weight: 700; padding: 4px 10px; border-radius: 12px; font-size: 12px; margin-bottom: 8px; }
                        .score { float: right; font-size: 24px; font-weight: 900; color: #10B981; text-align: right; }
                        .phase { border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #F8FAFC; }
                        .phase-badge { background: #0A1128; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
                        .visual { color: #64748B; font-style: italic; font-size: 13px; margin-top: 6px; }
                        .footer { margin-top: 30px; padding: 16px; background: #F1F5F9; border-radius: 6px; font-size: 12px; color: #64748B; text-align: center; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>MAM SCALEVIO · Creative Production Lab</h1>
                        <p>High-ROAS Video Ad Blueprint & Shooting Script Specification</p>
                    </div>
                    <div class="tag">${hookData.tag}</div>
                    <div class="score">${hookData.thumbScore}<br><span style="font-size: 10px; color: #64748B;">THUMBSTOP RATE</span></div>
                    <h2>${hookData.title}</h2>
                    <p>${hookData.desc}</p>
                    <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;">
                    <h3>15-Second Storyboard</h3>
                    <div class="phase">
                        <span class="phase-badge">Phase 01 (${hookData.phases.p1.time})</span> <strong>${hookData.phases.p1.role}</strong>
                        <p><strong>Script:</strong> "${hookData.phases.p1.text.replace(/<[^>]*>?/gm, '')}"</p>
                        <div class="visual">Visual: ${hookData.phases.p1.visual}</div>
                    </div>
                    <div class="phase">
                        <span class="phase-badge">Phase 02 (${hookData.phases.p2.time})</span> <strong>${hookData.phases.p2.role}</strong>
                        <p><strong>Script:</strong> "${hookData.phases.p2.text.replace(/<[^>]*>?/gm, '')}"</p>
                        <div class="visual">Visual: ${hookData.phases.p2.visual}</div>
                    </div>
                    <div class="phase">
                        <span class="phase-badge">Phase 03 (${hookData.phases.p3.time})</span> <strong>${hookData.phases.p3.role}</strong>
                        <p><strong>Script:</strong> "${hookData.phases.p3.text.replace(/<[^>]*>?/gm, '')}"</p>
                        <div class="visual">Visual: ${hookData.phases.p3.visual}</div>
                    </div>
                    <div class="footer">
                        MAM SCALEVIO · Contact: mamscalevio@hotmail.com | WhatsApp: +880 1890 595543 | linkedin.com/company/mam-scalevio
                    </div>
                </body>
                </html>
            `);
            win.document.close();
            win.focus();
            setTimeout(() => {
                win.print();
            }, 400);
            if (typeof onComplete === 'function') onComplete(`MAM_Scalevio_Video_Script_${currentHookId}.pdf`);
        }
    }

    // Attach Download Event Handlers
    function handleDownloadClick(btn) {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const canonicalKey = hookKeyMap[currentHookId] || currentHookId;
            const hookData = hooksData[canonicalKey] || hooksData['problem-agitation'];
            if (!hookData) return;

            const originalHTML = btn.innerHTML;
            btn.classList.add('loading');
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Generating PDF...</span>`;
            btn.disabled = true;

            setTimeout(() => {
                exportHookScriptAsPDF(hookData, (fileName) => {
                    btn.classList.remove('loading');
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                    showPdfToast('Hook Script PDF Downloaded', `${fileName} exported successfully.`);
                });
            }, 200);
        });
    }

    handleDownloadClick(btnDownloadHookScript);
    handleDownloadClick(btnDownloadScriptHeader);
    handleDownloadClick(downloadScriptBtn);

    // Initialize initial hook & playback
    loadHook('problem-agitation');
    startPlaybackLoop();
}

// ─── INITIALIZE ALL ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCMSData();
    initServices();
    initHeroPillars();
    initVideoAdStudio();
    initScrollAnimations();
    initCounters();
    initRings();
    initFAQ();
    initMultiStepForm();
    initRoiCalculator();
    initToolBadges();
    initMagneticButtons();
    initWhatsApp();
    initStickyCtA();

    // Init Three.js after a short delay
    setTimeout(initHeroCanvas, 100);
    setTimeout(initRevenueChart, 200);
    setTimeout(initTilt, 300);

    // Animate hero elements on load
    const heroElements = document.querySelectorAll('.hero .fade-up');
    heroElements.forEach((el, i) => {
        el.style.transitionDelay = (i * 0.12) + 's';
        requestAnimationFrame(() => {
            setTimeout(() => el.classList.add('visible'), 50 + i * 120);
        });
    });
});

window.addEventListener('load', () => {
    initTilt();
});
