// set up the page once the DOM has loaded
$(document).ready(function () {
	// fill the input field with the tmr string sent from opener
	if (typeof tmrJSON === "undefined")
		$("#tmr-input").val("Couldn't automatically load the TMR.\nPlease close this window before trying again.");
	else
		$("#tmr-input").val(tmrJSON);

	// bind the submit event to the button
	form = $("#tmr-form");
	$("#submit-tmr").on("click", function() {
		form.attr('action', '../dbSubmit');
		form.submit();
	});

	// load the proper format when dropdown is changed
	$("#tmr-format").on("change", function() {
		if ($(this).val() == 'json-string' || $(this).val() == 'json-object')
			$("#tmr-input").val(tmrJSON);
		else if ($(this).val() == 'dict-string')
			$("#tmr-input").val(tmrDict);
	});

	// load the proper format when dropdown is changed
	$("#db-list").on("change", function() {
		if ($(this).val() == 'leia')
			$("#action-input").val("http://leia-0.leia.rpi.edu:8080");
		else if ($(this).val() == 'manual')
			$("#action-input").val("");
	});
});
