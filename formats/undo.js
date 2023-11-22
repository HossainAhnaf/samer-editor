
export default class Undo{
    constructor(context){
      this.context = context
      this.createdButtons = []
    }
  
   createButton(){
    const button = document.createElement('button');
   
    button.className = 'samerEditor-undo samerEditor-svgParent';
    button.innerHTML = `
    <svg viewBox="0 0 48 48" fill="none">
      <rect  fill="white" fill-opacity="0.01"/>
      <path style="stroke-width: 5;" class="samerEditor-stroke" d="M11.2721 36.7279C14.5294 39.9853 19.0294 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C19.0294 6 14.5294 8.01472 11.2721 11.2721C9.61407 12.9301 6 17 6 17" />
      <path style="stroke-width: 4;" class="samerEditor-stroke" d="M6 9V17H14"  stroke-width="4" />
      </svg>
    `;
  
      this.context._mementos = [this.context.editor.innerHTML];
      this.context._mementoIndex = 0;
      button.addEventListener('click', this.click.bind(this));
      this.createdButtons.push(button) 
    return button;
   }
   click(){
    if (this.context._mementoIndex > 0) {
      this.context.editor.innerHTML = this.context._mementos[--this.context._mementoIndex];
    }
    this.context._redoUndoDisableHandler();
   }
  }