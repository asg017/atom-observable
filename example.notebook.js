md`# Hello, unoffical-atom-observable!`

md`This is an example Observable notebook that can
be ran inside of Atom!`

md`\`unofficial-atom-observable\` is an Atom package
that gives a preview to any local Observable notebook
that you have.`


md`Take this file - it's a typical Javascript file
(with [Observable syntax](https://observablehq.com/@observablehq/observables-not-javascript)).
It's saved to my computer as \`example.notebook.js\`.
Just like any other file, I can open it in Atom -
and with \`unofficial-atom-observable\`, I can press
\`Ctrl+Alt+O\` and a new preview window will pop up -
with a fully fledged rendered notebook!`

md`Nearly all Observable syntax will work - including
normal javascript. For example:`

md`3 + 4 = ${3 + 4}`

md`"xyz" in base64 = ${btoa("xyz")}`


{
  let i = 1;
  while(i) {
    yield Promises.tick(100, ++i);
  }
}

md`Just like on the Observable site, \`require\` can be used to
import thousands of javascript packages available on npm:`

d3 = require('d3')

data = d3.csv("https://gist.githubusercontent.com/mbostock/4063570/raw/11847750012dfe5351ee1eb290d2a254a67051d0/flare.csv")

simpleStatistics = require("simple-statistics")

simpleStatistics.standardDeviation([1, 2, 3])

md`Not only that - you can also import any public
or shared notebook that's on observablehq.com! `

import {textarea} from '@jashkenas/inputs'

viewof x = textarea("Woah, this using Jeremy's inputs library!")


import {ramp} from "@mbostock/color-ramp"

ramp(t => `hsl(${t * 360}, 100%, 50%)`)

import {map} from "@d3/interrupted-sinu-mollweide"

map

md`You can also inject values into imported notebooks - `

import {slider} from '@jashkenas/inputs'

viewof height = slider({min:100, max:600, value:200})

import {canvas} with {height} from "@mbostock/connected-particles-iii"

html`${canvas}`

md`Playing with Observable stdlib works well, too!`

html`<div style="color:white;height: 40px; background-image: linear-gradient(to right, blue, yellow);">yay`

html`<img src="https://images.dog.ceo/breeds/dhole/n02115913_4117.jpg" width="200">`


md`## Caveats
- Code for the notebook isn't shown in rendered output - just the output cells.
- The entire notebook refreshing when you save the source file - so development
is a little cumbersome and slow.
- observablehq.com specific features don't exist (Secrets, DBClient, suggestions,
teams, etc.)
- CSS inside the rendered notebook is a little messy still
- Syntax highlighting in markdown components don't work
-

\`unofficial-atom-observable\` isn't complete yet.
Here's some stuff that needs more development:

☐ mutable probably doesn't work

☐ importing viewof probably doesn't work

Here are some cool features to work on in the future:

- Access your computer's environment variables with a new stdlib builtin (e.g. \`env.get('API_TOKEN')\`)
- Access your computer's files (e.g. \`d3.csv("file://path/to/file")\`)
- Importing other local javascript notebooks as modules
- Atom syntax highlighting for Observable syntax (viewof, mutable, cell blocks, etc.)
- Linter/prettier for Observable syntax

`
