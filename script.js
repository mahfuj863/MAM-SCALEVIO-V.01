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

// ─── MULTI-STEP CONTACT FORM ──────────────────────────────────────────────────
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
    
    // Service Selection
    const serviceOptions = document.querySelectorAll('.service-select-option');
    let selectedService = '';
    
    serviceOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            serviceOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedService = opt.dataset.service;
        });
    });
    
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
    
    // Bind Buttons
    const btnNext1 = document.getElementById('step1Next');
    if (btnNext1) btnNext1.addEventListener('click', () => {
        if (!selectedService) {
            alert('Please select an area you need help with.');
            return;
        }
        nextStep();
    });
    
    const btnNext2 = document.getElementById('step2Next');
    if (btnNext2) btnNext2.addEventListener('click', () => {
        const brand = document.getElementById('inq-brand');
        if (!brand || !brand.value.trim()) {
            brand.style.borderColor = '#FF5B5B';
            return;
        }
        brand.style.borderColor = '';
        nextStep();
    });
    
    const btnBack2 = document.getElementById('step2Back');
    if (btnBack2) btnBack2.addEventListener('click', prevStep);
    
    const btnNext3 = document.getElementById('step3Next');
    if (btnNext3) btnNext3.addEventListener('click', nextStep);
    
    const btnBack3 = document.getElementById('step3Back');
    if (btnBack3) btnBack3.addEventListener('click', prevStep);
    
    const btnBack4 = document.getElementById('step4Back');
    if (btnBack4) btnBack4.addEventListener('click', prevStep);
    
    // Final Submit
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('inq-name');
        const email = document.getElementById('inq-email');
        const submitBtn = document.getElementById('form-submit-btn');
        
        let valid = true;
        
        if (!name || !name.value.trim()) {
            name.style.borderColor = '#FF5B5B';
            valid = false;
        } else {
            name.style.borderColor = '';
        }
        
        if (!email || !validateEmail(email.value)) {
            email.style.borderColor = '#FF5B5B';
            valid = false;
        } else {
            email.style.borderColor = '';
        }
        
        if (!valid) return;
        
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
            name: name.value,
            email: email.value,
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
            fullData: formData // Store all data structured for V2 panel
        });
        localStorage.setItem('mam_messages', JSON.stringify(existingMessages));
        
        // Show success UI
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
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

// ─── INITIALIZE ALL ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCMSData();
    initScrollAnimations();
    initCounters();
    initRings();
    initFAQ();
    initMultiStepForm();
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
