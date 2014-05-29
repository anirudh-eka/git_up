require 'spec_helper'

describe 'home page' do

  it 'shows next event name' do 
    current_date_time = DateTime.parse("2014-06-07 16:00:00")
    allow(DateTime).to receive(:now) { current_date_time }

    visit '/'
    page.should have_content('Next Event: Dinner')
  end

  context 'when next event has a generic name' do
    it "should use the generic name" do
      Capybara.default_wait_time = 5
      response = [
        {"name"=>"Lunch", "event_start"=>"#{DateTime.now + Rational(5, MINUTES_IN_A_DAY)}", "venue" => "The Westin Peachtree Plaza", "Group Name"=> "Meal"}
      ].to_json
      
      stub_request(:get, /.+naawayday2014.sched.org\/api\/session\/list\?.+/).
           to_return(:status => 200, :body => response, :headers => {'content-type' => 'application/json'})
    
      visit '/'
      page.should have_content("Meal")
    end
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

  context "when updating automatically", needs_driver: true do 
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

    context "when next event has a generic name" do
      it "should use the generic name for the event name", :js => true do 
        Capybara.default_wait_time = 10
        four_minutes_before_now = DateTime.now + Rational(4, MINUTES_IN_A_DAY)
        twenty_minutes_before_now = DateTime.now + Rational(20, MINUTES_IN_A_DAY)

        response_one = [
          {"name"=>"Lunch", "event_start"=>"#{four_minutes_before_now}", "venue" => "The Westin Peachtree Plaza"},
        ].to_json

        response_two = [{"name"=>"Lunch", "event_start"=>"#{twenty_minutes_before_now}", "venue" => "The Georgia Aquarium", "Group Name"=>"Meal"}].to_json

        stub_request(:get, /.+naawayday2014.sched.org\/api\/session\/list\?.+/).
             to_return({:status => 200, :body => response_one, :headers => {'content-type' => 'application/json'}},
                      {:status => 200, :body => response_two, :headers => {'content-type' => 'application/json'}}) 
        
        visit '/'

        page.should have_content("0:03:55")
        sleep(30.seconds)
        page.should have_content("0:19:")
        page.should have_content("Next Event: Meal")
        page.should have_content("Location: The Georgia Aquarium")
        page.should have_content("Time: #{twenty_minutes_before_now.strftime("%l:%M %p")}")
      end
    end

    context "when timer hits zero" do
      before(:each) do 
        Capybara.default_wait_time = 5
      end 

      it "tells user that they are late and stays at 0", :js => true do 
        four_seconds_before_now = DateTime.now + Rational(4, SECONDS_IN_A_DAY)
        fourty_minutes_before_now = DateTime.now + Rational(40, MINUTES_IN_A_DAY)
        response = [
          {"name"=>"Lunch", "event_start"=>"#{four_seconds_before_now}", "venue" => "The Westin Peachtree Plaza"},
          {"name"=>"Dinner", "event_start"=>"#{fourty_minutes_before_now}", "venue" => "The Georgia Aquarium"}
        ].to_json

        stub_request(:get, /.+naawayday2014.sched.org\/api\/session\/list\?.+/).
             to_return(:status => 200, :body => response, :headers => {'content-type' => 'application/json'})


        visit '/'
        page.should have_content("0:00:00")
        page.should have_content("YOU'RE LATE!")
        page.should have_content("Next Event: Lunch")
        sleep(35.seconds)#time should stay at zero
        page.should have_content("0:00:00")
        page.should have_content("Next Event: Lunch")
      end

      context "20 minutes before the next event" do
        it "resets the count down", :js => true do
          four_seconds_before_now = DateTime.now + Rational(4, SECONDS_IN_A_DAY)
          twenty_minutes_and_six_seconds_before_now = DateTime.now + Rational(1206, SECONDS_IN_A_DAY)
          response = [
            {"name"=>"Lunch", "event_start"=>"#{four_seconds_before_now}", "venue" => "The Westin Peachtree Plaza"},
            {"name"=>"Dinner", "event_start"=>"#{twenty_minutes_and_six_seconds_before_now}", "venue" => "The Georgia Aquarium"}
          ].to_json

          stub_request(:get, /.+naawayday2014.sched.org\/api\/session\/list\?.+/).
             to_return(:status => 200, :body => response, :headers => {'content-type' => 'application/json'})

          visit '/'
          page.should have_content("0:00:00")
          page.should have_content("YOU'RE LATE!")
          page.should have_content("Lunch")
          page.should have_content("The Westin Peachtree Plaza")
          sleep(30.seconds)
          page.should have_content("0:19:")
          page.should have_content("UNTIL NEXT EVENT")
          page.should have_content("Dinner")
          page.should have_content("The Georgia Aquarium")
        end
      end
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