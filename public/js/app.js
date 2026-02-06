// Hide header on scroll down, show on scroll up
let lastScrollY = window.scrollY;
let ticking = false;
const header = document.querySelector('header');
let headerHidden = false;

function onScroll() {
  if (!header) return;
  if (window.scrollY > lastScrollY && window.scrollY > 60) {
    // Scrolling down
    if (!headerHidden) {
      header.style.transform = 'translateY(-100%)';
      header.style.transition = 'transform 0.3s';
      headerHidden = true;
    }
  } else {
    // Scrolling up
    if (headerHidden) {
      header.style.transform = '';
      headerHidden = false;
    }
  }
  lastScrollY = window.scrollY;
  ticking = false;
}

window.addEventListener('scroll', function() {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
});
(function () {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  nav.querySelectorAll('a[href]').forEach(function (a) {
    const href = a.getAttribute('href') || '/';
    const linkPath = href === '/' ? '/' : href.replace(/^\//, '');
    const current = path === '/' ? linkPath === '/' : path.startsWith('/' + linkPath) || path === '/' + linkPath;
    if (current) a.classList.add('active');
  });
})();
