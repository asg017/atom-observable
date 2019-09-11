import { toDOMFragment } from "./renderer";

const main = document.querySelector("#main");

console.log("in iframe,");
window.addEventListener(
  "message",
  e => {
    console.log("message", e, e.origin);
    if (e.origin !== "file://") {
      return;
    }
    const fragment = toDOMFragment(e.data);
    main.appendChild(fragment);
  },
  false
);
