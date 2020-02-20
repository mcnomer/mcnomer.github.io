import { imageViewer } from "./imageViewer.mjs";

export function doubleClick() {
  imageViewer.zoomedIn = !imageViewer.zoomedIn;
  imageViewer.image.style.transition = "";
  imageViewer.image.style.transform = (imageViewer.zoomedIn) ? "scale(1.5)" : "scale(1)";
  return imageViewer.zoomedIn;
}

export function startZoom() {
  imageViewer.image.style.transition = "initial";
}

export function updateZoom(primaryPos, secondaryPos) {
  const centrePos = avg(primaryPos, secondaryPos);

  imageViewer.image.style.transform = "translate(" + centrePos[0] + "px, " + centrePos[1] + "px)";
}

export function endZoom(primaryPos, secondaryPos) {
  imageViewer.image.style.transform = "";
  setTimeout(() => imageViewer.image.style.transition = "", 300);
}

function avg(...values) {
  if (typeof values[0] === "number") {
    let result = 0;
    for (const v of values) {
      result += v;
    }
    return result / values.length;
  } else {
    if (Array.isArray(values)) {
      let results = [];
      for (const v of values) {
        for (let i = 0; i < v.length; i++) {
          if (i >= results.length) {
            results.push(v[i]);
          } else {
            results[i] += v[i];
          }
        }
      }
      for (let i = 0; i < results.length; i++) {
        results[i] /= values.length;
      }
      return results;
    }
  }
}