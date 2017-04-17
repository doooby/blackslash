require 'sprockets'

class BsDevServer::Sprockets < Sinatra::Base

  set :environment, Sprockets::Environment.new
  environment.append_path 'blackslash'

  get '/assets/*' do
    env["PATH_INFO"].sub!("/assets", "")
    settings.environment.call(env)
  end

end

BsDevServer.use BsDevServer::Sprockets