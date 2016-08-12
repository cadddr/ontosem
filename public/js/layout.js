var form = $($("form")[0]);

$("#submit-tmr").on("click", function(e){
	e.preventDefault();
	form.attr("action", "/tmr");
	form.submit();
});

$("#submit-logs").on("click", function(e){
	e.preventDefault();
	form.attr("action", "/logs");
	form.submit();
});

$("#post-tmr").on("click", function(e){
	e.preventDefault();
	form.attr("action", "/tmrData");
	form.submit();
});

$("#post-logs").on("click", function(e){
	e.preventDefault();
	form.attr("action", "/intermediateData");
	form.submit();
});

function resetScrollHeight () {
	$(".scroll").height("calc(100% - " + (50 + $(".fixedcontent").height()) + "px)");
}
