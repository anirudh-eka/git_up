$(document).ready(function() {
	var timer = new Timer();
	timer.importSchedEvent($("#event-name"), $("#event-start-time").data("datestring"));
	var timerStatus = new TimerStatus(timer, $("#timer-status"));

	setInterval(function(){
		timer.updateCurrentTime($("#current-time"));
		if(!timer.isZero($("#time-left"))) {
			timer.updateTimer($("#time-left"))
		}
	}, 500)
});

function Timer() {
	this.nextEvent;

	this.isZero = function(timerContainer) {
		if (timerContainer.text() == "0:00:00"){
			console.log($(this));
			$(this).trigger("reachedZero");
			return true;
		}
		return false;
	}

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
		formatedTime += _formatTensPlace(time.getMinutes());
		formatedTime += ":";
		formatedTime += _formatTensPlace(time.getSeconds());
		return formatedTime
	}

	function _formatTensPlace(number) {
		if(number < 10) {
			return "0"+number;
		} else {
			return number;
		}
	}
}

function TimerStatus(timer, container) {
	$(timer).on("reachedZero", function(){
		container.text("You're Late!");
		container.addClass("warning-color")
	});
}

function SchedEvent(name, startTime) {
	return {name: name, startTime: new Date(startTime)};	
}