var utils = require('./utils.js');
var log = utils.richLogging;
var TMRFormatter = require('./tmr.js').format;

module.exports = {
  index: function(req, res) {
    log.info("Serving INDEX");
    res.render("layout", {test: "Good test!"});
  },
  upload: function(req, res) {
    var data = JSON.parse(req.body.inputData.replace(/\'/g, '\"'));
    var formattedData = TMRFormatter(data);

    res.render("layout", {
      debugging: false,
      test: "Route: 'example', Layout: 'layout.dust'",
      results: formattedData,
      data: JSON.stringify(formattedData)
    });
  },
  intermediate: function(req, res) {
    log.info("Serving EXAMPLE");

    res.render("layout", {
      debugging: true,
      test: "Intermediate results viewer!"
    });
  },
  tmr: function(req, res) {
    log.info("Serving EXAMPLE");

    // Fetching hardcoded example data
    var data = utils.exampleData;
    var formattedData = TMRFormatter(data);

    res.render("layout", {
      debugging: false,
      test: "Route: 'example', Layout: 'layout.dust'",
      results: [],
      data: JSON.stringify(formattedData)
    });
  }
};
