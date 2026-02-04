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
