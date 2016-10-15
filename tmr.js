var utils = require('./utils.js');
var log = utils.richLogging;
var lexViewer = require('./lexviewer.js');

// the set of attributes which exclusively connects entities to other entities
var relations = new Set(Object.keys(utils.inverseMap));
var auxiliaryKeys = new Set(["is-in-subtree","syn-roles","lex-source","concept","word-ky"]);

//
function extractValue(attrKey, attrVal) {
	if (relations.has(attrKey)) {
		if ( !(typeof attrVal === 'string') && !(attrVal instanceof String)) {
			if (attrVal.hasOwnProperty("VALUE"))
				attrVal = attrVal.VALUE;
			else if (attrVal.hasOwnProperty("value"))
				attrVal = attrVal.value;
			else
				Object.stringify(attrVal);
		}
	}
	return attrVal;
}

// takes a string input and separates it into its components
function dissectSentences(sentence) {
	var sentenceRegExp = /(.*?)([!?.](?:\s|$))/g;
	var wordRegExp = /('*\w+)(\s*)/g;
	var outerResult = [];
	var sentences = [];

	while (outerResult = sentenceRegExp.exec(sentence)) {
		var words = [];
		var innerResult = [];
		while (innerResult = wordRegExp.exec(outerResult[1]))
			words.push({"_token": innerResult[1], "_spacing": innerResult[2], "colors": []});
		sentences.push({"words": words, "_punct": outerResult[2]});
	}

	// sentences structure:
	// sentences = [sentence1, sentence2, ..., sentenceN]
	// sentence = {words: [word1, word2, ..., wordN], _punct: (string)}
	// word = {_token: (string), _spacing: (string), colors: [color1, color2, ..., colorN]}
	return sentences;
}

// sort frames such that modality > event > object
function sortFrames(frames) {
	var modality = [];
	var events = [];
	for (var i = frames.length-1; i >= 0; --i) {
		if (frames[i].attributes.auxiliary.hasOwnProperty("is-in-subtree")) {
			if (frames[i].attributes.auxiliary["is-in-subtree"]._val == "EVENT")
				events.push(frames.splice(i, 1)[0]);
		}
		else
			modality.push(frames.splice(i, 1)[0]);
	}

	var sortedFrames = modality.concat(events, frames);
	return sortedFrames;
}

// returns distinct colors by changing hue
function generateColor(colorCounter, colorMax) {
	var h = Math.floor( 360 * colorCounter/colorMax );
	var s = "80%";
	var l = "50%";
	var a = "0.3";
	return "hsla("+[h,s,l,a].join(',')+")";
};

function insertLinebreaks(s) {
	return s.toString().split(",").join("\n");
};

module.exports = {
	format: function(data) {
		// passed a raw JSON TMR, returns a formatted and annotated
		// JSON object to render the decorated TMR to the browser
		var sentenceId = data.sentenceId;
		var sentences = dissectSentences(data.sentence);
		var tmrIndex = data.tmrIndex;
		var tmr = data.tmr;

		log.attn("Interpreting TMR...");

		var frames = [];
		var entitySet = new Set(Object.keys(tmr));
		var sentOffset = -1;

		var color = {};
		var colorCounter = 0;
		var colorMax = entitySet.size;
		for (var entityName in tmr) {
			color[entityName] = generateColor(colorCounter, colorMax);
			++colorCounter;

			// figure out which sentence index we are starting at
			if (tmr[entityName].hasOwnProperty("sent-word-ind"))
				if (tmr[entityName]["sent-word-ind"][0] < sentOffset || sentOffset == -1)
					sentOffset = tmr[entityName]["sent-word-ind"][0];
		}

		for (var entityName in tmr) {
			var entityData = tmr[entityName];
			var isObject = (entityData["is-in-subtree"] == "OBJECT");
			var required = {};
			var optional = {};
			var auxiliary = {};

			for (var attrKey in entityData) {
				// some attribute values come as objects which only contain a single value
				// simply check and extract the contained string if attrVal is not a string
				var attrVal = extractValue(attrKey, entityData[attrKey]);
				var attr = {"_val": insertLinebreaks(attrVal)};

				if (attrKey == "sent-word-ind") {
					// associate token with entity color(s)
					sentences[attrVal[0]-sentOffset].words[attrVal[1]].colors.push(color[entityName]);
				}
				else if (attrKey == "from-sense") {
					// search for lexicon entry, and add if found
					var lex = lexViewer.findEntry(attrVal);
					if (lex)
						attr._lex = lex;
				}
				else if (entitySet.has(attrVal)) {
					// add color to entity reference
					attr._color = color[attrVal];
				}


				// push entries into appropriate array, based on capitalization/auxiliary
				if (utils.isCapitalized(attrKey))
					required[attrKey] = attr;
				else if (auxiliaryKeys.has(attrKey))
					auxiliary[attrKey] = attr;
				else
					optional[attrKey] = attr;
			}

			// push data as a frame object to frames list
			frames.push({
				"_key": entityName,
				"_color": color[entityName],
				"attributes": {
					"required": required,
					"optional": optional,
					"auxiliary": auxiliary
				}
			});
		}

		// sort the frames such that events come first
		frames = sortFrames(frames);

		// return the annotated set along with the collection of
		// known entities, as well as the sentence itself.
		return {
			"_sentenceId": sentenceId,
			"sentences": sentences,
			"_tmrIndex": tmrIndex,
			"frames": frames,
			"_dataString": data.dataString
		};
	},

	// do some preprocessing on the TMR to make it easier to annotate
	formatTMRList: function (formattedData) {
		var results = [];
		for (var index in formattedData) {
			var entry = formattedData[index].TMRList;
			for (var stepIndex in entry) {
				var sentenceId = entry[stepIndex]["sent-num"];
				var sentence = entry[stepIndex].sentence;

				for (var tmrIndex in entry[stepIndex].results) {
					var tmr = entry[stepIndex].results[tmrIndex].TMR;
					var dataString = JSON.stringify(entry[stepIndex]);
					if (tmr) {
						var formattedResult = module.exports.format({
							"sentenceId": sentenceId,
							"sentence": sentence,
							"tmrIndex": tmrIndex,
							"tmr": tmr,
							"dataString": dataString
						});
						results.push(formattedResult);
					}
				}
			}
		}
		return results
	}
};
