'use babel';
const { Emitter, Disposable, CompositeDisposable, File } = require('atom')
const renderer = require('./renderer')
export default class AtomObservableView {

  constructor ({ editorId, filePath }) {
    // Create root element
    this.editorId = editorId
    this.filePath = filePath
    this.element = document.createElement('div')
    this.element.classList.add('atom-observable')
    this.element.tabIndex = -1
    this.element.innerText ='pls change...'
    this.emitter = new Emitter()
    this.loaded = false
    this.disposables = new CompositeDisposable()
    if (this.editorId != null) {
      this.resolveEditor(this.editorId)
    }
    this.subscribeToFilePath(this.filePath)
    }

    editorForId (editorId) {
        for (const editor of atom.workspace.getTextEditors()) {
          if (editor.id != null && editor.id.toString() === editorId.toString()) {
            return editor
          }
        }
        return null
      }

    resolveEditor (editorId) {
      const resolve = () => {
        this.editor = this.editorForId(editorId)

        if (this.editor != null) {
          this.emitter.emit('did-change-title')
          this.disposables.add(
            this.editor.onDidDestroy(() =>
              this.subscribeToFilePath(this.getPath())
            )
          )
        } else {
          this.subscribeToFilePath(this.filePath)
        }
      };

      if (atom.packages.hasActivatedInitialPackages()) {
        resolve()
      } else {
        this.disposables.add(atom.packages.onDidActivateInitialPackages(resolve))
      }
    }

  // Returns an object that can be retrieved when package is activated
  serialize () {
      return {
        deserializer: 'AtomObservableView',
        filePath: this.getPath() != null ? this.getPath() : this.filePath,
        editorId: this.editorId
      }
    }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
  getTitle () {
   if (this.file != null && this.getPath() != null) {
     return `${path.basename(this.getPath())} Preview`
   } else if (this.editor != null) {
     return `${this.editor.getTitle()} Preview`
   } else {
     return 'Atom Observable'
   }
 }

  subscribeToFilePath (filePath) {
    console.log('subbed...')
    this.file = new File(filePath)
    this.emitter.emit('did-change-title')
    this.disposables.add(
      this.file.onDidRename(() => this.emitter.emit('did-change-title'))
    )
    return this.getFileSource()
    .then( text=>{
      const { scrollTop } = this.element

      const domFragment = renderer.toDOMFragment(
        text,
        this.getPath(),
      )
      console.log('plz')
      this.loading = false
      this.loaded = true
      this.element.textContent = ''
      this.element.appendChild(domFragment)
      this.emitter.emit('did-change-markdown')
      this.element.scrollTop = scrollTop
      console.log(domFragment, this.element)
    })
  }
  getFileSource () {
  console.log(this.file, this.file.getPath())
   if (this.file && this.file.getPath()) {
     return this.file
       .read()
       .then(source => {
         if (source === null) {
           return Promise.reject(
             new Error(`${this.file.getBaseName()} could not be found`)
           )
         } else {
           return Promise.resolve(source)
         }
       })
       .catch(reason => Promise.reject(reason))
   } else if (this.editor != null) {
     return Promise.resolve(this.editor.getText())
   } else {
     return Promise.reject(new Error('No editor found'))
   }
 }
  getURI () {
    if (this.file != null) {
      return `atom-observable://${this.getPath()}`
    } else {
      return `atom-observable://editor/${this.editorId}`
    }
  }
  getPath () {
    if (this.file != null) {
      return this.file.getPath()
    } else if (this.editor != null) {
      return this.editor.getPath()
    }
  }
  showError (result) {
    this.element.textContent = ''
    const h2 = document.createElement('h2')
    h2.textContent = 'Previewing Markdown Failed'
    this.element.appendChild(h2)
    if (result) {
      const h3 = document.createElement('h3')
      h3.textContent = result.message
      this.element.appendChild(h3)
    }
  }



  showLoading () {
    this.loading = true
    this.element.textContent = ''
    const div = document.createElement('div')
    div.classList.add('markdown-spinner')
    div.textContent = 'Loading Markdown\u2026'
    this.element.appendChild(div)
  }


}
