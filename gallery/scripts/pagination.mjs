import { createElement } from "./createElement.mjs";
import { switchImage } from "./imageViewer.mjs"

const imageViewerPagination = document.querySelector(".imageviewer .pagination");

export function loadPagination(d) {
  while (imageViewerPagination.firstChild) imageViewerPagination.firstChild.remove();
  if (d.pages.length <= 1) return;
  for (let i = 0; i < d.pages.length; i++) {
    const pageBtn = createElement("button");
    pageBtn.onclick = () => {
      const pages = imageViewerPagination.children;
      let selectedIndex;
      for (let p = 0; p < pages.length; p++) {
        if (pages[p].hasAttribute("selected")) selectedIndex = p;
        pages[p].removeAttribute("selected");
      }
      switchImage(d, selectedIndex - i);
      pageBtn.setAttribute("selected", "");
    }
    imageViewerPagination.append(pageBtn);
  }
}

export function updatePagination(d, pageIndex) {
  if (d.pages.length <= 1) return;
  const pages = imageViewerPagination.children;
  for (const p of pages) p.removeAttribute("selected");
  pages[pageIndex].setAttribute("selected", "");
}