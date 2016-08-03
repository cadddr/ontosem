var utils = require('./utils.js');
var log = utils.richLogging;

// The set of attributes which exclusively connects entities to other entities
var relations = new Set(Object.keys(utils.inverseMap));
var debugKeys = new Set(["is-in-subtree","syn-roles","lex-source","concept", "word-ky"]);

function dissectSentences(sentence) {
	var sentenceRegExp = /(.*?)([!?.](?:\s|$))/g;
	var wordRegExp = /('*\w+)(\s*)/g;
	var outerResult = [];
	var sentences = [];

	while (outerResult = sentenceRegExp.exec(sentence)) {
		//console.log(outerResult);
		var words = [];
		var innerResult = [];
		while (innerResult = wordRegExp.exec(outerResult[1]))
			words.push({"_token": innerResult[1], "_spacing": innerResult[2]});
		sentences.push({"words": words, "_punct": outerResult[2]});
	}

	//log.attn(sentence);
	//console.log(sentences);
	return sentences;
}

function sortFrames(frames) {
	var modality = [];
	var events = [];
	for (var i = frames.length-1; i >= 0; --i) {
		if (frames[i].attributes.debug.hasOwnProperty("is-in-subtree")) {
			if (frames[i].attributes.debug["is-in-subtree"]._val == "EVENT")
				events.push(frames.splice(i, 1)[0]);
		}
		else
			modality.push(frames.splice(i, 1)[0]);
	}
	//console.log(modality);
	//console.log(events);
	//console.log(frames);

	var sortedFrames = modality.concat(events, frames);
	return sortedFrames;
}

function generateColor(colorCounter, colorMax) {
	// Returns distinct colors by changing hue
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
		// Passed a raw JSON TMR, returns a formatted and annotated
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
			if (sentOffset && tmr[entityName]["sent-word-ind"][0] == 0)
				sentOffset = 0;
		}

		for (var entityName in tmr) {
			var entityData = tmr[entityName];
			var isObject = (entityData["is-in-subtree"] == "OBJECT");
			var required = {};
			var optional = {};
			var debug = {};
			//var insertAfter = [];


			for (var attrKey in entityData) {
				var attrVal = entityData[attrKey];
				//log.attn('attrKey = ' + attrKey + ', attrVal = ' + attrVal)

				// Some attribute values come as objects which only contain a single value
				// Simply check and extract the contained string if attrVal is not a string
				if (relations.has(attrKey)) {
					if ( !(typeof attrVal === 'string') && !(attrVal instanceof String))
						attrVal = (attrVal.VALUE ? attrVal.VALUE : attrVal.value) + '';
					//if (!isObject)
					//	insertAfter.push(attrVal);
				}
				
				
				
				var attr = {"_val": insertLinebreaks(attrVal)};

				// associate token with entity color
				if (attrKey == "sent-word-ind")
					sentences[0].words[attrVal[1]]._color = color[entityName];
					//sentences[attrVal[0]+sentOffset].words[attrVal[1]]._color = color[entityName];
				else if (entitySet.has(attrVal))
					attr._color = color[attrVal];

				// push entries into appropriate array, based on capitalization/debug
				if (utils.isCapitalized(attrKey))
					required[attrKey] = attr;
				else if (debugKeys.has(attrKey))
					debug[attrKey] = attr;
				else
					optional[attrKey] = attr;
			}

			frames.push({
				"_key": entityName,
				"_color": color[entityName],
				"attributes": {
					"required": required,
					"optional": optional,
					"debug": debug
				}
				//},
				//"insertAfter": insertAfter
			});
		}

		// Sort the frames such that events come first
		frames = sortFrames(frames);
		//console.log(frames);
		// Return the annotated set along with the collection of
		// known entities, as well as the sentence itself.
		return {
			"_sentenceId": sentenceId,
			"sentences": sentences,
			"_tmrIndex": tmrIndex,
			"frames": frames
		};
	},
	formatTMRList: function (formattedData) {
		var results = []
		for (var index in formattedData) {
			var entry = formattedData[index].TMRList;
			for (var stepIndex in entry) {
				var sentenceId = entry[stepIndex]["sent-num"];
				var sentence = entry[stepIndex].sentence;

				for (var tmrIndex in entry[stepIndex].results) {
					var TMR = entry[stepIndex].results[tmrIndex].TMR
					if (TMR) {
						var formattedResult = module.exports.format({
							"sentenceId": sentenceId,
							"sentence": sentence,
							"tmrIndex": tmrIndex,
							"tmr": TMR
						});
						results.push(formattedResult);
					}
				}
			}
		}
		return results
	}
};
