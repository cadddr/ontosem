var utils = require('./utils.js');
var log = utils.richLogging;

// The set of attributes which exclusively connects entities to other entities
var eventrelated = new Set(["EXPERIENCER", "EXPERIENCER-OF", "THEME", "THEME-OF", "AGENT", "AGENT-OF", "BENEFICIARY", "BENEFICIARY-OF"]);
var composites = new Set(["BELONGS-TO", "AGENT", "THEME", "BENEFICIARY"]);

var relations = new Set(Object.keys(utils.inverseMap));
var debugKeys = new Set(["is-in-subtree","syn-roles","lex-source","concept", "word-ky"]);

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

var insertLinebreaks = function(s) {
  return s.toString().split(",").join("\n");
};

module.exports = {
  format: function(data) {
    // Passed a raw JSON TMR, returns a formatted and annotated
    // JSON object to render the decorated TMR to the browser

    var o = [];
    var tmrSet = data.sorted;
    var entities = {};
    var nextEntityIdNumber = 0;


    log.attn("Interpreting TMR...");


    var colors = {};
    var colorCounter = 0;
    var colorMax = tmrSet.length;

    for (var tmrIndex in tmrSet) {
      var p = {};
      var frame = tmrSet[tmrIndex];
      var frameName = frame.wordKey;

      p._key = frameName;
      p.attrs = [];
      p.optional = [];
      p.debug = [];

      entities = tagEntity(frameName, entities, nextEntityIdNumber);
      p._id  = nextEntityIdNumber;
      colors[frameName] = generateColor(colorCounter++, colorMax);

      nextEntityIdNumber += 1;

      var sentence = data.sentenceString.split(" ").map(function(token){
        return {"_token":token};
      });

      Object.keys(frame).forEach(function(attrKey){
        var attrVal = frame[attrKey];
        if(eventrelated.has(attrKey)){
          if( !(typeof attrVal === 'string') && !(attrVal instanceof String)){
            attrVal = attrVal.value;
          }
          entities = tagEntity(attrVal, entities, nextEntityIdNumber);
        }

        if(composites.has(attrKey))
          attrVal = attrVal.value;

        // Mark whether an entry should be hidden based on
        // whether or not the key of that entry is capitalized
        if(utils.isCapitalized(attrKey)){
          p.attrs.push({key: attrKey, val: insertLinebreaks(attrVal), _id: nextEntityIdNumber});
        else if (debugKeys.has(attrKey)) {
          p.debug.push({key: attrKey, val: insertLinebreaks(attrVal), _id: nextEntityIdNumber});
        } else {
          p.optional.push({key: attrKey, val: insertLinebreaks(attrVal), _id: nextEntityIdNumber});
        }

        // associate token with entity identifier (name) and color
        if(attrKey == "sent-word-ind" && !sentence[attrVal].hasOwnProperty("_name")){
          sentence[attrVal]._name = p._key;
          sentence[attrVal]._id = p._id;
        }

        // Get the next ID ready!
        nextEntityIdNumber += 1;
      });

      o.push(p);
    }


    var tmpsort = [];

    o.forEach(function(entity){
      entity.debug.forEach(function(dbg){
        if(dbg.key == 'is-in-subtree' && dbg.val == 'EVENT'){
          log.info(dbg);
          tmpsort.push(entity);
          entity.attrs.forEach(function(attr){
            if(eventrelated.has(attr.key))
              o.forEach(function(linkedEntity){
                if (linkedEntity._key == attr.val){
                  tmpsort.push(linkedEntity);
                  o.splice(o.indexOf(linkedEntity), 1);
                }
              });
          });
          o.splice(o.indexOf(entity), 1);
        }
      });
    });

    o = tmpsort.concat(o);

    // Log the entire set of TMR frames
    log.info(o);
    log.info(data);

    // Return the annotated set along with the collection of
    // known entities, as well as the sentence itself.
    return {
      sentenceID: data.sentenceID,
      sentenceString: data.sentenceString,
      entities: entities,
      tmrs: o,
      colors: colors,
      relations: relations
    };
  }
};
