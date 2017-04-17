require 'byebug'
require 'sinatra/reloader'

BsDevServer.instance_exec do

  register Sinatra::Reloader
  # also_reload relative_pathname('').to_path

end