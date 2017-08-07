require 'mini_magick'
require 'json'
require 'base64'

class Animations

  class << self
    attr_reader :root_path, :gizmos

    def init root_path
      @root_path = root_path

      @gizmos = root_path.children.select(&:directory?).map{|path| Animations::Gizmo.new path}
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

    def build_path
      @root_path.join '..', 'build', 'animations'
    end

    def create_blank_image width, height, file_path, power_of_two: true
      FileUtils.mkpath file_path.dirname

      if power_of_two
        width = 2**(width.bit_length)
        height = 2**(height.bit_length)
      end

      MiniMagick::Tool::Convert.new do |c|
        c.size "#{width}x#{height}"
        c << 'xc:transparent'
        c << file_path.to_path
      end
      [width, height]
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

  def dirty
    @sequences.values.any? &:dirty
  end

  def build on_error: nil
    build_data = {name: @name}

    rebuild_sequences! build_data
    raise Animations::GizmoIsEmpty if @sequences.empty?

    if build_data[:error]
      on_error[build_data[:error]] if on_error

    else
      image = create_blank_image build_data[:frame_size]
      draw_each_sequence! build_data, **image
      process_image_data! build_data

    end

    File.write data_path, JSON.generate(build_data)

  rescue Animations::GizmoIsEmpty
    FileUtils.remove data_path, force: true
    Animations.gizmos.delete @name

  end

  def validate_frame_sizes
    first_sequence = @sequences.values.first
    @sequences.values[1..-1].each do |s|
      next if first_sequence.meta[:dimensions] == s.meta[:dimensions]

      raise Animations::SequenceError.new(s, [
          'Incoherent frames dimensions:',
          "#{first_sequence.to_s}=#{first_sequence.meta[:dimensions].to_s}",
          "#{s.to_s}=#{s.meta[:dimensions].to_s}"
      ].join(' '))
    end

    first_sequence.meta[:dimensions]
  end

  def rebuild_sequences! build_data
    files = Animations::Sequence.list_files_definitions self
    @sequences.values.select(&:dirty).each do |sequence|
      sequence.build files
      @sequences.delete sequence.name if sequence.meta[:length] == 0
    end
    return if @sequences.empty?

    build_data[:frame_size] = validate_frame_sizes

  rescue Animations::SequenceError => e
    build_data[:error] = e.message

  end

  def create_blank_image frame_size
    max_frames_count = @sequences.values.map{|s| s.meta[:length]}.max
    dimensions = Animations.create_blank_image frame_size[0] * max_frames_count,
        frame_size[1] * @sequences.values.length, image_path
    {
        dimensions: dimensions,
        image: MiniMagick::Image.open(image_path.to_path)
    }
  end

  def draw_each_sequence! build_data, image:, dimensions:, **_
    image_y = dimensions[1]
    index = 0
    sequences = @sequences.values.reduce Hash.new do |hash, sequence|

      # draw the sequence
      x = 0
      y = image_y - build_data[:frame_size][1]
      image = image.composite MiniMagick::Image.open(sequence.path.to_path) do |c|
        c.compose "Over"
        c.geometry "+#{x}+#{y}"
      end
      image_y = y

      hash[sequence.name] = {
          index: index,
          length: sequence.meta[:length]
      }
      index += 1
      hash
    end

    build_data[:image] = image
    build_data[:sequences] = sequences
  end

  def process_image_data! build_data
    build_data[:image].write image_path.to_path
    build_data[:image_data] = Base64.encode64 build_data[:image].to_blob
    build_data.delete :image
  end

  def image_path
    Animations.build_path.join "#{@name}.png"
  end

  def data_path
    Animations.build_path.join "#{@name}.json"
  end

end

class Animations::Sequence

  attr_reader :name, :meta
  attr_accessor :dirty

  def initialize name, gizmo
    @name = name
    @gizmo = gizmo
    @dirty = true
  end

  def build files=nil
    files = Animations::Sequence.list_files_definitions @gizmo unless files

    @dirty = false
    build_meta_data files

    if @meta[:length] != 0
      file = path

      # blank image
      Animations.create_blank_image @meta[:length] * @meta[:dimensions][0], @meta[:dimensions][1],
          file, power_of_two: false
      animation = MiniMagick::Image.open file.to_path

      # draw on the animation
      animation = draw_onto animation, 0, 0
      animation.write file.to_path

    end

    @meta.delete :images
  end

  def path
    Animations.build_path.join ".#{to_s}.png"
  end

  def build_meta_data files
    @meta = {length: 0}

    frames = files.select{|f| f[0] == @name}.map{|f| f[1].to_i}.sort
    return if frames.empty?

    base_index, length = validate_files_order frames
    images = frames.map{|frame_i| open_image frame_i}
    dimensions = validate_frames_dimensions images, base_index: base_index
    @meta = {
        dimensions: dimensions,
        length: length,
        frames: frames,
        images: images
    }
  end

  def open_image frame_i
    MiniMagick::Image.open @gizmo.dir.join("#{@name}_#{'%02d' % frame_i}.png").to_path
  end

  def draw_onto image, x, y
    @meta[:images].each_with_index do |frame, i|
      image = image.composite frame do |c|
        c.compose "Over"
        c.geometry "+#{x + i*@meta[:dimensions][0]}+#{y}"
      end
    end
    image
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

class Animations::GizmoIsEmpty < StandardError; end