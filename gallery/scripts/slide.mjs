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

export function loadSlider(slider, startCallback, moveCallback, endCallback, secondaryStartCallback, secondaryMoveCallback, secondaryEndCallback) {
  let startX = 0, startY = 0, pos;
  let secondaryStartX = 0, secondaryStartY = 0, secondaryPos;
  const useMultiplePointers = (secondaryStartCallback || secondaryMoveCallback || secondaryEndCallback);

  function getPointerPos(e) {
    if (e.targetTouches) {
      return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    } else {
      return [e.clientX, e.clientY];
    }
  }

  function handleMove(e) {
    e.preventDefault();
    if (e.isPrimary) {
      requestAnimationFrame(() => {
        const [x, y] = getPointerPos(e);
        pos = [x - startX, y - startY];
        moveCallback(pos);
      });
    } else {
      if (useMultiplePointers) {
        requestAnimationFrame(() => {
          const [x, y] = getPointerPos(e);
          secondaryPos = [x - secondaryStartX, y - secondaryStartY];
          secondaryMoveCallback(secondaryPos);
        });
      }
    }
  }

  function handleEnd(e) {
    e.preventDefault();
    if (e.isPrimary) {
      requestAnimationFrame(() => {
        const [x, y] = getPointerPos(e);
        pos = [x - startX, y - startY];
        endCallback(pos);
      });
      document.removeEventListener(events.move, handleMove, true);
      document.removeEventListener(events.end, handleEnd, true);
      document.removeEventListener(events.cancel, handleEnd, true);
    } else {
      if (useMultiplePointers) {
        requestAnimationFrame(() => {
          const [x, y] = getPointerPos(e);
          secondaryPos = [x - secondaryStartX, y - secondaryStartY];
          secondaryEndCallback(secondaryPos);
        });
      }
    }
  }

  function handleDown(e) {
    e.preventDefault();
    if (e.isPrimary) {
      requestAnimationFrame(() => {
        [startX, startY] = getPointerPos(e);
        startCallback();
      });
      document.addEventListener(events.move, handleMove, true);
      document.addEventListener(events.end, handleEnd, true);
      document.addEventListener(events.cancel, handleEnd, true);
    }  else {
      if (useMultiplePointers) {
        requestAnimationFrame(() => {
          [secondaryStartX, secondaryStartY] = getPointerPos(e);
          startCallback();
        });
      }
    }
  }

  if (window.PointerEvent) {
    slider.onpointerdown = handleDown;
  } else {
    slider.ontouchstart = handleDown;
    slider.onmousedown = handleDown;
  }
}