// Sponsor block: expand/collapse the QR cards and click-to-copy an address.
// Event-delegated, so any number of {{< sponsor >}} blocks on a page work
// without per-block inline scripts. No-ops on pages with no sponsor block.
(function () {
  var copiedLabel = (document.body.dataset && document.body.dataset.copied) || "Copied!";

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* nothing left to try */ }
    document.body.removeChild(ta);
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".sponsor-trigger");
    if (trigger) {
      var content = trigger.nextElementSibling;
      if (content && content.classList.contains("sponsor-content")) {
        var open = content.classList.toggle("expanded");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
      }
      return;
    }

    var addr = e.target.closest(".sponsor-address");
    if (addr) {
      var text = addr.dataset.copy || addr.textContent;
      var done = function () {
        addr.dataset.copied = copiedLabel;
        addr.classList.add("copied");
        setTimeout(function () { addr.classList.remove("copied"); }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text);
          done();
        });
      } else {
        fallbackCopy(text);
        done();
      }
    }
  });
})();
