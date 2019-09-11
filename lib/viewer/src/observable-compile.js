import { parseCell, parseModule } from "@observablehq/parser";
import { Library } from "@observablehq/runtime";

const { Generators } = new Library();

const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
const GeneratorFunction = Object.getPrototypeOf(function*() {}).constructor;
const AsyncGeneratorFunction = Object.getPrototypeOf(async function*() {})
  .constructor;

const createImportCellDefintion = async (cell, resolveModule) => {
  const source = cell.body.source.value;
  const from = await resolveModule(source);
  const names = cell.body.specifiers.map(specifier => specifier.imported.name);
  const aliases = cell.body.specifiers.map(specifier => specifier.local.name);
  return { names, aliases, from };
};
const createRegularCellDefintion = cell => {
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
const createModuleDefintion = (m, resolveModule) => {
  return async function define(runtime, observer) {
    const { cells } = m;
    const main = runtime.module();

    const cellsPromise = cells.map(async cell => {
      if (cell.body.type === "ImportDeclaration") {
        const { names, aliases, from } = await createImportCellDefintion(
          cell,
          resolveModule
        ).catch(err => {
          throw Error("Error defining import cell", err);
        });
        const childNames = [];
        const child = runtime.module(from, name => {
          childNames.push(name);
          return true;
        });
        for (let i = 0; i < names.length; i++) {
          main.import(names[i], aliases[i], child);
        }
        main.variable(observer()).define(
          null,
          ["md"],
          md => md`~~~javascript
    import {${names.join(",")}} from "${cell.body.source.value}"
        ~~~`
        );
      } else {
        const {
          cellName,
          cellFunction,
          cellReferences
        } = createRegularCellDefintion(cell);
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
      }
    });

    await Promise.all(cellsPromise);
  };
};

export class Compiler {
  constructor(resolve) {
    this.resolve = resolve;
  }
  cell(text) {
    throw Errror(`compile.cell not implemented yet`);
  }
  module(text) {
    const m1 = parseModule(text);
    return createModuleDefintion(m1, this.resolve);
  }
}

/*

compile = new Compiler(
  resolve: path => fetch(`https://api.observablehq.com/${path}.js?v=3`).then(res=>res.text())
)

define = compile.module(`
a = 4

b = 3

c = a + b
`)

*/
