var utils = require('./utils.js');
var log = utils.richLogging;

var tagEntity = function(item, list, nextId){
  if(!(item in list)){
    list[item] = [nextId];
  } else {
    list[item].push(nextId);
  }

  return list;
};

module.exports = {
  minimize: function(tmr) {

  },
  format: function(data) {
    // Passed a raw JSON TMR,
    // returns a formatted and annotated
    // JSON object to render the decorated TMR
    // to the browser

    var o = [];
    var tmr = data.results[0].TMR;
    var entities = {};
    var nextEntityIdNumber = 0;

    log.attn("Interpreting TMR...");
    log.info("Sentence: " + data.sentence);

    var frames = Object.keys(tmr);
    // Get an array of the frame heads

    log.info("Frame heads: " + frames.join(" "));
    frames.forEach(function(frameName){
      var p = {};
      var frame = tmr[frameName];
      p._key = frameName;
      p.attrs = [];
      p.optional = [];

      entities = tagEntity(frameName, entities, nextEntityIdNumber);
      p._id  = nextEntityIdNumber;
      nextEntityIdNumber += 1;

      Object.keys(frame).forEach(function(attrKey){
        var attrVal = frame[attrKey];
        if(utils.isCapitalized(attrKey)){
          entities = tagEntity(attrVal, entities, nextEntityIdNumber);
          p.attrs.push({key: attrKey, val: attrVal, _id: nextEntityIdNumber});
          nextEntityIdNumber += 1;
        } else {
          p.optional.push({key: attrKey, val: attrVal});
        }
      });
      o.push(p);
    });

    log.info(o);
    return {sentence: data.sentence, entities: entities, tmrs: o};
  }
};
