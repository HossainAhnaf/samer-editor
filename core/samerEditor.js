/**
 * SamerEditor - A rich text editor class.
 * @param {string} query - The query selector of the editor container.
 * @param {Object} options - Configuration options for the editor.
 * @param {number} options.width - The initial width of the editor.
 * @param {number} options.height - The initial height of the editor.
 */
class SamerEditor {
  constructor(query, options = { modules: {syntax: true,toolbar:{container:null,options:[]}},  theme: 'light' }
  ) {
    this._samerEditorButtons = {
      toggleType: {
        bold: {
          html: '<b>B</b>',
          value: '<br>',
          nodeName: 'B',
          className: `samerEditor-bold toggleType`
        },
        italic: {
          html: '<em>I</em>',
          value: '<br/>',
          nodeName: 'EM',
          className: `samerEditor-italic toggleType`
        },
        underline: {
          html: '<u>U</u>',
          value: '<br/>',
          nodeName: 'U',
          className: `samerEditor-underline toggleType`
        },
        strike: {
          html: '<s>S</s>',
          value: '<br/>',
          nodeName: 'S',
          className: `samerEditor-stike toggleType`
        },

        //TODO
        // list: {
        //   html: {
        //     ordered: ``,
        //     bullet:``
        //   },
        //   value: ['<ol></ol>', '<ul></ul>'],
        //   
        // },
        // future update
        // code: {
        //   html: '',
        //   value: '',
        //   
        // },
      },
     defaultType:{
       undo:{
        html:`
        <svg viewBox="0 0 48 48" fill="none">
        <rect  fill="white" fill-opacity="0.01"/>
        <path style="stroke-width: 5;" class="samerEditor-stroke" d="M11.2721 36.7279C14.5294 39.9853 19.0294 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C19.0294 6 14.5294 8.01472 11.2721 11.2721C9.61407 12.9301 6 17 6 17" />
        <path style="stroke-width: 4;" class="samerEditor-stroke" d="M6 9V17H14"  stroke-width="4" />
        </svg>
        `,
        className:'samerEditor-undo samerEditor-svgParent defaultType'  
       },
       redo:{
        html:`
        <svg   viewBox="0 0 48 48" fill="none">
        <rect  fill="white" fill-opacity="0.01"/>
        <path class="samerEditor-stroke" style="stroke-width: 5;" d="M36.7279 36.7279C33.4706 39.9853 28.9706 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C28.9706 6 33.4706 8.01472 36.7279 11.2721C38.3859 12.9301 42 17 42 17" />
        <path class="samerEditor-stroke" style="stroke-width: 5;" d="M42 8V17H33" />
        </svg>
        `,
        className:'samerEditor-redo samerEditor-svgParent defaultType'  
       }
     }

    };

    this.editor = document.querySelector(query);
    this.editor.className = 'samerEditor-editor';
   if (this.editor.children.length === 0) 
    this.editor.innerHTML = `<p style="margin:0;padding:0"><span style="font-size: 1.5em;"><br></span></p>`;
    this.editor.setAttribute('contenteditable', 'true');
     this.editor.setAttribute('spellcheck', options.modules.syntax);

    this.toolbar = document.querySelector(options.modules.toolbar.container)
    this.toolbar.className = `samerEditor-toolbar theme-${options.theme}`;
    this._buildToolbar(options.modules.toolbar.options || []);

  
   

    this._selection = window.getSelection();
    this._newCreatedNode = null;
    this._focusedLineNode = this.editor.lastElementChild;
    this._focusedNode = this._focusedLineNode.lastElementChild;
    this._focusedTextNode = this._focusedNode.childNodes[0];
    this._focusedOffset = 0;
    this._lineNodenames = ['P', 'OL', 'UL', 'H1', 'H2'];

  
    this._initEditor.bind(this)();
  }

  _initEditor() {
    this.editor.onkeyup = this._editorKeyUpHandler.bind(this);
    this.editor.onclick = () => {
      this._updateFocus.bind(this)();
      this._toolbarButtonsHighligthHandler();
    };

    this.editor.onkeydown = this._editorKeyDownHandler.bind(this);
    this.editor.oninput = this._editorInputHandler.bind(this);

      //fn for updating the mementos
     this._updateMementos = this._debounce(()=>{
     if (!this._mementos.includes(this.editor.innerHTML)){  
      this._mementos.push(this.editor.innerHTML)
      this._mementoIndex += 1
      this._redoUndoDisableHandler() 
     } 
     },300)
        
    
  }

  _buildToolbar(arr) {
    for (const formats of arr) {
      const currentformats = document.createElement('span');
      currentformats.className = 'samerEditor-formats';
      for (const item of formats) {
        let button = null
        if (item in this._samerEditorButtons.toggleType) {
           button = this._getToggleBtn(item);
        } else if (item in this._samerEditorButtons.defaultType) {
          button = this._getDefaultBtn(item);
        }
        // else if (item in samerEditorButtons.pickerType) {
        // } else if (item in samerEditorButtons.selectType) {
        // } else if (item in samerEditorButtons.fileType) {
        //}
       if(button !== null) 
        currentformats.appendChild(button);
      }

      this.toolbar.appendChild(currentformats);
    }
    return toolbar;
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
      this._getDeepestChild(leftNode).textContent = leftText;
    }
    let rightNode = null;
    if (rightText.length > 0) {
      rightNode = document.createElement(this._focusedNode.nodeName);
      rightNode.innerHTML = this._focusedNode.innerHTML;

      rightNode.style.cssText = this._focusedNode.style.cssText;
      this._getDeepestChild(rightNode).textContent = rightText;
    }

    if (rightNode !== null) {
      this._focusedLineNode.insertBefore(rightNode, this._focusedNode);
      this._focusedLineNode.insertBefore(this._newCreatedNode, rightNode);
    } else {
      this._focusedLineNode.insertBefore(this._newCreatedNode, this._focusedNode);
    }

    if (leftNode !== null) {
      this._focusedLineNode.insertBefore(leftNode, this._newCreatedNode);
    }

    const deepestChild = this._getDeepestChild(this._newCreatedNode);
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
  }

  //handlers for editor
  _editorKeyUpHandler() {
    this._updateFocus();
    this._toolbarButtonsHighligthHandler();
  }
  _editorKeyDownHandler(e) {
    //checking if key == enter then create new line
    if (e.key === 'Enter') {
      e.preventDefault();
      this._createNewLine()
    }
  }

  _editorInputHandler() {
    if (this._newCreatedNode !== null) {
      this._insertNewCreatedNode();
    }
    
    if (this._mementos !== undefined){
     this._updateMementos()
    }

  }
  _createNewLine(){
    const p = document.createElement('p');
    p.style.cssText = 'margin:0;padding:0;'
    // store the content of focused node "txt"
    const txt = this._focusedNode.textContent.substring(this._focusedOffset);
    // creating a new node by coping the focused node
    const newNode = document.createElement(this._focusedNode.nodeName);
    newNode.style.cssText = this._focusedNode.style.cssText;
    newNode.innerHTML = this._focusedNode.innerHTML;
    this._getDeepestChild(newNode).textContent =
      this._focusedNode.textContent.substring(0, this._focusedOffset);
    //inserting the new node before to the "focusedNode"

    if (this._focusedLineNode.contains(this._focusedNode))
      this._focusedLineNode.insertBefore(newNode, this._focusedNode);
    else {
      console.log(this._focusedNode);
      return 0;
    }

    // Removing all the childNodes of "focusedLineNode" which was right side of focusedNode
   
   let startIndex = Array.from(this._focusedLineNode.children).indexOf(this._focusedNode)
  
    while (startIndex !== this._focusedLineNode.children.length) {
      p.innerHTML += this._focusedLineNode.children[startIndex].outerHTML;
      this._focusedLineNode.removeChild(
        this._focusedLineNode.children[startIndex]
      );
    }
    // Base oparation
    this._getDeepestChild(this._focusedLineNode.lastElementChild).innerHTML +=
      '<br>';
    this._getDeepestChild(p.firstElementChild).textContent = txt;
    this._getDeepestChild(p.firstElementChild).innerHTML += '<br>';

    //inserting the line and updating old focused nodes and lines
    this._insertAfter(p, this._focusedLineNode, this.editor);

    this._focusedLineNode = p;
    this._focusedNode = p.firstElementChild;
    this._focusedTextNode = p.firstElementChild.childNodes[0];
    this._focusedOffset = 0;

    const range = this._selection.getRangeAt(0);
    range.setStartBefore(p.firstElementChild);
    range.setEndBefore(p.firstElementChild);
    this._selection.removeAllRanges();
    this._selection.addRange(range);
  }
  _updateFocus() {
    if (this.editor.contains(this._selection.focusNode)) {
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
      if (this._focusedNode.nodeName === 'LI') {
        this._focusedNode = this._selection.focusNode.parentElement;
      }
      //updating the last time focused Text Node
      if (this._selection.focusNode.nodeName === '#text') {
        this._focusedTextNode = this._selection.focusNode;
      }
    }
  }

  // handlers for toolbar buttons
  _toggleBtnClickHandler(button) {
    button.classList.toggle('active');
    const selectedText = this._selection.toString();
    if (selectedText === '') {
      const activeBtns = this.toolbar.querySelectorAll(
        '.samerEditor-formats > .active.toggleType'
      );

      const node = document.createElement(
        activeBtns[0]?.getAttribute('data-nodeName') || 'span'
      );
      let tempNode = node;
      for (let i = 1; i < activeBtns.length; i++) {
        tempNode.appendChild(
          document.createElement(activeBtns[i].getAttribute('data-nodeName'))
        );
        tempNode = tempNode.firstElementChild;
      }
      node.style.setProperty('font-size', '1.5em');
      this._newCreatedNode = node;
      this._focusLastTimeFocusedNode();
    } else {
      let range = this._selection.getRangeAt(0);
      // adding all the selected elements in 'selectedElements'
      const walker = document.createTreeWalker(
        this.editor,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );
      const selectedElements = [];
      while (walker.nextNode()) {
        let node = walker.currentNode;
        if (
          range.intersectsNode(node) &&
          node.nodeName !== 'BR' &&
          !this._lineNodenames.includes(node.nodeName)
        ) {
          selectedElements.push(node);
        }
      }

      // start and end nodes oparetions
      const startContainer =
        range.startContainer.nodeName == '#text'
          ? range.startContainer.parentElement
          : range.startContainer;
      const endContainer =
        range.endContainer.nodeName == '#text'
          ? range.endContainer.parentElement
          : range.endContainer;

      //creating
      const startNode = document.createElement(startContainer.nodeName);
      startNode.textContent = startContainer.textContent.slice(
        0,
        range.startOffset
      );
      startNode.style.cssText = startContainer.style.cssText;

      const endNode = document.createElement(endContainer.nodeName);
      endNode.textContent = endContainer.textContent.slice(range.endOffset);
      endNode.style.cssText = endContainer.style.cssText;
     
      //cutting
      if (startContainer !== endContainer) {
        startContainer.textContent = startContainer.textContent.slice(
          range.startOffset
        );
        endContainer.textContent = endContainer.textContent.slice(
          0,
          range.endOffset
        );
      } else {
        startContainer.textContent = startContainer.textContent.slice(
          range.startOffset,
          range.endOffset
        );
      }
       //inserting
       if(startNode.textContent.length !== 0) 
       startContainer.parentElement.insertBefore(startNode, startContainer);
      if(endNode.textContent.length !== 0) 
       this._insertAfter(endNode, endContainer, endContainer.parentElement);
      
     //base oparetions:
      const nodeName = (button.classList.contains('active') ? button.getAttribute('data-nodeName') : 'span') 
     let firstNode = null
     let lastNode = null
      for (let i = 0; i < selectedElements.length; i++) {
        const newNode = document.createElement(nodeName)
        newNode.innerHTML = selectedElements[i].innerHTML;
        newNode.style.setProperty('font-size', '1.5em');
        selectedElements[i].parentElement.replaceChild(
          newNode,
          selectedElements[i]
        );
        if(i===0)firstNode = newNode
        else if (i === selectedElements.length - 1) lastNode = newNode 
      }
     //TODO
    //  range = document.createRange()
    // if (lastNode === null){
    //   range.setStartBefore(firstNode.childNodes[0]) 
    //   range.setEndAfter(firstNode.childNodes[firstNode.childNodes.length - 1]) 
    //   console.log(firstNode.childNodes[0].textContent)
    // }else{
    //   range.setStartBefore(firstNode.childNodes[0]) 
    //   range.setEndAfter(lastNode.childNodes[0]) 
    // }
    //  this._selection.removeAllRanges()
    //  this._selection.addRange(range)
     this._deactivateToolbarButtons()
    }
  }
  _defaultBtnClickHandler(button) {
   alert(button.classList[0])
  }
  //helper functions:
  _getToggleBtn(name){
    const button = document.createElement('button');
    const { html, value, nodeName,className } = this._samerEditorButtons.toggleType[name];
    button.className = className;
    this[`${name}Button`] = button;
    button.innerHTML = html;
    button.value = value;
    button.setAttribute('data-nodeName', nodeName);
    button.addEventListener('click', () =>
      this._toggleBtnClickHandler.bind(this)(button)
    );
    return button;
  };
 
  _getDefaultBtn(name){
    const button = document.createElement('button');
    const {html,className} = this._samerEditorButtons.defaultType[name];
    button.className = className
    this[`${name}Button`] = button;
    button.innerHTML = html;
  
    if(name === 'undo' || name === 'redo'){
       this._mementos = [this.editor.innerHTML]
       this._mementoIndex = 0;
       this._redoUndoDisableHandler()
       button.addEventListener('click', () =>
       this._redoUndoClickHandler.bind(this)(name)
       
     );
    } 
    return button;
  }
  
  _redoUndoClickHandler(name){
   const undo = ()=>{
    if (this._mementoIndex > 0) {
      this.editor.innerHTML = this._mementos[--this._mementoIndex]
    }
   }
   const redo = ()=>{
   if (this._mementoIndex < this._mementos.length - 1) {
      this.editor.innerHTML = this._mementos[++this._mementoIndex]
    }
   }
    switch(name){
    case 'undo' : undo() ; break;
    case 'redo' : redo() ; break;
   }
   this._redoUndoDisableHandler()
  }
 _redoUndoDisableHandler(){
  if (this._mementoIndex <= 0){
    this.undoButton?.setAttribute("disabled", "true")
   }else{
     this.undoButton?.removeAttribute("disabled", "false")
 
   }
   if (this._mementoIndex >= this._mementos.length - 1){
    this.redoButton?.setAttribute("disabled", "true")
   }else{
     this.redoButton?.removeAttribute("disabled", "true")
   }
 }
  //function for highliting active buttons
  _toolbarButtonsHighligthHandler() {
    //bold
   if (this.boldButton !== undefined){ 
    if (
      this._focusedNode.nodeName === 'B' ||
      this._focusedNode.querySelector('b') !== null
    ) {
      this.boldButton.classList.add('active');
    } else {
      this.boldButton.classList.remove('active');
    }
  }
    //italic
    if (this.italicButton !== undefined){ 
    if (
      this._focusedNode.nodeName === 'EM' ||
      this._focusedNode.querySelector('em') !== null
    ) {
      this.italicButton.classList.add('active');
    } else {
      this.italicButton.classList.remove('active');
    }
  }
    //underline
    if (this.underlineButton !== undefined){ 
      if (
      this._focusedNode.nodeName === 'U' ||
      this._focusedNode.querySelector('u') !== null
    ) {
      this.underlineButton.classList.add('active');
    } else {
      this.underlineButton.classList.remove('active');
    }
  } 
    //strike
    if (this.strikeButton !== undefined){ 
      if (
      this._focusedNode.nodeName === 'S' ||
      this._focusedNode.querySelector('s') !== null
    ) {
      this.strikeButton.classList.add('active');
    } else {
      this.strikeButton.classList.remove('active');
    }
  }
  }
 
  // helper functions :
  _insertAfter(newNode, child, parent) {
    if (child.nextElementSibling === null) {
      parent.appendChild(newNode);
    } else {
      parent.insertBefore(newNode, child.nextElementSibling);
    }
  }

 

 
  //helper function for deactivating the active buttons
  _deactivateToolbarButtons(){
    const buttons = this.toolbar.querySelectorAll('.samerEditor-formats > button.active')
     for (const button of buttons){
       button.classList.remove('active')
     }
  }
  //helper fn: debounce
  _debounce(fn, delay) {
    let timeout = undefined;
    return function () {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  }

  // helper function for finding the last element child of any elm
  _getDeepestChild = (elm) => {
    let currentElm = elm;
    while (
      currentElm.firstElementChild !== null &&
      currentElm.firstElementChild.nodeName !== 'BR'
    ) {
      currentElm = currentElm.firstElementChild;
    }

    return currentElm;
  };

  // helper function for focus the LastTime Focused Node
  _focusLastTimeFocusedNode() {
    if (this._focusedOffset > this._focusedTextNode.length) {
      this._focusedOffset = this._focusedTextNode.length;
    }

    const range =
      this._selection.rangeCount > 0
        ? this._selection.getRangeAt(0)
        : document.createRange();
    range.setStart(this._focusedTextNode, this._focusedOffset);
    range.setEnd(this._focusedTextNode, this._focusedOffset);
    this._selection.removeAllRanges();
    this._selection.addRange(range);
  }

}
