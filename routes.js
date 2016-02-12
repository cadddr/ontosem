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

    res.render("layout", {
      test: "Route: 'example', Layout: 'layout.dust'",
      results: data.map(function(item){
        return TMRFormatter(item.TMR);
      }),
      raw: JSON.stringify(utils.exampleData)
    });
  }
};
