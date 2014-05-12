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