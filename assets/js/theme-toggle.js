// Light/Dark/Auto theme toggle with persistence
(function () {
  var STORAGE_KEY = "pascal-theme";
  var root = document.documentElement;

  function apply(isDark) {
    root.classList.toggle("dark", isDark);
  }

  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var isDark = !root.classList.contains("dark");
      apply(isDark);
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    });
  }

  // Follow system changes only when the user hasn't chosen explicitly
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      apply(e.matches);
    }
  });
})();
