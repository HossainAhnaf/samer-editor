 export default samerEditorButtons = {
        toggleType: {
          bold: {
            html: '<b>B</b>',
            value: '<br>',
            nodeName: 'B',
            className: `samerEditor-bold toggleType`
          },
          italic: {
            html: '<em>I</em>',
            value: '<br/>',
            nodeName: 'EM',
            className: `samerEditor-italic toggleType`
          },
          underline: {
            html: '<u>U</u>',
            value: '<br/>',
            nodeName: 'U',
            className: `samerEditor-underline toggleType`
          },
          strike: {
            html: '<s>S</s>',
            value: '<br/>',
            nodeName: 'S',
            className: `samerEditor-stike toggleType`
          },
       
          //TODO
          // list: {
          //   html: {
          //     ordered: ``,
          //     bullet:``
          //   },
          //   value: ['<ol></ol>', '<ul></ul>'],
          //   
          // },
          // future update
          // code: {
          //   html: '',
          //   value: '',
          //   
          // },
        },
       lineType:{
        header:{
          html:'<b>H</b>',
          nodeName:'H',
          className: `samerEditor-header lineType`
        }
       } ,
       defaultType:{
         undo:{
          html:`
          <svg viewBox="0 0 48 48" fill="none">
          <rect  fill="white" fill-opacity="0.01"/>
          <path style="stroke-width: 5;" class="samerEditor-stroke" d="M11.2721 36.7279C14.5294 39.9853 19.0294 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C19.0294 6 14.5294 8.01472 11.2721 11.2721C9.61407 12.9301 6 17 6 17" />
          <path style="stroke-width: 4;" class="samerEditor-stroke" d="M6 9V17H14"  stroke-width="4" />
          </svg>
          `,
          className:'samerEditor-undo samerEditor-svgParent defaultType'  
         },
         redo:{
          html:`
          <svg   viewBox="0 0 48 48" fill="none">
          <rect  fill="white" fill-opacity="0.01"/>
          <path class="samerEditor-stroke" style="stroke-width: 5;" d="M36.7279 36.7279C33.4706 39.9853 28.9706 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C28.9706 6 33.4706 8.01472 36.7279 11.2721C38.3859 12.9301 42 17 42 17" />
          <path class="samerEditor-stroke" style="stroke-width: 5;" d="M42 8V17H33" />
          </svg>
          `,
          className:'samerEditor-redo samerEditor-svgParent defaultType'  
         }
       }
  
    }
  
