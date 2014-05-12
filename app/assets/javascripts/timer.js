$(document).ready(function() {
	setInterval(function(){
		var currentTime = (new Date).toLocaleTimeString()
		$("#current-time").text(currentTime)
	}, 500)
});

function updateTime(timeContainer) {
	console.log("hello")
	var currentTime = (new Date).toLocaleTimeString()
	timeContainer.text(currentTime)
}

function SchedEvent(name) {
	return {name: name};	
}