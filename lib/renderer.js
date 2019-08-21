const render = function (text) {
  const template = document.createElement('template')
  template.innerHTML = `<p>yee <b>haw</b>${text}</p>`
  const fragment = template.content.cloneNode(true)
  return fragment
}

exports.toDOMFragment = function (text, filePath, callback) {
  const domFragment = render(text, filePath)
  return domFragment
}
