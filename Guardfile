
guard 'shell' do
  watch(%r/src\/*.js/) {|m|
    p "running npm test..."
    `npm test`
  }
end
