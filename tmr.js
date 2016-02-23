var utils = require('./utils.js');
var log = utils.richLogging;

var tagEntity = function(item, list, nextId){
  // Checks whether this is an entity that's already
  // been assigned an ID and assigns the same one.
  // If not, it just picks the next number to use as the ID.
  //
  if(!(item in list)){
    // Make a new entry into our list using the ID
    list[item] = [nextId];
  } else {
    // Append the ID to an already-known object
    list[item].push(nextId);
  }

  return list;
};

var generateColor = function(id){
  // TODO: This needs to return distinct (not random) colors!
  // One solution would be to just pick out a bunch of nice colors
  // and make a map from ID : Color, but be sure to account for
  // many many ID's needing colors!
  return "#000";
};

module.exports = {
  format: function(data) {
    // Passed a raw JSON TMR, returns a formatted and annotated
    // JSON object to render the decorated TMR to the browser

    var o = [];
    var tmr = data.results[0].TMR;
    var entities = {};
    var nextEntityIdNumber = 0;

    log.attn("Interpreting TMR...");
    log.info("Sentence: " + data.sentence);

    // Get an array of the frame heads
    var frames = Object.keys(tmr);

    log.info("Frame heads: " + frames.join(" "));
    frames.forEach(function(frameName){
      var p = {};
      var frame = tmr[frameName];
      p._key = frameName;
      p.attrs = [];
      p.optional = [];

      // Special case for tagging the "head" of each frame
      entities = tagEntity(frameName, entities, nextEntityIdNumber);
      p._id  = nextEntityIdNumber;
      p.color = generateColor(nextEntityIdNumber);
      // -----------

      nextEntityIdNumber += 1;

      // Now loop through all child entities in the frame
      // and do the same thing
      Object.keys(frame).forEach(function(attrKey){
        var attrVal = frame[attrKey];
        entities = tagEntity(attrVal, entities, nextEntityIdNumber);

        // Mark whether an entry should be hidden based on
        // whether or not the key of that entry is capitalized
        if(utils.isCapitalized(attrKey)){
          p.attrs.push({key: attrKey, val: attrVal, _id: nextEntityIdNumber});
        } else {
          p.optional.push({key: attrKey, val: attrVal, _id: nextEntityIdNumber});
        }

        // Get the next ID ready!
        nextEntityIdNumber += 1;
      });

      // Add the annotated frame to our entire set of TMR frames
      o.push(p);
    });

    // Log the entire set of TMR frames
    log.info(o);

    // Return the annotated set along with the collection of
    // known entities, as well as the sentence itself.
    return {sentence: data.sentence, entities: entities, tmrs: o};
  }
};
