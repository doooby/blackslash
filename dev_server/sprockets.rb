require 'sprockets'
require 'sprockets/commoner'
require 'bootstrap'
require 'font-awesome-sass'

SPROCKETS = Sprockets::Environment.new
SPROCKETS.append_path 'blackslash'
SPROCKETS.append_path 'node_modules'
SPROCKETS.append_path 'assets/images'
SPROCKETS.append_path 'docs/raw'
SPROCKETS.append_path 'assets/stylesheets'
SPROCKETS.append_path 'assets/javascripts'
SPROCKETS.append_path Bootstrap.javascripts_path
SPROCKETS.append_path 'graphics/build'

Sprockets::Commoner::Processor.configure(SPROCKETS,
    # include, exclude, and babel_exclude patterns can be path prefixes or regexes.
    # Explicitly list paths to include. The default is `[env.root]`
    include: [
        SPROCKETS.root,
        Bootstrap.javascripts_path,
        /node_modules/
    ],
    # List files to ignore and not process require calls or apply any Babel transforms to. Default is ['vendor/bundle'].
    exclude: [],
# Anything listed in babel_exclude has its require calls resolved, but no transforms listed in .babelrc applied.
# Default is [/node_modules/]
# babel_exclude: [/node_modules/]
)

SPROCKETS.context_class.class_eval do
  def asset_path path, options={}
    BsDevServer::Helpers.asset_path path
  end
end
