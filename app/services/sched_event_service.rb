class SchedEventService
  def self.base_url
    "https://awayday.sched.com/api/session/list"
  end

  def self.find_next
    current_time = DateTime.now.change(:offset => "-0500")
    next_event = nil
    get_events_sorted_by_time.each do |event|
      event unless event.before?(current_time)
      return next_event = event unless event.before?(current_time)
    end
  end

  def self.get_events
    url = "#{base_url}?api_key=#{ENV['SCHED_KEY']}&format=json"
    resp = HTTParty.get(url)
    events = []
    resp.parsed_response.each do |event|
      events << SchedEvent.new(event["name"], event["event_start"], event["venue"], event["Group Name"])
    end
    events
  end

  def self.get_events_sorted_by_time
    get_events.sort do |event_a, event_b|
      event_a.start_time <=> event_b.start_time
    end
  end
end