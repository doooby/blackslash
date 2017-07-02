
require 'sinatra/base'

class BsDevServer < Sinatra::Base

  def self.relative_pathname *path
    root = Pathname.new BsDevServer.root
    root.join *path
  end

  get '/' do
    erb :container_layout
  end

  get '/assets/*' do
    env["PATH_INFO"].sub!("/assets", "")
    SPROCKETS.call(env)
  end

end

require_relative "./environments/#{BsDevServer.environment}"
require_relative './server_helper'
require_relative './sprockets'