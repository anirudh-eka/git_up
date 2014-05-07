require 'spec_helper'

feature 'External request' do
  it 'queries session list on naawayday2014.sched.org' do
    uri = URI("http://naawayday2014.sched.org/api/session/list?api_key=6c49777353dec923f2096928d5c6a2bc&format=json")

    response = Net::HTTP.get(uri)

    expect(response).to be_an_instance_of(String)
  end
end