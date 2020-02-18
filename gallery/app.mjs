import { createElement } from "./createElement.mjs";
import { openImageViewer } from "./imageViewer.mjs";

const container = document.querySelector(".images");
let oldNumCols;

async function loadImages() {
  const data = await fetch("/gallery/data.json")
    .then(response => response.json())
    .catch(e => console.log("Error fetching data\n" + e));

  let oldwidth = window.innerWidth;
  document.onfullscreenchange = window.onresize = () => {
    if (window.innerWidth !== oldwidth) {
      calculateColumns(data);
      oldwidth = window.width;
    }
  }
  calculateColumns(data);
}

function calculateColumns(data) {
  const numCols = (window.innerWidth <= 600) ? 1 : Math.floor(((window.innerWidth - 600) / 350) + 2);

  if (oldNumCols !== numCols) {
    while (container.firstChild) container.firstChild.remove();

    let columns = [];
    for (let y = 0; y < numCols; y++) {
      const column = createElement("div", "column");
      container.append(column);
      columns.push(column);
    };

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const page = d.pages[0];
      let img = createElement("img");
      img.src = page.thumb || page.file;
      img.alt = d.name;
      img.onclick = e => openImageViewer(e, d);
      columns[i % numCols].append(img);
    };

    for (let column of columns) {
      column.style.flex = (100 / numCols) + "%";
      column.style.maxWidth = "calc(" + (100 / numCols) + "% - 0.5em)";
    }
    oldNumCols = numCols;
  }
}

window.onload = loadImages;