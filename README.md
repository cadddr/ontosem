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



TODO:

1.  Text input box to upload to server
      90% done, just needs some input sanitation/error-checking
      Need to discuss w/ writer of API to see if it's possible to wrap
        the "word:" object indices with quotes

      Effort: Medium (but is already mostly finished)
      Time: 4-6 hrs (but is already mostly finished)
      Assigned: Ethan


2.  Refactor intermediate results viewer
      Transition from client-side recursive jQuery DOM building to
      server side neat dust.js templating

      Effort: Unknown
      Time: Unknown
      Assigned: Ross


3.  Integrate intermediate results viewer
      Figure out a way to detect or mark which input the user is giving
      Format the output accordingly

      OPEN QUESTION:
        How would users like to transition between these two?
        Would they give both inputs at the same time to see a combined output?
        Either/or?

      Effort: Medium
      Time: 2-4 hrs
      Assigned: Ethan w/ assist from Ross


4.  Unique colors per tagged entity
      This could be helpful for larger TMRs to associate frames with
      their other reference locations, incl. word in sentence
      Allows us to show associations without hovering

      Effort: Medium
      Time: 6-8 hours
      Assigned: Chris w/ assist from Ethan


5.  Optionally hide recursive references
      And other minor results display improvements

      Effort: Low
      Time: 2-4 hours
      Assigned: Chris


Improvements:

6.  Collapsible TMR frames
      Allow users to fold TMRs to minimize ones they're not interested in

      Effort: Medium
      Time: 4-6 hours


7.  Overall UI improvement
      To make it easier to figure out what's on the screen and how to use it
      Generally make it aesthetically more pleasing

      Effort: Low
      Time: 4-6 hours ("easy" but tedious)


Line up the Value of the keys
Build dat pipeline
