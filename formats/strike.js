import groupOneClickHandler from '../utils/groupOneClickHandler.js'

export default class Strike{
  constructor(context){
    this.context = context
    this.createdButtons = []
    this.highlight = function(){
      if (this.createdButtons.length > 0) {
        if (
          this.context._focusedNode.nodeName === 'S' ||
          this.context._focusedNode.querySelector('s') !== null
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
  button.className = 'samerEditor-strike group1';    
  button.innerHTML = '<s>S</s>';
  button.value = '<br>';
  button.setAttribute('data-nodeName', 'S');  
  button.addEventListener('click', () => this.click(button));
  this.createdButtons.push(button)

  return button;
 }
 click(){
  groupOneClickHandler(this)
 }
}