// Light/Dark/Auto theme toggle with persistence
(function () {
  var STORAGE_KEY = "beacon-theme";
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var modes = ["auto", "light", "dark"];
  var labels = document.body.dataset;
  var names = {
    auto: labels.themeAuto || "Auto",
    light: labels.themeLight || "Light",
    dark: labels.themeDark || "Dark",
  };

  function storedMode() {
    var value = null;
    try { value = localStorage.getItem(STORAGE_KEY); } catch {}
    return value === "light" || value === "dark" ? value : "auto";
  }

  var mode = storedMode();

  function updateButton() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var next = modes[(modes.indexOf(mode) + 1) % modes.length];
    var label = (labels.toggleTheme || "Theme") + ": " + names[mode] + " → " + names[next];
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
  }

  function apply(nextMode) {
    mode = nextMode;
    var isDark = mode === "dark" || (mode === "auto" && media.matches);
    root.dataset.theme = mode;
    root.classList.toggle("dark", isDark);
    updateButton();
    document.dispatchEvent(
      new CustomEvent("beacon:themechange", { detail: { mode: mode, isDark: isDark } })
    );
  }

  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var next = modes[(modes.indexOf(mode) + 1) % modes.length];
      try {
        if (next === "auto") localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      apply(next);
    });
  }

  media.addEventListener("change", function () {
    if (mode === "auto") apply("auto");
  });

  apply(mode);
})();
