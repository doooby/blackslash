
require 'sinatra/base'


class BsDevServer < Sinatra::Base

  def self.relative_pathname path
    root = Pathname.new BsDevServer.root
    root.join path
  end

end

require_relative "./environments/#{BsDevServer.environment}"

require_relative './apps/presentation'

BsDevServer.run! if BsDevServer.app_file == $0