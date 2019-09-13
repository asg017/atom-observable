import { Runtime, Inspector } from "@observablehq/runtime";
import compiler from "@alex.garcia/unofficial-observablehq-compiler";

const render = function(text) {
  const root = document.createElement("div");

  const compile = new compiler.Compiler();
  const define = compile.module(text);
  const rt = new Runtime();
  rt.module(define, Inspector.into(root));
  return root;
};

export function renderNotebook(text) {
  const domFragment = render(text);
  return domFragment;
}
