describe("SchedEvent", function() {
  it("has a name", function() {
    var schedEvent = new SchedEvent("Birthdays", "2014-06-07 22:30:00");
    expect(schedEvent.name).toBe("Birthdays");
  });

  it("has a start time", function(){
    var schedEvent = new SchedEvent("Birthdays", "2014-06-07 22:30:00");
    expect(schedEvent.startTime).toEqual(new Date("2014-06-07 22:30:00"));
  });
});

describe("Timer", function(){
  var timer = new Timer();

  beforeEach(function() {
    timer = new Timer();
  });

  describe("getCurrentTime", function(){
    it("should return a Date object reflecting the current time", function(){
      expect(timer.getCurrentTime()).toEqual(new Date());
    });
  })

  describe("updateTimer", function(){
    it("should subtract the current time with the event time", function(){
      //mock current time
      var currentTime = new Date("2014-06-07 21:25:00")
      spyOn(timer, 'getCurrentTime').and.returnValue(currentTime)

      //set next event
      timer.nextEvent = new SchedEvent("Dinner", "2014-06-07 22:30:00")

      //send a mock of the timeContainer as arg
      var timerContainer = {text: function() {}}

      //spyOn text to verify
      spyOn(timerContainer, 'text');

      //action
      timer.updateTimer(timerContainer);
      
      expect(timerContainer.text).toHaveBeenCalledWith("1:05:00");
    });
  });

  describe("isZero", function(){
    describe("when the timer is zero", function(){
      var timerContainer = {text: function() { return "0:00:00";}}

      it("should return true", function(){
        expect(timer.isZero(timerContainer)).toEqual(true);
      });

      it("should trigger an event on itself notify it iz zero");
    });

    it("should return false if timer is not at zero", function(){
      var timerContainer = {text: function() { return "0:01:39";}}
      expect(timer.isZero(timerContainer)).toEqual(false);
    });
  });

  describe("create schedEvent", function(){
    it("should create the schedEvent", function(){
      //mock event time container
      var eventTime = "2014-06-07 22:30:00";
      //mock event name container
      var eventName = {text: function(){return "Dinner";}}

      timer.importSchedEvent(eventName, eventTime)
      expect(timer.nextEvent).toEqual(new SchedEvent("Dinner", "2014-06-07 22:30:00"))
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