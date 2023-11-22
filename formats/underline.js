import groupOneClickHandler from '../utils/groupOneClickHandler.js'

export default class Underline{
  constructor(context){
    this.context = context
    this.createdButtons = []
    this.highlight = function(){
      if (this.createdButtons.length > 0) {
        if (
          this.context._focusedNode.nodeName === 'U' ||
          this.context._focusedNode.querySelector('u') !== null
        ) {
       for (const button of this.createdButtons) button.classList.add('active')
        } else {
       for (const button of this.createdButtons) button.classList.remove('active');
        }
      }
    }
  }

 createButton(){
  const button = document.createElement('button');
  button.className = 'samerEditor-underline group1';    
  button.innerHTML = '<u>U</u>';
  button.value = '<br>';
  button.setAttribute('data-nodeName', 'U');  
  button.addEventListener('click', () => this.click(button));
  this.createdButtons.push(button)

  return button;
 }
 click(){
  groupOneClickHandler(this)
 }
}