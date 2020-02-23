import { imageViewer } from "./imageViewer.mjs";

export function doubleClick() {
  imageViewer.zoomedIn = !imageViewer.zoomedIn;
  imageViewer.image.style.transition = "";
  imageViewer.currentScale = (imageViewer.zoomedIn) ? 1.5 : 1;
  imageViewer.centreX = imageViewer.centreY = 0;
  const scaleStr = "scale(" + imageViewer.currentScale + ")";
  imageViewer.image.style.transform = scaleStr;
  return imageViewer.zoomedIn;
}

let startCentre;
let imageStartCentre;
let startDistance;
let startScale = 1;

export function startZoom(pointers) {
  window.imageViewer = imageViewer;
  startScale = imageViewer.currentScale;
  imageStartCentre = [imageViewer.centreX, imageViewer.centreY];

  const startPositions = [];
  for (const pointer of pointers) {
    startPositions.push(pointer.pos);
  }
  const centrePos = avg(...startPositions);
  startCentre = [centrePos[0], centrePos[1]];
  startDistance = getDistance(startPositions, centrePos);
  
  imageViewer.image.style.transition = "initial";
  imageViewer.zoomedIn = true;
}

export function updateZoom(pointers) {
  let currentPositions = [];
  for (const pointer of pointers) currentPositions.push(pointer.pos);

  const pointerCentrePos = avg(...currentPositions);
  const currentDistance = getDistance(currentPositions, pointerCentrePos);
  imageViewer.currentScale = Math.min(startScale * (currentDistance / startDistance), 8);
  
  const scaleChange = (imageViewer.currentScale - startScale) / startScale;
  const scaleOffsetX = -((startCentre[0] - ((window.innerWidth / 2) + imageStartCentre[0])) * scaleChange);
  const scaleOffsetY = -((startCentre[1] - ((window.innerHeight / 2) + imageStartCentre[1])) * scaleChange);

  const pointerCentreDiff = [pointerCentrePos[0] - startCentre[0], pointerCentrePos[1] - startCentre[1]];

  const translateX = pointerCentreDiff[0] + imageStartCentre[0] + scaleOffsetX;
  const translateY = pointerCentreDiff[1] + imageStartCentre[1] + scaleOffsetY;

  [imageViewer.centreX, imageViewer.centreY] = [translateX, translateY];

  const translateStr = "translate(" + translateX + "px, " + translateY + "px)";
  const scaleStr = "scale(" + imageViewer.currentScale + ")";

  imageViewer.image.style.transform = translateStr + " " + scaleStr;
}

export function endZoom(pointers) {
  if (imageViewer.currentScale <= 1) {
    imageViewer.zoomedIn = false;
    imageViewer.currentScale = 1;
    imageViewer.image.style.transition = "";
    imageViewer.image.style.transform = "";
    startDistance = 0;
    imageStartCentre = [imageViewer.centreX, imageViewer.centreY] = [0, 0];
  } else {
    imageViewer.zoomedIn = true;
  }
  
  let positions = [];
  for (const pointer of pointers) positions.push(pointer.pos);
}

let startImageX = 0, startImageY = 0;

export function startPan() {
  startImageX = imageViewer.centreX;
  startImageY = imageViewer.centreY;
}

export function updatePan(pointer) {
  let [panX, panY] = pointer.diff;
  panX = Math.max(Math.min(startImageX + panX, window.innerWidth * imageViewer.currentScale / 2), -window.innerWidth * imageViewer.currentScale / 2);
  panY = Math.max(Math.min(startImageY + panY, window.innerHeight * imageViewer.currentScale / 2), -window.innerHeight * imageViewer.currentScale / 2);
  [imageViewer.centreX, imageViewer.centreY] = [panX, panY];

  const translateStr = "translate(" + panX + "px, " + panY + "px)";
  const scaleStr = "scale(" + imageViewer.currentScale + ")";

  imageViewer.image.style.transform = translateStr + " " + scaleStr;
}

export function endPan() {
  imageStartCentre = [startImageX, startImageY] = [imageViewer.centreX, imageViewer.centreY];
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