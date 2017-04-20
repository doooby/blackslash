require 'sprockets'
require 'sprockets/commoner'
require 'bootstrap'
require 'font-awesome-sass'

class BsDevServer::Sprockets < Sinatra::Base

  set :environment, Sprockets::Environment.new
  environment.append_path 'blackslash'
  environment.append_path 'node_modules'
  environment.append_path 'assets/images'
  environment.append_path 'assets/stylesheets'
  environment.append_path 'assets/javascripts'
  environment.append_path Bootstrap.javascripts_path

  Sprockets::Commoner::Processor.configure(environment,
      # include, exclude, and babel_exclude patterns can be path prefixes or regexes.
      # Explicitly list paths to include. The default is `[env.root]`
      include: [
          environment.root,
          Bootstrap.javascripts_path,
          /node_modules/
      ],
      # List files to ignore and not process require calls or apply any Babel transforms to. Default is ['vendor/bundle'].
      exclude: [],
      # Anything listed in babel_exclude has its require calls resolved, but no transforms listed in .babelrc applied.
      # Default is [/node_modules/]
      # babel_exclude: [/node_modules/]
  )

  environment.context_class.class_eval do
    def asset_path path, options={}
      BsDevServer.asset_path path
    end
  end

  get '/assets/*' do
    env["PATH_INFO"].sub!("/assets", "")
    settings.environment.call(env)
  end

end

BsDevServer.use BsDevServer::Sprockets