var utils = require('./utils.js');
var log = utils.richLogging;

module.exports = {
  minimize: function(tmr) {

  },
  format: function(tmr) {
    // Passed a raw JSON TMR,
    // returns a formatted and annotated
    // JSON object to render the decorated TMR
    // to the browser

    var  o = {};
    log.info("Interpreting TMR...");

    var frames = Object.keys(tmr);
    // Get an array of the frame heads

    frames.forEach(function(frame){
      o[frame] = tmr[frame];
    });

    log.info(o)
    return o;
  }
};
