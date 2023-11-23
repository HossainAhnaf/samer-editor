//Helper Functions
import { focusLastTimeFocusedNode ,debounce} from '../utils/helperFunctions.js';
export default class Header {
  constructor(context) {
    this.context = context;
    this.isCreatedButton = false;
    this.createdButtons = {
      H1: [],
      H2: [],
      H3: [],
      H4: [],
      H5: [],
      H6: [],
    };
    this.highlight = debounce(() => {
      if (this.isCreatedButton) {
        for (const key in this.createdButtons) {
          if (key === this.context._focusedLineNode.nodeName) {
            for (const header of this.createdButtons[key]) {
              header.classList.add('active');
            }
          } else {
            for (const header of this.createdButtons[key]) {
              header.classList.remove('active');
            }
          }
        }
      }
    }, 300);
  }

  createButton(obj) {
    const button = document.createElement('button');
    const name = Object.keys(obj)[0];
    button.className = `samerEditor-header`;
    button.innerHTML = `<b>H<small>${obj[name]}</small></b>`;
    button.value = obj[name];
    button.addEventListener('click', () => this.click(button.value));
    this.createdButtons['H' + button.value].push(button);
    if (this.isCreatedButton === false) this.isCreatedButton = true;
    return button;
  }

  click(value) {
    const activeButtons = this.context.toolbar.querySelectorAll(
      '.samerEditor-formats > button.samerEditor-header.active'
    );
    for (const button of activeButtons) button.classList.remove('active');
    for (const button of this.createdButtons['H' + value])
      button.classList.toggle('active');
    let node = null;
    if (/H[1-6]/.test(this.context._focusedLineNode.nodeName)) {
      node = document.createElement('P');
    } else {
      node = document.createElement('H' + value);
    }
    node.style.cssText = 'margin:0;padding:0';
    node.innerHTML = this.context._focusedLineNode.innerHTML;
    this.context._focusedLineNode.parentElement.replaceChild(
      node,
      this.context._focusedLineNode
    );
    const oldNodeIndex=Array.from(this.context._focusedLineNode.children).indexOf(this.context._focusedNode)
    const oldTextNodeIndex =Array.from(this.context._focusedNode.childNodes).indexOf(this.context._focusedTextNode)
    this.context._focusedLineNode = node;
    this.context._focusedNode = node.children[oldNodeIndex];
    this.context._focusedTextNode = node.children[oldNodeIndex].childNodes[oldTextNodeIndex];
   focusLastTimeFocusedNode(this.context);
  }
}
