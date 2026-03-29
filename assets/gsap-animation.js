/* ═══════════════════════════════════════════════════════════
     TEXT ANIMATION CONTROLLER
     Matches your exact pattern:
       .text-animate    → scroll trigger wrapper
       .slide-in-text   → line-by-line 3D slide up
       .fade-in-text    → fade + y after slide-in completes
     
     Uses manual line splitting (no SplitText plugin needed).
     All initial states set via gsap.set (pure JS).
  ═══════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ── Manual line splitter (replaces SplitText plugin) ── */
function prepareText(element) {
    if (element.dataset.textStructured) return Promise.resolve();

    return document.fonts.ready.then(() => {
        const originalHTML = element.innerHTML;

        // Wrap each word in a span to measure line breaks
        element.innerHTML = originalHTML
            .replace(/(<[^>]+>)|([^\s<]+)/g, (match, tag, word) => {
                if (tag) return tag;
                return `<span class="_w" style="display:inline-block">${word}</span>`;
            });

        const words = [...element.querySelectorAll('._w')];
        const lines = [];
        let currentLine = [];
        let lastTop = null;

        words.forEach(word => {
            const top = word.getBoundingClientRect().top;
            if (lastTop === null || Math.abs(top - lastTop) > 4) {
                if (currentLine.length) lines.push(currentLine);
                currentLine = [word];
                lastTop = top;
            } else {
                currentLine.push(word);
            }
        });
        if (currentLine.length) lines.push(currentLine);

        // Rebuild as .lineParent > .lineChild structure
        element.innerHTML = '';
        lines.forEach(lineWords => {
            const lineParent = document.createElement('div');
            lineParent.className = 'lineParent';

            const lineChild = document.createElement('div');
            lineChild.className = 'lineChild';
            lineWords.forEach(w => {
                lineChild.appendChild(document.createTextNode(w.textContent + ' '));
            });

            lineParent.appendChild(lineChild);
            element.appendChild(lineParent);
        });

        element.dataset.textStructured = 'true';

        // Set initial state via gsap.set — pure JS
        gsap.set(element.querySelectorAll('.lineChild'), {
            opacity: 0,
            y: 50,
            rotationX: 55,
            transformOrigin: 'center bottom',
        });
    });
}

/* ── Slide-in animation (lines lift up) ── */
function animateSlideIn(section) {
    return new Promise(resolve => {
        const elements = section.querySelectorAll(
            '.slide-in-text p, .slide-in-text h1, .slide-in-text h2, .slide-in-text h3, .slide-in-text h4, .slide-in-text .label, .slide-in-text .animate-btn'
        );

        const tl = gsap.timeline({ onComplete: resolve });

        elements.forEach((el, i) => {
            const lines = el.querySelectorAll('.lineChild');
            if (!lines.length) return;

            tl.to(el, { opacity: 1, duration: 0.2 }, i * 0.15)
                .to(lines, {
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    stagger: 0.05,
                    ease: 'power2.out',
                }, i * 0.15 + 0.1);
        });
    });
}

/* ── Fade-in animation (runs after slide-in) ── */
function animateFadeIn(section) {
    return new Promise(resolve => {
        const elements = section.querySelectorAll('.fade-in-text');
        if (!elements.length) return resolve();

        gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.15,
            onComplete: resolve,
        });
    });
}

/* ── Handle one .text-animate section ── */
async function handleSection(section) {
    const elements = section.querySelectorAll(
        '.slide-in-text p, .slide-in-text h1, .slide-in-text h2, .slide-in-text h3, .slide-in-text h4, .slide-in-text .label, .slide-in-text .animate-btn'
    );

    await Promise.all([...elements].map(prepareText));

    ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        refreshPriority: -1,
        onEnter: async() => {
            await animateSlideIn(section);
            await animateFadeIn(section);
            section.classList.add('fade-end');
        },
    });
}

/* ── Init ── */
async function init() {
    const sections = document.querySelectorAll('.text-animate');

    for (const section of sections) {
        // Set fade-in-text initial state via gsap.set (pure JS)
        gsap.set(section.querySelectorAll('.fade-in-text'), {
            opacity: 0,
            y: 60,
        });

        // Set slide-in elements invisible before split
        section.querySelectorAll(
            '.slide-in-text p, .slide-in-text h1, .slide-in-text h2, .slide-in-text h3, .slide-in-text h4, .slide-in-text .label, .slide-in-text .animate-btn'
        ).forEach(el => gsap.set(el, { opacity: 0 }));

        await handleSection(section);
    }

    ScrollTrigger.refresh();
}

init();