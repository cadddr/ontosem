var dataIndex = 0;

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
	var title = $('title').html();
	var url = '/getTMRResults';
	if (title == 'page-intermediate')
		url = '/getIntermediateResults';

	$.ajax(url).done(function (response) {
		if (response == 'none') {
			// nothing
		} else if (response == 'TMR') {
			// render this TMR
			viewTMRs()
		} else if (response == 'intermediate') {
			// render this TMR
			viewIntermediate()
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
		$('div.container.main').html(response.tmrHTML+$('div.container.main').html());
		updateBindings();
	});
}

// gets the rendered TMR from the server and appends it to the page
function viewIntermediate () {
	$.ajax({
		url:'/subintermediate',
		method:'POST',
		data:{inputData:'external', sentenceIndex:dataIndex}
	}).done(function (response) {
		$('div#intermediateContainer.waiting').html('')
		$('div#intermediateContainer.waiting').removeClass('waiting')
		$('div#intermediateContainer').append(response.intermediateHTML)
		$('div#data-sync').html(response.data)
		var data = JSON.parse(response.data)
		var parseContainer = $('#parse-' + dataIndex)
		parseSentence(data[0], parseContainer)
		++dataIndex;
	})
}
