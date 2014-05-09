require 'spec_helper'

describe SchedEventService do
  describe "::find_next" do
    it "should return next event" do    
      current_date_time = DateTime.parse("2014-06-07 16:00:00")
      allow(DateTime).to receive(:now) { current_date_time }

      next_event = SchedEventService.find_next

      expect(next_event).to eq(SchedEvent.new("Dinner", "2014-06-07 20:30:00"))
    end
  end

  describe "::get_events" do 
    it "should show list of all events from sched.org" do 
      events = [SchedEvent.new("Lunch", "2014-06-07 12:30:00"), SchedEvent.new("Dinner", "2014-06-07 20:30:00")]

      expect(SchedEventService.get_events).to eq(events)
    end
  end

  describe "::get_events_sorted_by_time" do
    it "should sort events by time" do 
      response = [
        {"name"=>"Dinner", "event_start"=>"2014-06-07 20:30:00"},
        {"name"=>"Lunch", "event_start"=>"2014-06-07 12:30:00"}
      ].to_json
      
      stub_request(:get, /.+naawayday2014.sched.org\/api\/session\/list\?.+/).
           to_return(:status => 200, :body => response, :headers => { 'content-type' => 'application/json' })

      events = [SchedEvent.new("Lunch", "2014-06-07 12:30:00"), SchedEvent.new("Dinner", "2014-06-07 20:30:00")]

      expect(SchedEventService.get_events_sorted_by_time).to eq(events)
    end
  end
end