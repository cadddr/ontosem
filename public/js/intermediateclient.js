//var colorList = ['#CCFFCC', '#CCDDFF', '#CCAAFF', '#FFEEEE', '#FFAA66', '#00FF00', '#AAAAAA'];

// global constants
console.log('global');
const colorList = ['#aec7e8', '#ff7f0e', '#2ca02c', '#d62728', '#bcbd22', '#e377c2', '#17becf', '#9467bd', '#17becf', '#8c564b'];
const regex = {
	'parseSentence': /Intermediate results for: \"(.*)\"/,
	'getIdRegex': /([0-9]*):.*/
};

// global variables used to track state
var highlighted = [];

// set up the page once the DOM has loaded
$(document).ready(function () {
	console.log('aaaaaaaaaaaaaaaaaa');

	// read data passed from the server
	console.log('reading data');
	var data = {};
	var dataContainer = $("#data-sync");
	if (dataContainer.size() > 0 && $("#data-sync")[0].textContent != "")
	  data = JSON.parse($("#data-sync")[0].textContent);
	console.log(data);

	// parse the sentence
	console.log('parsing sentence');
	var sentenceContainer = $('#sentence');
	data[0].sentenceMappings = JSON.parse(data[0].sentenceMappings);
	var sentence = data[0].sentence;
	for (var i in data[0].lexMappings) {
		var mapping = data[0].lexMappings[i];
		var sentence = sentence.replace(new RegExp('\\b' + mapping.token + '\\b'), '<span data-entity-id="' + i + '" parent-id="' + i + ':0.0" class="highlightable">' + mapping.token + '</span>');
	}
	sentenceContainer.html('Intermediate results for "' + sentence + '"');
	
	// set the colors for each lex mapping
	console.log('setting colors');
	for (var i in data[0].lexMappings) {
//		var lex = data.lexMappings[i];
//		console.log(i);
//		console.log(lex);
//		var id = lex.id.match(regex.getIdRegex)[1];
//		var parentId = lex.parent.match(regex.getIdRegex)[1];
		//$("[data-entity-id='" + i + "']").css("background-color", colorList[id]);
		//$("[data-entity-id='" + lex.parent + "']").css("background-color", colorList[parentId]);
		$("[parent-id='" + i + ":0.0']").css("background-color", colorList[i]);
	}
	
	console.log('binding listeners');
	bindRowHighlights();
	
	resetScrollHeight()
	console.log('done');
});

// bind the hover listeners for each row
function bindRowHighlights () {
	console.log('bindRowHighlights()');
	$('.eventRow').mouseenter(function () {
//		console.log('this = ');
//		console.log(this);
		var entryIds = $(this).attr('data-entries').split(',');//.slice(0, -1);
		
		if (highlighted == entryIds) {
			// do nothing
		} else {
			// change the highlight
			changeHighlight(entryIds);
		}
//		console.log(highlighted);
	});
	$('table.word-parse').mouseleave(function () {
		unhighlightAll();
	});
}

// unhighlights the old id and sets the new highlighted id to the specified id
function changeHighlight (newIds) {
	unhighlightAll();
	for (var i in newIds) {
		var id = newIds[i];
		$('[data-entity-id="' + id + '"]').addClass('highlighted');
	}
	highlighted = newIds;
}

// unhighlights everything
function unhighlightAll () {
	for (var i in highlighted)
		$('[data-entity-id="' + highlighted[i] + '"]').removeClass('highlighted');
	highlighted = [];
}