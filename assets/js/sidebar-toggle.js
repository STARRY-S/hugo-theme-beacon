// Off-canvas sidebar drawer for mobile
(function () {
  var body = document.body;
  var toggle = document.getElementById("sidebar-toggle");
  var closeBtn = document.querySelector(".sidebar-close");
  var overlay = document.querySelector(".sidebar-overlay");
  var sidebar = document.getElementById("sidebar");
  var mobile = window.matchMedia("(max-width: 900px)");
  var hideTimer = 0;
  var openFrame = 0;
  var backgroundState = [];
  if (!toggle) return;

  function background(disabled) {
    if (disabled) {
      if (backgroundState.length) return;
      backgroundState = [document.querySelector(".header"), document.querySelector(".main"), document.querySelector(".footer")]
        .filter(Boolean)
        .map(function (el) {
          var state = { el: el, inert: el.inert, ariaHidden: el.getAttribute("aria-hidden") };
          el.inert = true;
          el.setAttribute("aria-hidden", "true");
          return state;
        });
      return;
    }
    backgroundState.forEach(function (state) {
      state.el.inert = state.inert;
      if (state.ariaHidden === null) state.el.removeAttribute("aria-hidden");
      else state.el.setAttribute("aria-hidden", state.ariaHidden);
    });
    backgroundState = [];
  }

  function focusable() {
    return sidebar ? Array.prototype.slice.call(sidebar.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) { return el.offsetParent !== null; }) : [];
  }

  function open() {
    window.clearTimeout(hideTimer);
    window.cancelAnimationFrame(openFrame);
    if (overlay) overlay.removeAttribute("hidden");
    openFrame = requestAnimationFrame(function () {
      body.classList.add("sidebar-open");
      openFrame = 0;
      if (closeBtn) closeBtn.focus();
    });
    toggle.setAttribute("aria-expanded", "true");
    if (sidebar) {
      sidebar.inert = false;
      sidebar.setAttribute("aria-hidden", "false");
    }
    background(true);
  }

  function close(restoreFocus) {
    window.cancelAnimationFrame(openFrame);
    openFrame = 0;
    body.classList.remove("sidebar-open");
    toggle.setAttribute("aria-expanded", "false");
    background(false);
    if (sidebar && mobile.matches) {
      sidebar.inert = true;
      sidebar.setAttribute("aria-hidden", "true");
    }
    if (overlay) {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(function () {
        if (!body.classList.contains("sidebar-open")) overlay.setAttribute("hidden", "");
      }, 300);
    }
    if (restoreFocus !== false && mobile.matches) toggle.focus();
  }

  function syncViewport() {
    if (mobile.matches) {
      if (!body.classList.contains("sidebar-open") && sidebar) {
        sidebar.inert = true;
        sidebar.setAttribute("aria-hidden", "true");
      }
    } else {
      close(false);
      if (sidebar) {
        sidebar.inert = false;
        sidebar.removeAttribute("aria-hidden");
      }
      if (overlay) overlay.setAttribute("hidden", "");
    }
  }

  toggle.addEventListener("click", function () {
    body.classList.contains("sidebar-open") ? close(true) : open();
  });
  if (closeBtn) closeBtn.addEventListener("click", function () { close(true); });
  if (overlay) overlay.addEventListener("click", function () { close(true); });
  if (sidebar) {
    sidebar.addEventListener("click", function (e) {
      if (mobile.matches && e.target.closest("a")) close(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!body.classList.contains("sidebar-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      var items = focusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  mobile.addEventListener("change", syncViewport);
  syncViewport();
})();
