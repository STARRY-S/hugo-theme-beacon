// Add a "Copy" button to every code block in post content
(function () {
  var blocks = document.querySelectorAll(".post-content pre");
  blocks.forEach(function (pre) {
    var wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    var btn = document.createElement("button");
    btn.className = "copy-code";
    btn.type = "button";
    btn.textContent = "Copy";
    wrapper.appendChild(btn);

    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "Copied!";
        setTimeout(function () { btn.textContent = "Copy"; }, 1500);
      });
    });
  });
})();
