var log = require('./utils.js').richLogging;

module.exports = {
  index: function(req, res) {
    log.info("Serving INDEX");
    res.render("layout", {test: "Good test!"});

  }
};
