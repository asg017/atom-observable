import { parseModule } from "@observablehq/parser";
import { Runtime, Library, Inspector } from "@observablehq/runtime";

const { Generators } = new Library();

const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
const GeneratorFunction = Object.getPrototypeOf(function*() {}).constructor;
const AsyncGeneratorFunction = Object.getPrototypeOf(async function*() {})
  .constructor;

const defineCell = cell => {
  let name = null;
  if (cell.id && cell.id.name) name = cell.id.name;
  else if (cell.id && cell.id.id && cell.id.id.name) name = cell.id.id.name;
  const bodyText = cell.input.substring(cell.body.start, cell.body.end);
  let code;
  if (cell.body.type !== "BlockStatement") {
    if (cell.async)
      code = `return (async function(){ return (${bodyText});})()`;
    else code = `return (function(){ return (${bodyText});})()`;
  } else code = bodyText;
  const references = (cell.references || []).map(ref => {
    if (ref.type === "ViewExpression") throw Error("ViewExpression wat");
    return ref.name;
  });

  let f;

  if (cell.generator && cell.async)
    f = new AsyncGeneratorFunction(...references, code);
  else if (cell.async) f = new AsyncFunction(...references, code);
  else if (cell.generator) f = new GeneratorFunction(...references, code);
  else f = new Function(...references, code);
  return {
    cellName: name,
    cellFunction: f,
    cellReferences: references
  };
};
const createDefine = observableModule => {
  return async function(runtime, observer) {
    const main = runtime.module();
    observableModule.cells.map(cell => {
      if (cell.body.type === "ImportDeclaration") {
        console.warn(`WARNING import declartion won't work yet`);
        return;
      }
      const { cellName, cellFunction, cellReferences } = defineCell(cell);
      if (cell.id && cell.id.type === "ViewExpression") {
        const reference = `viewof ${cellName}`;
        console.log(reference, cellName, Generators.input);
        main
          .variable(observer(reference))
          .define(reference, cellReferences, cellFunction);

        main
          .variable(observer(cellName))
          .define(cellName, [reference], Generators.input);
      } else {
        main
          .variable(observer(cellName))
          .define(cellName, cellReferences, cellFunction);
      }
    });
  };
};

const render = function(text) {
  const template = document.createElement("div");
  const root = document.createElement("div");
  template.appendChild(root);

  const observableModule = parseModule(text);
  const define = createDefine(observableModule);
  const rt = new Runtime();
  rt.module(define, Inspector.into(root));
  return template;
};

export function toDOMFragment(text, filePath, callback) {
  const domFragment = render(text, filePath);
  return domFragment;
}
