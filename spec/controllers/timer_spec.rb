require 'spec_helper'

describe TimerController do
  describe 'GET #show' do
    it 'returns a successful response' do
      next_event = double("next_event")
      allow(SchedEventService).to receive(:find_next) { next_event }
      get :show, :format => :html
      expect(response).to be_success
    end

    it 'assigns the next sched_event with an html request' do
      next_event = double("next_event")
      allow(SchedEventService).to receive(:find_next) { next_event }
      get :show, :format => :html
      expect(assigns(:sched_event)).to eq(next_event)
    end

    it 'sends the next event with a json request' do 
      next_event = SchedEvent.new("Lunch", "2014-06-07 12:30:00", "The Westin Peachtree Plaza")

      allow(SchedEventService).to receive(:find_next) { next_event }
      get :show, :format => :json
      body = JSON.parse(response.body)
      expect(body).to eq({"next_event"=>{"name" => "Lunch", "start_time" => "2014-06-07T12:30:00.000+00:00", "venue"=> "The Westin Peachtree Plaza"}})
    end
  end
end
