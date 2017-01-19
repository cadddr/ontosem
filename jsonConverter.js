
// contains all the regular expressions used to convert the python object into JSON
var regex = {
	'pythonNumericKeySelection': /((\{|,)\s*)([0-9]+)(\:\s*)/g,
	'pythonNumericKeySubstitution': '$1\"$3\"$4',
	
	'orderedDictSelection': /(OrderedDict\(\[[^:]*\]\))/g,
	'convertDict': /\('([^,]*)'\s*,\s*'([^,]*)'\)/,
	'extractPairs':   /\('([^,]*)'\s*,\s*'([^,]*)'\)/g,
	'tuple': /\(([^\)]*)\)/g,
	'tupleSubstitution': '[$1]',
	'convertNonStringKeys': /(\[[^\[^\]]*\])(\s*:)/g,
	'convertNonStringKeysSub': '"$1"$2',
	'removeInvalidCommas': /,(\s*)]/g,
	'removeInvalidCommasSub': '$1\]',
}

module.exports = {
	// converts a string of a python object into a JSON object
	pythonToJson: function (pythonString) {
		//console.log('pythonToJson()')
		//console.log(pythonString)
		
		var jsonString = pythonString
		
		// stringify numeric keys
		jsonString = jsonString.replace(regex.pythonNumericKeySelection, regex.pythonNumericKeySubstitution)
		
		// convert all OrderedDicts into JSON objects
		var orderedDictInstances = jsonString.match(regex.orderedDictSelection);
		var lastIndex = 0;
		if (orderedDictInstances)
			for (var j = 0; j < orderedDictInstances.length; ++j) {
				// find the indices of the bounds of the OrderedDict in the string
				var startIndex = jsonString.substr(lastIndex).indexOf(orderedDictInstances[j]) + lastIndex
				var endIndex = startIndex + orderedDictInstances[j].length + 1
				
				// obtain the full strings of all the text before and after this OrderedDict
				var textBefore = jsonString.substring(0, startIndex)
				var textAfter = jsonString.substr(endIndex - 1)
				
				// convert the OrderedDict into a JSON object
				var dictString = convertDict(orderedDictInstances[j])
				
				// update the JSON string with the converted OrderedDict
				jsonString = textBefore + dictString + textAfter
				lastIndex = startIndex + dictString.length
			}
		
		
		// fix single quoted keys in maps
		var inString = false
		var jsonCharacterList = jsonString.split('')
		for (var i in jsonCharacterList)
			if (jsonCharacterList[i] == '"')
				inString = !inString
			else if (!inString && jsonCharacterList[i] == '\'')
				jsonCharacterList[i] = '"'
		jsonString = jsonCharacterList.join('')
		
		// remove touples
		jsonString = jsonString.replace(regex.tuple, regex.tupleSubstitution)
		
		// convert improper key types like lists to strings
		jsonString = jsonString.replace(regex.convertNonStringKeys, regex.convertNonStringKeysSub)
		
		// removes invalid commas such as ["test",]
		jsonString = jsonString.replace(regex.removeInvalidCommas, regex.removeInvalidCommasSub)
		
		// parse the object as JSON
		return JSON.parse(jsonString)
		
		// helper function used to convert a python OrderedDict into a JSON object
		function convertDict (dictString) {
			var pairs = dictString.match(regex.extractPairs)
			var dictObject = {}
			for (var p in pairs) {
				var pair = pairs[p]
				var keyAndVal = pair.match(regex.convertDict)
				var key = keyAndVal[1]
				var val = keyAndVal[2]
				dictObject[key] = val
			}
			
			return JSON.stringify(dictObject)
		}
	}
}
