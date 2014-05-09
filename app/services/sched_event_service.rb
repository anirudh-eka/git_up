class SchedEventService
  def self.find_next
    current_time = DateTime.now
    next_event = nil

    get_events_sorted_by_time.each do |event|
      return next_event = event unless event.before?(current_time)
    end
  end

  def self.get_events
    url = "http://naawayday2014.sched.org/api/session/list?api_key=#{ENV['SCHED_KEY']}&format=json"
    resp = HTTParty.get(url, :headers => {"User-Agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36"})
    events = []
    resp.parsed_response.each do |event|
      events << SchedEvent.new(event["name"], event["event_start"])
    end
    events
  end

  def self.get_events_sorted_by_time
    get_events.sort do |event_a, event_b|
      event_a.start_time <=> event_b.start_time
    end
  end
end