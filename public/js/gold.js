// set up the page once the DOM has loaded
$(document).ready(function () {
	// fill the input field with the tmr string sent from opener
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
});

