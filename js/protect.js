(function () {
  'use strict';

  var flashEl = document.getElementById('captureFlash');
  var flashTimer = null;

  function blockEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  function isScreenshotShortcut(e) {
    var key = e.key;
    var code = e.keyCode || e.which;

    // Print Screen (Windows/Linux)
    if (key === 'PrintScreen' || code === 44) return true;

    // macOS screenshots: Cmd+Shift+3 / 4 / 5
    if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5')) return true;

    // Windows Snipping Tool: Win+Shift+S (Windows only)
    if (!/Mac|iPhone|iPad|iPod/.test(navigator.userAgent) && e.metaKey && e.shiftKey && key.toLowerCase() === 's') return true;

    return false;
  }

  function isBlockedShortcut(e) {
    var key = e.key;
    var code = e.keyCode || e.which;

    if (isScreenshotShortcut(e)) return true;
    if (key === 'F12' || code === 123) return true;

    if (e.ctrlKey || e.metaKey) {
      var k = key.toLowerCase();
      if (['u', 's', 'c', 'a', 'p', 'x'].indexOf(k) !== -1) return true;
      if (e.shiftKey && ['i', 'j', 'c', 'k'].indexOf(k) !== -1) return true;
    }

    return false;
  }

  function showCaptureWarning() {
    if (!flashEl) return;
    flashEl.classList.add('is-active');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      flashEl.classList.remove('is-active');
    }, 1200);
  }

  function clearClipboard() {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    navigator.clipboard.writeText('Screenshots are not permitted — brardemo.soseeks.com private demo.').catch(function () {});
  }

  function onScreenshotAttempt() {
    showCaptureWarning();
    clearClipboard();
  }

  // Right-click
  document.addEventListener('contextmenu', blockEvent, true);

  // Block shortcuts on keydown
  document.addEventListener('keydown', function (e) {
    if (isBlockedShortcut(e)) {
      if (isScreenshotShortcut(e)) onScreenshotAttempt();
      blockEvent(e);
    }
  }, true);

  // Print Screen fires on keyup on some browsers
  document.addEventListener('keyup', function (e) {
    if (e.key === 'PrintScreen' || (e.keyCode || e.which) === 44) {
      onScreenshotAttempt();
      blockEvent(e);
    }
  }, true);

  // Copy / cut / paste
  ['copy', 'cut', 'paste'].forEach(function (type) {
    document.addEventListener(type, blockEvent, true);
  });

  // Text selection
  document.addEventListener('selectstart', blockEvent, true);

  // Drag images
  document.addEventListener('dragstart', blockEvent, true);

  document.querySelectorAll('img').forEach(function (img) {
    img.setAttribute('draggable', 'false');
    img.addEventListener('contextmenu', blockEvent, true);
  });

  // Blur page when tab loses focus (deters some capture tools)
  var hiddenOverlay = null;

  function createHiddenOverlay() {
    if (hiddenOverlay) return hiddenOverlay;
    hiddenOverlay = document.createElement('div');
    hiddenOverlay.className = 'capture-flash is-active';
    hiddenOverlay.setAttribute('aria-hidden', 'true');
    hiddenOverlay.innerHTML = '<p>Private demo — content hidden while away.</p>';
    hiddenOverlay.style.pointerEvents = 'none';
    document.body.appendChild(hiddenOverlay);
    return hiddenOverlay;
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      createHiddenOverlay();
    } else if (hiddenOverlay) {
      hiddenOverlay.remove();
      hiddenOverlay = null;
    }
  });

  // Screen recording / capture API detection
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    var original = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getDisplayMedia = function () {
      onScreenshotAttempt();
      return Promise.reject(new DOMException('Screen capture is not allowed.', 'NotAllowedError'));
    };
  }

  // DevTools size-detection
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

  if (window.matchMedia) {
    var printMq = window.matchMedia('print');
    if (printMq.addEventListener) {
      printMq.addEventListener('change', function (e) {
        if (e.matches) document.body.classList.add('print-blocked');
      });
    }
  }
})();
