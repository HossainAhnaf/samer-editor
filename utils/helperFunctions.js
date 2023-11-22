// really we need a Built in insertAfter
export function insertAfter(newNode, child, parent) {
    if (child.nextElementSibling === null) {
      parent.appendChild(newNode);
    } else {
      parent.insertBefore(newNode, child.nextElementSibling);
    }
  }
  
  //helper fn: debounce
  export function debounce(fn, delay) {
    let timeout = undefined;
    return function () {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  }
  
  // helper function for finding the last element child of any elm
  export function getDeepestChild(elm){
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
  export function focusLastTimeFocusedNode(context) {
  
    if (context._focusedOffset > context._focusedTextNode) {
      context._focusedOffset = context._focusedTextNode.length;
    }
    const range =
      context._selection.rangeCount > 0
        ? context._selection.getRangeAt(0)
        : document.createRange();
    range.setStart(context._focusedTextNode, context._focusedOffset);
    range.setEnd(context._focusedTextNode, context._focusedOffset);
    context._selection.removeAllRanges();
    context._selection.addRange(range);
  }