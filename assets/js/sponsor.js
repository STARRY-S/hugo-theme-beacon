// Copy Sponsor addresses only after the browser confirms success.
(function () {
  var copiedLabel = (document.body.dataset && document.body.dataset.copied) || "Copied!";
  var failedLabel = (document.body.dataset && document.body.dataset.copyFailed) || "Copy failed";
  var status = document.getElementById("copy-status");

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var copied = false;
    try { copied = document.execCommand("copy"); } catch { /* nothing left to try */ }
    document.body.removeChild(ta);
    return copied;
  }

  document.addEventListener("click", function (e) {
    var addr = e.target.closest(".sponsor-address");
    if (addr) {
      var text = addr.dataset.copy || addr.textContent;
      var done = function () {
        addr.dataset.copied = copiedLabel;
        addr.classList.add("copied");
        if (status) status.textContent = copiedLabel;
        setTimeout(function () { addr.classList.remove("copied"); }, 2000);
      };
      var failed = function () {
        addr.dataset.copied = failedLabel;
        addr.classList.add("copied");
        if (status) status.textContent = failedLabel;
        setTimeout(function () { addr.classList.remove("copied"); }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text) ? done() : failed();
        });
      } else {
        fallbackCopy(text) ? done() : failed();
      }
    }
  });
})();
