import { Runtime, Inspector } from "@observablehq/runtime";
import { Compiler } from "./observable-compile";

const render = function(text) {
  const template = document.createElement("div");
  const root = document.createElement("div");
  template.appendChild(root);

  const compile = new Compiler(async path => {
    const m = await import(`https://api.observablehq.com/${path}.js?v=3`);
    return m.default;
  });
  const define = compile.module(text);
  const rt = new Runtime();
  rt.module(define, Inspector.into(root));
  return template;
};

export function toDOMFragment(text) {
  const domFragment = render(text);
  return domFragment;
}
