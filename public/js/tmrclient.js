resetScrollHeight();

var optionalAttributes = $();
var auxiliaryAttributes = $();
var hideButtons = $();
var hideAllButton = $();

// used to get computed target color as opposed to computed current color
// (target and current color differ during css transition)
function parseBackgroundColor(style) {
	var bgcRegExp = /background-color:.*rgba\((.*)\)(?:;|$)/;
	var result = bgcRegExp.exec(style);

	var c = [];
	if (result)
		c = result[1].split(',').map(function(s) {return Number(s)});
	else
		c = [0,0,0,0];
	return c;
}

// given color arrays, find the average and return it as an rgba color
function averageColor(cArray) {
	// removes color if no child colors
	if (cArray.length == 0)
		return "";

	var c = [0,0,0,0];

	for (var i = 0; i < 4; ++i) {
		for (var j = 0; j < cArray.length; ++j)
			c[i] += cArray[j][i];
		c[i] /= cArray.length;
	}

	for (var i = 0; i < 3; ++i)
		c[i] = Math.round(c[i]);

	// return color of average style
	return "rgba("+c.join(',')+")";
}

// bind functions to respective elements and events when the document loads
function addBindings() {
	// toggle optional or auxiliary attributes when the check box is changed
	$("input#toggleOptional").on("click", function(e) {
		optionalAttributes.toggleClass("hide");
	});
	$("input#toggleAuxiliary").on("click", function(e) {
		 auxiliaryAttributes.toggleClass("hide");
	});

	// add events for the hide all button in the toolbar
	hideAllButton = $("#minimize-all");
	hideAllButton.on("update", function(e) {
		if (hideButtons.filter(function() {
			return $(this).html() == "Hide";
		}).length)
			$(this).html("Hide All");
		else
			$(this).html("Show All");
	});

	hideAllButton.on("click", function(e) {
		var matchingButtons = $();

		if ($(this).html() == "Hide All") {
			matchingButtons = hideButtons.filter(function() {
				return $(this).html() == "Hide";
			});
			$(this).html("Show All");
		}
		else {
			matchingButtons = hideButtons.filter(function() {
				return $(this).html() == "Show";
			});
			$(this).html("Hide All");
		}

		matchingButtons.trigger("click");
	});

	updateBindings();
}

// adds bindings that are specific to the current TMRs on the page
function updateBindings () {
	optionalAttributes = $("tr.kv-pair.optional");
	auxiliaryAttributes = $("tr.kv-pair.auxiliary");

	// collapse/expand the sentence body when the button is pressed
	hideButtons = $("span.sentence-minimize:not(#minimize-all)");
	hideAllButton.trigger("update");
	
	hideButtons.on("click", function(e) {
		$(this).closest(".sentence").toggleClass("collapsed");
		if ($(this).html() == "Hide")
			$(this).html("Show");
		else
			$(this).html("Hide");
		hideAllButton.trigger("update");
	});

	// toggle lexicon entries when applicable from-sense is pressed
	$("td.lex").on("click", function(e) {
		if (e.target == this || $(e.target).hasClass("close-button")) {
			var lexContainer = $(this).children("ul.lex-container");
			if (lexContainer.hasClass("centered")) {
				$("#bg-dim").toggleClass("hide");
			}
			else if (lexContainer.hasClass("hide")) {
				var parentPos = $(this).offsetParent().offset();
				var lexPos = {"left": event.pageX - parentPos.left, "top": event.pageY - parentPos.top}
				lexContainer.offset(lexPos);
			}

			lexContainer.toggleClass("hide");
		}
	});


	// assigns average color of active children
	$(".multi-color").on("colorupdate", function(e) {
		var cArray = [];
		var count = 0;

		$(this).children().each(function(index, child) {
			c = parseBackgroundColor($(child).attr("style"));
			if (c[3]) // c[3] = alpha, if 0 then c is fully transparent/no color
				cArray.push(c);
		});
		$(this).css("background-color", averageColor(cArray));
	});

	// assigns average
	$(".multi-color").on("mouseover mouseout click", function(e) {
		if (e.target == this) {
			var multiChildren = $(this).children();
			if (e.type == "click") {
				var unlocked = multiChildren.filter(":not(.highlight-lock)")
				if (unlocked.length > 0)
					multiChildren = unlocked;
			}
			multiChildren.trigger("effective"+e.type);
		}
	});

	$("[data-entity-color]").on("mouseover mouseout click", function(e) {
		$(this).trigger("effective"+e.type);
	});

	// manages highlighting events
	$("[data-entity-color]").on("effectivemouseover effectivemouseout effectiveclick", function(e) {
		var color = $(this).attr("data-entity-color");
		var matches = $(this).closest(".sentence").find("[data-entity-color='"+color+"']");

		if (e.type == "effectivemouseout") { // remove color if not locked
			matches = matches.filter(":not(.highlight-lock)");
			color = "";
		} else if (e.type == "effectiveclick") { // toggle lock then determine whether to color or not
			matches.toggleClass("highlight-lock");
			if ( !($(this).hasClass("highlight-lock")) )
				color = "";
		}

		// if color == "", background-color style is removed
		matches.css("background-color", color);

		// update color of any affected multi-color words
		var multiColorWords = matches.filter(".asterisk").parent();
		multiColorWords.trigger("colorupdate");
	});
}

$(document).ready(addBindings);
