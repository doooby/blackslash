#!/usr/bin/env ruby
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../Gemfile', __FILE__)
require 'bundler/setup'
require 'pathname'

require_relative '../dev_server/lib/animations'
Animations.init Pathname.new(File.expand_path '../../graphics/animations', __FILE__)
Animations.gizmos.values.each do |gizmo|
  files = Animations::Sequence.list_files_definitions gizmo
  gizmo.sequences.values.each{|s| s.build files}
end