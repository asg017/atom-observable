const parser = require('@observablehq/parser');

const render = function (text) {
  const template = document.createElement('template')
  const module = parser.parseModule(text);
  template.innerHTML = `<div>
${module.cells.map(cell=>`<div>
<pre><code>${JSON.stringify(cell)}</pre></code>
  </div>`).join('\n')}
  </div>`

  const fragment = template.content.cloneNode(true)
  return fragment
}

exports.toDOMFragment = function (text, filePath, callback) {
  const domFragment = render(text, filePath)
  return domFragment
}
