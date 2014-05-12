describe("schedEvent", function() {
  it("has a name", function() {
  	var schedEvent = new SchedEvent("Birthdays");
    expect(schedEvent.name).toBe("Birthdays");
  });
});
