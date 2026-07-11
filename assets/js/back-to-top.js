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
    }
  }

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", update, { passive: true });
  update();
})();
