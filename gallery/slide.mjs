let events = {
  move: "pointermove",
  end: "pointerup",
  cancel: "pointercancel"
};

if (!window.PointerEvent) {
  events.move = "touchmove";
  events.end = "touchend";
  events.cancel = "touchcancel";
}

export function loadSlider(slider, startCallback, moveCallback, endCallback) {
  let startX = 0, startY = 0, value = 0;

  function getPointerPos(e) {
    if (e.targetTouches) {
      return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    } else {
      return [e.clientX, e.clientY];
    }
  }

  function handleMove(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      const [x, y] = getPointerPos(e);
      value = [x - startX, y - startY];
      moveCallback(value);
    });
  }

  function handleEnd(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      const [x, y] = getPointerPos(e);
      value = [x - startX, y - startY];
      endCallback(value);
    });
    document.removeEventListener(events.move, handleMove, true);
    document.removeEventListener(events.end, handleEnd, true);
    document.removeEventListener(events.cancel, handleEnd, true);
  }

  function handleDown(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      [startX, startY] = getPointerPos(e);
      startCallback();
    });
    document.addEventListener(events.move, handleMove, true);
    document.addEventListener(events.end, handleEnd, true);
    document.addEventListener(events.cancel, handleEnd, true);
  }

  if (window.PointerEvent) {
    slider.onpointerdown = handleDown;
  } else {
    slider.ontouchstart = handleDown;
    slider.onmousedown = handleDown;
  }
}