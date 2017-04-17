class BsDevServer::Presentation < Sinatra::Base

  get '/' do
    "try harder!"
  end

end

BsDevServer.use BsDevServer::Presentation