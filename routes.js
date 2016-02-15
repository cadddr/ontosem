var utils = require('./utils.js');
var log = utils.richLogging;
var TMRFormatter = require('./tmr.js').format;

module.exports = {
  index: function(req, res) {
    log.info("Serving INDEX");
    res.render("layout", {test: "Good test!"});
  },
  example: function(req, res) {
    log.info("Serving EXAMPLE");

    // Fetching hardcoded example data
    var data = utils.exampleData;
    var formattedData =TMRFormatter(data);

    res.render("layout", {
      test: "Route: 'example', Layout: 'layout.dust'",
      results: formattedData,
      data: JSON.stringify(formattedData)
    });
  }
};
