$(document).ready(function() {
	var service = new SchedEventService();
	var clock = new Clock($("#current-time"));
	var timer = new Timer(clock, service, $("#time-left"));
	var timerStatus = new TimerStatus(timer, $("#timer-status"));
	var eventDetails = new NextEventDetails(service, timer, $("#event-name"), $("#event-start-time"), $("#event-venue"));
	service.bootstrapTimerNextEvent($("#event-name"), $("#event-start-time"), $("#event-venue"));

	setInterval(function(){
		clock.updateCurrentTime();
		if(!timer.isZero($("#time-left"))) {
			timer.updateTimer()
		}
	}, 500)

	setInterval(function(){
		service.updateTimerNextEvent();
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

function Timer(clock, service, timerContainer) {
	var self = this;
	this.nextEvent;

	this.isZero = function() {
		if (timerContainer.text() == "0:00:00"){
			$(this).trigger("reachedZero");
			return true;
		}
		return false;
	}

	this.updateTimer = function() {
		console.log(this.nextEvent.startTime)
		var time = this.nextEvent.startTime - clock.getCurrentTime()
		var formattedDiff = _formatTimerText(time)
		timerContainer.text(formattedDiff);
	}

	this.setNextEvent = function(schedEvent) {
		this.nextEvent = schedEvent;
	}

	$(service).on("nextEventUpdate", function(e, schedEvent){
		self.setNextEvent(schedEvent);
		var minTillNextEvent = (schedEvent.startTime - clock.getCurrentTime())/60000;
		if (minTillNextEvent <= 20) {
			self.updateTimer();
			$(self).trigger("nextEventSoon");
		}
	});

	function _formatTimerText(time) {
		var formattedTime = Math.floor(time/3600000);
		formattedTime += ":";

		var time = new Date(time);
		formattedTime += _formatTensPlace(time.getMinutes());
		formattedTime += ":";
		formattedTime += _formatTensPlace(time.getSeconds());
		return formattedTime
	}

	function _formatTensPlace(number) {
		if(number < 10) {
			return "0"+number;
		} else {
			return number;
		}
	}
}

function SchedEventService() {
	var self = this;

	this.bootstrapTimerNextEvent = function($eventNameElement, $eventStartElement, $venueElement) {
		var name = $eventNameElement.text();
		var	startTime = $eventStartElement.data("datestring");
		var venue = $venueElement.text();
		var formattedStartTime = $eventStartElement.text();

		var nextEvent = new SchedEvent(name, startTime, venue, formattedStartTime);
		$(self).trigger("nextEventUpdate", nextEvent);
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

	this._parseJsonAndPublishNextEvent = function(data) {
		var nextEventJson = data.next_event;
		console.log(data.next_event);
		if(nextEventJson["group_name"]) {
			var nextEvent = new SchedEvent(nextEventJson.group_name, nextEventJson.start_time, nextEventJson.venue, nextEventJson.formatted_time);	
		} else {
			var nextEvent = new SchedEvent(nextEventJson.name, nextEventJson.start_time, nextEventJson.venue, nextEventJson.formatted_time);	
		}
		
		$(self).trigger("nextEventUpdate", nextEvent);
	}

	this.updateTimerNextEvent = function() {
		this.getEvent(this._parseJsonAndPublishNextEvent);
	}
}

function TimerStatus(timer, container) {
	$(timer).on("reachedZero", function(){
		container.text("YOU'RE LATE!");
		container.addClass("warning-color")
	});

	$(timer).on("nextEventSoon", function(){
		container.text("UNTIL NEXT EVENT");
		container.removeClass("warning-color")
	});
}

function NextEventDetails(service, timer, $name, $time, $venue) {
	$(service).on("nextEventUpdate", function(e, schedEvent){
		var minTillNextEvent = (schedEvent.startTime - new Date())/60000;

		if (!timer.isZero() || (timer.isZero() && minTillNextEvent <= 20)) {
			$name.text(schedEvent.name);
			$time.text(schedEvent.formattedStartTime);
			$venue.text(schedEvent.venue);
		}
	});
}

function SchedEvent(name, startTime, venue, formattedStartTime) {
	console.log(startTime)
	return {name: name, startTime: new Date(startTime.replace("-05:00", "0:00")), venue: venue, formattedStartTime: formattedStartTime};	
}