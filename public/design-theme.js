/* Light/dark switch for this site's design (Soft and friendly). Added by KOOMPI Cloud; design_app replaces it. */
(function () {
  var key = 'd-theme';
  var initial = 'light';
  var root = document.documentElement;
  var theme = initial;
  try { var saved = localStorage.getItem(key); if (saved === 'light' || saved === 'dark') theme = saved; } catch (e) {}
  function apply() {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
  apply();
  // The buttons change only when pressed: changed as the page loaded, before React, they were a hydration warning.
  document.addEventListener('click', function (e) {
    var button = e.target && e.target.closest && e.target.closest('[data-theme-toggle], [data-k-theme-toggle]');
    if (!button) return;
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, theme); } catch (e2) {}
    apply();
    document.querySelectorAll('[data-theme-toggle], [data-k-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
  });
})();
