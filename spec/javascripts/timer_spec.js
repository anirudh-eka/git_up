describe("SchedEvent", function() {
  var schedEvent;

  beforeEach(function(){
    schedEvent = new SchedEvent("Birthday", "2014-06-07T22:30:00Z", "On A Boat", "10:30 PM");
  });

  it("has a name", function() {
    expect(schedEvent.name).toBe("Birthday");
  });

  it("has a start time", function(){
    expect(schedEvent.startTime).toEqual(new Date("2014-06-07T22:30:00Z"));
  });

  it("has a venue", function(){
    expect(schedEvent.venue).toEqual("On A Boat");
  });

  it("has a formatted start time", function(){
    expect(schedEvent.formattedStartTime).toEqual("10:30 PM");
  });
});

describe("Clock", function() {
  var clock, timerContainer;

  beforeEach(function() {
    timerContainer = {text: function(){}};
    clock = new Clock(timerContainer);
  });

  it("should return current time (as a Date object)", function(){
    expect(clock.getCurrentTime()).toEqual(new Date());
  });

  it("should update currentTime in DOM", function(){
    spyOn(timerContainer, "text");
    var currentTimeString = (new Date()).toLocaleTimeString();
    clock.updateCurrentTime();
    expect(timerContainer.text).toHaveBeenCalledWith(currentTimeString);
  })
});

describe("Timer", function(){
  var timer, clock, timerContainer;

  beforeEach(function() {
    clock = new Clock();
    timerContainer = {text: function() { return "0:00:00";}}
    service = new SchedEventService();
    timer = new Timer(clock, service, timerContainer);
  });

  describe("updateTimer", function(){
    it("should subtract the current time with the event time", function(){
      //mock current time
      var currentTime = new Date("2014-06-07T21:25:00Z")
      spyOn(clock, 'getCurrentTime').and.returnValue(currentTime)

      //set next event
      timer.nextEvent = new SchedEvent("Dinner", "2014-06-07T22:30:00Z", "On A Boat", "10:30 PM")

      //spyOn text to verify
      spyOn(timerContainer, 'text');

      //action
      timer.updateTimer(timerContainer);
      
      expect(timerContainer.text).toHaveBeenCalledWith("1:05:00");
    });
  });

  describe("isZero", function(){
    describe("when the timer is zero", function(){
      it("should return true", function(){
        expect(timer.isZero(timerContainer)).toEqual(true);
      });

      it("should trigger an event on itself notify it iz zero");
    });

    it("should return false if timer is not at zero", function(){
      timerContainer.text = function() { return "0:01:39";}
      expect(timer.isZero(timerContainer)).toEqual(false);
    });
  });

  it("should set a schedEvent", function(){
    var schedEvent = new SchedEvent("Dinner", "2014-06-07T22:30:00Z", "On A Boat!", "10:30 PM")

    timer.setNextEvent(schedEvent)
    expect(timer.nextEvent).toBe(schedEvent)
  });

  describe("when service updates next event", function(){
    it("should set the schedEvent to nextEvent", function(){
      var changedEvent = new SchedEvent("Party", "2014-06-07T22:40:00Z", "On A Boat in Desert!", "11:30 PM")
      $(service).trigger("nextEventUpdate", changedEvent);
      expect(timer.nextEvent).toBe(changedEvent) 
    });  

    it("should update timer", function(){
      spyOn(timer, "updateTimer");
      var nineteenMinutes = 19*60000
      var changedEvent = new SchedEvent("Party", new Date().getTime() + nineteenMinutes, "On A Boat in Desert!", "11:30 PM")
      $(service).trigger("nextEventUpdate", changedEvent);
      expect(timer.updateTimer).toHaveBeenCalled();
    });

    describe("when the next event is the same as the currently served event", function() {
      it("should not trigger the nextEventSoon event", function() {
        var nextEventSoonTriggered = false;
        $(timer).on('nextEventSoon', function() {
          nextEventSoonTriggered = true;
        });

        var schedEvent = new SchedEvent("Dinner", "2014-06-07T22:30:00Z", "On A Boat!", "10:30 PM");
        timer.setNextEvent(schedEvent);

        $(service).trigger("nextEventUpdate", schedEvent);
        expect(nextEventSoonTriggered).toBe(false);
      });
    });
  });

  describe('lessThanAMinuteLeft', function() {
    describe("when time to next event is less than a minute", function() {
      it("should return true when time is 59 seconds remaining", function() {
        timerContainer.text = function() { return "0:00:59"}

        expect(timer.lessThanAMinuteLeft()).toBe(true)
      })

      it("should return true when time is 1 second remaining", function() {
        timerContainer.text = function() { return "0:00:01"}

        expect(timer.lessThanAMinuteLeft()).toBe(true)
      })

      it("should emit the time threshold event", function() {
        var eventWasEmitted = false
        $(timer).on('oneMinuteLeft', function() {
          eventWasEmitted = true
        })

        timerContainer.text = function() { return "0:00:01"}
        timer.lessThanAMinuteLeft()

        expect(eventWasEmitted).toBe(true)
      })
    })

    describe("when time to next event is more than a minute", function() {
      it("should return false", function() {
        timerContainer.text = function() { return "0:01:59"}

        expect(timer.lessThanAMinuteLeft()).toBe(false)
      })
    })
  });
});

describe("SchedEventService", function(){
  var timer, service

  beforeEach(function() {
    service = new SchedEventService();
  });

  it("should bootstrap nextEvent from DOM data", function(){
    var eventNameDOMElement = {text: function() {return "name";}} 
    var eventStartDOMElement = {data: function() {}, text: function(){return "10:30 PM";}} 
    var eventVenueDOMElement = {text: function() {return "On A Boat!"}}

    spyOn(eventStartDOMElement, "data").and.returnValue("2014-06-07T22:30:00Z");

    var nextEvent;
    $(service).on("nextEventUpdate", function(e, schedEvent){
        nextEvent = schedEvent;
    });

    service.bootstrapTimerNextEvent(eventNameDOMElement, eventStartDOMElement, eventVenueDOMElement);
    
    var schedEvent = new SchedEvent("name", "2014-06-07T22:30:00Z", "On A Boat!", "10:30 PM");
    expect(eventStartDOMElement.data).toHaveBeenCalledWith("datestring");

    expect(nextEvent).toEqual(schedEvent);
  });

  describe("updating nextEvent", function(){
    it("should get event (from Server) and update nextEvent", function(){
      var event = jasmine.createSpy('schedEvent')
      spyOn(service, "getEvent").and.returnValue(event);
      service.updateTimerNextEvent();
      expect(service.getEvent).toHaveBeenCalledWith(service._parseJsonAndPublishNextEvent);
    });

    it("should get nextEvent with AJAX", function(){
      var ajaxOptions;
      spyOn($, "ajax").and.callFake(function(options) {
        options.success();
        ajaxOptions = options;
      });

      var callback = jasmine.createSpy();
      service.getEvent(callback);
    
      expect(ajaxOptions.type).toEqual("GET");
      expect(ajaxOptions.url).toEqual("/");
      expect(ajaxOptions.contentType).toEqual("application/json; charset=utf-8");
      expect(ajaxOptions.dataType).toEqual("json");
      //check that success calls callback passed as arg
      expect(callback).toHaveBeenCalled(); 
    });

    it("should parse Json and set timer next event", function(){
      var nextEvent;
      $(service).on("nextEventUpdate", function(e, schedEvent){
          nextEvent = schedEvent;
      });
      var data = {next_event: {name: "Dinner", start_time: "2014-06-07T22:30:00Z", venue: "On A Boat!", formatted_time: "10:30 PM"}}
      var schedEvent = new SchedEvent("Dinner", "2014-06-07T22:30:00Z", "On A Boat!", "10:30 PM");
      service._parseJsonAndPublishNextEvent(data);
      
      expect(nextEvent).toEqual(schedEvent);
    });

    describe("when next event has a group name" , function(){
      it("should set timer next event name to group name", function(){
        var nextEvent;
        $(service).on("nextEventUpdate", function(e, schedEvent){
          nextEvent = schedEvent;
        });
        var data = {next_event: {name: "Dinner", start_time: "2014-06-07T22:30:00Z", venue: "On A Boat!", formatted_time: "10:30 PM", group_name: "Meal"}}
        var schedEvent = new SchedEvent("Meal", "2014-06-07T22:30:00Z", "On A Boat!", "10:30 PM");
        service._parseJsonAndPublishNextEvent(data);

        expect(nextEvent).toEqual(schedEvent);
      });
    });
  });
});

describe("TimerStatus", function(){
  var timerStatus, statusContainer, timer;

  beforeEach(function() {
    statusContainer = {text: function() {}, addClass: function() {}, removeClass: function() {}}
    timer = {};
    timerStatus = new TimerStatus(timer, statusContainer);
  });

  describe("when the timer reaches 0", function(){
    it("should tell a user that they're late", function(){
      spyOn(statusContainer, "text")
      spyOn(statusContainer, "addClass")
      $(timer).trigger("reachedZero")
      expect(statusContainer.text).toHaveBeenCalledWith("YOU'RE LATE!");
      expect(statusContainer.addClass).toHaveBeenCalledWith("warning-color");
    });
  });

  describe("when the timer's next event is less than 20 minutes", function(){
    it("should give standard status for timer counting down", function(){
      spyOn(statusContainer, "text");
      spyOn(statusContainer, "removeClass");
      $(timer).trigger("nextEventSoon");
      expect(statusContainer.text).toHaveBeenCalledWith("UNTIL NEXT EVENT");
      expect(statusContainer.removeClass).toHaveBeenCalledWith("warning-color");
    });
  });
});

describe("App", function() {
  var app, timer, container

  beforeEach(function() {
    container = {
      addClass: function() {},
      removeClass: function() {}
    }
    timer = {};
    app = new App(timer, container)
  });

  describe("when the timer reaches one minute left", function(){
    it("should cause the screen to blink", function(){
      spyOn(container, "addClass")
      $(timer).trigger("oneMinuteLeft")
      expect(container.addClass).toHaveBeenCalledWith("warning-flash");
    });
  });

  describe("when the timer reaches zero minutes left", function(){
    it("should cause the screen to stop blinking", function(){
      spyOn(container, "removeClass")
      $(timer).trigger("nextEventSoon")
      expect(container.removeClass).toHaveBeenCalledWith("warning-flash");
    });
  });
});

describe("NextEventDetails", function(){
  describe("when SchedEventService successfully imports new data", function(){
    var nameContainer, venueContainer, timeContainer, timer, service, nextEventDetails;
    beforeEach(function(){
      nameContainer = {text: function(){}};
      venueContainer = {text: function(){}};
      timeContainer = {text: function(){}};
      timer = {isZero: function(){}};
      service = new SchedEventService();
      nextEventDetails = new NextEventDetails(service, timer, nameContainer, timeContainer, venueContainer);
    });

    describe("when timer is not zero", function(){
      it("should update the details", function() {
        spyOn(nameContainer, "text");
        spyOn(venueContainer, "text");
        spyOn(timeContainer, "text");
        spyOn(timer, "isZero").and.returnValue(false);

        var changedEvent = new SchedEvent("Dinner", "2014-06-07T22:30:00Z", "On A Boat!", "10:30 PM")

        $(service).trigger("nextEventUpdate", changedEvent);
        
        expect(nameContainer.text).toHaveBeenCalledWith("Dinner");
        expect(timeContainer.text).toHaveBeenCalledWith("10:30 PM");
        expect(venueContainer.text).toHaveBeenCalledWith("On A Boat!");
      });
    });

    describe("when timer is zero", function(){
      it("should not update the details", function(){  
        spyOn(nameContainer, "text");
        spyOn(venueContainer, "text");
        spyOn(timeContainer, "text");
        spyOn(timer, "isZero").and.returnValue(true);

        var aLongTime
        var changedEvent = new SchedEvent("Dinner", "2014-06-07T22:30:00Z", "On A Boat!", "10:30 PM")

        $(service).trigger("nextEventUpdate", changedEvent);
        
        expect(nameContainer.text).toHaveBeenCalled();
        expect(timeContainer.text).toHaveBeenCalled();
        expect(venueContainer.text).toHaveBeenCalled();
      });

      it("should update the details if nextEvent is in 20 min or less", function(){  
        spyOn(nameContainer, "text");
        spyOn(venueContainer, "text");
        spyOn(timeContainer, "text");
        spyOn(timer, "isZero").and.returnValue(true);

        var nineteenMinutes = 19*60000
        var changedEvent = new SchedEvent("Dinner", new Date().getTime() + nineteenMinutes, "On A Boat in Desert!", "10:30 PM")

        $(service).trigger("nextEventUpdate", changedEvent);
        
        expect(nameContainer.text).toHaveBeenCalledWith("Dinner");
        expect(timeContainer.text).toHaveBeenCalledWith("10:30 PM");
        expect(venueContainer.text).toHaveBeenCalledWith("On A Boat in Desert!");
      });
    });

  });
});
