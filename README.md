## OntoSem TMR Project

### Getting Started
Install git, node, and npm

```
git clone https://github.com/ethanbond/ontosem
cd ontosem
npm install
npm run scss
[new terminal window]
npm run start
```

DustJS Templating Docs: http://www.dustjs.com/

Notes:

`npm run scss` will watch your `scss/` folder for changes. When changes are detected, the SCSS will be automatically compiled to CSS. Refreshing the page should give you updates immediately.

`npm run start` will start the node server on port 3000.

To view output with the hardcoded example TMR in `utils.js`, navigate to `localhost:3000/example` in your browser. The console logs will give you a better idea of what's going on than the browser will, currently!

Most of the work on actual TMR formatting and decorating should be done in `tmr.js`. `format()` is called for each TMR, and the return object `o` will be handed off and rendered to `tmr.dust`. I highly recommend reading the DustJS docs before getting started. It's very simple but difficult to figure out yourself without the docs.

