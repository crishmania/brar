(function () {
  'use strict';

  var BLOCKED_KEYS = {
    F12: true,
    '123': true // F12 keyCode
  };

  function isBlockedShortcut(e) {
    var key = e.key;
    var code = e.keyCode || e.which;

    if (key === 'F12' || code === 123) return true;

    if (e.ctrlKey || e.metaKey) {
      var k = key.toLowerCase();
      if (['u', 's', 'c', 'a', 'p', 'x'].indexOf(k) !== -1) return true;
      if (e.shiftKey && ['i', 'j', 'c', 'k'].indexOf(k) !== -1) return true;
    }

    return false;
  }

  function blockEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Right-click
  document.addEventListener('contextmenu', blockEvent, true);

  // Keyboard shortcuts (devtools, view source, copy, save, print)
  document.addEventListener('keydown', function (e) {
    if (isBlockedShortcut(e)) blockEvent(e);
  }, true);

  // Copy / cut / paste
  ['copy', 'cut', 'paste'].forEach(function (type) {
    document.addEventListener(type, blockEvent, true);
  });

  // Text selection
  document.addEventListener('selectstart', blockEvent, true);

  // Drag images
  document.addEventListener('dragstart', blockEvent, true);

  // Disable image saving via long-press on some mobile browsers
  document.querySelectorAll('img').forEach(function (img) {
    img.setAttribute('draggable', 'false');
    img.addEventListener('contextmenu', blockEvent, true);
  });

  // DevTools size-detection deterrent (not foolproof)
  var devtoolsOpen = false;
  var threshold = 160;

  function checkDevTools() {
    var widthGap = window.outerWidth - window.innerWidth > threshold;
    var heightGap = window.outerHeight - window.innerHeight > threshold;
    var open = widthGap || heightGap;

    if (open && !devtoolsOpen) {
      devtoolsOpen = true;
      document.body.classList.add('devtools-warning');
    } else if (!open && devtoolsOpen) {
      devtoolsOpen = false;
      document.body.classList.remove('devtools-warning');
    }
  }

  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 1000);

  // Discourage casual printing
  if (window.matchMedia) {
    var printMq = window.matchMedia('print');
    if (printMq.addEventListener) {
      printMq.addEventListener('change', function (e) {
        if (e.matches) document.body.classList.add('print-blocked');
      });
    }
  }
})();
