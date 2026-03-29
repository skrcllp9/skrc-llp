// Initialize Lenis
const lenis = new Lenis({
    autoRaf: true,
});
window.lenis = lenis;
// Listen for the scroll event and log the event data
lenis.on('scroll', (e) => {
    console.log(e);
});
const header = document.querySelector('.site-header');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.menu-overlay');

// Scroll: blur → white
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
});

function openMenu() {
    mobileMenu.classList.add('open');
    header.classList.add('menu-open');
    overlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', true);

    // Stop Lenis
    if (window.lenis) window.lenis.stop();

    // Hard fallback — locks native scroll too
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    mobileMenu.classList.remove('open');
    header.classList.remove('menu-open');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', false);

    // Resume Lenis
    if (window.lenis) window.lenis.start();

    // Restore native scroll
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

overlay.addEventListener('click', closeMenu);

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
});



$(document).ready(function() {
    $(".our-client-slider").bxSlider({
        minSlides: 4,
        maxSlides: 4,
        slideWidth: 160,
        slideMargin: 30,
        ticker: true,
        speed: 55000
    });
});
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("year").textContent = new Date().getFullYear();
});

const form = document.getElementById("contact-form");

form.addEventListener("submit", async(e) => {
    e.preventDefault();

    const data = {
        name: form.name.value,
        email: form.email.value,
        phone: form["contact-number"].value,
        message: form.message.value,
    };

    const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (res.ok) {
        window.location.href = "/thankyou.html";
    } else {
        alert("Something went wrong. Please try again.");
    }
});