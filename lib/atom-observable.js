'use babel';

import AtomObservableView from './atom-observable-view';
import { CompositeDisposable } from 'atom';

export default {

  atomObservableView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomObservableView = new AtomObservableView(state.atomObservableViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomObservableView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-observable:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomObservableView.destroy();
  },

  serialize() {
    return {
      atomObservableViewState: this.atomObservableView.serialize()
    };
  },

  toggle() {
    console.log('toggled');
    const editor = atom.workspace.getActiveTextEditor()
    if (editor == null) {
      return
    }

    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }


};
