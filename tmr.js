var utils = require('./utils.js');
var log = utils.richLogging;

// The set of attributes which exclusively connects entities to other entities
var relations = new Set(["EXPERIENCER", "EXPERIENCER-OF", "THEME", "THEME-OF"]);


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

var colors = [];

function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

var generateColor = function(colorCounter, colorMax){
  // TODO: This needs to return distinct (not random) colors!
  // One solution would be to just pick out a bunch of nice colors
  // and make a map from ID : Color, but be sure to account for
  // many many ID's needing colors!
  h = colorCounter/colorMax;
  s = 0.8;
  v = 0.8;
  rgb = hsvToRgb(h,s,v);
  return "rgba("+rgb.join(",")+",0.25)";
};

module.exports = {
  format: function(data) {
    // Passed a raw JSON TMR, returns a formatted and annotated
    // JSON object to render the decorated TMR to the browser

    var o = [];
    var tmr = data.results[0].TMR;
    var entities = {};
    var nextEntityIdNumber = 0;

    // Ugly line that parses splits and places tokens from sentence into maps
    var sentence = data.sentence.split(" ").map(function(token){
      // return {"token":token.replace(/[^\w ]/g, '')};
      return {"_token":token};
    });

    log.attn("Interpreting TMR...");
    log.info("Sentence: " + sentence.map(function(a){return a._token;}));

    // Get an array of the frame heads
    var frames = Object.keys(tmr);

    var colors = {};
    var colorCounter = 0;
    var colorMax = frames.length;
    console.log(colorMax);

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
      colors[frameName] = generateColor(colorCounter++, colorMax);
      // -----------

      nextEntityIdNumber += 1;

      // Now loop through all child entities in the frame
      // and do the same thing
      Object.keys(frame).forEach(function(attrKey){
        var attrVal = frame[attrKey];
        if(relations.has(attrKey))
          entities = tagEntity(attrVal, entities, nextEntityIdNumber);

        // Mark whether an entry should be hidden based on
        // whether or not the key of that entry is capitalized
        if(utils.isCapitalized(attrKey)){
          p.attrs.push({key: attrKey, val: attrVal, _id: nextEntityIdNumber});
        } else {
          p.optional.push({key: attrKey, val: attrVal, _id: nextEntityIdNumber});
        }

        // associate token with entity identifier (name) and color
        if(attrKey == "word-ind" && !sentence[attrVal].hasOwnProperty("_name")){
          sentence[attrVal]._name = p._key;
          sentence[attrVal]._id = p._id;
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
    return {sentence: sentence, entities: entities, tmrs: o, colors: colors};
  }
};
