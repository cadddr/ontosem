var request = require('request');
var utils = require('./utils.js');
var log = utils.richLogging;
var TMRFormatter = require('./tmr.js').format;
var intermediateFormatter = require('./intermediate.js').format;

var getRelated = function(word) {
  var relatedWords = [];
  if(isEvent(word)){
    if ('AGENT' in word) { relatedWords.push(word['AGENT'].value); }
    if ('BENEFICIARY' in word) { relatedWords.push(word['BENEFICIARY'].value); }
    if ('THEME' in word) { relatedWords.push(word['THEME'].value); }
    if ('BELONGS-TO' in word) { relatedWords.push(word['BELONGS-TO'].value); }
  }

  return relatedWords;
};

var isEvent = function(word) {
  if(word["is-in-subtree"] != undefined
      && word["is-in-subtree"] == "events"){
    return true;
  }
  return false;
};

// Get a word's frame from a given TMR,
// else return an empty object
var getTMRByWord = function(word, tmr) {
  for(var k in tmr) {
    if(tmr[k]["word-key"] == word){
      return tmr[k];
    }
  }

  return {};
};

var eventsFirst = function(sentenceTmr) {
  var results = [];

  // For each word in a sentence
  for (var wordKey in sentenceTmr) {
    var wordTmr = sentenceTmr[wordKey];
    wordTmr["word-key"] = wordKey;

    // If the word is an event
    if (isEvent(wordTmr)) {
      // Prepend it to our results
      results.unshift(wordTmr);
    } else {
      // Append it to our results
      results.push(wordTmr);
    }
  }

  // Results should have all events, in no particular order,
  // in front of all non-events, in no particular order
  return results;
};


module.exports = {
  index: function(req, res) {
    // Homepage
    log.info("Serving INDEX");
    res.render("index", {
      debugging: false
    });
  },
  tmr: function(req, res) {
    // Multiple TMR viewer
    log.info("Received SENTENCE");

    // TODO: Switch this to read the POST data
    var inputData = utils.exampleIdeal;
    /////////////////////

    var tmrSet = inputData.tmrs;
    var results = [];

    for (var resultIndex in tmrSet) {
      var result = tmrSet[resultIndex].results;
      var sentenceString = tmrSet[resultIndex].sentence;
      var sentenceID = tmrSet[resultIndex]["sent-num"];
      var sortedSentence = [];
      var used = [];

      for (var tmrIndex in result) {

        // Re-sort so that events are all at the
        // beginning of our list of words
        var tmr = eventsFirst(result[tmrIndex].TMR);

        for (var wordIndex in tmr) {
          // Cycle through each individual TMR frame
          var wordTmr = tmr[wordIndex];
          var wordKey = wordTmr["word-key"];

          // Get the words that are related to this frame
          var relatedWords = getRelated(wordTmr);


          // If the word hasn't been added to our final
          // set of results
          if(used.indexOf(wordKey) == -1){
            //
            // Add it to our results
            sortedSentence.push(wordTmr);

            // Mark this word as USED
            used.push(wordKey);

            // For each of the words related to this word
            for (var relIndex in relatedWords) {
              var word = relatedWords[relIndex];

              // If the related word hasn't been used
              if(used.indexOf(word) == -1){
                // Add it to the results
                sortedSentence.push(getTMRByWord(word, tmr));

                // Mark it as used
                used.push(word);
              }
            }
          }
        }
      }

      // Make an object that contains all the info
      // needed for our Dust templates
      var r = {};
      r.sorted = sortedSentence;
      r.sentenceString = sentenceString;
      r.sentenceID = sentenceID;

      // Format, annotate, and decorate the results
      var formatted = TMRFormatter(r);

      // Add that sentence to our final list of
      // sentences and their formatted TMRs
      results.push(formatted);
    }

    res.render("multitmr", {
      debugging: false,
      results: results,
      data: JSON.stringify(results),
      clientscripts: [
        {script: "tmrclient.js"}
      ]
    });
  },
  intermediate: function(req, res) {
    log.info("Serving INTERMEDIATE");
    var raw = utils.exampleIntermediate;
    if(req.body.inputData != ">"){
      raw = req.body.inputData.replace(/\\n/g, '');
    }
    var results = intermediateFormatter(raw);
    var tmrData = TMRFormatter(results.TMR);
    var entities = tmrData.entities;
    results.tmrData = tmrData;
    results.tmrString = JSON.stringify(tmrData);
    results.dataString = JSON.stringify(results.lexEntries);

    res.render("intermediate", {
      results: results,
      data: JSON.stringify(results),
      clientscripts: [
        {script: "intermediateclient.js"}
      ]
    });
  }
};
