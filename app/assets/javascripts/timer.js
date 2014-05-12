$(document).ready(function() {
	var timer = new Timer();
	timer.importSchedEvent($("#event-name"), $("#event-start-time").data("datestring"));

	setInterval(function(){
		timer.updateCurrentTime($("#current-time"));
		timer.updateTimer($("#time-left"))
	}, 500)
});

function Timer() {
	this.nextEvent;

	this.updateTimer = function(timerContainer) {
		var time = this.nextEvent.startTime - this.getCurrentTime()

		var diff = new Date(this.nextEvent.startTime - this.getCurrentTime());
		var formatedDiff = _formatTimerText(time)
		timerContainer.text(formatedDiff);
	}

	this.updateCurrentTime = function(timeContainer) {
		var currentTime = (new Date).toLocaleTimeString()
		timeContainer.text(currentTime)
	}

	this.getCurrentTime = function() {
		return new Date();
	}

	this.importSchedEvent = function(name, time) {
		this.nextEvent = new SchedEvent(name.text(), time)
	}


	function _formatTimerText(time) {
		var formatedTime = Math.floor(time/3600000);
		formatedTime += ":";

		var time = new Date(time);
		if(time.getMinutes() < 10) {
			formatedTime += "0"+time.getMinutes();
		} else {
			formatedTime += time.getMinutes();
		}

		formatedTime += ":";

		if(time.getSeconds() < 10) {
			formatedTime += "0"+time.getSeconds();
		} else {
			formatedTime += time.getSeconds();
		}
		return formatedTime
	}
}


function SchedEvent(name, startTime) {
	//make start time a date object....<----this is where you left off
	return {name: name, startTime: new Date(startTime)};	
}