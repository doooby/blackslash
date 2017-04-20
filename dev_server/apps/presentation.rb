class BsDevServer::Presentation < Sinatra::Base

  get '/' do
    %Q{
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BlackSlash</title>
    <link rel="stylesheet" href="#{ BsDevServer.asset_path 'utils.css' }">
    <script src="#{ BsDevServer.asset_path 'utils.js' }"></script>
  </head>

  <body>
    <div class="container"></div>
    <script src="#{ BsDevServer.asset_path 'entry_point.js' }"></script>
  </body>
</html>
    }
  end

end

BsDevServer.use BsDevServer::Presentation