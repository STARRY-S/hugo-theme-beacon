(function () {
  "use strict";

  document.querySelectorAll(".post-content .spoiler").forEach(function (spoiler) {
    if (!spoiler.hasAttribute("tabindex")) spoiler.tabIndex = 0;
    if (!spoiler.hasAttribute("role")) spoiler.setAttribute("role", "button");
    spoiler.setAttribute("aria-expanded", "false");

    function toggle() {
      var revealed = spoiler.classList.toggle("is-revealed");
      spoiler.setAttribute("aria-expanded", String(revealed));
    }

    spoiler.addEventListener("click", toggle);
    spoiler.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    });
  });
})();
