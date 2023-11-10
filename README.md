# SamerEditor

SamerEditor is a rich text editor class designed to provide a flexible and customizable text editing experience. It offers a range of features and options to enhance the editing capabilities.

## Table of Contents
- [Getting Started](#getting-started)
- [Features](#features)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Getting Started
Follow the steps below to integrate SamerEditor into your project:

### Installation
First of all you have to download the project then You can include the SamerEditor class in your project using a script tag:
```html
<script src="./samer-editor/core/samer-editor.js"></script>
### Features
1. Customizable toolbar with formatting options.
2. Will get SEO-friendly HTML.
3. Theme support.
### Toolbar
### SEO-friendly
### Theme Support
SamerEditor supports multiple themes. You can switch between light and dark themes to match your application's style.

### Configuration
```html
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

### Contributing
If you would like to contribute to SamerEditor, feel free to open issues or submit pull requests on the GitHub repository.

### License
This project is licensed under the MIT License - see the LICENSE.md file for details.
```vbnet

This README provides an overview of your SamerEditor tool, its features, usage, and configuration. Please make sure to replace placeholders such as `"# editor-container"`, and `"your-repository-url"` with actual values specific to your project.

Feel free to add more details, usage examples, and custom features that are unique to your rich text editor.
