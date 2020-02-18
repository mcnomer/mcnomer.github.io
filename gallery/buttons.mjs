export function newGrowButton(btn, openCallback) {
  let initialContents = btn.innerHTML;
  btn.onclick = function onButtonClick() {
    btn.onclick = null;
    initialContents = btn.innerHTML;
    if (openCallback) {
      if (openCallback()) return;
    }

    btn.setAttribute("open", "");

    btn.onclick = null;
    document.body.onclick = document.body.oncontextmenu = function reset(e) {
      if (!btn.contains(e.target)) {
        btn.onclick = onButtonClick;
        document.body.onclick = document.body.oncontextmenu = null;
        btn.removeAttribute("open");
        setTimeout(() => {
          btn.innerHTML = initialContents;
        }, 150);
      }
    };
  };
}