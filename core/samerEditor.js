//formats
import boldFormat from '../formats/bold';
import italicFormat from '../formats/italic';
import underlineFormat from '../formats/underline';
import strikeFormat from '../formats/strike';
import undoFormat from '../formats/undo';
import redoFormat from '../formats/redo';
import headerFormat from '../formats/header';
//Helper Functions
import {
  insertAfter,
  debounce,
  getDeepestChild,
  focusLastTimeFocusedNode
} from '../utils/helperFunctions.js';
/**
 * SamerEditor - A rich text editor class.
 * @param {string} query - The query selector of the editor container.
 * @param {Object} options - Configuration options for the editor.
 */
export default class SamerEditor {
  constructor(
    query,
    options = {
      modules: {
        syntax: true,
        toolbar: { container: null, options: [] },
        shortKeys: {},
      },
      theme: 'light',
    }
  ) {

    //formats
    this._boldFormat = new boldFormat(this);
    this._italicFormat = new italicFormat(this);
    this._underlineFormat = new underlineFormat(this);
    this._strikeFormat = new strikeFormat(this);
    this._undoFormat = new undoFormat(this);
    this._redoFormat = new redoFormat(this);
    this._headerFormat = new headerFormat(this);
  
    //editor
    this.editor = document.querySelector(query);
    this.editor.className = 'samerEditor-editor';
    if (this.editor.children.length === 0)
      this.editor.innerHTML = `<p style="margin:0;padding:0"><span style="font-size: 1.5em;"><br></span></p>`;
    this.editor.setAttribute('contenteditable', 'true');
    this.editor.setAttribute('spellcheck', options.modules.syntax);
   //toolbar
    this.toolbar = document.querySelector(options.modules.toolbar.container);
    this.toolbar.className = `samerEditor-toolbar theme-${options.theme}`;
    this._buildToolbar(options.modules.toolbar.options || []);
   //bla bla
    this._shortKeys = options.modules.shortKeys;
    this._selection = window.getSelection();
    this._newCreatedNode = null;
    this._focusedLineNode = this.editor.lastElementChild;
    this._focusedNode = this._focusedLineNode.lastElementChild;
    this._focusedTextNode = this._focusedNode.childNodes[0];
    this._focusedOffset = 0;
    this._lineNodenames = ['P', 'OL', 'UL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    this._initEditor.bind(this)();
  }

  _initEditor() {
    this.editor.onclick = () => {
      this._updateFocusedNodes();
      this._toolbarButtonsHighligthHandler();
    };
    this.editor.onkeydown = this._editorKeyDownHandler.bind(this);
    this.editor.onkeyup = this._updateFocusedNodes.bind(this);
    this.editor.oninput = this._editorInputHandler.bind(this);
    this.editor.onpaste = this._pasteHandler.bind(this);

    //fn for updating the mementos
    this._updateMementos = debounce(() => {
      if (!this._mementos.includes(this.editor.innerHTML)) {
        this._mementos.push(this.editor.innerHTML);
        this._mementoIndex += 1;
        this._redoUndoDisableHandler();
      }
    }, 300);
    this._redoUndoDisableHandler();
  }

  _insertNewCreatedNode() {
    // splitted left right text
    const leftText = this._focusedNode.textContent.substring(
      0,
      this._selection.focusOffset - 1
    );
    const rightText = this._focusedNode.textContent.substring(
      this._selection.focusOffset
    );

    //spliting and inserting new nodes

    let leftNode = null;
    if (leftText.length > 0) {
      leftNode = document.createElement(this._focusedNode.nodeName);
      leftNode.innerHTML = this._focusedNode.innerHTML;
      leftNode.style.cssText = this._focusedNode.style.cssText;
      getDeepestChild(leftNode).textContent = leftText;
    }
    let rightNode = null;
    if (rightText.length > 0) {
      rightNode = document.createElement(this._focusedNode.nodeName);
      rightNode.innerHTML = this._focusedNode.innerHTML;

      rightNode.style.cssText = this._focusedNode.style.cssText;
      getDeepestChild(rightNode).textContent = rightText;
    }

    if (rightNode !== null) {
      this._focusedLineNode.insertBefore(rightNode, this._focusedNode);
      this._focusedLineNode.insertBefore(this._newCreatedNode, rightNode);
    } else {
      this._focusedLineNode.insertBefore(
        this._newCreatedNode,
        this._focusedNode
      );
    }

    if (leftNode !== null) {
      this._focusedLineNode.insertBefore(leftNode, this._newCreatedNode);
    }

    const deepestChild = getDeepestChild(this._newCreatedNode);
    deepestChild.innerHTML =
      this._focusedNode.textContent[this._selection.focusOffset - 1] || '<br>';

    this._focusedLineNode.removeChild(this._focusedNode);

    this._focusedNode = this._newCreatedNode;
    this._focusedTextNode = deepestChild.childNodes[0];
    this._focusedOffset = 0;
    const range = this._selection.getRangeAt(0);
    range.setStartAfter(this._newCreatedNode);
    range.setEndAfter(this._newCreatedNode);
    this._selection.removeAllRanges();
    this._selection.addRange(range);
    this._newCreatedNode = null;
    this._toolbarButtonsHighligthHandler();
  }

  //handlers for editor
  _editorKeyDownHandler(e) {
    //checking for shortKeys
    const obj = this._shortKeys[e.key]
    if (obj && obj.ctrlKey === e.ctrlKey && obj.shiftKey === e.shiftKey) {
      e.preventDefault();
      obj.handler()
    } //checking if key == enter then create new line
    else if (e.key === 'Enter') {
      e.preventDefault();
      this._createNewLine();
    } else this._toolbarButtonsHighligthHandler();
  }

  _editorInputHandler() {
    if (this._newCreatedNode !== null) {
      this._insertNewCreatedNode();
    }

    if (this._mementos !== undefined) {
      this._mementos.splice(this._mementoIndex + 1);
      this._updateMementos();
    }
  }
  _createNewLine() {
    const p = document.createElement(this._focusedLineNode.nodeName);
    p.style.cssText = 'margin:0;padding:0;';
    // store the content of focused node "txt"
    const txt = this._focusedNode.textContent.substring(this._focusedOffset);
    // creating a new node by coping the focused node
    const newNode = document.createElement(this._focusedNode.nodeName);
    newNode.style.cssText = this._focusedNode.style.cssText;
    newNode.innerHTML = this._focusedNode.innerHTML;
    getDeepestChild(newNode).textContent =
      this._focusedNode.textContent.substring(0, this._focusedOffset);
    //inserting the new node before to the "focusedNode"

    if (this._focusedLineNode.contains(this._focusedNode))
      this._focusedLineNode.insertBefore(newNode, this._focusedNode);
    else {
      return 0;
    }

    // Removing all the childNodes of "focusedLineNode" which was right side of focusedNode

    let startIndex = Array.from(this._focusedLineNode.children).indexOf(
      this._focusedNode
    );

    while (startIndex !== this._focusedLineNode.children.length) {
      p.innerHTML += this._focusedLineNode.children[startIndex].outerHTML;
      this._focusedLineNode.removeChild(
        this._focusedLineNode.children[startIndex]
      );
    }
    // Base oparation
    getDeepestChild(this._focusedLineNode.lastElementChild).innerHTML +=
      '<br>';
    getDeepestChild(p.firstElementChild).textContent = txt;
    getDeepestChild(p.firstElementChild).innerHTML += '<br>';

    //inserting the line and updating old focused nodes and lines
    insertAfter(p, this._focusedLineNode, this.editor);

    this._focusedLineNode = p;
    this._focusedNode = p.firstElementChild;
    this._focusedTextNode = p.firstElementChild.childNodes[0];
    this._focusedOffset = 0;

    const range = this._selection.getRangeAt(0);
    range.setStartBefore(p.firstElementChild);
    range.setEndBefore(p.firstElementChild);
    this._selection.removeAllRanges();
    this._selection.addRange(range);

    this._updateMementos();
  }
  // this function will update the focused node,line,textNode
  _updateFocusedNodes() {
    if (
      this.editor !== this._selection.focusNode &&
      this.editor.contains(this._selection.focusNode)
    ) {
      //updating old focused offset
      this._focusedOffset = this._selection.focusOffset;
      //updating the last time focused line  node
      if (this._selection.focusNode !== this.editor) {
        let current = this._selection.focusNode;
        while (current.parentElement !== this.editor) {
          current = current.parentElement;
        }
        this._focusedLineNode = current;
      }
      //updating the last time focused node
      if (
        this.editor.contains(this._selection.focusNode) &&
        !this._lineNodenames.includes(this._selection.focusNode.nodeName)
      ) {
        let current = this._selection.focusNode;
        while (!this._lineNodenames.includes(current.parentElement.nodeName)) {
          current = current.parentElement;
        }
        this._focusedNode = current;
      }

      //updating the last time focused Text Node
      if (this._selection.focusNode.nodeName === '#text') {
        this._focusedTextNode = this._selection.focusNode;
      }
    }
  }
  //this function will build the entire toolbar and the formatting buttons
  _buildToolbar(arr) {
    for (const formats of arr) {
      const currentformats = document.createElement('span');
      currentformats.className = 'samerEditor-formats';
      for (const item of formats) {
        const name = typeof item === 'object' ? Object.keys(item)[0] : item;
        const formatter = this[`_${name}Format`];
        if (formatter !== undefined) {
          currentformats.appendChild(formatter.createButton(item));
        } else {
          console.warn(`No formats found: '${name}'`);
        }
        if (currentformats.children.length > 0)
          this.toolbar.appendChild(currentformats);
      }
    }
    return toolbar;
  }

  //format text at user’s current selection
  format(name,value){
    this[`_${name}Format`].click(value)
  }
  //this function will  disable / able the undo - redo button
  _redoUndoDisableHandler() {
    if (this._mementoIndex === 0) {
      for (const button of this._undoFormat.createdButtons)
        button.setAttribute('disabled', 'true');
    } else {
      for (const button of this._undoFormat.createdButtons)
        button.removeAttribute('disabled');
    }

    if (this._mementoIndex >= this._mementos.length - 1) {
      for (const button of this._redoFormat.createdButtons)
        button.setAttribute('disabled', 'true');
    } else {
      for (const button of this._redoFormat.createdButtons)
        button.removeAttribute('disabled');
    }
  }
 //handler for paste
 _pasteHandler(e) {
  e.preventDefault();
  const data = e.clipboardData.getData('text/plain')
  this._focusedNode.textContent = this._focusedNode.textContent.slice(0,this._selection.focusOffset) + data + this._focusedNode.textContent.slice(this._selection.focusOffset)
  this._focusedTextNode =  this._focusedNode.childNodes[0]
  this._focusedOffset += data.length
  focusLastTimeFocusedNode(this)
}
  
  //function for highliting active buttons
  _toolbarButtonsHighligthHandler() {
    this._boldFormat.highlight();
    this._italicFormat.highlight();
    this._underlineFormat.highlight();
    this._strikeFormat.highlight();
    this._headerFormat.highlight();
  }
 
 
}
