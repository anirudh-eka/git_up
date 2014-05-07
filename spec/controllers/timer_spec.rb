require 'spec_helper'

describe TimerController do
	describe 'GET #show' do
		it 'returns a successful response' do
	      get :show
	      expect(response).to be_success
	    end
	end
end
