## OntoSem Visualizer
For full documentation, consult the [wiki](https://github.com/ethanbond/ontosem/wiki).

### Quick Setup
1. Install Git, Node.js, and npm, the perform the following:
```
git clone https://github.com/ethanbond/ontosem
cd ontosem
npm install
npm run scss
[the previous command will not terminate, it is watching your SCSS]
[run the following in a separate console window]
npm run start
```
2. When the above is ready, navigate your browser to localhost:3000
3. Paste the data (TMR Object or Intermediate Logs) into the textfield and select which type of data you are analyzing
4. If you do not enter data, it will utilize sample data from `tests/results`


### Development
+ pug a.k.a. jade (templating engine) http://jade-lang.com/
+ Zepto (lightweight jQuery alternative): http://zeptojs.com/
+ Sass (CSS preprocessor): http://sass-lang.com/
+ Juiced (lightweight grid system): http://juicedcss.com/


### Notes
+ The server will automatically stop and restart when the code is changed
+ The CSS will be automatically recompiled (only) when the SCSS is changed while the Sass preprocessor is running
+ Add page-specific scripts via the "clientscripts" object that is passed to each template
+ Add page-specific styling to a new SCSS file and surround all code with a ".page-[pagename]" class – in the .pug template for that page, import "layout" and pass it "page-[pagename]" as the page= attribute. See multitmr.pug as an example
+ Tools/toggles/options should be added to the {toolbar} block. See multitmr.pug for an example.
+ Page content should be filled into the {content} block. See multitmr.pug for an example.
