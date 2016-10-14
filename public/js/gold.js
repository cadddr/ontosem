// set up the page once the DOM has loaded
$(document).ready(function () {
	// fill the input field with the tmr string sent from opener
	$("#tmr-input").val(tmrString);

	// bind the submit event to the button
	form = $("#tmr-form");
	$("#submit-tmr").on("click", function() {
		form.attr('action', '../dbSubmit');
		form.submit();
	});

});
