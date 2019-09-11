"use babel";
const { Emitter, Disposable, CompositeDisposable, File } = require("atom");
const { join } = require("path");

const viewerSrc = `file://${join(__dirname, "viewer", "index.html")}`;

export default class AtomObservableView {
  constructor({ editorId, filePath }) {
    // Create root element
    this.editorId = editorId;
    this.filePath = filePath;

    this.element = document.createElement("div");
    this.element.classList.add("atom-observable");
    this.element.tabIndex = -1;

    this.output = document.createElement("div");
    this.output.classList.add("output");

    this.element.appendChild(this.output);

    this.iframe = document.createElement("iframe");
    this.iframe.style =
      "width: 100%; height: 100%; background-color: white; overflow: hidden;";
    this.iframe.src = viewerSrc;
    this.element.appendChild(this.iframe);

    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();

    if (this.editorId == null) {
      console.error("what how, editorId is null");
    }
    this.editor = this.editorForId(editorId);
    this.disposables.add(
      this.editor.onDidSave(() => {
        this.reloadNotebookViewer(this.filePath);
      })
    );
    this.reloadNotebookViewer(this.filePath);
  }

  editorForId(editorId) {
    for (const editor of atom.workspace.getTextEditors()) {
      if (editor.id != null && editor.id.toString() === editorId.toString()) {
        return editor;
      }
    }
    return null;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      deserializer: "AtomObservableView",
      filePath: this.getPath() != null ? this.getPath() : this.filePath,
      editorId: this.editorId
    };
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
  getTitle() {
    if (this.file != null && this.getPath() != null) {
      return `${path.basename(this.getPath())} Preview`;
    } else if (this.editor != null) {
      return `${this.editor.getTitle()} Preview`;
    } else {
      return "Atom Observable";
    }
  }

  reloadNotebookViewer(filePath) {
    this.file = new File(filePath);
    return this.getFileSource().then(text => {
      this.iframe.src = "";
      this.iframe.src = viewerSrc;
      new Promise((res, rej) => {
        this.iframe.onload = e => res();
        this.iframe.onerror = e => rej(e);
      }).then(() => {
        const iframeWindow = this.iframe.contentWindow;
        iframeWindow.postMessage(text, "file://");
      });
    });
  }
  getFileSource() {
    if (this.file && this.file.getPath()) {
      return this.file
        .read()
        .then(source => {
          if (source === null) {
            return Promise.reject(
              new Error(`${this.file.getBaseName()} could not be found`)
            );
          } else {
            return Promise.resolve(source);
          }
        })
        .catch(reason => Promise.reject(reason));
    } else if (this.editor != null) {
      return Promise.resolve(this.editor.getText());
    } else {
      return Promise.reject(new Error("No editor found"));
    }
  }
  getURI() {
    if (this.file != null) {
      return `atom-observable://${this.getPath()}`;
    } else {
      return `atom-observable://editor/${this.editorId}`;
    }
  }
  getPath() {
    if (this.file != null) {
      return this.file.getPath();
    } else if (this.editor != null) {
      return this.editor.getPath();
    }
  }
  showError(result) {
    this.output.textContent = "";
    const h2 = document.createElement("h2");
    h2.textContent = "Previewing Markdown Failed";
    this.output.appendChild(h2);
    if (result) {
      const h3 = document.createElement("h3");
      h3.textContent = result.message;
      this.output.appendChild(h3);
    }
  }

  showLoading() {
    this.output.textContent = "";
    const div = document.createElement("div");
    div.classList.add("markdown-spinner");
    div.textContent = "Loading Markdown\u2026";
    this.output.appendChild(div);
  }
}
