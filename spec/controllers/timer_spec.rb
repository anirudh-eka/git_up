require 'spec_helper'

describe TimerController do
	describe 'GET #show' do
		it 'shows the timer view' do
	      get :show
	      expect(response).to be_success
	    end
	end
end
