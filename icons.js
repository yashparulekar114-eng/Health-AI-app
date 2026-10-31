/* Original line icons drawn for Kalji (no third-party assets). */
window.KaljiIcons = (function () {
  var P = {
    pill: '<rect x="2" y="8" width="20" height="8" rx="4" transform="rotate(-45 12 12)"/><line x1="9" y1="9" x2="15" y2="15"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="M12 8l-3 4 2.5 3-1.5 5M12 8l3 3 3 1M11.5 15l3 2 1 4"/>',
    drop: '<path d="M12 3c3.5 4.5 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 8.5 7.5 12 3z"/>',
    meal: '<path d="M4 12h16a8 6 0 0 1-16 0z"/><path d="M9 3.5c-1 1.5 1 2.5 0 4.5M13 3.5c-1 1.5 1 2.5 0 4.5"/>',
    plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>',
    alert: '<path d="M12 3l10 18H2z"/><line x1="12" y1="10" x2="12" y2="15"/><line x1="12" y1="18" x2="12" y2="18.1"/>',
    flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    check: '<polyline points="4 12 10 18 20 6"/>'
  };
  function svg(name, cls) { return '<svg class="' + (cls || 'svgi') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>'; }
  return { svg: svg };
})();
