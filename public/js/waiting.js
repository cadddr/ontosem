// set up the page once the DOM has loaded
$(document).ready(function () {
	listenForChanges()
});

// checks for results from the server every 500 ms
function listenForChanges () {
	checkForResults()
	window.setTimeout(listenForChanges, 500)
}

// communicates with the server to determine if there are new results to render
function checkForResults () {
	$.ajax('/getResults').done(function (response) {
		if (response == 'none') {
			// nothing
		} else if (response == 'TMR') {
			// render this TMR
			viewTMRs()
		}
	})
}

// gets the rendered TMR from the server and appends it to the page
function viewTMRs () {
	$.ajax({
		url:'/subtmr',
		method:'POST',
		data:{inputData:'external'}
	}).done(function (response) {
		$('div.container.main').html(response.tmrHTML)
		$('div#data-sync').html(response.data)
		addTMRBindings()
	})
}
