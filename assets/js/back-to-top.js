// Reveal the "jump to top" button after scrolling, and scroll up on click.
(function () {
  var btn = document.querySelector(".back-to-top");
  if (!btn) return;

  var threshold = 400; // px scrolled before the button appears

  function update() {
    var scrolled = window.pageYOffset || document.documentElement.scrollTop;
    if (scrolled > threshold) {
      btn.hidden = false;
      btn.classList.add("is-visible");
    } else {
      btn.classList.remove("is-visible");
      btn.hidden = true;
    }
  }

  btn.addEventListener("click", function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", update, { passive: true });
  update();
})();
