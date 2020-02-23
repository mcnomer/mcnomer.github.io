export function loadSlider(slider, startCallback, moveCallback, endCallback) {
  let pointers = {};

  function handleMove(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      let pointerName = (e.isPrimary) ? "primary" : e.pointerId;
      if (!pointers[pointerName]) return;
      if (!pointers[pointerName].down) return;

      const [x, y] = [e.clientX, e.clientY];
      pointers[pointerName].pos = [x, y];
      pointers[pointerName].diff = [x - pointers[pointerName].startX, y - pointers[pointerName].startY];
      moveCallback(pointers);
    });
  }

  function handleEnd(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      let pointerName = (e.isPrimary) ? "primary" : e.pointerId;
      const [x, y] = [e.clientX, e.clientY];
      pointers[pointerName].pos = [x, y];
      pointers[pointerName].diff = [x - pointers[pointerName].startX, y - pointers[pointerName].startY];
      pointers[pointerName].down = false;
      endCallback(pointers);
    });
    if (e.isPrimary) {
      document.removeEventListener("pointermove", handleMove, true);
      document.removeEventListener("pointerup", handleEnd, true);
      document.removeEventListener("pointercancel", handleEnd, true);
    }
  }

  function handleDown(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      let pointerName = (e.isPrimary) ? "primary" : e.pointerId;
      if (!pointers[pointerName]) pointers[pointerName] = {};

      pointers[pointerName].pos = [pointers[pointerName].startX, pointers[pointerName].startY] = [e.clientX, e.clientY];
      pointers[pointerName].diff = [0, 0];
      pointers[pointerName].down = true;
      startCallback(pointers);
    });
    if (e.isPrimary) {
      document.addEventListener("pointermove", handleMove, true);
      document.addEventListener("pointerup", handleEnd, true);
      document.addEventListener("pointercancel", handleEnd, true);
    }
  }

  slider.onpointerdown = handleDown;
}