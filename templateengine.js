var log = require('./utils.js').richLogging;
var adaro = require('adaro');
var fs = require('fs');

module.exports = function(templateName, templateData, callback) {
  var templateLocation = "./templates/" + templateName + ".dust";
  log.info("Looking for template in " + templateLocation);
  var template = fs.readFileSync(templateLocation, 'utf8');
  log.info("Found " + templateName + " at " + templateLocation);
  log.info(template);
  log.info(adaro);
  var tmpl = adaro.dust.compile(template, templateName);
  adaro.dust.loadSource(tmpl);
  adaro.dust.render(templateName, templateData, function(err, output) {
    if(err) {
      log.error(err);
      throw(err);
    }
    log.success("Found and rendered template successfully...");
    log.info(output);
    callback(output);
  });
};
