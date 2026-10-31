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

  // Full-colour illustrations (original drawings, 64x64) used on the quick-log tiles.
  var A = {
    pill: '<ellipse cx="32" cy="52" rx="20" ry="4" fill="#172B36" opacity=".08"/><g transform="rotate(-35 32 30)"><rect x="30" y="20" width="26" height="20" rx="10" fill="#fff" stroke="#087F8C" stroke-width="2.5"/><rect x="8" y="20" width="28" height="20" rx="10" fill="#087F8C"/><rect x="13" y="24" width="14" height="4" rx="2" fill="#fff" opacity=".35"/></g>',
    walk: '<ellipse cx="32" cy="54" rx="24" ry="3.5" fill="#172B36" opacity=".08"/><path d="M6 42c0-7 4-9 9-11l5-11 9 4c3 5 9 7 18 9 7 2 11 4 11 9v4H6z" fill="#087F8C"/><path d="M6 46h52v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="#DDF4EC" stroke="#087F8C" stroke-width="2.5"/><path d="M24 29l4 4M30 31l4 4M36 33l4 4" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M20 20l9 4" stroke="#DDF4EC" stroke-width="2.5" stroke-linecap="round"/>',
    drop: '<ellipse cx="32" cy="57" rx="16" ry="3" fill="#172B36" opacity=".08"/><path d="M15 9h34l-4 44a4 4 0 0 1-4 3.5H23a4 4 0 0 1-4-3.5z" fill="#DCEFFA" stroke="#087F8C" stroke-width="2.5" stroke-linejoin="round"/><path d="M17 27c5 4 9-3 15 0s10 3 15 0l-2.5 26a3 3 0 0 1-3 2.5H22.500a3 3 0 0 1-3-2.500z" fill="#6CC4D6"/><path d="M22 14l2 28" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>',
    meal: '<ellipse cx="30" cy="54" rx="26" ry="4" fill="#172B36" opacity=".08"/><ellipse cx="29" cy="46" rx="25" ry="9" fill="#fff" stroke="#B8C7C4" stroke-width="2"/><ellipse cx="20" cy="41" rx="9.500" ry="6" fill="#FFF7E6" stroke="#E0CFA6" stroke-width="2"/><ellipse cx="34" cy="43" rx="9.500" ry="6" fill="#FFF7E6" stroke="#E0CFA6" stroke-width="2"/><circle cx="46" cy="46" r="3.500" fill="#23856D"/><path d="M40 9h17v11a8.500 8.500 0 0 1-17 0z" fill="#fff" stroke="#087F8C" stroke-width="2.500"/><path d="M41 15h15v5a7.500 7.500 0 0 1-15 0z" fill="#B5763A"/><path d="M45 3c-2 2 2 3 0 6M51 3c-2 2 2 3 0 6" stroke="#9AA8A2" stroke-width="2" fill="none" stroke-linecap="round"/>',
    plate: '<ellipse cx="32" cy="57" rx="22" ry="3" fill="#172B36" opacity=".08"/><circle cx="32" cy="31" r="27" fill="#E6ECEE" stroke="#9AA8A2" stroke-width="2"/><circle cx="32" cy="31" r="22" fill="#F7F9F9"/><circle cx="23" cy="23" r="8.500" fill="#F2C14E" stroke="#fff" stroke-width="2.500"/><circle cx="41" cy="23" r="8.500" fill="#23856D" stroke="#fff" stroke-width="2.500"/><circle cx="32" cy="41" r="8.500" fill="#fff" stroke="#DCE5E3" stroke-width="2.500"/><circle cx="48" cy="39" r="6" fill="#E5B76B" stroke="#C99A4C" stroke-width="1.500"/><circle cx="15" cy="39" r="4" fill="#D65A5A" opacity=".85"/>',
    alert: '<ellipse cx="30" cy="54" rx="18" ry="3" fill="#172B36" opacity=".08"/><g transform="rotate(-35 28 34) scale(.9) translate(3 4)"><rect x="30" y="24" width="26" height="18" rx="9" fill="#fff" stroke="#8A97A3" stroke-width="2.500"/><rect x="8" y="24" width="28" height="18" rx="9" fill="#9AA8B5"/></g><circle cx="47" cy="17" r="12" fill="#D65A5A"/><rect x="45.500" y="10" width="3" height="10" rx="1.500" fill="#fff"/><circle cx="47" cy="24" r="2" fill="#fff"/>'
  };
  function art(name) { return '<svg class="art64" viewBox="0 0 64 64" aria-hidden="true">' + (A[name] || '') + '</svg>'; }
  function svg(name, cls) { return '<svg class="' + (cls || 'svgi') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>'; }
  return { svg: svg, art: art };
})();
