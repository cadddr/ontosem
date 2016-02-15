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

    var  o = [];

    log.info("Interpreting TMR...");

    var frames = Object.keys(tmr);
    // Get an array of the frame heads

    frames.forEach(function(frameName){
      var p = {};
      var frame = tmr[frameName];
      p._key = frameName;
      p.attrs = [];
      p.optional = [];

      Object.keys(frame).forEach(function(attrKey){
        var attrVal = frame[attrKey];
        if(utils.isCapitalized(attrKey)){
          p.attrs.push({key: attrKey, val: attrVal});
        } else {
          p.optional.push({key: attrKey, val: attrVal});
        }
      });
      o.push(p);
    });

    log.info(o)
    return {tmrs: o};
  }
};
