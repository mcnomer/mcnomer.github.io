import { createElement } from "./createElement.mjs";
import { loadSlider } from "./slide.mjs";
import { newGrowButton } from "./buttons.mjs";
import { loadPagination, updatePagination } from "./pagination.mjs";
import { doubleClick, startZoom, updateZoom, endZoom } from "./imageViewerZoom.mjs";

const viewer = document.querySelector(".imageviewer");

export const imageViewer = {
  viewer: viewer,
  image: null,
  buttons: {
    close: viewer.querySelector(".close"),
    prev: viewer.querySelector(".prev"),
    next: viewer.querySelector(".next"),
    info: viewer.querySelector(".info")
  },
  title: viewer.querySelector(".img-title"),
  zoomedIn: false
}

imageViewer.buttons.close.onclick = closeImageViewer;

let originX = 0, originY = 0;
let pageIndex = 0;

export function openImageViewer(e, d) {
  pageIndex = 0;
  [originX, originY] = [e.clientX, e.clientY];
  viewer.style = "";
  viewer.style.left = originX + "px";
  viewer.style.top = originY + "px";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loadImageViewer(d);
      viewer.style.transitionProperty = "width, height, left, top";
      viewer.style.left = viewer.style.top = "";
      viewer.style.width = "100%";
      viewer.style.height = "100%";
    })
  });
}

function closeImageViewer() {
  document.body.style.overflow = viewer.style = "";
  viewer.style.transitionProperty = "width, height, left, top";
  viewer.style.left = originX + "px";
  viewer.style.top = originY + "px";
  document.onkeydown = null;
}

function loadImageViewer(d) {
  loadPagination(d);
  loadImage(d, 0);
}

function loadImage(d, i) {
  if (imageViewer.image) imageViewer.image.remove();
  const page = d.pages[i];
  const img = imageViewer.image = createElement("img", "full-img noselect");

  img.src = getFullImageSrc(page);
  img.style.visibility = "hidden";
  img.style.opacity = 0;
  viewer.append(img);

  setTimeout(() => {
    img.style = "";
    viewer.style.transitionProperty = "none";
    document.body.style.overflow = "hidden";
  }, 300);

  loadControls(img, d);
}

export function switchImage(d, diff = 0) {
  if (d.pages.length <= 1) return;
  imageViewer.image.style.transition = "transform 0.3s ease-out";
  imageViewer.image.style.transform = "translateX(" + 100 * Math.sign(diff) + "vw)";
  setTimeout(() => {
    pageIndex-= diff;
    if (pageIndex > d.pages.length - 1) pageIndex = 0;
    if (pageIndex < 0) pageIndex = d.pages.length - 1;
    loadImage(d, pageIndex);
  }, 300);
}

function loadControls(img, d) {
  let showArrows = false;
  let opacityTimeoutHandle;
  if (d.pages.length <= 1) {
    imageViewer.buttons.next.style.display = imageViewer.buttons.prev.style.display = "none";
    showArrows = false;
  } else {
    imageViewer.buttons.next.style = imageViewer.buttons.prev.style = "";
    imageViewer.buttons.prev.onclick = () => switchImage(d, 1);
    imageViewer.buttons.next.onclick = () => switchImage(d, -1);
    showArrows = true;
  }

  let locked = null;
  let clickedRecently = false;
  let clickedTimeout;

  loadSlider(img, positions => {
    let pointers = [];
    for (const pointer in positions) {
      pointers.push(positions[pointer]);
    }
    if (pointers.length === 1) {
      locked = null;
      clearTimeout(clickedTimeout);
      if (clickedRecently) {
        clickedRecently = false;
        imageViewer.zoomedIn = doubleClick(img);
      } else {
        clickedRecently = true;
        clickedTimeout = setTimeout(() => {clickedRecently = false}, 300);
        img.style.transition = "initial";
      }

      if (showArrows) {
        imageViewer.buttons.next.style.opacity = imageViewer.buttons.prev.style.opacity = 0;
        if (opacityTimeoutHandle) clearTimeout(opacityTimeoutHandle);
        opacityTimeoutHandle = setTimeout(() => imageViewer.buttons.next.style.visibility = imageViewer.buttons.prev.style.visibility = "hidden", 300);
      }
    }
  }, positions => {
    let pointers = [];
    for (const pointer in positions) {
      pointers.push(positions[pointer]);
    }
    if (pointers.length === 1) {
      if (imageViewer.zoomedIn) {
        //pan zoomed in image
      } else {
        const pos = positions["primary"].pos;
        if (Math.abs(pos[0] - pos[1]) > 3) {
          if (locked === null) locked = (Math.abs(pos[0]) > Math.abs(pos[1])) ? "X" : "Y";
        }
    
        const translateValue = (locked === "Y") ? pos[1] : pos[0];
        img.style.transform = "translate" + locked + "(" + translateValue + "px)";
      }
    }
  }, positions => {
    let pointers = [];
    for (const pointer in positions) {
      pointers.push(positions[pointer]);
    }
    if (pointers.length === 1) {
      if (imageViewer.zoomedIn) {
        //
      } else {
        const pos = positions["primary"].pos;
        if (Math.abs(pos[1]) > window.innerHeight / 4 && locked === "Y") {
          animatedCloseImageViewer(Math.sign(pos[1]));
        } else {
          if (Math.abs(pos[0]) > window.innerWidth / 4 && d.pages.length > 1  && locked === "X") {
            switchImage(d, Math.sign(pos[0]));
          } else {
            img.style = "";
          }
        }
        if (showArrows) {
          imageViewer.buttons.next.style = imageViewer.buttons.prev.style = "";
          imageViewer.buttons.next.style.opacity = imageViewer.buttons.prev.style.opacity = 0;
          if (opacityTimeoutHandle) clearTimeout(opacityTimeoutHandle);
          opacityTimeoutHandle = setTimeout(() => imageViewer.buttons.next.style.opacity = imageViewer.buttons.prev.style.opacity = "", 300);
        }
      }
    }
  });

  imageViewer.title.innerHTML = d.name;

  const desc = d.pages[pageIndex].description;
  if (desc) {
    imageViewer.buttons.info.style.display = "";
    newGrowButton(imageViewer.buttons.info, () => {
      if (!desc) return true;
      imageViewer.buttons.info.innerHTML = "";
      const p = createElement("p", "desc", desc);
      imageViewer.buttons.info.append(p);
    });
  } else {
    imageViewer.buttons.info.style.display = "none";
  }

  updatePagination(d, pageIndex);
  let infoOpen = false;
  document.onkeydown = e => {
    if (e.code === "ArrowLeft") switchImage(d, 1);
    if (e.code === "ArrowRight") switchImage(d, -1);
    if (e.code === "ArrowUp") animatedCloseImageViewer(-1);
    if (e.code === "ArrowDown") animatedCloseImageViewer(1);
    if (e.code === "KeyI" || e.code === "Space") {
      if (infoOpen) {
        imageViewer.image.click();
        infoOpen = false;
      } else {
        imageViewer.buttons.info.click();
        infoOpen = true;
      }
    }
  }
}

function animatedCloseImageViewer(direction = 0) {
  imageViewer.image.style.transition = "transform 0.15s ease-out";
  imageViewer.image.style.transform = "translateY(" + 100 * Math.sign(direction) + "vh)";
  setTimeout(closeImageViewer, 100);
}

function getFullImageSrc(page) {
  if (navigator.connection) {
    if (
      navigator.connection.effectiveType !== "4g" ||
      navigator.connection.saveData
    ) {
      return page.thumb || page.file;
    }
  }
  return page.file;
}