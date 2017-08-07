require 'listen'
require_relative './lib/animations'

Animations.module_eval do

  def self.try_build asset_name
    match, gizmo, = asset_name.match(%r~^/animations/([\w\d]+).json~)&.to_a
    return unless match

    gizmo = Animations.gizmos[gizmo]
    return unless gizmo&.dirty
    gizmo.build on_error: -> (err) {
      BsDevServer::Helpers.log "ANIMATIONS: #{err}"
    }
  end

  def self.gizmos_state
    Animations.gizmos.values.inject Array.new do |arr, gizmo|
      arr << {gizmo: gizmo.name, dirty: gizmo.dirty} unless gizmo.sequences.empty?
      arr
    end
  end

end

handler = Proc.new do |*changes|
  begin
    list = changes.flatten
    list = Animations.on_change list

  rescue => e
    BsDevServer::GRAPHICS_LISTENER.stop
    BsDevServer::Helpers.log ([
        e.message,
        "(killing file listener)"
    ] + e.backtrace).join("\n")

  end
end

Animations.init BsDevServer.relative_pathname('../graphics/animations')
BsDevServer::GRAPHICS_LISTENER = Listen.to BsDevServer.relative_pathname('../graphics'), relative: true, &handler
BsDevServer::GRAPHICS_LISTENER.start