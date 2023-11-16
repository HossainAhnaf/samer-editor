import samerEditorButtons from '../buttons.js'
/**
 * SamerEditor - A rich text editor class.
 * @param {string} query - The query selector of the editor container.
 * @param {Object} options - Configuration options for the editor.
 */
 export default class SamerEditor {
  constructor(query, options = { modules: {
    syntax: true,
    toolbar:{container:null,options:[]},
    shortKeys:{}
  },  theme: 'light' 
  }
  ) {
   this._samerEditorButtons = samerEditorButtons 

    this.editor = document.querySelector(query);
    this.editor.className = 'samerEditor-editor';
   if (this.editor.children.length === 0) 
    this.editor.innerHTML = `<p style="margin:0;padding:0"><span style="font-size: 1.5em;"><br></span></p>`;
    this.editor.setAttribute('contenteditable', 'true');
     this.editor.setAttribute('spellcheck', options.modules.syntax);

    this.toolbar = document.querySelector(options.modules.toolbar.container)
    this.toolbar.className = `samerEditor-toolbar theme-${options.theme}`;
    this._buildToolbar(options.modules.toolbar.options || []);

  
   
    this._shortKeys = options.modules.shortKeys
    this._selection = window.getSelection();
    this._newCreatedNode = null;
    this._focusedLineNode = this.editor.lastElementChild;
    this._focusedNode = this._focusedLineNode.lastElementChild;
    this._focusedTextNode = this._focusedNode.childNodes[0];
    this._focusedOffset = 0;
    this._lineNodenames = ['P', 'OL', 'UL', 'H1', 'H2','H3','H4','H5','H6'];
   
  
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
     this._updateMementos = this._debounce(()=>{
     if (!this._mementos.includes(this.editor.innerHTML)){  
      this._mementos.push(this.editor.innerHTML)
      this._mementoIndex += 1
      this._redoUndoDisableHandler() 
   
     } 
     },300)
        
    
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
    this._toolbarButtonsHighligthHandler()
  }

  //handlers for editor
 
  _editorKeyDownHandler(e) {
    //checking for shortKeys
    if(e.ctrlKey && e.key in this._shortKeys){
      e.preventDefault()
     this._shortKeyFormatHandler(this._shortKeys[e.key])
    }//checking if key == enter then create new line
   else if (e.key === 'Enter') {
      e.preventDefault();
      this._createNewLine()      
  }else this._toolbarButtonsHighligthHandler();

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
    const p = document.createElement(this._focusedLineNode.nodeName);
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

    this._updateMementos()
  }
 // this function will update the focused node,line,textNode 
  _updateFocusedNodes() {
    if (this.editor !== this._selection.focusNode && this.editor.contains(this._selection.focusNode)) {
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
        const name = typeof item === 'object' ? Object.keys(item)[0] : item
        let button = null
        if (name in this._samerEditorButtons.toggleType) {
           button = this._getToggleBtn(item);
        } else if (name in this._samerEditorButtons.defaultType) {
          button = this._getDefaultBtn(item);
        } else if (name in this._samerEditorButtons.lineType){
          button = this._getLineBtn(item);
        }
        // else if (name in samerEditorButtons.pickerType) {
        // } else if (name in samerEditorButtons.selectType) {
        // } else if (name in samerEditorButtons.fileType) {
        //}
       if(button !== null) 
        currentformats.appendChild(button);
      }

      this.toolbar.appendChild(currentformats);
    }
    return toolbar;
  }

  // this function will create toggle type button 
  _getToggleBtn(name){
    const { html, value, nodeName,className } = this._samerEditorButtons.toggleType[name];
    const button = document.createElement('button');
    button.className = className;    
    this[`${name}Button`] = button;
    button.innerHTML = html;
    button.value = value;
    button.setAttribute('data-nodeName', nodeName);  
    button.setAttribute('data-handlerName', '_toggleTypeBtnClickHandler');  
    button.addEventListener('click', () =>
      this._toggleTypeBtnClickHandler.bind(this)(button)
    );
    return button;
  };
 
  // this function will create default type button -- sorry I haven't better names for button groups
  // You can contribute - if you have better name for varries and fns    
  _getDefaultBtn(name){
    const button = document.createElement('button');
    const {html,className} = this._samerEditorButtons.defaultType[name];
    button.className = className
    this[`${name}Button`] = button;
    button.innerHTML = html;
    button.setAttribute('data-handlerName', '_redoUndoClickHandler');  

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
  // this function will create line type button -- sorry I haven't better names for button groups
  // You can contribute - if you have better name for varries and fns     
  _getLineBtn(obj){
    const button = document.createElement('button');
    const name = Object.keys(obj)[0]
    const { html,nodeName,className } = this._samerEditorButtons.lineType[name];
    const finalNodeName = nodeName + obj[name]  
      button.className = className;    
      button.innerHTML = html
      button.value = obj[name]
      button.setAttribute('data-nodeName', finalNodeName);  
      button.setAttribute('data-handlerName', '_lineTypeBtnClickHandler');  
      this[`${finalNodeName}Button`] = button;
   
      button.addEventListener('click', () =>
        this._lineTypeBtnClickHandler.bind(this)(button)
      );
      
     return button
  }

   // handlers for toolbar buttons
   _toggleTypeBtnClickHandler(button) {
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

      const startOffset = range.startOffset 
      const endOffset = range.endOffset 
  
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
        lastNode = newNode 
      }
     
     this._focusedNode = firstNode  
     range = document.createRange()
     range.setStart(firstNode.childNodes[0],startOffset) 
     range.setEnd(lastNode.childNodes[0],endOffset) 
    
     this._selection.removeAllRanges()
     this._selection.addRange(range)
     this._deactivateToolbarButtons('.samerEditor-formats > button')
     this._updateMementos()
     this._toolbarButtonsHighligthHandler()
    }
  }

// line type button click handler
 _lineTypeBtnClickHandler(button){
   const activeButton = this.toolbar.querySelector('.samerEditor-formats > button.samerEditor-header.active')
    if (activeButton !== null && activeButton !== button) activeButton.classList.remove('active')
    button.classList.toggle('active')
    let node = null
   if (button.classList.contains('active')){
     node = document.createElement(button.getAttribute('data-nodeName'))
   }else{
     node = document.createElement('P')
   }
   node.style.cssText = 'margin:0;padding:0'
   node.innerHTML =this._focusedLineNode.innerHTML
   this._focusedLineNode.parentElement.replaceChild(node,this._focusedLineNode) 
   this._focusedLineNode = node
   this._focusLastTimeFocusedNode()
  }

// undo - redo button click handler
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

 //this function will  disable / able the undo - redo button
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

//handler for shortKey formatting
_shortKeyFormatHandler(commandItem){
  if (Array.isArray(commandItem)){
    for (const item of commandItem){
      const button =  this[`${item}Button`]
      const handlerFunction = this[button.getAttribute('data-handlerName')]
      handlerFunction.bind(this)(button)
    }
  }else{
  const button = this[`${commandItem}Button`]

  const handlerFunction = this[button.getAttribute('data-handlerName')]
  handlerFunction.bind(this)(button)

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
  // H1 - H6 
  this.toolbar.querySelector('.samerEditor-formats > button.samerEditor-header.active')?.classList.remove('active')
  this[`${this._focusedLineNode.nodeName}Button`]?.classList.add('active')
  
  }
  //handler for paste
  _pasteHandler(e){
    e.preventDefault() 
 this._focusedNode.innerText += e.clipboardData.getData('text/plain')
    
  }
  // helper functions : insertAfter - we really needs it
  _insertAfter(newNode, child, parent) {
    if (child.nextElementSibling === null) {
      parent.appendChild(newNode);
    } else {
      parent.insertBefore(newNode, child.nextElementSibling);
    }
  }

 
  //helper function for deactivating the active buttons
  _deactivateToolbarButtons(query){
    const buttons = this.toolbar.querySelectorAll(`${query}.active`)
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
