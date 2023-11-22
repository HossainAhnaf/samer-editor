import groupOneClickHandler from '../utils/groupOneClickHandler.js'

export default class Italic{
  constructor(context){
    this.context = context
    this.createdButtons = []
    this.highlight = function(){
      if (this.createdButtons.length > 0) {
        if (
          this.context._focusedNode.nodeName === 'EM' ||
          this.context._focusedNode.querySelector('em') !== null
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
  button.className = 'samerEditor-italic group1';    
  button.innerHTML = '<em>I</em>';
  button.value = '<br>';
  button.setAttribute('data-nodeName', 'EM');  
  button.addEventListener('click', () => this.click(button));
  this.createdButtons.push(button)

  return button;
 }
 click(){
  groupOneClickHandler(this)
 }
}