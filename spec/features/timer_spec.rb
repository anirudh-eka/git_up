require 'spec_helper'

describe 'home page' do

  it 'shows next event name' do 
    current_date_time = DateTime.parse("2014-06-07 16:00:00")
    allow(DateTime).to receive(:now) { current_date_time }

    visit '/'
    page.should have_content('Next Event: Dinner')
  end

  it 'shows the location of next event' do
    current_date_time = DateTime.parse("2014-06-07 16:00:00")
    allow(DateTime).to receive(:now) { current_date_time }
    
    visit '/'
    page.should have_content("Location: The Georgia Aquarium")
  end

  it 'shows the time of next event' do
    current_date_time = DateTime.parse("2014-06-07 16:00:00")
    allow(DateTime).to receive(:now) { current_date_time }
    
    visit '/'
    page.should have_content("Start Time: 8:30 PM")
  end

  #need to mock current time in js as well
  #don't know how to do easily...
  xit "shows the time left", :js => true do
    current_date_time = DateTime.parse("2014-06-07 20:25:00")
    allow(DateTime).to receive(:now) { current_date_time }

    visit '/'
    page.should have_content("Time Left: 5:00")
    sleep(2.seconds)
    page.should have_content("Time Left: 4:48")
  end
  #display difference in firefox vs. chrome : so test differs when using selinium/firefox
  #for now verify manually 
  xit 'displays the current time', :js => true do
    visit '/'
    
    2.times{
      page.should have_content("Current Time: #{DateTime.now.strftime("%l:%M:%S %p")}")
      sleep(10.seconds)
    }
  end
end