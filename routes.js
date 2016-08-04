var request = require('request');
var utils = require('./utils.js');
var log = utils.richLogging;
var tmrFormatter = require('./tmr.js').format;
var intermediateFormatter = require('./intermediate.js').format;

module.exports = {
	index: function(req, res) {
		// Homepage
		log.info("Serving INDEX");
		res.render("index", {
			debugging: false
		});
	},
	tmr: function(req, res) {
		// Multiple TMR viewer
		log.info("Received SENTENCE");

		var inputData = req.body.inputData;
		if (inputData == "")
			inputData = utils.readInputFile();

		var formattedData = intermediateFormatter(inputData);

		var results = [];

		for (var index in formattedData) {
			var entry = formattedData[index].TMRList;

			for (var stepIndex in entry) {
				var sentenceId = entry[stepIndex]["sent-num"];
				var sentence = entry[stepIndex].sentence;

				for (var tmrIndex in entry[stepIndex].results) {
					var formattedResult = tmrFormatter({
						"sentenceId": sentenceId,
						"sentence": sentence,
						"tmrIndex": tmrIndex,
						"tmr": entry[stepIndex].results[tmrIndex].TMR
					});
					results.push(formattedResult);
				}
			}
		}

		res.render("multitmr", {
			pageTitle: 'page-tmr',
			debugging: false,
			results: results,
			clientscripts: ['client.js']
		});
	},
	intermediate: function(req, res) {
		// intermediate results viewer
		log.info("Serving INTERMEDIATE")
			var raw = utils.readInputFile()
			if (req.body.inputData.length > 0)
				raw = req.body.inputData.replace(/\\n/g, '')

			var results = intermediateFormatter(raw)
			log.info(results)
			res.render("intermediate", {
				pageTitle: 'page-intermediate',
				parseResults: results,
				data: JSON.stringify(results),
				clientscripts: ['intermediateclient.js']
			})
	}
};
