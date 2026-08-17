// Compact global navigation disclosure for narrow screens.
(function () {
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");
  var mobile = window.matchMedia("(max-width: 640px)");
  if (!toggle || !menu) return;

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  function close(restoreFocus) {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", document.body.dataset.openMenu || "Open menu");
    if (mobile.matches) {
      menu.hidden = true;
      menu.inert = true;
      menu.setAttribute("aria-hidden", "true");
    }
    if (restoreFocus) toggle.focus();
  }

  function open() {
    menu.hidden = false;
    menu.inert = false;
    menu.setAttribute("aria-hidden", "false");
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", document.body.dataset.closeMenu || "Close menu");
  }

  function syncViewport() {
    if (mobile.matches) {
      close(false);
    } else {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = false;
      menu.inert = false;
      menu.removeAttribute("aria-hidden");
    }
  }

  toggle.addEventListener("click", function () {
    isOpen() ? close(true) : open();
  });
  menu.addEventListener("click", function (event) {
    if (mobile.matches && event.target.closest("a")) close(false);
  });
  document.addEventListener("click", function (event) {
    if (mobile.matches && isOpen() && !event.target.closest(".nav")) close(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && mobile.matches && isOpen()) {
      event.preventDefault();
      close(true);
    }
  });
  mobile.addEventListener("change", syncViewport);
  syncViewport();
})();
