require 'httparty'

class SchedEvent
  attr_reader :name, :start_time, :venue, :group_name

  def initialize(name, start_time, venue, group_name=nil)
    @name = name
    # puts '&' *80
    # p formatted_start_time = "#{start_time} est" if name == "Tours of Martin Luther King Historical Site"
    # p DateTime.parse(String.new(start_time+" est"))
    @start_time = DateTime.parse(start_time+" est")
    @venue = venue
    @group_name = group_name
  end

  def before?(time)
    start_time < time
  end

  def ==(object)
    if object.class == SchedEvent
      return name == object.name && start_time == object.start_time && group_name == object.group_name
    end
    super(object)
  end

  def as_json(*args)
    hash = super(*args)
    formatted_start_time = start_time.strftime("%l:%M %p")
    hash.merge!({"formatted_time"=>"#{formatted_start_time}"})
  end
end