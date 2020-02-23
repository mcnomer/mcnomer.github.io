import { imageViewer } from "./imageViewer.mjs";
import { loadSlider } from "./slide.mjs";
import { doubleClick, startZoom, updateZoom, endZoom, startPan, updatePan, endPan } from "./imageViewerZoom.mjs";

export function loadImageViewerGestures(d, animatedCloseImageViewer, switchImage) {
  let locked = null;
  let clickedRecently = false;
  let clickedTimeout = null;
  let opacityTimeoutHandle;

  loadSlider(imageViewer.image, pointers => {
    let currentPointers = [];
    for (const pointer in pointers) {
      if (pointers[pointer].down) currentPointers.push(pointers[pointer]);
    }

    if (currentPointers.length === 1) {
      if (imageViewer.zoomedIn) startPan();
      locked = null;
      imageViewer.image.style.transition = "initial";
      if (imageViewer.showArrows) {
        imageViewer.buttons.next.style.opacity = imageViewer.buttons.prev.style.opacity = 0;
        if (opacityTimeoutHandle) clearTimeout(opacityTimeoutHandle);
        opacityTimeoutHandle = setTimeout(() => imageViewer.buttons.next.style.visibility = imageViewer.buttons.prev.style.visibility = "hidden", 300);
      }
    } else {
      startZoom(currentPointers);
    }
  }, pointers => {
    let currentPointers = [];
    for (const pointer in pointers) {
      if (pointers[pointer].down) currentPointers.push(pointers[pointer]);
    }
    
    if (currentPointers.length === 1) {
      const primaryPointer = currentPointers[0];
      if (imageViewer.zoomedIn) {
        updatePan(primaryPointer);
      } else {
        const diff = primaryPointer.diff;
        if (Math.abs(diff[0] - diff[1]) > 3) {
          if (locked === null) locked = (Math.abs(diff[0]) > Math.abs(diff[1])) ? "X" : "Y";
        }
    
        const translateValue = (locked === "Y") ? diff[1] : diff[0];
        imageViewer.image.style.transform = "translate" + locked + "(" + translateValue + "px)";
      }
    } else {
      updateZoom(currentPointers);
    }
  }, pointers => {
    let currentPointers = [];
    for (const pointer in pointers) {
      if (pointers[pointer].down) currentPointers.push(pointers[pointer]);
    }
    if (currentPointers.length < 1) {
      const diff = pointers["primary"].diff;
      if (imageViewer.zoomedIn) {
        endPan();
      } else {
        if (Math.abs(diff[1]) > window.innerHeight / 4 && locked === "Y") {
          animatedCloseImageViewer(Math.sign(diff[1]));
        } else {
          if (Math.abs(diff[0]) > window.innerWidth / 4 && d.pages.length > 1  && locked === "X") {
            switchImage(d, Math.sign(diff[0]));
          } else {
            imageViewer.image.style = "";
          }
        }
        if (imageViewer.showArrows) {
          imageViewer.buttons.next.style = imageViewer.buttons.prev.style = "";
          imageViewer.buttons.next.style.opacity = imageViewer.buttons.prev.style.opacity = 0;
          if (opacityTimeoutHandle) clearTimeout(opacityTimeoutHandle);
          opacityTimeoutHandle = setTimeout(() => imageViewer.buttons.next.style.opacity = imageViewer.buttons.prev.style.opacity = "", 300);
        }
      }
      if (clickedTimeout) clearTimeout(clickedTimeout);
      if (Math.abs(diff[0]) < 5 && Math.abs(diff[1]) < 5) {
        if (clickedRecently) {
          clickedRecently = false;
          imageViewer.zoomedIn = doubleClick(imageViewer.image);
        } else {
          clickedRecently = true;
          clickedTimeout = setTimeout(() => {clickedRecently = false}, 300);
        }
      }
    } else {
      endZoom(currentPointers);
      for (const pointer of currentPointers) {
        pointer.down = false;
      }
    }
  }); 
}