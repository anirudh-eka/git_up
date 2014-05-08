require 'spec_helper'

describe 'home page' do
  it 'welcomes the user to the timer' do
    visit '/'
    page.should have_content('Welcome to the Away Day Timer!')
  end

  it 'shows next event' do 
  	visit '/'
  	page.should have_content('Next Event: Dinner')
  end
end