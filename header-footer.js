(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var nav = header.querySelector('.dr-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  header.addEventListener('click', function (event) {
    if (!header.classList.contains('is-open')) return;
    if (event.target === toggle || toggle.contains(event.target)) return;
    if (nav.contains(event.target)) return;
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  var yearEl = document.querySelector('.dr-footer-copy-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
