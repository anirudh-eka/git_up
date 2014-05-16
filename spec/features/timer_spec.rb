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

  context "run in driver" do 
    MINUTES_IN_A_DAY = 1440
    SECONDS_IN_A_DAY = 86400

    it "shows the time left", :js => true do
      Capybara.default_wait_time = 5
      response = [
        {"name"=>"Lunch", "event_start"=>"#{DateTime.now + Rational(5, MINUTES_IN_A_DAY)}", "venue" => "The Westin Peachtree Plaza"},
        {"name"=>"Dinner", "event_start"=>"2014-06-07 20:30:00", "venue" => "The Georgia Aquarium"}
      ].to_json

      stub_request(:get, /.+naawayday2014.sched.org\/api\/session\/list\?.+/).
           to_return(:status => 200, :body => response, :headers => {'content-type' => 'application/json'})
    
    
      visit '/'
      page.should have_content("0:04:54")
      sleep(2.seconds)
      page.should have_content("0:04:51")
    end
    
    context "when events change in sched" do
      it "should update timer and event details", :js => true do 
        Capybara.default_wait_time = 10
        four_minutes_before_now = DateTime.now + Rational(4, MINUTES_IN_A_DAY)
        twenty_minutes_before_now = DateTime.now + Rational(20, MINUTES_IN_A_DAY)

        response_one = [
          {"name"=>"Lunch", "event_start"=>"#{four_minutes_before_now}", "venue" => "The Westin Peachtree Plaza"},
        ].to_json

        response_two = [{"name"=>"Dinner", "event_start"=>"#{twenty_minutes_before_now}", "venue" => "The Georgia Aquarium"}].to_json

        stub_request(:get, /.+naawayday2014.sched.org\/api\/session\/list\?.+/).
             to_return({:status => 200, :body => response_one, :headers => {'content-type' => 'application/json'}},
                      {:status => 200, :body => response_two, :headers => {'content-type' => 'application/json'}}) 
        
        visit '/'

        page.should have_content("0:03:55")
        sleep(30.seconds)
        page.should have_content("0:19:")
        page.should have_content("Next Event: Dinner")
        page.should have_content("Location: The Georgia Aquarium")
        page.should have_content("Time: #{twenty_minutes_before_now.strftime("%l:%M %p")}")
      end
    end

    context "when timer hits zero" do
      before(:each) do 
        Capybara.default_wait_time = 5
        four_seconds_before_now = DateTime.now + Rational(4, SECONDS_IN_A_DAY)
        twenty_point_one_minutes_before_now = DateTime.now + Rational(1206, SECONDS_IN_A_DAY)
        response = [
          {"name"=>"Lunch", "event_start"=>"#{four_seconds_before_now}", "venue" => "The Westin Peachtree Plaza"},
          {"name"=>"Dinner", "event_start"=>"#{twenty_point_one_minutes_before_now}", "venue" => "The Georgia Aquarium"}
        ].to_json

        stub_request(:get, /.+naawayday2014.sched.org\/api\/session\/list\?.+/).
             to_return(:status => 200, :body => response, :headers => {'content-type' => 'application/json'})
      end 

      it "tells user that they are late and stays at 0", :js => true do 
        visit '/'
        page.should have_content("0:00:00")
        page.should have_content("YOU'RE LATE!")
        sleep(3.seconds)#time should stay at zero
        page.should have_content("0:00:00")
      end

      # context "20 minutes before the next event" do
      #   it "resets the count down", :js => true do
      #     visit '/'
      #     page.should have_content("0:00:00")
      #     page.should have_content("YOU'RE LATE!")
      #     sleep(3.seconds)
      #     page.should have_content("0:19:25")
      #     page.should have_content("UNTIL NEXT EVENT")
      #   end
      # end
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
end