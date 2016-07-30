// set up the page once the DOM has loaded
$(document).ready(function () {
	listenForChanges()
});

function listenForChanges () {
	checkForResults()
	window.setTimeout(listenForChanges, 1000)
}

function checkForResults () {
	console.log('checkForResults()');
	$.ajax('/getResults').done(function (response) {
		console.log(response)
		//var result = response
		if (response == 'none') {
			console.log('no results yet')
		} else if (response == 'TMR') {
			console.log('we got the results')
			viewTMRs()
		}
	})
}

function viewTMRs () {
	$('#submitTMR').submit()
}
