require 'httparty'

class SchedEvent
  attr_reader :name, :start_time, :venue

  def initialize(name, start_time, venue)
    @name = name
    @start_time = DateTime.parse(start_time)
    @venue = venue
  end

  def before?(time)
    start_time < time
  end

  def ==(object)
    if object.class == SchedEvent
      return name == object.name && start_time == object.start_time
    end
    super(object)
  end
end