var log = require('./utils.js').richLogging;
var template = require('./templateengine.js');

module.exports = {
  index: function(req, res) {
    log.info("Serving INDEX");
    template("layout", {test: "Good test!"}, res.send);

  }
};
