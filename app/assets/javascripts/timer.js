$(document).ready(function() {
	var timer = new Timer();
	timer.setNextEvent($("#event-name").text(), $("#event-start-time").data("datestring"));
	var timerStatus = new TimerStatus(timer, $("#timer-status"));

	setInterval(function(){
		timer.updateCurrentTime($("#current-time"));
		if(!timer.isZero($("#time-left"))) {
			timer.updateTimer($("#time-left"))
		}
	}, 500)

	setInterval(function(){
		console.log("every 30 seconds?");
		timer.importSchedEventFromAJAX();
	}, 30000)
});

function Timer() {
	self = this;
	this.nextEvent;

	this.isZero = function(timerContainer) {
		if (timerContainer.text() == "0:00:00"){
			$(this).trigger("reachedZero");
			return true;
		}
		return false;
	}

	this.updateTimer = function(timerContainer) {
		console.log(this.nextEvent.startTime);
		var time = this.nextEvent.startTime - this.getCurrentTime()

		var diff = new Date(this.nextEvent.startTime - this.getCurrentTime());
		var formatedDiff = _formatTimerText(time)
		console.log(formatedDiff);
		timerContainer.text(formatedDiff);
	}

	this.updateCurrentTime = function(timeContainer) {
		var currentTime = (new Date).toLocaleTimeString()
		timeContainer.text(currentTime)
	}

	this.getCurrentTime = function() {
		return new Date();
	}

	this.setNextEvent = function(name, time) {
		this.nextEvent = new SchedEvent(name, time)
	}

	this.importSchedEventFromAJAX = function() {
		var next_event = this.getEvent(_parseJson);
	}

	this.getEvent = function(callback) {
		$.ajax({
			type: "GET",
	        url: "/",
	        contentType: "application/json; charset=utf-8",
	        dataType: "json",
	        success: callback
		});
	}

	function _parseJson(data) {
		var next_event = data.next_event;
		console.log(self);
		self.setNextEvent(next_event.name, next_event.start_time);
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