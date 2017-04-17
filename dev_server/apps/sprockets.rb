require 'sprockets'
require 'sprockets/commoner'

class BsDevServer::Sprockets < Sinatra::Base

  set :environment, Sprockets::Environment.new
  environment.append_path 'blackslash'
  environment.append_path 'node_modules'
  environment.append_path 'assets/images'

  get '/assets/*' do
    env["PATH_INFO"].sub!("/assets", "")
    settings.environment.call(env)
  end

end

BsDevServer.use BsDevServer::Sprockets