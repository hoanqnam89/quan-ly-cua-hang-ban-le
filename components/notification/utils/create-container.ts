// notify/createContainer/index.js
import styles from "./style.module.css";

export default function createContainer(): HTMLElement {
  const portalId: string = "notifyContainer";
  let element: HTMLElement | null = document.getElementById(portalId);

  if (element) {
    return element;
  }

  element = document.createElement("div");
  element.setAttribute("id", portalId);
  element.className = styles.container;
  document.body.appendChild(element);
  return element;
}
