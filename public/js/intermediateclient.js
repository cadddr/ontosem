//var colorList = ['#CCFFCC', '#CCDDFF', '#CCAAFF', '#FFEEEE', '#FFAA66', '#00FF00', '#AAAAAA'];

// global constants
const colorList = ['#aec7e8', '#ff7f0e', '#2ca02c', '#d62728', '#bcbd22', '#e377c2', '#17becf', '#9467bd', '#17becf', '#8c564b'];
const regex = {
	'parseSentence': /Intermediate results for: \"(.*)\"/,
	'getIdRegex': /([0-9]*):.*/
};

// global variables used to track state
var highlighted = null

// Returns distinct colors by changing hue
function generateColor(colorCounter, colorMax) {
	var h = Math.floor( 360 * colorCounter/colorMax );
	var s = "100%";
	var l = "85%";
	return "hsl("+[h,s,l].join(',')+")";
};

// set up the page once the DOM has loaded
$(document).ready(function () {

	// read data passed from the server
	console.log('reading data');
	var data = {};
	var dataContainer = $("#data-sync");
	if (dataContainer.length > 0 && dataContainer[0].textContent != "")
	  data = JSON.parse($("#data-sync")[0].textContent);
	console.log(data);

	// parse the sentences
	for (var parseIndex = 0; parseIndex < data.length; parseIndex++) {
		let index = parseIndex + 0
		setTimeout(function(){
			var parseResults = data[index]
			var parseContainer = $('#parse-' + index)
			//console.log('parsing sentence: ' + parseResults.sentence);
			parseSentence(parseResults, parseContainer)
		}, 1);
	}
	
	// bind the hide/show all button listener
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
			toggleHide($(o))
		})
	})
	
	$(window).resize(function () {
		correctHeaderWidth()
	})
	
	correctHeaderWidth()
});

function correctHeaderWidth () {
	var newWidth = Math.min($(window).width() / 2, 650);
	$('header').css('transform', 'translateX(-' + newWidth + 'px) translateZ(0)');
}

function parseSentence (parseResults, parseContainer) {
	var sentenceContainer = parseContainer.find('#sentence .sentenceText')
	parseResults.sentenceMappings = JSON.parse(parseResults.sentenceMappings)
	var sentence = parseResults.sentence
	for (var i in parseResults.lexMappings) {
		var mapping = parseResults.lexMappings[i]
		var sentence = sentence.replace(new RegExp('\\b' + mapping.token + '\\b'), '<span data-entity-id="' + i + '" parent-id="' + i + ':0.0" class="highlightable word">' + mapping.token + '</span>')
	}
	sentenceContainer.html(sentence)
	
	// set the colors for each lex mapping
	//console.log('setting colors');
	for (var i in parseResults.lexMappings) {
		parseContainer.find("[parent-id='" + i + ":0.0']").css("background-color", generateColor(i, parseResults.lexMappings.length))
	}
	
	//console.log('binding listeners');
	bindHighlightListeners(parseContainer)
	bindHideListeners(parseContainer)
	//console.log('done');
}

// binds all the listeners for the lex entry highlighting on hover
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

// binds the listeners for all the hide/show buttons
function bindHideListeners (parseContainer) {
	var heads = parseContainer.find('table.word-parse thead')
	var hideButtons = parseContainer.find("span.sentenceMinimize")
	var modeButtons = parseContainer.find("span.sentenceShowRaw")

	heads.click(function () {
		var table = $(this).parent()
		table.toggleClass('closed')
	})

	hideButtons.click(function () {
		toggleHide($(this))
	})
	
	modeButtons.click(function () {
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

// toggles a button between the hide and show states
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
