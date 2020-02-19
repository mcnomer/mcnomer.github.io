export function newGrowButton(btn, openCallback) {
  const initialContents = "<span>i</span>";
  let contentsTimeout;
  btn.onclick = function onButtonClick() {
    btn.onclick = null;
    if (contentsTimeout) clearTimeout(contentsTimeout);
    contentsTimeout = null;
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
        contentsTimeout = setTimeout(() => {
          btn.innerHTML = initialContents;
        }, 300);
      }
    };
  };
}