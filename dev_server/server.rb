
require 'sinatra/base'
require 'sinatra/json'
# require 'sinatra/reloader'
require 'byebug'

class BsDevServer < Sinatra::Base

  # register Sinatra::Reloader
  # also_reload relative_pathname('').to_path

  def self.relative_pathname *path
    root = Pathname.new BsDevServer.root
    root.join *path
  end

  get '/' do
    BsDevServer::Helpers.log "REQUEST / with params: #{params.to_s}"
    erb :container_layout
  end

  get '/assets/*' do
    env['PATH_INFO'].sub! '/assets', ''
    BsDevServer::Helpers.log "REQUEST /assets #{env['PATH_INFO']}"
    Animations.try_build env['PATH_INFO']
    SPROCKETS.call env
  end

  get '/graphics_state.json' do
    json({
      animations: Animations.gizmos_state
    })
  end

  module Helpers

    def self.asset_path asset_name
      "/assets/#{asset_name}"
    end

    def self.log text
      puts "#{Time.now.strftime '%H:%M:%S'} #{text}"
    end

  end

end

require_relative './sprockets'
require_relative './graphics_processor'