import { renderNotebook } from "./render";
const main = document.querySelector("#main");

window.addEventListener(
  "message",
  e => {
    if (e.origin !== "file://") {
      return;
    }
    const nbElement = renderNotebook(e.data);
    main.appendChild(nbElement);
  },
  false
);
