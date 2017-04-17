
require 'sinatra/base'


class BsDevServer < Sinatra::Base

  def self.relative_pathname *path
    root = Pathname.new BsDevServer.root
    root.join *path
  end

  def self.asset_path asset_name
    asset = BsDevServer::Sprockets.environment[asset_name].digest_path
    "/assets/#{asset}"
  end

end

require_relative "./environments/#{BsDevServer.environment}"

Dir[BsDevServer.relative_pathname('apps', '*.rb')].
    each{|file| require file }

BsDevServer.run! if BsDevServer.app_file == $0