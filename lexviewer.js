var lexicon = require('./lexicon.js');

module.exports = {
	findEntry: function(lexSense) {
		var lexKey = lexSense.replace(/-.*?$/, '');
		if (lexicon.hasOwnProperty(lexKey) && lexicon[lexKey].hasOwnProperty(lexSense))
				return lexicon[lexKey][lexSense];
		else
			return false;
	}
};
