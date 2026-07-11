// Off-canvas sidebar drawer for mobile
(function () {
  var body = document.body;
  var toggle = document.getElementById("sidebar-toggle");
  var closeBtn = document.querySelector(".sidebar-close");
  var overlay = document.querySelector(".sidebar-overlay");
  if (!toggle) return;

  function open() {
    if (overlay) overlay.removeAttribute("hidden");
    // next frame so the opacity transition runs
    requestAnimationFrame(function () { body.classList.add("sidebar-open"); });
    toggle.setAttribute("aria-expanded", "true");
  }

  function close() {
    body.classList.remove("sidebar-open");
    toggle.setAttribute("aria-expanded", "false");
    if (overlay) {
      setTimeout(function () { overlay.setAttribute("hidden", ""); }, 300);
    }
  }

  toggle.addEventListener("click", function () {
    body.classList.contains("sidebar-open") ? close() : open();
  });
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (overlay) overlay.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("sidebar-open")) close();
  });
})();
