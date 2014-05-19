describe("SchedEvent", function() {
  var schedEvent;

  beforeEach(function(){
    schedEvent = new SchedEvent("Birthday", "2014-06-07 22:30:00", "On A Boat", "10:30 PM");
  });

  it("has a name", function() {
    expect(schedEvent.name).toBe("Birthday");
  });

  it("has a start time", function(){
    expect(schedEvent.startTime).toEqual(new Date("2014-06-07 22:30:00"));
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
    timer = new Timer(clock, timerContainer);
  });

  describe("updateTimer", function(){
    it("should subtract the current time with the event time", function(){
      //mock current time
      var currentTime = new Date("2014-06-07 21:25:00")
      spyOn(clock, 'getCurrentTime').and.returnValue(currentTime)

      //set next event
      timer.nextEvent = new SchedEvent("Dinner", "2014-06-07 22:30:00", "On A Boat", "10:30 PM")

      //send a mock of the timeContainer as arg
      // var timerContainer = {text: function() {}}

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
    var schedEvent = new SchedEvent("Dinner", "2014-06-07 22:30:00", "On A Boat!", "10:30 PM")

    timer.setNextEvent(schedEvent)
    expect(timer.nextEvent).toBe(schedEvent)
  });
});

describe("SchedEventService", function(){
  var timer, service

  beforeEach(function() {
    timer = {setNextEvent: function(){}};
    service = new SchedEventService(timer);
  });

  it("should bootstrap nextEvent from DOM data", function(){
    spyOn(timer, "setNextEvent"); 
    var eventNameDOMElement = {text: function() {return "name";}} 
    var eventStartDOMElement = {data: function() {}, text: function(){return "10:30 PM";}} 
    var eventVenueDOMElement = {text: function() {return "On A Boat!"}}

    spyOn(eventStartDOMElement, "data").and.returnValue("2014-06-07 22:30:00");

    service.bootstrapTimerNextEvent(eventNameDOMElement, eventStartDOMElement, eventVenueDOMElement);
    
    var schedEvent = new SchedEvent("name", "2014-06-07 22:30:00", "On A Boat!", "10:30 PM");
    expect(eventStartDOMElement.data).toHaveBeenCalledWith("datestring");
    expect(timer.setNextEvent).toHaveBeenCalledWith(schedEvent);
  });

  describe("updating nextEvent", function(){
    it("should get event (from Server) and update nextEvent", function(){
      var event = jasmine.createSpy('schedEvent')
      spyOn(service, "getEvent").and.returnValue(event);
      service.updateTimerNextEvent();
      expect(service.getEvent).toHaveBeenCalledWith(service._parseJsonAndSetTimerNextEvent);
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
      var data = {next_event: {name: "Dinner", start_time: "2014-06-07 22:30:00", venue: "On A Boat!", formatted_time: "10:30 PM"}}
      spyOn(timer, "setNextEvent");
      var schedEvent = new SchedEvent("Dinner", "2014-06-07 22:30:00", "On A Boat!", "10:30 PM");
      service._parseJsonAndSetTimerNextEvent(data);
      expect(timer.setNextEvent).toHaveBeenCalledWith(schedEvent);
    });
  });
});

describe("TimerStatus", function(){
  var timerStatus, statusContainer, timer;

  beforeEach(function() {
    statusContainer = {text: function() {}, addClass: function() {}}
    timer = {};
    timerStatus = new TimerStatus(timer, statusContainer);
  });

  describe("when the timer reaches 0", function(){
    it("should tell a user that they're late", function(){
      spyOn(statusContainer, "text")
      spyOn(statusContainer, "addClass")
      $(timer).trigger("reachedZero")
      expect(statusContainer.text).toHaveBeenCalledWith("You're Late!");
      expect(statusContainer.addClass).toHaveBeenCalledWith("warning-color");
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

        var changedEvent = new SchedEvent("Dinner", "2014-06-07 22:30:00", "On A Boat!", "10:30 PM")

        $(service).trigger("nextEventUpdate", changedEvent);
        
        expect(nameContainer.text).toHaveBeenCalledWith("Dinner");
        expect(timeContainer.text).toHaveBeenCalledWith("10:30 PM");
        expect(venueContainer.text).toHaveBeenCalledWith("On A Boat!");
      });

      describe("when timer is zero", function(){
        it("should not update the details", function(){  
          spyOn(nameContainer, "text");
          spyOn(venueContainer, "text");
          spyOn(timeContainer, "text");
          spyOn(timer, "isZero").and.returnValue(true);

          var changedEvent = new SchedEvent("Dinner", "2014-06-07 22:30:00", "On A Boat!", "10:30 PM")

          $(service).trigger("nextEventUpdate", changedEvent);
          
          expect(nameContainer.text).not.toHaveBeenCalled();
          expect(timeContainer.text).not.toHaveBeenCalled();
          expect(venueContainer.text).not.toHaveBeenCalled();
          });
      });
    });
  });
});