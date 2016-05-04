## OntoSem TMR Project

### Getting Started
Install git, node, and npm

```
git clone https://github.com/ethanbond/ontosem
cd ontosem
npm install
npm run scss
[the previous command will not terminate, it is watching your SCSS]
[new terminal window]
npm run start
```

Navigate your browser to localhost:3000

Paste data into the textfield and select which type of data you are analyzing

If you do not enter data, it will utilize sample data



### Development
DustJS Templating Docs: http://www.dustjs.com/

Zepto (lightweight jQuery alternative): http://zeptojs.com/

SCSS (CSS precompiler): http://sass-lang.com/

Juiced (lightweight grid system): http://juicedcss.com/



### Notes
  The server will automatically stop and restart when the code is changed

  The SCSS will automatically recompile when it is changed

  Add page-specific scripts via the "clientscripts" object that is passed to each template

  Add page-specific styling to a new .scss file and surround all code with a ".page-[pagename]" class – in the .dust template for that page, import "layout" and pass it "page-[pagename]" as the page= attribute. See multitmr.dust as an example

  Tools/toggles/options should be added to the {toolbar} block. See multitmr.dust for an example

  Page content should be filled into the {content} block. See multitmr.dust for an example


