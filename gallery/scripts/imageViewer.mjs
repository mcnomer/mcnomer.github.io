import { createElement } from "./createElement.mjs";
import { newGrowButton } from "./buttons.mjs";
import { loadPagination, updatePagination } from "./pagination.mjs";
import { loadImageViewerGestures } from "./imageViewerGestures.mjs";

const viewer = document.querySelector(".imageviewer");
const pageTitle = document.querySelector("title");

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
  zoomedIn: false,
  currentScale: 1,
  centreX: 0,
  centreY: 0,
  open: false
}

imageViewer.buttons.close.onclick = () => history.go(-1);

let originX = 0, originY = 0;
let pageIndex = 0;

export function openImageViewer(e, d, pushHistory = true) {
  pageIndex = 0;
  [originX, originY] = [e.clientX, e.clientY];
  viewer.style = "";
  viewer.style.left = originX + "px";
  viewer.style.top = originY + "px";
  imageViewer.open = true;
  if (pushHistory) window.history.pushState([d, 0], "", d.pages[0].file);
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

function closeImageViewer(pushHistory = true) {
  document.body.style.overflow = viewer.style = "";
  viewer.style.transitionProperty = "width, height, left, top";
  viewer.style.left = originX + "px";
  viewer.style.top = originY + "px";
  document.onkeydown = null;
  imageViewer.zoomedIn = false;
  imageViewer.open = false;
  pageTitle.innerHTML = "Gallery";
  if (pushHistory) window.history.pushState(null, "", "/gallery/");
}

function loadImageViewer(d) {
  loadPagination(d, switchImage);
  loadImage(d, 0);
}

function loadImage(d, i) {
  if (imageViewer.image) imageViewer.image.remove();
  const page = d.pages[i];
  const img = imageViewer.image = createElement("img", "full-img noselect");
  window.history.replaceState([d, i], "", page.file);

  img.src = getFullImageSrc(page);
  img.style.visibility = "hidden";
  img.style.opacity = 0;
  viewer.append(img);

  setTimeout(() => {
    img.style = "";
    viewer.style.transitionProperty = "none";
    document.body.style.overflow = "hidden";
  }, 300);

  imageViewer.currentScale = 1;
  imageViewer.centreX = 0;
  imageViewer.centreY = 0;
  loadControls(d);
}

function switchImage(d, diff = 0) {
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

function loadControls(d) {
  imageViewer.showArrows = false;

  loadImageViewerGestures(d, animatedCloseImageViewer, switchImage);

  if (d.pages.length <= 1) {
    imageViewer.buttons.next.style.display = imageViewer.buttons.prev.style.display = "none";
    imageViewer.showArrows = false;
  } else {
    imageViewer.buttons.next.style = imageViewer.buttons.prev.style = "";
    imageViewer.buttons.prev.onclick = () => switchImage(d, 1);
    imageViewer.buttons.next.onclick = () => switchImage(d, -1);
    imageViewer.showArrows = true;
  }

  imageViewer.title.innerHTML = d.name;
  pageTitle.innerHTML = "Gallery | " + d.name;

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
    if (e.code === "ArrowDown" || e.code === "Escape") animatedCloseImageViewer(1);
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

export function animatedCloseImageViewer(direction = 0) {
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

window.onpopstate = e => {
  if (e.state) {
    if (imageViewer.open) {
      loadImage(e.state[0], e.state[1]);
    } else {
      openImageViewer({
        clientX: Math.floor(window.innerWidth/2),
        clientY: Math.floor(window.innerHeight/2)
      }, e.state[0], false);
    }
  } else {
    if (imageViewer.open) closeImageViewer(false);
  }
}