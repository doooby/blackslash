
require 'sinatra/base'
require 'byebug'
# require 'sinatra/reloader'

class BsDevServer < Sinatra::Base

  # register Sinatra::Reloader
  # also_reload relative_pathname('').to_path

  def self.relative_pathname *path
    root = Pathname.new BsDevServer.root
    root.join *path
  end

  get '/' do
    erb :container_layout
  end

  get '/assets/*' do
    env["PATH_INFO"].sub!("/assets", "")
    Animations.try_build env["PATH_INFO"]
    SPROCKETS.call env
  end

  module Helpers

    def self.asset_path asset_name
      "/assets/#{asset_name}"
    end

  end

end

require_relative './sprockets'
require_relative './graphics_processor'