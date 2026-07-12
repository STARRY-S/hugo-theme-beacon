// Add a "Copy" button to every code block in post content
(function () {
  var labels = document.body.dataset;
  var copyLabel = labels.copy || "Copy";
  var copiedLabel = labels.copied || "Copied!";

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      /* nothing left to try */
    }
    document.body.removeChild(ta);
  }

  var blocks = document.querySelectorAll(".post-content pre");
  blocks.forEach(function (pre) {
    var wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    var btn = document.createElement("button");
    btn.className = "copy-code";
    btn.type = "button";
    btn.textContent = copyLabel;
    wrapper.appendChild(btn);

    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.innerText : pre.innerText;
      var done = function () {
        btn.textContent = copiedLabel;
        setTimeout(function () { btn.textContent = copyLabel; }, 1500);
      };
      // navigator.clipboard is undefined on non-secure origins (plain http)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text);
          done();
        });
      } else {
        fallbackCopy(text);
        done();
      }
    });
  });
})();
