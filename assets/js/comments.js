// Comments: load the configured provider only when the section nears the
// viewport, and keep it in sync with the light/dark toggle.
(function () {
  var box = document.getElementById("comments-body");
  if (!box) return;

  var provider = box.dataset.provider;
  var lang = box.dataset.lang || "en";
  var loaded = false;

  // Hugo's language codes are lowercase ("zh-cn", "zh-tw"); every provider wants
  // its own spelling. Giscus in particular builds its iframe as
  // giscus.app/<lang>/widget — an unknown code 404s, and a 404 page can't be
  // framed, so the reader just sees "giscus.app refused to connect".
  function pickLocale(supported, fallback) {
    var want = lang.toLowerCase();
    for (var i = 0; i < supported.length; i++) {
      if (supported[i].toLowerCase() === want) return supported[i];
    }
    var base = want.split("-")[0]; // zh-hk -> zh
    for (var j = 0; j < supported.length; j++) {
      if (supported[j].toLowerCase().split("-")[0] === base) return supported[j];
    }
    return fallback;
  }

  function giscusLang() {
    return pickLocale(
      ["ar", "ca", "de", "en", "eo", "es", "fa", "fr", "he", "id", "it", "ja",
       "ko", "nl", "pl", "pt", "ro", "ru", "th", "tr", "uk", "vi", "zh-CN", "zh-TW"],
      "en"
    );
  }

  function walineLang() {
    return pickLocale(["en-US", "zh-CN", "zh-TW", "ja-JP", "ru-RU", "vi-VN", "pt-BR"], "en-US");
  }

  function disqusLang() {
    // Disqus spells the regional variant with an underscore (zh_TW), which would
    // never match Hugo's "zh-tw" — normalise after picking.
    return pickLocale(["en", "ja", "zh", "zh-TW", "ko", "de", "es", "fr", "ru"], "en")
      .replace("-", "_");
  }

  // Waline is pinned like the Iconify CDN in js.html: exact version + SRI.
  var WALINE_VERSION = "3.15.2";
  var WALINE_JS_SRI = "sha384-ZIbPm4Z6QeaKyakU4Tq51uowGULfM+zut6BAbSnYF+9aFF9sK4Ih3fQwBXysozKp";
  var WALINE_CSS_SRI = "sha384-e4zDqZc21VhRGqcpuOkmAlBH2NcoP6kHXnCG6ZBrrd5asTIvP5T9osVX/v1Fx4UM";

  function isDark() {
    return document.documentElement.classList.contains("dark");
  }

  function script(src, attrs) {
    var s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.crossOrigin = "anonymous";
    Object.keys(attrs || {}).forEach(function (k) {
      s.setAttribute(k, attrs[k]);
    });
    return s;
  }

  var loaders = {
    disqus: function () {
      var shortname = box.dataset.shortname;
      var url = box.dataset.pageUrl;
      var id = box.dataset.pageId;

      // Disqus reads this global when embed.js runs and again on every reset().
      window.disqus_config = function () {
        this.page.url = url;
        this.page.identifier = id;
        this.language = disqusLang();
      };

      var thread = document.createElement("div");
      thread.id = "disqus_thread";
      box.appendChild(thread);
      document.head.appendChild(script("https://" + shortname + ".disqus.com/embed.js"));
    },

    giscus: function () {
      box.appendChild(
        script("https://giscus.app/client.js", {
          "data-repo": box.dataset.repo,
          "data-repo-id": box.dataset.repoId,
          "data-category": box.dataset.category,
          "data-category-id": box.dataset.categoryId,
          "data-mapping": box.dataset.mapping,
          "data-reactions-enabled": box.dataset.reactionsEnabled,
          "data-input-position": box.dataset.inputPosition,
          "data-theme": isDark() ? "dark" : "light",
          "data-lang": giscusLang(),
        })
      );
    },

    utterances: function () {
      var attrs = {
        repo: box.dataset.repo,
        "issue-term": box.dataset.issueTerm,
        theme: isDark() ? "github-dark" : "github-light",
      };
      if (box.dataset.label) attrs.label = box.dataset.label;
      box.appendChild(script("https://utteranc.es/client.js", attrs));
    },

    waline: function () {
      var base = "https://unpkg.com/@waline/client@" + WALINE_VERSION + "/dist/";

      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = base + "waline.css";
      css.integrity = WALINE_CSS_SRI;
      css.crossOrigin = "anonymous";
      document.head.appendChild(css);

      var js = script(base + "waline.umd.js", { integrity: WALINE_JS_SRI });
      js.onload = function () {
        if (!window.Waline) return;
        window.Waline.init({
          el: "#comments-body",
          serverURL: box.dataset.serverUrl,
          lang: walineLang(),
          dark: "html.dark", // Waline re-themes itself when the class flips
        });
      };
      document.head.appendChild(js);
    },
  };

  var load = loaders[provider];
  if (!load) return;

  var observer = new IntersectionObserver(
    function (entries) {
      if (!entries[0].isIntersecting || loaded) return;
      loaded = true;
      observer.disconnect();
      load();
    },
    { rootMargin: "200px" }
  );
  observer.observe(box);

  // Follow the theme toggle. Only giscus and utterances need telling; Waline
  // watches the class itself, and Disqus infers its colors from the page
  // background, so the thread has to be re-rendered.
  document.addEventListener("beacon:themechange", function (e) {
    if (!loaded) return;
    var dark = e.detail.isDark;

    if (provider === "giscus") {
      var giscusFrame = document.querySelector("iframe.giscus-frame");
      if (giscusFrame) {
        giscusFrame.contentWindow.postMessage(
          { giscus: { setConfig: { theme: dark ? "dark" : "light" } } },
          "https://giscus.app"
        );
      }
    } else if (provider === "utterances") {
      var utterancesFrame = document.querySelector("iframe.utterances-frame");
      if (utterancesFrame) {
        utterancesFrame.contentWindow.postMessage(
          { type: "set-theme", theme: dark ? "github-dark" : "github-light" },
          "https://utteranc.es"
        );
      }
    } else if (provider === "disqus" && window.DISQUS) {
      window.DISQUS.reset({ reload: true, config: window.disqus_config });
    }
  });
})();
