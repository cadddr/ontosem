var request = require('request');
var utils = require('./utils.js');
var log = utils.richLogging;
var TMRFormatter = require('./tmr.js').format;
var intermediateFormatter = require('./intermediate.js').format;

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
    var sorted = [];

    var isEvent = function(word) {
      if(word["in-tree"] != undefined
          && word["in-tree"] == "events"){
        return true;
      }
      return false;
    };

    var getRelated = function(word) {
      var relatedWords = [];

      if ('AGENT' in word) {
        relatedWords.push({agent: word['AGENT'].value});
      }
      if ('BENEFICIARY' in word) {
        relatedWords.push({beneficiary: word['BENEFICIARY'].value});
      }

      return relatedWords;
    };

    var getTMRByWord = function(setOfWords, word) {
      console.log(word);

    };

    for (var i in inputData.tmrs) {
      var frame = inputData.tmrs[i];
      var events = [];
      for (var j in frame.results) {
        var frameTMR = frame.results[j].TMR;

        for (var word in frameTMR) {
          if (isEvent(frameTMR[word])){
            var o = {
              word: word,
              tmr: frameTMR[word],
              related: getRelated(frameTMR[word])
            }
            events.push(o)
          }
        }
      }

      frame.events = events;

      for (var i in events) {
        var word = events[i];
        console.log(word);
      }
    }



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
