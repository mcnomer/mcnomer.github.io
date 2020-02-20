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
  let positions = {};

  function handleMove(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      const [x, y] = [e.clientX, e.clientY];
      if (e.isPrimary) {
        positions["primary"].pos = [x - positions["primary"].startX, y - positions["primary"].startY];
      } else {
        positions[e.pointerId].pos = [x - positions[e.pointerId].startX, y - positions[e.pointerId].startY];
      }
      moveCallback(positions);
    });
  }

  function handleEnd(e) {
    e.preventDefault();
    requestAnimationFrame(() => {
      const [x, y] = [e.clientX, e.clientY];
      if (e.isPrimary) {
        positions["primary"].pos = [x - positions["primary"].startX, y - positions["primary"].startY];
        positions["primary"].down = false;
      } else {
        positions[e.pointerId].pos = [x - positions[e.pointerId].startX, y - positions[e.pointerId].startY];
        positions[e.pointerId].down = false;
      }
      endCallback(positions);
    });
    if (e.isPrimary) {
      document.removeEventListener(events.move, handleMove, true);
      document.removeEventListener(events.end, handleEnd, true);
      document.removeEventListener(events.cancel, handleEnd, true);
    }
  }

  function handleDown(e) {
    e.preventDefault();
    console.log(e.pointerId);
    requestAnimationFrame(() => {
      let pointerName = (e.isPrimary) ? "primary" : e.pointerId;
      if (!positions[pointerName]) {
        positions[pointerName] = {};
      }
      [positions[pointerName].startX, positions[pointerName].startY] = [e.clientX, e.clientY];
      positions[pointerName].down = true;
      startCallback(positions);
    });
    if (e.isPrimary) {
      document.addEventListener(events.move, handleMove, true);
      document.addEventListener(events.end, handleEnd, true);
      document.addEventListener(events.cancel, handleEnd, true);
    }
  }

  if (window.PointerEvent) {
    slider.onpointerdown = handleDown;
  } else {
    slider.ontouchstart = handleDown;
    slider.onmousedown = handleDown;
  }
}