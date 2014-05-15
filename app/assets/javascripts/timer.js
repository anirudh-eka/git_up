$(document).ready(function() {
	var clock = new Clock($("#current-time"));
	var timer = new Timer(clock);
	// timer.setNextEvent($("#event-name").text(), $("#event-start-time").data("datestring"));
	var timerStatus = new TimerStatus(timer, $("#timer-status"));
	var schedEventService = new SchedEventService(timer);
	schedEventService.bootstrapTimerNextEvent($("#event-name"), $("#event-start-time"));

	setInterval(function(){
		clock.updateCurrentTime();
		if(!timer.isZero($("#time-left"))) {
			timer.updateTimer($("#time-left"))
		}
	}, 500)

	setInterval(function(){
		schedEventService.updateTimerNextEvent();
		// timer.importSchedEventFromAJAX();
	}, 30000)
});

function Clock(timeContainer) {
	this.getCurrentTime = function() {
		return new Date();
	}

	this.updateCurrentTime = function() {
		var currentTime = this.getCurrentTime().toLocaleTimeString()
		timeContainer.text(currentTime);
	}

}

function Timer(clock) {
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
		// console.log(this.nextEvent)
		var time = this.nextEvent.startTime - clock.getCurrentTime()
		var formatedDiff = _formatTimerText(time)
		timerContainer.text(formatedDiff);
	}

	this.setNextEvent = function(schedEvent) {
		this.nextEvent = schedEvent;
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

function SchedEventService(timer) {
	this.bootstrapTimerNextEvent = function($eventNameElement, $eventStartElement) {
		var name = $eventNameElement.text();
		var	startTime = $eventStartElement.data("datestring");

		timer.setNextEvent(new SchedEvent(name, startTime));
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

	this._parseJsonAndSetTimerNextEvent = function(data) {
		var nextEventJson = data.next_event;
		var nextEvent = new SchedEvent(nextEventJson.name, nextEventJson.start_time)
		timer.setNextEvent(nextEvent);
	}

	this.updateTimerNextEvent = function() {
		this.getEvent(this._parseJsonAndSetTimerNextEvent);
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