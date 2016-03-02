var utils = require('./utils.js');
var log = utils.richLogging;
var TMRFormatter = require('./tmr.js').format;
var intermediateFormatter = require('./intermediate.js').format;

module.exports = {
  index: function(req, res) {
    log.info("Serving INDEX");
    res.render("layout", {test: "Good test!"});
  },
  intermediate: function(req, res) {
	log.info("Serving EXAMPLE");
	var raw = utils.exampleIntermediate;
	var data = intermediateFormatter(raw);
	var tmrData = TMRFormatter(data.TMR);
	var entities = tmrData.entities;
	
	data.tmrData = tmrData;
	data.tmrString = JSON.stringify(tmrData);
	data.dataString = JSON.stringify(data.lexEntries);
	log.info(data.lexEntries);
	log.info(data.dataString);
	
	res.render("intermediate", {'data':data, 'dataString':JSON.stringify(data)});
  },
  tmr: function(req, res) {
    log.info("Serving EXAMPLE");

    // Fetching hardcoded example data
    var data = utils.exampleData;
    var formattedData = TMRFormatter(data);

    res.render("layout", {
      debugging: false,
      test: "Route: 'example', Layout: 'layout.dust'",
      results: formattedData,
      data: JSON.stringify(formattedData)
    });
  }
};
