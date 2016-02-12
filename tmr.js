var utils = require('./utils.js');
var log = utils.richLogging;

module.exports = {
  minimize: function(tmr) {

  },
  format: function(tmr) {
    if(typeof tmr == "string") { return tmr; }
    if(typeof tmr == "number") { return tmr; }

    var  o = {};
    log.info("Interpreting TMR...");
    log.info("Raw TMR: " + JSON.stringify(tmr));

    var frames = Object.keys(tmr);

    frames.forEach(function(frame){
      o[frame] = tmr[frame];
    });

    log.info(o)
    return o;
  }
};
