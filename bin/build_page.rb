#!/usr/bin/env ruby

require 'fileutils'
require 'pathname'
require 'erb'

ROOT = Pathname.new File.expand_path('../..', __FILE__)
ENV['BUNDLE_GEMFILE'] ||= ROOT.join('Gemfile').to_path
require 'bundler/setup'

require 'byebug'

build_path = ROOT.join 'build', 'animation_visualisation'
FileUtils.mkdir_p build_path

module ServerHelper
  def self.asset_path asset_name
    SPROCKETS[asset_name].logical_path
  end
end

require_relative '../dev_server/sprockets'
[
    'utils.css',
    'font-awesome/fontawesome-webfont.eot',
    'font-awesome/fontawesome-webfont.woff',
    'font-awesome/fontawesome-webfont.woff2',
    'font-awesome/fontawesome-webfont.ttf',
    'utils.js',
    'entry_point.js'
].each do |asset_name|
  file_path = build_path.join ServerHelper.asset_path(asset_name)
  FileUtils.mkdir_p File.dirname(file_path)
  File.write file_path, SPROCKETS[asset_name].to_s
end

template =  ROOT.join('dev_server', 'views', 'container_layout.html.erb').to_path
html = ERB.new(File.read template).result
File.write build_path.join('page.html').to_path, html
