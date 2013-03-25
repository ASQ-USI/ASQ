ASQ-editor
==========

A WYSIWYG editor for impress.js presentations. It allows to edit slides and questions of the ASQ project.

Installation
------------

Install the required modules:

`npm install`

Start the app:

`node app.js`

Scenarios - Roadmap
-------------------

(not fully implemented)

### Scenario 1

- load  presentation 
- keep backup of presentation
- launch edit window
- load toolbars
- edit
- on save check if original files are modified
- save
- if save fails revert to original

### Scenario 2

- load  slide 
- do the same as Scenario 1

### ARchitecture

* file module
* database module
* editor rendering


### Things to consider
1. Open more than one editor windows
2. how to open up windows:
	- modal window
  	- standalone window
  	- right click "edit"

Authors
-------

* [Giorgos Kokosioulis](http://www.people.usi.ch/kokosg/Web/personal_site/)

Technologies Used
-----------------
- [node.js][1]
- [express.js][2]
- [cheerio.js] [3]
- [impress.js][4]

Browser Support
---------------

Currently we will focus on supporting Google Chrome and Chromium.
We might support Firefox in the future but this will not be a priority.  
Please note that browser support depends also on [impress.js][4].

Changelog
---------

(to be updated)

[1]: http://nodejs.org/                     "node.js"
[2]: http://expressjs.com/                  "express.js"
[3]: https://github.com/MatthewMueller/cheerio "cheerio.js"
[4]: https://github.com/bartaz/impress.js/  "impress.js"
