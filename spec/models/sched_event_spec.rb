require 'spec_helper'

describe SchedEvent do
  describe "#before" do
    it "should return false if it's after time being passed" do
      dinner = SchedEvent.new("Dinner", "2014-06-07 20:30:00", "The Georgia Aquarium")
      earlier = DateTime.parse("2014-06-07 12:30:00")
      expect(dinner.before?(earlier)).to be_falsey
    end

    it "should return true if it's before time being passed" do
      dinner = SchedEvent.new("Dinner", "2014-06-05 22:30:00", "The Georgia Aquarium")
      later = DateTime.parse("2014-06-07 22:30:00")
      expect(dinner.before?(later)).to be_truthy
    end
  end
end