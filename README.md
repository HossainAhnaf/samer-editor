# SamerEditor

SamerEditor is a rich text editor class designed to provide a flexible and customizable text editing experience. It offers a range of features and options to enhance the editing capabilities.

## Table of Contents
- [Getting Started](#getting-started)
- [Installation](#Installation)
- [features](#features)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Getting Started
Follow the steps below to integrate SamerEditor into your project:

### Installation
First of all you have to download the project then You can include the SamerEditor class in your project using a script tag:
```html
<link rel='stylesheet' href='./samer-editor/assets/css/samer-editor.css'/>
<script src="./samer-editor/core/samer-editor.js"></script>
```
### Features
- [Customizable toolbar with formatting options](#toolbar).
- [SEO-friendly](#seo-friendly).
- [Theme support](#theme-support).
### Toolbar
The editor comes with a customizable toolbar that allows you to apply formatting options to the selected text. You can toggle options: 
- bold
- italic
- underline
- strike-through
- undo
- redo
I will add more formatting options in future.

### SEO-friendly
SamerEditor gives you a SEO-friendly HTML.

### Theme Support
SamerEditor supports multiple themes. You can switch between light and dark themes to match your application's style.

### Configuration
```js
  const samerEditor = new SamerEditor('#editor',{
      modules:{
        syntax: false,
        toolbar: {
          container:'#toolbar',
          options: [['bold','italic','strike','underline']]
      },
    },
      theme:'light'//or 'dark'
    }, 400, 600);
```
### Contributing
If you would like to contribute to SamerEditor, feel free to open issues or submit pull requests on the GitHub repository.

### License
This project is licensed under the MIT License - see the LICENSE.md file for details.
```vbnet

This README provides an overview of your SamerEditor tool, its features, usage, and configuration.
