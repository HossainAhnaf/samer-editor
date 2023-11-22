 //Helper Functions
 import { focusLastTimeFocusedNode } from '../utils/helperFunctions.js';

 function groupOneClickHandler(_this){
   for (const button of _this.createdButtons) button.classList.toggle('active');
   const selectedText = _this.context._selection.toString();
   if (selectedText === '') {
     const activeBtns = _this.context.toolbar.querySelectorAll(
       '.samerEditor-formats > .active.group1'
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
     _this.context._newCreatedNode = node;
     focusLastTimeFocusedNode(_this.context);
   } else {
     let range = _this.context._selection.getRangeAt(0);
 
     const startOffset = range.startOffset 
     const endOffset = range.endOffset 
 
     // adding all the selected elements in 'selectedElements'
     const walker = document.createTreeWalker(
       _this.context.editor,
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
         !_this.context._lineNodenames.includes(node.nodeName)
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
      _this.context._insertAfter(endNode, endContainer, endContainer.parentElement);
     
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
    
    _this.context._focusedNode = firstNode  
    range = document.createRange()
    range.setStart(firstNode.childNodes[0],startOffset) 
    range.setEnd(lastNode.childNodes[0],endOffset) 
   
    _this.context._selection.removeAllRanges()
    _this.context._selection.addRange(range)
    _this.context._deactivateToolbarButtons('.samerEditor-formats > button')
    _this.context._updateMementos()
    _this.context._toolbarButtonsHighligthHandler()
   }
 } 
 
 export default groupOneClickHandler