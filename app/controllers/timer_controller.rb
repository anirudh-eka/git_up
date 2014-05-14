class TimerController < ApplicationController
  def show
    @sched_event = SchedEventService.find_next

    respond_to do |format|
      format.json  { render :json => {"next_event" => @sched_event} }
      format.html { render "show" }
    end
  end
end