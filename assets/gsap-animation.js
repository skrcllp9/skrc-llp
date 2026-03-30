/* ═══════════════════════════════════════════════════════════
     TEXT ANIMATION CONTROLLER — Fixed for iOS / race conditions
  ═══════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ── Reliable font + layout ready (fixes iOS Safari) ── */
function waitForReady() {
    return new Promise(resolve => {
        // Wait for fonts
        const fontReady = document.fonts ? document.fonts.ready : Promise.resolve();

        fontReady.then(() => {
            // Extra rAF pass: ensures layout is fully painted before we measure
            // (iOS Safari needs this — fonts.ready fires too early)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    resolve();
                });
            });
        });
    });
}

/* ── Manual line splitter ── */
function prepareText(element) {
    if (element.dataset.textStructured) return Promise.resolve();

    return waitForReady().then(() => {
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
            // Use offsetTop instead of getBoundingClientRect for stability during load
            const top = word.offsetTop;
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
            lineParent.style.overflow = 'hidden'; // Clip the 3D slide-up

            const lineChild = document.createElement('div');
            lineChild.className = 'lineChild';
            lineWords.forEach(w => {
                lineChild.appendChild(document.createTextNode(w.textContent + ' '));
            });

            lineParent.appendChild(lineChild);
            element.appendChild(lineParent);
        });

        element.dataset.textStructured = 'true';

        gsap.set(element.querySelectorAll('.lineChild'), {
            opacity: 0,
            y: 50,
            rotationX: 55,
            transformOrigin: 'center bottom',
        });
    });
}

/* ── Slide-in animation ── */
function animateSlideIn(section) {
    return new Promise(resolve => {
        const elements = section.querySelectorAll(
            '.slide-in-text p, .slide-in-text h1, .slide-in-text h2, .slide-in-text h3, .slide-in-text h4, .slide-in-text .label, .slide-in-text .animate-btn'
        );

        // Nothing to animate — resolve immediately so fade-in still runs
        if (!elements.length) return resolve();

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

/* ── Fade-in animation ── */
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

/* ── Fallback: make everything visible if something goes wrong ── */
function revealAll(section) {
    section.querySelectorAll('.lineChild, .fade-in-text').forEach(el => {
        gsap.set(el, { opacity: 1, y: 0, rotationX: 0 });
    });
    section.querySelectorAll(
        '.slide-in-text p, .slide-in-text h1, .slide-in-text h2, .slide-in-text h3, .slide-in-text h4, .slide-in-text .label, .slide-in-text .animate-btn'
    ).forEach(el => gsap.set(el, { opacity: 1 }));
}

/* ── Handle one .text-animate section ── */
async function handleSection(section) {
    const elements = section.querySelectorAll(
        '.slide-in-text p, .slide-in-text h1, .slide-in-text h2, .slide-in-text h3, .slide-in-text h4, .slide-in-text .label, .slide-in-text .animate-btn'
    );

    // Safety timeout: if prep takes too long, reveal content immediately
    const safetyTimer = setTimeout(() => revealAll(section), 3000);

    try {
        await Promise.all([...elements].map(prepareText));
    } catch (err) {
        console.warn('TextAnimate: prepareText failed, revealing as fallback', err);
        clearTimeout(safetyTimer);
        revealAll(section);
        return;
    }

    clearTimeout(safetyTimer);

    ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        refreshPriority: -1,
        onEnter: async () => {
            try {
                await animateSlideIn(section);
                await animateFadeIn(section);
                section.classList.add('fade-end');
            } catch (err) {
                console.warn('TextAnimate: animation failed, revealing as fallback', err);
                revealAll(section);
            }
        },
    });
}

/* ── Init ── */
async function init() {
    const sections = document.querySelectorAll('.text-animate');

    for (const section of sections) {
        gsap.set(section.querySelectorAll('.fade-in-text'), {
            opacity: 0,
            y: 60,
        });

        section.querySelectorAll(
            '.slide-in-text p, .slide-in-text h1, .slide-in-text h2, .slide-in-text h3, .slide-in-text h4, .slide-in-text .label, .slide-in-text .animate-btn'
        ).forEach(el => gsap.set(el, { opacity: 0 }));

        await handleSection(section);
    }

    ScrollTrigger.refresh();
}

// Guard: run after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}