// Image preview (lightbox): click a content image to open it full-screen.
// Progressive enhancement — images remain plain links to themselves if JS is off.
// Close with the button, a backdrop click, or Escape. Left/Right walk a post's
// images. Respects prefers-reduced-motion (skips the zoom animation).
(function () {
  "use strict";

  // Content images and gallery thumbnails share one lightbox sequence.
  // (A gallery shortcode lives inside .post-content, so the comma selector
  // could match it twice — querySelectorAll returns each element once.)
  var images = Array.prototype.slice.call(
    document.querySelectorAll(".post-content img.zoomable, .gallery img.zoomable")
  );
  if (!images.length) return;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Labels come from i18n via body data attributes, English as fallback.
  var d = document.body.dataset;
  var L = {
    dialog: d.imagePreview || "Image preview",
    open: d.openPreview || "Open image preview",
    close: d.closePreview || "Close",
    prev: d.prevImage || "Previous image",
    next: d.nextImage || "Next image",
  };

  var overlay, imgEl, capEl, exifEl, lastFocused, current = -1;

  function build() {
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", L.dialog);
    if (reduceMotion) overlay.classList.add("no-motion");

    overlay.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="' + L.close + '">&times;</button>' +
      '<button class="lightbox__nav lightbox__prev" type="button" aria-label="' + L.prev + '">&#8249;</button>' +
      '<button class="lightbox__nav lightbox__next" type="button" aria-label="' + L.next + '">&#8250;</button>' +
      '<figure class="lightbox__stage">' +
      '<img class="lightbox__img" alt="" />' +
      '<figcaption class="lightbox__caption"></figcaption>' +
      '<div class="lightbox__exif" hidden></div>' +
      "</figure>";

    imgEl = overlay.querySelector(".lightbox__img");
    capEl = overlay.querySelector(".lightbox__caption");
    exifEl = overlay.querySelector(".lightbox__exif");

    overlay.addEventListener("click", function (e) {
      if (
        e.target === overlay ||
        e.target.classList.contains("lightbox__stage") ||
        e.target.classList.contains("lightbox__close")
      ) {
        close();
      }
    });
    overlay.querySelector(".lightbox__prev").addEventListener("click", function () {
      show(current - 1);
    });
    overlay.querySelector(".lightbox__next").addEventListener("click", function () {
      show(current + 1);
    });

    document.body.appendChild(overlay);
  }

  function show(index) {
    current = (index + images.length) % images.length;
    var src = images[current];
    // Gallery thumbnails carry the size-capped original in data-full.
    imgEl.src = src.getAttribute("data-full") || src.currentSrc || src.src;
    var caption =
      src.getAttribute("data-caption") ||
      src.getAttribute("title") ||
      src.getAttribute("alt") ||
      "";
    imgEl.alt = caption;
    capEl.textContent = caption;
    capEl.style.display = caption ? "" : "none";
    // EXIF details (camera / lens / settings / date) live on the wrapping link.
    fillExif(src.closest("a"));
    // Hide nav arrows when there's only one image.
    var single = images.length < 2;
    overlay.querySelector(".lightbox__prev").hidden = single;
    overlay.querySelector(".lightbox__next").hidden = single;
  }

  // Populate the EXIF panel from a gallery item's data-* attributes. Values are
  // set with textContent (never innerHTML) so metadata can't inject markup.
  function fillExif(link) {
    exifEl.textContent = "";
    if (!link) {
      exifEl.hidden = true;
      return;
    }
    var rows = [
      ["camera", link.getAttribute("data-camera")],
      ["lens", link.getAttribute("data-lens")],
      ["settings", link.getAttribute("data-settings")],
      ["date", link.getAttribute("data-shot")],
    ];
    rows.forEach(function (r) {
      if (!r[1]) return;
      var span = document.createElement("span");
      span.className = "lightbox__exif-" + r[0];
      span.textContent = r[1];
      exifEl.appendChild(span);
    });
    exifEl.hidden = !exifEl.hasChildNodes();
  }

  function open(index) {
    if (!overlay) build();
    lastFocused = document.activeElement;
    show(index);
    overlay.classList.add("is-open");
    document.documentElement.classList.add("lightbox-open");
    document.addEventListener("keydown", onKey);
    overlay.querySelector(".lightbox__close").focus();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.documentElement.classList.remove("lightbox-open");
    document.removeEventListener("keydown", onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
  }

  images.forEach(function (img, i) {
    // Gallery thumbnails are wrapped in a link (no-JS fallback: open the full
    // image). The link is already keyboard-focusable and Enter fires a click,
    // so it becomes the single control. Bare content images have no wrapper,
    // so the image itself is promoted to a button.
    var link = img.closest("a");
    var trigger = link || img;

    if (!link) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", L.open);
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(i);
        }
      });
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault(); // cancel link navigation when JS is on
      open(i);
    });
  });
})();
