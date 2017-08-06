require 'mini_magick'

class Animations < Struct.new(:gizmo, :sequence)
  VALID_GIZMO_DIR = -> (path) {
    path.directory? && path.basename.to_s != 'builds'
  }

  class << self
    attr_reader :root_path, :gizmos

    def init root_path
      @root_path = root_path

      @gizmos = root_path.children.select(&VALID_GIZMO_DIR).map{|path| Animations::Gizmo.new path}
      @gizmos = Hash[@gizmos.map{|g| [g.name, g]}]
    end

    def on_change paths_list
      # parse changes
      changes = paths_list.map do |path|
        ChangedItem.parse path
      end.compact

      # each gizmo strips its files
      changes.each do |change|
        gizmo = (@gizmos[change.gizmo_name] ||= Animations::Gizmo.new(root_path.join change.gizmo_name))
        gizmo.on_change change
      end

      paths_list - changes.map(&:full_path)
    end

  end

  class ChangedItem

    attr_reader :full_path

    def initialize parts, full_path
      @parts = parts
      @full_path = full_path
    end

    define_method(:gizmo_name){@parts[0]}
    define_method(:file){@parts[1]}

    def self.parse path
      match, *args = path.match(%r~^graphics/animations/([\w\d]+)/([\w\d\.]+)$~)&.to_a
      ChangedItem.new args, match if match
    end
  end

end

class Animations::Gizmo

  attr_reader :name, :dir, :sequences

  def initialize dir_path
    @name = dir_path.basename.to_s
    @dir = dir_path
    @sequences = Hash[Animations::Sequence.init_from_dir(self).map{|s| [s.name, s]}]
  end

  def on_change change

    seq_file = Animations::Sequence.parse_file change.file
    if seq_file
      sequence_name = seq_file[0]
      sequence = @sequences[sequence_name] ||= Animations::Sequence.new(sequence_name, self)
      sequence.dirty = true
    end
  end

end

class Animations::Sequence

  attr_reader :name
  attr_accessor :dirty

  def initialize name, gizmo
    @name = name
    @gizmo = gizmo
    @dirty = true
  end

  def build files=nil
    files = Animations::Sequence.list_files_definitions @gizmo unless files

    frames = files.select{|f| f[0] == @name}.map{|f| f[1].to_i}.sort
    unless frames.empty?

      base_index, length = validate_files_order frames

      frames.map!{|i| MiniMagick::Image.open @gizmo.dir.join("#{@name}_#{'%02d' % i}.png").to_path}
      dimensions = validate_frames_dimensions frames, base_index: base_index

      # blank image
      FileUtils.mkpath @gizmo.dir.join('..', 'builds', 'animations')
      anim_file = @gizmo.dir.join('..', 'builds', 'animations', "#{to_s}.png").to_path
      MiniMagick::Tool::Convert.new do |c|
        c.size "#{length * dimensions[0]}x#{dimensions[1]}"
        c << 'xc:transparent'
        c << anim_file
      end

      # draw on the animation
      animation = MiniMagick::Image.open anim_file
      frames.each_with_index do |frame, i|
        animation = animation.composite frame do |c|
          c.compose "Over"
          c.geometry "+#{i * dimensions[0]}+0"
        end
      end
      animation.write anim_file

    end

    @dirty = false
  end

  def validate_files_order arr
    base_i = arr.first
    arr.each_with_index do |a, i|
      raise Animations::SequenceError.new(self, "bad files order: #{arr.join ','}") unless a == base_i + i
    end

    return base_i, arr.length
  end

  def validate_frames_dimensions frames, base_index: 0
    dimensions = frames.first.dimensions
    frames.each_with_index do |next_frame, i|
      next if i == 0 || next_frame.dimensions == dimensions

      raise Animations::SequenceError.new(self, [
          'frames dimensions mismatch:',
          "base(#{base_index})=#{dimensions.to_s}",
          "frame(#{base_index + i})=#{next_frame.dimensions.to_s}"
      ].join(' '))
    end

    dimensions
  end

  def to_s
    "#{@gizmo.name}-#{@name}"
  end

  def self.list_files_definitions gizmo
    gizmo.dir.children(false).map do |f|
      parse_file f
    end.compact
  end

  def self.init_from_dir gizmo
    list_files_definitions(gizmo).map(&:first).uniq.map do |name|
      new name, gizmo
    end
  end

  def self.parse_file file
    match, *args = file.to_s.match(%r~^([\w\d]+)_(\d\d)\.png$~)&.to_a
    args if match
  end

end

class Animations::SequenceError < StandardError

  attr_reader :sequence

  def initialize sequence, msg
    @sequence = sequence
    super "[#{sequence.to_s}] #{msg}"
  end

end