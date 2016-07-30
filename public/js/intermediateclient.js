//var colorList = ['#CCFFCC', '#CCDDFF', '#CCAAFF', '#FFEEEE', '#FFAA66', '#00FF00', '#AAAAAA'];

// global constants
//console.log('global');
//const colorList = ['#aec7e8', '#ff7f0e', '#2ca02c', '#d62728', '#bcbd22', '#e377c2', '#17becf', '#9467bd', '#17becf', '#8c564b'];
const colorList = ['#aec7e8', '#ff7f0e', '#2ca02c', '#d62728', '#bcbd22', '#e377c2', '#17becf', '#9467bd', '#17becf', '#8c564b'];
const regex = {
	'parseSentence': /Intermediate results for: \"(.*)\"/,
	'getIdRegex': /([0-9]*):.*/
};

// global variables used to track state
//var highlighted = [];
var highlighted = null

function generateColor(colorCounter, colorMax) {
	// Returns distinct colors by changing hue
	var h = Math.floor( 360 * colorCounter/colorMax );
	var s = "100%";
	var l = "85%";
	return "hsl("+[h,s,l].join(',')+")";
};

// set up the page once the DOM has loaded
$(document).ready(function () {
	//console.log('aaaaaaaaaaaaaaaaaa');

	// read data passed from the server
	console.log('reading data');
	var data = {};
	var dataContainer = $("#data-sync");
	if (dataContainer.length > 0 && $("#data-sync")[0].textContent != "")
	  data = JSON.parse($("#data-sync")[0].textContent);
	console.log(data);

	// parse the sentence
	for (var parseIndex = 0; parseIndex < data.length; parseIndex++) {
		let index = parseIndex + 0
		setTimeout(function(){ parseSentence(index) }, 1);
	}

	function parseSentence (parseIndex) {
		var parseResults = data[parseIndex]
//		console.log('parsing sentence: ' + parseResults.sentence);
		var parseContainer = $('#parse-' + parseIndex)
//		console.log(parseContainer)
		var sentenceContainer = parseContainer.find('#sentence .sentenceText')
		parseResults.sentenceMappings = JSON.parse(parseResults.sentenceMappings)
		var sentence = parseResults.sentence
		for (var i in parseResults.lexMappings) {
			var mapping = parseResults.lexMappings[i]
			var sentence = sentence.replace(new RegExp('\\b' + mapping.token + '\\b'), '<span data-entity-id="' + i + '" parent-id="' + i + ':0.0" class="highlightable word">' + mapping.token + '</span>')
		}
		sentenceContainer.html(sentence)
		
		// set the colors for each lex mapping
//		console.log('setting colors');
		for (var i in parseResults.lexMappings) {
	//		var lex = data.lexMappings[i];
	//		console.log(i);
	//		console.log(lex);
	//		var id = lex.id.match(regex.getIdRegex)[1];
	//		var parentId = lex.parent.match(regex.getIdRegex)[1];
			//$("[data-entity-id='" + i + "']").css("background-color", colorList[id]);
			//$("[data-entity-id='" + lex.parent + "']").css("background-color", colorList[parentId]);
			
			//parseContainer.find("[parent-id='" + i + ":0.0']").css("background-color", colorList[i])
			parseContainer.find("[parent-id='" + i + ":0.0']").css("background-color", generateColor(i, parseResults.lexMappings.length))
		}
		
//		console.log('binding listeners');
		//bindRowHighlights(parseContainer)
		bindHighlightListeners(parseContainer)
		bindHideListeners(parseContainer)
//		console.log('done');
	}

	$('#showHideAll').click(function () {
		if ($(this).html() == "Hide All") {
			$(".parseContainer").removeClass("collapsed")
			$(this).html("Show All")
			$('span.sentenceMinimize').html('Hide')
		} else {
			$(".parseContainer").addClass("collapsed")
			$(this).html("Hide All")
			$('span.sentenceMinimize').html('Show')
		}

		$('span.sentenceMinimize').each(function (i, o) {
			//console.log(o)
			toggleHide($(o))
		})
	})
	//resetScrollHeight(parseContainer)
});

function bindHighlightListeners (parseContainer) {
	var depElements = parseContainer.find('[dep]')
	depElements
		.mouseenter(function () {
			var dep = $(this).attr('dep')
			depElements.removeClass('highlighted')
			setTimeout(function () {
				parseContainer.find('[dep="' + dep + '"]').addClass('highlighted')
			}, 1)
		})
		.mouseleave(function () {
			depElements.removeClass('highlighted')
		})
}

function bindHideListeners (parseContainer) {
	var heads = parseContainer.find('table.word-parse thead')
	var hideButtons = parseContainer.find("span.sentenceMinimize")
	var modeButtons = parseContainer.find("span.sentenceShowRaw")

	heads.click(function () {
		var table = $(this).parent()
		table.toggleClass('closed')
	})

	hideButtons.click(function () {
		console.log(this)
		toggleHide($(this))
	})
	
	modeButtons.click(function () {
		console.log(this)
		var guiContainer = $(this).closest(".parseContainer").find('.guiContainer')
		var rawContainer = $(this).closest(".parseContainer").find('.rawContainer')
		if ($(this).html() == "Show Raw") {
			$(this).html("Show Parse")
			guiContainer.addClass('hidden')
			rawContainer.removeClass('hidden')
		} else {
			$(this).html("Show Raw")
			rawContainer.addClass('hidden')
			guiContainer.removeClass('hidden')
		}
	})
}

function toggleHide (button) {
	button.closest(".parseContainer").toggleClass("collapsed")
	if (button.html() == "Hide")
		button.html("Show")
	else
		button.html("Hide")
}

/*
// collapse the sentence body when the button is pressed
$("span.sentence-minimize").on("click", function(e) {
	$(this).closest(".sentence").toggleClass("collapsed");
	if ($(this).html() == "Hide")
		$(this).html("Show");
	else
		$(this).html("Hide");
});
*/

/*
// bind the hover listeners for each row
function bindRowHighlights (parseContainer) {
//	console.log('bindRowHighlights()');
	parseContainer.find('.eventRow').mouseenter(function () {
//		console.log('this = ');
//		console.log(this);
		var entryIds = $(this).attr('data-entries').split(',');//.slice(0, -1);
		
		if (highlighted == entryIds) {
			// do nothing
		} else {
			// change the highlight
			changeHighlight(entryIds, parseContainer);
		}
//		console.log(highlighted);
	});
	parseContainer.find('table.word-parse').mouseleave(function () {
		unhighlightAll(parseContainer);
	});
}

// unhighlights the old id and sets the new highlighted id to the specified id
function changeHighlight (newIds, parseContainer) {
	unhighlightAll(parseContainer);
	for (var i in newIds) {
		var id = newIds[i];
		parseContainer.find('[data-entity-id="' + id + '"]').addClass('highlighted');
	}
	highlighted = newIds;
}

// unhighlights everything
function unhighlightAll (parseContainer) {
	for (var i in highlighted)
		parseContainer.find('[data-entity-id="' + highlighted[i] + '"]').removeClass('highlighted');
	highlighted = [];
}
*/
