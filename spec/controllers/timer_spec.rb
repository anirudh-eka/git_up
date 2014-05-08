require 'spec_helper'

describe TimerController do
  describe 'GET #show' do
    it 'returns a successful response' do
      next_event = double("next_event")
      allow(SchedEvent).to receive(:find_next) { next_event }
      get :show
      expect(response).to be_success
    end

    it 'assigns the next sched_event with an html request' do
      next_event = double("next_event")
      allow(SchedEvent).to receive(:find_next) { next_event }
      get :show
      expect(assigns(:sched_event)).to eq(next_event)
    end
  end
end
