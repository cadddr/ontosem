var utils = require('./utils.js');
var log = utils.richLogging;
var TMRFormatter = require('./tmr.js').format;
var intermediateFormatter = require('./intermediate.js').format;

module.exports = {
  index: function(req, res) {
    log.info("Serving INDEX");
    res.render("layout", {
      debugging: true,
      test: "Try going to /upload for now"
    });
  },
  upload: function(req, res) {
    log.info("Serving INDEX");
    res.render("upload", {test: "Good test!"});
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
