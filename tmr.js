var utils = require('./utils.js');
var log = utils.richLogging;

module.exports = {
  minimize: function(tmr) {

  },
  format: function(tmr) {

    var  o = {};
    log.info("Interpreting TMR...");

    var frames = Object.keys(tmr);

    frames.forEach(function(frame){
      o[frame] = tmr[frame];
    });

    log.info(o)
    return o;
  }
};
