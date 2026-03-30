// Initialize Lenis
const lenis = new Lenis({
    autoRaf: true,
});
window.lenis = lenis;
// Listen for the scroll event and log the event data
lenis.on('scroll', (e) => {
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



document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("contact-number");
    
    if (input) {  // extra safety check
      input.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        if (this.value.length > 10) {
          this.value = this.value.slice(0, 10);
        }
      });
    }
  });

//   const resumeInput = document.getElementById('resume');
//   const uploadBox = document.getElementById('upload-box');
//   const uploadSuccess = document.getElementById('upload-success');
//   const fileNameDisplay = document.getElementById('file-name-display');
//   const removeBtn = document.getElementById('remove-file');

//   // When a file is selected
//   resumeInput.addEventListener('change', function () {
//     if (this.files && this.files.length > 0) {
//       fileNameDisplay.textContent = this.files[0].name;
//       uploadBox.style.display = 'none';
//       uploadSuccess.style.display = 'flex';
//     }
//   });

//   // When remove is clicked
//   removeBtn.addEventListener('click', function () {
//     resumeInput.value = '';               // clear the file
//     fileNameDisplay.textContent = '';
//     uploadSuccess.style.display = 'none';
//     uploadBox.style.display = 'flex';
//   });