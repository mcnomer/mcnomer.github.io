import { createElement } from "./createElement.mjs";
import { loadSlider } from "./slide.mjs";
import { newGrowButton } from "./buttons.mjs";

const imgViewer = document.querySelector(".imageviewer");
const imageViewerCloseBtn = imgViewer.querySelector(".close");
imageViewerCloseBtn.onclick = closeImageViewer;
const imageViewerPrevBtn = imgViewer.querySelector(".prev");
const imageViewerNextBtn = imgViewer.querySelector(".next");
const imageViewerInfoBtn = imgViewer.querySelector(".info");
const imageViewerTitle = imgViewer.querySelector(".img-title");

let originX = 0, originY = 0;
let pageIndex = 0;
let currentImg;

export function openImageViewer(e, d) {
  pageIndex = 0;
  [originX, originY] = [e.clientX, e.clientY];
  imgViewer.style = "";
  imgViewer.style.left = originX + "px";
  imgViewer.style.top = originY + "px";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loadImageViewer(d);
      imgViewer.style.transitionProperty = "width, height, left, top";
      imgViewer.style.left = imgViewer.style.top = "";
      imgViewer.style.width = "100vw";
      imgViewer.style.height = "100vh";
    })
  });
}

function closeImageViewer() {
  document.body.style.overflow = imgViewer.style = "";
  imgViewer.style.transitionProperty = "width, height, left, top";
  imgViewer.style.left = originX + "px";
  imgViewer.style.top = originY + "px";
}

function loadImageViewer(d) {
  loadImage(d, 0);
}

function loadImage(d, i) {
  if (currentImg) currentImg.remove();
  const page = d.pages[i];
  const img = currentImg = createElement("img", "full-img noselect");

  img.src = getFullImageSrc(page);
  img.style.visibility = "hidden";
  img.style.opacity = 0;
  imgViewer.append(img);

  setTimeout(() => {
    img.style = "";
    imgViewer.style.transitionProperty = "none";
    document.body.style.overflow = "hidden";
  }, 300);

  loadControls(img, d);
}

function switchImage(d, diff = 0) {
  currentImg.style.transition = "transform 0.3s ease-out";
  currentImg.style.transform = "translateX(" + 100 * diff + "vw)";
  setTimeout(() => {
    pageIndex-= diff;
    if (pageIndex > d.pages.length - 1) pageIndex = 0;
    if (pageIndex < 0) pageIndex = d.pages.length - 1;
    loadImage(d, pageIndex);
  }, 300);
}

function loadControls(img, d) {
  if (d.pages.length === 1) {
    imageViewerNextBtn.style.display = imageViewerPrevBtn.style.display = "none";
  } else {
    imageViewerNextBtn.style.display = imageViewerPrevBtn.style.display = "";
    imageViewerPrevBtn.onclick = () => switchImage(d, 1);
    imageViewerNextBtn.onclick = () => switchImage(d, -1);
  }

  loadSlider(img, () => {
    img.style.transition = "";
  }, value => {
    img.style.transform = "translate(" + value[0] + "px, " + value[1] + "px)";
  }, value => {
    if (Math.abs(value[1]) > window.innerHeight / 4) {
      currentImg.style.transition = "transform 0.15s ease-out";
      currentImg.style.transform = "translateY(" + 100 * Math.sign(value[1]) + "vh)";
      setTimeout(closeImageViewer, 100);
    } else {
      if (Math.abs(value[0]) > window.innerWidth / 4 && d.pages.length > 1) {
        switchImage(d, Math.sign(value[0]));
      } else {
        img.style = "";
        img.style.transition = "transform 0.3s ease-out";
      }
    }
  });

  imageViewerTitle.innerHTML = d.name;

  const desc = d.pages[pageIndex].description;
  if (desc) {
    imageViewerInfoBtn.style.display = "";
    newGrowButton(imageViewerInfoBtn, () => {
      if (!desc) return true;
      imageViewerInfoBtn.innerHTML = "";
      const p = createElement("p", "desc", desc);
      imageViewerInfoBtn.append(p);
    });
  } else {
    imageViewerInfoBtn.style.display = "none";
  }
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