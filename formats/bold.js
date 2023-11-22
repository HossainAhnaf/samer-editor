import groupOneClickHandler from '../utils/groupOneClickHandler.js'


export default class Bold{
  constructor(context){
    this.context = context
    this.createdButtons = []
    this.highlight = function(){
      if (this.createdButtons.length > 0) {
        if (
          this.context._focusedNode.nodeName === 'B' ||
          this.context._focusedNode.querySelector('b') !== null
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
  button.className = 'samerEditor-bold group1';    
  button.innerHTML = '<b>B</b>';
  button.value = '<br>';
  button.setAttribute('data-nodeName', 'B');  
  button.addEventListener('click', () => this.click(button));
  this.createdButtons.push(button)
  return button;
 }
 click(){
  groupOneClickHandler(this)
 }
}