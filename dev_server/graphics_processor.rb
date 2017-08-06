require 'listen'
require_relative './lib/animations'

Animations.module_eval do

  def self.try_build asset_name
    match, gizmo, = asset_name.match(%r~^/animations/([\w\d]+).json~)&.to_a
    return unless match

    gizmo = Animations.gizmos[gizmo]
    return unless gizmo
    gizmo.build if gizmo.dirty
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