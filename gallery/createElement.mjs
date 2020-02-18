export function createElement(type = "", className, innerHTML) {
  const element = document.createElement(type);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}