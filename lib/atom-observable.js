"use babel";

import AtomObservableView from "./atom-observable-view";
import { CompositeDisposable } from "atom";
import { allowUnsafeEval } from "loophole";

const isAtomObservableView = function(object) {
  return object instanceof AtomObservableView;
};

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "atom-observable:toggle": () => this.toggle()
      })
    );
    this.subscriptions.add(
      atom.workspace.addOpener(uriToOpen => {
        let [protocol, path] = uriToOpen.split("://");
        if (protocol !== "atom-observable") {
          return;
        }

        try {
          path = decodeURI(path);
        } catch (error) {
          return;
        }

        if (path.startsWith("editor/")) {
          return this.createAtomObservableView({ editorId: path.substring(7) });
        } else {
          return this.createAtomObservableView({ filePath: path });
        }
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
  },

  createAtomObservableView(state) {
    if (state.editorId || fs.isFileSync(state.filePath)) {
      return new AtomObservableView(state);
    }
  },
  toggle() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }

    if (!this.removePreviewForEditor(editor)) {
      return this.addPreviewForEditor(editor);
    }
  },
  uriForEditor(editor) {
    return `atom-observable://editor/${editor.id}`;
  },

  removePreviewForEditor(editor) {
    const uri = this.uriForEditor(editor);
    const previewPane = atom.workspace.paneForURI(uri);
    if (previewPane != null) {
      previewPane.destroyItem(previewPane.itemForURI(uri));
      return true;
    } else {
      return false;
    }
  },

  addPreviewForEditor(editor) {
    const uri = this.uriForEditor(editor);
    const previousActivePane = atom.workspace.getActivePane();
    const options = { searchAllPanes: true };
    return atom.workspace.open(uri, options).then(function(AtomObservableView) {
      if (isAtomObservableView(AtomObservableView)) {
        previousActivePane.activate();
      }
    });
  }
};
