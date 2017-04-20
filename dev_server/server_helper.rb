
module ServerHelper

  def self.asset_path asset_name
    asset = SPROCKETS[asset_name].digest_path
    "/assets/#{asset}"
  end

end