class TimerController < ApplicationController
  def show
    @sched_event = SchedEvent.find_next
  end
end