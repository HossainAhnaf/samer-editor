
export default class Redo{
    constructor(context){
      this.context = context
      this.createdButtons = []
    }
  
   createButton(){
    const button = document.createElement('button');
   
    button.className = 'samerEditor-redo samerEditor-svgParent';
    button.innerHTML = `
    <svg   viewBox="0 0 48 48" fill="none">
      <rect  fill="white" fill-opacity="0.01"/>
      <path class="samerEditor-stroke" style="stroke-width: 5;" d="M36.7279 36.7279C33.4706 39.9853 28.9706 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C28.9706 6 33.4706 8.01472 36.7279 11.2721C38.3859 12.9301 42 17 42 17" />
      <path class="samerEditor-stroke" style="stroke-width: 5;" d="M42 8V17H33" />
      </svg>
    `;
  
      this.context._mementos = [this.context.editor.innerHTML];
      this.context._mementoIndex = 0;
      button.addEventListener('click', this.click.bind(this));
      this.createdButtons.push(button) 
    return button;
   }
   click(){
    if (this.context._mementoIndex < this.context._mementos.length - 1) {
      this.context.editor.innerHTML = this.context._mementos[++this.context._mementoIndex];
    }
    this.context._redoUndoDisableHandler();
   }
  }