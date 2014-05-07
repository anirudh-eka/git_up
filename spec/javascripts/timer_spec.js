describe("schedEvent", function() {
  it("has a name", function() {
  	var schedEvent = new SchedEvent("Birthday");
    expect(schedEvent.name).toBe("Birthday");
  });
});