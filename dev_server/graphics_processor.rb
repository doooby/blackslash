require 'listen'
require_relative './lib/animations'

Animations.module_eval do

  def self.try_build_as_gizmo_sequence asset_name
    match, gizmo, sequence = asset_name.match(%r~^/animations/([\w\d]+)-([\w\d]+).png$~)&.to_a
    return unless match

    sequence = Animations.gizmos[gizmo]&.sequences[sequence]
    sequence.build if sequence
  end

end

handler = Proc.new do |*changes|
  begin
    list = changes.flatten
    list = Animations.on_change list

  rescue => e
    puts e.message
    puts e.backtrace
    BsDevServer::GRAPHICS_LISTENER.stop

  end
end

Animations.init BsDevServer.relative_pathname('../graphics/animations')
BsDevServer::GRAPHICS_LISTENER = Listen.to BsDevServer.relative_pathname('../graphics'), relative: true, &handler
BsDevServer::GRAPHICS_LISTENER.start