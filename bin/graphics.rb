#!/usr/bin/env ruby
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../Gemfile', __FILE__)
require 'bundler/setup'
require 'pathname'
require 'byebug'

require_relative '../dev_server/lib/animations'
Animations.init Pathname.new(File.expand_path '../../graphics/animations', __FILE__)
Animations.gizmos.values.each &:build