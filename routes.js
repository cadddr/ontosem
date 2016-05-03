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
  if(word["in-tree"] != undefined
      && word["in-tree"] == "events"){
    return true;
  }
  return false;
};

var getTMRByWord = function(word, tmr) {
  for(var k in tmr) {
    if(tmr[k]["word-key"] == word){
      return tmr[k];
    }
  }
};

var eventsFirst = function(sentenceTmr) {
  var results = [];

  for (var wordKey in sentenceTmr) {
    var wordTmr = sentenceTmr[wordKey];
    wordTmr["word-key"] = wordKey;

    if (isEvent(wordTmr)) {
      results.unshift(wordTmr);
    } else {
      results.push(wordTmr);
    }
  }
  return results;
};


module.exports = {
  index: function(req, res) {
    log.info("Serving INDEX");
    res.render("index", {
      debugging: true
    });
  },
  sentence: function(req, res) {
    log.info("Received SENTENCE");

    var inputData = utils.exampleIdeal;
    var tmrSet = inputData.tmrs;


    var results = [];

    for (var resultIndex in tmrSet) {
      var result = tmrSet[resultIndex].results;
      var sentenceString = tmrSet[resultIndex].sentence;
      var sentenceID = tmrSet[resultIndex]["sent-num"];
      var sortedSentence = [];
      var used = [];

      for (var tmrIndex in result) {
        var tmr = eventsFirst(result[tmrIndex].TMR);

        for (var wordIndex in tmr) {
          var wordTmr = tmr[wordIndex];
          var wordKey = wordTmr["word-key"];
          var relatedWords = getRelated(wordTmr);


          if(used.indexOf(wordKey) == -1){
            sortedSentence.push(wordTmr);
            used.push(wordKey);

            for (var relIndex in relatedWords) {
              var word = relatedWords[relIndex];

              if(used.indexOf(word) == -1){
                sortedSentence.push(getTMRByWord(word, tmr));
                used.push(word);
              }
            }
          }
        }
      }

      var r = {};
      r.sorted = sortedSentence;
      r.sentenceString = sentenceString;
      r.sentenceID = sentenceID;

      var formatted = TMRFormatter(r);

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
  upload: function(req, res) {
    log.info("Serving UPLOAD");
    res.render("upload", {
      test: "Good test!",
      clientscripts: [
        {script: "uploadclient.js"}
      ]
    });
  },
  tmr: function(req, res) {
    var data = JSON.parse(req.body.inputData.replace(/\'/g, '\"'));
    var formattedData = TMRFormatter(data);

    res.render("tmr", {
      debugging: false,
      test: "Route: 'tmr', Layout: 'tmr.dust'",
      results: formattedData,
      data: JSON.stringify(formattedData),
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
