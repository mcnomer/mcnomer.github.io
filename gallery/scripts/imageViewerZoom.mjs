import { imageViewer } from "./imageViewer.mjs";

const epsilon = 1e-4;

export function doubleClick() {
  imageViewer.zoomedIn = !imageViewer.zoomedIn;
  imageViewer.image.style.transition = "";
  imageViewer.image.style.transform = (imageViewer.zoomedIn) ? "scale(1.5)" : "scale(1)";
  return imageViewer.zoomedIn;
}

let startDistance;

export function startZoom(pointers) {
  const startPositions = [];
  for (const pointer of pointers) {
    startPositions.push([pointer.startX, pointer.startY]);
  }
  const centrePos = avg(...startPositions);
  startDistance = getDistance(startPositions, centrePos);

  const translateStr = "translate(" + centrePos[0] + "px, " + centrePos[1] + "px)";
  imageViewer.image.style.transform = translateStr;
  
  imageViewer.image.style.transition = "initial";
  imageViewer.zoomedIn = true;
}

export function updateZoom(pointers) {
  let currentPositions = [];
  for (const pointer of pointers) currentPositions.push(pointer.pos);

  const centrePos = avg(...currentPositions);
  const currentDistance = getDistance(currentPositions, centrePos);
  
  imageViewer.currentScale = currentDistance / (startDistance * 2);
  console.log(imageViewer.currentScale);

  const translateStr = "translate(" + centrePos[0] + "px, " + centrePos[1] + "px)";
  const scaleStr = "scale(" + imageViewer.currentScale + ")";

  imageViewer.image.style.transform = translateStr + " " + scaleStr;
}

export function endZoom(pointers) {
  if (imageViewer.currentScale <= 1) {
    imageViewer.zoomedIn = false;
    imageViewer.image.style.transition = "";
    imageViewer.image.style.transform = "";
    startDistance = 0;
  }
  
  let positions = [];
  for (const pointer of pointers) positions.push(pointer.pos);
}

function getDistance(positions, _centre) {
  const centre = _centre || avg(...positions);
  let distances = [];
  for (const pos of positions) {
    const distance = Math.hypot(pos[0] - centre[0], pos[1] - centre[1]);
    distances.push(distance);
  }
  return avg(...distances);
}

function avg(...values) {
  if (typeof values[0] === "number") {
    let result = 0;
    for (const v of values) {
      result += v;
    }
    return result / values.length;
  } else {
    if (Array.isArray(values[0])) {
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