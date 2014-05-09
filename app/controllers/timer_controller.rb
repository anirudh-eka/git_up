class TimerController < ApplicationController
  def show
    @sched_event = SchedEventService.find_next
  end
end