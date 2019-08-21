const parser = require('@observablehq/parser');
const runtime = require('@observablehq/runtime');

console.log(runtime)
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
const GeneratorFunction = Object.getPrototypeOf(function*() {}).constructor;
const AsyncGeneratorFunction = Object.getPrototypeOf(async function*() {})
  .constructor;

const defineCell = (cell) => {
  let name = null;
  if (cell.id && cell.id.name)
    name = cell.id.name;
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
}
const createDefine = (observableModule) => {
  return async function(runtime, observer) {
    const main = runtime.module();
    observableModule.cells.map(cell=>{
      if(cell.body.type === 'ImportDeclaration') {
        console.warn(`WARNING import declartion won't work yet`);
      }
      const { cellName, cellFunction, cellReferences } = defineCell(cell);
      main
        .variable(observer(cellName))
        .define(
          cellName,
          cellReferences,
          cellFunction
        );
    })
  }
}

const render = function (text) {
  const template = document.createElement('div')
  const root = document.createElement('div')
  const style = document.createElement('style')
style.innerHTML = `:root{--syntax_normal:#1b1e23;--syntax_comment:#a9b0bc;--syntax_number:#20a5ba;--syntax_keyword:#c30771;--syntax_atom:#10a778;--syntax_string:#008ec4;--syntax_error:#ffbedc;--syntax_unknown_variable:#838383;--syntax_known_variable:#005f87;--syntax_matchbracket:#20bbfc;--syntax_key:#6636b4;--mono_fonts:82%/1.5 Menlo,Consolas,monospace}.observablehq--collapsed,.observablehq--expanded,.observablehq--function,.observablehq--gray,.observablehq--import,.observablehq--string:after,.observablehq--string:before{color:var(--syntax_normal)}.observablehq--collapsed,.observablehq--inspect a{cursor:pointer}.observablehq--field{text-indent:-1em;margin-left:1em}.observablehq--empty{color:var(--syntax_comment)}.observablehq--blue,.observablehq--keyword{color:#3182bd}.observablehq--forbidden,.observablehq--pink{color:#e377c2}.observablehq--orange{color:#e6550d}.observablehq--boolean,.observablehq--null,.observablehq--undefined{color:var(--syntax_atom)}.observablehq--bigint,.observablehq--date,.observablehq--green,.observablehq--number,.observablehq--regexp,.observablehq--symbol{color:var(--syntax_number)}.observablehq--index,.observablehq--key{color:var(--syntax_key)}.observablehq--empty{font-style:oblique}.observablehq--purple,.observablehq--string{color:var(--syntax_string)}.observablehq--error,.observablehq--red{color:#e7040f}.observablehq--inspect{font:var(--mono_fonts);overflow-x:auto;display:block;white-space:pre}.observablehq--error .observablehq--inspect{word-break:break-all;white-space:pre-wrap}`
  template.appendChild(style);
  template.appendChild(root);

  const observableModule = parser.parseModule(text);
  const define = createDefine(observableModule);
  const rt = new runtime.Runtime();
  rt.module(define, runtime.Inspector.into(root))
  /*template.innerHTML = `<div>
${observableModule.cells.map(cell=>`<div>
<pre><code>${JSON.stringify(cell)}</pre></code>
  </div>`).join('\n')}
  </div>`*/

  //const fragment = template.content.cloneNode(true)
  return template
}

exports.toDOMFragment = function (text, filePath, callback) {
  const domFragment = render(text, filePath)
  return domFragment
}
