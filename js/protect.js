(function () {
  'use strict';

  function blockEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  function isScreenshotShortcut(e) {
    var key = e.key;
    var code = e.keyCode || e.which;

    if (key === 'PrintScreen' || code === 44) return true;
    if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5')) return true;
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

  function clearClipboard() {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    navigator.clipboard.writeText('').catch(function () {});
  }

  document.addEventListener('contextmenu', blockEvent, true);

  document.addEventListener('keydown', function (e) {
    if (isBlockedShortcut(e)) {
      if (isScreenshotShortcut(e)) clearClipboard();
      blockEvent(e);
    }
  }, true);

  document.addEventListener('keyup', function (e) {
    if (e.key === 'PrintScreen' || (e.keyCode || e.which) === 44) {
      clearClipboard();
      blockEvent(e);
    }
  }, true);

  ['copy', 'cut', 'paste'].forEach(function (type) {
    document.addEventListener(type, blockEvent, true);
  });

  document.addEventListener('selectstart', blockEvent, true);
  document.addEventListener('dragstart', blockEvent, true);

  document.querySelectorAll('img').forEach(function (img) {
    img.setAttribute('draggable', 'false');
    img.addEventListener('contextmenu', blockEvent, true);
  });

  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia = function () {
      return Promise.reject(new DOMException('Screen capture is not allowed.', 'NotAllowedError'));
    };
  }

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
