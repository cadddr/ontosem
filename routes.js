var log = require('./utils.js').richLogging;
var template = require('./templateengine.js');

module.exports = {
  index: function(req, res) {
    log.info("Serving INDEX");
    res.render("layout", {test: "Good test!"});

  }
};
