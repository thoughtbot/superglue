class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  def self.member_at(index)
    offset(index).limit(1)
  end

  def self.member_by(attr, value)
    find_by(Hash[attr, val])
  end
end
