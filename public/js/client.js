resetScrollHeight();

// hide optional or debug attributes when the check box is unchecked
var optionalAttributes = $("tr.kv-pair.optional");
$("input#toggleOptional").on("click", function(e) {
	optionalAttributes.toggleClass("hide");
});

var debugAttributes = $("tr.kv-pair.debug");
$("input#toggleDebug").on("click", function(e) {
	 debugAttributes.toggleClass("hide");
});

// collapse the sentence body when the button is pressed
$("span.sentence-minimize").on("click", function(e) {
	$(this).closest(".sentence").toggleClass("collapsed");
	if ($(this).html() == "Hide")
		$(this).html("Show");
	else
		$(this).html("Hide");
});

// get the sentence ID from any element within the sentence frame
function getSentenceId(element) {
	return $(element).closest(".sentence").attr("data-sentence-id");
}

// manages highlighting events
$("[data-entity-color]").on("mouseover mouseout click", function(e) {
	var color = $(this).attr("data-entity-color");
	var matches = $(this).closest(".sentence").find("[data-entity-color='"+color+"']");

	if (e.type == "mouseout") { // remove color if not locked
		matches = matches.filter(":not(.highlight-lock)");
		color = "";
	} else if (e.type == "click") { // toggle lock then determine whether to color or not
		matches.toggleClass("highlight-lock");
		if ( !($(this).hasClass("highlight-lock")) )
			color = "";
	}

	// if color == "", background-color style is removed
	matches.css("background-color", color);
});
